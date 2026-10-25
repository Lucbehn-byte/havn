import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  PiggyBank, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Flame, 
  Landmark, 
  Layers, 
  Coins, 
  Scale, 
  Percent, 
  Compass 
} from 'lucide-react';

const BASIC_LESSONS = [
  {
    icon: Flame,
    tag: 'Das Problem',
    title: '1. Warum Geld nicht herumliegen darf (Inflation)',
    summary: 'Geld auf dem Giro- oder Sparbuch verliert heimlich jeden Tag an Kaufkraft.',
    content: 'Durch die stetige Inflation (ca. 2–3 % pro Jahr) halbiert sich dein Vermögen auf dem Sparbuch alle 25 bis 30 Jahre real. 10.000 € bar auf der Bank sind nach 20 Jahren bei 3 % Inflation im Wert auf nur noch ca. 5.500 € zusammengeschrumpft. Wer sein Geld nicht investiert, verliert garantiert.'
  },
  {
    icon: TrendingUp,
    tag: 'Die Lösung',
    title: '2. Warum Geld für dich arbeiten muss (Zinseszins)',
    summary: 'Der Zinseszins ist der stärkste Hebel für deinen persönlichen Vermögensaufbau.',
    content: 'Wer 25 Jahre lang monatlich 150 € auf dem Sparkonto lässt, hat 45.000 € eingezahlt – und besitzt am Ende nur 45.000 €. Wer dieselben 150 € in einen weltweiten Aktien-ETF mit historisch durchschnittlich 7 % Rendite anlegt, besitzt über 120.000 €! Ganze 75.000 € davon hat dir das Weltwirtschaftswachstum geschenkt.'
  },
  {
    icon: Smartphone,
    tag: 'Die Praxis',
    title: '3. Was du brauchst: Ein Neobroker-Depot',
    summary: 'Ein Depot eröffnet man heute in 10 Minuten gebührenfrei per Smartphone-App.',
    content: 'Früher brauchte man teure Filialbanken mit hohen Depotgebühren. Heute nutzt man moderne, BaFin-regulierte Neobroker (z. B. Trade Republic, Scalable Capital, finanzen.net zero). Dort sind die Depoteröffnung, Depotführung und monatliche ETF-Sparpläne in der Regel komplett kostenlos (0 € Gebühr).'
  },
  {
    icon: PiggyBank,
    tag: 'Der Einstieg',
    title: '4. Wie man konkret anlegt: Der automatische ETF-Sparplan',
    summary: 'Einrichten, Sparrate definieren und die Wirtschaft für dich arbeiten lassen.',
    content: 'Du musst keine Kurse verfolgen oder Aktienexperte sein. Du wählst einen globalen Welt-ETF (z. B. MSCI World oder FTSE All-World), stellst einen monatlichen Dauerauftrag ab 25 € oder 50 € ein und lässt ihn einfach laufen. Fällt der Markt, kaufst du automatisch günstigere Anteile ein (Cost-Average-Effekt).'
  },
  {
    icon: ShieldAlert,
    tag: 'Sicherheitsnetz',
    title: '5. Der Notgroschen: Niemals alles investieren',
    summary: 'Investiere nur Geld, das du mindestens 5 bis 10 Jahre nicht brauchst.',
    content: 'Bevor du den Sparplan startest, gehören 2 bis 3 Monatsausgaben auf ein Tagesgeldkonto (Notgroschen für Notfälle, Autoreparaturen etc.). So kommst du nie in die Verlegenheit, deine ETF-Anteile bei einem zwischenzeitlichen Börsentief mit Verlust verkaufen zu müssen.'
  },
  {
    icon: Sparkles,
    tag: 'Steuergeschenk',
    title: '6. Freistellungsauftrag: 1.000 € steuerfrei jedes Jahr',
    summary: 'Nutze den Sparer-Pauschbetrag direkt ab dem ersten Euro.',
    content: 'In Deutschland darf jeder Bürger jedes Jahr bis zu 1.000 € an Kapitalerträgen (Dividenden & Kursgewinne) völlig steuerfrei kassieren (Verheiratete: 2.000 €). Richte direkt in deiner Broker-App unter „Steuern“ den Freistellungsauftrag ein, damit keine Abgeltungssteuer abgezogen wird.'
  }
];

const PRO_LESSONS = [
  {
    icon: Layers,
    tag: 'Strategie',
    title: '1. Core-Satellite-Strategie & Asset Allocation',
    summary: 'Stabilität im Kern, kontrollierte Chancen an den Flanken.',
    content: 'Profis setzen 70–80 % des Portfolios in breit diversifizierte Welt-ETFs (den "Core", z. B. MSCI World / All-World). Die verbleibenden 20–30 % ("Satellites") können gezielt in Wachstumsbranchen (z. B. Halbleiter, KI, Schwellenländer) oder Einzelwerte allokiert werden, ohne das Gesamtrisiko zu sprengen.'
  },
  {
    icon: Landmark,
    tag: 'Staatliche Förderungen',
    title: '2. Geschenktes Geld: VL & Arbeitnehmersparzulage',
    summary: 'Prüfe vermögenswirksame Leistungen (VL) deines Arbeitgebers.',
    content: 'Viele Arbeitgeber zahlen bis zu 40 € monatlich als VL dazu. Wenn du diese in einen VL-fähigen Aktien-ETF anlegst, schenkt dir der Staat zusätzlich bis zu 80 € pro Jahr Arbeitnehmersparzulage (seit 2024 gilt eine verdoppelte Einkommensgrenze von 40.000 € / 80.000 € zvE). Prüfe auch betriebliche Altersvorsorge (bAV) mit mindestens 15 % gesetzlichem Arbeitgeberzuschuss.'
  },
  {
    icon: Scale,
    tag: 'Portfoliomanagement',
    title: '3. Rebalancing: Antizyklisch Rendite sichern',
    summary: 'Gewinne automatisch von Überfliegern in unterbewertete Werte umschichten.',
    content: 'Wenn Aktien nach einer langen Rallye z. B. 85 % statt der geplanten 70 % deines Vermögens ausmachen, stellst du einmal im Jahr das ursprüngliche Verhältnis wieder her (Rebalancing). Du verkaufst teuer gewordene Anteile und kaufst günstigere nach – das senkt nachweislich das Portfolio-Risiko bei stabiler Rendite.'
  },
  {
    icon: Percent,
    tag: 'Steueroptimierung',
    title: '4. Teilfreistellung & Vorabpauschale bei ETFs',
    summary: 'Steuervorteile von Aktienfonds gegenüber Direktaktien optimal nutzen.',
    content: 'Aktien-ETFs (mind. 51 % Aktienquote) profitieren in Deutschland von einer 30 %igen Teilfreistellung: Nur 70 % deiner Gewinne und Dividenden unterliegen der Abgeltungssteuer. Bei thesaurierenden ETFs greift die jährliche Vorabpauschale auf Basis des Basiszinses – schöpfe damit jährlich deinen 1.000 € Sparer-Pauschbetrag ideal aus.'
  },
  {
    icon: Compass,
    tag: 'Faktor-Investing',
    title: '5. Smart Beta & Faktor-Prämien (Fama-French)',
    summary: 'Wissenschaftliche Überrenditen durch Faktoren wie Small Cap Value & Quality.',
    content: 'Die Finanzmarktforschung zeigt, dass bestimmte Risikofaktoren historisch eine Mehrrendite liefern: Small Caps (kleinere Unternehmen), Value (günstig bewertete Firmen), Momentum (starke relative Stärke) und Quality (hohe Eigenkapitalrentabilität & solide Bilanzen). Eine gezielte Faktor-Beimischung kann die risikobereinigte Rendite heben.'
  },
  {
    icon: Coins,
    tag: 'Entnahmephase',
    title: '6. Die 4%-Regel & Trinity-Studie im Alter',
    summary: 'Wie man später sicher vom investierten Vermögen leben kann.',
    content: 'Nach der berühmten Trinity-Studie kann man bei einem 50/50 bis 75/25 Aktien/Anleihen-Portfolio inflationsbereinigt 3,5 % bis 4 % des Startvermögens pro Jahr entnehmen, ohne dass das Depot über 30 Jahre erschöpft wird. Wer 300.000 € angespart hat, kann so dauerhaft ~1.000 € monatlich vor Steuern entnehmen.'
  }
];

export default function Academy({ experienceMode = 'beginner' }) {
  const isPro = experienceMode === 'pro';
  const lessons = isPro ? PRO_LESSONS : BASIC_LESSONS;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isPro ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}></div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2.5 rounded-xl border ${
            isPro 
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Logbuch</h2>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                isPro 
                  ? 'bg-sky-950 border-sky-800 text-sky-400' 
                  : 'bg-emerald-950 border-emerald-800 text-emerald-400'
              }`}>
                {isPro ? 'Pro-Strategien' : 'Basic-Grundlagen'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPro
                ? 'Fortgeschrittenes Portfoliomanagement, Rebalancing, staatliche Förderungen und Steueroptimierung.'
                : 'Warum anlegen essenziell ist, wie dein Geld arbeitet, Neobroker-Wahl und die ersten sicheren Schritte.'}
            </p>
          </div>
        </div>
      </div>

      {/* Lektionen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((l, idx) => {
          const Icon = l.icon;
          return (
            <div 
              key={idx}
              className="glass rounded-3xl p-6 shadow-xl space-y-3 flex flex-col justify-between hover:border-slate-700/80 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-slate-800/90 ${
                      isPro ? 'text-indigo-400' : 'text-emerald-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 bg-slate-800/60 rounded-md">
                      {l.tag}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{l.title}</h3>
                <p className="text-xs font-semibold text-slate-300 mb-2 italic">{l.summary}</p>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{l.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 
                <span>{isPro ? 'Empfohlene Best Practice' : 'Wissenschaftlich belegte Grundregel'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
