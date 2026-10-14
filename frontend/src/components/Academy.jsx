import React from 'react';
import { BookOpen, TrendingUp, PiggyBank, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const LESSONS = [
  {
    icon: TrendingUp,
    color: 'emerald',
    title: '1. Das 8. Weltwunder: Der Zinseszins',
    content: 'Wer 25 Jahre lang monatlich 150 € auf dem Girokonto spart, besitzt 45.000 €. Wer dieselben 150 € in einen Welt-ETF mit 7 % Rendite investiert, besitzt über 120.000 €! Ganze 75.000 € davon hat dir die Wirtschaft geschenkt, ohne dass du dafür arbeiten musstest.'
  },
  {
    icon: PiggyBank,
    color: 'sky',
    title: '2. Der Cost-Average-Effekt (Crashs als Rabatt)',
    content: 'Wenn die Börse fällt, freuen sich kluge Sparplan-Anleger. Warum? Weil deine fixe Sparrate von z. B. 100 € bei niedrigen Kursen viel mehr Anteile kauft als bei hohen Kursen. Wenn die Kurse später wieder steigen, explodiert dein Gewinn.'
  },
  {
    icon: ShieldAlert,
    color: 'rose',
    title: '3. Die 3 tödlichsten Anfängerfehler',
    content: 'Erstens: Alles auf eine Hype-Aktie setzen (Klumpenrisiko). Zweitens: Panikverkauf im roten Minus (Verluste werden erst durch den Verkauf real!). Drittens: Hin- und Herhandeln aus Langeweile (Gebühren und Steuern fressen die Rendite auf).'
  },
  {
    icon: Sparkles,
    color: 'amber',
    title: '4. Freistellungsauftrag: 1.000 € steuerfrei',
    content: 'In Deutschland darfst du jedes Jahr bis zu 1.000 € Kapitalerträge (Dividenden & Gewinne) völlig steuerfrei kassieren (Sparer-Pauschbetrag). Richte dafür einfach bei deinem Broker einen Freistellungsauftrag ein – das spart bares Geld!'
  }
];

export default function Academy() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Logbuch (Wissen & Navigation)</h2>
            <p className="text-xs text-slate-400">Kurz und anschaulich: Warum anlegen wichtig ist, wie man anlegt und worauf man achten sollte.</p>
          </div>
        </div>
      </div>

      {/* Lektionen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LESSONS.map((l, idx) => {
          const Icon = l.icon;
          return (
            <div 
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-800 text-sky-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{l.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{l.content}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Wissenschaftlich fundierte Praxisregel
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
