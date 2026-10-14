import React, { useState } from 'react';
import { Swords, Trophy, ShieldAlert, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

const ASSETS = [
  { symbol: 'EUNL.DE', name: 'iShares Core MSCI World', category: 'Welt-ETF', sortino: 1.85, maxDd: -33.6, vol: 14.8, winRate: 92, return5Y: 72 },
  { symbol: 'SXR8.DE', name: 'iShares S&P 500 (USA)', category: 'US-Index', sortino: 2.15, maxDd: -34.1, vol: 17.2, winRate: 94, return5Y: 104 },
  { symbol: 'APC.DE', name: 'Apple Inc.', category: 'Tech-Aktie', sortino: 1.95, maxDd: -38.5, vol: 24.5, winRate: 88, return5Y: 145 },
  { symbol: 'MSF.DE', name: 'Microsoft Corp.', category: 'Tech-Aktie', sortino: 2.10, maxDd: -35.2, vol: 22.1, winRate: 90, return5Y: 130 },
  { symbol: 'AMZ.DE', name: 'Amazon.com Inc.', category: 'E-Commerce / Cloud', sortino: 1.45, maxDd: -55.8, vol: 29.8, winRate: 82, return5Y: 88 },
  { symbol: '2B76.DE', name: 'iShares Automation & Robotics', category: 'Themen-ETF', sortino: 1.25, maxDd: -42.0, vol: 25.1, winRate: 78, return5Y: 45 },
];

export default function AssetBattle() {
  const [assetA, setAssetA] = useState(ASSETS[0].symbol);
  const [assetB, setAssetB] = useState(ASSETS[1].symbol);

  const dataA = ASSETS.find(a => a.symbol === assetA) || ASSETS[0];
  const dataB = ASSETS.find(a => a.symbol === assetB) || ASSETS[1];

  // Punktestand ermitteln
  let scoreA = 0;
  let scoreB = 0;

  if (dataA.return5Y > dataB.return5Y) scoreA++; else scoreB++;
  if (dataA.sortino > dataB.sortino) scoreA++; else scoreB++;
  if (dataA.maxDd > dataB.maxDd) scoreA++; else scoreB++; // Weniger Minus ist besser!
  if (dataA.winRate > dataB.winRate) scoreA++; else scoreB++;

  const winner = scoreA > scoreB ? dataA : (scoreB > scoreA ? dataB : null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Asset-Battle (Direkt-Duell)</h2>
            <p className="text-xs text-slate-400">Vergleiche zwei deiner Favoriten auf Basis stochastischer Stabilität und Krisenresistenz.</p>
          </div>
        </div>

        {/* Auswahlschalter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wide">Kämpfer A (Blau)</label>
            <select
              value={assetA}
              onChange={(e) => setAssetA(e.target.value)}
              className="w-full bg-slate-950 border border-sky-500/50 rounded-2xl p-3 text-sm font-bold text-white focus:outline-none"
            >
              {ASSETS.map(a => (
                <option key={a.symbol} value={a.symbol} disabled={a.symbol === assetB}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Kämpfer B (Lila)</label>
            <select
              value={assetB}
              onChange={(e) => setAssetB(e.target.value)}
              className="w-full bg-slate-950 border border-indigo-500/50 rounded-2xl p-3 text-sm font-bold text-white focus:outline-none"
            >
              {ASSETS.map(a => (
                <option key={a.symbol} value={a.symbol} disabled={a.symbol === assetA}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Duell-Vergleichs-Tabelle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Quant-Vergleichskriterien</span>
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
            {scoreA} : {scoreB} Runden
          </span>
        </div>

        <div className="space-y-3">
          {/* Kriterium 1: Rendite 5 Jahre */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className={`text-lg font-mono font-black ${dataA.return5Y >= dataB.return5Y ? 'text-sky-400' : 'text-slate-500'}`}>
              +{dataA.return5Y}%
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase block">5-Jahres-Rendite</span>
              <span className="text-[10px] text-slate-500">Gesamtwachstum</span>
            </div>
            <div className={`text-lg font-mono font-black ${dataB.return5Y >= dataA.return5Y ? 'text-indigo-400' : 'text-slate-500'}`}>
              +{dataB.return5Y}%
            </div>
          </div>

          {/* Kriterium 2: Sortino-Ratio */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className={`text-lg font-mono font-black ${dataA.sortino >= dataB.sortino ? 'text-sky-400' : 'text-slate-500'}`}>
              {dataA.sortino.toFixed(2)}
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase block">Sortino-Ratio (Präzision)</span>
              <span className="text-[10px] text-slate-500">Rendite pro Verlustrisiko</span>
            </div>
            <div className={`text-lg font-mono font-black ${dataB.sortino >= dataA.sortino ? 'text-indigo-400' : 'text-slate-500'}`}>
              {dataB.sortino.toFixed(2)}
            </div>
          </div>

          {/* Kriterium 3: Maximaler Drawdown */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className={`text-lg font-mono font-black ${dataA.maxDd >= dataB.maxDd ? 'text-emerald-400' : 'text-slate-500'}`}>
              {dataA.maxDd}%
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase block">Maximaler Crash-Rücksetzer</span>
              <span className="text-[10px] text-slate-500">Geringerer Absturz gewinnt</span>
            </div>
            <div className={`text-lg font-mono font-black ${dataB.maxDd >= dataA.maxDd ? 'text-emerald-400' : 'text-slate-500'}`}>
              {dataB.maxDd}%
            </div>
          </div>

          {/* Kriterium 4: Rollierende Win-Rate */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className={`text-lg font-mono font-black ${dataA.winRate >= dataB.winRate ? 'text-sky-400' : 'text-slate-500'}`}>
              {dataA.winRate}%
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase block">Gewinn-Wahrscheinlichkeit</span>
              <span className="text-[10px] text-slate-500">Historische 1-Jahres-Erfolgsrate</span>
            </div>
            <div className={`text-lg font-mono font-black ${dataB.winRate >= dataA.winRate ? 'text-indigo-400' : 'text-slate-500'}`}>
              {dataB.winRate}%
            </div>
          </div>
        </div>

        {/* Fazit */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> HAVN-Urteil:
          </div>
          {winner ? (
            <p>
              In puncto Stabilität und Ausgewogenheit setzt sich <strong>{winner.name}</strong> ({winner.symbol}) durch. 
              {winner.category === 'Welt-ETF' 
                ? ' Als Welt-ETF bietet er das sicherste Fundament für langfristigen Vermögensaufbau mit minimalem Klumpenrisiko.' 
                : ' Er überzeugt durch überragende Risikoadjustierung bei gleichzeitig dynamischer Rendite.'}
            </p>
          ) : (
            <p>Unentschieden! Beide Investments ergänzen sich hervorragend in einem diversifizierten Portfolio.</p>
          )}
        </div>
      </div>
    </div>
  );
}
