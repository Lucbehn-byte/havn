import React from 'react';
import { AlertOctagon, CheckCircle2, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function CrisisStressTest({ crisisModel = {} }) {
  const summary = crisisModel.summary || '';
  const results = crisisModel.results || {};

  const crisisList = Object.entries(results);

  return (
    <div className="glass rounded-2xl p-5 shadow-xl space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-sky-400" />
          <span>Historischer Krisen- & Stresstest</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Wie hat sich dieses Wertpapier in echten globalen Crashs verhalten? Für jüngere Aktien errechnet HAVN eine synthetische Simulation über das Markt-Beta.
        </p>
      </div>

      {summary && (
        <div className="glass-inset rounded-xl p-3 text-xs text-slate-300 leading-relaxed font-medium">
          <span className="font-bold text-slate-200">Gesamteinschätzung: </span>
          {summary}
        </div>
      )}

      {/* Krisenkarten Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {crisisList.map(([cName, cData], idx) => {
          const isAvailable = cData.verfuegbar;
          const isSynth = cData.is_synthetic;
          const maxDd = cData.max_drawdown_pct;
          const ret = cData.gesamt_rendite_pct;
          const recovered = cData.erholung_erfolgt;

          return (
            <div
              key={idx}
              className="glass-inset rounded-xl p-3.5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-white truncate">{cName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    isSynth 
                      ? 'bg-purple-950/60 text-purple-400 border-purple-800/50' 
                      : 'bg-slate-850 text-sky-400 border-sky-800/50'
                  }`}>
                    {isSynth ? 'Beta-Sim' : 'Realdaten'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {cData.beschreibung}
                </p>
              </div>

              {isAvailable ? (
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max. Drawdown:</span>
                    <span className="font-bold font-mono text-rose-400">{maxDd}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Epochen-Rendite:</span>
                    <span className={`font-bold font-mono ${ret >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ret >= 0 ? `+${ret.toFixed(1)}%` : `${ret.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Erholung erfolgt:</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      {recovered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {recovered ? 'Ja' : 'Längere Phase'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  {cData.hinweis || 'Keine Daten verfügbar'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
