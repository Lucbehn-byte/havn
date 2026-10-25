import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldCheck, Flame, RefreshCw, Zap, CloudLightning, ShieldAlert, Sparkles, Calendar, Layers } from 'lucide-react';
import RollUpPicker from './RollUpPicker';
import HISTORICAL_CRISIS_DATA from '../data/historical_crisis_data.json';

// Wählbare Basis-Assets
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

// Historische Krisenereignisse mit echten Zeiträumen
const CRISIS_EVENTS = [
  {
    id: 'corona_shock',
    title: 'Corona-Crash (2020)',
    period: 'Jan 2020 – Jan 2023',
    desc: 'Schockartiger 34%-Crash im Frühjahr 2020, gefolgt von einer historischen V-Erholung auf neue Höchststände.'
  },
  {
    id: 'bear_market',
    title: 'Zinsschock & Bärenmarkt (2022)',
    period: 'Jan 2022 – Jan 2025',
    desc: 'Zäher monatelanger Zinsanstiegs-Bärenmarkt mit anschließender starker Erholung der Technologiemärkte.'
  },
  {
    id: 'financial_crisis',
    title: 'Globale Finanzkrise (2008)',
    period: 'Okt 2007 – Okt 2010',
    desc: 'Schwerste Banken- und Wirtschaftskrise der Moderne mit langwierigem Einbruch und anschließender Erholung.'
  },
  {
    id: 'tech_bubble',
    title: 'Dotcom- / Tech-Korrektur (2000)',
    period: 'Jan 2000 – Jan 2003',
    desc: 'Platzen der ersten großen Tech-Blase und anschließende Marktbereinigung über 3 Jahre.'
  }
];

export default function CrisisSimulator({ initialAsset = 'EUNL.DE' }) {
  const [selectedAssetId, setSelectedAssetId] = useState(() => {
    return ASSET_OPTIONS.some((a) => a.id === initialAsset) ? initialAsset : 'EUNL.DE';
  });

  useEffect(() => {
    if (initialAsset && ASSET_OPTIONS.some((a) => a.id === initialAsset)) {
      setSelectedAssetId(initialAsset);
    }
  }, [initialAsset]);

  const [selectedEventId, setSelectedEventId] = useState('corona_shock');
  const [kapital, setKapital] = useState(1000);
  const [sparrate, setSparrate] = useState(150);
  const [viewMode, setViewMode] = useState('both'); // 'both', 'depot', 'price'

  const asset = ASSET_OPTIONS.find((a) => a.id === selectedAssetId) || ASSET_OPTIONS[0];
  const event = CRISIS_EVENTS.find((e) => e.id === selectedEventId) || CRISIS_EVENTS[0];

  // Reale historische Kursdaten abgreifen
  const eventData = HISTORICAL_CRISIS_DATA[selectedEventId] || HISTORICAL_CRISIS_DATA['corona_shock'];
  const assetData = eventData[selectedAssetId] || eventData['EUNL.DE'];
  const rawPrices = assetData.prices || [100];
  const dates = assetData.dates || [];
  const isProxy = assetData.is_proxy || false;

  // Realer Tiefpunkt im Kursverlauf
  let minPrice = rawPrices[0];
  let troughIndex = 0;
  rawPrices.forEach((p, idx) => {
    if (p < minPrice) {
      minPrice = p;
      troughIndex = idx;
    }
  });

  const startPrice = rawPrices[0];
  const endPrice = rawPrices[rawPrices.length - 1];
  const priceChangeTrough = Math.round(((minPrice - startPrice) / startPrice) * 100);
  const priceChange3Y = Math.round(((endPrice - startPrice) / startPrice) * 100);

  // Echte Simulation des Depots mit den tatsächlichen historischen Kursen:
  // Monat 0: Kauf von Anteilen mit Startkapital
  // Monat 1..36: Regelmäßiger Zukauf von Anteilen mit Sparrate zum realen Monatspreis
  let accumulatedShares = kapital / startPrice;
  let accumulatedCash = kapital;

  const fullTimeline = [];
  fullTimeline.push({
    month: 0,
    date: dates[0] || 'M0',
    price: startPrice,
    shares: accumulatedShares,
    cash: accumulatedCash,
    depotValue: Math.round(accumulatedShares * startPrice),
  });

  for (let m = 1; m < rawPrices.length; m++) {
    const currentP = rawPrices[m];
    accumulatedCash += sparrate;
    const boughtShares = sparrate / currentP;
    accumulatedShares += boughtShares;
    const currentDepot = accumulatedShares * currentP;

    fullTimeline.push({
      month: m,
      date: dates[m] || `M${m}`,
      price: currentP,
      shares: accumulatedShares,
      cash: accumulatedCash,
      depotValue: Math.round(currentDepot),
    });
  }

  const endDepotValue = fullTimeline[fullTimeline.length - 1].depotValue;
  const troughDepotValue = fullTimeline[troughIndex].depotValue;
  const netGain = endDepotValue - accumulatedCash;
  const gainPct = Math.round((netGain / accumulatedCash) * 100);

  // Breakeven-Monat nach dem Tief
  const breakEvenEntry = fullTimeline.slice(troughIndex).find(p => p.depotValue >= p.cash);
  const breakEvenMonth = breakEvenEntry ? breakEvenEntry.month : '> 36';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro & Konfigurations-Leiste */}
      <div className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Sturm (Krisen-Stresstest mit realen Kursen)</h2>
              <p className="text-xs text-slate-400">Verfolge den echten, ungeschönten Börsenkurs während historischer Krisen und sieh, wie dein Sparplan reagiert hätte.</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-mono text-slate-300 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Zeitraum: {event.period}</span>
          </div>
        </div>

        {/* 2 Dropdown-Menüs: Wertpapier & Krisen-Ereignis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          
          {/* 1. Wertpapier / Asset Auswahl */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>1. Wertpapier / ETF</span>
              <span className="text-[10px] text-sky-400 font-mono">Real-Daten verfügbar</span>
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
              {isProxy ? 'Historischer Benchmark-Index herangezogen (da vor Auflage des Wertpapiers).' : 'Exakter historischer Börsenkurs aus diesem Zeitraum.'}
            </p>
          </div>

          {/* 2. Krisen-Ereignis Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              2. Historisches Krisen-Ereignis
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {CRISIS_EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.period})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {event.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Regler Kacheln (Roll-Up Picker) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label={`Geldeinsatz (Startkapital bei Krisenbeginn)`}
            value={kapital}
            onChange={setKapital}
            presets={[100, 250, 500, 1000, 2000, 3000, 5000, 10000, 20000, 50000]}
          />
        </div>
        <div className="glass rounded-3xl p-5 shadow-xl">
          <RollUpPicker
            label="Monatliche Sparrate während & nach dem Crash"
            value={sparrate}
            onChange={setSparrate}
            presets={[25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000]}
          />
        </div>
      </div>

      {/* Ergebnis Auswertung */}
      <div className="glass rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Historischer Echt-Verlauf für {asset.name}
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono font-bold">
            Breakeven nach ca. {breakEvenMonth} {breakEvenMonth === 1 ? 'Monat' : 'Monaten'}
          </span>
        </div>

        {/* 2 Hauptkacheln: Reale Kursveränderung & Sparplan-Endwert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-inset rounded-2xl p-4">
            <span className="text-xs text-slate-400">Reale Kursentwicklung ({event.title})</span>
            <div className="text-2xl font-black font-mono text-white mt-1 flex items-baseline gap-2">
              <span>{priceChange3Y >= 0 ? `+${priceChange3Y}%` : `${priceChange3Y}%`}</span>
              <span className="text-xs font-normal text-slate-400">({startPrice.toFixed(2)} € → {endPrice.toFixed(2)} €)</span>
            </div>
            <span className="text-[11px] text-rose-400 font-medium">
              Tiefststand: {minPrice.toFixed(2)} € ({priceChangeTrough}% Einbruch in Monat {troughIndex})
            </span>
          </div>

          <div className="glass-inset rounded-2xl p-4">
            <span className="text-xs text-slate-400">Dein Depotwert nach 3 Jahren (mit Sparplan)</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {endDepotValue.toLocaleString('de-DE')} €
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              +{netGain.toLocaleString('de-DE')} € ({gainPct >= 0 ? `+${gainPct}%` : `${gainPct}%`}) Reingewinn bei {accumulatedCash.toLocaleString('de-DE')} € Einzahlung
            </span>
          </div>
        </div>

        {/* GROSSFORMATIGER HISTORISCHER ECHTDATEN-GRAPH */}
        <div className="glass-inset rounded-3xl p-6 space-y-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <TrendingDown className="w-5 h-5" />
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Realer historischer Kurs & Depot-Erholung
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Keine vereinfachte Skizze, sondern der <strong>tatsächliche historische Börsenkurs</strong>. Erkennbar sind der Einstiegspunkt, der reale Tiefpunkt und die Kurserholung nach 3 Jahren.
              </p>
            </div>
            
            {/* Ansichts-Filter */}
            <div className="flex items-center gap-1.5 glass p-1 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'both' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Beides
              </button>
              <button
                type="button"
                onClick={() => setViewMode('depot')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'depot' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Nur Depot
              </button>
              <button
                type="button"
                onClick={() => setViewMode('price')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'price' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Nur Kurs
              </button>
            </div>
          </div>

          {/* Legende */}
          <div className="flex items-center flex-wrap gap-3 text-xs pt-1">
            <span className="px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Reales Depot (mit Sparplan)
            </span>
            <span className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Realer Aktienkurs (€)
            </span>
            <span className="px-3 py-1 rounded-lg glass text-slate-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-500"></span> Eingezahltes Kapital
            </span>
          </div>

          {/* SVG Diagramm */}
          <div className="w-full h-[380px] sm:h-[440px] pt-4">
            {(() => {
              const svgW = 680;
              const svgH = 380;
              const padLeft = 65;
              const padRight = 55;
              const padTop = 45;
              const padBottom = 45;
              const totalMonths = fullTimeline.length - 1 || 36;

              // Skalierung für Depotwert & Cash (€)
              const depotValues = fullTimeline.flatMap(p => [p.depotValue, p.cash]);
              const minDepot = Math.min(...depotValues) * 0.85;
              const maxDepot = Math.max(...depotValues) * 1.15;
              const rangeDepot = maxDepot - minDepot || 1;

              // Skalierung für realen Kurs (€)
              const priceValues = fullTimeline.map(p => p.price);
              const minPriceVal = Math.min(...priceValues) * 0.90;
              const maxPriceVal = Math.max(...priceValues) * 1.10;
              const rangePrice = maxPriceVal - minPriceVal || 1;

              const getSvgX = (m) => padLeft + (m / totalMonths) * (svgW - padLeft - padRight);
              const getDepotY = (v) => svgH - padBottom - ((v - minDepot) / rangeDepot) * (svgH - padTop - padBottom);
              const getPriceY = (p) => svgH - padBottom - ((p - minPriceVal) / rangePrice) * (svgH - padTop - padBottom);

              // Pfade generieren
              const depotPath = fullTimeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(p.month)} ${getDepotY(p.depotValue)}`).join(' ');
              const cashPath = fullTimeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(p.month)} ${getDepotY(p.cash)}`).join(' ');
              const pricePath = fullTimeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(p.month)} ${getPriceY(p.price)}`).join(' ');

              // 3 Schlüsselpunkte: Einstieg, Tiefpunkt, Ende
              const startX = getSvgX(0);
              const startDepotY = getDepotY(fullTimeline[0].depotValue);
              const startPriceY = getPriceY(startPrice);

              const troughX = getSvgX(troughIndex);
              const troughDepotY = getDepotY(troughDepotValue);
              const troughPriceY = getPriceY(minPrice);

              const endX = getSvgX(totalMonths);
              const endDepotY = getDepotY(endDepotValue);
              const endPriceY = getPriceY(endPrice);

              // Y-Ticks für Depot
              const yTicks = [
                minDepot,
                minDepot + rangeDepot * 0.33,
                minDepot + rangeDepot * 0.66,
                maxDepot
              ];

              return (
                <svg 
                  viewBox={`0 0 ${svgW} ${svgH}`} 
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="realDepotGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="crisisZoneMarker" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(244, 63, 94, 0.25)" />
                      <stop offset="100%" stopColor="rgba(244, 63, 94, 0.0)" />
                    </linearGradient>
                  </defs>

                  {/* Vertikale Markierungslinie am realen Tiefpunkt */}
                  <line 
                    x1={troughX} 
                    y1={padTop - 15} 
                    x2={troughX} 
                    y2={svgH - padBottom} 
                    stroke="#f43f5e" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    opacity="0.7"
                  />

                  {/* Horizontale Gitterlinien */}
                  {yTicks.map((val, i) => {
                    const yPos = getDepotY(val);
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
                          fill="#64748b" 
                          fontSize="11" 
                          fontWeight="700" 
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {Math.round(val).toLocaleString('de-DE')} €
                        </text>
                      </g>
                    );
                  })}

                  {/* Rechter Y-Achsen-Tick für den realen Aktienkurs */}
                  <text 
                    x={svgW - padRight + 8} 
                    y={getPriceY(maxPriceVal) + 4} 
                    fill="#818cf8" 
                    fontSize="10" 
                    fontWeight="700" 
                    fontFamily="monospace"
                  >
                    {maxPriceVal.toFixed(1)} €
                  </text>
                  <text 
                    x={svgW - padRight + 8} 
                    y={getPriceY(minPriceVal) + 4} 
                    fill="#818cf8" 
                    fontSize="10" 
                    fontWeight="700" 
                    fontFamily="monospace"
                  >
                    {minPriceVal.toFixed(1)} €
                  </text>

                  {/* Fläche unter dem Depot */}
                  {(viewMode === 'both' || viewMode === 'depot') && (
                    <path
                      d={`${depotPath} L ${getSvgX(totalMonths)} ${svgH - padBottom} L ${getSvgX(0)} ${svgH - padBottom} Z`}
                      fill="url(#realDepotGradient)"
                    />
                  )}

                  {/* Eingezahltes Kapital Linie (Grau gestrichelt) */}
                  {(viewMode === 'both' || viewMode === 'depot') && (
                    <path
                      d={cashPath}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                  )}

                  {/* REALER AKTIENKURS PFAD (Violett/Indigo mit realem Zacken-Muster) */}
                  {(viewMode === 'both' || viewMode === 'price') && (
                    <path
                      d={pricePath}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* DEPOTWERT PFAD (Sky Blue) */}
                  {(viewMode === 'both' || viewMode === 'depot') && (
                    <path
                      d={depotPath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* 1. EINSTIEGSPUNKT KENNZEICHNUNG */}
                  <circle cx={startX} cy={startDepotY} r="5.5" fill="#38bdf8" stroke="#070B14" strokeWidth="2" />
                  <g transform={`translate(${startX}, ${startDepotY - 36})`}>
                    <rect x="0" y="0" width="112" height="26" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x="56" y="17" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                      1. Einstieg: {kapital} €
                    </text>
                  </g>

                  {/* 2. TIEFPUNKT KENNZEICHNUNG (ECHTER HISTORISCHER CRASH-BODEN) */}
                  <circle cx={troughX} cy={viewMode === 'price' ? troughPriceY : troughDepotY} r="7" fill="#f43f5e" stroke="#070B14" strokeWidth="2" className="animate-pulse" />
                  <g transform={`translate(${troughX > 160 ? troughX - 65 : troughX - 10}, ${troughDepotY < svgH - 120 ? troughDepotY + 16 : troughDepotY - 55})`}>
                    <rect x="0" y="0" width="135" height="42" rx="8" fill="#1e1014" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="67" y="17" fill="#f43f5e" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="monospace">
                      2. Tiefpunkt ({dates[troughIndex] || `M${troughIndex}`})
                    </text>
                    <text x="67" y="32" fill="#f87171" fontSize="10.5" fontWeight="700" textAnchor="middle">
                      Kurs: {minPrice.toFixed(2)} € ({priceChangeTrough}%)
                    </text>
                  </g>

                  {/* 3. ENDE NACH 3 JAHREN KENNZEICHNUNG */}
                  <circle cx={endX} cy={viewMode === 'price' ? endPriceY : endDepotY} r="6.5" fill="#10b981" stroke="#070B14" strokeWidth="2" />
                  <g transform={`translate(${endX - 142}, ${endDepotY - 42})`}>
                    <rect x="0" y="0" width="142" height="38" rx="8" fill="#062d1f" stroke="#10b981" strokeWidth="1.5" />
                    <text x="71" y="16" fill="#ffffff" fontSize="11.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">
                      3. Ende: {endDepotValue.toLocaleString('de-DE')} €
                    </text>
                    <text x="71" y="30" fill="#34d399" fontSize="10.5" fontWeight="800" textAnchor="middle">
                      Kurs: {endPrice.toFixed(2)} € (+{priceChange3Y}%)
                    </text>
                  </g>

                  {/* X-Achsen Beschriftungen (Monate / Realer Kalender) */}
                  <g transform={`translate(0, ${svgH - 12})`}>
                    <text x={getSvgX(0)} y="0" fill="#cbd5e1" fontSize="11" fontWeight="700" textAnchor="middle">
                      {dates[0] || 'Start'}
                    </text>
                    <text x={getSvgX(troughIndex)} y="0" fill="#f87171" fontSize="11" fontWeight="800" textAnchor="middle">
                      {dates[troughIndex] || `M${troughIndex}`} (Tief)
                    </text>
                    <text x={getSvgX(18)} y="0" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">
                      {dates[18] || '1,5 Jahre'}
                    </text>
                    <text x={getSvgX(totalMonths)} y="0" fill="#34d399" fontSize="11" fontWeight="800" textAnchor="middle">
                      {dates[totalMonths] || '3 Jahre'} (Ziel)
                    </text>
                  </g>
                </svg>
              );
            })()}
          </div>
        </div>

        {/* Quant- & Historische Lektion */}
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/50 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Zap className="w-4 h-4" /> Historischer Beweis für {asset.name}:
          </div>
          <p>
            Im echten Verlauf der <strong>{event.title}</strong> stürzte der Kurs von <strong>{startPrice.toFixed(2)} €</strong> auf das Tief von <strong>{minPrice.toFixed(2)} € ({priceChangeTrough}%)</strong> im Monat <strong>{dates[troughIndex] || troughIndex}</strong> ab. 
            Wer jedoch nicht panisch verkaufte, sondern den Sparplan von <strong>{sparrate} € monatlich</strong> stur weiterlaufen ließ, kaufte am Boden extrem günstig ein. 
            Bereits nach ca. <strong>{breakEvenMonth} Monaten</strong> war der Verlust vollständig ausgeglichen. Nach 3 Jahren schloss das Depot mit <strong>{endDepotValue.toLocaleString('de-DE')} €</strong> ab (Reingewinn: <strong>+{netGain.toLocaleString('de-DE')} €</strong>).
          </p>
        </div>
      </div>
    </div>
  );
}
