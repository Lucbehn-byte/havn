import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

const DEFAULT_PRESETS = [
  25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 
  750, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 50000
];

export default function RollUpPicker({ 
  value, 
  onChange, 
  label = 'Betrag (€)', 
  presets = DEFAULT_PRESETS, 
  unit = '€' 
}) {
  const [touchStartX, setTouchStartX] = useState(null);

  // Finde den passenden Index
  const currentIndex = presets.findIndex((v) => v >= value);
  const activeIdx = currentIndex === -1 ? presets.length - 1 : currentIndex;

  const handleIndexChange = (newIdx) => {
    const clamped = Math.max(0, Math.min(presets.length - 1, newIdx));
    onChange(presets[clamped]);
  };

  // Touch-Gesten (Wischen nach links/rechts für Touchscreen)
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 25) {
      handleIndexChange(activeIdx - 1);
    } else if (diff < -25) {
      handleIndexChange(activeIdx + 1);
    }
    setTouchStartX(null);
  };

  const formatVal = (v) => {
    if (unit === '€') return `${Number(v).toLocaleString('de-DE')} €`;
    return `${Number(v).toLocaleString('de-DE')} ${unit}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-500/30">
          Live-Anpassung
        </span>
      </div>

      {/* Interaktiver Wisch- & Scroll-Kanal im Liquid Glass Look */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)] select-none touch-pan-y"
      >
        {/* Minus / Vorheriger Betrag */}
        <button
          type="button"
          onClick={() => handleIndexChange(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="w-10 h-10 rounded-xl glass-chip hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 active:scale-95 cursor-pointer shrink-0 shadow-sm"
          title="Verringern"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Zentraler rollender Zähler */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 text-center">
          <div className="text-[11px] font-mono text-slate-500 h-4">
            {activeIdx > 0 ? formatVal(presets[activeIdx - 1]) : ''}
          </div>
          <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 tracking-tight my-0.5 transform scale-105 transition-transform duration-100">
            {formatVal(Number(value))}
          </div>
          <div className="text-[11px] font-mono text-slate-500 h-4">
            {activeIdx < presets.length - 1 ? formatVal(presets[activeIdx + 1]) : ''}
          </div>
        </div>

        {/* Plus / Nächster Betrag */}
        <button
          type="button"
          onClick={() => handleIndexChange(activeIdx + 1)}
          disabled={activeIdx === presets.length - 1}
          className="w-10 h-10 rounded-xl glass-chip hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 active:scale-95 cursor-pointer shrink-0 shadow-sm"
          title="Erhöhen"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schnellauswahl-Slider mit flüssigem Drag */}
      <div className="px-1 pt-1.5">
        <input
          type="range"
          min="0"
          max={presets.length - 1}
          step="1"
          value={activeIdx}
          onChange={(e) => handleIndexChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-sky-400 border border-white/5"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>{formatVal(presets[0])}</span>
          <span>{formatVal(presets[Math.floor(presets.length / 3)])}</span>
          <span>{formatVal(presets[Math.floor((2 * presets.length) / 3)])}</span>
          <span>{formatVal(presets[presets.length - 1])}</span>
        </div>
      </div>
    </div>
  );
}
