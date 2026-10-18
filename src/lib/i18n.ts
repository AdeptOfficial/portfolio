import chinese from '../i18n/zh-Hans.json';

export type Locale = 'en' | 'zh-Hans';
export const prefix = '/zh-hans';
const dictionary: Record<string, string> = chinese;
export function translate(locale: Locale, source: string): string {
  if (locale === 'en') return source;
  const translated = dictionary[source];
  if (translated === undefined) throw new Error(`Missing Chinese translation: ${source}`);
  return translated;
}
export function englishPath(path: string): string {
  const result = path.replace(/^\/zh-hans(?=\/|$)/, '') || '/';
  return result.endsWith('/') ? result : `${result}/`;
}
export function hasTranslation(path: string, portfolio = true): boolean {
  const plain = englishPath(path);
  if (portfolio) return ['/', '/contact/'].includes(plain);
  return ['/', '/about/', '/contact/', '/blog/', '/dev-notes/'].includes(plain)
    || /^\/apps\/(amp-watchdog|dayplan|domain-watcher|status-tracker)\/$/.test(plain);
}
export function i18n(url: URL) {
  const locale: Locale = /^\/zh-hans(?:\/|$)/.test(url.pathname) ? 'zh-Hans' : 'en';
  const t = (source: string) => translate(locale, source);
  function localize(href: string | null | undefined): string | undefined {
    if (href == null) return undefined;
    if (href.startsWith('#') || !/^(\/|https?:)/.test(href)) return href;
    const target = new URL(href, url);
    const crossSite = /^https?:/.test(href) && ['adeptproductions.dev', 'me.adeptproductions.dev'].includes(target.hostname);
    if (target.origin !== url.origin && !crossSite) return href;
    const portfolio = crossSite ? target.hostname.startsWith('me.') : true;
    if (locale === 'zh-Hans' && hasTranslation(target.pathname, portfolio)) target.pathname = prefix + englishPath(target.pathname);
    // Dev navigation stays on dev; metadata always uses Astro.site separately.
    if (crossSite && import.meta.env.PUBLIC_DEPLOY_ENV === 'dev') {
      target.protocol = 'http:';
      target.host = portfolio ? '10.0.2.26' : '10.0.2.25';
    }
    return target.origin === url.origin ? target.pathname + target.search + target.hash : target.href;
  }
  return {locale, t, localize};
}
