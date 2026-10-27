import React from 'react';
import { Anchor, CloudLightning, Compass, Swords, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MobileNav({ activeTab, onSelectTab }) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'terminal', label: t('nav.terminal', 'Hafen'), icon: Anchor },
    { id: 'crisis', label: t('nav.crisis', 'Sturm'), icon: CloudLightning },
    { id: 'goals', label: t('nav.goals', 'Kompass'), icon: Compass },
    { id: 'battle', label: t('nav.battle', 'Duell'), icon: Swords },
    { id: 'academy', label: t('nav.academy', 'Logbuch'), icon: BookOpen },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pt-1 pointer-events-none"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav className="max-w-md mx-auto liquid-glass-mobile rounded-3xl p-1.5 shadow-2xl flex items-center justify-between pointer-events-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'liquid-glass-active text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
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
