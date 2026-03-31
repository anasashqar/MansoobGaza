const proj4 = require('proj4');
const fs = require('fs');

// EPSG:28193 - Palestine 1923 / Israeli CS Grid (Old Israeli Grid)
// This matches coordinates with E: ~75K-108K, N: ~70K-112K for Gaza
proj4.defs('EPSG:28193', '+proj=cass +lat_0=31.73409694444445 +lon_0=35.21208055555556 +x_0=170251.555 +y_0=126867.909 +a=6378300.789 +b=6356566.435 +towgs84=-275.7224,94.7824,340.8944,-8.001,-4.42,-11.821,1 +units=m +no_defs');

// Read the GeoJSON
const raw = JSON.parse(fs.readFileSync('c:\\Users\\sa\\Downloads\\gazaarea.json', 'utf8'));
const coords = raw.geometries[0].coordinates[0]; // [[easting, northing], ...]

console.log('Total input points:', coords.length);
console.log('Sample input (first 3):', coords.slice(0, 3));

// Convert all points from Old Israeli Grid to WGS84
const wgs84Coords = coords.map(([e, n]) => {
  const [lng, lat] = proj4('EPSG:28193', 'WGS84', [e, n]);
  return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
});

console.log('Sample output (first 3):', wgs84Coords.slice(0, 3));

// Check the range
const lats = wgs84Coords.map(p => p[0]);
const lngs = wgs84Coords.map(p => p[1]);
console.log('Lat range:', Math.min(...lats).toFixed(4), '-', Math.max(...lats).toFixed(4));
console.log('Lng range:', Math.min(...lngs).toFixed(4), '-', Math.max(...lngs).toFixed(4));

// Simplify: keep every Nth point
const STEP = 4;
const simplified = wgs84Coords.filter((_, i) => i % STEP === 0);
// Close the polygon
if (simplified[simplified.length - 1][0] !== simplified[0][0] ||
    simplified[simplified.length - 1][1] !== simplified[0][1]) {
  simplified.push(simplified[0]);
}

console.log(`Simplified: ${simplified.length} points (every ${STEP}th)`);

// Write output file
const output = 
`// Auto-generated from gazaarea.json using proj4 (EPSG:28193 → WGS84)
// ${simplified.length} points (simplified from ${wgs84Coords.length})
// Format: [latitude, longitude]

export const GAZA_POLYGON = [
${simplified.map(p => `  [${p[0]}, ${p[1]}]`).join(',\n')}
];
`;

fs.writeFileSync(
  'c:\\Users\\sa\\Desktop\\MansoobGaza\\gaza-app\\src\\utils\\gazaBoundary.js',
  output
);

console.log('\n✅ Saved to src/utils/gazaBoundary.js');
