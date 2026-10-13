import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function SignalBanner({ chartModel = {} }) {
  const [showDetails, setShowDetails] = useState(false);
  const score = chartModel.score ?? 0;
  const regime = chartModel.regime || 'Neutral';
  const summary = chartModel.summary || '';
  const signals = chartModel.signals || [];

  const isBullish = score > 15;
  const isBearish = score < -15;

  let bannerBg = "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 text-amber-300";
  let badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40";
  let icon = <Minus className="w-5 h-5 text-amber-400" />;
  let label = "Neutrale Konsolidierung";

  if (isBullish) {
    bannerBg = "from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30 text-emerald-300";
    badgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    icon = <TrendingUp className="w-5 h-5 text-emerald-400" />;
    label = "Bullischer Trend & Kaufsignale";
  } else if (isBearish) {
    bannerBg = "from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/30 text-rose-300";
    badgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/40";
    icon = <TrendingDown className="w-5 h-5 text-rose-400" />;
    label = "Erhöhtes Abwärtsrisiko / Verkaufsdruck";
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-r p-5 shadow-xl transition-all ${bannerBg}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-md shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                {label}
              </span>
              <span className="text-xs font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                Score: {score > 0 ? `+${score}` : score}%
              </span>
            </div>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              {summary}
            </p>
          </div>
        </div>

        {signals.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="self-start md:self-center shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
          >
            <span>{showDetails ? 'Details schließen' : 'Warum dieser Score?'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {showDetails && signals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          {signals.map((sig, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
              <span className="text-sky-400 font-bold">•</span>
              <span>{sig}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
