import React, { useState, useMemo, useEffect } from 'react';
import { CandlestickChart, LineChart, Sparkles, Layers, Info, ChevronDown, ChevronUp, Eye, EyeOff, TrendingUp, TrendingDown, Clock, Calendar, Gauge } from 'lucide-react';

// Wissensdatenbank der Candlestick-Muster mit quantitativer Interpretation
const PATTERN_DEFINITIONS = {
  'Hammer': {
    name: 'Hammer',
    type: 'bullish',
    badge: 'Bullisches Reversal',
    icon: '🔨',
    desc: 'Lange Lunte (unterer Schatten) bei kleinem Körper am oberen Tagesende. Signalisiert, dass aggressive Intraday-Verkäufe vollständig abgewehrt wurden und Käufer den Kurs wieder nach oben drückten (Bärenfalle).'
  },
  'Shooting Star': {
    name: 'Shooting Star',
    type: 'bearish',
    badge: 'Bärisches Reversal',
    icon: '⭐',
    desc: 'Langer oberer Docht nach einer Aufwärtsbewegung. Zeigt, dass anfängliche Intraday-Hochs massiv abverkauft wurden und die Bären das Ruder übernommen haben (Bullenfalle).'
  },
  'Bullish Engulfing': {
    name: 'Bullish Engulfing',
    type: 'bullish',
    badge: 'Starkes Kaufsignal',
    icon: '⚡',
    desc: 'Ein großer grüner Kerzenkörper umschließt den vorherigen roten Kerzenkörper vollständig. Zeigt eine radikale Machtübernahme der Käufer nach einer Abwärtsphase.'
  },
  'Bearish Engulfing': {
    name: 'Bearish Engulfing',
    type: 'bearish',
    badge: 'Starkes Verkaufssignal',
    icon: '💥',
    desc: 'Ein großer roter Kerzenkörper umschließt den vorherigen grünen Kerzenkörper komplett. Deutet auf abrupten Abwärtsdruck und beginnende Gewinnmitnahmen hin.'
  },
  'Morning Star': {
    name: 'Morning Star',
    type: 'bullish',
    badge: '3-Kerzen-Bodenformation',
    icon: '🌅',
    desc: 'Klassische Trendwendeformation aus drei Kerzen: Ein langer roter Balken, gefolgt von einer kerzenkörperarmen Pause (Doji/Spinning Top) und einer kräftigen grünen Bestätigungskerze.'
  },
  'Evening Star': {
    name: 'Evening Star',
    type: 'bearish',
    badge: '3-Kerzen-Topformation',
    icon: '🌆',
    desc: 'Bärisches Pendant zum Morning Star: Nach kräftigem Anstieg verharrt der Kurs unentschlossen an der Spitze, ehe eine lange rote Kerze eine mittelfristige Korrektur einleitet.'
  },
  'Doji': {
    name: 'Doji',
    type: 'neutral',
    badge: 'Marktunentschlossenheit',
    icon: '⚖️',
    desc: 'Eröffnungs- und Schlusskurs liegen praktisch auf demselben Niveau. Bullen und Bären neutralisieren sich gegenseitig – kündigt oft eine Richtungsentscheidung oder Trendschwäche an.'
  }
};

const TIMEFRAME_OPTIONS = [
  { id: 'heute', label: 'Heute', subtitle: '15-Min-Takt' },
  { id: 'woche', label: 'Woche', subtitle: '1-Stunden-Takt' },
  { id: 'monat', label: 'Monat', subtitle: 'Tages-Takt' },
  { id: 'jahr', label: 'Jahr', subtitle: 'Wochen-Takt' },
  { id: '5jahre', label: '5 Jahre', subtitle: 'Monats-Takt' },
  { id: 'max', label: 'Max', subtitle: 'Quartals-Takt' },
];

// Hilfsfunktionen für harmonische Kerzen-Aggregationen
function aggregateWeekly(dailyData) {
  const weeks = {};
  dailyData.forEach(d => {
    const dt = new Date(d.date);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dt.setDate(diff)).toISOString().slice(0, 10);
    if (!weeks[monday]) {
      weeks[monday] = {
        date: d.date,
        displayDate: `Woche ab ${monday}`,
        open: d.open ?? d.close,
        high: d.high ?? d.close,
        low: d.low ?? d.close,
        close: d.close,
        ma50: d.ma50,
        ma200: d.ma200,
        pattern: d.pattern,
        pattern_type: d.pattern_type
      };
    } else {
      const w = weeks[monday];
      w.high = Math.max(w.high, d.high ?? d.close);
      w.low = Math.min(w.low, d.low ?? d.close);
      w.close = d.close;
      w.date = d.date;
      w.ma50 = d.ma50 ?? w.ma50;
      w.ma200 = d.ma200 ?? w.ma200;
      if (d.pattern && !w.pattern) {
        w.pattern = d.pattern;
        w.pattern_type = d.pattern_type;
      }
    }
  });
  return Object.values(weeks);
}

function aggregateMonthly(dailyData) {
  const months = {};
  dailyData.forEach(d => {
    const key = d.date.slice(0, 7);
    if (!months[key]) {
      months[key] = {
        date: key,
        displayDate: `Monat ${key}`,
        open: d.open ?? d.close,
        high: d.high ?? d.close,
        low: d.low ?? d.close,
        close: d.close,
        ma50: d.ma50,
        ma200: d.ma200,
        pattern: d.pattern,
        pattern_type: d.pattern_type
      };
    } else {
      const m = months[key];
      m.high = Math.max(m.high, d.high ?? d.close);
      m.low = Math.min(m.low, d.low ?? d.close);
      m.close = d.close;
      m.ma50 = d.ma50 ?? m.ma50;
      m.ma200 = d.ma200 ?? m.ma200;
      if (d.pattern && !m.pattern) {
        m.pattern = d.pattern;
        m.pattern_type = d.pattern_type;
      }
    }
  });
  return Object.values(months);
}

function aggregateQuarterly(dailyData) {
  const quarters = {};
  dailyData.forEach(d => {
    const year = d.date.slice(0, 4);
    const m = parseInt(d.date.slice(5, 7), 10) || 1;
    const q = Math.ceil(m / 3);
    const key = `${year}-Q${q}`;
    if (!quarters[key]) {
      quarters[key] = {
        date: key,
        displayDate: `Q${q} ${year}`,
        open: d.open ?? d.close,
        high: d.high ?? d.close,
        low: d.low ?? d.close,
        close: d.close,
        ma50: d.ma50,
        ma200: d.ma200,
        pattern: d.pattern,
        pattern_type: d.pattern_type
      };
    } else {
      const item = quarters[key];
      item.high = Math.max(item.high, d.high ?? d.close);
      item.low = Math.min(item.low, d.low ?? d.close);
      item.close = d.close;
      item.ma50 = d.ma50 ?? item.ma50;
      item.ma200 = d.ma200 ?? item.ma200;
      if (d.pattern && !item.pattern) {
        item.pattern = d.pattern;
        item.pattern_type = d.pattern_type;
      }
    }
  });
  return Object.values(quarters);
}

export default function PriceChart({ 
  history = [], 
  todayHistory = [], 
  weekHistory = [], 
  ticker = '', 
  chartModel = {} 
}) {
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'
  const [timeRange, setTimeRange] = useState('monat'); // 'heute' | 'woche' | 'monat' | 'jahr' | '5jahre' | 'max'
  const [showIndicators, setShowIndicators] = useState(true);
  const [showPatternsOnly, setShowPatternsOnly] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPatternDate, setSelectedPatternDate] = useState(null);
  const [showEducation, setShowEducation] = useState(false);

  // Intraday- und Wochendaten State
  const [intradayData, setIntradayData] = useState(todayHistory || []);
  const [loadingIntraday, setLoadingIntraday] = useState(false);
  const [weekData, setWeekData] = useState(weekHistory || []);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // Synchronisation von Props in State
  useEffect(() => {
    if (todayHistory && todayHistory.length > 0) {
      setIntradayData(todayHistory);
    }
  }, [todayHistory]);

  useEffect(() => {
    if (weekHistory && weekHistory.length > 0) {
      setWeekData(weekHistory);
    }
  }, [weekHistory]);

  // Fallback: On-demand Intraday-Fetch für "Heute"
  useEffect(() => {
    if (timeRange === 'heute' && (!intradayData || intradayData.length === 0) && ticker) {
      setLoadingIntraday(true);
      fetch(`/api/intraday/${ticker}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.today_history && data.today_history.length > 0) {
            setIntradayData(data.today_history);
          }
        })
        .catch(err => console.error("Intraday-Abruf fehlgeschlagen:", err))
        .finally(() => setLoadingIntraday(false));
    }
  }, [timeRange, ticker, intradayData]);

  // Fallback: On-demand Wochen-Fetch (1-Stunden-Kerzen) für "Woche"
  useEffect(() => {
    if (timeRange === 'woche' && (!weekData || weekData.length === 0) && ticker) {
      setLoadingWeek(true);
      fetch(`/api/week/${ticker}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.week_history && data.week_history.length > 0) {
            setWeekData(data.week_history);
          }
        })
        .catch(err => console.error("Wochen-Abruf fehlgeschlagen:", err))
        .finally(() => setLoadingWeek(false));
    }
  }, [timeRange, ticker, weekData]);

  // Harmonische Datenaufbereitung: Stimmige Kerzenanzahl (25 bis 65 Kerzen) in jedem Horizont!
  const { activeHistory, resolutionLabel } = useMemo(() => {
    if (timeRange === 'heute') {
      const d = (intradayData && intradayData.length > 0)
        ? intradayData
        : history.slice(-Math.min(26, history.length));
      return { activeHistory: d, resolutionLabel: '15-Minuten-Kerzen' };
    }

    if (timeRange === 'woche') {
      if (weekData && weekData.length > 0) {
        return { activeHistory: weekData, resolutionLabel: '1-Stunden-Kerzen' };
      }
      // Falls noch am Laden: 5 Tage
      return { activeHistory: history.slice(-Math.min(5, history.length)), resolutionLabel: '1-Stunden-Kerzen' };
    }

    if (!history || history.length === 0) {
      return { activeHistory: [], resolutionLabel: 'Tageskerzen' };
    }

    const total = history.length;

    if (timeRange === 'monat') {
      // 22 Handelstage = ca. 22 Kerzen
      return { 
        activeHistory: history.slice(-Math.min(22, total)), 
        resolutionLabel: 'Tageskerzen (1 Monat)' 
      };
    }

    if (timeRange === 'jahr') {
      const yearSlice = history.slice(-Math.min(252, total));
      if (chartType === 'candles') {
        // In Kerzen-Ansicht: 52 Wochenkerzen für perfekte Lesbarkeit
        const aggregated = aggregateWeekly(yearSlice);
        return { 
          activeHistory: aggregated, 
          resolutionLabel: 'Wochenkerzen (52 Wochen)' 
        };
      }
      // Im Linien-Modus: Alle 252 Tagespunkte für feinen Verlauf
      return { 
        activeHistory: yearSlice, 
        resolutionLabel: 'Tägliche Schlusskurse (252 Tage)' 
      };
    }

    if (timeRange === '5jahre') {
      const fiveYearSlice = history.slice(-Math.min(1260, total));
      if (chartType === 'candles') {
        // In Kerzen-Ansicht: 60 Monatskerzen
        const aggregated = aggregateMonthly(fiveYearSlice);
        return { 
          activeHistory: aggregated, 
          resolutionLabel: 'Monatskerzen (60 Monate)' 
        };
      }
      // Im Linien-Modus: Volle tägliche Auflösung
      return { 
        activeHistory: fiveYearSlice, 
        resolutionLabel: 'Tägliche Schlusskurse (5 Jahre)' 
      };
    }

    // 'max'
    if (chartType === 'candles') {
      // In Kerzen-Ansicht: Quartalskerzen (~60-100 Kerzen)
      const aggregated = aggregateQuarterly(history);
      return { 
        activeHistory: aggregated, 
        resolutionLabel: 'Quartalskerzen (Gesamthistorie)' 
      };
    }
    // Im Linien-Modus: Gesamte Historie
    return { 
      activeHistory: history, 
      resolutionLabel: 'Gesamter Kursverlauf' 
    };
  }, [timeRange, intradayData, weekData, history, chartType]);

  // Erkannte Muster im sichtbaren Zeitraum
  const visiblePatterns = useMemo(() => {
    return activeHistory.filter(d => Boolean(d.pattern));
  }, [activeHistory]);

  const patternCounts = useMemo(() => {
    let bullish = 0, bearish = 0, neutral = 0;
    visiblePatterns.forEach(p => {
      if (p.pattern_type === 'bullish') bullish++;
      else if (p.pattern_type === 'bearish') bearish++;
      else neutral++;
    });
    return { bullish, bearish, neutral, total: visiblePatterns.length };
  }, [visiblePatterns]);

  // Performance-Berechnung im gewählten Zeitraum
  const performance = useMemo(() => {
    if (!activeHistory || activeHistory.length < 2) return null;
    const startVal = activeHistory[0].open ?? activeHistory[0].close;
    const endVal = activeHistory[activeHistory.length - 1].close;
    const diff = endVal - startVal;
    const pct = startVal > 0 ? (diff / startVal) * 100 : 0;
    const highs = activeHistory.map(d => d.high ?? d.close);
    const lows = activeHistory.map(d => d.low ?? d.close);
    return {
      startVal,
      endVal,
      diff,
      pct,
      isPositive: diff >= 0,
      periodHigh: Math.max(...highs),
      periodLow: Math.min(...lows)
    };
  }, [activeHistory]);

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-3xl backdrop-blur-xl glass-inset text-slate-400">
        Keine historischen Chartdaten verfügbar.
      </div>
    );
  }

  // Preisskala-Berechnung auf Basis der sichtbaren Kerzen (High & Low)
  const allHighs = activeHistory.map(d => d.high ?? d.close);
  const allLows = activeHistory.map(d => d.low ?? d.close);
  const rawMin = Math.min(...allLows);
  const rawMax = Math.max(...allHighs);
  const paddingMargin = (rawMax - rawMin) * 0.05 || 1.0;
  const minVal = Math.max(0, rawMin - paddingMargin);
  const maxVal = rawMax + paddingMargin;
  const range = maxVal - minVal || 1;

  // SVG Dimensionen
  const width = 850;
  const height = 340;
  const paddingLeft = 54;
  const paddingRight = 20;
  const paddingTop = 26;
  const paddingBottom = 34;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const count = activeHistory.length;
  const candleSlotWidth = plotWidth / Math.max(1, count);
  // Stimmige Kerzenbreite: Zwischen 3.5px und 18px (nie zu dünn, nie zu dick!)
  const candleWidth = Math.max(3.5, Math.min(18, candleSlotWidth * 0.70));

  const getX = (i) => paddingLeft + (i + 0.5) * candleSlotWidth;
  const getY = (val) => paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;

  // Pfade für Linien-Chart
  const pricePath = activeHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`).join(' ');
  const areaPath = `${pricePath} L ${getX(count - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  // GD50 Pfad (nur anzeigen wenn sinnvolle Tageswerte vorliegen)
  const isIntradayOrWeek = timeRange === 'heute' || timeRange === 'woche';
  const ma50Path = (!isIntradayOrWeek && showIndicators)
    ? activeHistory.map((d, i) => d.ma50 != null ? `${i === activeHistory.findIndex(h => h.ma50 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma50)}` : '').filter(Boolean).join(' ')
    : '';

  // GD200 Pfad
  const ma200Path = (!isIntradayOrWeek && showIndicators)
    ? activeHistory.map((d, i) => d.ma200 != null ? `${i === activeHistory.findIndex(h => h.ma200 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma200)}` : '').filter(Boolean).join(' ')
    : '';

  // Donchian Channel Pfad (20 Tage Band)
  const dcValid = activeHistory.filter(d => d.dc_high != null && d.dc_low != null);
  const hasDc = !isIntradayOrWeek && showIndicators && dcValid.length > 5;
  const dcUpperPath = hasDc
    ? activeHistory.map((d, i) => d.dc_high != null ? `${i === activeHistory.findIndex(h => h.dc_high != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.dc_high)}` : '').filter(Boolean).join(' ')
    : '';
  const dcLowerPath = hasDc
    ? activeHistory.map((d, i) => d.dc_low != null ? `${i === activeHistory.findIndex(h => h.dc_low != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.dc_low)}` : '').filter(Boolean).join(' ')
    : '';

  // Y-Achsen Ticks (5 Stufen)
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
    const val = minVal + ratio * range;
    const y = paddingTop + plotHeight - ratio * plotHeight;
    return { val, y };
  });

  // X-Achsen Datums-Ticks (harmonisch formatiert)
  const numDateLabels = timeRange === 'heute' ? 5 : timeRange === 'woche' ? 5 : 6;
  const dateStep = Math.max(1, Math.floor(count / numDateLabels));
  const xTicks = [];
  for (let i = 0; i < count; i += dateStep) {
    const item = activeHistory[i];
    let label = item.date;
    if (timeRange === 'heute') {
      label = item.date; // HH:MM
    } else if (timeRange === 'woche') {
      label = item.date.slice(0, 2); // Wochentag z. B. Mo, Di, Mi, Do, Fr
    } else if (timeRange === '5jahre' || timeRange === 'max') {
      label = item.date.slice(0, 7); // YYYY-MM oder YYYY-Q
    } else {
      label = item.date.slice(5); // MM-DD
    }
    xTicks.push({ index: i, date: label, x: getX(i) });
  }

  const isLoading = loadingIntraday || loadingWeek;

  return (
    <div className="relative rounded-3xl p-5 sm:p-7 glass overflow-hidden space-y-6">
      
      {/* Liquid Glass Ambient Backlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-500/12 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/12 blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

      {/* 1. Header mit Titel & Pro-Badge */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-sky-400 shrink-0">
            {chartType === 'candles' ? (
              <CandlestickChart className="w-5 h-5" />
            ) : (
              <LineChart className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Realer Kursverlauf & Chartanalyse
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-white/[0.06] text-sky-300 border border-white/10 shadow-sm">
                {ticker}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-gradient-to-r from-indigo-500/20 to-sky-500/20 text-indigo-200 border border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                Pro Modus
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Japanische Candlesticks mit harmonisch abgestimmter Kerzengröße.</span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono font-bold text-[11px] text-sky-400 bg-sky-950/60 px-2 py-0.2 rounded-md border border-sky-500/30">
                <Gauge className="w-3 h-3" />
                {resolutionLabel} ({count} Kerzen)
              </span>
            </p>
          </div>
        </div>

        {/* Rechte Kontroll-Leiste: Kerzen/Linie Umschalter & Indikatoren */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Liquid Glass Chart-Typ Umschalter */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.4)]">
            <button
              type="button"
              onClick={() => setChartType('candles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                chartType === 'candles'
                  ? 'bg-gradient-to-b from-sky-400/25 via-sky-500/20 to-sky-600/30 text-sky-200 border border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Kerzen</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                chartType === 'line'
                  ? 'bg-gradient-to-b from-sky-400/25 via-sky-500/20 to-sky-600/30 text-sky-200 border border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Linie</span>
            </button>
          </div>

          {/* Indikatoren Toggle (GD50, GD200, Donchian) */}
          {!isIntradayOrWeek && (
            <button
              type="button"
              onClick={() => setShowIndicators(!showIndicators)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-300 cursor-pointer ${
                showIndicators
                  ? 'bg-gradient-to-b from-white/[0.1] to-white/[0.03] text-sky-300 border-sky-400/40 shadow-[0_0_14px_rgba(56,189,248,0.25)]'
                  : 'bg-slate-950/40 text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Gleitende Durchschnitte & Donchian-Bänder ein-/ausblenden"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Indikatoren</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Liquid Glass Zeithorizont-Wahlleiste (Heute, Woche, Monat, Jahr, 5 Jahre, Max) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Liquid Glass Segmented Control */}
        <div className="inline-flex flex-wrap p-1 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/[0.14] shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),0_10px_25px_rgba(0,0,0,0.5)] gap-1">
          {TIMEFRAME_OPTIONS.map((opt) => {
            const isActive = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id)}
                className={`group relative px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold bg-gradient-to-b from-sky-400/30 via-sky-500/25 to-indigo-600/35 border border-sky-300/50 shadow-[0_0_18px_rgba(56,189,248,0.4),inset_0_1px_2px_rgba(255,255,255,0.5)] scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] border border-transparent'
                }`}
              >
                <span>{opt.label}</span>
                {opt.id === 'heute' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Liquid Glass Performance Ribbon für den gewählten Zeitraum */}
        {performance && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] shadow-sm text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeHistory[0]?.date} &rarr; {activeHistory[activeHistory.length - 1]?.date}:</span>
            </span>
            <div className={`flex items-center gap-1 font-bold font-mono ${
              performance.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {performance.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{performance.isPositive ? '+' : ''}{performance.diff.toFixed(2)} €</span>
              <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] ${
                performance.isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {performance.isPositive ? '+' : ''}{performance.pct.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Liquid Glass Status- & Indikatoren-Leiste */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-3.5 bg-emerald-500 rounded-sm inline-block border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            Steigend (Close &ge; Open)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-3.5 bg-rose-500 rounded-sm inline-block border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"></span>
            Fallend (Close &lt; Open)
          </span>
          {showIndicators && !isIntradayOrWeek && (
            <>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block"></span> GD50
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <span className="w-3 h-0.5 border-t border-dashed border-indigo-400 rounded-full inline-block"></span> GD200
              </span>
              {hasDc && (
                <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                  <span className="w-3 h-0.5 border-t border-dotted border-sky-400 rounded-full inline-block"></span> Donchian (20T)
                </span>
              )}
            </>
          )}
        </div>

        {/* Schnellstatus erkannte Muster */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Erkannte Muster:</span>
          <span className="font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
            {patternCounts.total}
          </span>
          {patternCounts.bullish > 0 && (
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              +{patternCounts.bullish} bullisch
            </span>
          )}
          {patternCounts.bearish > 0 && (
            <span className="text-[11px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-500/30">
              -{patternCounts.bearish} bärisch
            </span>
          )}
        </div>
      </div>

      {/* 4. SVG Haupt-Chart */}
      <div className="relative z-10 w-full aspect-[8/3.2] min-h-[300px] max-h-[440px]">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-sky-400">
            <Clock className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">Lade {timeRange === 'heute' ? 'Intraday-Kurse' : 'Wochen-Stundenkurse'} für {ticker}...</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="liquidPriceLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#6366F1" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
              <filter id="liquidBullGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#10B981" floodOpacity="0.9" />
              </filter>
              <filter id="liquidBearGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#F43F5E" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Horizontale Gitterlinien & Preisbeschriftung */}
            {yTicks.map(({ val, y }, idx) => (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                  className="font-mono font-medium"
                >
                  {val.toFixed(val >= 100 ? 1 : 2)}€
                </text>
              </g>
            ))}

            {/* Vertikale Datums-Ticks */}
            {xTicks.map(({ date, x }, idx) => (
              <g key={idx}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={x}
                  y={paddingTop + plotHeight + 18}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9.5"
                  className="font-mono"
                >
                  {date}
                </text>
              </g>
            ))}

            {/* Donchian Channel Kanal-Bänder (wenn aktiviert) */}
            {showIndicators && hasDc && dcUpperPath && (
              <g opacity="0.8">
                <path d={dcUpperPath} fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <path d={dcLowerPath} fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              </g>
            )}

            {/* GD200 (Indigo) */}
            {showIndicators && ma200Path && (
              <path d={ma200Path} fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
            )}

            {/* GD50 (Gelb) */}
            {showIndicators && ma50Path && (
              <path d={ma50Path} fill="none" stroke="#FACC15" strokeWidth="1.75" opacity="0.9" />
            )}

            {/* A: LINIEN-MODUS */}
            {chartType === 'line' && (
              <>
                <path d={areaPath} fill="url(#liquidPriceLineGrad)" />
                <path d={pricePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* B: KERZEN-MODUS (Candlesticks mit stimmigen Proportionen) */}
            {chartType === 'candles' && (
              <g>
                {activeHistory.map((d, i) => {
                  const x = getX(i);
                  const openVal = d.open ?? d.close;
                  const highVal = d.high ?? Math.max(openVal, d.close);
                  const lowVal = d.low ?? Math.min(openVal, d.close);
                  const closeVal = d.close;

                  const yHigh = getY(highVal);
                  const yLow = getY(lowVal);
                  const yOpen = getY(openVal);
                  const yClose = getY(closeVal);

                  const isBullish = closeVal >= openVal;
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                  const candleFill = isBullish ? '#10B981' : '#F43F5E';
                  const candleStroke = isBullish ? '#059669' : '#E11D48';

                  const isHighlighted = selectedPatternDate === d.date || hoveredPoint?.date === d.date;

                  return (
                    <g
                      key={d.date || i}
                      className="transition-opacity duration-150"
                      opacity={showPatternsOnly && !d.pattern ? 0.35 : 1}
                    >
                      {/* Docht & Lunte (High - Low) */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={candleFill}
                        strokeWidth={isHighlighted ? 2.5 : Math.max(1, Math.min(1.8, candleWidth * 0.22))}
                        strokeLinecap="round"
                      />

                      {/* Kerzenkörper (Open - Close) */}
                      <rect
                        x={x - candleWidth / 2}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={candleFill}
                        stroke={candleStroke}
                        strokeWidth={isHighlighted ? 1.5 : 1}
                        rx={candleWidth > 4 ? 1 : 0}
                        className={isHighlighted ? 'filter brightness-125 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''}
                      />

                      {/* Candlestick-Muster Indikator Badge am Chart */}
                      {d.pattern && (
                        <g>
                          {d.pattern_type === 'bullish' ? (
                            <g transform={`translate(${x}, ${Math.min(height - paddingBottom - 4, yLow + 9)})`}>
                              <circle r={isHighlighted ? 4.5 : 3.5} fill="#10B981" filter="url(#liquidBullGlow)" />
                              <polygon points="-3,2 3,2 0,-3" fill="#FFFFFF" />
                            </g>
                          ) : d.pattern_type === 'bearish' ? (
                            <g transform={`translate(${x}, ${Math.max(paddingTop + 6, yHigh - 9)})`}>
                              <circle r={isHighlighted ? 4.5 : 3.5} fill="#F43F5E" filter="url(#liquidBearGlow)" />
                              <polygon points="-3,-2 3,-2 0,3" fill="#FFFFFF" />
                            </g>
                          ) : (
                            <g transform={`translate(${x}, ${Math.max(paddingTop + 6, yHigh - 9)})`}>
                              <polygon points="0,-3.5 3.5,0 0,3.5 -3.5,0" fill="#38BDF8" />
                            </g>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Interaktive Trefferflächen für flüssiges Hovern */}
            {activeHistory.map((d, i) => {
              const x = getX(i);
              return (
                <rect
                  key={i}
                  x={x - candleSlotWidth / 2}
                  y={paddingTop}
                  width={candleSlotWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      ...d,
                      index: i,
                      x,
                      y: getY(d.close),
                      open: d.open ?? d.close,
                      high: d.high ?? d.close,
                      low: d.low ?? d.close,
                      close: d.close,
                      displayDate: d.displayDate || d.full_date || d.date
                    })
                  }
                />
              );
            })}

            {/* Aktives Fadenkreuz & Fokuspunkt */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={paddingTop}
                  x2={hoveredPoint.x}
                  y2={paddingTop + plotHeight}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.8"
                />
                <line
                  x1={paddingLeft}
                  y1={hoveredPoint.y}
                  x2={width - paddingRight}
                  y2={hoveredPoint.y}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5"
                  fill={hoveredPoint.close >= (hoveredPoint.open ?? hoveredPoint.close) ? '#10B981' : '#F43F5E'}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                />
              </g>
            )}
          </svg>
        )}

        {/* 5. Liquid Glass Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full rounded-2xl p-3.5 text-xs backdrop-blur-2xl bg-slate-950/85 border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-sky-500/20 min-w-[220px] space-y-2 animate-fadeIn"
            style={{
              left: `${Math.min(88, Math.max(12, (hoveredPoint.x / width) * 100))}%`,
              top: `${Math.max(15, (hoveredPoint.y / height) * 100 - 8)}%`,
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-300 font-mono text-[11px] font-semibold">
                {hoveredPoint.displayDate || hoveredPoint.date}
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${
                hoveredPoint.close >= hoveredPoint.open
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {hoveredPoint.close >= hoveredPoint.open ? '+' : ''}
                {(((hoveredPoint.close - hoveredPoint.open) / (hoveredPoint.open || 1)) * 100).toFixed(2)}%
              </span>
            </div>

            {/* OHLC Werte */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
              <div className="text-slate-400">Open: <span className="text-white font-medium">{hoveredPoint.open.toFixed(2)}€</span></div>
              <div className="text-slate-400">Close: <span className="text-sky-300 font-bold">{hoveredPoint.close.toFixed(2)}€</span></div>
              <div className="text-slate-400">High: <span className="text-emerald-400 font-medium">{hoveredPoint.high.toFixed(2)}€</span></div>
              <div className="text-slate-400">Low: <span className="text-rose-400 font-medium">{hoveredPoint.low.toFixed(2)}€</span></div>
            </div>

            {/* Technische Durchschnitte */}
            {(hoveredPoint.ma50 || hoveredPoint.ma200) && !isIntradayOrWeek && (
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                {hoveredPoint.ma50 && (
                  <span className="text-amber-400">GD50: {hoveredPoint.ma50.toFixed(2)}€</span>
                )}
                {hoveredPoint.ma200 && (
                  <span className="text-indigo-400">GD200: {hoveredPoint.ma200.toFixed(2)}€</span>
                )}
              </div>
            )}

            {/* Erkanntes Candlestick-Muster */}
            {hoveredPoint.pattern && (
              <div className={`mt-1 pt-1.5 border-t border-white/10 rounded-xl p-2 ${
                hoveredPoint.pattern_type === 'bullish'
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'
                  : hoveredPoint.pattern_type === 'bearish'
                  ? 'bg-rose-950/60 border-rose-500/30 text-rose-200'
                  : 'bg-slate-900 border-sky-500/30 text-sky-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{PATTERN_DEFINITIONS[hoveredPoint.pattern]?.icon || '🕯️'}</span>
                  <span>{hoveredPoint.pattern}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-slate-950/80 border border-current ml-auto">
                    {hoveredPoint.pattern_type}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 leading-tight font-sans">
                  {PATTERN_DEFINITIONS[hoveredPoint.pattern]?.desc || 'Signifikante technische Kerzenformation.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Candlestick-Muster Radar & Signal-Erkennung (Inspector Card) */}
      <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">
              Candlestick-Muster Radar & Signal-Erkennung
            </h4>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
              {visiblePatterns.length} {visiblePatterns.length === 1 ? 'Muster' : 'Muster'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPatternsOnly(!showPatternsOnly)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 backdrop-blur-md ${
                showPatternsOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {showPatternsOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showPatternsOnly ? 'Alle Kerzen anzeigen' : 'Nur Muster hervorheben'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEducation(!showEducation)}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showEducation ? 'Legende verbergen' : 'Muster-Spickzettel'}</span>
              {showEducation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Ausklappbare Kerzen-Wissensbox */}
        {showEducation && (
          <div className="p-4 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/10 text-xs text-slate-300 space-y-3 animate-fadeIn">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>💡 Wie fließen Candlesticks in die HAVN-Quant-Prognose ein?</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Im <strong>Pro Modus</strong> berechnet unsere QuantEngine jeden Handelstag automatisiert auf Basis von Open, High, Low und Close. 
              Für kurzfristige Anlagehorizonte (3 bis 10 Tage) fließen Kerzenformationen mit bis zu <strong>25% Gewicht</strong> in den Trend-Score ein, 
              da sie institutionellen Kauf- und Verkaufsdruck (z.B. Stop-Loss-Fischen und Reversals) frühzeitig offenlegen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {Object.entries(PATTERN_DEFINITIONS).map(([pKey, pDef]) => (
                <div key={pKey} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{pDef.icon}</span>
                      <span>{pDef.name}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      pDef.type === 'bullish'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : pDef.type === 'bearish'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {pDef.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{pDef.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste der im sichtbaren Zeitraum erkannten Muster */}
        {visiblePatterns.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-slate-400">
            Im gewählten Zeitfenster ({TIMEFRAME_OPTIONS.find(o => o.id === timeRange)?.label || timeRange}) wurden keine ausgeprägten Standard-Muster registriert. Die Kursbewegung verläuft regulär ohne signifikante Umkehrformationen.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {visiblePatterns.slice(-6).reverse().map((patItem, idx) => {
              const def = PATTERN_DEFINITIONS[patItem.pattern] || {
                name: patItem.pattern,
                type: patItem.pattern_type,
                badge: patItem.pattern_type === 'bullish' ? 'Kaufsignal' : 'Verkaufssignal',
                icon: '🕯️',
                desc: 'Erkanntes Kerzenmuster.'
              };
              const isSelected = selectedPatternDate === patItem.date;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedPatternDate(isSelected ? null : patItem.date);
                    const pt = activeHistory.find(d => d.date === patItem.date);
                    if (pt) {
                      const ptIdx = activeHistory.indexOf(pt);
                      setHoveredPoint({
                        ...pt,
                        index: ptIdx,
                        x: getX(ptIdx),
                        y: getY(pt.close),
                        open: pt.open ?? pt.close,
                        high: pt.high ?? pt.close,
                        low: pt.low ?? pt.close,
                        close: pt.close,
                        displayDate: pt.displayDate || pt.full_date || pt.date
                      });
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/50'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-slate-400">{patItem.displayDate || patItem.date}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      patItem.pattern_type === 'bullish'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : patItem.pattern_type === 'bearish'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {def.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{def.icon}</span>
                      <span>{patItem.pattern}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sky-400 text-xs">
                        {patItem.close.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {def.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
