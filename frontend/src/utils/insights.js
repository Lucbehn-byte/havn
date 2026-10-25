/**
 * HAVN Insights – übersetzt die rohen Quant-Ergebnisse des Backends in
 * verständliche Kennzahlen, Scores und Klartext-Aussagen.
 *
 * Wird von Basic (BeginnerView) UND Pro (ExecutiveSummary, Kurz-gesagt-Zeilen)
 * genutzt, damit beide Modi exakt dieselbe Logik und dieselben Aussagen teilen.
 */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const formatEuro = (val, digits = 0) =>
  `${(Number(val) || 0).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`;

export const formatPct = (val, digits = 1, withSign = true) => {
  const n = Number(val) || 0;
  const s = n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return `${withSign && n > 0 ? '+' : ''}${s} %`;
};

const parseNum = (v) => {
  if (v == null) return null;
  const n = parseFloat(String(v).replace('%', '').replace('+', '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Haltedauer-Label → Jahre (für Klartext-Sätze) */
export function horizonText(timeframeLabel = '') {
  const m = String(timeframeLabel).match(/^(\d+)\s+(Tage|Wochen|Jahr|Jahre)/);
  if (!m) return timeframeLabel;
  return `${m[1]} ${m[2]}`;
}

export function scoreTone(score) {
  if (score >= 75) return 'emerald';
  if (score >= 55) return 'sky';
  if (score >= 40) return 'amber';
  return 'rose';
}

export const TONE = {
  emerald: { text: 'text-emerald-300', bar: 'from-emerald-400 to-teal-300', soft: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300', dot: 'bg-emerald-400', hex: '#34D399' },
  sky:     { text: 'text-sky-300',     bar: 'from-sky-400 to-cyan-300',     soft: 'bg-sky-400/10 border-sky-400/25 text-sky-300',             dot: 'bg-sky-400',     hex: '#38BDF8' },
  amber:   { text: 'text-amber-300',   bar: 'from-amber-400 to-yellow-300', soft: 'bg-amber-400/10 border-amber-400/25 text-amber-300',       dot: 'bg-amber-400',   hex: '#FBBF24' },
  rose:    { text: 'text-rose-300',    bar: 'from-rose-400 to-pink-300',    soft: 'bg-rose-400/10 border-rose-400/25 text-rose-300',          dot: 'bg-rose-400',    hex: '#FB7185' },
};

export function getInsights(data, invType = 'Einmalanlage') {
  if (!data) return null;

  const ticker = data.ticker || '';
  const mc = data.monte_carlo || {};
  const cm = data.chart_model || {};
  const ind = cm.indicators || {};
  const fund = data.fundamental || {};
  const crisis = data.crisis_model || {};
  const rr = data.rolling_returns || {};

  const isEtf = Boolean(
    fund.is_etf ||
    data.asset_info?.typ?.toLowerCase().includes('etf') ||
    (ticker.includes('.DE') && !data.asset_info?.typ?.toLowerCase().includes('aktie'))
  );

  const beta = Number(data.beta ?? 1);
  const rsi = Number(ind['RSI (14 Tage)'] ?? 50);
  const trendScore = Number(cm.score ?? 0);
  const maxDd = Math.abs(Number(crisis.max_drawdown_all ?? 35));
  const vol = Number(mc.ewma_volatility_pct ?? mc.annualized_volatility_pct ?? 18);
  const histVol = Number(mc.hist_volatility_pct ?? vol);
  const probUp = Number(mc.prob_up ?? 50);
  const sortino = Number(mc.sortino_ratio ?? 1);
  const winRate = rr.win_rate_pct != null ? Number(rr.win_rate_pct) : null;
  const kgv = parseNum(fund.metrics?.['KGV (Aktuell)']);
  const horizon = horizonText(data.timeframe_label);

  const price = Number(data.current_price ?? 0);
  const ma200 = parseNum(ind['GD200 (200-Tage-Linie)']);
  const ma50 = parseNum(ind['GD50 (50-Tage-Linie)']);

  /* ---------------------------------------------------------------
     1) Teil-Scores (0–100)
     --------------------------------------------------------------- */
  // Trend & Momentum: Chart-Score (-100..+100) + Überhitzungs-Abschlag
  let momentum = 50 + trendScore * 0.45;
  if (ma200 && price) momentum += price > ma200 ? 8 : -8;
  if (rsi > 75) momentum -= 8;
  if (rsi < 30) momentum -= 4;
  momentum = Math.round(clamp(momentum, 5, 97));

  // Krisenfestigkeit: größter Rückschlag + Schwankungsintensität
  const stability = Math.round(clamp(100 - maxDd * 0.6 - Math.max(0, histVol - 15) * 0.5 - Math.max(0, beta - 1) * 10, 8, 97));

  // Preis / Bewertung
  let valuation;
  if (isEtf) valuation = 72;
  else if (kgv != null && kgv > 0) {
    valuation = kgv < 12 ? 88 : kgv < 18 ? 78 : kgv < 25 ? 66 : kgv < 32 ? 54 : kgv < 45 ? 42 : 30;
  } else {
    const st = (fund.valuation_status || '').toLowerCase();
    valuation = st.includes('günstig') || st.includes('attraktiv') ? 75 : st.includes('ambitioniert') || st.includes('teuer') ? 42 : 58;
  }
  valuation = Math.round(valuation);

  // Langfrist-Erfolg: historische Gewinnquote + Simulation
  const history = Math.round(clamp(
    (winRate != null ? winRate * 0.65 : 45) + probUp * 0.35 + (isEtf ? 4 : 0),
    5, 98
  ));

  const total = Math.round(momentum * 0.2 + stability * 0.3 + valuation * 0.2 + history * 0.3);

  let totalLabel = 'Spekulativ';
  if (total >= 78) totalLabel = 'Sehr stark';
  else if (total >= 64) totalLabel = 'Solide';
  else if (total >= 50) totalLabel = 'Gemischt';

  /* ---------------------------------------------------------------
     2) Klartext-Übersetzungen
     --------------------------------------------------------------- */
  const trend =
    trendScore > 15 ? { label: 'Aufwärtstrend', tone: 'emerald', text: 'Der Kurs steigt seit Wochen stabil.' }
    : trendScore < -15 ? { label: 'Abwärtstrend', tone: 'rose', text: 'Der Kurs fällt seit einiger Zeit.' }
    : { label: 'Seitwärts', tone: 'sky', text: 'Der Kurs pendelt ohne klare Richtung.' };

  const heat =
    rsi > 72 ? { label: 'Heiß gelaufen', tone: 'amber', text: 'Zuletzt sehr stark gestiegen – kurze Verschnaufpausen sind jetzt typisch.' }
    : rsi < 30 ? { label: 'Stark abverkauft', tone: 'sky', text: 'Zuletzt kräftig gefallen – oft folgt eine Gegenbewegung, aber ohne Garantie.' }
    : { label: 'Normal', tone: 'emerald', text: 'Weder überhitzt noch ausverkauft.' };

  const swing =
    vol < 12 ? { label: 'Ruhig', tone: 'emerald' }
    : vol < 20 ? { label: 'Moderat', tone: 'sky' }
    : vol < 32 ? { label: 'Lebhaft', tone: 'amber' }
    : { label: 'Stark', tone: 'rose' };

  let marketCompare;
  if (beta >= 0.85 && beta <= 1.15) marketCompare = 'bewegt sich etwa wie der Gesamtmarkt';
  else if (beta > 1.15) marketCompare = `schwankt rund ${Math.round((beta - 1) * 100)} % stärker als der Gesamtmarkt`;
  else marketCompare = `schwankt rund ${Math.round((1 - beta) * 100)} % weniger als der Gesamtmarkt`;

  let priceLevel;
  if (isEtf) priceLevel = { label: 'Fair (Marktpreis)', tone: 'sky', text: 'Ein breiter Index-Fonds kostet immer den Durchschnittspreis des Marktes.' };
  else if (valuation >= 70) priceLevel = { label: 'Günstig', tone: 'emerald', text: kgv ? `Du zahlst etwa das ${kgv.toFixed(0)}-Fache des Jahresgewinns – im Vergleich eher günstig.` : 'Im Vergleich eher günstig bewertet.' };
  else if (valuation >= 52) priceLevel = { label: 'Fair', tone: 'sky', text: kgv ? `Du zahlst etwa das ${kgv.toFixed(0)}-Fache des Jahresgewinns – ein üblicher Preis.` : 'Ein marktüblicher Preis.' };
  else priceLevel = { label: 'Teuer', tone: 'amber', text: kgv ? `Du zahlst etwa das ${kgv.toFixed(0)}-Fache des Jahresgewinns. Die Börse erwartet viel Wachstum – Enttäuschungen werden bestraft.` : 'Die Börse hat hohe Erwartungen eingepreist.' };

  // Timing-Ampel
  let timing;
  if (rsi > 72) timing = { tone: 'amber', label: 'Gestaffelt einsteigen' };
  else if (trendScore < -20) timing = { tone: 'rose', label: 'Abwarten oder Sparplan' };
  else if (trendScore > 20 && rsi < 65) timing = { tone: 'emerald', label: 'Gutes Umfeld' };
  else timing = { tone: 'sky', label: 'Neutral' };

  let action;
  if (invType === 'Sparplan') {
    action = isEtf
      ? 'Sparplan starten und laufen lassen. Schwankungen arbeiten hier für dich: Bei tiefen Kursen kaufst du automatisch mehr Anteile.'
      : 'Als Sparplan gut machbar. Weil eine einzelne Firma stärker schwankt, am besten mit einem breiten Welt-ETF kombinieren.';
  } else if (timing.tone === 'emerald') {
    action = 'Das Umfeld ist freundlich. Bei größeren Summen trotzdem auf 2 Kaufzeitpunkte aufteilen – das nimmt Timing-Risiko raus.';
  } else if (timing.tone === 'amber') {
    action = 'Der Kurs ist zuletzt stark gelaufen. Statt alles auf einmal: in 2–3 Teilen über einige Wochen kaufen.';
  } else if (timing.tone === 'rose') {
    action = 'Der Kurs fällt gerade. Lieber abwarten, bis sich der Trend stabilisiert – oder schrittweise per Sparplan einsteigen.';
  } else {
    action = 'Chance und Risiko halten sich die Waage. Bei größeren Beträgen bietet sich ein Einstieg in 2 Schritten an.';
  }

  // Krisen (nur echte Krisen, keine Boomphasen)
  const crises = Object.entries(crisis.results || {})
    .filter(([, c]) => c?.verfuegbar && !(c.typ || '').toLowerCase().includes('gewinnphase'))
    .map(([name, c]) => ({
      name: name.replace(/\s*\(.*\)\s*$/, ''),
      year: (name.match(/\((.*)\)/) || [])[1] || '',
      drop: Number(c.max_drawdown_pct ?? 0),
      recovered: Boolean(c.erholung_erfolgt),
      synthetic: Boolean(c.is_synthetic),
      daysToLow: c.tage_bis_tief,
    }))
    .sort((a, b) => a.drop - b.drop);

  const boom = Object.entries(crisis.results || {})
    .filter(([, c]) => c?.verfuegbar && (c.typ || '').toLowerCase().includes('gewinnphase'))
    .map(([name, c]) => ({ name, gain: Number(c.gesamt_rendite_pct ?? 0) }))[0] || null;

  // Zukunftsszenarien (in Euro, bereits Live-Slider-skaliert)
  const invested = Number(mc.eingezahltes_kapital ?? 0);
  const scenarios = {
    invested,
    weak: Number(mc.pessimistisch_endwert ?? 0),
    normal: Number(mc.erwarteter_endwert ?? 0),
    strong: Number(mc.optimistisch_endwert ?? 0),
  };
  const outOfTen = Math.round(probUp / 10);

  return {
    isEtf, beta, rsi, trendScore, maxDd, vol, histVol, probUp, sortino, winRate, kgv, horizon,
    scores: { total, totalLabel, momentum, stability, valuation, history },
    trend, heat, swing, marketCompare, priceLevel, timing, action,
    crises, boom, scenarios, outOfTen,
    ma50, ma200, price,
  };
}
