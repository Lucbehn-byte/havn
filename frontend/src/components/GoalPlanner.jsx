import React, { useState } from 'react';
import { Target, Compass, Sparkles, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import RollUpPicker from './RollUpPicker';

const GOALS = [
  {
    id: 'first_10k',
    title: 'Die ersten 10.000 €',
    subtitle: 'Der psychologische Meilenstein',
    years: 4,
    targetAmount: 10000,
    riskAllocation: '80% Welt-ETF / 20% Tagesgeld',
    expectedAnnualReturn: 6.5,
    desc: 'Der schwerste, aber wichtigste Schritt: Die ersten 10.000 € beweisen dir, dass Vermögensaufbau funktioniert. Ab hier beginnt dein Geld spürbar für dich zu arbeiten.'
  },
  {
    id: 'side_income',
    title: '100 € monatliches Nebeneinkommen',
    subtitle: 'Passiver Cashflow für Fixkosten',
    years: 7,
    targetAmount: 25000,
    riskAllocation: '85% Welt-ETF / 15% Puffer',
    expectedAnnualReturn: 7.0,
    desc: 'Bei einer marktüblichen Ausschüttung von ca. 4% zahlt dir dein Depot jeden Monat 100 € netto aus – dein Handy-, Internet- oder Streamingvertrag ist dauerhaft bezahlt.'
  },
  {
    id: 'real_estate',
    title: 'Immobilien-Eigenkapital',
    subtitle: 'Fundament für die eigenen 4 Wände',
    years: 8,
    targetAmount: 60000,
    riskAllocation: '60% Welt-ETF / 40% Geldmarkt',
    expectedAnnualReturn: 5.5,
    desc: 'Solides Startkapital für den Haus- oder Wohnungskauf, um Nebenkosten zu decken und die günstigsten Zinskonditionen bei Banken zu sichern.'
  },
  {
    id: 'financial_freedom',
    title: 'Finanzielle Freiheit',
    subtitle: 'Sorgenfreie Rente & Unabhängigkeit',
    years: 25,
    targetAmount: 350000,
    riskAllocation: '85% Welt-ETF / 15% Puffer',
    expectedAnnualReturn: 7.0,
    desc: 'Der Zeithorizont, an dem der Zinseszins die volle Wucht entfaltet: Die Rendite übersteigt deine eigenen Einzahlungen um ein Vielfaches.'
  }
];

export default function GoalPlanner() {
  const [selectedGoal, setSelectedGoal] = useState('first_10k');
  const [targetCapital, setTargetCapital] = useState(10000);
  const [years, setYears] = useState(4);

  const goal = GOALS.find(g => g.id === selectedGoal) || GOALS[0];

  const handleSelectGoal = (g) => {
    setSelectedGoal(g.id);
    setTargetCapital(g.targetAmount);
    setYears(g.years);
  };

  // Berechnung der benötigten monatlichen Sparrate
  // Endwert Formel für monatlichen Sparplan mit Zinseszins:
  // FV = PMT * [((1 + r)^n - 1) / r]
  const r = (goal.expectedAnnualReturn / 100) / 12;
  const n = years * 12;
  const factor = (Math.pow(1 + r, n) - 1) / r;
  const neededMonthlySavings = Math.round(targetCapital / factor);

  const totalEigenkapital = neededMonthlySavings * n;
  const zinsgewinn = targetCapital - totalEigenkapital;
  const zinseszinsAnteilPct = Math.round((zinsgewinn / targetCapital) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Kompass (Ziel- & Vermögensplaner)</h2>
            <p className="text-xs text-slate-400">Wähle dein nächstes greifbares Lebensziel und erfahre, welche monatliche Sparrate dich dorthin bringt.</p>
          </div>
        </div>

        {/* 4 Griffige Lebensziele */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {GOALS.map((g) => {
            const isSelected = g.id === selectedGoal;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGoal(g)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div>
                  <span className={`text-xs font-black uppercase tracking-wider block mb-1 ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                    {g.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block mb-2">
                    {g.subtitle}
                  </span>
                  <div className="text-sm font-black text-white font-mono">
                    {g.targetAmount.toLocaleString('de-DE')} € in {g.years} Jahren
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{g.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Regler Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label="Dein Wunsch-Zielvermögen"
            value={targetCapital}
            onChange={setTargetCapital}
          />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label={`Geplante Haltedauer in Jahren (${years} Jahre)`}
            value={years}
            onChange={setYears}
          />
        </div>
      </div>

      {/* Ergebnis-Cockpit */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Dein persönlicher Fahrplan</span>
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 font-mono font-bold">
            Allokation: {goal.riskAllocation}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Benötigte monatliche Sparrate */}
          <div className="bg-slate-950/80 border border-sky-800/50 rounded-2xl p-4 shadow-lg ring-1 ring-sky-500/20">
            <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Benötigte Sparrate</span>
            <div className="text-3xl font-black font-mono text-white mt-1">
              {neededMonthlySavings.toLocaleString('de-DE')} € <span className="text-sm text-slate-400 font-normal">/ Monat</span>
            </div>
            <span className="text-[11px] text-slate-400">Automatisiert per Dauerauftrag</span>
          </div>

          {/* Eigene Einzahlungen */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Eigene Einzahlungen</span>
            <div className="text-2xl font-black font-mono text-slate-200 mt-1">
              {totalEigenkapital.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-slate-400">Summe aller Monatsraten</span>
          </div>

          {/* Zinseszins Geschenk */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-emerald-400 font-bold">Zinseszins-Ertrag</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              +{zinsgewinn.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {zinseszinsAnteilPct}% des Endvermögens zahlt die Rendite!
            </span>
          </div>
        </div>

        {/* Empfohlene HAVN-Strategie */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Award className="w-4 h-4 text-sky-400" /> Die professionelle Umsetzung:
          </div>
          <p>
            Richte bei deinem Neobroker (z. B. Trade Republic oder Scalable) einen automatischen ETF-Sparplan über <strong>{neededMonthlySavings} € monatlich</strong> in einen weltweiten All-World-ETF (z. B. <em>MSCI World oder FTSE All-World</em>) ein. 
            Über {years} Jahre wächst dein Vermögen durch den Zinseszins auf rund <strong>{targetCapital.toLocaleString('de-DE')} €</strong> an – über <strong>{zinsgewinn.toLocaleString('de-DE')} €</strong> davon sind reiner Wertzuwachs ohne zusätzliche Arbeit!
          </p>
        </div>
      </div>
    </div>
  );
}
