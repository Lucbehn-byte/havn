import React, { useState } from 'react';
import { Smartphone, Copy, Check, Shield, Compass, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BrokerGuide({ assetInfo = {}, invType = 'Einmalanlage', sparplanFreq = 'monatlich', kapital = 1000 }) {
  const { t } = useLanguage();
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text || text === '–' || text.includes('Nicht')) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const name = assetInfo.name || '–';
  const ticker = assetInfo.ticker || '–';
  const isin = assetInfo.isin || '–';
  const wkn = assetInfo.wkn || '–';

  return (
    <div className="glass rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{t('beginner.brokerTitle', 'Nächster Schritt: In deiner Trading-App umsetzen')}</h3>
          <p className="text-xs text-slate-400">
            {t('beginner.brokerDesc', 'HAVN ist dein Orientierungs- und Analysehafen. Den Kauf führst du sicher über dein eigenes Depot durch.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Kennnummern zum Kopieren */}
        <div className="glass-inset rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Kennnummern für deine Broker-Suche:</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg glass">
              <span className="text-slate-400 font-medium">Wertpapiername:</span>
              <span className="font-bold text-white truncate max-w-[200px]">{name}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg glass">
              <span className="text-slate-400 font-medium">ISIN:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-sky-400">
                <span>{isin}</span>
                <button
                  onClick={() => copyToClipboard(isin, 'isin')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="In Zwischenablage kopieren"
                >
                  {copiedKey === 'isin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg glass">
              <span className="text-slate-400 font-medium">WKN:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                <span>{wkn}</span>
                <button
                  onClick={() => copyToClipboard(wkn, 'wkn')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="In Zwischenablage kopieren"
                >
                  {copiedKey === 'wkn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg glass">
              <span className="text-slate-400 font-medium">Symbol / Ticker:</span>
              <span className="font-mono font-bold text-slate-300">{ticker}</span>
            </div>
          </div>
        </div>

        {/* 3 Goldene Regeln für Einsteiger */}
        <div className="glass-inset rounded-xl p-4 space-y-2.5 text-xs">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Die 3 goldenen Einsteiger-Regeln:
          </div>
          <ul className="space-y-2 text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">1.</span>
              <span><strong>Immer Limit-Order:</strong> Wähle niemals <em>'Billigst / Market'</em>, sondern setze ein Kauflimit knapp über dem aktuellen Kurs. Das schützt vor bösen Überraschungen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">2.</span>
              <span><strong>Xetra-Handelszeiten nutzen:</strong> Kaufe werktags zwischen <strong>09:00 und 17:30 Uhr</strong>. Außerhalb dieser Zeiten ist der Spread (Kauf-/Verkaufspanne) oft spürbar teurer.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">3.</span>
              <span><strong>Ruhe bewahren:</strong> Rote Tage an der Börse sind normal. Die historische Datenlage zeigt: Zeit im Markt schlägt Timing im Markt.</span>
            </li>
          </ul>

          {invType === 'Sparplan' && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300 font-medium">
              <strong className="text-white">Sparplan-Tipp:</strong> Richte in deinem Broker einfach einen automatischen Sparplan über {kapital} € • {sparplanFreq} ein – das nimmt Emotionen komplett aus der Entscheidung!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
