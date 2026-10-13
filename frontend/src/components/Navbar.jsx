import React from 'react';
import { Anchor, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ onReset }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">HAVN</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-400">
                Quant v3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Dein sicherer Hafen für Aktien & ETFs</p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Merton Jump-Diffusion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>EWMA & Sortino-Präzision</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live API Aktiv</span>
          </span>
        </div>
      </div>
    </header>
  );
}
