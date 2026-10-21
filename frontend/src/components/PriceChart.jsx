import React, { useState, useMemo } from 'react';
import { CandlestickChart, LineChart, Sparkles, Layers, Info, ChevronDown, ChevronUp, Eye, EyeOff, Target } from 'lucide-react';

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

export default function PriceChart({ history = [], ticker = '', chartModel = {} }) {
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'
  const [timeRange, setTimeRange] = useState('3M'); // '1M' | '3M' | '6M' | '1J' | 'ALL'
  const [showIndicators, setShowIndicators] = useState(true);
  const [showPatternsOnly, setShowPatternsOnly] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPatternDate, setSelectedPatternDate] = useState(null);
  const [showEducation, setShowEducation] = useState(false);

  // Zeitfenster-Filterung
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    let count = history.length;
    if (timeRange === '1M') count = 22;
    else if (timeRange === '3M') count = 65;
    else if (timeRange === '6M') count = 130;
    else if (timeRange === '1J') count = 252;
    return history.slice(-Math.min(count, history.length));
  }, [history, timeRange]);

  // Erkannte Muster im sichtbaren Zeitraum
  const visiblePatterns = useMemo(() => {
    return filteredHistory.filter(d => Boolean(d.pattern));
  }, [filteredHistory]);

  const patternCounts = useMemo(() => {
    let bullish = 0, bearish = 0, neutral = 0;
    visiblePatterns.forEach(p => {
      if (p.pattern_type === 'bullish') bullish++;
      else if (p.pattern_type === 'bearish') bearish++;
      else neutral++;
    });
    return { bullish, bearish, neutral, total: visiblePatterns.length };
  }, [visiblePatterns]);

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
        Keine historischen Chartdaten verfügbar.
      </div>
    );
  }

  // Preisskala-Berechnung auf Basis der sichtbaren Kerzen (High & Low)
  const allHighs = filteredHistory.map(d => d.high ?? d.close);
  const allLows = filteredHistory.map(d => d.low ?? d.close);
  const rawMin = Math.min(...allLows);
  const rawMax = Math.max(...allHighs);
  const paddingMargin = (rawMax - rawMin) * 0.05 || 1.0;
  const minVal = Math.max(0, rawMin - paddingMargin);
  const maxVal = rawMax + paddingMargin;
  const range = maxVal - minVal || 1;

  // SVG Dimensionen
  const width = 850;
  const height = 340;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 28;
  const paddingBottom = 32;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const count = filteredHistory.length;
  const candleSlotWidth = plotWidth / Math.max(1, count);
  const candleWidth = Math.max(2.5, Math.min(14, candleSlotWidth * 0.72));

  const getX = (i) => paddingLeft + (i + 0.5) * candleSlotWidth;
  const getY = (val) => paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;

  // Pfade für Linien-Chart
  const pricePath = filteredHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`).join(' ');
  const areaPath = `${pricePath} L ${getX(count - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  // GD50 Pfad
  const ma50Path = filteredHistory
    .map((d, i) => d.ma50 != null ? `${i === filteredHistory.findIndex(h => h.ma50 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma50)}` : '')
    .filter(Boolean)
    .join(' ');

  // GD200 Pfad
  const ma200Path = filteredHistory
    .map((d, i) => d.ma200 != null ? `${i === filteredHistory.findIndex(h => h.ma200 != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.ma200)}` : '')
    .filter(Boolean)
    .join(' ');

  // Donchian Channel Pfad (20 Tage Band)
  const dcValid = filteredHistory.filter(d => d.dc_high != null && d.dc_low != null);
  const hasDc = dcValid.length > 5;
  const dcUpperPath = hasDc
    ? filteredHistory.map((d, i) => d.dc_high != null ? `${i === filteredHistory.findIndex(h => h.dc_high != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.dc_high)}` : '').filter(Boolean).join(' ')
    : '';
  const dcLowerPath = hasDc
    ? filteredHistory.map((d, i) => d.dc_low != null ? `${i === filteredHistory.findIndex(h => h.dc_low != null) ? 'M' : 'L'} ${getX(i)} ${getY(d.dc_low)}` : '').filter(Boolean).join(' ')
    : '';

  // Y-Achsen Ticks (5 gleichmäßige Stufen)
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
    const val = minVal + ratio * range;
    const y = paddingTop + plotHeight - ratio * plotHeight;
    return { val, y };
  });

  // X-Achsen Datum-Ticks
  const dateStep = Math.max(1, Math.floor(count / 6));
  const xTicks = [];
  for (let i = 0; i < count; i += dateStep) {
    xTicks.push({ index: i, date: filteredHistory[i].date, x: getX(i) });
  }

  return (
    <div className="relative bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-sm space-y-5">
      {/* 1. Header mit Steuerung & Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              {chartType === 'candles' ? (
                <CandlestickChart className="w-5 h-5" />
              ) : (
                <LineChart className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{chartType === 'candles' ? 'Candlestick-Chart & Mustererkennung' : 'Realer Kursverlauf & Trendlinien'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono">
                  {ticker}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Pro Modus
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {chartType === 'candles'
                  ? 'Japanische Kerzen mit automatischem Erkennungsradar für Reversals & Trendwenden.'
                  : 'Schlusskurs-Verlauf mit gleitenden Durchschnitten und Donchian-Kanälen.'}
              </p>
            </div>
          </div>
        </div>

        {/* Rechte Steuerungsleiste: Chart-Typ, Zeitfenster, Overlays */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chart-Typ Umschalter */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType('candles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'candles'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Kerzen</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Linie</span>
            </button>
          </div>

          {/* Zoom / Zeitfenster Buttons */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            {['1M', '3M', '6M', '1J', 'ALL'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-slate-800 text-sky-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'ALL' ? 'Alles' : r}
              </button>
            ))}
          </div>

          {/* Indikatoren Toggle */}
          <button
            type="button"
            onClick={() => setShowIndicators(!showIndicators)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              showIndicators
                ? 'bg-slate-800 text-sky-300 border-sky-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Gleitende Durchschnitte & Donchian-Bänder ein-/ausblenden"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Indikatoren</span>
          </button>
        </div>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-3.5 bg-emerald-500 rounded-sm inline-block border border-emerald-400"></span>
            Steigend (Close &ge; Open)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-3.5 bg-rose-500 rounded-sm inline-block border border-rose-400"></span>
            Fallend (Close &lt; Open)
          </span>
          {showIndicators && (
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
          <span className="text-slate-400">Muster im Zoom:</span>
          <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/50">
            {patternCounts.total}
          </span>
          {patternCounts.bullish > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/50">
              +{patternCounts.bullish} bullisch
            </span>
          )}
          {patternCounts.bearish > 0 && (
            <span className="text-[11px] font-bold text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/50">
              -{patternCounts.bearish} bärisch
            </span>
          )}
        </div>
      </div>

      {/* 2. SVG Haupt-Chart */}
      <div className="relative w-full aspect-[8/3.2] min-h-[300px] max-h-[420px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="priceLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="dcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
            </linearGradient>
            {/* Glow Filter für Candlestick Muster */}
            <filter id="bullishGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.8" />
            </filter>
            <filter id="bearishGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F43F5E" floodOpacity="0.8" />
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
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                fill="#64748B"
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
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.6"
              />
              <text
                x={x}
                y={paddingTop + plotHeight + 18}
                textAnchor="middle"
                fill="#64748B"
                fontSize="9.5"
                className="font-mono"
              >
                {date.slice(5)}
              </text>
            </g>
          ))}

          {/* Donchian Channel Kanal-Bänder (wenn aktiviert) */}
          {showIndicators && hasDc && dcUpperPath && (
            <g opacity="0.75">
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
              <path d={areaPath} fill="url(#priceLineGrad)" />
              <path d={pricePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* B: KERZEN-MODUS (Candlesticks) */}
          {chartType === 'candles' && (
            <g>
              {filteredHistory.map((d, i) => {
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
                      rx={1}
                      className={isHighlighted ? 'filter brightness-125' : ''}
                    />

                    {/* Candlestick-Muster Indikator Badge am Chart */}
                    {d.pattern && (
                      <g>
                        {d.pattern_type === 'bullish' ? (
                          // Bullisch: Pfeil / Punkt unterhalb der Lunte
                          <g transform={`translate(${x}, ${Math.min(height - paddingBottom - 4, yLow + 9)})`}>
                            <circle r={isHighlighted ? 4.5 : 3.5} fill="#10B981" filter="url(#bullishGlow)" />
                            <polygon points="-3,2 3,2 0,-3" fill="#FFFFFF" />
                          </g>
                        ) : d.pattern_type === 'bearish' ? (
                          // Bärisch: Pfeil / Punkt oberhalb des Dochts
                          <g transform={`translate(${x}, ${Math.max(paddingTop + 6, yHigh - 9)})`}>
                            <circle r={isHighlighted ? 4.5 : 3.5} fill="#F43F5E" filter="url(#bearishGlow)" />
                            <polygon points="-3,-2 3,-2 0,3" fill="#FFFFFF" />
                          </g>
                        ) : (
                          // Neutral / Doji: Diamant
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
          {filteredHistory.map((d, i) => {
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
                    yHigh: getY(d.high ?? d.close),
                    yLow: getY(d.low ?? d.close),
                    open: d.open ?? d.close,
                    high: d.high ?? d.close,
                    low: d.low ?? d.close,
                    close: d.close
                  })
                }
              />
            );
          })}

          {/* Aktives Fadenkreuz & Fokuspunkt */}
          {hoveredPoint && (
            <g pointerEvents="none">
              {/* Vertikale Linie */}
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
              {/* Horizontale Kurslinie */}
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
              {/* Leuchtender Punkt */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill={hoveredPoint.close >= (hoveredPoint.open ?? hoveredPoint.close) ? '#10B981' : '#F43F5E'}
                stroke="#0F172A"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* 3. Interaktives Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 text-xs shadow-2xl backdrop-blur-md min-w-[210px] space-y-2 animate-fadeIn"
            style={{
              left: `${Math.min(88, Math.max(12, (hoveredPoint.x / width) * 100))}%`,
              top: `${Math.max(15, (hoveredPoint.y / height) * 100 - 8)}%`,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400 font-mono text-[11px] font-semibold">{hoveredPoint.date}</span>
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
            {(hoveredPoint.ma50 || hoveredPoint.ma200) && (
              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
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
              <div className={`mt-1 pt-1.5 border-t border-slate-800 rounded-lg p-2 ${
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

      {/* 4. Candlestick-Muster Radar & Signal-Erkennung (Inspector Card) */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              Candlestick-Muster Radar & Signal-Erkennung
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {visiblePatterns.length} {visiblePatterns.length === 1 ? 'Muster' : 'Muster'} im Zoom
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPatternsOnly(!showPatternsOnly)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                showPatternsOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {showPatternsOnly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{showPatternsOnly ? 'Alle Kerzen anzeigen' : 'Nur Muster hervorheben'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEducation(!showEducation)}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>{showEducation ? 'Legende verbergen' : 'Muster-Spickzettel'}</span>
              {showEducation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Ausklappbare Kerzen-Wissensbox */}
        {showEducation && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3 animate-fadeIn">
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
                <div key={pKey} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1">
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
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-400">
            Im gewählten Zeitfenster ({timeRange}) wurden keine ausgeprägten Standard-Muster registriert. Die Kursbewegung verläuft regulär ohne signifikante Umkehrformationen.
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
                    const pt = filteredHistory.find(d => d.date === patItem.date);
                    if (pt) {
                      const ptIdx = filteredHistory.indexOf(pt);
                      setHoveredPoint({
                        ...pt,
                        index: ptIdx,
                        x: getX(ptIdx),
                        y: getY(pt.close),
                        open: pt.open ?? pt.close,
                        high: pt.high ?? pt.close,
                        low: pt.low ?? pt.close,
                        close: pt.close
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-slate-400">{patItem.date}</span>
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
