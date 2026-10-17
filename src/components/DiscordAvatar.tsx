import { useEffect, useState } from 'react';

/** Fetches the live Discord avatar and renders it with a signal ring. */
export default function DiscordAvatar() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/discord')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUrl(d.profilePicUrl))
      .catch(() => setUrl(null));
  }, []);

  return (
    <div
      className="grid size-40 place-items-center overflow-hidden rounded-full border-2 bg-surface sm:size-56 lg:size-64"
      style={{ borderColor: 'var(--color-signal)', boxShadow: '0 0 60px rgba(63, 212, 230, 0.25)' }}
    >
      {url ? (
        <img src={url} alt="AdepT's avatar" className="size-full object-cover" />
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-widest text-faint">loading</span>
      )}
    </div>
  );
}
