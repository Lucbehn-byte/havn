import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, CheckCircle2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function RiskProfile({ monteCarlo = {}, rollingReturns = {}, beta = 1.0 }) {
  const pUp = monteCarlo.prob_up ?? 50;
  const pFlat = monteCarlo.prob_flat ?? 0;
  const pDown = monteCarlo.prob_down ?? 50;

  const sortino = monteCarlo.sortino_ratio ?? 1.0;
  const cvarPct = monteCarlo.cvar_95_pct ?? -20.0;
  const cvarEuro = monteCarlo.cvar_95_euro ?? 0;
  const ewmaVol = monteCarlo.ewma_volatility_pct ?? 15.0;
  const histVol = monteCarlo.hist_volatility_pct ?? 15.0;

  const winRate = rollingReturns.win_rate_pct;
  const numPeriods = rollingReturns.num_periods;
  const rollingSummary = rollingReturns.summary;

  const formatEuro = (val) => `${val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  return (
    <div className="glass rounded-2xl p-5 shadow-xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Risiko & Gewinnchancen</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Ergebnis aus 5.000 stochastischen Marktszenarien inklusive historischer Crashs und Kurssprünge.
        </p>
      </div>

      {/* 3 Wahrscheinlichkeitsbalken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gewinn-Wahrscheinlichkeit */}
        <div className="glass-inset rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gewinnchance</span>
              <InfoTooltip
                title="Gewinnchance"
                text="Der prozentuale Anteil aller 5.000 Simulationspfade, die nach der gewählten Haltedauer im Plus endeten."
                rule="Bei langen Zeiträumen ab 5 Jahren liegt die Gewinnchance solider Welt-ETFs oft bei 85 % bis 95 %."
              />
            </span>
            <span className="text-sm font-black font-mono text-emerald-400">{pUp} %</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pUp)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Anteil der Pfade mit positivem Wertzuwachs.</p>
        </div>

        {/* Seitwärts */}
        <div className="glass-inset rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Seitwärtsphase</span>
              <InfoTooltip
                title="Seitwärtsphase"
                text="Pfade mit nahezu unverändertem Kapital (Schwankungen zwischen −2 % und +2 %)."
              />
            </span>
            <span className="text-sm font-black font-mono text-amber-400">{pFlat} %</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pFlat)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Pfade mit geringfügiger Veränderung.</p>
        </div>

        {/* Verlust-Risiko */}
        <div className="glass-inset rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Verlustrisiko</span>
              <InfoTooltip
                title="Verlustrisiko"
                text="Der Anteil der Simulationen, bei denen der Endkurs unter dem ursprünglichen Einstandspreis liegt."
              />
            </span>
            <span className="text-sm font-black font-mono text-rose-400">{pDown} %</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pDown)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Pfade unterhalb des Kaufkurses.</p>
        </div>
      </div>

      {/* Quant-Schutzkennzahlen: Sortino, CVaR 95%, EWMA */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Wichtige Risikokennzahlen</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sortino */}
          <div className="glass-inset rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium flex items-center">
                <span>Sortino-Ratio</span>
                <InfoTooltip 
                  title="Sortino-Ratio" 
                  text="Misst die erzielte Rendite ausschließlich im Verhältnis zum echten Verlustrisiko (schlechte Kurstage). Im Gegensatz zur klassischen Sharpe-Ratio werden erfreuliche Kurssprünge nach oben nicht fälschlich als Risiko gewertet." 
                  rule="Werte über 1.0 gelten als gut, über 1.8 als exzellent."
                />
              </span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {sortino.toFixed(2)}
            </div>
            <div className="text-[11px] font-medium mt-0.5 flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${sortino > 1.0 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={sortino > 1.8 ? 'text-emerald-400' : sortino > 1.0 ? 'text-emerald-400' : 'text-amber-400'}>
                {sortino > 1.8 ? 'Exzellente Rendite pro Risiko' : sortino > 1.0 ? 'Solides Risikoprofil' : 'Moderates Profil'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ertrag im Verhältnis zu rein schädlichen Verlusttagen.
            </p>
          </div>

          {/* Expected Shortfall (CVaR 95%) */}
          <div className="glass-inset rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium flex items-center">
                <span>Crash-Rückschlag • CVaR 95 %</span>
                <InfoTooltip 
                  title="Crash-Rückschlag (CVaR 95 %)" 
                  text="Conditional Value at Risk: Gibt den durchschnittlichen Verlust in den schlimmsten 5 % aller Marktfälle an. Dieser Stresstest zeigt, wie tief der Fall im absoluten Extremcrash ausfällt." 
                  rule="Ein tieferer Wert signalisiert hohe Schock-Resistenz."
                />
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {cvarPct.toFixed(1)} %
            </div>
            <div className="text-[11px] text-rose-400/90 font-medium mt-0.5">
              Ø −{formatEuro(cvarEuro)} im Extremfall
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Durchschnittlicher Einbruch in den 5 % härtesten Krisen.
            </p>
          </div>

          {/* EWMA Volatilität & Beta */}
          <div className="glass-inset rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium flex items-center">
                <span>Kursschwankung & Beta</span>
                <InfoTooltip 
                  title="Kursschwankung & Markt-Beta" 
                  text="Volatilität beziffert die jährliche Schwankungsbreite (gewichtete EWMA der jüngsten Handelstage). Das Markt-Beta vergleicht die Intensität mit dem Weltmarkt (MSCI World = 1.0)." 
                  rule="Ein Beta von 1.2 bedeutet 20 % stärkere Ausschläge als der Gesamtmarkt."
                />
              </span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {ewmaVol.toFixed(1)} % <span className="text-xs text-slate-400 font-normal">p.a.</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              3J-Schnitt: {histVol.toFixed(1)} % • Beta: <span className="text-sky-400 font-bold">{beta.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Aktuelle Nervosität im Vergleich zum 3-Jahres-Trend.
            </p>
          </div>
        </div>
      </div>

      {/* Historische Kontrollprüfung (Rolling Returns) */}
      {winRate != null && (
        <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-200">
            <span className="font-bold text-sky-300">Historische Kontrollprüfung: </span>
            In den vergangenen {numPeriods} überprüften Zeitfenstern lag man bei exakt dieser Haltedauer zu{' '}
            <span className="font-bold text-emerald-400 text-sm">{winRate} %</span> im Gewinn • {rollingSummary}
          </div>
        </div>
      )}
    </div>
  );
}
