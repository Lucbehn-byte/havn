import React, { useMemo, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const RANGES = [
  { id: '1M', label: '1 Monat', days: 22 },
  { id: '6M', label: '6 Monate', days: 126 },
  { id: '1J', label: '1 Jahr', days: 252 },
  { id: 'MAX', label: 'Max', days: Infinity },
];

const W = 800;
const H = 260;
const PAD_X = 8;
const PAD_TOP = 18;
const PAD_BOTTOM = 26;

const fmtDate = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Glatte Kurve (Catmull-Rom → Bézier) für einen ruhigen, Apple-artigen Linienverlauf */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.18;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/**
 * Basic-Kurschart: eine ruhige Linie mit Farbverlauf, 4 Zeiträume,
 * Antippen/Hovern zeigt Datum & Kurs. Keine Indikatoren, keine Kerzen.
 */
export default function SimpleAreaChart({ history = [], currentPrice }) {
  const [rangeId, setRangeId] = useState('1J');
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const series = useMemo(() => {
    const clean = (history || []).filter((p) => p && Number.isFinite(Number(p.close)));
    const r = RANGES.find((x) => x.id === rangeId) || RANGES[2];
    return Number.isFinite(r.days) ? clean.slice(-r.days) : clean;
  }, [history, rangeId]);

  if (!series.length) {
    return (
      <div className="glass rounded-3xl p-6 text-sm text-slate-400 text-center">Kein Kursverlauf verfügbar.</div>
    );
  }

  const closes = series.map((p) => Number(p.close));
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const lo = min - span * 0.08;
  const hi = max + span * 0.08;

  const x = (i) => PAD_X + (i / Math.max(1, series.length - 1)) * (W - PAD_X * 2);
  const y = (v) => PAD_TOP + (1 - (v - lo) / (hi - lo)) * (H - PAD_TOP - PAD_BOTTOM);

  const pts = closes.map((v, i) => [x(i), y(v)]);
  const line = smoothPath(pts);
  const area = `${line} L ${x(series.length - 1)} ${H - PAD_BOTTOM} L ${x(0)} ${H - PAD_BOTTOM} Z`;

  const first = closes[0];
  const last = closes[closes.length - 1];
  const changePct = ((last - first) / first) * 100;
  const up = changePct >= 0;
  const color = up ? '#34D399' : '#FB7185';

  const allTimeHigh = Math.max(...(history || []).map((p) => Number(p.close) || 0));
  const fromHigh = allTimeHigh ? ((Number(currentPrice ?? last) - allTimeHigh) / allTimeHigh) * 100 : 0;

  let highText;
  if (fromHigh > -2) highText = 'Notiert nahe am Höchststand';
  else if (fromHigh > -10) highText = `${Math.abs(fromHigh).toFixed(0)} % unter dem Hoch – leichter Rücksetzer`;
  else if (fromHigh > -25) highText = `${Math.abs(fromHigh).toFixed(0)} % unter dem Hoch – deutliche Korrektur`;
  else highText = `${Math.abs(fromHigh).toFixed(0)} % unter dem Hoch – tiefer Einbruch`;

  const maxIdx = closes.indexOf(max);
  const minIdx = closes.indexOf(min);

  const handleMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rel = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((rel - PAD_X) / (W - PAD_X * 2)) * (series.length - 1));
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)));
  };

  const hv = hoverIdx != null ? series[hoverIdx] : null;
  const hvChange = hv ? ((Number(hv.close) - first) / first) * 100 : null;
  const rangeLabel = RANGES.find((r) => r.id === rangeId)?.label;

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 relative z-10">
        <div>
          <div className="text-xs font-semibold text-slate-400">
            {hv ? fmtDate(hv.date) : `Kursverlauf · ${rangeLabel}`}
          </div>
          <div className="flex items-baseline gap-3 mt-0.5">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {(hv ? Number(hv.close) : Number(currentPrice ?? last)).toFixed(2)} €
            </span>
            <span className={`inline-flex items-center gap-1 text-sm font-bold ${(hv ? hvChange : changePct) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {(hv ? hvChange : changePct) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {(hv ? hvChange : changePct) >= 0 ? '+' : ''}{(hv ? hvChange : changePct).toFixed(1)} %
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{highText}</div>
        </div>

        <div className="glass-chip inline-flex p-1 rounded-2xl self-start sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => { setRangeId(r.id); setHoverIdx(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangeId === r.id ? 'liquid-glass-active text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {r.id === 'MAX' ? r.label : r.label.replace(' Monate', ' M').replace(' Monat', ' M').replace(' Jahr', ' J')}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none select-none"
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onTouchStart={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchEnd={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="havnArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="70%" stopColor={color} stopOpacity="0.04" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="havnGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Startlinie (Einstiegsniveau des Zeitraums) */}
          <line x1={PAD_X} x2={W - PAD_X} y1={y(first)} y2={y(first)} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 6" />

          <path d={area} fill="url(#havnArea)" />
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#havnGlow)" />

          {/* Hoch / Tief Marker */}
          {hoverIdx == null && (
            <>
              <circle cx={x(maxIdx)} cy={y(max)} r="3.5" fill="#fff" fillOpacity="0.9" />
              <text x={Math.min(W - 60, Math.max(40, x(maxIdx)))} y={y(max) - 8} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="11" fontWeight="600">
                Hoch {max.toFixed(0)} €
              </text>
              <circle cx={x(minIdx)} cy={y(min)} r="3.5" fill="#fff" fillOpacity="0.5" />
              <text x={Math.min(W - 60, Math.max(40, x(minIdx)))} y={y(min) + 18} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="600">
                Tief {min.toFixed(0)} €
              </text>
            </>
          )}

          {/* Endpunkt */}
          <circle cx={x(series.length - 1)} cy={y(last)} r="5" fill={color} stroke="rgba(255,255,255,0.9)" strokeWidth="2" />

          {/* Hover-Crosshair */}
          {hv && (
            <>
              <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={PAD_TOP - 6} y2={H - PAD_BOTTOM} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              <circle cx={x(hoverIdx)} cy={y(Number(hv.close))} r="6" fill={color} stroke="#fff" strokeWidth="2" />
            </>
          )}

          {/* Datumsachse: Start / Ende */}
          <text x={PAD_X} y={H - 6} fill="rgba(148,163,184,0.8)" fontSize="11">{fmtDate(series[0].date)}</text>
          <text x={W - PAD_X} y={H - 6} textAnchor="end" fill="rgba(148,163,184,0.8)" fontSize="11">Heute</text>
        </svg>
      </div>
    </div>
  );
}
