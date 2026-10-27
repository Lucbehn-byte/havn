import React, { useState } from 'react';
import {
  Sparkles, Copy, Check, ArrowRight,
  Coins, Compass, SunMedium, CloudRain, Target, ShieldCheck,
  TrendingUp, Activity, Tag, Users, RotateCcw, CloudLightning,
} from 'lucide-react';
import SimpleAreaChart from './SimpleAreaChart';
import InfoTooltip from './InfoTooltip';
import { getInsights, formatEuro, scoreTone, TONE } from '../utils/insights';
import { useLanguage } from '../context/LanguageContext';

/* ------------------------------------------------------------------ */
/* Bausteine                                                          */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }) {
  const tone = TONE[scoreTone(score)];
  const r = 52;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={tone.hex} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 10px ${tone.hex}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white tracking-tight">{score}</span>
        <span className="text-[10px] font-semibold text-slate-400 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ icon: Icon, label, hint, value, tooltip }) {
  const tone = TONE[scoreTone(value)];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Icon className={`w-3.5 h-3.5 ${tone.text}`} />
          <span>{label}</span>
          {tooltip && (
            <InfoTooltip title={tooltip.title} text={tooltip.text} rule={tooltip.rule} />
          )}
        </span>
        <span className={`font-mono font-bold ${tone.text}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone.bar} animate-growX`} style={{ width: `${value}%` }} />
      </div>
      <p className="text-[10.5px] text-slate-400 leading-snug">{hint}</p>
    </div>
  );
}

function QuestionCard({ icon: Icon, accent, step, question, tooltip, children }) {
  return (
    <div className="glass rounded-3xl p-5 flex flex-col justify-between gap-4 h-full">
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${accent}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Frage {step}</div>
            <h3 className="text-base font-black text-white leading-tight">{question}</h3>
          </div>
        </div>
        {tooltip && (
          <InfoTooltip title={tooltip.title} text={tooltip.text} rule={tooltip.rule} align="right" />
        )}
      </div>
      {children}
    </div>
  );
}

function Pill({ tone = 'sky', children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${TONE[tone].soft}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Basic-Ansicht                                                       */
/* ------------------------------------------------------------------ */

export default function BeginnerView({ data, invType, onSwitchToPro, onNavigateToCrisis }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const ins = getInsights(data, invType);
  if (!data || !ins) return null;

  const isin = data.asset_info?.isin || '';
  const wkn = data.asset_info?.wkn || '';
  const consensus = data.fundamental?.analyst_consensus;
  const { scores, scenarios } = ins;

  const copyIsin = () => {
    if (!isin) return;
    navigator.clipboard.writeText(isin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Szenario-Skala für die Balken */
  const scaleMin = Math.min(scenarios.weak, scenarios.invested) * 0.92;
  const scaleMax = Math.max(scenarios.strong, scenarios.invested) * 1.02;
  const pos = (v) => `${((v - scaleMin) / (scaleMax - scaleMin || 1)) * 100}%`;

  const scenarioRows = [
    { key: 'strong', label: t('beginner.optimistic', 'Optimistisch'), sub: 'Gute Jahre & starker Markt', value: scenarios.strong, icon: SunMedium, color: 'emerald' },
    { key: 'normal', label: t('beginner.expected', 'Erwartet'), sub: 'Statistisch wahrscheinlichster Median', value: scenarios.normal, icon: Target, color: 'sky' },
    { key: 'weak', label: t('beginner.pessimistic', 'Pessimistisch'), sub: 'Längere zähe Börsenphase', value: scenarios.weak, icon: CloudRain, color: 'amber' },
  ];

  const normalGain = scenarios.normal - scenarios.invested;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ============ A · HAVN-SCORE ============ */}
      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center relative z-10">
          <div className="flex items-center gap-5 lg:w-[44%]">
            <ScoreRing score={scores.total} />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 glass-chip px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>HAVN-Score</span>
                <InfoTooltip
                  title="HAVN-Score"
                  text="Unser transparenter Gesamtwert von 0 bis 100 Punkten. Er kombiniert 4 gleich gewichtete Säulen: Trend, Krisenfestigkeit, faire Bewertung und historische Gewinnquote."
                  rule="Ab 75 Punkten gilt ein Wertpapier als überzeugendes Basis-Investment."
                />
              </div>
              <div className={`text-2xl font-black tracking-tight ${TONE[scoreTone(scores.total)].text}`}>
                {scores.totalLabel}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ins.action}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 lg:pl-6 lg:border-l border-white/[0.06]">
            <ScoreBar 
              icon={TrendingUp} 
              label="Trend & Schwung" 
              value={scores.momentum} 
              hint={ins.trend.text} 
              tooltip={{
                title: "Trend & Schwung",
                text: "Zeigt, ob der Kurs über wichtigen gleitenden Durchschnitten notiert und Aufwärtsdynamik besitzt.",
                rule: "Hohe Werte signalisieren gesunden Rückenwind."
              }}
            />
            <ScoreBar 
              icon={ShieldCheck} 
              label="Krisenfestigkeit" 
              value={scores.stability} 
              hint={`Größter historischer Rückschlag: −${ins.maxDd.toFixed(0)} %`} 
              tooltip={{
                title: "Krisenfestigkeit",
                text: "Misst, wie gut sich dieses Wertpapier in echten Börsencrashs behauptet hat und wie schnell es frühere Verluste wieder aufholte.",
                rule: "Breit gestreute Welt-ETFs erzielen hier Bestnoten."
              }}
            />
            <ScoreBar 
              icon={Tag} 
              label="Bewertung" 
              value={scores.valuation} 
              hint={ins.isEtf ? 'Breiter Fonds • immer marktüblich bepreist' : `Aktuell: ${ins.priceLevel.label}`} 
              tooltip={{
                title: "Bewertung",
                text: "Prüft, ob der Preis im Vergleich zu Gewinnen und historischem Durchschnitt günstig oder heißgelaufen ist.",
                rule: "ETFs sind als Korb von hunderten Firmen immer fair bewertet."
              }}
            />
            <ScoreBar 
              icon={RotateCcw} 
              label="Erfolgsquote" 
              value={scores.history} 
              hint={ins.winRate != null ? `In ${ins.winRate.toFixed(0)} % aller Zeiträume im Plus` : 'Basierend auf 5.000 Simulationen'} 
              tooltip={{
                title: "Erfolgsquote",
                text: "Der Anteil aller historischen Zeiträume dieser Haltedauer, die mit einem Gewinn abgeschlossen wurden.",
                rule: "Bei 5 Jahren Haltedauer liegt die Quote für Welt-ETFs historisch nahe 90 %."
              }}
            />
          </div>
        </div>
      </section>

      {/* ============ B · KURSVERLAUF ============ */}
      <SimpleAreaChart history={data.chart_history} currentPrice={data.current_price} />

      {/* ============ C · DIE 3 FRAGEN ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* --- Frage 1: Erwartung --- */}
        <QuestionCard 
          icon={Coins} 
          step={1} 
          question={t('beginner.q1Title', 'Was passiert mit meinem Geld?')} 
          accent="bg-sky-400/10 border-sky-400/25 text-sky-300"
          tooltip={{
            title: "Kapital-Projektion",
            text: "Berechnet aus 5.000 Monte-Carlo-Simulationen. Zeigt dir, welcher Endbetrag für deinen Einsatz realistisch ist.",
            rule: "Der Normalfall ist das statistisch wahrscheinlichste Szenario."
          }}
        >
          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400">
                Aus <strong className="text-slate-200">{formatEuro(scenarios.invested)}</strong> werden in {ins.horizon} im Normalfall
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white font-mono tracking-tight">{formatEuro(scenarios.normal)}</span>
                <span className={`text-sm font-bold ${normalGain >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {normalGain >= 0 ? '+' : ''}{formatEuro(normalGain)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {scenarioRows.map((s) => {
                const Icon = s.icon;
                const diff = s.value - scenarios.invested;
                return (
                  <div key={s.key} className="glass-inset rounded-2xl p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${TONE[s.color].text}`} />
                        <span>
                          <span className="font-bold text-white">{s.label}</span>
                          <span className="block text-[10px] text-slate-400">{s.sub}</span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-mono font-bold text-white">{formatEuro(s.value)}</span>
                        <span className={`block text-[10px] font-semibold ${diff >= 0 ? 'text-emerald-300/90' : 'text-rose-300/90'}`}>
                          {diff >= 0 ? '+' : ''}{formatEuro(diff)}
                        </span>
                      </span>
                    </div>
                    <div className="relative h-1.5 mt-2 rounded-full bg-white/[0.06]">
                      <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${TONE[s.color].bar} animate-growX`} style={{ width: pos(s.value) }} />
                      <div className="absolute -top-1 -bottom-1 w-px bg-white/70" style={{ left: pos(scenarios.invested) }} title="Dein Einsatz" />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="inline-block w-px h-2.5 bg-white/70" /> Weißer Strich markiert dein eingezahltes Geld
              </div>
            </div>

            <div className="glass-inset rounded-2xl p-3 mt-auto">
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full ${i < ins.outOfTen ? 'bg-emerald-400/90' : 'bg-white/[0.08]'}`} />
                ))}
              </div>
              <p className="text-xs text-slate-300">
                In <strong className="text-white">{ins.outOfTen} von 10</strong> simulierten Verläufen liegst du am Ende im Plus.
              </p>
            </div>
          </div>
        </QuestionCard>

        {/* --- Frage 2: Weiterleitung zu Sturm --- */}
        <QuestionCard 
          icon={CloudLightning} 
          step={2} 
          question={t('beginner.q2Title', 'Wie sicher ist mein Geld im Crash?')} 
          accent="bg-amber-400/10 border-amber-400/25 text-amber-300"
          tooltip={{
            title: "Maximaler Rückschlag",
            text: "Der tiefste jemals verzeichnete Kursrückgang vom jeweiligen Rekordhoch.",
            rule: "Breite Welt-ETFs erholen sich historisch zuverlässig aus jedem Crash."
          }}
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="text-[11px] text-slate-400">Größter historischer Einbruch</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-rose-300 font-mono tracking-tight">−{ins.maxDd.toFixed(0)} %</span>
                <Pill tone={ins.swing.tone}>Schwankung: {ins.swing.label}</Pill>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Entspricht bei deinem Einsatz zeitweise etwa <strong className="text-slate-200">−{formatEuro(scenarios.invested * ins.maxDd / 100)}</strong> Buchverlust vor der Erholung. {ins.marketCompare}.
              </p>
            </div>

            {/* Sturm-Verlinkungsbox */}
            <div
              onClick={onNavigateToCrisis}
              className="group glass-inset hover:border-amber-400/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer space-y-3 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CloudLightning className="w-4.5 h-4.5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                      Sturm-Simulation
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Crash-Stresstest für dieses Wertpapier
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                Erlebe Monat für Monat, wie sich reale Börsencrashs wie <strong>Corona 2020</strong> oder die <strong>Finanzkrise 2008</strong> auf dein Geld ausgewirkt hätten.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToCrisis) onNavigateToCrisis();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/90 to-yellow-500/90 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98] relative z-10"
              >
                <CloudLightning className="w-3.5 h-3.5 fill-slate-950" />
                <span>Jetzt im Sturm-Simulator testen</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              Im Sturm-Simulator siehst du auch, wie ein Sparplan Krisen automatisch abfedert.
            </p>
          </div>
        </QuestionCard>

        {/* --- Frage 3: Timing --- */}
        <QuestionCard 
          icon={Compass} 
          step={3} 
          question={t('beginner.q3Title', 'Ist jetzt ein guter Kaufzeitpunkt?')} 
          accent="bg-emerald-400/10 border-emerald-400/25 text-emerald-300"
          tooltip={{
            title: "Einstiegs-Timing",
            text: "Prüft Trendrichtung, kurzfristige Hitze und Bewertung. Für Sparpläne spielt das Timing dank monatlicher Käufe kaum eine Rolle.",
            rule: "Bei Einmalkäufen empfiehlt sich bei heißen Märkten ein gestaffelter Kauf."
          }}
        >
          <div className="space-y-2.5 relative z-10 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {[
                { icon: TrendingUp, title: 'Richtung', item: ins.trend },
                { icon: Activity, title: 'Stimmung', item: ins.heat },
                { icon: Tag, title: 'Preisniveau', item: ins.priceLevel },
              ].map(({ icon: Icon, title, item }) => (
                <div key={title} className="glass-inset rounded-2xl p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                      <Icon className="w-3.5 h-3.5" /> {title}
                    </span>
                    <Pill tone={item.tone}>
                      <span className={`w-1.5 h-1.5 rounded-full ${TONE[item.tone].dot}`} />
                      {item.label}
                    </Pill>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{item.text}</p>
                </div>
              ))}

              {consensus && consensus.opinions_count > 0 && consensus.upside_pct != null && (
                <div className="glass-inset rounded-2xl p-2.5 sm:p-3 flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-white">{consensus.opinions_count} Profi-Analysten</strong> sehen im Schnitt{' '}
                    <strong className={consensus.upside_pct >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      {consensus.upside_pct >= 0 ? '+' : ''}{consensus.upside_pct} %
                    </strong>{' '}
                    Kurspotenzial.
                  </p>
                </div>
              )}
            </div>

            <div className={`rounded-2xl p-3.5 border relative z-10 ${TONE[ins.timing.tone].soft}`}>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Fazit für deine {invType}</div>
              <div className="text-sm font-black text-white mt-0.5">{invType === 'Sparplan' ? 'Sparplan: jederzeit starten' : ins.timing.label}</div>
              <p className="text-[11px] text-slate-200/90 mt-1 leading-relaxed">{ins.action}</p>
            </div>
          </div>
        </QuestionCard>
      </div>

      {/* ============ D · UMSETZUNG ============ */}
      <section className="glass rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="text-sm font-black text-white">Überzeugt? So findest du es bei deinem Broker</div>
          <p className="text-xs text-slate-400 mt-0.5">
            Einfach die Kennnummer in die Suche deiner Depot-App eingeben{wkn ? ` • WKN ${wkn}` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {isin && (
            <button
              type="button"
              onClick={copyIsin}
              className="glass-chip inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer hover:bg-white/10 transition-all"
            >
              <span className="font-mono">{isin}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-sky-300" />}
            </button>
          )}
          <button
            type="button"
            onClick={onSwitchToPro}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-sky-200 hover:text-white transition-all cursor-pointer border border-sky-400/25 bg-sky-400/10 hover:bg-sky-400/20"
          >
            Alle Modelle im Pro-Modus
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
