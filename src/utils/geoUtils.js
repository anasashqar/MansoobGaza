// ── Gaza Strip geographic utilities ──
import { GAZA_POLYGON } from './gazaBoundary';

// Bounding box computed from the real polygon
export const GAZA_BOUNDS = {
  minLat: 31.22,
  maxLat: 31.60,
  minLng: 34.21,
  maxLng: 34.57,
};

export const GAZA_CENTER = [31.42, 34.38];

// Re-export polygon
export { GAZA_POLYGON };

/** Ray-casting point-in-polygon */
export function pointInGaza(lat, lng) {
  // Quick bounding box check
  if (
    lat < GAZA_BOUNDS.minLat || lat > GAZA_BOUNDS.maxLat ||
    lng < GAZA_BOUNDS.minLng || lng > GAZA_BOUNDS.maxLng
  ) return false;

  // Precise polygon check
  let inside = false;
  const poly = GAZA_POLYGON;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect =
      ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Fetch elevation via opentopodata SRTM 30m.
 * Fallback: open-elevation.com
 */
export async function fetchElevation(lat, lng) {
  try {
    const res = await fetch(
      `https://api.opentopodata.org/v1/srtm30m?locations=${lat},${lng}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.elevation != null) {
        return data.results[0].elevation;
      }
    }
  } catch {
    // fallthrough
  }

  const res2 = await fetch(
    `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
  );
  if (!res2.ok) throw new Error('تعذّر الحصول على بيانات الارتفاع');
  const data2 = await res2.json();
  return data2.results[0].elevation;
}
