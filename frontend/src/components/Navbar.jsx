import React from 'react';
import { Anchor, CloudLightning, Compass, Swords, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, onReset, experienceMode = 'beginner', onToggleMode }) {
  const tabs = [
    { id: 'terminal', label: 'Hafen', icon: Anchor },
    { id: 'crisis', label: 'Sturm', icon: CloudLightning },
    { id: 'goals', label: 'Kompass', icon: Compass },
    { id: 'battle', label: 'Duell', icon: Swords },
    { id: 'academy', label: 'Logbuch', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <div 
          onClick={() => { onSelectTab('terminal'); if (onReset) onReset(); }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform bg-transparent">
            <img src="/apple-touch-icon.png" alt="HAVN Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">HAVN</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                experienceMode === 'beginner' 
                  ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400' 
                  : 'bg-sky-950 border-sky-800 text-sky-400'
              }`}>
                {experienceMode === 'beginner' ? 'Basic' : 'Pro'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Dein sicherer Hafen für Aktien & ETFs</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Rechte Controls: Modus Switcher & Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Basic / Pro Umschalter: Im Hafen ('terminal'), Duell ('battle') und Logbuch ('academy') sichtbar */}
          {onToggleMode && (activeTab === 'terminal' || activeTab === 'battle' || activeTab === 'academy') && (
            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center shadow-inner animate-fadeIn">
              <button
                type="button"
                onClick={() => onToggleMode('beginner')}
                className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                  experienceMode === 'beginner'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => onToggleMode('pro')}
                className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                  experienceMode === 'pro'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pro
              </button>
            </div>
          )}

          {/* Live Status Punkt */}
          <span className="hidden sm:inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden md:inline">Live API</span>
          </span>
        </div>
      </div>
    </header>
  );
}
