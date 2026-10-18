import React, { useState } from 'react';
import { Swords, Trophy, ShieldAlert, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

const ASSETS = [
  // 1. Kern- & Welt-ETFs (Fokus auf langfristigen Vermögensaufbau)
  { symbol: 'EUNL.DE', name: 'iShares Core MSCI World ETF', category: 'Welt-ETF', sortino: 1.10, sharpe: 0.88, maxDd: -21.7, vol: 14.1, beta: 1.00, cvar: -6.8, winRate: 86, return5Y: 77, ter: 0.20, diversification: '~1.500 Unternehmen' },
  { symbol: 'VWCE.DE', name: 'Vanguard FTSE All-World ETF', category: 'Welt-ETF', sortino: 1.09, sharpe: 0.87, maxDd: -21.1, vol: 13.7, beta: 0.98, cvar: -6.5, winRate: 85, return5Y: 72, ter: 0.22, diversification: '~3.700 Unternehmen' },
  { symbol: 'SXR8.DE', name: 'iShares Core S&P 500 ETF', category: 'US-Leitindex ETF', sortino: 1.16, sharpe: 0.94, maxDd: -23.3, vol: 15.1, beta: 1.05, cvar: -7.1, winRate: 84, return5Y: 88, ter: 0.07, diversification: '500 Top-US-Konzerne' },
  { symbol: 'EXS1.DE', name: 'iShares Core DAX ETF', category: 'Deutschland ETF', sortino: 0.82, sharpe: 0.65, maxDd: -26.7, vol: 17.2, beta: 1.12, cvar: -8.9, winRate: 91, return5Y: 61, ter: 0.16, diversification: '40 deutsche Leitbetriebe' },
  { symbol: 'IS3N.DE', name: 'iShares Core EM IMI (Emerging Markets)', category: 'Schwellenländer ETF', sortino: 0.66, sharpe: 0.52, maxDd: -22.0, vol: 16.8, beta: 0.85, cvar: -8.2, winRate: 76, return5Y: 46, ter: 0.18, diversification: '~3.000 Unternehmen' },
  { symbol: '2B76.DE', name: 'iShares Automation & Robotics ETF', category: 'Themen-ETF', sortino: 0.58, sharpe: 0.48, maxDd: -35.5, vol: 24.7, beta: 1.35, cvar: -12.4, winRate: 82, return5Y: 62, ter: 0.40, diversification: '~130 Zukunftsunternehmen' },

  // 2. Führende Einzelaktien
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'US-Qualitätsaktie', sortino: 0.98, sharpe: 0.82, maxDd: -33.4, vol: 28.0, beta: 1.15, cvar: -11.5, winRate: 85, return5Y: 140, ter: 0.0, diversification: '1 Einzelaktie' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Cloud & Software', sortino: 0.67, sharpe: 0.61, maxDd: -37.1, vol: 28.2, beta: 1.18, cvar: -12.0, winRate: 71, return5Y: 79, ter: 0.0, diversification: '1 Einzelaktie' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'KI & Halbleiter', sortino: 1.80, sharpe: 1.45, maxDd: -66.3, vol: 51.9, beta: 2.10, cvar: -21.8, winRate: 90, return5Y: 868, ter: 0.0, diversification: '1 Einzelaktie' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'E-Commerce & Cloud', sortino: 0.32, sharpe: 0.35, maxDd: -55.7, vol: 36.5, beta: 1.30, cvar: -15.4, winRate: 80, return5Y: 45, ter: 0.0, diversification: '1 Einzelaktie' },

  // 3. Führende Kryptowährungen
  { symbol: 'BTC-EUR', name: 'Bitcoin (EUR)', category: 'Kryptowährung', sortino: 0.21, sharpe: 0.28, maxDd: -73.6, vol: 41.6, beta: 1.40, cvar: -24.5, winRate: 65, return5Y: 37, ter: 0.0, diversification: '1 Krypto-Asset (Dezentral)' },
  { symbol: 'ETH-EUR', name: 'Ethereum (EUR)', category: 'Kryptowährung', sortino: -0.20, sharpe: -0.12, maxDd: -77.2, vol: 56.2, beta: 1.75, cvar: -29.0, winRate: 56, return5Y: -33, ter: 0.0, diversification: '1 Smart-Contract-Netzwerk' },
];

export default function AssetBattle({ experienceMode = 'beginner' }) {
  const [assetA, setAssetA] = useState(ASSETS[0].symbol);
  const [assetB, setAssetB] = useState(ASSETS[1].symbol);

  const dataA = ASSETS.find(a => a.symbol === assetA) || ASSETS[0];
  const dataB = ASSETS.find(a => a.symbol === assetB) || ASSETS[1];

  // Punktestand ermitteln
  let scoreA = 0;
  let scoreB = 0;

  // 1. 5-Jahres-Rendite
  if (dataA.return5Y > dataB.return5Y) scoreA++; else if (dataB.return5Y > dataA.return5Y) scoreB++;
  // 2. Sortino-Ratio
  if (dataA.sortino > dataB.sortino) scoreA++; else if (dataB.sortino > dataA.sortino) scoreB++;
  // 3. Max Drawdown (höher/weniger negativ ist besser)
  if (dataA.maxDd > dataB.maxDd) scoreA++; else if (dataB.maxDd > dataA.maxDd) scoreB++;
  // 4. Gewinn-Wahrscheinlichkeit
  if (dataA.winRate > dataB.winRate) scoreA++; else if (dataB.winRate > dataA.winRate) scoreB++;

  // Zusätzliche Runden im Pro-Modus
  if (experienceMode === 'pro') {
    // 5. Sharpe-Ratio
    if (dataA.sharpe > dataB.sharpe) scoreA++; else if (dataB.sharpe > dataA.sharpe) scoreB++;
    // 6. Volatilität (geringer ist besser)
    if (dataA.vol < dataB.vol) scoreA++; else if (dataB.vol < dataA.vol) scoreB++;
    // 7. Markt-Beta (näher an 1.0 bzw. geringere Überhitzung; geringer ist defensiver)
    if (dataA.beta < dataB.beta) scoreA++; else if (dataB.beta < dataA.beta) scoreB++;
    // 8. CVaR 95% (höher/weniger negativ ist besser)
    if (dataA.cvar > dataB.cvar) scoreA++; else if (dataB.cvar > dataA.cvar) scoreB++;
    // 9. Laufende Fondskosten TER (geringer ist besser)
    if (dataA.ter < dataB.ter) scoreA++; else if (dataB.ter < dataA.ter) scoreB++;
  }

  const totalRounds = experienceMode === 'pro' ? 9 : 4;
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
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wide">Wertpapier 1</label>
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
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Wertpapier 2</label>
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
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 font-mono font-bold tracking-wide">
            <span className="text-sky-400">{scoreA}</span> : <span className="text-indigo-400">{scoreB}</span> von {totalRounds} Runden
          </span>
        </div>

        <div className="space-y-3">
          {/* Kriterium 1: 5-Jahres-Rendite */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className={`text-lg font-mono font-black ${dataA.return5Y >= dataB.return5Y ? 'text-sky-400' : 'text-slate-500'}`}>
              +{dataA.return5Y}%
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 uppercase block">5-Jahres-Rendite</span>
              <span className="text-[10px] text-slate-500">Gesamtwachstum seit 2021</span>
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
              <span className="text-xs font-bold text-slate-300 uppercase block">Sortino-Ratio</span>
              <span className="text-[10px] text-slate-500">Rendite pro Abwärtsrisiko</span>
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
              <span className="text-[10px] text-slate-500">Tiefster Einbruch in 5 Jahren</span>
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

          {/* ZUSÄTZLICHE PRO-METRIKEN NUR IM PRO-MODUS */}
          {experienceMode === 'pro' && (
            <>
              {/* Pro 1: Sharpe-Ratio */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between ring-1 ring-sky-500/20">
                <div className={`text-lg font-mono font-black ${dataA.sharpe >= dataB.sharpe ? 'text-sky-400' : 'text-slate-500'}`}>
                  {dataA.sharpe.toFixed(2)}
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-sky-400 uppercase block">Sharpe-Ratio (Gesamtrisiko)</span>
                  <span className="text-[10px] text-slate-500">Überschussrendite / Gesamtvolatilität</span>
                </div>
                <div className={`text-lg font-mono font-black ${dataB.sharpe >= dataA.sharpe ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {dataB.sharpe.toFixed(2)}
                </div>
              </div>

              {/* Pro 2: Annualisierte Volatilität */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className={`text-lg font-mono font-black ${dataA.vol <= dataB.vol ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {dataA.vol}%
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-300 uppercase block">Annualisierte Volatilität (σ)</span>
                  <span className="text-[10px] text-slate-500">Geringere Schwankungsbreite gewinnt</span>
                </div>
                <div className={`text-lg font-mono font-black ${dataB.vol <= dataA.vol ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {dataB.vol}%
                </div>
              </div>

              {/* Pro 3: Markt-Beta */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className={`text-lg font-mono font-black ${dataA.beta <= dataB.beta ? 'text-sky-400' : 'text-slate-500'}`}>
                  {dataA.beta.toFixed(2)}
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-300 uppercase block">Markt-Beta (Sensitivität)</span>
                  <span className="text-[10px] text-slate-500">Ausschlag im Verhältnis zum Weltmarkt</span>
                </div>
                <div className={`text-lg font-mono font-black ${dataB.beta <= dataA.beta ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {dataB.beta.toFixed(2)}
                </div>
              </div>

              {/* Pro 4: Conditional Value at Risk (CVaR 95%) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className={`text-lg font-mono font-black ${dataA.cvar >= dataB.cvar ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dataA.cvar}%
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-300 uppercase block">CVaR 95% (Tail Risk)</span>
                  <span className="text-[10px] text-slate-500">Erwarteter Monatsverlust im Extremfall</span>
                </div>
                <div className={`text-lg font-mono font-black ${dataB.cvar >= dataA.cvar ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dataB.cvar}%
                </div>
              </div>

              {/* Pro 5: Diversifikation & Gebühren (TER) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="text-left font-mono">
                  <div className="text-xs font-black text-sky-400">{dataA.ter > 0 ? `${dataA.ter}% TER` : 'Keine TER'}</div>
                  <div className="text-[10px] text-slate-400">{dataA.diversification}</div>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-300 uppercase block">Kosten & Streuung</span>
                  <span className="text-[10px] text-slate-500">Laufende Kosten (TER) / Korbgröße</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-indigo-400">{dataB.ter > 0 ? `${dataB.ter}% TER` : 'Keine TER'}</div>
                  <div className="text-[10px] text-slate-400">{dataB.diversification}</div>
                </div>
              </div>
            </>
          )}
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
