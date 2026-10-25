import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, Smartphone, Monitor, TrendingUp, RefreshCw, X, Zap, ShieldCheck } from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/stats');
      if (!res.ok) throw new Error('Statistiken konnten nicht geladen werden');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayViews = stats?.today?.views ?? 0;
  const todayUniques = stats?.today?.uniques ?? 0;
  const totalViews = stats?.total?.views ?? 0;
  const totalUniques = stats?.total?.uniques ?? 0;

  const devices = stats?.devices || { ios: 0, android: 0, desktop: 0 };
  const totalDevices = (devices.ios || 0) + (devices.android || 0) + (devices.desktop || 0) || 1;
  const iosPct = Math.round(((devices.ios || 0) / totalDevices) * 100);
  const androidPct = Math.round(((devices.android || 0) / totalDevices) * 100);
  const desktopPct = Math.round(((devices.desktop || 0) / totalDevices) * 100);

  const recentDays = stats?.recent_days || [];
  const maxDayViews = Math.max(...recentDays.map((d) => d.views), 5);

  const topTickers = stats?.top_tickers || [];
  const cacheStats = stats?.cache || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl liquid-glass rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-900/95 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>HAVN Live-Statistiken</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  DSGVO-konform
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Besucher, Seitenaufrufe & System-Performance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Neu laden"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* KPI Karten */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Heute Uniques */}
            <div className="glass-inset rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Heute (Besucher)</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {todayUniques}
              </div>
            </div>

            {/* Heute Views */}
            <div className="glass-inset rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Heute (Aufrufe)</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {todayViews}
              </div>
            </div>

            {/* Gesamt Uniques */}
            <div className="glass-inset rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gesamt (Besucher)</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalUniques}
              </div>
            </div>

            {/* Gesamt Views */}
            <div className="glass-inset rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>Gesamt (Aufrufe)</span>
              </div>
              <div className="text-2xl font-black text-purple-300 font-mono">
                {totalViews}
              </div>
            </div>
          </div>

          {/* Tagesverlauf der letzten 14 Tage */}
          <div className="liquid-glass rounded-2xl p-4 border border-white/10">
            <h4 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>Tagesverlauf (Letzte 14 Tage)</span>
              <span className="text-[10px] text-slate-400 font-normal">Aufrufe & Uniques</span>
            </h4>
            
            <div className="h-28 flex items-end gap-1.5 pt-4">
              {recentDays.map((d, idx) => {
                const heightPct = Math.max(8, Math.round((d.views / maxDayViews) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div 
                      className="w-full bg-gradient-to-t from-sky-500/40 to-sky-400 rounded-md transition-all group-hover:from-sky-400 group-hover:to-sky-300 relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-950 px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/20 whitespace-nowrap z-10">
                        {d.views} Aufrufe ({d.uniques} Besucher)
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono scale-90">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zwei Spalten: Geräte & Beliebteste Aktien */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gerätetypen */}
            <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Geräteverteilung</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300">iPhone / iPad</span>
                    <span className="font-mono text-white font-bold">{iosPct} % ({devices.ios || 0})</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${iosPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Android</span>
                    <span className="font-mono text-white font-bold">{androidPct} % ({devices.android || 0})</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${androidPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Desktop / PC / Mac</span>
                    <span className="font-mono text-white font-bold">{desktopPct} % ({devices.desktop || 0})</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${desktopPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Beliebteste Aktien */}
            <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Meistgesuchte Wertpapiere</span>
              </h4>

              {topTickers.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {topTickers.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-xs">
                      <span className="font-mono font-bold text-sky-300">{t.ticker}</span>
                      <span className="text-[11px] text-slate-400">{t.count}x analysiert</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Noch keine Analysen aufgezeichnet.</p>
              )}
            </div>
          </div>

          {/* 15-Minuten Cache Performance */}
          <div className="glass-inset rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">15-Minuten Memory Cache</h4>
                <p className="text-[11px] text-slate-400">
                  {cacheStats.hits ?? 0} Treffer ({cacheStats.hit_ratio_percent ?? 0} % gespart) • {cacheStats.active_entries ?? 0} im RAM
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">Aktiv</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% ohne Tracking-Cookies oder persönliche IP-Speicherung</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-active px-4 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
}
