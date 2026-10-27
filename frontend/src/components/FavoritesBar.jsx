import React from 'react';
import { Star, TrendingUp, X, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DEFAULT_FAVORITES = [
  { symbol: 'EUNL.DE', name: 'MSCI World', category: 'Welt-ETF' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Tech-Aktie' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'KI & Chips' },
  { symbol: 'SAP.DE', name: 'SAP SE', category: 'Software' },
];

export function getStoredFavorites() {
  try {
    const raw = localStorage.getItem('havn_favorites');
    if (!raw) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITES;
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function saveStoredFavorites(favs) {
  try {
    localStorage.setItem('havn_favorites', JSON.stringify(favs));
  } catch (e) {
    console.error("Fehler beim Speichern der Favoriten:", e);
  }
}

export default function FavoritesBar({ 
  currentTicker = '', 
  onSelectAsset, 
  favorites = [], 
  onToggleFavorite 
}) {
  const { t } = useLanguage();
  const isCurrentFavorite = favorites.some(
    f => f.symbol.toUpperCase() === currentTicker.toUpperCase()
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>{t('modals.watchlist.title', 'Deine Watchlist & Favoriten:')}</span>
        </div>

        {/* Quick-Info */}
        <span className="text-[11px] text-slate-400">
          {t('modals.watchlist.hint', 'Lokal gespeichert • Kein Login nötig')}
        </span>
      </div>

      {/* Horizontale Scroll-Leiste im Liquid-Glass Design */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
        {favorites.map((fav) => {
          const isActive = fav.symbol.toUpperCase() === currentTicker.toUpperCase();
          return (
            <div
              key={fav.symbol}
              className={`group relative shrink-0 flex items-center rounded-2xl transition-all duration-300 border ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 via-sky-400/15 to-indigo-500/20 text-white border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl'
                  : 'bg-slate-900/50 hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08] hover:border-white/20 backdrop-blur-md'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectAsset(fav.symbol)}
                className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 text-xs font-bold cursor-pointer"
              >
                <Star className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                <span className="tracking-tight">{fav.name || fav.symbol}</span>
                <span className="font-mono text-[10px] opacity-70 px-1 py-0.2 rounded bg-black/30">
                  {fav.symbol}
                </span>
              </button>

              {/* Entfernen Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(fav.symbol, fav.name);
                }}
                className="pr-2 pl-0.5 py-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer opacity-40 group-hover:opacity-100"
                title={`${fav.name} ${t('modals.watchlist.removeTitle', 'aus Favoriten entfernen')}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
