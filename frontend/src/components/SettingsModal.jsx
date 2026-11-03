import React, { useEffect } from 'react';
import { X, Settings, Globe, Check, Sliders, Shield, RefreshCw, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  experienceMode = 'beginner', 
  onToggleMode 
}) {
  const { language, setLanguage, languages, t } = useLanguage();

  // Schließen bei Escape-Taste
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetData = () => {
    if (window.confirm(t('settings.resetConfirm', 'Möchtest du wirklich alle lokalen Einstellungen und Favoriten zurücksetzen?'))) {
      try {
        localStorage.removeItem('havn_favorites');
        localStorage.removeItem('havn_experience_mode');
        localStorage.removeItem('havn_language');
        alert(t('settings.resetSuccess', 'Einstellungen wurden erfolgreich zurückgesetzt.'));
        window.location.reload();
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl p-5 sm:p-7 glass border border-white/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-b from-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t('settings.title', 'Einstellungen')}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400">
                  HAVN
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('settings.subtitle', 'Sprache, Anzeigemodus & Personalisierung für dein HAVN-Erlebnis')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl glass-chip hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t('settings.close', 'Schließen')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. SEKTION: SPRACHAUSWAHL (10 Sprachen weltweit) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('settings.languageSection', 'Sprache / Language')}</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {languages.length} {t('settings.languagesAvailable', 'Sprachen verfügbar')}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('settings.languageHint', 'Wähle deine bevorzugte Sprache für die gesamte Benutzeroberfläche.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-[300px] overflow-y-auto pr-1">
            {languages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-indigo-500/20 border-sky-400/60 shadow-[0_0_16px_rgba(56,189,248,0.25)] text-white scale-[1.01]'
                      : 'glass-inset border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm select-none">
                      {lang.flag}
                    </span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className="text-white">{lang.nativeName}</span>
                        {lang.nativeName !== lang.name && (
                          <span className="text-[10px] text-slate-400 font-normal">({lang.name})</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {lang.region}
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-400/20 border border-sky-400/40 text-[10px] font-bold text-sky-300">
                      <Check className="w-3 h-3 text-sky-300" />
                      <span>{t('settings.active', 'Aktiv')}</span>
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-white/20 group-hover:border-sky-400/50 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SEKTION: ANZEIGEMODUS (BASIC VS. PRO) */}
        {onToggleMode && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('settings.modeSection', 'Anzeigemodus')}</span>
            </label>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('settings.modeHint', 'Passe den Detaillierungsgrad an dein persönliches Vorwissen an.')}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Basic Modus */}
              <button
                type="button"
                onClick={() => onToggleMode('beginner')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  experienceMode === 'beginner'
                    ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_16px_rgba(52,211,153,0.2)] text-white'
                    : 'glass-inset border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    {t('settings.basicTitle', 'Basic Modus')}
                  </span>
                  {experienceMode === 'beginner' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {t('settings.basicDesc', 'Übersichtlich, verständlich und ideal für Einsteiger & ETF-Sparer.')}
                </p>
              </button>

              {/* Pro Modus */}
              <button
                type="button"
                onClick={() => onToggleMode('pro')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  experienceMode === 'pro'
                    ? 'bg-sky-500/15 border-sky-400/60 shadow-[0_0_16px_rgba(56,189,248,0.2)] text-white'
                    : 'glass-inset border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
                    {t('settings.proTitle', 'Pro Modus')}
                  </span>
                  {experienceMode === 'pro' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {t('settings.proDesc', 'Vollständige stochastische Tiefenanalyse, Candlesticks & Kennzahlen.')}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* 3. SEKTION: APP-INFO & LOKALER SPEICHER */}
        <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('settings.storageActive', 'Lokale Speicherung aktiv')}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">v2.4 (Liquid-Glass)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t('settings.storageDesc', 'Alle Favoriten und Einstellungen bleiben privat auf deinem Gerät gespeichert.')}
          </p>

          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400/90 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('settings.resetBtn', 'App-Cache & Favoriten zurücksetzen')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-active text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              {t('settings.close', 'Schließen')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
