import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import FavoritesBar, { getStoredFavorites, saveStoredFavorites } from './components/FavoritesBar';
import ExecutiveSummary from './components/ExecutiveSummary';
import ShareModal from './components/ShareModal';
import InstallPrompt from './components/InstallPrompt';
import LegalModal from './components/LegalModal';
import AnalyticsModal from './components/AnalyticsModal';
import SignalBanner from './components/SignalBanner';
import PriceChart from './components/PriceChart';
import FinancialMetrics from './components/FinancialMetrics';
import RiskProfile from './components/RiskProfile';
import CrisisStressTest from './components/CrisisStressTest';
import FanChart from './components/FanChart';
import FundamentalCards from './components/FundamentalCards';
import BrokerGuide from './components/BrokerGuide';
import RollUpPicker from './components/RollUpPicker';
import CrisisSimulator from './components/CrisisSimulator';
import GoalPlanner from './components/GoalPlanner';
import AssetBattle from './components/AssetBattle';
import Academy from './components/Academy';
import BeginnerView from './components/BeginnerView';
import MobileNav from './components/MobileNav';
import InfoTooltip from './components/InfoTooltip';
import { ProSection, ProNav } from './components/ProSection';
import { getInsights, formatEuro, TONE } from './utils/insights';
import { Play, Loader2, Sparkles, SlidersHorizontal, AlertCircle, Target, ArrowRight, ShieldCheck, CheckCircle2, Star, Share2, Swords } from 'lucide-react';

const API_BASE = '';

// Basic-Modus: nur langfristige Haltedauern mit verständlichen Namen
const BASIC_TIMEFRAMES = [
  { key: '1 Jahr (Jahres-Trend)', label: '1 Jahr' },
  { key: '3 Jahre (Makro-Zyklus)', label: '3 Jahre' },
  { key: '5 Jahre (Vermögensaufbau)', label: '5 Jahre', hint: 'empfohlen' },
];

const PRO_SECTIONS = [
  { id: 'pro-signal', label: 'Signal' },
  { id: 'pro-chart', label: 'Chart & Muster' },
  { id: 'pro-projektion', label: 'Projektion' },
  { id: 'pro-risiko', label: 'Risiko' },
  { id: 'pro-krisen', label: 'Stresstest' },
  { id: 'pro-simulation', label: 'Simulation' },
  { id: 'pro-bewertung', label: 'Bewertung' },
  { id: 'pro-umsetzung', label: 'Umsetzung' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [experienceMode, setExperienceMode] = useState(() => {
    return localStorage.getItem('havn_experience_mode') || 'beginner';
  });

  // Theme-Bereinigung
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('havn_theme');
  }, []);

  const [ticker, setTicker] = useState('EUNL.DE');
  const [timeframe, setTimeframe] = useState('1 Jahr (Jahres-Trend)');
  const [invType, setInvType] = useState('Einmalanlage');
  const [sparplanFreq, setSparplanFreq] = useState('monatlich');
  const [kapital, setKapital] = useState(1000);
  const [startkapital, setStartkapital] = useState(0);

  // Watchlist & Favoriten
  const [favorites, setFavorites] = useState(() => getStoredFavorites());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  // Anonymer Besucher-Ping für interne Echtzeit-Statistik
  useEffect(() => {
    try {
      fetch(`${API_BASE}/api/analytics/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer || '' })
      }).catch(() => {});
    } catch (e) {}
  }, []);

  const handleToggleFavorite = (favTicker, favName) => {
    const sym = favTicker.toUpperCase();
    let updated;
    if (favorites.some(f => f.symbol.toUpperCase() === sym)) {
      updated = favorites.filter(f => f.symbol.toUpperCase() !== sym);
    } else {
      updated = [...favorites, { symbol: favTicker, name: favName || favTicker, category: 'Favorit' }];
    }
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  const isCurrentFavorite = favorites.some(
    f => f.symbol.toUpperCase() === ticker.toUpperCase()
  );

  const handleToggleMode = (newMode) => {
    setExperienceMode(newMode);
    localStorage.setItem('havn_experience_mode', newMode);
    if (newMode === 'beginner' && !BASIC_TIMEFRAMES.some(t => t.key === timeframe)) {
      setTimeframe('1 Jahr (Jahres-Trend)');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [presets, setPresets] = useState({});
  const [timeframes, setTimeframes] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAnalyzedParams, setLastAnalyzedParams] = useState(null);

  // Initial Presets & Timeframes laden
  useEffect(() => {
    async function initData() {
      try {
        const [resP, resT] = await Promise.all([
          fetch(`${API_BASE}/api/presets`),
          fetch(`${API_BASE}/api/timeframes`),
        ]);
        if (resP.ok) setPresets(await resP.json());
        if (resT.ok) setTimeframes(await resT.json());
      } catch (err) {
        console.warn("Backend noch nicht gestartet oder CORS:", err);
      }
    }
    initData();
  }, []);

  // Analyse ausführen
  const runAnalysis = async (customTicker) => {
    const targetTicker = customTicker || ticker;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: targetTicker,
          timeframe,
          investment_type: invType,
          sparplan_frequenz: sparplanFreq,
          kapital: Number(kapital) || 100,
          startkapital: Number(startkapital) || 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Fehler bei der Analyse (${res.status})`);
      }

      const result = await res.json();
      setData(result);
      setTicker(targetTicker);
      setLastAnalyzedParams(JSON.stringify({
        ticker: targetTicker,
        timeframe,
        invType,
        sparplanFreq,
        kapital: Number(kapital) || 100,
        startkapital: Number(startkapital) || 0
      }));
    } catch (err) {
      setError(err.message || 'Verbindung zum Backend fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Start direkt initiale Analyse für MSCI World laden
  useEffect(() => {
    runAnalysis('EUNL.DE');
  }, []);

  const handleSelectAsset = (selectedSymbol) => {
    setTicker(selectedSymbol);
    runAnalysis(selectedSymbol);
  };

  // Modul 1: Live Scaling der Berechnungen beim Schieben des Sliders (60 FPS Echtzeit-Feedback)
  const displayData = useMemo(() => {
    if (!data) return null;
    const baseKapital = Number(data.kapital_input) || 100;
    const currentKapital = Number(kapital) || 100;
    const baseStart = Number(data.startkapital_input) || 0;
    const currentStart = Number(startkapital) || 0;

    // Wenn Werte identisch sind, Original zurückgeben
    if (baseKapital === currentKapital && baseStart === currentStart) {
      return data;
    }

    // Proportionale Skalierung der Euro-Werte
    let scale = 1.0;
    if (invType === 'Einmalanlage') {
      scale = currentKapital / (baseKapital || 1);
    } else {
      if (baseStart === 0 && currentStart === 0) {
        scale = currentKapital / (baseKapital || 1);
      } else {
        const totalBase = baseStart + baseKapital * 12;
        const totalCurrent = currentStart + currentKapital * 12;
        scale = totalCurrent / (totalBase || 1);
      }
    }

    const mc = data.monte_carlo;
    if (!mc) return data;

    const scaledMonteCarlo = {
      ...mc,
      eingezahltes_kapital: invType === 'Einmalanlage' ? currentKapital : (mc.eingezahltes_kapital * scale),
      erwarteter_endwert: mc.erwarteter_endwert * scale,
      erwarteter_gewinn: mc.erwarteter_gewinn * scale,
      pessimistisch_endwert: (mc.pessimistisch_endwert || 0) * scale,
      optimistisch_endwert: (mc.optimistisch_endwert || 0) * scale,
      cvar_95_euro: (mc.cvar_95_euro || 0) * scale,
    };

    return {
      ...data,
      kapital_input: currentKapital,
      startkapital_input: currentStart,
      monte_carlo: scaledMonteCarlo
    };
  }, [data, kapital, startkapital, invType]);

  // Debounced Auto-Sync im Hintergrund (500ms nach dem letzten Schieben)
  useEffect(() => {
    if (!data || loading) return;
    const timer = setTimeout(() => {
      const currentParams = JSON.stringify({
        ticker,
        timeframe,
        invType,
        sparplanFreq,
        kapital: Number(kapital) || 100,
        startkapital: Number(startkapital) || 0
      });
      if (lastAnalyzedParams && lastAnalyzedParams !== currentParams) {
        runAnalysis();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [kapital, startkapital, timeframe, invType, sparplanFreq]);

  const timeframeKeys = Object.keys(timeframes).length > 0 
    ? Object.keys(timeframes)
    : ["3 Tage (Kurzfrist-Impuls)", "10 Tage (Kurzfrist-Trend)", "8 Wochen (Mittelfrist-Swing)", "1 Jahr (Jahres-Trend)", "3 Jahre (Makro-Zyklus)", "5 Jahre (Vermögensaufbau)"];

  const isBasic = experienceMode === 'beginner';
  const insights = useMemo(() => (displayData ? getInsights(displayData, invType) : null), [displayData, invType]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white pb-20 lg:pb-0">
      {/* Liquid-Glass Ambient-Hintergrund (macht die Glas-Transparenz sichtbar) */}
      <div className="havn-ambient" aria-hidden="true"><span /><span /></div>

      <Navbar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onReset={() => runAnalysis('EUNL.DE')} 
        experienceMode={experienceMode}
        onToggleMode={handleToggleMode}
        onOpenInstall={() => setShowInstallModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'crisis' && <CrisisSimulator initialAsset={ticker} />}
        {activeTab === 'goals' && <GoalPlanner />}
        {activeTab === 'battle' && (
          <AssetBattle 
            experienceMode={experienceMode} 
            initialAssetA={ticker}
            onAnalyzeAsset={handleSelectAsset} 
          />
        )}
        {activeTab === 'academy' && <Academy experienceMode={experienceMode} />}

        {activeTab === 'terminal' && (
          <div className="space-y-8 animate-fadeIn">
        
        {/* HERO, SUCHE & FAVORITEN-LEISTE */}
        <section className="space-y-4">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Sicherheit beim <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">Investieren</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Mathematische Wahrscheinlichkeiten, Krisen-Stresstests und Risikoprofile vor deinem ersten Trade.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSelectAsset={handleSelectAsset}
              presets={presets}
              currentTicker={ticker}
            />
          </div>

          {/* Modul 4: Watchlist & Favoriten */}
          <FavoritesBar
            currentTicker={ticker}
            onSelectAsset={handleSelectAsset}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

        {/* PARAMETER & STRATEGIE LEISTE */}
        <section className="relative rounded-3xl p-6 glass overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-300 uppercase tracking-wider relative z-10">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>{isBasic ? 'Deine Anlage' : 'Simulations-Parameter & Anlagestrategie'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end relative z-10">
            {/* Zeitraum */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {isBasic ? 'Wie lange willst du anlegen?' : 'Geplante Haltedauer'}
              </label>
              {isBasic ? (
                <div className="grid grid-cols-3 gap-1 glass-input p-1 rounded-xl">
                  {BASIC_TIMEFRAMES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTimeframe(t.key)}
                      className={`relative text-xs py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeframe === t.key ? 'liquid-glass-active text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                      {t.hint && timeframe !== t.key && (
                        <span className="absolute -top-2 -right-1 text-[8px] font-black uppercase px-1 rounded bg-emerald-400/90 text-slate-900">★</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm text-white cursor-pointer"
                >
                  {timeframeKeys.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Strategie */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Anlagestrategie
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInvType('Einmalanlage')}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    invType === 'Einmalanlage' 
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Einmalanlage
                </button>
                <button
                  type="button"
                  onClick={() => setInvType('Sparplan')}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    invType === 'Sparplan' 
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sparplan
                </button>
              </div>
            </div>

            {/* Modul 1: Live-Slider für Kapital / Sparrate */}
            {invType === 'Einmalanlage' ? (
              <div className="sm:col-span-2">
                <RollUpPicker
                  label="Geldeinsatz (Einmalanlage)"
                  value={kapital}
                  onChange={setKapital}
                />
              </div>
            ) : (
              <>
                <div>
                  <RollUpPicker
                    label="Startkapital"
                    value={startkapital}
                    onChange={setStartkapital}
                    presets={[0, 100, 250, 500, 1000, 2000, 3000, 5000, 10000, 20000, 50000]}
                  />
                </div>
                <div>
                  <RollUpPicker
                    label={`Sparrate (${sparplanFreq})`}
                    value={kapital}
                    onChange={setKapital}
                    presets={[25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000]}
                  />
                  <div className="flex justify-end mt-1">
                    <select
                      value={sparplanFreq}
                      onChange={(e) => setSparplanFreq(e.target.value)}
                      className="glass-input rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="monatlich">monatlich</option>
                      <option value="wöchentlich">wöchentlich</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Manueller Aktualisieren Button (falls gewünscht) */}
            {(() => {
              const currentParams = JSON.stringify({
                ticker,
                timeframe,
                invType,
                sparplanFreq,
                kapital: Number(kapital) || 100,
                startkapital: Number(startkapital) || 0
              });
              const isUpToDate = !loading && lastAnalyzedParams !== null && lastAnalyzedParams === currentParams;

              return (
                <div className={invType === 'Sparplan' ? 'sm:col-span-2 lg:col-span-4 mt-1' : 'sm:col-span-2 lg:col-span-4 mt-1'}>
                  <button
                    type="button"
                    onClick={() => runAnalysis()}
                    disabled={loading || isUpToDate}
                    className={`w-full h-11 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isUpToDate
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 active:scale-[0.99]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Berechne Quant-Modelle...</span>
                      </>
                    ) : isUpToDate ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Simulation synchronisiert</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Simulation jetzt aktualisieren</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        </section>

        {/* FEHLERMELDUNG */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <strong>Fehler: </strong>{error}
            </div>
          </div>
        )}

        {/* HAUPT-ANALYSEBEREICH */}
        {displayData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header: Wertpapiername, Kurs, Favoriten-Stern & Teilen-Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass shadow-xl">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {displayData.asset_info?.name || displayData.ticker}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono font-bold border border-white/10">
                    {displayData.ticker}
                  </span>

                  {/* Favoriten-Stern Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(displayData.ticker, displayData.asset_info?.name)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                      isCurrentFavorite
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.04] text-slate-400 hover:text-amber-400 border-white/10 hover:bg-white/[0.08]'
                    }`}
                    title={isCurrentFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isCurrentFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">{isCurrentFavorite ? 'Gemerkt' : 'Merken'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Typ: <span className="text-slate-300 font-medium">{displayData.asset_info?.typ || 'Wertpapier'}</span> • ISIN: <span className="font-mono text-slate-300">{displayData.asset_info?.isin || '–'}</span>
                </p>
              </div>

              {/* Kurs & Aktions-Buttons (Teilen & Duell) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 relative z-10">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Aktueller Kurs</div>
                  <div className="text-2xl font-black text-white font-mono">{displayData.current_price?.toFixed(2)} €</div>
                </div>

                {isBasic ? (
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center">
                      Schwankung
                      <InfoTooltip title="Schwankungsintensität" text={`Gibt an, wie stark dieses Wertpapier im Vergleich zum Weltmarkt ausschlägt. ${insights?.marketCompare || ''}.`} />
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${TONE[insights?.swing?.tone || 'sky'].soft}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${TONE[insights?.swing?.tone || 'sky'].dot}`} />
                        {insights?.swing?.label || 'Moderat'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center">
                      Markt-Beta
                      <InfoTooltip title="Markt-Beta (Vasicek Shrinkage)" text="Sensitivität gegenüber dem Weltmarkt (MSCI World = 1.0). Ein Beta von 1.2 bedeutet 20 % stärkere Marktschwankungen." />
                    </div>
                    <div className="text-2xl font-black text-sky-400 font-mono">{displayData.beta?.toFixed(2)}</div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Modul 6: Teilen-Button */}
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="p-2.5 rounded-2xl glass-chip hover:bg-white/10 text-sky-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Analyse-Report teilen"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden md:inline">Teilen</span>
                  </button>

                  {/* Modul 3: Duell-Shortcut */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('battle')}
                    className="p-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md"
                    title="Im Duell mit anderem Asset vergleichen"
                  >
                    <Swords className="w-4 h-4 text-indigo-400" />
                    <span className="hidden md:inline">Duell</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MODUS-ABHÄNGIGE ANSICHT: EINSTEIGER vs. PRO */}
            {isBasic ? (
              <BeginnerView
                data={displayData}
                invType={invType}
                sparplanFreq={sparplanFreq}
                onSwitchToPro={() => handleToggleMode('pro')}
                onNavigateToCrisis={() => {
                  setActiveTab('crisis');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="space-y-8 animate-fadeIn">
                {/* 3-Sekunden-Fazit für den schnellen Überblick im Pro-Modus */}
                <ExecutiveSummary data={displayData} invType={invType} />

                {/* Sticky Kapitelnavigation für schnelles Springen */}
                <ProNav sections={PRO_SECTIONS} />

                {/* 1. Signal & Trend-Banner */}
                <ProSection
                  id="pro-signal"
                  number={1}
                  title="Signal & Trend-Modell"
                  takeaway={insights ? `${insights.trend.text} Gesamtscore: ${displayData.chart_model?.score > 0 ? '+' : ''}${displayData.chart_model?.score ?? 0} %.` : ''}
                >
                  <SignalBanner chartModel={displayData.chart_model} />
                </ProSection>

                {/* 2. Realer Kursverlauf & Trendlinien (Liquid Glass & Harmonische Candlesticks) */}
                <ProSection
                  id="pro-chart"
                  number={2}
                  title="Kursverlauf & Technische Muster"
                  takeaway="Realer Kursverlauf mit Donchian-Kanälen, GD50/200 und harmonisierter Candlestick-Mustererkennung."
                >
                  <PriceChart 
                    history={displayData.chart_history} 
                    todayHistory={displayData.today_history} 
                    weekHistory={displayData.week_history} 
                    ticker={displayData.ticker} 
                    chartModel={displayData.chart_model} 
                  />
                </ProSection>

                {/* 3. Finanzmathematische Hochrechnung (mit Live-Slider-Werten) */}
                <ProSection
                  id="pro-projektion"
                  number={3}
                  title="Kapital-Projektion"
                  takeaway={insights ? `Erwarteter Endwert nach ${insights.horizon}: ${formatEuro(insights.scenarios.normal)} (erwartete Rendite +${(displayData.monte_carlo?.expected_return_pct ?? 0).toFixed(1)} %).` : ''}
                >
                  <FinancialMetrics 
                    monteCarlo={displayData.monte_carlo}
                    invType={displayData.investment_type}
                    sparplanFreq={displayData.sparplan_frequenz}
                  />
                </ProSection>

                {/* 4. Risikoprofil & Wahrscheinlichkeiten */}
                <ProSection
                  id="pro-risiko"
                  number={4}
                  title="Stochastisches Risikoprofil"
                  takeaway={insights ? `Gewinnquote: ${insights.winRate != null ? `${insights.winRate.toFixed(0)} %` : `${insights.probUp.toFixed(0)} %`} · Sortino-Ratio: ${insights.sortino.toFixed(2)} (Rendite relativ zum Abwärtsrisiko).` : ''}
                >
                  <RiskProfile
                    monteCarlo={displayData.monte_carlo}
                    rollingReturns={displayData.rolling_returns}
                    beta={displayData.beta}
                  />
                </ProSection>

                {/* 5. Historischer Krisen- & Stresstest */}
                <ProSection
                  id="pro-krisen"
                  number={5}
                  title="Krisen- & Stresstest"
                  takeaway={insights ? `Maximaler historischer Drawdown: −${insights.maxDd.toFixed(1)} %. ${displayData.crisis_model?.summary || ''}` : ''}
                >
                  <CrisisStressTest crisisModel={displayData.crisis_model} />
                </ProSection>

                {/* 6. Simulationsfächer (Merton Jump-Diffusion) */}
                <ProSection
                  id="pro-simulation"
                  number={6}
                  title="Merton Jump-Diffusion Fächer"
                  takeaway="5.000 Pfade mit Poisson-Sprungprozess zur realistischen Modellierung plötzlicher Kurssprünge."
                >
                  <FanChart 
                    paths={displayData.monte_carlo?.sample_paths} 
                    medianPath={displayData.monte_carlo?.median_path} 
                    ticker={displayData.ticker}
                  />
                </ProSection>

                {/* 7. Fundamentale Bewertung (KGV & Multiples) */}
                <ProSection
                  id="pro-bewertung"
                  number={7}
                  title="Fundamentale Bewertung"
                  takeaway={insights ? (insights.isEtf ? 'Breit gestreuter Index-Fonds – keine Einzelunternehmens-Bewertung nötig.' : `${displayData.fundamental?.valuation_status || 'Bewertung'}: ${displayData.fundamental?.summary || ''}`) : ''}
                >
                  <FundamentalCards fundamental={displayData.fundamental} />
                </ProSection>

                {/* 8. Broker-Leitfaden */}
                <ProSection
                  id="pro-umsetzung"
                  number={8}
                  title="Order-Leitfaden"
                  takeaway="Konkrete Kennnummern (WKN/ISIN) und Sparplan-Schritte für deutsche Broker."
                >
                  <BrokerGuide
                    assetInfo={displayData.asset_info}
                    invType={displayData.investment_type}
                    sparplanFreq={displayData.sparplan_frequenz}
                    kapital={displayData.kapital_input}
                  />
                </ProSection>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </main>

      {/* Modul 6: Teilen-Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={displayData}
        invType={invType}
        kapital={kapital}
        timeframe={timeframe}
      />

      {/* PWA App-Installationsbanner & iOS Walkthrough */}
      <InstallPrompt 
        forceShow={showInstallModal} 
        onCloseManual={() => setShowInstallModal(false)} 
      />

      {/* Modul: Rechtliches & Datenschutz */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />

      {/* Modul: Besucher- & Nutzungs-Statistiken */}
      <AnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
      />

      {/* Floating Mobile Navigation Bar */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* FOOTER & RECHTLICHER HINWEIS */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-3 mt-12 mb-16 lg:mb-0">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <p>
            <strong className="text-slate-300">HAVN</strong> — Dein sicherer Hafen für fundierte Investment-Entscheidungen. Entwickelt mit modernem Tailwind CSS & stochastischer Finanzmathematik.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer underline underline-offset-4"
            >
              Impressum & Rechtliches
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer underline underline-offset-4"
            >
              Datenschutz (DSGVO)
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setAnalyticsModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live-Statistiken</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            <strong className="text-slate-400">Rechtlicher Hinweis:</strong> HAVN stellt keine Anlageberatung im Sinne des WpHG dar. Alle Berechnungen basieren auf historischen Wahrscheinlichkeitsmodellen und Simulationen. Wertpapiere unterliegen Marktschwankungen bis hin zum Totalverlustrisiko. Investitionen erfolgen eigenverantwortlich über deinen Broker.
          </p>
        </div>
      </footer>
    </div>
  );
}
