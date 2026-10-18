import { translate, type Locale } from '../lib/i18n';
import { useEffect, useState } from 'react';

/** Fetches the live Discord avatar; falls back to a monogram when unavailable. */
export default function DiscordAvatar({locale = 'en'}: {locale?: Locale}) {
  const t = (text: string) => translate(locale, text);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/discord')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => (d.profilePicUrl ? setUrl(d.profilePicUrl) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);

  return (
    <div
      className="grid size-40 place-items-center overflow-hidden rounded-full border-2 bg-surface sm:size-56 lg:size-64"
      style={{ borderColor: 'var(--color-signal)', boxShadow: '0 0 60px rgba(63, 212, 230, 0.25)' }}
    >
      {url ? (
        <img src={url} alt={t("AdepT's avatar")} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : failed ? (
        <span className="select-none font-display text-6xl font-bold sm:text-8xl" style={{ color: 'var(--color-signal)' }}>
          A
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-widest text-faint">{t('loading')}</span>
      )}
    </div>
  );
}
