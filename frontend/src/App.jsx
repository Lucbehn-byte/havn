import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import FavoritesBar, { getStoredFavorites, saveStoredFavorites } from './components/FavoritesBar';
import ExecutiveSummary from './components/ExecutiveSummary';
import ShareModal from './components/ShareModal';
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
import { Play, Loader2, Sparkles, SlidersHorizontal, AlertCircle, Target, ArrowRight, ShieldCheck, CheckCircle2, Star, Share2, Swords } from 'lucide-react';

const API_BASE = '';

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

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white pb-20 lg:pb-0">
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onReset={() => runAnalysis('EUNL.DE')} 
        experienceMode={experienceMode}
        onToggleMode={handleToggleMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'crisis' && <CrisisSimulator />}
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
        <section className="relative rounded-3xl p-6 shadow-2xl backdrop-blur-2xl bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/85 border border-white/[0.12] overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>Simulations-Parameter & Anlagestrategie</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Zeitraum */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Geplante Haltedauer
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {timeframeKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
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
                      className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/[0.12] shadow-xl">
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
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Aktueller Kurs</div>
                  <div className="text-2xl font-black text-white font-mono">{displayData.current_price?.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Markt-Beta</div>
                  <div className="text-2xl font-black text-sky-400 font-mono">{displayData.beta?.toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Modul 6: Teilen-Button */}
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-sky-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md"
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

            {/* Modul 2: Das 3-Sekunden-Fazit (Executive Summary) */}
            <ExecutiveSummary data={displayData} invType={invType} />

            {/* MODUS-ABHÄNGIGE ANSICHT: EINSTEIGER vs. PRO */}
            {experienceMode === 'beginner' ? (
              <BeginnerView
                data={displayData}
                invType={invType}
                sparplanFreq={sparplanFreq}
                onSwitchToPro={() => handleToggleMode('pro')}
              />
            ) : (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. Signal & Trend-Banner */}
                <SignalBanner chartModel={displayData.chart_model} />

                {/* 2. Realer Kursverlauf & Trendlinien (Liquid Glass & Harmonische Candlesticks) */}
                <PriceChart 
                  history={displayData.chart_history} 
                  todayHistory={displayData.today_history} 
                  weekHistory={displayData.week_history} 
                  ticker={displayData.ticker} 
                  chartModel={displayData.chart_model} 
                />

                {/* 3. Finanzmathematische Hochrechnung (mit Live-Slider-Werten) */}
                <FinancialMetrics 
                  monteCarlo={displayData.monte_carlo}
                  invType={displayData.investment_type}
                  sparplanFreq={displayData.sparplan_frequenz}
                />

                {/* 4. Risikoprofil & Wahrscheinlichkeiten */}
                <RiskProfile
                  monteCarlo={displayData.monte_carlo}
                  rollingReturns={displayData.rolling_returns}
                  beta={displayData.beta}
                />

                {/* 5. Historischer Krisen- & Stresstest */}
                <CrisisStressTest crisisModel={displayData.crisis_model} />

                {/* 6. Simulationsfächer (Merton Jump-Diffusion) */}
                <FanChart 
                  paths={displayData.monte_carlo?.sample_paths} 
                  medianPath={displayData.monte_carlo?.median_path} 
                  ticker={displayData.ticker}
                />

                {/* 7. Fundamentale Bewertung (KGV & Multiples) */}
                <FundamentalCards fundamental={displayData.fundamental} />

                {/* 8. Broker-Leitfaden */}
                <BrokerGuide
                  assetInfo={displayData.asset_info}
                  invType={displayData.investment_type}
                  sparplanFreq={displayData.sparplan_frequenz}
                  kapital={displayData.kapital_input}
                />
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

      {/* Floating Mobile Navigation Bar */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* FOOTER & RECHTLICHER HINWEIS */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2 mt-12 mb-16 lg:mb-0">
        <div className="max-w-4xl mx-auto px-4">
          <p>
            <strong className="text-slate-300">HAVN</strong> — Dein sicherer Hafen für fundierte Investment-Entscheidungen. Entwickelt mit modernem Tailwind CSS & stochastischer Finanzmathematik.
          </p>
          <p className="text-[11px] text-slate-600 mt-2">
            <strong className="text-slate-400">Rechtlicher Hinweis:</strong> HAVN stellt keine Anlageberatung im Sinne des WpHG dar. Alle Berechnungen basieren auf historischen Wahrscheinlichkeitsmodellen und Simulationen. Wertpapiere unterliegen Marktschwankungen bis hin zum Totalverlustrisiko. Investitionen erfolgen eigenverantwortlich über deinen Broker.
          </p>
        </div>
      </footer>
    </div>
  );
}
