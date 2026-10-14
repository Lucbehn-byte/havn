import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const PRESET_VALUES = [25, 50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 10000, 20000, 50000];

export default function RollUpPicker({ value, onChange, label = 'Betrag (€)' }) {
  const scrollRef = useRef(null);

  // Finde den passenden Index oder den nächsten Wert
  const currentIndex = PRESET_VALUES.findIndex((v) => v >= value);
  const activeIdx = currentIndex === -1 ? PRESET_VALUES.length - 1 : currentIndex;

  const handleStep = (direction) => {
    let nextIdx = activeIdx + direction;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= PRESET_VALUES.length) nextIdx = PRESET_VALUES.length - 1;
    onChange(PRESET_VALUES[nextIdx]);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleStep(1);
    } else if (e.deltaY > 0) {
      handleStep(-1);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400">{label}</label>
        <span className="text-[10px] text-sky-400 font-mono font-medium">Scroll / Tasten aktiv</span>
      </div>

      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="relative bg-slate-950 border border-slate-700/80 rounded-2xl p-2 flex items-center justify-between shadow-inner select-none group"
      >
        {/* Step Down Button */}
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={activeIdx === 0}
          className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          title="Wert verringern"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Roller Window */}
        <div className="flex-1 flex flex-col items-center justify-center py-1">
          <div className="text-[11px] font-mono text-slate-600 h-4">
            {activeIdx > 0 ? `${PRESET_VALUES[activeIdx - 1].toLocaleString('de-DE')} €` : ''}
          </div>
          <div className="text-xl font-black font-mono text-sky-400 tracking-tight my-0.5 transition-all duration-150 transform scale-105">
            {Number(value).toLocaleString('de-DE')} €
          </div>
          <div className="text-[11px] font-mono text-slate-600 h-4">
            {activeIdx < PRESET_VALUES.length - 1 ? `${PRESET_VALUES[activeIdx + 1].toLocaleString('de-DE')} €` : ''}
          </div>
        </div>

        {/* Step Up Button */}
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={activeIdx === PRESET_VALUES.length - 1}
          className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          title="Wert erhöhen"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
