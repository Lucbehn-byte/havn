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
    <header className="sticky top-0 z-40 w-full liquid-glass-header transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <div 
          onClick={() => { onSelectTab('terminal'); if (onReset) onReset(); }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform bg-slate-900/40 p-0.5 border border-white/10">
            <img src="/apple-touch-icon.png" alt="HAVN Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">HAVN</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${
                experienceMode === 'beginner' 
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400' 
                  : 'bg-sky-500/10 border-sky-400/30 text-sky-400'
              }`}>
                {experienceMode === 'beginner' ? 'Basic' : 'Pro'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Dein sicherer Hafen für Aktien & ETFs</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 liquid-glass-pill p-1.5 rounded-2xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'liquid-glass-active text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
            <div className="liquid-glass-pill p-1 rounded-2xl flex items-center animate-fadeIn">
              <button
                type="button"
                onClick={() => onToggleMode('beginner')}
                className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                  experienceMode === 'beginner'
                    ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-md shadow-emerald-500/20 border border-white/20'
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
                    ? 'liquid-glass-active text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pro
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
