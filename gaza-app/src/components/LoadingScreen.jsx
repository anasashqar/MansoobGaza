import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const { t } = useLang();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        const step = prev < 30 ? 4 : prev < 70 ? 2 : prev < 90 ? 3 : 5;
        return Math.min(prev + step, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) setTimeout(() => setFadeOut(true), 300);
  }, [progress]);

  const statusText =
    progress < 30 ? t.loadMap :
    progress < 60 ? t.loadElev :
    progress < 90 ? t.loadBorder : t.ready;

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-bg">
        <div className="topo-line topo-1" />
        <div className="topo-line topo-2" />
        <div className="topo-line topo-3" />
        <div className="topo-line topo-4" />
        <div className="topo-line topo-5" />
      </div>

      <div className="loading-content">
        <div className="loading-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <div className="loading-ping" />
        </div>

        <h1 className="loading-title">{t.title}</h1>
        <p className="loading-subtitle">Gaza Strip Elevation Map</p>

        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="loading-info">
          <span className="loading-percent">{progress}%</span>
          <span className="loading-status">{statusText}</span>
        </div>
      </div>

      <div className="loading-footer">
        <span>{t.developer}: {t.devName}</span>
      </div>
    </div>
  );
}
