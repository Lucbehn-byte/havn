import React, { useState } from 'react';
import { LineChart } from 'lucide-react';

export default function PriceChart({ history = [], ticker = '' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
        Keine historischen Chartdaten verfügbar.
      </div>
    );
  }

  const closes = history.map(d => d.close);
  const minVal = Math.min(...closes) * 0.96;
  const maxVal = Math.max(...closes) * 1.04;
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 300;
  const padding = 35;

  const getX = (index) => padding + (index / (history.length - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

  // Preispfad
  const pricePath = history.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`).join(' ');

  // Area unter dem Preispfad
  const areaPath = `${pricePath} L ${getX(history.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

  // GD50 Pfad
  const validMa50 = history.filter(d => d.ma50 != null);
  const ma50Path = history.map((d, i) => d.ma50 != null ? `${i === history.findIndex(h => h.ma50 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma50)}` : '').filter(Boolean).join(' ');

  // GD200 Pfad
  const ma200Path = history.map((d, i) => d.ma200 != null ? `${i === history.findIndex(h => h.ma200 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma200)}` : '').filter(Boolean).join(' ');

  return (
    <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-sky-400" />
            <span>Realer Kursverlauf & Trendlinien</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono">Letzte 1,5 Jahre</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover über den Chart für tagesaktuelle Kurse und gleitende Durchschnitte.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-sky-400 font-medium">
            <span className="w-3 h-0.5 bg-sky-400 rounded-full inline-block"></span> Kurs ({ticker})
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block"></span> GD50
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <span className="w-3 h-0.5 border-t border-dashed border-indigo-400 rounded-full inline-block"></span> GD200
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[8/3] max-h-[350px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontale Gitterlinien */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - padding - ratio * (height - 2 * padding);
            const val = minVal + ratio * range;
            return (
              <g key={ratio}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padding - 8} y={y + 3} textAnchor="end" fill="#64748B" fontSize="10" className="font-mono">
                  {val.toFixed(1)}€
                </text>
              </g>
            );
          })}

          {/* Gradient-Fläche */}
          <path d={areaPath} fill="url(#priceGradient)" />

          {/* GD200 (Indigo) */}
          {ma200Path && (
            <path d={ma200Path} fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 4" />
          )}

          {/* GD50 (Gelb) */}
          {ma50Path && (
            <path d={ma50Path} fill="none" stroke="#FACC15" strokeWidth="1.5" />
          )}

          {/* Kurslinie (Cyan) */}
          <path d={pricePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interaktive Hover-Punkte */}
          {history.map((d, i) => (
            <rect
              key={i}
              x={getX(i) - (width / history.length) / 2}
              y={0}
              width={width / history.length}
              height={height}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredPoint({ ...d, x: getX(i), y: getY(d.close) })}
            />
          ))}

          {/* Aktiver Hover-Faden */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padding}
                x2={hoveredPoint.x}
                y2={height - padding}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Hover-Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 10}%`,
            }}
          >
            <div className="text-slate-400 font-mono text-[10px]">{hoveredPoint.date}</div>
            <div className="font-bold text-sky-400 text-sm">{hoveredPoint.close.toFixed(2)} €</div>
            {hoveredPoint.ma50 && (
              <div className="text-amber-400 text-[11px]">GD50: {hoveredPoint.ma50.toFixed(2)} €</div>
            )}
            {hoveredPoint.ma200 && (
              <div className="text-indigo-400 text-[11px]">GD200: {hoveredPoint.ma200.toFixed(2)} €</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
