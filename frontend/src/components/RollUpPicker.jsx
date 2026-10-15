import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

const DEFAULT_PRESETS = [
  25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 
  750, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 50000
];

export default function RollUpPicker({ value, onChange, label = 'Betrag (€)', presets = DEFAULT_PRESETS }) {
  const [touchStartX, setTouchStartX] = useState(null);

  // Finde den passenden Index
  const currentIndex = presets.findIndex((v) => v >= value);
  const activeIdx = currentIndex === -1 ? presets.length - 1 : currentIndex;

  const handleIndexChange = (newIdx) => {
    const clamped = Math.max(0, Math.min(presets.length - 1, newIdx));
    onChange(presets[clamped]);
  };

  // Touch-Gesten (Wischen nach links/rechts für Touchscreen & Daumen)
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 25) {
      // Nach rechts gewischt -> Betrag verringern
      handleIndexChange(activeIdx - 1);
    } else if (diff < -25) {
      // Nach links gewischt -> Betrag erhöhen
      handleIndexChange(activeIdx + 1);
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-sky-400 font-mono font-medium">← Wischen / Tippen →</span>
      </div>

      {/* Interaktiver Wisch- & Scroll-Kanal */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-slate-950 border border-slate-700/80 rounded-2xl p-2.5 flex items-center justify-between shadow-inner select-none touch-pan-y"
      >
        {/* Minus / Vorheriger Betrag */}
        <button
          type="button"
          onClick={() => handleIndexChange(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 active:scale-90 cursor-pointer shrink-0"
          title="Verringern"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Zentraler rollender Zähler */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 text-center">
          <div className="text-[11px] font-mono text-slate-500 h-4">
            {activeIdx > 0 ? `${presets[activeIdx - 1].toLocaleString('de-DE')} €` : ''}
          </div>
          <div className="text-2xl font-black font-mono text-sky-400 tracking-tight my-0.5 transform scale-105 transition-transform duration-100">
            {Number(value).toLocaleString('de-DE')} €
          </div>
          <div className="text-[11px] font-mono text-slate-500 h-4">
            {activeIdx < presets.length - 1 ? `${presets[activeIdx + 1].toLocaleString('de-DE')} €` : ''}
          </div>
        </div>

        {/* Plus / Nächster Betrag */}
        <button
          type="button"
          onClick={() => handleIndexChange(activeIdx + 1)}
          disabled={activeIdx === presets.length - 1}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 active:scale-90 cursor-pointer shrink-0"
          title="Erhöhen"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schnellauswahl-Slider für schnelles Springen */}
      <div className="px-1 pt-1">
        <input
          type="range"
          min="0"
          max={presets.length - 1}
          step="1"
          value={activeIdx}
          onChange={(e) => handleIndexChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>{presets[0].toLocaleString('de-DE')} €</span>
          <span>{presets[Math.floor(presets.length / 3)].toLocaleString('de-DE')} €</span>
          <span>{presets[Math.floor((2 * presets.length) / 3)].toLocaleString('de-DE')} €</span>
          <span>{presets[presets.length - 1].toLocaleString('de-DE')} €</span>
        </div>
      </div>
    </div>
  );
}
