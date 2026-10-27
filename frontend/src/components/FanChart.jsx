import React from 'react';
import { GitBranch, TrendingUp, Download } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function FanChart({ paths = [], medianPath = [], ticker = 'Asset' }) {
  if (!paths || paths.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center glass-inset rounded-xl text-slate-500">
        Keine Simulationspfade verfügbar.
      </div>
    );
  }

  const exportCSV = () => {
    try {
      const rows = [];
      const steps = medianPath.length;
      const header = ['Schritt (Monat)', 'Median-Pfad (€)', ...paths.slice(0, 10).map((_, i) => `Stichprobe_${i + 1} (€)`)];
      rows.push(header.join(';'));

      for (let s = 0; s < steps; s++) {
        const row = [
          s + 1,
          medianPath[s] ? medianPath[s].toFixed(2) : '',
          ...paths.slice(0, 10).map(p => (p[s] ? p[s].toFixed(2) : ''))
        ];
        rows.push(row.join(';'));
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `havn_monte_carlo_${ticker}_pfade.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Fehler beim CSV-Export:', e);
    }
  };

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
            <span>Simulationsfächer</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-semibold">
              5.000 Pfade
            </span>
            <InfoTooltip
              title="Merton Jump-Diffusion Simulation"
              text="Generiert 5.000 Zukunfts-Szenarien anhand von Kursschwankungen und Poisson-Sprungprozessen, um plötzliche Crashs und Kurssprünge realistisch abzubilden."
              rule="Die gelbe Linie markiert den Median: 50 % aller Szenarien lagen darüber, 50 % darunter."
            />
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Blaue Fächerlinien = Stichproben möglicher Kursverläufe • Gelbe Linie = statistischer Erwartungswert
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Simulationspfade als CSV-Tabelle exportieren"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>CSV Export</span>
          </button>
          <div className="hidden sm:flex items-center gap-4 text-xs pl-2 border-l border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-sky-500/40 rounded-full inline-block"></span> 40 Stichproben
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block"></span> Median
            </span>
          </div>
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
