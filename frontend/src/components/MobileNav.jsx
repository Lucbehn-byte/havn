import React from 'react';
import { Activity, Flame, Target, Swords, BookOpen } from 'lucide-react';

export default function MobileNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Activity },
    { id: 'crisis', label: 'Krisen', icon: Flame },
    { id: 'goals', label: 'Ziele', icon: Target },
    { id: 'battle', label: 'Battle', icon: Swords },
    { id: 'academy', label: 'Kompass', icon: BookOpen },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-1 pointer-events-none">
      <nav className="max-w-md mx-auto bg-slate-950/95 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-1.5 shadow-2xl flex items-center justify-between pointer-events-auto ring-1 ring-white/5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
