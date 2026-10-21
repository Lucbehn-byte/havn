import React from 'react';
import { Landmark, Target, Users, TrendingUp, Sparkles, Compass } from 'lucide-react';

export default function FundamentalCards({ fundamental = {} }) {
  const isEtf = fundamental.is_etf;
  const status = fundamental.valuation_status || '–';
  const summary = fundamental.summary || '';
  const metrics = fundamental.metrics || {};
  const driftAdj = fundamental.drift_adjustment || 0;
  const consensus = fundamental.analyst_consensus;

  const metricEntries = Object.entries(metrics);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            <span>Fundamentale Bewertung & Analysten-Konsens</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEtf ? 'Kostenstruktur & Fondsvolumen (Welt-ETF)' : 'KGV, Forward-KGV, Wall-Street-Kursziele & Konsens'}
          </p>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-bold self-start sm:self-auto">
          {status}
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {summary}
      </p>

      {/* Wall-Street Analystenkonsens (falls Einzelaktie mit Daten) */}
      {consensus && (consensus.opinions_count > 0 || consensus.target_median_price) && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-950/60 to-slate-900/40 border border-indigo-900/40 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Institutioneller Wall-Street-Konsens</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-900/40 text-indigo-200 border border-indigo-700/50 font-semibold">
              {consensus.recommendation}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {/* Median Kursziel */}
            {consensus.target_median_price && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-sky-400" />
                  <span>Median-Kursziel</span>
                </div>
                <div className="text-sm font-black font-mono text-white mt-1">
                  {consensus.target_median_price} €
                </div>
                {consensus.upside_pct != null && (
                  <div className={`text-[10px] font-bold mt-0.5 ${consensus.upside_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {consensus.upside_pct >= 0 ? `+${consensus.upside_pct}%` : `${consensus.upside_pct}%`} Kurspotenzial
                  </div>
                )}
              </div>
            )}

            {/* Analystenanzahl */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                <span>Analysten-Stimmen</span>
              </div>
              <div className="text-sm font-black font-mono text-white mt-1">
                {consensus.opinions_count} Experten
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Aggregierter Konsens
              </div>
            </div>

            {/* Forward-EPS Wachstum */}
            {consensus.forward_eps_growth_pct != null && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Gewinnwachstum (EPS)</span>
                </div>
                <div className={`text-sm font-black font-mono mt-1 ${consensus.forward_eps_growth_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {consensus.forward_eps_growth_pct >= 0 ? `+${consensus.forward_eps_growth_pct}%` : `${consensus.forward_eps_growth_pct}%`}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {consensus.forward_eps ? `Ziel: ${consensus.forward_eps} €/Aktie` : 'Erwartetes Forward-EPS'}
                </div>
              </div>
            )}

            {/* KGV-Mean-Reversion Status */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>KGV-Mean-Reversion</span>
              </div>
              <div className={`text-sm font-black font-mono mt-1 ${driftAdj >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {driftAdj > 0 ? `+${(driftAdj * 100).toFixed(1)}%` : `${(driftAdj * 100).toFixed(1)}%`} p.a.
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Drift-Korrektur
              </div>
            </div>
          </div>
        </div>
      )}

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

      {driftAdj !== 0 && !consensus && (
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

