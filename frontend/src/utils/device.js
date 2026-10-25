/**
 * HAVN Device & Display Mode Detection
 * Erkennt PWA, Home Screen Web Clip (iOS Bookmark) und Safe Area Gegebenheiten.
 */

export function checkIsStandalone() {
  if (typeof window === 'undefined') return false;

  // 1. iOS Safari Home Screen standalone Web Clip
  if (window.navigator && window.navigator.standalone === true) {
    return true;
  }

  // 2. W3C Display Modes
  if (window.matchMedia) {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;
  }

  // 3. Android PWA WebAPK
  if (document.referrer && document.referrer.includes('android-app://')) {
    return true;
  }

  // 4. Start-URL Parameter
  try {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('source') === 'pwa' ||
      params.get('mode') === 'standalone' ||
      params.get('utm_source') === 'homescreen'
    ) {
      return true;
    }
  } catch (e) {}

  return false;
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isSafari: false, isStandalone: false };
  }

  const ua = window.navigator.userAgent || '';
  const isStandalone = checkIsStandalone();

  // iOS-Erkennung: iPhone, iPad, iPod oder iPadOS mit Desktop-UserAgent
  const isClassicIOS = /iPad|iPhone|iPod/i.test(ua);
  const isMacTouch = (window.navigator.platform === 'MacIntel' || /Macintosh/i.test(ua)) && 
                     (window.navigator.maxTouchPoints > 1 || 'ontouchend' in document);
  const isIOS = (isClassicIOS || isMacTouch) && !window.MSStream;

  // Safari auf iOS
  const isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return { isIOS, isSafari, isStandalone };
}
