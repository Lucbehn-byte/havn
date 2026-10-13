import React from 'react';
import { GitBranch, TrendingUp } from 'lucide-react';

export default function FanChart({ paths = [], medianPath = [] }) {
  if (!paths || paths.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
        Keine Simulationspfade verfügbar.
      </div>
    );
  }

  // Flaches Array aller Kurswerte zur Bestimmung von Min und Max
  const allValues = [...paths.flat(), ...medianPath];
  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = maxVal - minVal || 1;

  const numSteps = medianPath.length || (paths[0] ? paths[0].length : 1);
  const width = 800;
  const height = 280;
  const padding = 35;

  const getX = (idx) => padding + (idx / (numSteps - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

  const medianSvgPath = medianPath.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`).join(' ');

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Stochastischer Simulationsfächer</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">5.000 Pfade (Merton Jump-Diffusion)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Graublaue Fächerpfade = mögliche Zukunftsszenarien inkl. Crash-Schocks. Gelbe Linie = Median-Erwartung.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 bg-sky-500/40 rounded-full inline-block"></span> 40 Stichprobenpfade
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block"></span> Erwarteter Median
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[8/3] max-h-[320px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Horizontale Gitterlinien */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
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

          {/* Fächerpfade (teiltransparent) */}
          {paths.map((p, idx) => {
            const pPath = p.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`).join(' ');
            return (
              <path
                key={idx}
                d={pPath}
                fill="none"
                stroke="rgba(56, 189, 248, 0.18)"
                strokeWidth="1"
              />
            );
          })}

          {/* Medianpfad (leuchtend gelb) */}
          {medianPath.length > 0 && (
            <path
              d={medianSvgPath}
              fill="none"
              stroke="#FACC15"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Startpunkt Markierung */}
          {medianPath.length > 0 && (
            <circle
              cx={getX(0)}
              cy={getY(medianPath[0])}
              r="4"
              fill="#FACC15"
              stroke="#0F172A"
              strokeWidth="2"
            />
          )}
          {/* Endpunkt Median Markierung */}
          {medianPath.length > 0 && (
            <circle
              cx={getX(medianPath.length - 1)}
              cy={getY(medianPath[medianPath.length - 1])}
              r="5"
              fill="#FACC15"
              stroke="#0F172A"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
