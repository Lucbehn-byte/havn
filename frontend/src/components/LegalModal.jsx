import React, { useState } from 'react';
import { ShieldCheck, Scale, FileText, X, Globe, AlertTriangle, ExternalLink } from 'lucide-react';

export default function LegalModal({ isOpen, onClose }) {
  const [lang, setLang] = useState('de'); // 'de' oder 'en'
  const [activeTab, setActiveTab] = useState('impressum'); // 'impressum', 'disclaimer', 'privacy'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl liquid-glass rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-900/95 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {lang === 'de' ? 'Rechtliche Hinweise & Datenschutz' : 'Legal Notice & Privacy Policy'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'de' ? 'Transparenz nach deutschem & internationalem Recht' : 'Full compliance with German DDG, EU GDPR & International Standards'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sprachwechsler */}
            <div className="glass-inset p-0.5 rounded-xl flex items-center text-xs">
              <button
                type="button"
                onClick={() => setLang('de')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === 'de' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-5 pt-2 gap-2 text-xs font-bold bg-slate-950/20">
          <button
            type="button"
            onClick={() => setActiveTab('impressum')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'impressum'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'de' ? 'Impressum (§ 5 DDG)' : 'Legal Notice'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'de' ? 'Haftungsausschluss' : 'Disclaimer'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'de' ? 'Datenschutz (DSGVO)' : 'Privacy Policy (GDPR)'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          
          {/* TAB 1: IMPRESSUM */}
          {activeTab === 'impressum' && (
            lang === 'de' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-black text-white mb-1">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</h4>
                  <p>
                    <strong>Diensteanbieter:</strong><br />
                    HAVN Systems & Quant Technologies<br />
                    Betreiber: Luc Behn<br />
                    E-Mail: <span className="text-sky-400 font-mono">kontakt@havn.app</span><br />
                    Internet: <span className="text-sky-400 font-mono">https://havn.app</span>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-sm font-black text-white mb-1">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h4>
                  <p>
                    Luc Behn<br />
                    Kontakt via E-Mail: <span className="text-sky-400 font-mono">kontakt@havn.app</span>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-sm font-black text-white mb-1">EU-Streitschlichtung</h4>
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                    <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-sky-400 underline ml-1 inline-flex items-center gap-1">
                      ec.europa.eu/consumers/odr <ExternalLink className="w-3 h-3" />
                    </a>.<br />
                    Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3 text-slate-400">
                  <p>© 2026 HAVN Systems. Alle Rechte vorbehalten. Code, Algorithmen und Oberfläche sind urheberrechtlich geschützt.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-black text-white mb-1">Legal Notice / Provider Identification</h4>
                  <p>
                    <strong>Provider & Operator:</strong><br />
                    HAVN Systems & Quant Technologies<br />
                    Representative: Luc Behn<br />
                    Contact: <span className="text-sky-400 font-mono">kontakt@havn.app</span><br />
                    Website: <span className="text-sky-400 font-mono">https://havn.app</span>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-sm font-black text-white mb-1">Intellectual Property</h4>
                  <p>
                    All software, design elements, algorithms, and models available via HAVN are the intellectual property of HAVN Systems. Unauthorized duplication or commercial redistribution without written permission is prohibited.
                  </p>
                </div>
              </div>
            )
          )}

          {/* TAB 2: HAFTUNGSAUSSCHLUSS / DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            lang === 'de' ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200 leading-snug">
                    <strong>Wichtiger rechtlicher Hinweis:</strong> HAVN erbringt keine Anlageberatung, Vermögensverwaltung oder Finanzdienstleistung im Sinne des Wertpapierhandelsgesetzes (WpHG) oder Kreditwesengesetzes (KWG).
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">1. Reiner Informations- & Bildungszweck</h4>
                  <p>
                    Alle in dieser Web-Applikation bereitgestellten Daten, Indikatoren, Kennzahlen und Simulationen dienen ausschließlich der Information und Bildung von Privatanlegern. Sie stellen weder ein Angebot, noch eine Empfehlung oder Aufforderung zum Kauf oder Verkauf von Wertpapieren, Derivaten oder sonstigen Finanzinstrumenten dar.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">2. Stochastische Natur der Simulationen</h4>
                  <p>
                    Die dargestellten Monte-Carlo-Simulationen (Merton Jump-Diffusion, Value at Risk, Krisen-Stresstests) beruhen auf mathematischen Zufallspfaden und historischen Kursdaten. Die Wertentwicklung in der Vergangenheit ist kein verlässlicher Indikator für künftige Ergebnisse. Marktkrisen, plötzliche Volatilitätssprünge oder Totalverluste von Einzelunternehmen können von theoretischen Modellen nicht mit Gewissheit vorhergesagt werden.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">3. Eigenverantwortung des Nutzers</h4>
                  <p>
                    Investitionen am Kapitalmarkt erfolgen stets auf eigenes Risiko. Der Betreiber übernimmt keinerlei Haftung für finanzielle Verluste oder Schäden, die aus Anlageentscheidungen auf Grundlage der App resultieren. Bitte ziehe bei Bedarf einen zertifizierten, unabhängigen Honorar- oder Anlageberater hinzu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200 leading-snug">
                    <strong>Notice:</strong> HAVN does not provide financial advice, investment advisory services, or broker-dealer services.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">1. Informational & Educational Use Only</h4>
                  <p>
                    All content, mathematical projections, scores, and indicators are provided solely for analytical and educational purposes. Nothing on this website constitutes a solicitation, recommendation, or endorsement to buy or sell any security.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">2. Model Assumptions & Market Risk</h4>
                  <p>
                    Monte Carlo simulations and historical drawdowns are based on stochastic models. Past performance is no guarantee of future results. Financial markets carry substantial risk, including the loss of principal.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">3. Limitation of Liability</h4>
                  <p>
                    To the maximum extent permitted by applicable law, HAVN and its contributors disclaim any liability for direct, indirect, or consequential losses incurred through the use of this software.
                  </p>
                </div>
              </div>
            )
          )}

          {/* TAB 3: DATENSCHUTZ / PRIVACY */}
          {activeTab === 'privacy' && (
            lang === 'de' ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-300 leading-snug">
                    <strong>Privacy by Design:</strong> HAVN setzt <strong>keine Tracking-Cookies</strong>, erfordert <strong>keinen Login</strong> und sammelt <strong>keine personenbezogenen Nutzerprofile</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">1. Erfassung von Zugriffsdaten & Logfiles</h4>
                  <p>
                    Beim Aufruf unserer Web-App werden technisch notwendige Verbindungsdaten an den Server übertragen. Zum Schutz vor Missbrauch (z. B. Denial-of-Service-Angriffen) und zur Zählung der täglichen Besucher wird die IP-Adresse des Nutzers <strong>unmittelbar mit einem täglich wechselnden kryptografischen Schlüssel gehasht</strong> (SHA-256). Eine Rückführung auf deine Person ist ausgeschlossen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Ausfallsicherheit).
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">2. Lokale Speicherung im Browser (LocalStorage)</h4>
                  <p>
                    Um deine Einstellungen (z. B. gewählte Favoriten-Aktien oder der Einsteiger-/Pro-Modus) zwischen Sitzungen zu erhalten, nutzt HAVN den lokalen Speicher deines Browsers (LocalStorage). Diese Daten verbleiben ausschließlich auf deinem Gerät und werden niemals an unsere Server übertragen.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">3. Externe Marktdaten</h4>
                  <p>
                    Börsenkurse und historische Zeitreihen werden serverseitig über Finanzschnittstellen bezogen. Deine persönliche IP-Adresse wird bei diesen Abfragen nicht an Drittanbieter weitergegeben.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">4. Deine Rechte</h4>
                  <p>
                    Dir stehen nach der DSGVO das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung zu. Da wir keine Klardaten speichern, kontaktiere uns bei Fragen gern jederzeit unter <span className="text-sky-400 font-mono">kontakt@havn.app</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-300 leading-snug">
                    <strong>Privacy by Design:</strong> Zero tracking cookies, no accounts required, no personal profiling.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">1. Data Minimization & Server Logs</h4>
                  <p>
                    To ensure service uptime and count daily visits, incoming IP addresses are immediately hashed using SHA-256 with a daily rotating salt. Raw IP addresses are not stored.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">2. Local Storage</h4>
                  <p>
                    Preferences such as saved watchlists or experience modes are stored strictly client-side on your device via HTML5 LocalStorage.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white mb-1">3. Contact</h4>
                  <p>
                    For any privacy inquiries under GDPR or CCPA, reach out directly to <span className="text-sky-400 font-mono">kontakt@havn.app</span>.
                  </p>
                </div>
              </div>
            )
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/50">
          <span className="text-[11px] text-slate-500 font-medium">
            Stand: Oktober 2026 • HAVN Systems
          </span>
          <button
            type="button"
            onClick={onClose}
            className="liquid-glass-active px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            {lang === 'de' ? 'Schließen' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
