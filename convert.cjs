// Convert Israel Transverse Mercator (ITM) coordinates to WGS84 (lat/lng)
// Based on the Israeli New Grid (EPSG:2039) parameters
const fs = require('fs');

// ITM to WGS84 conversion constants
const a = 6378137.0;  // WGS84 semi-major axis
const f = 1 / 298.257223563;
const e2 = 2 * f - f * f;
const e = Math.sqrt(e2);
const e_prime2 = e2 / (1 - e2);

// ITM projection parameters
const lon0 = 35.2045169444444 * Math.PI / 180;  // Central meridian
const lat0 = 31.7343936111111 * Math.PI / 180;  // Latitude of origin
const k0 = 1.0000067;  // Scale factor
const FE = 219529.584;  // False easting
const FN = 626907.39;   // False northing

function itmToWgs84(easting, northing) {
  const x = easting - FE;
  const y = northing - FN;

  // Compute footprint latitude
  const M0 = computeM(lat0);
  const M = M0 + y / k0;

  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const phi1 = mu + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu)
    + (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu)
    + (151*e1*e1*e1/96) * Math.sin(6*mu)
    + (1097*e1*e1*e1*e1/512) * Math.sin(8*mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = e_prime2 * Math.cos(phi1) * Math.cos(phi1);
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = x / (N1 * k0);

  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
    D*D/2
    - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e_prime2) * D*D*D*D/24
    + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*e_prime2 - 3*C1*C1) * D*D*D*D*D*D/720
  );

  const lon = lon0 + (
    D
    - (1 + 2*T1 + C1) * D*D*D/6
    + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e_prime2 + 24*T1*T1) * D*D*D*D*D/120
  ) / Math.cos(phi1);

  return [lat * 180 / Math.PI, lon * 180 / Math.PI];
}

function computeM(phi) {
  return a * (
    (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256) * phi
    - (3*e2/8 + 3*e2*e2/32 + 45*e2*e2*e2/1024) * Math.sin(2*phi)
    + (15*e2*e2/256 + 45*e2*e2*e2/1024) * Math.sin(4*phi)
    - (35*e2*e2*e2/3072) * Math.sin(6*phi)
  );
}

// Read the GeoJSON
const raw = JSON.parse(fs.readFileSync('c:\\Users\\sa\\Downloads\\gazaarea.json', 'utf8'));
const coords = raw.geometries[0].coordinates[0]; // [[easting, northing], ...]

// Convert all points
const wgs84Coords = coords.map(([e, n]) => {
  const [lat, lng] = itmToWgs84(e, n);
  return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
});

// Simplify: keep every Nth point to reduce size
const SIMPLIFY_STEP = 5;
const simplified = wgs84Coords.filter((_, i) => i % SIMPLIFY_STEP === 0);
// Make sure the last point matches the first
if (simplified[simplified.length - 1][0] !== simplified[0][0] ||
    simplified[simplified.length - 1][1] !== simplified[0][1]) {
  simplified.push(simplified[0]);
}

console.log(`Original: ${wgs84Coords.length} points`);
console.log(`Simplified (every ${SIMPLIFY_STEP}th): ${simplified.length} points`);
console.log('\n// Paste this into gazaBoundary.js:\n');
console.log('export const GAZA_POLYGON = [');
simplified.forEach((p, i) => {
  const comma = i < simplified.length - 1 ? ',' : '';
  console.log(`  [${p[0]}, ${p[1]}]${comma}`);
});
console.log('];');

// Also output full for accuracy
fs.writeFileSync(
  'c:\\Users\\sa\\Desktop\\MansoobGaza\\gaza-app\\src\\utils\\gazaBoundary.js',
  `// Auto-generated from gazaarea.json – ${simplified.length} points (simplified)\n` +
  `// Coordinate system: WGS84 [lat, lng]\n\n` +
  `export const GAZA_POLYGON = [\n` +
  simplified.map((p, i) => `  [${p[0]}, ${p[1]}]`).join(',\n') +
  `\n];\n`
);

console.log('\n✅ Saved to src/utils/gazaBoundary.js');
