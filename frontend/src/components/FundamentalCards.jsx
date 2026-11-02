import React, { useState } from 'react';
import {
  Landmark, Target, Users, TrendingUp, Sparkles, Compass,
  ShieldCheck, Scale, CheckCircle2, XCircle
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function FundamentalCards({ fundamental = {}, currentPrice = 0 }) {
  const isEtf = fundamental.is_etf;
  const status = fundamental.valuation_status || '–';
  const summary = fundamental.summary || '';
  const metrics = fundamental.metrics || {};
  const driftAdj = fundamental.drift_adjustment || 0;
  const consensus = fundamental.analyst_consensus;
  const dcf = fundamental.dcf_valuation || {};
  const health = fundamental.financial_health || {};

  const metricEntries = Object.entries(metrics);
  const curPx = currentPrice > 0 ? currentPrice : null;

  // Margin of safety color
  const marginPct = dcf.margin_of_safety_pct;
  const marginTone =
    marginPct >= 10 ? 'emerald' :
    marginPct >= 0 ? 'sky' :
    marginPct >= -12 ? 'amber' : 'rose';

  const marginClasses = {
    emerald: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    sky: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
    amber: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    rose: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
  }[marginTone] || 'bg-slate-500/15 border-slate-400/30 text-slate-300';

  return (
    <div className="glass rounded-2xl p-5 shadow-xl space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            <span>Institutionelle Bewertung & Bilanzschutz</span>
            <InfoTooltip
              title="Fundamentale Bewertung"
              text="Kombiniert 3-Szenarien DCF-Fair-Value (Diskontierter Cashflow), den 9-Punkte Piotroski F-Score für Bilanzstabilität und den aggregierten Wall-Street-Analystenkonsens."
            />
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEtf
              ? 'Welt-ETF • Diversifizierter Aktienkorb ohne Einzelpleiterisiko'
              : 'DCF Fair-Value • Piotroski Bilanz-Shield • Sloan-Accrual Test • Wall-Street Konsens'}
          </p>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-bold self-start sm:self-auto">
          {status}
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {summary}
      </p>

      {/* 2. DCF Fair-Value 3-Szenarien Trichter (nur bei Einzelaktien mit DCF) */}
      {dcf.is_applicable && dcf.base_fair_value && (
        <div className="glass-inset rounded-2xl p-4 space-y-4 border border-indigo-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>DCF Fair-Value Modell (3 Szenarien)</span>
                  <InfoTooltip
                    title="Discounted Cashflow (DCF)"
                    text="Das Standardverfahren institutioneller Investoren. Diskontiert zukünftige Free Cashflows auf den heutigen Barwert unter Einbezug von Analystenkonsens und WACC-Kapitalkosten."
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  {dcf.verdict}
                </div>
              </div>
            </div>

            {marginPct != null && (
              <div className={`text-xs px-3 py-1 rounded-xl border font-mono font-bold self-start sm:self-auto ${marginClasses}`}>
                {marginPct > 0 ? `+${marginPct}% Sicherheitsmarge` : `${marginPct}% Aufschlag`}
              </div>
            )}
          </div>

          {/* Szenarien-Balken / Funnel */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <span>🐻 Bär:</span> <strong className="text-white">{dcf.bear_fair_value} €</strong>
              </span>
              <span className="flex items-center gap-1 text-indigo-300">
                <span>🎯 Basis:</span> <strong className="text-indigo-200">{dcf.base_fair_value} €</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span>🐂 Bulle:</span> <strong className="text-emerald-300">{dcf.bull_fair_value} €</strong>
              </span>
            </div>

            {/* Visueller Track */}
            <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5 flex">
              <div className="h-full rounded-l-full bg-slate-600/40 w-1/3" title="Bären-Szenario" />
              <div className="h-full bg-indigo-500/40 w-1/3 border-x border-indigo-400/40" title="Basis-Szenario" />
              <div className="h-full rounded-r-full bg-emerald-500/40 w-1/3" title="Bullen-Szenario" />
            </div>

            {curPx && (
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Aktueller Börsenkurs: <strong className="text-white font-mono">{curPx} €</strong></span>
                <span className="text-slate-500">
                  {curPx < dcf.base_fair_value
                    ? `Notiert unter fairem Wert (${dcf.base_fair_value - curPx > 0 ? Math.round(dcf.base_fair_value - curPx) : 0} € Puffer)`
                    : `Notiert über fairem Basiswert (+${Math.round(curPx - dcf.base_fair_value)} € Aufschlag)`}
                </span>
              </div>
            )}
          </div>

          {/* Parameter Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="glass-inset rounded-xl p-2.5">
              <span className="text-slate-400 text-[10px] block">FCF je Aktie</span>
              <strong className="text-white font-mono text-xs">
                {dcf.parameters?.fcf_per_share ? `${dcf.parameters.fcf_per_share} €` : '–'}
              </strong>
            </div>
            <div className="glass-inset rounded-xl p-2.5">
              <span className="text-slate-400 text-[10px] block">Basis-Wachstum</span>
              <strong className="text-white font-mono text-xs">
                {dcf.parameters?.base_growth_pct ? `+${dcf.parameters.base_growth_pct} % p.a.` : '–'}
              </strong>
            </div>
            <div className="glass-inset rounded-xl p-2.5">
              <span className="text-slate-400 text-[10px] block">Diskontzins (WACC)</span>
              <strong className="text-white font-mono text-xs">
                {dcf.parameters?.discount_rate_pct ? `${dcf.parameters.discount_rate_pct} %` : '9.0 %'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Piotroski F-Score & Sloan Accruals Shield (nur Einzelaktien) */}
      {health.is_applicable && health.score != null && (
        <div className="glass-inset rounded-2xl p-4 space-y-3.5 border border-emerald-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Piotroski F-Score Bilanzschutz</span>
                  <InfoTooltip
                    title="Piotroski 9-Punkte-Score"
                    text="Von Stanford-Professor Joseph Piotroski entwickeltes Modell zur Bilanzbonität. Untersucht Profitabilität, Schuldenstand, Liquidität und operative Margen (0 bis 9 Punkte)."
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  {health.status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-xs px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{health.score} / {health.max_score} Punkte</span>
              </div>
            </div>
          </div>

          {/* Sloan-Accrual Cashflow-Qualität Pill */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between gap-2">
            <span className="text-slate-400 text-[11px]">Sloan Accruals Cashflow-Test:</span>
            <span className="text-emerald-300 font-bold text-[11px] truncate text-right">
              {health.cashflow_quality}
            </span>
          </div>

          {/* Checklist Toggle / Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Rentabilität', 'Solvenz', 'Effizienz'].map((cat) => {
                const items = (health.checklist || []).filter(c => c.category === cat);
                const passedCount = items.filter(c => c.passed).length;
                return (
                  <div key={cat} className="glass-inset rounded-xl p-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-emerald-300 font-mono">{passedCount}/{items.length}</span>
                    </div>
                    <div className="space-y-1">
                      {items.map(it => (
                        <div key={it.id} className="flex items-center gap-1.5 text-[10px]">
                          {it.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          <span className={it.passed ? 'text-slate-300 truncate' : 'text-slate-500 truncate'} title={it.hint}>
                            {it.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ETF Info Banner */}
      {isEtf && (
        <div className="glass-inset rounded-2xl p-4 border border-sky-500/20 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-white">
              Vollständiger Bilanzschutz durch Diversifikation (ETF)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Als Sondervermögen bündelt dieser ETF hunderte globale Unternehmen. Es existiert kein individuelles Insolvenz- oder Bewertungsrisiko einer Einzelfirma. Der Fonds notiert zu jedem Zeitpunkt direkt zum Nettoinventarwert (NAV) der enthaltenen Aktien.
            </p>
          </div>
        </div>
      )}

      {/* 4. Wall-Street Analystenkonsens */}
      {consensus && (consensus.opinions_count > 0 || consensus.target_median_price) && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-950/60 to-slate-900/40 border border-indigo-900/40 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Institutioneller Wall-Street-Konsens</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-900/40 text-indigo-200 border border-indigo-700/50 font-semibold">
              {consensus.recommendation}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {/* Median Kursziel */}
            {consensus.target_median_price && (
              <div className="glass-inset rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-sky-400" />
                  <span>Median-Kursziel</span>
                </div>
                <div className="text-sm font-black font-mono text-white mt-1">
                  {consensus.target_median_price} €
                </div>
                {consensus.upside_pct != null && (
                  <div className={`text-[10px] font-bold mt-0.5 ${consensus.upside_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {consensus.upside_pct >= 0 ? `+${consensus.upside_pct}%` : `${consensus.upside_pct}%`} Kurspotenzial
                  </div>
                )}
              </div>
            )}

            {/* Analystenanzahl */}
            <div className="glass-inset rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                <span>Analysten-Stimmen</span>
              </div>
              <div className="text-sm font-black font-mono text-white mt-1">
                {consensus.opinions_count} Experten
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Aggregierter Konsens
              </div>
            </div>

            {/* Forward-EPS Wachstum */}
            {consensus.forward_eps_growth_pct != null && (
              <div className="glass-inset rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Gewinnwachstum je Aktie</span>
                  <InfoTooltip
                    title="Gewinnwachstum (EPS)"
                    text="Erwartetes jährliches Wachstum des Gewinns je Aktie (Earnings per Share) laut Analystenprognosen."
                  />
                </div>
                <div className={`text-sm font-black font-mono mt-1 ${consensus.forward_eps_growth_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {consensus.forward_eps_growth_pct >= 0 ? `+${consensus.forward_eps_growth_pct}%` : `${consensus.forward_eps_growth_pct}%`}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {consensus.forward_eps ? `Ziel: ${consensus.forward_eps} € je Aktie` : 'Erwartetes Wachstum'}
                </div>
              </div>
            )}

            {/* KGV-Mean-Reversion Status */}
            <div className="glass-inset rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Bewertungseffekt</span>
                <InfoTooltip
                  title="KGV-Bewertungseffekt"
                  text="Berücksichtigt die Tendenz der Börse, extreme Übertreibungen über 3 bis 5 Jahre wieder zum fairen Mittelwert (Mean Reversion) zurückzuführen."
                />
              </div>
              <div className={`text-sm font-black font-mono mt-1 ${driftAdj >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {driftAdj > 0 ? `+${(driftAdj * 100).toFixed(1)}%` : `${(driftAdj * 100).toFixed(1)}%`} p.a.
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                KGV-Anpassung
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Metriken-Grid */}
      {metricEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricEntries.map(([k, v], idx) => (
            <div key={idx} className="glass-inset rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-medium truncate">{k}</div>
              <div className="text-sm font-bold text-white font-mono mt-1 truncate">{v}</div>
            </div>
          ))}
        </div>
      )}

      {driftAdj !== 0 && !consensus && (
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>
            Bewertungseffekt auf die 3–5 Jahres-Simulation: 
            <strong className={driftAdj > 0 ? "text-emerald-400" : "text-amber-400"}> {driftAdj > 0 ? `+${(driftAdj * 100).toFixed(2)}` : (driftAdj * 100).toFixed(2)} % p.a.</strong>
          </span>
        </div>
      )}
    </div>
  );
}
