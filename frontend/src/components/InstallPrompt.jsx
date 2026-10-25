import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, X, Sparkles, Check, ChevronRight } from 'lucide-react';

export default function InstallPrompt({ forceShow = false, onCloseManual }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Prüfen, ob die App bereits als PWA installiert/geöffnet ist
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    // Prüfen, ob iOS (iPhone / iPad)
    const ua = window.navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isAppleDevice);

    if (checkStandalone && !forceShow) return;

    // Prüfen, ob der Nutzer das Banner in den letzten 14 Tagen weggeklickt hat
    const dismissedUntil = localStorage.getItem('havn_pwa_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    // Android / Desktop Chrome 'beforeinstallprompt' Event abfangen
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed || forceShow) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Bei iOS: Banner nach kurzem Timeout (3 Sek.) zeigen, falls nicht abgewählt
    if (isAppleDevice && (!isDismissed || forceShow)) {
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [forceShow]);

  // Manuelles Öffnen über Navbar
  useEffect(() => {
    if (forceShow) {
      if (isIOS) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        handleInstallClick();
      } else {
        setShowIOSModal(true);
      }
    }
  }, [forceShow]);

  const handleDismiss = () => {
    setShowBanner(false);
    // Für 14 Tage nicht mehr automatisch anzeigen
    const fourteenDays = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem('havn_pwa_dismissed_until', fourteenDays.toString());
    if (onCloseManual) onCloseManual();
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setShowBanner(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  };

  if (isStandalone && !forceShow) return null;

  return (
    <>
      {/* Floating Liquid-Glass Banner */}
      {showBanner && !showIOSModal && (
        <aside 
          aria-label="App-Installation"
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-slideUp"
        >
          <div className="liquid-glass rounded-2xl p-3.5 border border-white/20 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 bg-slate-900/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-sky-400/30 shadow-md shadow-sky-500/20 bg-slate-950 p-0.5">
                <img src="/apple-touch-icon.png" alt="HAVN" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white tracking-tight truncate">HAVN als App</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300">
                    Kostenlos
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {isIOS ? 'Mit 1 Klick auf deinen Home-Bildschirm' : 'Offline-Start & Vollbild-Erlebnis'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="liquid-glass-active px-3 py-1.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {installedSuccess ? (
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
                onClick={handleDismiss}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS / Universal Step-by-Step Liquid-Glass Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-white/20 shadow-2xl relative bg-slate-900/90 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-sky-400/30 shadow-md bg-slate-950 p-0.5">
                  <img src="/apple-touch-icon.png" alt="HAVN" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">HAVN App installieren</h3>
                  <p className="text-xs text-sky-400 font-medium">In 10 Sekunden startklar — 100% kostenlos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowIOSModal(false); if (onCloseManual) onCloseManual(); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* iOS Anleitung */}
            {isIOS ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Installiere HAVN direkt über Apple Safari ohne Umweg über den App Store:
                </p>

                <div className="space-y-3">
                  {/* Schritt 1 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 font-black text-xs">
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      Tippe in der Safari-Menüleiste unten auf <strong className="text-white">„Teilen“</strong>
                    </div>
                    <Share className="w-5 h-5 text-sky-400 shrink-0" />
                  </div>

                  {/* Schritt 2 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 font-black text-xs">
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      Scrolle nach unten & wähle <strong className="text-white">„Zum Home-Bildschirm“</strong>
                    </div>
                    <PlusSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>

                  {/* Schritt 3 */}
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 font-black text-xs">
                      3
                    </div>
                    <div className="flex-1 text-xs">
                      Tippe oben rechts auf <strong className="text-white">„Hinzufügen“</strong>
                    </div>
                    <Check className="w-5 h-5 text-teal-400 shrink-0" />
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-300 leading-snug">
                    <strong>Ergebnis:</strong> HAVN öffnet sich danach wie eine native iPhone-App im Vollbild — blitzschnell und ohne Adressleiste.
                  </p>
                </div>
              </div>
            ) : (
              /* Android / Desktop Anleitung */
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Installiere HAVN direkt auf deinem Endgerät für sofortigen Offline-Zugriff und die beste Darstellungsqualität:
                </p>

                <div className="space-y-3">
                  <div className="glass-inset rounded-2xl p-3 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
                    <div className="text-xs">
                      Klicke im Browser-Menü auf <strong className="text-white">„App installieren“</strong> oder das Download-Symbol in der Adressleiste.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-xl liquid-glass-active font-black text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <Download className="w-4 h-4" />
                  Jetzt installieren
                </button>
              </div>
            )}

            {/* Schließen Button */}
            <div className="mt-5 pt-3 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => { setShowIOSModal(false); if (onCloseManual) onCloseManual(); }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Verstanden, Fenster schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
