import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createElevationLayer } from '../utils/elevationLayer';
import {
  pointInGaza, fetchElevation, GAZA_POLYGON, GAZA_CENTER, GAZA_BOUNDS,
} from '../utils/geoUtils';
import { useLang } from '../context/LangContext';
import Legend from './Legend';
import Hero from './Hero';
import './ElevationMap.css';

function createGazaMask(L_ref) {
  const world = [[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]];
  const gazaHole = GAZA_POLYGON.map(([lat, lng]) => [lat, lng]);
  return L_ref.polygon([world, gazaHole], {
    fillColor: '#e8e8e8', fillOpacity: 0.85, stroke: false, interactive: false,
  });
}

function createGazaBorder(L_ref) {
  return L_ref.polyline(
    GAZA_POLYGON.map(([lat, lng]) => [lat, lng]),
    { color: '#555', weight: 2.5, opacity: 0.7, interactive: false }
  );
}

export default function ElevationMap() {
  const { t, toggleLang } = useLang();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const elevLayerRef = useRef(null);

  const [elevation, setElevation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);
  const [showElevLayer, setShowElevLayer] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const fetchAndDisplayElevation = useCallback(async (lat, lng, doPan = false) => {
    if (!pointInGaza(lat, lng)) {
      setError(t.outsideGaza);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setClickCoords({ lat, lng });
    setLoading(true);
    setError(null);
    setElevation(null);

    const map = mapInstance.current;
    if (doPan) map.setView([lat, lng], 14, { animate: true });

    if (markerRef.current) map.removeLayer(markerRef.current);
    const icon = L.divIcon({
      className: 'elev-marker',
      html: '<div class="elev-marker-dot"></div>',
      iconSize: [18, 18], iconAnchor: [9, 18],
    });
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    markerRef.current = marker;

    try {
      const elev = await fetchElevation(lat, lng);
      setElevation(elev);
      setLoading(false);
      marker.bindPopup(
        `<div class="elev-popup"><span class="elev-popup-value">${Math.round(elev)} ${t.meter}</span><button class="elev-popup-close" onclick="this.closest('.leaflet-popup').remove()">✕</button></div>`,
        { closeButton: false, className: 'elev-popup-wrapper', offset: [0, -12] }
      ).openPopup();
    } catch {
      setError(t.fetchError);
      setLoading(false);
    }
  }, [t]);

  const handleMapClick = useCallback((e) => {
    fetchAndDisplayElevation(e.latlng.lat, e.latlng.lng, false);
  }, [fetchAndDisplayElevation]);

  const handleSearchSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    
    // Parse coordinates like "31.42, 34.38" or "31.42 34.38"
    const regex = /[-+]?([0-9]*\.[0-9]+|[0-9]+)[,\s]+[-+]?([0-9]*\.[0-9]+|[0-9]+)/;
    const match = clean.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      fetchAndDisplayElevation(lat, lng, true);
      return;
    }

    // If not coordinates, try place name search via OpenStreetMap Nominatim
    setLoading(true);
    try {
      // Append Gaza to restrict/bias search towards the region
      const query = encodeURIComponent(clean + ' Gaza');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        fetchAndDisplayElevation(lat, lng, true);
      } else {
        setError(t.invalidCoords || 'Not found');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError(t.fetchError);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [searchInput, fetchAndDisplayElevation, t]);

  useEffect(() => {
    if (mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: GAZA_CENTER, zoom: 11, zoomControl: false, attributionControl: false,
      maxBounds: [
        [GAZA_BOUNDS.minLat - 0.12, GAZA_BOUNDS.minLng - 0.12],
        [GAZA_BOUNDS.maxLat + 0.12, GAZA_BOUNDS.maxLng + 0.12],
      ],
      minZoom: 10, maxZoom: 16,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    const elevLayer = createElevationLayer(L, 0.6);
    elevLayer.addTo(map);
    elevLayerRef.current = elevLayer;
    createGazaMask(L).addTo(map);
    createGazaBorder(L).addTo(map);
    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false, metric: true }).addTo(map);
    mapInstance.current = map;

    // Check url for shared coordinates
    const params = new URLSearchParams(window.location.search);
    const plat = params.get('lat');
    const plng = params.get('lng');
    if (plat && plng) {
      const lat = parseFloat(plat);
      const lng = parseFloat(plng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setTimeout(() => fetchAndDisplayElevation(lat, lng, true), 500);
      }
    }

    return () => { map.remove(); mapInstance.current = null; };
  }, [fetchAndDisplayElevation]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [handleMapClick]);

  const toggleElevLayer = useCallback(() => {
    const map = mapInstance.current; const layer = elevLayerRef.current;
    if (!map || !layer) return;
    if (showElevLayer) map.removeLayer(layer); else map.addLayer(layer);
    setShowElevLayer((v) => !v);
  }, [showElevLayer]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  return (
    <div className="page-scroll">
      {/* ── HEADER ── */}
      <header className="page-header" id="header">
        <div className="header-main">
          <div className="header-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>{t.title}</h1>
            <p>{t.subtitle}
              {elevation !== null && <span className="header-result"> — {Math.round(elevation)} {t.meter}</span>}
            </p>
          </div>
        </div>
        <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language" id="lang-toggle">
          {t.langToggle}
        </button>
      </header>

      {/* ── HERO SECTION ── */}
      <Hero />

      {/* ── MAP SECTION ── */}
      <section className="map-section" aria-label="Elevation Map" id="map-section-wrapper">
        <div className="map-card">
          <div className="map-inner">
            <div ref={mapRef} className="map-view" id="map" />

            {/* ── SEARCH OVERLAY ── */}
            <div className="map-search-overlay">
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  className="search-input" 
                  value={searchInput} 
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  dir="ltr"
                />
                <button type="submit" className="search-submit" title={t.searchBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>

            {/* Toolbars – positioned to not overlap legend */}
            <div className="tool-col tool-col-start">
              <button className="tool-btn" title={t.fullscreen} onClick={toggleFullscreen} id="btn-fullscreen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                </svg>
              </button>
              <button className="tool-btn" title={t.share} onClick={() => {
                if (clickCoords) navigator.clipboard?.writeText(`${location.origin}?lat=${clickCoords.lat.toFixed(5)}&lng=${clickCoords.lng.toFixed(5)}`);
              }} id="btn-share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>

            <div className="tool-col tool-col-end-top">
              <button className={`tool-btn ${showElevLayer ? 'active' : ''}`} title={t.elevLayer} onClick={toggleElevLayer} id="btn-layers">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
              </button>
            </div>

            {/* Legend – below the layer toggle */}
            <Legend />

            {loading && <div className="map-loading"><div className="map-spinner"/><span>{t.loading}</span></div>}
            {error && <div className="map-toast" role="alert">{error}</div>}
          </div>
        </div>
      </section>

      {/* ── DEVELOPER FOOTER ── */}
      <footer className="dev-footer" id="developer">
        <div className="dev-footer-inner">
          <div className="dev-info">
            <span className="dev-label">{t.developer}</span>
            <a href="https://www.linkedin.com/in/anasalashqar06/" target="_blank" rel="noreferrer" className="dev-name">
              {t.devName}
            </a>
          </div>
          <div className="dev-socials">
            <a href="https://www.linkedin.com/in/anasalashqar06/" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn" aria-label="LinkedIn Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
        <p className="dev-copyright">© {new Date().getFullYear()} {t.devName}</p>
      </footer>
    </div>
  );
}
