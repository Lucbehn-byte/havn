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

// Historische & makroökonomische Krisenereignisse mit authentischer Crash- & Erholungs-Dynamik
const CRISIS_EVENTS = [
  {
    id: 'corona_shock',
    title: 'Corona-Crash (2020)',
    baseDrop: 34,
    crashMonths: 2,         // Schock dauerte nur wenige Wochen (Februar-März 2020)
    recoveryMonths: 7,      // Bis Herbst 2020 war der Weltmarkt bereits wieder auf Allzeithoch (V-Shape)
    postCrashBoomRate: 2.8, // Extrem steile V-Erholung durch weltweite Zentralbank-Liquidität
    desc: 'Rasanter 34%-Schock in nur 33 Tagen, gefolgt von einer historischen V-förmigen Rallye auf neue Rekorde.'
  },
  {
    id: 'bear_market',
    title: 'Zinsschock & Bärenmarkt (2022)',
    baseDrop: 26,
    crashMonths: 9,         // Zäher Abwärtstrend über fast das gesamte Jahr 2022
    recoveryMonths: 14,     // Zähe Bodenbildung
    postCrashBoomRate: 1.1,
    desc: 'Zermürbender, monatelanger Abwärtstrend getrieben von Rekordinflation und rasanten Zinsanhebungen.'
  },
  {
    id: 'financial_crisis',
    title: 'Globale Finanzkrise (2008)',
    baseDrop: 54,
    crashMonths: 14,        // Lehman-Kollaps mit langwieriger Talfahrt
    recoveryMonths: 28,     // Langwierige U-förmige Erholung der Weltwirtschaft
    postCrashBoomRate: 1.4,
    desc: 'Schwerste Banken- und Vertrauenskrise der Moderne mit dramatischem Einbruch und U-Erholung.'
  },
  {
    id: 'tech_bubble',
    title: 'Dotcom- / Tech-Korrektur',
    baseDrop: 44,
    crashMonths: 10,
    recoveryMonths: 20,
    postCrashBoomRate: 1.3,
    desc: 'Plötzliche Entzauberung überhitzter Wachstumswerte bei robusterem Gesamtmarkt.'
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

  // DYNAMISCHE KALIBRIERUNG JE NACH KRISEN-EREIGNIS:
  // Corona-Crash: Extrem rasanter Einbruch in ~1-2 Monaten (Feb-März 2020), extrem steile V-förmige Erholung
  // Bärenmarkt 2022: Zäher monatelanger Zinsanstiegs-Trend (ca. 8-9 Monate)
  // Finanzkrise 2008: Langwieriger Einbruch über 14 Monate mit tiefer U-Erholung
  const totalMonths = 36;
  const crashStartMonth = 1; // Unmittelbar nach der Einzahlung trifft die Krise ein
  const crashDuration = Math.min(event.crashMonths, 12);
  const crashTroughMonth = crashStartMonth + crashDuration; // Für Corona z.B. Monat 1+2 = Monat 3

  let currentPortfolio = investedInitial;
  let currentCashIn = investedInitial;
  const fullTimeline = [];

  // Monat 0: Tag der Einzahlung / Einstieg
  fullTimeline.push({
    month: 0,
    label: 'Start',
    phase: 'entry',
    value: Math.round(currentPortfolio),
    cash: currentCashIn,
    info: `Einzahlung Startkapital: ${investedInitial.toLocaleString('de-DE')} €`
  });

  // Dynamische Wachstumsrate für Erholung
  // Bei Corona war die Erholungsrallye durch weltweite Zentralbank-Stimuli historisch steil
  const baseMonthlyRecoveryRate = (0.012 * event.postCrashBoomRate) * (0.8 + 0.2 * asset.beta);

  for (let m = 1; m <= totalMonths; m++) {
    currentCashIn += sparrate;

    if (m < crashStartMonth) {
      currentPortfolio = (currentPortfolio + sparrate) * 1.008;
      fullTimeline.push({
        month: m,
        label: `M${m}`,
        phase: 'pre_crash',
        value: Math.round(currentPortfolio),
        cash: currentCashIn,
      });
    } else if (m <= crashTroughMonth) {
      // Phase 2: Der Crash vollzieht sich über event.crashMonths
      // Fortschritt des Einbruchs von 0% bis 100% des maximalen Schocks
      const progress = (m - crashStartMonth + 1) / crashDuration;
      // Bei Corona schlug der Crash exponentiell schnell durch
      const curveFactor = event.id === 'corona_shock' ? Math.pow(progress, 0.7) : Math.pow(progress, 1.1);
      const currentDrop = (effectiveDropPct * curveFactor) / 100;
      
      const baselineDepot = investedInitial + (m * sparrate);
      currentPortfolio = Math.max(10, baselineDepot * (1 - currentDrop));

      fullTimeline.push({
        month: m,
        label: m === crashTroughMonth ? 'Crash-Tief' : `M${m}`,
        phase: 'crash',
        value: Math.round(currentPortfolio),
        cash: currentCashIn,
        info: m === crashTroughMonth ? `Tiefststand: -${effectiveDropPct}%` : `Crash-Verlauf: -${Math.round(currentDrop * 100)}%`
      });
    } else {
      // Phase 3: Erholungsphase (V-Shape bei Corona vs. U-Shape bei Finanzkrise)
      const monthsSinceTrough = m - crashTroughMonth;
      
      // Bei Corona verdoppelt sich das Momentum in den ersten 6 Monaten nach dem Tief
      let monthlyBoost = baseMonthlyRecoveryRate;
      if (event.id === 'corona_shock') {
        if (monthsSinceTrough <= event.recoveryMonths) {
          // Extrem steile V-Rallye in den ersten Monaten nach dem März-Tief 2020
          monthlyBoost = 0.045 * (0.8 + 0.2 * asset.beta); 
        } else {
          // Nach Übertreffen der Vorkrisen-Hochs solides technologisches Bullenmarkt-Wachstum (2020/2021)
          monthlyBoost = 0.016 * (0.8 + 0.2 * asset.beta);
        }
      } else {
        // Standard / U-Erholung
        monthlyBoost = baseMonthlyRecoveryRate * (1 + Math.min(1.0, monthsSinceTrough / 15));
      }

      currentPortfolio = (currentPortfolio + sparrate) * (1 + monthlyBoost);

      fullTimeline.push({
        month: m,
        label: `M${m}`,
        phase: 'recovery',
        value: Math.round(currentPortfolio),
        cash: currentCashIn,
      });
    }
  }

  const endValue = fullTimeline[fullTimeline.length - 1].value;
  const netGain = endValue - currentCashIn;
  const gainPct = Math.round((netGain / currentCashIn) * 100);
  const troughEntry = fullTimeline[crashTroughMonth];
  const troughValue = troughEntry.value;

  // Erholungsmonat finden (wann übersteigt der Depotwert das eingezahlte Geld nach dem Crash?)
  const breakEvenEntry = fullTimeline.slice(crashTroughMonth).find(p => p.value >= p.cash);
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
              {currentCashIn.toLocaleString('de-DE')} €
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

        {/* NEU: Großformatiger 3-Phasen Krisen- & Erholungs-Graph */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 space-y-4 shadow-inner">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <TrendingDown className="w-5 h-5" />
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  3-Phasen-Verlauf: Einstieg → Marktkrise → Erholung
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Chronologische Simulation: Du startest mit {investedInitial.toLocaleString('de-DE')} €, der Markt stürzt in Monat 4/5 um <strong className="text-rose-400">-{effectiveDropPct}%</strong> ein, danach greift dein monatlicher Sparplan von <strong>{sparrate} €</strong>.
              </p>
            </div>
            
            {/* Phasen-Legende */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> 1. Einstieg
              </span>
              <span className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> 2. Krise (-{effectiveDropPct}%)
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 3. Erholung
              </span>
            </div>
          </div>

          {/* Responsive SVG Diagramm (Mobil-optimiert mit dynamischen Proportionen & großer Typografie) */}
          <div className="w-full h-[360px] sm:h-[420px] pt-2">
            {(() => {
              // Mobil-freundliches Koordinatensystem: 640px Breite sorgt für scharfe, große Texte auf Handys
              const svgW = 640;
              const svgH = 360;
              const padLeft = 70;
              const padRight = 35;
              const padTop = 45;
              const padBottom = 45;

              const allValues = fullTimeline.flatMap(p => [p.value, p.cash]);
              const minV = Math.min(...allValues) * 0.88;
              const maxV = Math.max(...allValues) * 1.15;
              const rangeV = maxV - minV || 1;

              const getSvgX = (m) => padLeft + (m / totalMonths) * (svgW - padLeft - padRight);
              const getSvgY = (v) => svgH - padBottom - ((v - minV) / rangeV) * (svgH - padTop - padBottom);

              // Depotwert Pfad
              const pathPoints = fullTimeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(p.month)} ${getSvgY(p.value)}`).join(' ');

              // Cash Pfad (linear wachsende Gesamteinzahlungen)
              const cashPoints = fullTimeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(p.month)} ${getSvgY(p.cash)}`).join(' ');

              // Markante Schlüsselpunkte
              const startX = getSvgX(0);
              const startY = getSvgY(investedInitial);

              const troughX = getSvgX(crashTroughMonth);
              const troughY = getSvgY(troughValue);

              const endX = getSvgX(totalMonths);
              const endY = getSvgY(endValue);

              // Y-Achsen Skalenwerte (4 Ticks)
              const yTicks = [
                minV,
                minV + rangeV * 0.33,
                minV + rangeV * 0.66,
                maxV
              ];

              // Dynamische Begrenzung der Krisenzone
              const zoneStart = Math.max(0.5, crashStartMonth - 0.5);
              const zoneEnd = crashTroughMonth + 1;

              return (
                <svg 
                  viewBox={`0 0 ${svgW} ${svgH}`} 
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="depotLargeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                      <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Krisen-Zone Schattierung */}
                    <linearGradient id="crisisZoneGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(244, 63, 94, 0.04)" />
                      <stop offset="50%" stopColor="rgba(244, 63, 94, 0.22)" />
                      <stop offset="100%" stopColor="rgba(244, 63, 94, 0.04)" />
                    </linearGradient>
                  </defs>

                  {/* Vertikaler Schattierungs-Balken für die Krisenphase */}
                  <rect
                    x={getSvgX(zoneStart)}
                    y={padTop - 10}
                    width={Math.max(30, getSvgX(zoneEnd) - getSvgX(zoneStart))}
                    height={svgH - padTop - padBottom + 10}
                    fill="url(#crisisZoneGradient)"
                    rx="8"
                  />
                  <text 
                    x={(getSvgX(zoneStart) + getSvgX(zoneEnd)) / 2} 
                    y={padTop + 10} 
                    fill="#f43f5e" 
                    fontSize="11" 
                    fontWeight="900" 
                    textAnchor="middle" 
                    letterSpacing="0.8"
                  >
                    CRASH ({event.title.split(' ')[0]})
                  </text>

                  {/* Horizontale Gitterlinien mit großen, lesbaren Euro-Beträgen */}
                  {yTicks.map((val, i) => {
                    const yPos = getSvgY(val);
                    return (
                      <g key={i}>
                        <line 
                          x1={padLeft} 
                          y1={yPos} 
                          x2={svgW - padRight} 
                          y2={yPos} 
                          stroke="#1e293b" 
                          strokeWidth="1.5"
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={padLeft - 10} 
                          y={yPos + 4} 
                          fill="#94a3b8" 
                          fontSize="12" 
                          fontWeight="700" 
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {Math.round(val).toLocaleString('de-DE')} €
                        </text>
                      </g>
                    );
                  })}

                  {/* Fläche unter dem Depotwert */}
                  <path
                    d={`${pathPoints} L ${getSvgX(totalMonths)} ${svgH - padBottom} L ${getSvgX(0)} ${svgH - padBottom} Z`}
                    fill="url(#depotLargeGradient)"
                  />

                  {/* Eingezahltes Kapital Linie (Grau gestrichelt) */}
                  <path
                    d={cashPoints}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                  />

                  {/* Depotwert Linie (Sky Blue leuchtend) */}
                  <path
                    d={pathPoints}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 1. STARTPUNKT MARKER */}
                  <circle cx={startX} cy={startY} r="5.5" fill="#38bdf8" stroke="#070B14" strokeWidth="2" />
                  <rect x={startX} y={startY - 34} width="105" height="24" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x={startX + 52} y={startY - 18} fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                    Start: {investedInitial.toLocaleString('de-DE')} €
                  </text>

                  {/* 2. CRASH-TIEFPUNKT MARKER */}
                  <circle cx={troughX} cy={troughY} r="6.5" fill="#f43f5e" stroke="#070B14" strokeWidth="2" className="animate-pulse" />
                  {/* Positionierung des Tief-Badges leicht oberhalb oder unterhalb je nach Platz */}
                  <g transform={`translate(${troughX > 150 ? troughX - 55 : troughX - 10}, ${troughY < svgH - 100 ? troughY + 14 : troughY - 50})`}>
                    <rect x="0" y="0" width="118" height="38" rx="8" fill="#1e1014" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="59" y="16" fill="#f43f5e" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="monospace">
                      Tief: {troughValue.toLocaleString('de-DE')} €
                    </text>
                    <text x="59" y="30" fill="#f87171" fontSize="10" fontWeight="700" textAnchor="middle">
                      Schock: -{effectiveDropPct}%
                    </text>
                  </g>

                  {/* 3. ENDWERT MARKER */}
                  <circle cx={endX} cy={endY} r="6.5" fill="#10b981" stroke="#070B14" strokeWidth="2" />
                  <g transform={`translate(${endX - 130}, ${endY - 38})`}>
                    <rect x="0" y="0" width="130" height="34" rx="8" fill="#062d1f" stroke="#10b981" strokeWidth="1.5" />
                    <text x="65" y="14" fill="#ffffff" fontSize="11.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">
                      Ende: {endValue.toLocaleString('de-DE')} €
                    </text>
                    <text x="65" y="27" fill="#34d399" fontSize="10" fontWeight="800" textAnchor="middle">
                      +{netGain.toLocaleString('de-DE')} € ({gainPct}%)
                    </text>
                  </g>

                  {/* X-Achsen Beschriftungen (Monate & Phasen) */}
                  <g transform={`translate(0, ${svgH - 12})`}>
                    <text x={getSvgX(0)} y="0" fill="#cbd5e1" fontSize="11" fontWeight="700" textAnchor="middle">Monat 0</text>
                    <text x={getSvgX(crashTroughMonth)} y="0" fill="#f87171" fontSize="11" fontWeight="800" textAnchor="middle">M{crashTroughMonth} (Tief)</text>
                    <text x={getSvgX(18)} y="0" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">1,5 Jahre</text>
                    <text x={getSvgX(totalMonths)} y="0" fill="#34d399" fontSize="11" fontWeight="800" textAnchor="middle">3 Jahre (Ziel)</text>
                  </g>
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

