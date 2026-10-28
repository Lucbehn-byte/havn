import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  Gauge,
  Activity,
  Sparkles,
  Sliders,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Percent,
  Crosshair
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function QISRadar({ qis = {}, ticker = '' }) {
  const [activeTab, setActiveTab] = useState('factors'); // 'factors' | 'vol_target' | 'regime'

  if (!qis || !qis.qis_score) {
    return null;
  }

  const {
    qis_score = 50,
    qis_badge = 'Neutral',
    qis_verdict = '',
    alpha_drift_annualized = 0,
    regime = {},
    factor_scores = {},
    factor_details = {},
    volatility_targeting = {},
    is_etf = false,
  } = qis;

  const weights = regime.weights || {
    value: 0.2,
    quality: 0.25,
    momentum: 0.2,
    sentiment: 0.15,
    low_vol: 0.2,
  };

  // Hilfsfunktion für Score-Farbe
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
    if (score >= 45) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    if (score >= 35) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (score) => {
    if (score >= 75) return 'from-emerald-500 to-teal-400';
    if (score >= 60) return 'from-teal-500 to-sky-400';
    if (score >= 45) return 'from-sky-500 to-indigo-400';
    if (score >= 35) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-600';
  };

  const factorsList = [
    {
      id: 'valuation',
      name: '1. Valuation (Value)',
      sub: 'KGV, Forward-KGV, Free-Cashflow-Yield, KBV',
      score: factor_scores.valuation ?? 50,
      weight: weights.value,
      details: factor_details.valuation || {},
      tooltip: 'Bewertet, ob das Wertpapier im Vergleich zu Cashflows, Gewinnen und Buchwert attraktiv gepreist ist.',
      rule: 'Höherer Score = Günstige Bewertung mit Sicherheitsmarge (Margin of Safety).'
    },
    {
      id: 'quality',
      name: '2. Quality & Financial Health',
      sub: 'ROE, Margen, Verschuldungsgrad, Altman Z-Score Proxy',
      score: factor_scores.quality ?? 50,
      weight: weights.quality,
      details: factor_details.quality || {},
      tooltip: 'Prüft Kapitalrenditen, Bilanzstabilität, Liquidität und Resistenz gegen Überschuldung und Insolvenzrisiken.',
      rule: '> 70 = Exzellente Bilanzfestigkeit und hohe Ertragskraft.'
    },
    {
      id: 'momentum',
      name: '3. Momentum & Trend Dynamics',
      sub: 'Carhart 12M-1M Residual Momentum, 6M-Trend, GD200-Abstand',
      score: factor_scores.momentum ?? 50,
      weight: weights.momentum,
      details: factor_details.momentum || {},
      tooltip: 'Misst die relative Stärke. Nutzt den akademischen 12M-1M-Momentum-Faktor (Carhart), der kurzfristige Übertreibungen eliminiert.',
      rule: '> 65 = Starker, nachhaltiger institutioneller Kapitalzufluss.'
    },
    {
      id: 'sentiment',
      name: '4. Analyst Sentiment & Revisions',
      sub: 'Wall-Street-Konsens, Kursziel-Upside, Coverage',
      score: factor_scores.sentiment ?? 50,
      weight: weights.sentiment,
      details: factor_details.sentiment || {},
      tooltip: 'Erfasst die aggregierte Stimmung professioneller Analystenhäuser sowie EPS-Prognoserevisionen.',
      rule: '> 60 = Positives Analysten-Momentum und Kurspotenzial.'
    },
    {
      id: 'low_vol',
      name: '5. Low Volatility & Downside Resilience',
      sub: 'Realisierte 1J-Vola, Max Drawdown Historie, Beta-Resilienz',
      score: factor_scores.low_vol ?? 50,
      weight: weights.low_vol,
      details: factor_details.low_vol || {},
      tooltip: 'Nutzt die Low-Volatility-Anomalie: Aktien mit stabilerem Kursverlauf liefern langfristig oft überlegene risikobereinigte Renditen.',
      rule: '> 70 = Überdurchschnittlicher Schutz vor heftigen Marktschocks.'
    }
  ];

  return (
    <div className="glass rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6">
      {/* Header mit GSAM QIS Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-teal-500/20 border border-sky-400/30 text-sky-300 shadow-sm mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>QIS Alpha-Radar • Goldman Sachs Standard</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Quantitative Investment Strategies (QIS)</span>
            <InfoTooltip
              title="Goldman Sachs QIS Framework"
              text="Das QIS-Modell von Goldman Sachs Asset Management zerlegt Wertpapiere in 5 unabhängige Alpha-Faktoren und gewichtet sie dynamisch nach dem aktuellen Marktzyklus."
              rule="Score > 60 signalisiert überdurchschnittliche risikobereinigte Ertragschancen."
            />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Systematische 5-Faktoren-Zerlegung &amp; dynamische Risikobudgetierung (Volatility Targeting).
          </p>
        </div>

        {/* Tab-Wechsler */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/10 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'factors'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5 Faktoren
          </button>
          <button
            onClick={() => setActiveTab('vol_target')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'vol_target'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Volatility Targeting
          </button>
          <button
            onClick={() => setActiveTab('regime')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'regime'
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Markt-Regime
          </button>
        </div>
      </div>

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* QIS Composite Score */}
        <div className="p-4 rounded-2xl glass-inset border border-white/10 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">QIS Gesamt-Score</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{qis_score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getScoreColor(qis_score)}`}>
              {qis_badge}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
            <span>Multi-Faktor Alpha:</span>
            <span className={`font-mono font-bold ${alpha_drift_annualized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {alpha_drift_annualized >= 0 ? '+' : ''}{alpha_drift_annualized.toFixed(2)} % p.a.
            </span>
          </div>
        </div>

        {/* Aktives Markt-Regime */}
        <div className="p-4 rounded-2xl glass-inset border border-white/10 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Aktives Markt-Regime</span>
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {regime.regime_name || 'Expansion'}
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
            {regime.description || 'Stabiles Marktumfeld. Momentum und Qualität werden bevorzugt.'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
            <span>Vola-Verhältnis (30T/1J):</span>
            <span className="font-mono text-slate-200 font-bold">
              {regime.vola_ratio ? `${regime.vola_ratio}x` : '1.0x'}
            </span>
          </div>
        </div>

        {/* Volatility Targeting Status */}
        <div className="p-4 rounded-2xl glass-inset border border-white/10 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">GSAM Vol-Targeting</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-300">
              {volatility_targeting.current_allocation_percent ?? 100} %
            </span>
            <span className="text-xs text-slate-400">Quote</span>
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            {volatility_targeting.allocation_recommendation || 'Voll investiert'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
            <span>Zielvolatilität:</span>
            <span className="font-mono text-indigo-300 font-bold">
              {volatility_targeting.target_vol_percent ?? 12.0} % p.a.
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: DIE 5 QIS-FAKTOREN */}
      {activeTab === 'factors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Faktorgewichtung im aktuellen Regime</span>
            <span className="italic text-[11px]">Normierte Punktzahl (0–100)</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {factorsList.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl glass-inset border border-white/5 hover:border-white/15 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">{f.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      Gewicht: {Math.round(f.weight * 100)} %
                    </span>
                    <InfoTooltip title={f.name} text={f.tooltip} rule={f.rule} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{f.sub}</span>
                    <span className="font-mono font-black text-sm text-white px-2.5 py-0.5 rounded-lg bg-slate-900 border border-white/10">
                      {f.score}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor(f.score)} transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                  />
                </div>

                {/* Submetrics Pills */}
                {Object.keys(f.details).length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {Object.entries(f.details).map(([key, val]) => (
                      <div
                        key={key}
                        className="px-2.5 py-1 rounded-lg bg-slate-950/50 border border-white/5 text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="text-slate-400">{key}:</span>
                        <strong className="text-white font-medium">{val}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VOLATILITY TARGETING SIMULATOR */}
      {activeTab === 'vol_target' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-inset border border-indigo-500/20 bg-indigo-950/20 space-y-2">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Goldman Sachs Volatility Targeting Prinzip</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Statt stur zu 100 % investiert zu bleiben (klassisches Buy &amp; Hold), drosselt ein institutioneller QIS-Fonds die Quote automatisch, sobald die Marktschwankungen die Zielvolatilität ({volatility_targeting.target_vol_percent ?? 12} %) übersteigen. Beruhigt sich der Markt, wird die Allokation wieder auf 100 % hochgefahren.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Klassisches Buy & Hold */}
            <div className="p-4 rounded-2xl glass-inset border border-white/10 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Klassisches Buy &amp; Hold</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">100% Statisch</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Realisierte Vola:</span>
                  <span className="font-mono text-slate-200 font-bold">{volatility_targeting.realized_vol_raw ?? '–'} %</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Sharpe Ratio:</span>
                  <span className="font-mono text-slate-200 font-bold">{volatility_targeting.sharpe_buy_hold ?? '–'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Maximaler Drawdown:</span>
                  <span className="font-mono text-rose-400 font-bold">{volatility_targeting.max_dd_buy_hold ?? '–'} %</span>
                </div>
              </div>
            </div>

            {/* QIS Dynamic Volatility Targeted */}
            <div className="p-4 rounded-2xl glass-inset border border-indigo-400/30 bg-gradient-to-br from-indigo-950/30 to-slate-950/60 space-y-3 shadow-lg shadow-indigo-950/40">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                <span>QIS Volatility Targeted (GSAM)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold">
                  {volatility_targeting.current_allocation_percent ?? 100}% Dynamisch
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Gesteuerte Vola:</span>
                  <span className="font-mono text-emerald-400 font-bold">{volatility_targeting.realized_vol_targeted ?? '–'} %</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Sharpe Ratio (Risikoadjustiert):</span>
                  <span className="font-mono text-emerald-400 font-bold">{volatility_targeting.sharpe_vol_targeted ?? '–'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Gedämpfter Drawdown:</span>
                  <span className="font-mono text-emerald-300 font-bold">{volatility_targeting.max_dd_vol_targeted ?? '–'} %</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>Risikoreduktion durch Vol-Targeting:</span>
            </span>
            <span className="font-mono font-bold text-teal-400">
              −{volatility_targeting.vol_reduction_percent ?? 0} % Volatilitätsschock
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: MARKT-REGIME DETAILS */}
      {activeTab === 'regime' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-inset border border-teal-500/30 bg-teal-950/15 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <h4 className="text-sm font-bold text-teal-300">
                Aktiver Makro-Zyklus: {regime.regime_name || 'Expansion'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {regime.description}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aktive Faktorgewichtungen in dieser Phase:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-3 rounded-xl glass-inset border border-white/5 text-center space-y-1">
                <div className="text-[10px] text-slate-400">Momentum</div>
                <div className="font-mono font-bold text-white">{Math.round((weights.momentum || 0) * 100)} %</div>
              </div>
              <div className="p-3 rounded-xl glass-inset border border-white/5 text-center space-y-1">
                <div className="text-[10px] text-slate-400">Qualität</div>
                <div className="font-mono font-bold text-white">{Math.round((weights.quality || 0) * 100)} %</div>
              </div>
              <div className="p-3 rounded-xl glass-inset border border-white/5 text-center space-y-1">
                <div className="text-[10px] text-slate-400">Value</div>
                <div className="font-mono font-bold text-white">{Math.round((weights.value || 0) * 100)} %</div>
              </div>
              <div className="p-3 rounded-xl glass-inset border border-white/5 text-center space-y-1">
                <div className="text-[10px] text-slate-400">Sentiment</div>
                <div className="font-mono font-bold text-white">{Math.round((weights.sentiment || 0) * 100)} %</div>
              </div>
              <div className="p-3 rounded-xl glass-inset border border-white/5 text-center space-y-1">
                <div className="text-[10px] text-slate-400">Low Vol</div>
                <div className="font-mono font-bold text-white">{Math.round((weights.low_vol || 0) * 100)} %</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fazit Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-white/10 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-white">QIS-Einschätzung für {ticker}:</div>
          <p className="text-slate-300 leading-relaxed">{qis_verdict}</p>
        </div>
      </div>
    </div>
  );
}
