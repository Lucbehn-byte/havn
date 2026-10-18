import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';

export default function SearchBar({ onSelectAsset, presets = {}, currentTicker = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Klick außerhalb schließt das Such-Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Mousedown & pointerdown außerhalb
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Debounced Suche
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Fehler bei der Suche:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol, name) => {
    onSelectAsset(symbol, name);
    setQuery('');
    setIsOpen(false);
  };

  const presetList = Object.entries(presets);

  return (
    <div className="w-full" ref={containerRef}>
      {/* Suchfeld */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={currentTicker ? `Aktuell gewählt: ${currentTicker} – Neue Aktie/ETF suchen...` : "Aktie, ETF oder Ticker suchen (z. B. Tesla, BMW, MSCI World, NVDA, Apple)..."}
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-xl transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-4 w-5 h-5 text-sky-400 animate-spin" />
          )}
        </div>

        {/* Dropdown Trefferliste */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800 backdrop-blur-xl">
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item.symbol, item.name);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(item.symbol, item.name);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/80 active:bg-sky-600/30 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 group-hover:bg-sky-500/20">
                    {item.type === 'ETF' ? 'ETF' : 'AKT'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-sky-300">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Symbol: <span className="text-sky-400 font-bold">{item.symbol}</span> {item.exchange && `• ${item.exchange}`}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Auswählen →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schnellauswahl-Chips: Professionell mit WKN und Typ-Badge */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'MSCI World', symbol: 'EUNL.DE', wkn: 'A0RPWH', tag: 'Welt-ETF' },
          { label: 'All-World', symbol: 'VWCE.DE', wkn: 'A2PKXG', tag: 'Welt-ETF' },
          { label: 'S&P 500', symbol: 'SXR8.DE', wkn: 'A0YEDG', tag: 'US 500' },
          { label: 'DAX 40', symbol: 'EXS1.DE', wkn: '593393', tag: 'Deutschland' },
          { label: 'Apple', symbol: 'AAPL', wkn: '865985', tag: 'Qualitätsaktie' },
          { label: 'NVIDIA', symbol: 'NVDA', wkn: '918422', tag: 'Halbleiter/KI' },
          { label: 'Bitcoin', symbol: 'BTC-EUR', wkn: 'Krypto', tag: 'Dezentral' },
        ].map((item) => {
          const isActive = currentTicker === item.symbol;
          return (
            <button
              key={item.symbol}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectAsset(item.symbol, item.label);
              }}
              onClick={(e) => {
                e.preventDefault();
                onSelectAsset(item.symbol, item.label);
              }}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer select-none ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20 font-bold'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {item.wkn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
