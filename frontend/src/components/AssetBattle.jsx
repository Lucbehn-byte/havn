import React, { useState, useEffect } from 'react';
import {
  Swords, Trophy, ShieldCheck, TrendingUp, AlertTriangle, Sparkles,
  Award, ArrowRight, Check, Compass, Waves, Coins, ExternalLink,
  Layers, ShieldAlert, Activity, CheckCircle2,
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';

/* ==========================================================================
   ASSET-DATENBANK FÜR DAS DUELL
   Faktenbasierte, realistische Kennzahlen für Kern-ETFs, führende Aktien & Krypto.
   ========================================================================== */
export const BATTLE_ASSETS = [
  // --- 1. Welt- & Kern-ETFs (Fundament für den Vermögensaufbau) ---
  {
    symbol: 'EUNL.DE',
    name: 'iShares Core MSCI World',
    category: 'Welt-ETF',
    assetType: 'ETF',
    role: 'Basis-Fundament (Core)',
    return5Y: 77.4,
    maxDd: -21.7,
    vol: 14.1,
    volLabel: 'Ruhig (14 %)',
    winRate: 88,
    diversificationCount: 1500,
    diversificationLabel: '~1.500 Firmen in 23 Ländern',
    sparplanScore: 96,
    sparplanLabel: 'Exzellent (Top-Basiswert)',
    ter: 0.20,
    terLabel: '0,20 % p.a. (Günstig)',
    sortino: 1.10,
    sharpe: 0.88,
    beta: 1.00,
    cvar: -6.8,
    strength: 'Maximale globale Streuung ohne Einzelfirmen-Risiko.',
  },
  {
    symbol: 'VWCE.DE',
    name: 'Vanguard FTSE All-World',
    category: 'Welt-ETF',
    assetType: 'ETF',
    role: 'Basis-Fundament (Core)',
    return5Y: 72.8,
    maxDd: -21.1,
    vol: 13.7,
    volLabel: 'Ruhig (14 %)',
    winRate: 87,
    diversificationCount: 3700,
    diversificationLabel: '~3.700 Firmen (inkl. Schwellenländer)',
    sparplanScore: 97,
    sparplanLabel: 'Exzellent (All-in-One)',
    ter: 0.22,
    terLabel: '0,22 % p.a. (Günstig)',
    sortino: 1.09,
    sharpe: 0.87,
    beta: 0.98,
    cvar: -6.5,
    strength: 'Breiteste Streuung der Welt inklusive Emerging Markets.',
  },
  {
    symbol: 'SXR8.DE',
    name: 'iShares Core S&P 500',
    category: 'US-Leitindex ETF',
    assetType: 'ETF',
    role: 'Wachstums-Fundament (US)',
    return5Y: 88.5,
    maxDd: -23.3,
    vol: 15.1,
    volLabel: 'Moderat (15 %)',
    winRate: 86,
    diversificationCount: 500,
    diversificationLabel: '500 größte US-Konzerne',
    sparplanScore: 94,
    sparplanLabel: 'Exzellent (US-Schwerpunkt)',
    ter: 0.07,
    terLabel: '0,07 % p.a. (Ultra-günstig)',
    sortino: 1.16,
    sharpe: 0.94,
    beta: 1.05,
    cvar: -7.1,
    strength: 'Sehr hohe Rendite der weltweiten US-Vorzeigeunternehmen.',
  },
  {
    symbol: 'EXS1.DE',
    name: 'iShares Core DAX ETF',
    category: 'Deutschland ETF',
    assetType: 'ETF',
    role: 'Heimatmarkt (Deutschland)',
    return5Y: 61.2,
    maxDd: -26.7,
    vol: 17.2,
    volLabel: 'Moderat (17 %)',
    winRate: 82,
    diversificationCount: 40,
    diversificationLabel: '40 deutsche Leitbetriebe',
    sparplanScore: 84,
    sparplanLabel: 'Solide Beimischung',
    ter: 0.16,
    terLabel: '0,16 % p.a. (Günstig)',
    sortino: 0.82,
    sharpe: 0.65,
    beta: 1.12,
    cvar: -8.9,
    strength: 'Profitiert von deutschen Industrie- und Export-Champions.',
  },
  {
    symbol: 'IS3N.DE',
    name: 'iShares Core EM IMI',
    category: 'Schwellenländer ETF',
    assetType: 'ETF',
    role: 'Chancen-Beimischung (EM)',
    return5Y: 46.1,
    maxDd: -22.0,
    vol: 16.8,
    volLabel: 'Moderat (17 %)',
    winRate: 76,
    diversificationCount: 3000,
    diversificationLabel: '~3.000 Firmen in Schwellenländern',
    sparplanScore: 80,
    sparplanLabel: 'Gute Ergänzung',
    ter: 0.18,
    terLabel: '0,18 % p.a. (Günstig)',
    sortino: 0.66,
    sharpe: 0.52,
    beta: 0.85,
    cvar: -8.2,
    strength: 'Partizipation am demografischen Wachstum asiatischer Märkte.',
  },
  {
    symbol: '2B76.DE',
    name: 'iShares Automation & Robotics',
    category: 'Themen-ETF',
    assetType: 'ETF',
    role: 'Themen-Satellit',
    return5Y: 62.4,
    maxDd: -35.5,
    vol: 24.7,
    volLabel: 'Lebhaft (25 %)',
    winRate: 78,
    diversificationCount: 130,
    diversificationLabel: '~130 Zukunfts- & Robotikfirmen',
    sparplanScore: 78,
    sparplanLabel: 'Chancen-Satellit',
    ter: 0.40,
    terLabel: '0,40 % p.a. (Themen-Aufschlag)',
    sortino: 0.58,
    sharpe: 0.48,
    beta: 1.35,
    cvar: -12.4,
    strength: 'Zielt gezielt auf den Megatrend industrielle Automation ab.',
  },

  // --- 2. Führende Qualitäts- & Wachstumsaktien ---
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'US-Qualitätsaktie',
    assetType: 'Aktie',
    role: 'Qualitäts-Schwergewicht',
    return5Y: 140.2,
    maxDd: -33.4,
    vol: 28.0,
    volLabel: 'Lebhaft (28 %)',
    winRate: 85,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (Ökosystem)',
    sparplanScore: 84,
    sparplanLabel: 'Starke Einzel-Beimischung',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.98,
    sharpe: 0.82,
    beta: 1.05,
    cvar: -11.5,
    strength: 'Gigantischer freier Cashflow und unschlagbare Markentreue.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'Cloud & Software',
    assetType: 'Aktie',
    role: 'Enterprise & KI-Leader',
    return5Y: 79.1,
    maxDd: -37.1,
    vol: 28.2,
    volLabel: 'Lebhaft (28 %)',
    winRate: 81,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (Enterprise)',
    sparplanScore: 82,
    sparplanLabel: 'Starke Einzel-Beimischung',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.67,
    sharpe: 0.61,
    beta: 1.12,
    cvar: -12.0,
    strength: 'Hohe wiederkehrende Abo-Umsätze in Cloud (Azure) und Office.',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    category: 'KI & Halbleiter',
    assetType: 'Aktie',
    role: 'Wachstums-Turbo (Satellit)',
    return5Y: 868.4,
    maxDd: -66.3,
    vol: 51.9,
    volLabel: 'Sehr hoch (52 %)',
    winRate: 90,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (Halbleiter)',
    sparplanScore: 74,
    sparplanLabel: 'Chancenorientiert (Hohe Vola)',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 1.80,
    sharpe: 1.45,
    beta: 1.81,
    cvar: -21.8,
    strength: 'Absoluter Marktführer für KI-Hardware und Beschleuniger-Chips.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'E-Commerce & Cloud',
    assetType: 'Aktie',
    role: 'Marktplatz & Cloud (AWS)',
    return5Y: 45.2,
    maxDd: -55.7,
    vol: 36.5,
    volLabel: 'Lebhaft (37 %)',
    winRate: 75,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (E-Commerce)',
    sparplanScore: 76,
    sparplanLabel: 'Solide Beimischung',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.32,
    sharpe: 0.35,
    beta: 1.30,
    cvar: -15.4,
    strength: 'Dominante globale Marktstellung in E-Commerce und Cloud-Infrastruktur.',
  },
  {
    symbol: 'SAP.DE',
    name: 'SAP SE',
    category: 'Unternehmenssoftware',
    assetType: 'Aktie',
    role: 'Europäischer Tech-Champion',
    return5Y: 92.4,
    maxDd: -42.9,
    vol: 28.5,
    volLabel: 'Lebhaft (29 %)',
    winRate: 81,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (DAX)',
    sparplanScore: 80,
    sparplanLabel: 'Solide Beimischung',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.85,
    sharpe: 0.68,
    beta: 0.84,
    cvar: -10.2,
    strength: 'Unverzichtbare ERP-Kernsoftware für Großkonzerne weltweit.',
  },
  {
    symbol: 'ALV.DE',
    name: 'Allianz SE',
    category: 'Finanz & Versicherung',
    assetType: 'Aktie',
    role: 'Dividenden-Ertragswert',
    return5Y: 58.7,
    maxDd: -38.2,
    vol: 22.4,
    volLabel: 'Moderat (22 %)',
    winRate: 82,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (Versicherung)',
    sparplanScore: 78,
    sparplanLabel: 'Dividenden-Klassiker',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.74,
    sharpe: 0.62,
    beta: 0.95,
    cvar: -9.8,
    strength: 'Verlässliche Ausschüttungen mit hoher Dividendenrendite (> 4,5 %).',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'E-Mobilität & Tech',
    assetType: 'Aktie',
    role: 'Spekulativer Disruptor',
    return5Y: 110.5,
    maxDd: -73.6,
    vol: 58.2,
    volLabel: 'Sehr hoch (58 %)',
    winRate: 68,
    diversificationCount: 1,
    diversificationLabel: '1 Einzelunternehmen (Auto & Energie)',
    sparplanScore: 66,
    sparplanLabel: 'Stark schwankend',
    ter: 0.0,
    terLabel: 'Keine laufenden Fondsgebühren',
    sortino: 0.45,
    sharpe: 0.40,
    beta: 2.10,
    cvar: -24.0,
    strength: 'Skalierungsvorteile bei Elektrofahrzeugen und Energiespeichern.',
  },

  // --- 3. Führende Krypto-Assets ---
  {
    symbol: 'BTC-EUR',
    name: 'Bitcoin (EUR)',
    category: 'Kryptowährung',
    assetType: 'Krypto',
    role: 'Digitales Gold (Spekulativ)',
    return5Y: 37.5,
    maxDd: -73.6,
    vol: 41.6,
    volLabel: 'Sehr hoch (42 %)',
    winRate: 65,
    diversificationCount: 0,
    diversificationLabel: 'Dezentrales Krypto-Asset (Kein Sachwert)',
    sparplanScore: 54,
    sparplanLabel: 'Nur als Mini-Beimischung',
    ter: 0.0,
    terLabel: 'Keine Fondsgebühren',
    sortino: 0.21,
    sharpe: 0.28,
    beta: 1.40,
    cvar: -24.5,
    strength: 'Mathematisch begrenzte Geldmenge (21 Millionen Coins).',
  },
  {
    symbol: 'ETH-EUR',
    name: 'Ethereum (EUR)',
    category: 'Kryptowährung',
    assetType: 'Krypto',
    role: 'Smart Contracts (Spekulativ)',
    return5Y: -33.2,
    maxDd: -77.2,
    vol: 56.2,
    volLabel: 'Extrem (56 %)',
    winRate: 56,
    diversificationCount: 0,
    diversificationLabel: 'Dezentrales Netzwerk (Kein Sachwert)',
    sparplanScore: 48,
    sparplanLabel: 'Hohes Risiko',
    ter: 0.0,
    terLabel: 'Keine Fondsgebühren',
    sortino: -0.20,
    sharpe: -0.12,
    beta: 1.75,
    cvar: -29.0,
    strength: 'Führende Plattform für dezentrale Applikationen und Smart Contracts.',
  },
];

/* ==========================================================================
   DIE 5 KERNKATEGORIEN (FÜR ALLE ANLEGER VERSTÄNDLICH & TREFFEND)
   ========================================================================== */
function buildCategories(a, b, isPro) {
  const cats = [
    {
      id: 'return',
      title: '5-Jahres-Wertzuwachs',
      subtitle: 'Tatsächliche Kursgewinne der letzten 5 Jahre',
      tooltipTitle: '5-Jahres-Gesamtrendite',
      tooltipText: 'Zeigt das tatsächliche Gesamtwachstum des investierten Kapitals über die letzten 5 Jahre. Höhere Rendite gewinnt.',
      valA: `+${a.return5Y.toFixed(1)} %`,
      valB: `+${b.return5Y.toFixed(1)} %`,
      winner: a.return5Y > b.return5Y ? 'A' : b.return5Y > a.return5Y ? 'B' : 'TIE',
      summary: a.return5Y > b.return5Y
        ? `${a.name} wuchs um ${Math.round(a.return5Y - b.return5Y)} Prozentpunkte stärker.`
        : `${b.name} wuchs um ${Math.round(b.return5Y - a.return5Y)} Prozentpunkte stärker.`,
    },
    {
      id: 'crash',
      title: 'Krisenfestigkeit (Crash-Test)',
      subtitle: 'Größter historischer Einbruch vom Rekordhoch',
      tooltipTitle: 'Maximaler Drawdown',
      tooltipText: 'Wie tief fiel das Wertpapier im schlimmsten historischen Bärenmarkt vom Höchststand? Ein geringerer Rückschlag schont die Nerven und gewinnt die Runde.',
      valA: `${a.maxDd.toFixed(1)} %`,
      valB: `${b.maxDd.toFixed(1)} %`,
      winner: a.maxDd > b.maxDd ? 'A' : b.maxDd > a.maxDd ? 'B' : 'TIE',
      summary: a.maxDd > b.maxDd
        ? `${a.name} fiel im schlimmsten Crash deutlich weniger tief (${a.maxDd.toFixed(0)} % vs. ${b.maxDd.toFixed(0)} %).`
        : `${b.name} fiel im schlimmsten Crash deutlich weniger tief (${b.maxDd.toFixed(0)} % vs. ${a.maxDd.toFixed(0)} %).`,
    },
    {
      id: 'diversification',
      title: 'Risikostreuung & Schutz',
      subtitle: 'Auf wie viele Unternehmen verteilt sich dein Geld?',
      tooltipTitle: 'Diversifikation & Klumpenrisiko',
      tooltipText: 'Ein breit gestreuter ETF verteilt das Geld auf hunderte oder tausende Firmen weltweit. Bei einer Einzelaktie trägst du das volle Einzelfirmen-Risiko.',
      valA: a.diversificationLabel,
      valB: b.diversificationLabel,
      winner: a.diversificationCount > b.diversificationCount ? 'A' : b.diversificationCount > a.diversificationCount ? 'B' : 'TIE',
      summary: a.diversificationCount > b.diversificationCount
        ? `${a.name} bietet überlegenen Schutz vor Firmenpleiten durch breite Streuung.`
        : b.diversificationCount > a.diversificationCount
        ? `${b.name} bietet überlegenen Schutz vor Firmenpleiten durch breite Streuung.`
        : 'Beide Wertpapiere weisen ein ähnliches Streuungsniveau auf.',
    },
    {
      id: 'volatility',
      title: 'Kursschwankung im Alltag',
      subtitle: 'Wie ruhig oder nervös bewegt sich der Kurs?',
      tooltipTitle: 'Kursschwankung (Volatilität)',
      tooltipText: 'Gibt an, wie stark der Kurs nach oben und unten ausschlägt. Ruhigere Investments erleichtern das Durchhalten, während wilde Schwankungen gute Nerven erfordern.',
      valA: a.volLabel,
      valB: b.volLabel,
      winner: a.vol < b.vol ? 'A' : b.vol < a.vol ? 'B' : 'TIE',
      summary: a.vol < b.vol
        ? `${a.name} schwankt im Alltag deutlich ruhiger (${a.vol.toFixed(0)} % vs. ${b.vol.toFixed(0)} % p.a.).`
        : `${b.name} schwankt im Alltag deutlich ruhiger (${b.vol.toFixed(0)} % vs. ${a.vol.toFixed(0)} % p.a.).`,
    },
    {
      id: 'sparplan',
      title: 'Sparplan-Tauglichkeit',
      subtitle: 'Eignung für den monatlichen Vermögensaufbau',
      tooltipTitle: 'HAVN Sparplan-Score (0–100)',
      tooltipText: 'Bewertet, wie gut das Investment von regelmäßigen Sparraten profitiert (Cost-Average-Effekt, Stetigkeit und Erholung nach Rücksetzern).',
      valA: `${a.sparplanScore}/100`,
      valB: `${b.sparplanScore}/100`,
      winner: a.sparplanScore > b.sparplanScore ? 'A' : b.sparplanScore > a.sparplanScore ? 'B' : 'TIE',
      summary: a.sparplanScore > b.sparplanScore
        ? `${a.name} ist dank stabilerem Verlauf noch besser als automatisierter Sparplan geeignet.`
        : `${b.name} ist dank stabilerem Verlauf noch besser als automatisierter Sparplan geeignet.`,
    },
  ];

  if (isPro) {
    // 4 zusätzliche quantitative Runden für Profis
    cats.push(
      {
        id: 'sortino',
        title: 'Sortino-Ratio (Ertrag zu Verlusttagen)',
        subtitle: 'Rendite im Verhältnis zum reinen Abwärtsrisiko',
        tooltipTitle: 'Sortino-Ratio',
        tooltipText: 'Misst die Rendite ausschließlich relativ zu Verlusttagen (Abwärtsvolatilität). Werte über 1.0 sind solide, über 1.5 exzellent. Höher gewinnt.',
        valA: a.sortino.toFixed(2),
        valB: b.sortino.toFixed(2),
        winner: a.sortino > b.sortino ? 'A' : b.sortino > a.sortino ? 'B' : 'TIE',
        summary: a.sortino > b.sortino ? `${a.name} liefert mehr Ertrag pro Einheit echtem Verlustrisiko.` : `${b.name} liefert mehr Ertrag pro Einheit echtem Verlustrisiko.`,
      },
      {
        id: 'sharpe',
        title: 'Sharpe-Ratio (Gesamteffizienz)',
        subtitle: 'Rendite im Verhältnis zur Gesamtschwankung',
        tooltipTitle: 'Sharpe-Ratio',
        tooltipText: 'Klassisches Risikomaß der Portfoliotheorie: Überrendite geteilt durch die Standardabweichung. Höher gewinnt.',
        valA: a.sharpe.toFixed(2),
        valB: b.sharpe.toFixed(2),
        winner: a.sharpe > b.sharpe ? 'A' : b.sharpe > a.sharpe ? 'B' : 'TIE',
        summary: a.sharpe > b.sharpe ? `${a.name} wies die höhere risikoadjustierte Gesamtrendite auf.` : `${b.name} wies die höhere risikoadjustierte Gesamtrendite auf.`,
      },
      {
        id: 'beta',
        title: 'Markt-Beta (Sensitivität)',
        subtitle: 'Verhalten relativ zum Weltmarkt (MSCI World = 1.0)',
        tooltipTitle: 'Markt-Beta',
        tooltipText: 'Ein Beta von 1.0 bedeutet Gleichlauf mit dem Weltmarkt. Ein kleineres Beta steht für defensivere Stabilität, ein höheres Beta für gehebelte Marktschwankungen.',
        valA: a.beta.toFixed(2),
        valB: b.beta.toFixed(2),
        winner: a.beta < b.beta ? 'A' : b.beta < a.beta ? 'B' : 'TIE',
        summary: a.beta < b.beta ? `${a.name} reagiert defensiver und weniger marktgetrieben.` : `${b.name} reagiert defensiver und weniger marktgetrieben.`,
      },
      {
        id: 'cvar',
        title: 'CVaR 95 % (Extreme Tail Risk)',
        subtitle: 'Erwarteter Verlust in den schlimmsten 5 % der Krisen',
        tooltipTitle: 'Conditional Value at Risk (95 %)',
        tooltipText: 'Stochastischer Stresstest: Wie hoch ist der Durchschnittsverlust in den schlimmsten 5 % aller simulierten Pfade? Geringerer Verlust gewinnt.',
        valA: `${a.cvar.toFixed(1)} %`,
        valB: `${b.cvar.toFixed(1)} %`,
        winner: a.cvar > b.cvar ? 'A' : b.cvar > a.cvar ? 'B' : 'TIE',
        summary: a.cvar > b.cvar ? `${a.name} begrenzt Extremverluste bei Marktschocks deutlich besser.` : `${b.name} begrenzt Extremverluste bei Marktschocks deutlich besser.`,
      }
    );
  }

  return cats;
}

/* ==========================================================================
   DIFFERENZIERTES FAZIT & STRATEGISCHE SYNTHESE
   ========================================================================== */
function buildVerdict(a, b, scoreA, scoreB) {
  const isA_Etf = a.assetType === 'ETF';
  const isB_Etf = b.assetType === 'ETF';
  const isA_Aktie = a.assetType === 'Aktie';
  const isB_Aktie = b.assetType === 'Aktie';
  const isKrypto = a.assetType === 'Krypto' || b.assetType === 'Krypto';

  // 1. ETF vs. Einzelaktie
  if ((isA_Etf && isB_Aktie) || (isB_Etf && isA_Aktie)) {
    const etf = isA_Etf ? a : b;
    const aktie = isA_Aktie ? a : b;
    return {
      type: 'etf_vs_stock',
      title: 'Das klassische Fundament vs. Wachstums-Duell',
      winnerHighlight: `${etf.name} (Sicherheit) vs. ${aktie.name} (Dynamik)`,
      text: `${etf.name} gewinnt bei Stabilität, Crash-Schutz und Ausfallsicherheit, weil dein Geld auf hunderte Unternehmen gestreut ist. ${aktie.name} punktet dafür bei der maximalen Wachstumsdynamik.`,
      recommendation: `Ideale Kombination (Core-Satellite): Nutze ${etf.name} als solides 70–80 % Fundament in deinem Depot und mische ${aktie.name} mit 10–20 % als gezielten Wachstums-Booster bei. So vereinst du das Beste aus beiden Welten.`,
    };
  }

  // 2. ETF vs. ETF
  if (isA_Etf && isB_Etf) {
    const higherReturn = a.return5Y > b.return5Y ? a : b;
    const lowerDrawdown = a.maxDd > b.maxDd ? a : b;
    return {
      type: 'etf_vs_etf',
      title: 'Zwei erstklassige Basis-Investments im Direktvergleich',
      winnerHighlight: scoreA > scoreB ? `${a.name} liegt vorne` : scoreB > scoreA ? `${b.name} liegt vorne` : 'Ausgeglichenes Duell',
      text: `Beide ETFs sind hervorragende, hochgradig diversifizierte Bausteine für den langfristigen Vermögensaufbau. ${higherReturn.name} lieferte in den letzten 5 Jahren etwas mehr Rendite, während ${lowerDrawdown.name} mit besonders ruhigem Verlauf punktet.`,
      recommendation: `Praxis-Tipp: Du musst dich nicht zerreißen. Wähle den ETF, dessen Schwerpunkt dir besser zusagt, und bespare ihn dauerhaft. Beide gleichzeitig zu besparen führt oft zu Überschneidungen (Klumpenbildung).`,
    };
  }

  // 3. Aktie vs. Aktie
  if (isA_Aktie && isB_Aktie) {
    const winner = scoreA > scoreB ? a : scoreB > scoreA ? b : null;
    return {
      type: 'stock_vs_stock',
      title: 'Zwei Einzelaktien im direkten Qualitätsvergleich',
      winnerHighlight: winner ? `${winner.name} entscheidet das Duell für sich` : 'Kopf-an-Kopf-Rennen',
      text: winner 
        ? `${winner.name} überzeugt im Gesamtvergleich aus Renditestärke, Stabilität und historischer Trefferquote.` 
        : `Beide Unternehmen spielen in der obersten Liga ihrer Branche und bieten jeweils spezifische Stärken.`,
      recommendation: `Wichtig bei Einzelaktien: Achte darauf, dass keine einzelne Aktie mehr als 10–15 % deines Gesamtdepots ausmacht, um vor überraschenden Branchenkrisen geschützt zu bleiben.`,
    };
  }

  // 4. Krypto vs. Sachwert
  if (isKrypto) {
    const krypto = a.assetType === 'Krypto' ? a : b;
    const standard = a.assetType === 'Krypto' ? b : a;
    return {
      type: 'crypto_vs_asset',
      title: 'Spekulative Krypto-Dynamik vs. Etablierter Sachwert',
      winnerHighlight: `${standard.name} gewinnt bei Stabilität, ${krypto.name} bei Volatilität`,
      text: `${krypto.name} unterliegt extremen Kursschwankungen und Abstürzen von über 70 %, bietet jedoch asymmetrische Kursfantasie. ${standard.name} ist ein fundamental gedeckter Vermögenswert.`,
      recommendation: `Risikomanagement: Krypto-Assets sollten im soliden Vermögensaufbau maximal 2 bis 5 % des Gesamtdepots ausmachen (Spielgeld-Prinzip).`,
    };
  }

  return {
    type: 'general',
    title: 'HAVN Duell-Zusammenfassung',
    winnerHighlight: scoreA > scoreB ? `${a.name} führt` : `${b.name} führt`,
    text: `Beide Wertpapiere bringen spezifische Stärken für unterschiedliche Anlageziele mit.`,
    recommendation: `Entscheide nach deinem persönlichen Anlagehorizont: Mehr Risiko bringt mehr Chance, erfordert aber auch stärkere Nerven bei Marktkrisen.`,
  };
}

/* ==========================================================================
   KOMPONENTE: ASSET BATTLE
   ========================================================================== */
export default function AssetBattle({ experienceMode = 'beginner', initialAssetA = 'EUNL.DE', onAnalyzeAsset }) {
  const [assetA, setAssetA] = useState(initialAssetA);
  const [assetB, setAssetB] = useState('NVDA');

  useEffect(() => {
    if (initialAssetA && BATTLE_ASSETS.some((a) => a.symbol === initialAssetA)) {
      setAssetA(initialAssetA);
      if (initialAssetA === 'NVDA') setAssetB('EUNL.DE');
    }
  }, [initialAssetA]);

  const dataA = BATTLE_ASSETS.find((a) => a.symbol === assetA) || BATTLE_ASSETS[0];
  const dataB = BATTLE_ASSETS.find((a) => a.symbol === assetB) || BATTLE_ASSETS[1];

  const isPro = experienceMode === 'pro';
  const categories = buildCategories(dataA, dataB, isPro);

  const scoreA = categories.filter((c) => c.winner === 'A').length;
  const scoreB = categories.filter((c) => c.winner === 'B').length;
  const verdict = buildVerdict(dataA, dataB, scoreA, scoreB);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header mit Modus-Badge und Asset-Auswahl */}
      <div className="relative rounded-3xl p-6 sm:p-7 glass overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-sky-500/10 text-indigo-300 border border-indigo-400/30 shadow-md">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>HAVN Asset-Duell</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                  {isPro ? 'Pro-Vergleich' : 'Klartext-Vergleich'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Vergleiche zwei Investments direkt und unverfälscht auf Rendite, Crash-Sicherheit und Sparplan-Tauglichkeit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs px-3.5 py-1.5 rounded-xl glass-chip text-slate-300 font-mono font-bold flex items-center gap-2">
              <span className="text-slate-400">Punktestand:</span>
              <span className="text-sky-300 font-black text-sm">{scoreA}</span>
              <span className="text-slate-500">:</span>
              <span className="text-indigo-300 font-black text-sm">{scoreB}</span>
            </span>
          </div>
        </div>

        {/* 2. Beide Kontrahenten (Cards nebeneinander) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Asset A */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${scoreA > scoreB ? 'bg-sky-950/40 border-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.15)]' : 'glass-inset'}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span>Wertpapier 1</span>
                {scoreA > scoreB && <span className="text-amber-400 font-bold flex items-center gap-0.5">👑 Führt</span>}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {dataA.symbol}
              </span>
            </div>

            <select
              value={assetA}
              onChange={(e) => setAssetA(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer mb-3"
            >
              {BATTLE_ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol} disabled={a.symbol === assetB}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Anlageklasse:</span>
                <span className="font-semibold text-white">{dataA.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rolle im Depot:</span>
                <span className="font-semibold text-sky-300">{dataA.role}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-white/[0.06]">
                {dataA.strength}
              </p>
            </div>

            {onAnalyzeAsset && (
              <button
                type="button"
                onClick={() => onAnalyzeAsset(dataA.symbol)}
                className="mt-3 w-full py-2 px-3 rounded-xl glass-chip hover:bg-white/10 text-sky-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Im Hafen im Detail analysieren</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Asset B */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${scoreB > scoreA ? 'bg-indigo-950/40 border-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.15)]' : 'glass-inset'}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <span>Wertpapier 2</span>
                {scoreB > scoreA && <span className="text-amber-400 font-bold flex items-center gap-0.5">👑 Führt</span>}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {dataB.symbol}
              </span>
            </div>

            <select
              value={assetB}
              onChange={(e) => setAssetB(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer mb-3"
            >
              {BATTLE_ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol} disabled={a.symbol === assetA}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Anlageklasse:</span>
                <span className="font-semibold text-white">{dataB.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rolle im Depot:</span>
                <span className="font-semibold text-indigo-300">{dataB.role}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-white/[0.06]">
                {dataB.strength}
              </p>
            </div>

            {onAnalyzeAsset && (
              <button
                type="button"
                onClick={() => onAnalyzeAsset(dataB.symbol)}
                className="mt-3 w-full py-2 px-3 rounded-xl glass-chip hover:bg-white/10 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Im Hafen im Detail analysieren</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Kategorien-Vergleichstabelle */}
      <div className="glass rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Direkter Kriterien-Vergleich
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full glass-chip text-slate-300 font-mono">
            {categories.length} Disziplinen
          </span>
        </div>

        <div className="space-y-3 relative z-10">
          {categories.map((cat, idx) => {
            const isWinnerA = cat.winner === 'A';
            const isWinnerB = cat.winner === 'B';

            return (
              <div
                key={cat.id}
                className="glass-inset rounded-2xl p-4 transition-all hover:border-white/20 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {idx + 1}. {cat.title}
                    </span>
                    <InfoTooltip title={cat.tooltipTitle} text={cat.tooltipText} />
                  </div>
                  <span className="text-[11px] text-slate-400">{cat.subtitle}</span>
                </div>

                {/* Werte-Vergleich nebeneinander */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/[0.06]">
                  {/* Asset A Value */}
                  <div className={`p-3 rounded-xl flex items-center justify-between ${isWinnerA ? 'bg-sky-500/15 border border-sky-400/30' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{dataA.name}</div>
                      <div className={`text-base font-black font-mono mt-0.5 ${isWinnerA ? 'text-sky-300' : 'text-slate-300'}`}>
                        {cat.valA}
                      </div>
                    </div>
                    {isWinnerA && <span className="text-base" title="Gewinnt diesen Punkt">🏆</span>}
                  </div>

                  {/* Asset B Value */}
                  <div className={`p-3 rounded-xl flex items-center justify-between ${isWinnerB ? 'bg-indigo-500/15 border border-indigo-400/30' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{dataB.name}</div>
                      <div className={`text-base font-black font-mono mt-0.5 ${isWinnerB ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {cat.valB}
                      </div>
                    </div>
                    {isWinnerB && <span className="text-base" title="Gewinnt diesen Punkt">🏆</span>}
                  </div>
                </div>

                {/* Verständliche Einordnung des Runden-Ergebnisses */}
                <p className="text-[11.5px] text-slate-300 leading-relaxed flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{cat.summary}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* 4. Das differenzierte Duell-Urteil (Strategische Synthese) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-400/30 space-y-3 relative z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
              {verdict.title}
            </h4>
          </div>

          <div className="text-sm font-bold text-white">
            {verdict.winnerHighlight}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {verdict.text}
          </p>

          <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-slate-200">
            <Compass className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Strategischer Portfolio-Tipp: </strong>
              {verdict.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
