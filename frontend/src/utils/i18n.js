/**
 * HAVN Internationalization (i18n) Engine
 * Unterstützt 10 globale Sprachen:
 * 1. Deutsch (DE) 🇩🇪
 * 2. English (EN) 🇬🇧
 * 3. Español (ES) 🇪🇸
 * 4. Français (FR) 🇫🇷
 * 5. Italiano (IT) 🇮🇹
 * 6. Türkçe (TR) 🇹🇷
 * 7. Nederlands (NL) 🇳🇱
 * 8. 한국어 (KO) 🇰🇷
 * 9. 日本語 (JA) 🇯🇵
 * 10. 中文 (ZH) 🇨🇳
 */

import de from './translations/de.js';
import en from './translations/en.js';
import es from './translations/es.js';
import fr from './translations/fr.js';
import it from './translations/it.js';
import tr from './translations/tr.js';
import nl from './translations/nl.js';
import ko from './translations/ko.js';
import ja from './translations/ja.js';
import zh from './translations/zh.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', region: 'DACH-Region' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global / International' },
  { code: 'es', name: 'Spanisch', nativeName: 'Español', flag: '🇪🇸', region: 'España & Latinoamérica' },
  { code: 'fr', name: 'Französisch', nativeName: 'Français', flag: '🇫🇷', region: 'France, Belgique & Suisse' },
  { code: 'it', name: 'Italienisch', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italia & Svizzera' },
  { code: 'tr', name: 'Türkisch', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Türkiye & Avrupa' },
  { code: 'nl', name: 'Niederländisch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Nederland & België' },
  { code: 'ko', name: 'Koreanisch', nativeName: '한국어', flag: '🇰🇷', region: '대한민국 (Südkorea)' },
  { code: 'ja', name: 'Japanisch', nativeName: '日本語', flag: '🇯🇵', region: '日本 (Japan)' },
  { code: 'zh', name: 'Chinesisch', nativeName: '中文', flag: '🇨🇳', region: '中国 / 全球华人' },
];

export const TRANSLATIONS = {
  de,
  en,
  es,
  fr,
  it,
  tr,
  nl,
  ko,
  ja,
  zh,
};

/**
 * Holt einen verschachtelten Übersetzungswert per Key (z.B. 'nav.terminal')
 */
export function getTranslation(lang = 'de', key = '', fallback = '') {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.de;
  const parts = key.split('.');
  let current = dict;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = current[p];
    } else {
      // Fallback zu Deutsch
      let deCurrent = TRANSLATIONS.de;
      for (const dep of parts) {
        if (deCurrent && typeof deCurrent === 'object' && dep in deCurrent) {
          deCurrent = deCurrent[dep];
        } else {
          return fallback || key;
        }
      }
      return deCurrent || fallback || key;
    }
  }
  return current || fallback || key;
}
