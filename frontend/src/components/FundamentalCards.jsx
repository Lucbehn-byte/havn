import React from 'react';
import { Landmark } from 'lucide-react';

export default function FundamentalCards({ fundamental = {} }) {
  const isEtf = fundamental.is_etf;
  const status = fundamental.valuation_status || '–';
  const summary = fundamental.summary || '';
  const metrics = fundamental.metrics || {};
  const driftAdj = fundamental.drift_adjustment || 0;

  const metricEntries = Object.entries(metrics);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            <span>Fundamentale Bewertung & Multiples</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEtf ? 'Kostenstruktur & Fondsvolumen (Welt-ETF)' : 'KGV, Forward-KGV, Gewinnwachstum & Dividende'}
          </p>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-bold self-start sm:self-auto">
          {status}
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {summary}
      </p>

      {/* Metriken-Grid */}
      {metricEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricEntries.map(([k, v], idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-medium truncate">{k}</div>
              <div className="text-sm font-bold text-white font-mono mt-1 truncate">{v}</div>
            </div>
          ))}
        </div>
      )}

      {driftAdj !== 0 && (
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>
            Mathematischer Multiple-Einfluss auf die 3–5 Jahres-Simulation: 
            <strong className={driftAdj > 0 ? "text-emerald-400" : "text-amber-400"}> {driftAdj > 0 ? `+${(driftAdj * 100).toFixed(2)}` : (driftAdj * 100).toFixed(2)}% p.a.</strong>
          </span>
        </div>
      )}
    </div>
  );
}
