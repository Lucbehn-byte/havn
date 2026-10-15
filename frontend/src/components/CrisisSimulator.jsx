import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldCheck, Flame, RefreshCw, Zap, CloudLightning, ShieldAlert, Sparkles } from 'lucide-react';
import RollUpPicker from './RollUpPicker';

// Wählbare Basis-Assets mit realistischen Beta- & Volatilitäts-Profilen
const ASSET_OPTIONS = [
  { id: 'EUNL.DE', name: 'MSCI World ETF (Core)', type: 'Welt-ETF', beta: 1.0, color: 'text-sky-400' },
  { id: 'VUSA.DE', name: 'S&P 500 ETF (Vanguard)', type: 'US-Leitindex', beta: 1.05, color: 'text-blue-400' },
  { id: 'VWCE.DE', name: 'FTSE All-World ETF', type: 'All-World ETF', beta: 0.98, color: 'text-teal-400' },
  { id: 'EXS1.DE', name: 'DAX ETF (iShares)', type: 'Deutschland-ETF', beta: 1.15, color: 'text-amber-400' },
  { id: 'AAPL', name: 'Apple Inc.', type: 'US-Technologie', beta: 1.10, color: 'text-slate-200' },
  { id: 'MSFT', name: 'Microsoft Corp.', type: 'Cloud & Software', beta: 1.12, color: 'text-indigo-400' },
  { id: 'NVDA', name: 'NVIDIA Corp.', type: 'Halbleiter & KI', beta: 1.85, color: 'text-emerald-400' },
  { id: 'TSLA', name: 'Tesla Inc.', type: 'E-Mobilität', beta: 2.10, color: 'text-rose-400' },
  { id: 'BTC-EUR', name: 'Bitcoin (EUR)', type: 'Kryptowährung', beta: 2.60, color: 'text-orange-400' },
];

// Historische & makroökonomische Krisenereignisse
const CRISIS_EVENTS = [
  {
    id: 'corona_shock',
    title: 'Blitzcrash (wie Corona 2020)',
    baseDrop: 33,
    recoverySpeedMonths: 12,
    monthlyRecoveryPct: 1.2,
    desc: 'Extremer panikartiger Kurseinbruch in kürzester Zeit, gefolgt von einer dynamischen V-Erholung.'
  },
  {
    id: 'bear_market',
    title: 'Zinsschock & Bärenmarkt (wie 2022)',
    baseDrop: 25,
    recoverySpeedMonths: 24,
    monthlyRecoveryPct: 0.8,
    desc: 'Langsamer, zermürbender Abwärtstrend durch steigende Leitzinsen und Inflationsdruck.'
  },
  {
    id: 'financial_crisis',
    title: 'Struktur- & Bankenkrise (wie 2008)',
    baseDrop: 52,
    recoverySpeedMonths: 36,
    monthlyRecoveryPct: 0.7,
    desc: 'Tiefe weltweite Rezession mit schweren Kreditausfällen und langwieriger Marktregeneration.'
  },
  {
    id: 'stagflation',
    title: 'Stagflation & Energiekrise',
    baseDrop: 20,
    recoverySpeedMonths: 30,
    monthlyRecoveryPct: 0.5,
    desc: 'Nullwachstum bei hoher Inflation – Kurse treten auf der Stelle mit zwischenzeitlichen Schwächephasen.'
  },
  {
    id: 'tech_bubble',
    title: 'Tech-Korrektur / Bewertungscrash',
    baseDrop: 40,
    recoverySpeedMonths: 28,
    monthlyRecoveryPct: 0.9,
    desc: 'Plötzliche Entzauberung überbewerteter Hype-Sektoren. Breitere Märkte halten sich stabiler.'
  }
];

// Wählbare Härte- / Stärkegrade
const SEVERITY_LEVELS = [
  { id: 'mild', label: 'Moderat (-25% Skalierung)', multiplier: 0.75, badge: 'Moderat' },
  { id: 'realistic', label: 'Realistisch (100% Historischer Standard)', multiplier: 1.0, badge: 'Standard' },
  { id: 'severe', label: 'Schwer (+30% Verschärfung)', multiplier: 1.3, badge: 'Schwer' },
  { id: 'extreme', label: 'Extremer Jahrhundertsturm (+60%)', multiplier: 1.6, badge: 'Katastrophe' },
];

export default function CrisisSimulator() {
  const [selectedAssetId, setSelectedAssetId] = useState('EUNL.DE');
  const [selectedEventId, setSelectedEventId] = useState('corona_shock');
  const [selectedSeverity, setSelectedSeverity] = useState('realistic');
  const [kapital, setKapital] = useState(1000);
  const [sparrate, setSparrate] = useState(150);

  const asset = ASSET_OPTIONS.find((a) => a.id === selectedAssetId) || ASSET_OPTIONS[0];
  const event = CRISIS_EVENTS.find((e) => e.id === selectedEventId) || CRISIS_EVENTS[0];
  const severity = SEVERITY_LEVELS.find((s) => s.id === selectedSeverity) || SEVERITY_LEVELS[1];

  // Dynamische Schadensberechnung unter Berücksichtigung des Asset-Beta
  // Asset-Beta skaliert den Marktschock (z.B. Bitcoin oder Tesla schlagen stärker aus als MSCI World)
  const effectiveDropPct = Math.min(92, Math.round(event.baseDrop * severity.multiplier * Math.sqrt(asset.beta)));
  
  const investedInitial = kapital;
  const crashValue = Math.round(investedInitial * (1 - effectiveDropPct / 100));
  const months = 36; // 3 Jahre Betrachtung

  // Sparplan-Erholungspfad mit Cost-Average-Effekt berechnen
  let portfolioValue = crashValue;
  let totalCashIn = investedInitial;
  const recoveryPath = [];

  // Monatliche Wachstumsrate abhängig vom Event und Asset-Potenzial
  const monthlyGainRate = (event.monthlyRecoveryPct / 100) * (0.8 + 0.2 * asset.beta);

  for (let m = 1; m <= months; m++) {
    totalCashIn += sparrate;
    const marketGain = portfolioValue * monthlyGainRate;
    portfolioValue = portfolioValue + sparrate + marketGain;
    recoveryPath.push({ month: m, value: Math.round(portfolioValue), cash: totalCashIn });
  }

  const endValue = recoveryPath[recoveryPath.length - 1].value;
  const netGain = endValue - totalCashIn;
  const gainPct = Math.round((netGain / totalCashIn) * 100);

  // Erholungsmonat finden (wann übersteigt der Depotwert das eingezahlte Geld?)
  const breakEvenEntry = recoveryPath.find(p => p.value >= p.cash);
  const breakEvenMonth = breakEvenEntry ? breakEvenEntry.month : '> 36';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro & Konfigurations-Leiste */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Sturmmodus (Krisen- & Stress-Simulator)</h2>
            <p className="text-xs text-slate-400">Wähle dein Wertpapier, das Krisenereignis und die Stärke des Marktschocks individuell aus.</p>
          </div>
        </div>

        {/* 3 Dropdown-Menüs: Wertpapier, Ereignis & Stärke */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          
          {/* 1. Wertpapier / Asset Auswahl */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>1. Wertpapier / ETF</span>
              <span className="text-[10px] text-sky-400 font-mono">Beta: {asset.beta.toFixed(2)}</span>
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {ASSET_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Sensitivität: {asset.beta > 1.3 ? 'Hochvolatil (stärkere Ausschläge)' : asset.beta < 1.05 ? 'Breit diversifiziert (defensiv)' : 'Standard Markt-Beta'}
            </p>
          </div>

          {/* 2. Krisen-Ereignis Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              2. Krisen-Ereignis
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {CRISIS_EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {event.desc}
            </p>
          </div>

          {/* 3. Stärke / Härtegrad Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>3. Stärke des Schocks</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                selectedSeverity === 'extreme' ? 'bg-rose-500/20 text-rose-400' :
                selectedSeverity === 'severe' ? 'bg-amber-500/20 text-amber-400' :
                'bg-sky-500/20 text-sky-400'
              }`}>
                {severity.badge}
              </span>
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {SEVERITY_LEVELS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Errechneter Schock: <strong className="text-rose-400">-{effectiveDropPct}%</strong> für {asset.name}
            </p>
          </div>

        </div>
      </div>

      {/* Regler Kacheln (Roll-Up Picker) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label={`Startkapital in ${asset.name}`}
            value={kapital}
            onChange={setKapital}
            presets={[100, 250, 500, 1000, 2000, 3000, 5000, 10000, 20000, 50000]}
          />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label="Monatliche Sparrate nach dem Crash"
            value={sparrate}
            onChange={setSparrate}
            presets={[25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000]}
          />
        </div>
      </div>

      {/* Ergebnis Auswertung */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Stresstest-Ergebnis für {asset.name} nach 3 Jahren
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
            Breakeven nach ca. {breakEvenMonth} {breakEvenMonth === 1 ? 'Monat' : 'Monaten'}
          </span>
        </div>

        {/* 2 Hauptkacheln: Gesamteinzahlung & Endwert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Gesamteinzahlung (36 Monate)</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {totalCashIn.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-slate-400">Startkapital ({kapital.toLocaleString('de-DE')} €) + 36 × {sparrate} € Sparrate</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Depotwert nach Erholungsphase (3 Jahre)</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {endValue.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              +{netGain.toLocaleString('de-DE')} € ({gainPct >= 0 ? `+${gainPct}%` : `${gainPct}%`}) Reingewinn
            </span>
          </div>
        </div>

        {/* NEU: Interaktiver Krisen- & Erholungs-Graph */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Simulierter Kursverlauf & Sparplan-Depotwert in der Krise</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Visualisierung: Sofortiger Kursschock von <strong className="text-rose-400">-{effectiveDropPct}%</strong> und darauffolgende Markterholung mit Cost-Average-Effekt über 36 Monate.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Depotwert
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                <span className="w-2.5 h-0.5 bg-slate-500 inline-block"></span> Eingezahltes Geld
              </span>
            </div>
          </div>

          {/* SVG Diagramm */}
          <div className="w-full h-56 pt-2">
            {(() => {
              const svgW = 750;
              const svgH = 200;
              const padX = 40;
              const padY = 25;

              const allValues = recoveryPath.flatMap(p => [p.value, p.cash]);
              const minV = Math.min(crashValue, ...allValues) * 0.9;
              const maxV = Math.max(...allValues) * 1.08;
              const rangeV = maxV - minV || 1;

              const getSvgX = (m) => padX + (m / months) * (svgW - 2 * padX);
              const getSvgY = (v) => svgH - padY - ((v - minV) / rangeV) * (svgH - 2 * padY);

              // Depotwert Pfad (Start bei Monat 0 mit Crash)
              const pathPoints = [
                `M ${getSvgX(0)} ${getSvgY(crashValue)}`,
                ...recoveryPath.map(p => `L ${getSvgX(p.month)} ${getSvgY(p.value)}`)
              ].join(' ');

              // Cash Pfad (linear wachsende Einzahlungen)
              const cashPoints = [
                `M ${getSvgX(0)} ${getSvgY(investedInitial)}`,
                ...recoveryPath.map(p => `L ${getSvgX(p.month)} ${getSvgY(p.cash)}`)
              ].join(' ');

              // Crash-Tief Punkt
              const crashX = getSvgX(0);
              const crashY = getSvgY(crashValue);

              return (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="depotGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontale Gitterlinien */}
                  {[0.25, 0.5, 0.75].map((ratio, i) => {
                    const yPos = padY + ratio * (svgH - 2 * padY);
                    return (
                      <line 
                        key={i} 
                        x1={padX} 
                        y1={yPos} 
                        x2={svgW - padX} 
                        y2={yPos} 
                        stroke="#1e293b" 
                        strokeDasharray="4 4" 
                      />
                    );
                  })}

                  {/* Fläche unter dem Depotwert */}
                  <path
                    d={`${pathPoints} L ${getSvgX(months)} ${svgH - padY} L ${getSvgX(0)} ${svgH - padY} Z`}
                    fill="url(#depotGradient)"
                  />

                  {/* Eingezahltes Kapital Linie (Grau gestrichelt) */}
                  <path
                    d={cashPoints}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />

                  {/* Depotwert Linie (Sky Blue leuchtend) */}
                  <path
                    d={pathPoints}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Crash-Tiefpunkt Marker */}
                  <circle cx={crashX} cy={crashY} r="5" fill="#f43f5e" />
                  <text x={crashX + 8} y={crashY - 8} fill="#f43f5e" fontSize="11" fontWeight="bold">
                    Crash-Tief (-{effectiveDropPct}%)
                  </text>

                  {/* Endwert Marker */}
                  <circle cx={getSvgX(months)} cy={getSvgY(endValue)} r="5" fill="#10b981" />
                  <text x={getSvgX(months) - 10} y={getSvgY(endValue) - 10} fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="end">
                    {endValue.toLocaleString('de-DE')} €
                  </text>

                  {/* X-Achsen Beschriftungen */}
                  <text x={getSvgX(0)} y={svgH - 6} fill="#64748b" fontSize="10" textAnchor="middle">Monat 0 (Schock)</text>
                  <text x={getSvgX(12)} y={svgH - 6} fill="#64748b" fontSize="10" textAnchor="middle">Jahr 1</text>
                  <text x={getSvgX(24)} y={svgH - 6} fill="#64748b" fontSize="10" textAnchor="middle">Jahr 2</text>
                  <text x={getSvgX(36)} y={svgH - 6} fill="#64748b" fontSize="10" textAnchor="middle">Jahr 3</text>
                </svg>
              );
            })()}
          </div>
        </div>

        {/* Quant-Lektion */}
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/50 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Zap className="w-4 h-4" /> Mathematische Erkenntnis für {asset.name}:
          </div>
          <p>
            Im gewählten Szenario <strong>{event.title}</strong> mit der Stärke <strong>{severity.badge}</strong> bricht der Kurs von <strong>{asset.name}</strong> um <strong>{effectiveDropPct} %</strong> ein. 
            Durch das Weiterbesparen mit <strong>{sparrate} € monatlich</strong> profitierst du massiv vom Cost-Average-Effekt: Dein Einstiegspreis wird dramatisch nach unten verbilligt. 
            Bereits nach circa <strong>{breakEvenMonth} Monaten</strong> hat dein Sparplan den gesamten Crash-Schaden neutralisiert und schließt nach 3 Jahren mit <strong>+{netGain.toLocaleString('de-DE')} € Gewinn</strong> ab.
          </p>
        </div>
      </div>
    </div>
  );
}

