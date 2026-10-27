import React from 'react';
import { Wallet, TrendingUp, PiggyBank, SunMedium, CloudRain, Coins, Target } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function FinancialMetrics({ monteCarlo = {}, invType = '', sparplanFreq = '' }) {
  const invested = monteCarlo.eingezahltes_kapital ?? 0;
  const expectedReturn = monteCarlo.expected_return_pct ?? 0;
  const expectedProfit = monteCarlo.erwarteter_gewinn ?? 0;
  const expectedEndwert = monteCarlo.erwarteter_endwert ?? 0;
  const worstCase = monteCarlo.pessimistisch_endwert ?? 0;
  const bestCase = monteCarlo.optimistisch_endwert ?? 0;

  const formatEuro = (val) => `${val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-sky-400" />
            <span>Hochrechnung für dein Kapital</span>
          </h3>
          <p className="text-xs text-slate-400">
            Median-Erwartung und Zukunftskorridor aus 5.000 Pfaden • {invType} {invType === 'Sparplan' ? `• ${sparplanFreq}` : ''}
          </p>
        </div>
      </div>

      {/* 3 Hauptkacheln */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Eingezahlt */}
        <div className="glass rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium flex items-center">
              <span>Eingezahltes Kapital</span>
              <InfoTooltip 
                title="Eingezahltes Kapital" 
                text="Die Summe deines tatsächlich aus eigener Tasche investierten Geldes über den gewählten Zeitraum." 
              />
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatEuro(invested)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Deine geplante Gesamteinzahlung
          </div>
        </div>

        {/* Gewinn */}
        <div className="glass rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium flex items-center">
              <span>Erwarteter Reingewinn</span>
              <InfoTooltip 
                title="Erwarteter Reingewinn" 
                text="Der statistische Mittelwert aller 5.000 Monte-Carlo-Simulationen nach Abzug deines Einsatzes." 
                rule="50 % der historischen Szenarien schnitten besser ab, 50 % schwächer."
              />
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${expectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {expectedProfit >= 0 ? `+${formatEuro(expectedProfit)}` : formatEuro(expectedProfit)}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-emerald-400 mt-1">
            {expectedReturn >= 0 ? `+${expectedReturn.toFixed(1)} %` : `${expectedReturn.toFixed(1)} %`} Rendite
          </div>
        </div>

        {/* Endwert */}
        <div className="glass rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium flex items-center">
              <span>Voraussichtlicher Endwert</span>
              <InfoTooltip 
                title="Voraussichtlicher Endwert" 
                text="Der Gesamtbetrag deines Depots (eingezahltes Geld plus erwirtschafteter Gewinn) zum Ende der Haltedauer." 
              />
            </span>
            <PiggyBank className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">
            {formatEuro(expectedEndwert)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kapital plus Ertrag nach der Haltedauer
          </div>
        </div>
      </div>

      {/* Möglicher Korridor */}
      <div className="glass-inset rounded-2xl p-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-sky-400" />
          <span>Mögliche Entwicklungen nach Haltedauer</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-inset rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center">
                <span>Pessimistisch</span>
                <InfoTooltip 
                  title="Pessimistischer Verlauf" 
                  text="Das 10. Perzentil: Nur in 10 % aller durchgerechneten Börsenphasen schnitt dieses Wertpapier noch schwächer ab." 
                  rule="Dient als konservativer Puffer für deine Finanzplanung."
                />
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">{formatEuro(worstCase)}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-sky-800/40 rounded-xl p-3 flex items-center gap-3 shadow-inner">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-sky-400 font-medium uppercase flex items-center">
                <span>Erwartet • Median</span>
                <InfoTooltip 
                  title="Erwartetes Median-Szenario" 
                  text="Das 50. Perzentil: Die statistisch ausgewogenste Mitte aus 5.000 Simulationspfaden." 
                />
              </div>
              <div className="text-sm font-bold text-white font-mono">{formatEuro(expectedEndwert)}</div>
            </div>
          </div>

          <div className="glass-inset rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <SunMedium className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center">
                <span>Optimistisch</span>
                <InfoTooltip 
                  title="Optimistischer Verlauf" 
                  text="Das 90. Perzentil: In 10 % aller Fälle liefen die Märkte besonders stark und erzielten diesen Wert oder mehr." 
                />
              </div>
              <div className="text-sm font-bold text-emerald-300 font-mono">{formatEuro(bestCase)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
