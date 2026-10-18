import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
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
import { Play, Loader2, Sparkles, SlidersHorizontal, AlertCircle, Target, ArrowRight, ShieldCheck } from 'lucide-react';

const API_BASE = '';

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [experienceMode, setExperienceMode] = useState(() => {
    return localStorage.getItem('havn_experience_mode') || 'beginner';
  });
  const [ticker, setTicker] = useState('EUNL.DE');
  const [timeframe, setTimeframe] = useState('1 Jahr (Jahres-Trend)');
  const [invType, setInvType] = useState('Einmalanlage');
  const [sparplanFreq, setSparplanFreq] = useState('monatlich');
  const [kapital, setKapital] = useState(1000);
  const [startkapital, setStartkapital] = useState(0);

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
        {activeTab === 'battle' && <AssetBattle experienceMode={experienceMode} />}
        {activeTab === 'academy' && <Academy experienceMode={experienceMode} />}

        {activeTab === 'terminal' && (
          <div className="space-y-8 animate-fadeIn">
        
        {/* HERO & SUCHE */}
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
        </section>

        {/* PARAMETER & STRATEGIE LEISTE */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 border border-slate-700/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInvType('Einmalanlage')}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    invType === 'Einmalanlage' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Einmalanlage
                </button>
                <button
                  type="button"
                  onClick={() => setInvType('Sparplan')}
                  className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    invType === 'Sparplan' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sparplan
                </button>
              </div>
            </div>

            {/* Kapital / Sparrate & Geldeinsatz mit Roll-Up Picker */}
            {invType === 'Einmalanlage' ? (
              <div>
                <RollUpPicker
                  label="Geldeinsatz"
                  value={kapital}
                  onChange={setKapital}
                />
              </div>
            ) : (
              <>
                <div>
                  <RollUpPicker
                    label="Geldeinsatz (Startkapital)"
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
                      className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                    >
                      <option value="monatlich">monatlich</option>
                      <option value="wöchentlich">wöchentlich</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Start Button */}
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
                <div className={invType === 'Sparplan' ? 'sm:col-span-2 lg:col-span-4 mt-2' : ''}>
                  <button
                    type="button"
                    onClick={() => runAnalysis()}
                    disabled={loading || isUpToDate}
                    className={`w-full h-11 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
                      isUpToDate
                        ? 'bg-slate-900 border border-sky-900/60 text-sky-400/80 shadow-none cursor-default'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Berechne 5.000 Pfade...</span>
                      </>
                    ) : isUpToDate ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        <span>Analyse aktuell</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Analyse starten</span>
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
        {data && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header: Wertpapiername & aktueller Kurs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {data.asset_info?.name || data.ticker}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono font-bold">
                    {data.ticker}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Typ: <span className="text-slate-300">{data.asset_info?.typ || 'Wertpapier'}</span> • ISIN: <span className="font-mono text-slate-300">{data.asset_info?.isin || '–'}</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Aktueller Kurs</div>
                  <div className="text-2xl font-black text-white font-mono">{data.current_price?.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Markt-Beta</div>
                  <div className="text-2xl font-black text-sky-400 font-mono">{data.beta?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* MODUS-ABHÄNGIGE ANSICHT: EINSTEIGER vs. PRO */}
            {experienceMode === 'beginner' ? (
              <BeginnerView
                data={data}
                invType={invType}
                sparplanFreq={sparplanFreq}
                onSwitchToPro={() => handleToggleMode('pro')}
              />
            ) : (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. Signal & Trend-Banner */}
                <SignalBanner chartModel={data.chart_model} />

                {/* 2. Realer Kursverlauf & Trendlinien (Letzte 1,5 Jahre) */}
                <PriceChart history={data.chart_history} ticker={data.ticker} />

                {/* 3. Finanzmathematische Hochrechnung */}
                <FinancialMetrics 
                  monteCarlo={data.monte_carlo}
                  invType={data.investment_type}
                  sparplanFreq={data.sparplan_frequenz}
                />

                {/* 4. Risikoprofil & Wahrscheinlichkeiten */}
                <RiskProfile
                  monteCarlo={data.monte_carlo}
                  rollingReturns={data.rolling_returns}
                  beta={data.beta}
                />

                {/* 5. Historischer Krisen- & Stresstest */}
                <CrisisStressTest crisisModel={data.crisis_model} />

                {/* 6. Simulationsfächer (Merton Jump-Diffusion) */}
                <FanChart 
                  paths={data.monte_carlo?.sample_paths} 
                  medianPath={data.monte_carlo?.median_path} 
                />

                {/* 7. Fundamentale Bewertung (KGV & Multiples) */}
                <FundamentalCards fundamental={data.fundamental} />

                {/* 8. Broker-Leitfaden */}
                <BrokerGuide
                  assetInfo={data.asset_info}
                  invType={data.investment_type}
                  sparplanFreq={data.sparplan_frequenz}
                  kapital={data.kapital_input}
                />
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </main>

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
