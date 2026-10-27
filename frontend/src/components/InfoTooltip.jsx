import React, { useState, useRef, useEffect } from 'react';
import { Info, X, Sparkles } from 'lucide-react';

export default function InfoTooltip({ title, text, rule, align = 'center' }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [open]);

  // Schließen bei Escape-Taste
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle select-none" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          open 
            ? 'bg-sky-400/25 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.35)]' 
            : 'bg-white/[0.08] hover:bg-sky-400/20 text-slate-400 hover:text-sky-300 border border-white/10 hover:border-sky-400/30'
        }`}
        aria-label="Erklärung anzeigen"
        title="Klicken für Erklärung"
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {open && (
        <span 
          role="tooltip"
          className={`absolute bottom-full mb-2.5 z-50 w-64 sm:w-72 max-w-[85vw] p-3.5 rounded-2xl glass-strong border border-white/15 shadow-2xl backdrop-blur-2xl text-left animate-fadeIn pointer-events-auto ${
            align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <span className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/[0.08] pb-1">
              <span className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                <span>{title}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition-colors sm:hidden"
                aria-label="Schließen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <span className="block text-[11.5px] leading-relaxed text-slate-200 font-normal">
            {text}
          </span>

          {rule && (
            <span className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-start gap-1.5 text-[10.5px] font-medium text-sky-300/90 leading-snug">
              <span className="font-bold text-white shrink-0">Faustregel:</span>
              <span>{rule}</span>
            </span>
          )}

          {/* Kleiner Pfeil nach unten */}
          <span className={`absolute top-full border-4 border-transparent border-t-slate-800/90 w-0 h-0 ${
            align === 'left' ? 'left-3' : align === 'right' ? 'right-3' : 'left-1/2 -translate-x-1/2'
          }`} />
        </span>
      )}
    </span>
  );
}
