import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Sparkles, CheckCircle2, Flame, ArrowUpRight, Award, Compass, HeartHandshake } from 'lucide-react';

export default function ExecutiveSummary({ data = {}, invType = 'Sparplan' }) {
  if (!data || !data.ticker) return null;

  const ticker = data.ticker;
  const assetName = data.asset_info?.name || ticker;
  const isEtf = data.fundamental?.is_etf || data.asset_info?.typ?.toLowerCase().includes('etf') || ticker.includes('.DE');

  const chartModel = data.chart_model || {};
  const chartScore = chartModel.score ?? 0;
  const mc = data.monte_carlo || {};
  const probUp = mc.prob_up ?? 70;
  const sortino = mc.sortino_ratio ?? 1.0;
  const maxDd = data.crisis_model?.max_drawdown_all ?? 40;
  const beta = data.beta ?? 1.0;
  const rsi = chartModel.indicators?.['RSI (14 Tage)'] ?? 50;

  // 1. Sparplan-Eignung Score (0 bis 100)
  let sparplanScore = 75;
  if (isEtf) {
    sparplanScore = Math.min(98, Math.max(88, Math.round(92 + (probUp - 70) * 0.2)));
  } else {
    // Einzelaktie
    if (beta <= 1.2 && sortino > 1.0) sparplanScore = 84;
    else if (beta > 1.5 || maxDd > 60) sparplanScore = 68;
    else sparplanScore = 76;
  }

  let sparplanLabel = "Exzellent (Top-Basiswert)";
  let sparplanColor = "emerald";
  if (sparplanScore < 70) {
    sparplanLabel = "Chancenorientiert (Höhere Vola)";
    sparplanColor = "amber";
  } else if (sparplanScore < 85) {
    sparplanLabel = "Sehr solide (Qualität)";
    sparplanColor = "sky";
  }

  // 2. Timing-Risiko für Einmalkauf (Ampel)
  let timingStatus = "Moderat (Gestaffelt einsteigen)";
  let timingType = "warning"; // success | warning | danger
  let timingDesc = "Aktie befindet sich in einer Konsolidierungsphase. Gestaffelter Kauf empfehlenswert.";

  if (rsi > 72) {
    timingStatus = "Erhöhtes Korrekturrisiko";
    timingType = "danger";
    timingDesc = "Technisch überkauft (RSI > 70) – kurzfristige Rücksetzer sind statistisch wahrscheinlich.";
  } else if (chartScore > 20 && rsi < 65) {
    timingStatus = "Günstiger Einstiegs-Trend";
    timingType = "success";
    timingDesc = "Aufwärtstrend intakt mit gesunder Dynamik und solidem Momentum.";
  } else if (chartScore < -20) {
    timingStatus = "Abwärtsdruck aktiv";
    timingType = "danger";
    timingDesc = "Kurs notiert unter wichtigen Durchschnitten. Nur antizyklisch oder per Sparplan einsteigen.";
  }

  // 3. Krisen-Resilienz
  let krisenLabel = "Ausgewogen (Marktüblich)";
  let krisenColor = "sky";
  if (maxDd <= 30) {
    krisenLabel = "Hohe Stabilität (Defensiv)";
    krisenColor = "emerald";
  } else if (maxDd > 60 || beta > 1.6) {
    krisenLabel = "Schwankungsintensiv (Offensiv)";
    krisenColor = "amber";
  }

  // 4. Klartext-Handlungsempfehlung
  let recommendationText = "";
  if (invType === 'Sparplan') {
    if (isEtf) {
      recommendationText = `Hervorragender Vermögensaufbau-Favorit: Durch breite Streuung und den Cost-Average-Effekt werden Marktschwankungen optimal geglättet. Sparplan einfach automatisiert durchlaufen lassen.`;
    } else {
      recommendationText = `Solide Beimischung für den Sparplan: Kursrücksetzer werden automatisch zum günstigen Nachkauf genutzt. Zur Risikostreuung idealerweise mit einem Welt-ETF kombinieren.`;
    }
  } else {
    if (timingType === 'success') {
      recommendationText = `Attraktives Setup für Einmalkäufe: Der übergeordnete Trend stützt die Kursentwicklung. Zur Absicherung kann dennoch ein Einstieg in 2–3 Tranchen sinnvoll sein.`;
    } else if (timingType === 'danger') {
      recommendationText = `Erhöhtes Timing-Risiko bei Einmalkauf: Warten auf eine Konsolidierung oder Staffelung über mehrere Wochen reduziert das Einstiegsrisiko deutlich.`;
    } else {
      recommendationText = `Solides Marktumfeld: Das Chance-Risiko-Verhältnis ist ausgeglichen. Bei größeren Summen bietet sich eine Aufteilung auf 2 Einstiegszeitpunkte an.`;
    }
  }

  return (
    <div className="relative rounded-3xl p-5 sm:p-6 glass overflow-hidden space-y-4">
      {/* Liquid Glass Highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-b from-amber-400/20 to-amber-500/5 text-amber-400 border border-amber-400/30 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>HAVN 3-Sekunden-Fazit</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-sky-300 border border-white/10">
                {assetName}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automatische Gesamtbewertung auf Basis aller 6 Quant-Modelle.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center">
          <span className="text-xs font-semibold px-3 py-1 rounded-full glass-inset text-slate-300 shadow-inner">
            Fokus: <strong className="text-white">{invType}</strong>
          </span>
        </div>
      </div>

      {/* 3 Visuelle Ampel-Säulen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Säule 1: Sparplan-Eignung */}
        <div className="p-4 rounded-2xl glass-inset hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sparplan-Eignung</span>
            </span>
            <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {sparplanScore}/100
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-sm text-white">{sparplanLabel}</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isEtf ? 'Maximal diversifiziert – idealer Zinseszins-Motor.' : 'Solider Einzeltitel mit stabiler Nachfrage.'}
            </p>
          </div>
        </div>

        {/* Säule 2: Timing-Risiko (Einmalkauf) */}
        <div className="p-4 rounded-2xl glass-inset hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Compass className={`w-3.5 h-3.5 ${timingType === 'success' ? 'text-emerald-400' : timingType === 'danger' ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>Timing-Ampel</span>
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
              timingType === 'success' 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                : timingType === 'danger' 
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' 
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}>
              {timingType === 'success' ? 'Grün' : timingType === 'danger' ? 'Rot' : 'Gelb'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-sm text-white">{timingStatus}</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {timingDesc}
            </p>
          </div>
        </div>

        {/* Säule 3: Krisen-Resilienz */}
        <div className="p-4 rounded-2xl glass-inset hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Krisen-Resilienz</span>
            </span>
            <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-500/30">
              Max DD: -{maxDd.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-sm text-white">{krisenLabel}</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Markt-Beta: {beta.toFixed(2)} &bull; Erholungsquote: {probUp}%
            </p>
          </div>
        </div>
      </div>

      {/* Klartext-Empfehlung Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-400/20 flex items-start gap-3">
        <HeartHandshake className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          <strong className="text-white font-bold">Empfehlung für dich: </strong>
          {recommendationText}
        </p>
      </div>
    </div>
  );
}
