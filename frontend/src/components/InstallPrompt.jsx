import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, X, Sparkles, Check, ArrowDown, ExternalLink } from 'lucide-react';

function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isSafari: false, isStandalone: false };
  }

  const ua = window.navigator.userAgent || '';
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true;

  // iOS-Erkennung: iPhone, iPad, iPod oder iPadOS mit Desktop-UserAgent
  const isClassicIOS = /iPad|iPhone|iPod/i.test(ua);
  const isMacTouch = (window.navigator.platform === 'MacIntel' || /Macintosh/i.test(ua)) && 
                     (window.navigator.maxTouchPoints > 1 || 'ontouchend' in document);
  const isIOS = (isClassicIOS || isMacTouch) && !window.MSStream;

  // Safari auf iOS
  const isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return { isIOS, isSafari, isStandalone };
}

export default function InstallPrompt({ forceShow = false, onCloseManual }) {
  // Synchron sofort bei Montage bestimmen (verhindert falschen Render auf iOS)
  const [device] = useState(() => getDeviceInfo());
  const { isIOS, isSafari, isStandalone } = device;

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (isStandalone && !forceShow) return;

    // Prüfen, ob der Nutzer das Banner in den letzten 14 Tagen geschlossen hat
    const dismissedUntil = localStorage.getItem('havn_pwa_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    // Android / Chrome 'beforeinstallprompt' Event abfangen
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed || forceShow) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Auf dem iPhone/iPad: Banner nach 2 Sekunden dezent einblenden
    if (isIOS && (!isDismissed || forceShow)) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Wenn Desktop/Android ohne beforeinstallprompt, aber forceShow
    if (forceShow) {
      setShowModal(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [forceShow, isIOS, isStandalone]);

  // Manuelles Öffnen über Navbar
  useEffect(() => {
    if (forceShow) {
      setShowModal(true);
    }
  }, [forceShow]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    // Für 14 Tage merken
    const fourteenDays = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem('havn_pwa_dismissed_until', fourteenDays.toString());
    if (onCloseManual) onCloseManual();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseManual) onCloseManual();
  };

  // Klick auf den Banner-Button
  const handleBannerClick = async () => {
    if (isIOS) {
      // Auf dem iPhone gibt es keine automatische Ein-Klick-Installation durch Apple;
      // deshalb sofort die Schritt-für-Schritt-Anleitung öffnen
      setShowModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setShowBanner(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  // Natives Web-Share Sheet öffnen (funktioniert auf iOS Safari oft direkt)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HAVN — Quant Investment & Risikosteuerung',
          text: 'Dein sicherer Hafen für quantitative Vermögensanalysen.',
          url: window.location.href,
        });
      } catch (err) {
        // Abbruch durch Nutzer ist normal
      }
    } else {
      // Fallback
      alert('Tippe bitte direkt unten in Safari auf das Teilen-Symbol (Viereck mit Pfeil).');
    }
  };

  // Wenn bereits als App installiert, nichts anzeigen (außer forceShow)
  if (isStandalone && !forceShow) return null;

  return (
    <>
      {/* 1. DEZENTES FLOATING LIQUID-GLASS BANNER */}
      {showBanner && !showModal && (
        <aside 
          aria-label="App-Installation"
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-slideUp"
        >
          <div className="liquid-glass rounded-2xl p-3 border border-white/20 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 bg-slate-900/85">
            <div 
              onClick={handleBannerClick}
              className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-sky-400/30 shadow-md shadow-sky-500/20 bg-slate-950 p-0.5">
                <img src="/apple-touch-icon.png" alt="HAVN" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white tracking-tight truncate">HAVN als App</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    Kostenlos
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {isIOS ? 'Zum iPhone Home-Bildschirm' : 'Offline-Start & Vollbild-Erlebnis'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleBannerClick}
                className="liquid-glass-active px-3 py-1.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isIOS ? (
                  <>
                    <Share className="w-3.5 h-3.5 text-sky-400" />
                    <span>Holen</span>
                  </>
                ) : installedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Installiert!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Installieren</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. DEDIZIERTES LIQUID-GLASS INSTALLATIONS-MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-white/20 shadow-2xl relative bg-slate-900/95 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-sky-400/30 shadow-md bg-slate-950 p-0.5">
                  <img src="/apple-touch-icon.png" alt="HAVN" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isIOS ? 'HAVN auf dein iPhone holen' : 'HAVN App installieren'}
                  </h3>
                  <p className="text-xs text-sky-400 font-medium">In 10 Sekunden startklar — 100% kostenlos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* A: IPHONE / IPAD SPEZIFISCHE ANLEITUNG */}
            {isIOS ? (
              <div className="space-y-4">
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-sky-200 leading-snug">
                    Apple erlaubt keine direkte Web-Installation per Knopfdruck. Über Safaris Menü ist HAVN aber in <strong>3 schnellen Schritten</strong> als vollwertige Vollbild-App auf deinem Home-Bildschirm:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Schritt 1 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 font-black text-xs">
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      Tippe in Safari <strong className="text-white">unten auf der Leiste</strong> auf das <strong className="text-sky-300">Teilen-Symbol</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <Share className="w-4 h-4 text-sky-400" />
                    </div>
                  </div>

                  {/* Schritt 2 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 font-black text-xs">
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      Scrolle im Menü nach unten und tippe auf <strong className="text-white">„Zum Home-Bildschirm“</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Schritt 3 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 font-black text-xs">
                      3
                    </div>
                    <div className="flex-1 text-xs">
                      Tippe oben rechts auf <strong className="text-white">„Hinzufügen“</strong> — fertig!
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <Check className="w-4 h-4 text-teal-400" />
                    </div>
                  </div>
                </div>

                {/* Optionale Direkthilfe: Natives Teilen-Menü per Klick öffnen */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 rounded-xl liquid-glass-active font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 transition-all"
                  >
                    <Share className="w-3.5 h-3.5 text-sky-300" />
                    <span>Teilen-Menü direkt öffnen</span>
                  </button>
                )}

                {/* Visueller Pfeil nach unten für Safari-Leiste */}
                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 animate-pulse">
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Das Teilen-Symbol befindet sich ganz unten in deiner Safari-Leiste</span>
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </div>
            ) : (
              /* B: ANDROID / DESKTOP SPEZIFISCH */
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Installiere HAVN direkt auf deinem Gerät für sofortigen Offline-Zugriff und die beste Darstellungsqualität:
                </p>

                {deferredPrompt ? (
                  <button
                    type="button"
                    onClick={handleBannerClick}
                    className="w-full py-3 rounded-xl liquid-glass-active font-black text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <Download className="w-4 h-4" />
                    Jetzt installieren
                  </button>
                ) : (
                  <div className="glass-inset rounded-2xl p-4 flex items-center gap-3 border border-white/10 text-xs text-slate-300">
                    <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      Klicke oben rechts im Browser-Menü auf <strong className="text-white">„App installieren“</strong> oder das Download-Symbol in deiner Adressleiste.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Schließen / Bestätigen Button */}
            <div className="mt-5 pt-3 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                {isIOS ? 'Alles klar, verstanden!' : 'Schließen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
