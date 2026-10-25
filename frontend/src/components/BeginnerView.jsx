import React, { useState } from 'react';
import {
  Sparkles, Copy, Check, ArrowRight, Calculator, ChevronDown,
  Coins, Waves, Compass, SunMedium, CloudRain, Target, ShieldCheck,
  TrendingUp, Activity, Tag, Users, RotateCcw, Hourglass, CloudLightning,
} from 'lucide-react';
import SimpleAreaChart from './SimpleAreaChart';
import { getInsights, formatEuro, scoreTone, TONE } from '../utils/insights';

/* ------------------------------------------------------------------ */
/* Kleine Bausteine                                                    */
/* ------------------------------------------------------------------ */

/** Aufklappbare "Mathematik dahinter" – Progressive Disclosure */
function MathDetails({ rows = [], note }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-3 mt-auto border-t border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
      >
        <span className="inline-flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          Mathematik dahinter
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2.5 space-y-1.5 animate-fadeIn">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">{k}</span>
              <span className="font-mono font-semibold text-slate-200 text-right">{v}</span>
            </div>
          ))}
          {note && <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{note}</p>}
        </div>
      )}
    </div>
  );
}

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
        <span className="text-[10px] font-semibold text-slate-400 -mt-0.5">von 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ icon: Icon, label, hint, value }) {
  const tone = TONE[scoreTone(value)];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Icon className={`w-3.5 h-3.5 ${tone.text}`} />
          {label}
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

function QuestionCard({ icon: Icon, accent, step, question, children }) {
  return (
    <div className="glass rounded-3xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3 relative z-10">
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${accent}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Frage {step}</div>
          <h3 className="text-base font-black text-white leading-tight">{question}</h3>
        </div>
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
  const [copied, setCopied] = useState(false);
  const ins = getInsights(data, invType);
  if (!data || !ins) return null;

  const mc = data.monte_carlo || {};
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
    { key: 'strong', label: 'Gute Jahre', sub: 'Wenn vieles rund läuft', value: scenarios.strong, icon: SunMedium, color: 'emerald' },
    { key: 'normal', label: 'Normalfall', sub: 'Das wahrscheinlichste Ergebnis', value: scenarios.normal, icon: Target, color: 'sky' },
    { key: 'weak', label: 'Schwache Jahre', sub: 'Wenn es länger zäh läuft', value: scenarios.weak, icon: CloudRain, color: 'amber' },
  ];

  const normalGain = scenarios.normal - scenarios.invested;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ============ A · HAVN-SCORE ============ */}
      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center relative z-10">
          <div className="flex items-center gap-5 lg:w-[44%]">
            <ScoreRing score={scores.total} />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 glass-chip px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                HAVN-Score
              </div>
              <div className={`text-2xl font-black tracking-tight ${TONE[scoreTone(scores.total)].text}`}>
                {scores.totalLabel}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ins.action}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 lg:pl-6 lg:border-l border-white/[0.06]">
            <ScoreBar icon={TrendingUp} label="Trend & Schwung" value={scores.momentum} hint={ins.trend.text} />
            <ScoreBar icon={ShieldCheck} label="Krisenfestigkeit" value={scores.stability} hint={`Größter Einbruch bisher: −${ins.maxDd.toFixed(0)} %`} />
            <ScoreBar icon={Tag} label="Preis" value={scores.valuation} hint={ins.isEtf ? 'Breiter Fonds – immer fair bepreist' : `Aktuell: ${ins.priceLevel.label.toLowerCase()}`} />
            <ScoreBar icon={RotateCcw} label="Langfrist-Erfolg" value={scores.history} hint={ins.winRate != null ? `In ${ins.winRate.toFixed(0)} % der Fälle im Plus` : 'Basierend auf Simulationen'} />
          </div>
        </div>
      </section>

      {/* ============ B · KURSVERLAUF ============ */}
      <SimpleAreaChart history={data.chart_history} currentPrice={data.current_price} />

      {/* ============ C · DIE 3 FRAGEN ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* --- Frage 1: Erwartung --- */}
        <QuestionCard icon={Coins} step={1} question="Was kann ich erwarten?" accent="bg-sky-400/10 border-sky-400/25 text-sky-300">
          <div className="relative z-10">
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

          <div className="space-y-3 relative z-10">
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
                  <div className="relative h-1.5 mt-2.5 rounded-full bg-white/[0.06]">
                    <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${TONE[s.color].bar} animate-growX`} style={{ width: pos(s.value) }} />
                    <div className="absolute -top-1 -bottom-1 w-px bg-white/60" style={{ left: pos(scenarios.invested) }} title="Dein Einsatz" />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="inline-block w-px h-3 bg-white/60" /> Strich = dein Einsatz
            </div>
          </div>

          <div className="glass-inset rounded-2xl p-3 relative z-10">
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={`h-2 flex-1 rounded-full ${i < ins.outOfTen ? 'bg-emerald-400/90' : 'bg-white/[0.08]'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-300">
              In <strong className="text-white">{ins.outOfTen} von 10</strong> durchgerechneten Zukünften liegst du am Ende im Plus.
            </p>
          </div>

          <MathDetails
            rows={[
              ['Modell', 'Monte-Carlo · Merton Jump-Diffusion'],
              ['Schwache Jahre', '10. Perzentil'],
              ['Normalfall', 'Median (50. Perzentil)'],
              ['Gute Jahre', '90. Perzentil'],
              ['Gewinn-Wahrscheinlichkeit', `${ins.probUp.toFixed(1)} %`],
              ['Erwartete Rendite (Median)', `${(mc.expected_return_pct ?? 0).toFixed(2)} %`],
            ]}
            note="Tausende mögliche Kursverläufe werden aus dem historischen Verhalten dieses Wertpapiers simuliert – inklusive plötzlicher Kurssprünge."
          />
        </QuestionCard>

        {/* --- Frage 2: Weiterleitung zu Sturm --- */}
        <QuestionCard icon={CloudLightning} step={2} question="Wie stark kann es wackeln?" accent="bg-amber-400/10 border-amber-400/25 text-amber-300">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="text-[11px] text-slate-400">Historischer Maximal-Rückschlag</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-rose-300 font-mono tracking-tight">−{ins.maxDd.toFixed(0)} %</span>
                <Pill tone={ins.swing.tone}>Schwankung: {ins.swing.label}</Pill>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Entspricht bei deinem Einsatz zeitweise etwa <strong className="text-slate-200">−{formatEuro(scenarios.invested * ins.maxDd / 100)}</strong> auf dem Papier. Das Wertpapier {ins.marketCompare}.
              </p>
            </div>

            {/* Weiterleitungs-Box zu "Sturm" */}
            <div
              onClick={onNavigateToCrisis}
              className="group glass-inset hover:border-amber-400/40 rounded-2xl p-4 transition-all duration-300 cursor-pointer space-y-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500/25 transition-all">
                    <CloudLightning className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                      Sturm-Simulation
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Interaktiver Crash-Stresstest
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg glass-chip flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                Erlebe Monat für Monat, wie sich historische Börsencrashs (wie <strong>Corona 2020</strong>, der <strong>Zinsschock 2022</strong> oder die <strong>Finanzkrise 2008</strong>) auf dein investiertes Geld ausgewirkt hätten.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateToCrisis) onNavigateToCrisis();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/80 to-yellow-500/80 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98] relative z-10"
              >
                <CloudLightning className="w-3.5 h-3.5 fill-slate-950" />
                <span>Jetzt zu „Sturm“ wechseln</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              Im Sturm-Simulator siehst du auch, wie ein Sparplan Krisen durch den Cost-Average-Effekt automatisch abfedert.
            </p>
          </div>
        </QuestionCard>

        {/* --- Frage 3: Timing --- */}
        <QuestionCard icon={Compass} step={3} question="Ist jetzt ein guter Zeitpunkt?" accent="bg-emerald-400/10 border-emerald-400/25 text-emerald-300">
          <div className="space-y-2.5 relative z-10">
            {[
              { icon: TrendingUp, title: 'Richtung', item: ins.trend },
              { icon: Activity, title: 'Stimmung', item: ins.heat },
              { icon: Tag, title: 'Preis', item: ins.priceLevel },
            ].map(({ icon: Icon, title, item }) => (
              <div key={title} className="glass-inset rounded-2xl p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Icon className="w-3.5 h-3.5" /> {title}
                  </span>
                  <Pill tone={item.tone}>
                    <span className={`w-1.5 h-1.5 rounded-full ${TONE[item.tone].dot}`} />
                    {item.label}
                  </Pill>
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{item.text}</p>
              </div>
            ))}

            {consensus && consensus.opinions_count > 0 && consensus.upside_pct != null && (
              <div className="glass-inset rounded-2xl p-3 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">{consensus.opinions_count} Profi-Analysten</strong> sehen im Schnitt{' '}
                  <strong className={consensus.upside_pct >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {consensus.upside_pct >= 0 ? '+' : ''}{consensus.upside_pct} %
                  </strong>{' '}
                  Luft nach oben.
                </p>
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-3.5 border relative z-10 ${TONE[ins.timing.tone].soft}`}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Fazit für deine {invType}</div>
            <div className="text-sm font-black text-white mt-0.5">{invType === 'Sparplan' ? 'Sparplan: jederzeit sinnvoll' : ins.timing.label}</div>
            <p className="text-[11px] text-slate-200/90 mt-1 leading-relaxed">{ins.action}</p>
          </div>

          <MathDetails
            rows={[
              ['Trend-Score', `${ins.trendScore > 0 ? '+' : ''}${ins.trendScore.toFixed(0)}`],
              ['RSI (14 Tage)', ins.rsi.toFixed(1)],
              ['GD50 / GD200', ins.ma50 && ins.ma200 ? `${ins.ma50.toFixed(1)} / ${ins.ma200.toFixed(1)} €` : '–'],
              ['KGV', ins.kgv != null ? ins.kgv.toFixed(1) : '–'],
              ['Bewertung', data.fundamental?.valuation_status || '–'],
            ]}
            note="RSI über 70 gilt als überhitzt, unter 30 als ausverkauft. GD = gleitender Durchschnitt der letzten 50 bzw. 200 Handelstage."
          />
        </QuestionCard>
      </div>

      {/* ============ D · UMSETZUNG ============ */}
      <section className="glass rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="text-sm font-black text-white">Überzeugt? So findest du es bei deinem Broker</div>
          <p className="text-xs text-slate-400 mt-0.5">
            Einfach die Kennnummer in die Suche deiner Depot-App eingeben{wkn ? ` (WKN ${wkn})` : ''}.
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
