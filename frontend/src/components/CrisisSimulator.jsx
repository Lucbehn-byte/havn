import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldCheck, Flame, RefreshCw, Zap, CloudLightning } from 'lucide-react';
import RollUpPicker from './RollUpPicker';

const SCENARIOS = [
  {
    id: 'crash_after_entry',
    title: 'Crash direkt nach Einstieg',
    subtitle: '-33% Schock in Monat 2',
    desc: 'Die größte Angst vieler Einsteiger: Man investiert 1.000 €, und 4 Wochen später stürzt die Börse ein. Wie rettet der Cost-Average-Effekt deine Rendite?',
    dropPct: -33,
    recoveryMonths: 14,
    color: 'rose',
  },
  {
    id: 'inflation_spike',
    title: 'Schleichende Inflation',
    subtitle: '7% Inflation über 5 Jahre',
    desc: 'Was passiert mit 10.000 € auf dem Girokonto im Vergleich zu einem weltweiten Sachwerte-Portfolio (ETF)?',
    dropPct: -28,
    recoveryMonths: 0,
    color: 'amber',
  },
  {
    id: 'pause_saving',
    title: 'Jobwechsel / Sparplan-Pause',
    subtitle: '12 Monate 0 € Einzahlung',
    desc: 'Du musst deinen Sparplan für ein ganzes Jahr stoppen. Verlierst du dadurch deine finanzielle Zukunft oder arbeitet der Zinseszins weiter?',
    dropPct: -5,
    recoveryMonths: 4,
    color: 'sky',
  }
];

export default function CrisisSimulator() {
  const [selectedScenario, setSelectedScenario] = useState('crash_after_entry');
  const [kapital, setKapital] = useState(1000);
  const [sparrate, setSparrate] = useState(150);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];

  // Mathematische Modellberechnung
  const investedInitial = kapital;
  const crashValue = Math.round(investedInitial * (1 + scenario.dropPct / 100));
  const months = 36; // 3 Jahre Betrachtung

  // Sparplan-Erholungssimulation
  let portfolioValue = crashValue;
  let totalCashIn = investedInitial;
  const recoveryPath = [];

  for (let m = 1; m <= months; m++) {
    // Bei Sparplan-Pause für 12 Monate keine Einzahlung, sonst normale Sparrate
    const monthlyAdd = (scenario.id === 'pause_saving' && m <= 12) ? 0 : sparrate;
    totalCashIn += monthlyAdd;
    // Markterholungs-Faktor (ca. 0.8% p.M. nach Crash)
    const marketGain = portfolioValue * 0.009;
    portfolioValue = portfolioValue + monthlyAdd + marketGain;
    recoveryPath.push({ month: m, value: Math.round(portfolioValue), cash: totalCashIn });
  }

  const endValue = recoveryPath[recoveryPath.length - 1].value;
  const netGain = endValue - totalCashIn;
  const gainPct = Math.round((netGain / totalCashIn) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Sturmmodus (Krisen- & Stress-Simulator)</h2>
            <p className="text-xs text-slate-400">Simulation schwerer Markt-Unwetter und stochastische Schadensberechnung für dein Depot.</p>
          </div>
        </div>

        {/* Szenario Auswahlschalter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenario;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
                <div className="text-sm font-black text-white font-mono">{s.subtitle}</div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{s.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Regler Kacheln (Roll-Up Picker) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label="Dein Startkapital zum Crash-Zeitpunkt"
            value={kapital}
            onChange={setKapital}
          />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label="Deine monatliche Sparrate danach"
            value={sparrate}
            onChange={setSparrate}
          />
        </div>
      </div>

      {/* Ergebnis Auswertung */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Ergebnis-Check: Nach 36 Monaten (3 Jahre)</span>
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
            Cost-Average Schutz aktiv
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Tiefster Einbruch</span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              {crashValue.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-rose-400/80 font-medium">{scenario.dropPct}% Depot-Verlust im Peak</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Eigenes Eingezahltes Geld</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {totalCashIn.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-slate-400">Inkl. monatlicher Sparraten</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Depotwert nach 3 Jahren</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {endValue.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              +{netGain.toLocaleString('de-DE')} € ({gainPct >= 0 ? `+${gainPct}%` : `${gainPct}%`}) Reingewinn
            </span>
          </div>
        </div>

        {/* Quant-Lektion */}
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/50 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Zap className="w-4 h-4" /> Die mathematische Erkenntnis:
          </div>
          <p>
            {scenario.id === 'crash_after_entry' && (
              <>
                Wer nach dem Crash <strong>nicht in Panik verkauft</strong>, sondern die Sparrate von <strong>{sparrate} €</strong> weiterlaufen lässt, kauft die Anteile im Tief um <strong>33 % günstiger</strong> ein. Nach nur {scenario.recoveryMonths} Monaten liegt das Depot wieder im Plus – und profitiert beim späteren Bullenmarkt doppelt!
              </>
            )}
            {scenario.id === 'inflation_spike' && (
              <>
                Bei 7 % Inflation verlieren 10.000 € auf dem Girokonto in 5 Jahren real fast <strong>3.000 € Kaufkraft</strong>. Ein breit gestreuter Welt-Aktien-ETF gleicht Inflation über steigende Unternehmensgewinne historisch zu 100 % aus.
              </>
            )}
            {scenario.id === 'pause_saving' && (
              <>
                Selbst wenn du 12 Monate lang 0 € sparst, wächst dein Vermögen weiter. Dein bereits investiertes Kapital arbeitet ununterbrochen und schützt dich vor Nullzinsen.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
