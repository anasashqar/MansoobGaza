/* ── Gaza tile elevation color layer ── */

// Color ramp: elevation (meters) → [R, G, B]
// Designed for Gaza Strip range (~0–150 m)
const COLOR_RAMP = [
  { elev: -100, color: [5,   5,   100] },   // deep water
  { elev: 0,    color: [30,  140, 255] },   // sea level – blue
  { elev: 15,   color: [0,   220, 220] },   // cyan
  { elev: 30,   color: [0,   200, 80]  },   // green
  { elev: 50,   color: [120, 230, 0]  },    // yellow-green
  { elev: 70,   color: [230, 230, 0]  },    // yellow
  { elev: 90,   color: [255, 160, 0]  },    // orange
  { elev: 110,  color: [255, 60,  0]  },    // orange-red
  { elev: 130,  color: [200, 0,   0]  },    // red
  { elev: 160,  color: [255, 255, 255]},    // white peak
];

export function elevToColor(elev) {
  if (elev <= COLOR_RAMP[0].elev) return COLOR_RAMP[0].color;
  if (elev >= COLOR_RAMP[COLOR_RAMP.length - 1].elev)
    return COLOR_RAMP[COLOR_RAMP.length - 1].color;

  for (let i = 1; i < COLOR_RAMP.length; i++) {
    if (elev <= COLOR_RAMP[i].elev) {
      const lo = COLOR_RAMP[i - 1];
      const hi = COLOR_RAMP[i];
      const t  = (elev - lo.elev) / (hi.elev - lo.elev);
      return [
        Math.round(lo.color[0] + t * (hi.color[0] - lo.color[0])),
        Math.round(lo.color[1] + t * (hi.color[1] - lo.color[1])),
        Math.round(lo.color[2] + t * (hi.color[2] - lo.color[2])),
      ];
    }
  }
  return COLOR_RAMP[COLOR_RAMP.length - 1].color;
}

export { COLOR_RAMP };

// ── Custom Leaflet GridLayer that decodes terrarium tiles ──
export function createElevationLayer(L, opacity = 0.65) {
  const ElevLayer = L.GridLayer.extend({
    createTile(coords, done) {
      const canvas = document.createElement('canvas');
      const size   = this.getTileSize();
      canvas.width  = size.x;
      canvas.height = size.y;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Mapzen/Nextzen terrarium tiles (free, no key)
      img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${coords.z}/${coords.x}/${coords.y}.png`;

      img.onload = () => {
        try {
          const offscreen = document.createElement('canvas');
          offscreen.width  = size.x;
          offscreen.height = size.y;
          const octx = offscreen.getContext('2d');
          octx.drawImage(img, 0, 0);
          const raw = octx.getImageData(0, 0, size.x, size.y);

          const ctx  = canvas.getContext('2d');
          const out  = ctx.createImageData(size.x, size.y);

          for (let i = 0; i < raw.data.length; i += 4) {
            const r = raw.data[i];
            const g = raw.data[i + 1];
            const b = raw.data[i + 2];
            // Terrarium decoding
            const elev = (r * 256 + g + b / 256) - 32768;
            const col  = elevToColor(elev);
            out.data[i]     = col[0];
            out.data[i + 1] = col[1];
            out.data[i + 2] = col[2];
            out.data[i + 3] = elev < -10 ? 0 : 210; // transparent for ocean
          }

          ctx.putImageData(out, 0, 0);
          done(null, canvas);
        } catch (e) {
          done(e, canvas);
        }
      };

      img.onerror = () => done(null, canvas);

      return canvas;
    },
  });

  return new ElevLayer({ tileSize: 256, opacity, zIndex: 5 });
}
