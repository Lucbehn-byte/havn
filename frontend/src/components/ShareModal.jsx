import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function ShareModal({ 
  isOpen = false, 
  onClose, 
  data = {}, 
  invType = 'Sparplan', 
  kapital = 100, 
  timeframe = '1 Jahr (Jahres-Trend)' 
}) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !data || !data.ticker) return null;

  const ticker = data.ticker;
  const assetName = data.asset_info?.name || ticker;
  const currentPrice = data.current_price || 0;
  const mc = data.monte_carlo || {};
  const expectedEndwert = mc.erwarteter_endwert ?? 0;
  const expectedProfit = mc.erwarteter_gewinn ?? 0;
  const probUp = mc.prob_up ?? 70;
  const returnPct = mc.expected_return_pct ?? 0;

  // Formatierter Text für WhatsApp & Messenger
  const shareText = `📊 HAVN Quant-Analyse für ${assetName} (${ticker}):
  
💰 Strategie: ${invType} (${Number(kapital).toLocaleString('de-DE')} €)
🎯 Prognostizierter Endwert: ${Math.round(expectedEndwert).toLocaleString('de-DE')} € (${returnPct > 0 ? '+' : ''}${returnPct.toFixed(1)}%)
🛡️ Gewinn-Wahrscheinlichkeit: ${probUp}%
📈 Aktueller Kurs: ${currentPrice.toFixed(2)} €

Analysiert mit HAVN – Dein sicherer Hafen für Aktien & ETFs ⚓`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error("Kopieren fehlgeschlagen:", e);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}?ticker=${encodeURIComponent(ticker)}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error("Link kopieren fehlgeschlagen:", e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HAVN Analyse: ${assetName}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Teilen fehlgeschlagen:", err);
        }
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Liquid Glass Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-white/20 overflow-hidden space-y-5">
        
        {/* Glow Effekte */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Analyse-Report teilen</h3>
              <p className="text-xs text-slate-400">Erstelle eine stylische Vorschau zum Versenden.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Die visuelle Report Card Preview (Social-Ready) */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-white/15 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 p-0.5 border border-white/10">
                <img src="/apple-touch-icon.png" alt="HAVN" className="w-full h-full object-cover rounded" />
              </div>
              <span className="font-black text-sm text-white tracking-tight">HAVN Quant-Report</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {ticker}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Analysiertes Wertpapier:</div>
            <div className="text-lg font-black text-white">{assetName}</div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[11px] text-slate-400">Prognostizierter Wert</span>
              <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                {Math.round(expectedEndwert).toLocaleString('de-DE')} €
              </div>
              <span className="text-[10px] text-emerald-300 font-bold">
                {returnPct > 0 ? '+' : ''}{returnPct.toFixed(1)}% Ertrag
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[11px] text-slate-400">Gewinn-Chance</span>
              <div className="text-base font-black font-mono text-sky-300 mt-0.5">
                {probUp}%
              </div>
              <span className="text-[10px] text-slate-400">
                Stochastisch positiv
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.08]">
            <span>{invType}: {Number(kapital).toLocaleString('de-DE')} €</span>
            <span className="text-slate-300 font-mono">havn.app ⚓</span>
          </div>
        </div>

        {/* Buttons zum Teilen */}
        <div className="space-y-2.5 pt-1">
          {/* WhatsApp / Messenger Text Button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4" />
                <span>Text für WhatsApp kopiert!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Zusammenfassung für WhatsApp kopieren</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Native Share (auf Mobilgeräten) */}
            {typeof navigator !== 'undefined' && navigator.share ? (
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2 px-3 rounded-xl font-bold text-xs bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Per App teilen...</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-3 rounded-xl font-bold text-xs bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>Text kopieren</span>
              </button>
            )}

            {/* Link kopieren */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl font-bold text-xs bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link kopiert!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Link kopieren</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
