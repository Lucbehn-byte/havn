import React, { useState } from 'react';
import { ShieldCheck, HeartHandshake, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Copy, Check, Clock, ArrowRight } from 'lucide-react';

export default function BeginnerView({ data, invType, sparplanFreq, onSwitchToPro }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isEtf = data.fundamental?.is_etf || data.asset_info?.typ?.toLowerCase().includes('etf') || data.ticker.includes('.DE');
  const assetName = data.asset_info?.name || data.ticker;
  const isin = data.asset_info?.isin || '';

  const monteCarlo = data.monte_carlo || {};
  const invested = monteCarlo.eingezahltes_kapital ?? 0;
  const expectedProfit = monteCarlo.erwarteter_gewinn ?? 0;
  const expectedEndwert = monteCarlo.erwarteter_endwert ?? 0;
  const expectedReturn = monteCarlo.expected_return_pct ?? 0;
  const probUp = monteCarlo.prob_up ?? 85;

  const formatEuro = (val) => `${Math.round(val).toLocaleString('de-DE')} €`;

  const copyIsin = () => {
    if (isin) {
      navigator.clipboard.writeText(isin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Begrüßungs- & Orientierungs-Banner */}
      <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Einsteiger-Perspektive: {assetName}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Dein Vermögensaufbau einfach erklärt
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hier siehst du ohne Fachchinesisch, was aus deinem Geld werden kann, wie sicher es angelegt ist und warum Zeit der wichtigste Erfolgsfaktor an der Börse ist.
            </p>
          </div>

          <button
            type="button"
            onClick={onSwitchToPro}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-sky-300 hover:text-white transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-lg"
          >
            <span>Zu den mathematischen Quant-Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Die 3 großen Zahlen für Einsteiger */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Eingezahltes Geld */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400">1. Dein Geldeinsatz</span>
          <div className="text-2xl md:text-3xl font-black font-mono text-white my-2">
            {formatEuro(invested)}
          </div>
          <span className="text-xs text-slate-400">
            {invType === 'Sparplan' ? `Über deinen Sparplan angespart` : 'Einmalig angelegt'}
          </span>
        </div>

        {/* Voraussichtlicher Endwert */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between bg-gradient-to-b from-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">2. Erwarteter Depotwert</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              +{expectedReturn.toFixed(0)}%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black font-mono text-emerald-400 my-2">
            {formatEuro(expectedEndwert)}
          </div>
          <span className="text-xs text-emerald-300/80 font-medium">
            Gewinn: <strong className="text-emerald-300">+{formatEuro(expectedProfit)}</strong> durch Zinseszins
          </span>
        </div>

        {/* Erfolgs-Wahrscheinlichkeit */}
        <div className="bg-slate-900/90 border border-sky-900/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between bg-gradient-to-b from-slate-900 to-sky-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400">3. Erfolgs-Wahrscheinlichkeit</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
              Stochastik
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black font-mono text-sky-400 my-2">
            {probUp}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full" style={{ width: `${probUp}%` }}></div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {probUp >= 80 ? 'Sehr hohe Wahrscheinlichkeit auf einen Wertzuwachs.' : 'Normale Marktschwankung je nach Haltedauer.'}
          </span>
        </div>
      </div>

      {/* 3. Der Sicherheits-Check (Sondervermögen & Schutz) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Sicherheits- & Risikocheck für {assetName}</h3>
            <p className="text-xs text-slate-400">Wie sicher ist dein investiertes Geld vor Pleiten und Krisen geschützt?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Punkt 1: Schutz vor Bankenpleite */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Gesetzlich geschützt (Sondervermögen)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deine Wertpapiere gehören zu 100% dir. Selbst wenn dein Broker oder die Fondsgesellschaft pleitegehen sollte, ist dein Depot gesetzlich vor Gläubigern geschützt.
            </p>
          </div>

          {/* Punkt 2: Diversifikation vs. Klumpenrisiko */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className={`flex items-center gap-2 font-bold text-xs ${isEtf ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isEtf ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{isEtf ? 'Maximal gestreut (Kein Einzelfirmen-Risiko)' : 'Einzelaktie (Klumpenrisiko beachten)'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isEtf 
                ? 'Du kaufst mit einem Klick Anteile an Hunderten oder Tausenden Firmen weltweit. Selbst wenn 10 Firmen pleitegehen, fangen die anderen 1.490 das auf.'
                : 'Du setzt auf den Erfolg eines einzelnen Unternehmens. Für Einsteiger empfehlen wir, das Fundament deines Vermögens zuerst mit einem Welt-ETF aufzubauen.'
              }
            </p>
          </div>

          {/* Punkt 3: Schwankungen & Verlustangst */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Schwankungen sind völlig normal</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kurse bewegen sich täglich auf und ab wie die Wellen im Meer. Solange du nicht im Minus verkaufst, realisierst du keinen Verlust. Geduld ist die stärkste Renditequelle.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Der 15-Jahre-Beweis: Zeit schlägt Timing */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Das wichtigste Gesetz: Zeit schlägt Timing</h3>
            <p className="text-xs text-slate-400">Warum du dir keine Sorgen um den „perfekten Einstiegszeitpunkt“ machen musst.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/40 text-xs text-slate-300 leading-relaxed space-y-3">
          <p>
            Viele Anfänger zögern monatelang, weil sie Angst haben, kurz vor einem Crash einzusteigen. 
            Historische Daten von globalen Indizes (wie dem MSCI World) zeigen jedoch ein klares Bild:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Haltedauer 1 Jahr</div>
              <div className="text-base font-black text-amber-400 mt-0.5">~25% Verlustrisiko</div>
              <div className="text-[10px] text-slate-400 mt-1">Starkes Rauschen & Tagesschwankungen</div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Haltedauer 5 Jahre</div>
              <div className="text-base font-black text-sky-400 mt-0.5">~10% Verlustrisiko</div>
              <div className="text-[10px] text-slate-400 mt-1">Die Mehrheit der Zeitfenster ist im Plus</div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20">
              <div className="text-emerald-400 text-[11px] font-bold">Haltedauer 15+ Jahre</div>
              <div className="text-base font-black text-emerald-400 mt-0.5">0,0% Verlustrisiko</div>
              <div className="text-[10px] text-emerald-300/80 mt-1">Historisch gab es noch nie einen Verlust</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Basierend auf den rollierenden 15-Jahres-Renditen des MSCI World Index seit 1970 inklusive aller Krisen (Dotcom-Blase, 2008 Finanzkrise, Corona-Crash 2020).
          </p>
        </div>
      </div>

      {/* 5. 3-Schritte-Fahrplan zur ersten Ausführung */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <span>Dein 3-Schritte-Fahrplan zur Umsetzung</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Schritt 1 */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
              Schritt 1
            </span>
            <div className="text-sm font-bold text-white">Kostenloses Depot eröffnen</div>
            <p className="text-xs text-slate-400">
              Wähle einen modernen, günstigen Broker (z. B. Trade Republic, Scalable Capital, ING), bei dem Sparpläne kostenlos ausgeführt werden.
            </p>
          </div>

          {/* Schritt 2 */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
              Schritt 2
            </span>
            <div className="text-sm font-bold text-white flex items-center justify-between">
              <span>Wertpapier suchen</span>
              {isin && (
                <button
                  type="button"
                  onClick={copyIsin}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Kopiert!' : 'ISIN kopieren'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Gib in der Suche deines Brokers die Kennnummer <strong className="text-white font-mono">{isin || data.ticker}</strong> ein.
            </p>
          </div>

          {/* Schritt 3 */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              Schritt 3
            </span>
            <div className="text-sm font-bold text-white">Sparplan aktivieren & vergessen</div>
            <p className="text-xs text-slate-400">
              Richte die monatliche Sparrate zum Monatsanfang ein. Lasse den Dauerauftrag einfach laufen und schaue nicht jeden Tag auf den Kurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
