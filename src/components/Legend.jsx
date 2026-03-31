import { elevToColor } from '../utils/elevationLayer';
import './Legend.css';

const LEGEND_STEPS = [150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5, 0];

export default function Legend() {
  return (
    <div className="legend" aria-label="Elevation color scale">
      {LEGEND_STEPS.map((elev) => {
        const [r, g, b] = elevToColor(elev);
        return (
          <div
            key={elev}
            className="legend-item"
            style={{ backgroundColor: `rgb(${r},${g},${b})` }}
          >
            <span className="legend-label">{elev} م</span>
          </div>
        );
      })}
    </div>
  );
}
