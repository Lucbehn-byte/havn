import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function InfoTooltip({ title, text, align = 'center' }) {
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

  return (
    <span className="relative inline-flex items-center ml-1 align-middle" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-slate-800"
        aria-label="Info anzeigen"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span 
          className={`absolute bottom-full mb-2 z-50 w-64 p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-left pointer-events-none animate-fadeIn ${
            align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          {title && (
            <span className="block text-xs font-bold text-white mb-1">
              {title}
            </span>
          )}
          <span className="block text-[11px] leading-relaxed text-slate-300 font-normal">
            {text}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700/80 w-0 h-0"></span>
        </span>
      )}
    </span>
  );
}
