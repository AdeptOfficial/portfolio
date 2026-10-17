import { useCallback, useEffect, useRef, useState } from 'react';

type TrackData = {
  is_playing: boolean;
  progress_ms?: number;
  item: {
    id: string;
    name: string;
    artists: { name: string }[];
    duration_ms: number;
    album: { images: { url: string }[] };
    external_urls: { spotify?: string };
  } | null;
};

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Polls /api/spotify/now-playing every 7s (paused while the tab is hidden). */
export default function NowPlaying() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' });
      if (!res.ok) {
        setTrack(null);
        return;
      }
      const data: TrackData = await res.json();
      setTrack(data);
      setStartTime(data.item && data.progress_ms !== undefined ? Date.now() - data.progress_ms : null);
    } catch {
      setTrack(null);
    }
  }, []);

  useEffect(() => {
    const start = () => {
      fetchTrack();
      pollRef.current ??= setInterval(fetchTrack, 7000);
    };
    const stop = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchTrack]);

  // Smooth local progress between polls.
  useEffect(() => {
    if (!track?.is_playing || !startTime || !track.item) return;
    const id = setInterval(() => {
      setProgress(Math.min(Date.now() - startTime, track.item!.duration_ms));
    }, 1000);
    return () => clearInterval(id);
  }, [track, startTime]);

  const item = track?.item;
  const art = item?.album.images[0]?.url;

  return (
    <div className="border border-line bg-card p-4">
      <p className="overline" style={{ color: track?.is_playing ? 'var(--color-signal)' : undefined }}>
        {track?.is_playing ? '// Now playing' : '// Spotify — idle'}
      </p>
      {item ? (
        <a
          href={item.external_urls.spotify}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-3"
        >
          {art && <img src={art} alt="" className="size-14 border border-line object-cover" />}
          <div className="min-w-0">
            <p className="truncate font-display font-bold leading-tight">{item.name}</p>
            <p className="truncate text-sm text-muted">{item.artists.map((a) => a.name).join(', ')}</p>
            {track?.is_playing && (
              <p className="mt-1 font-mono text-[10px] tracking-widest text-faint">
                {fmt(progress)} / {fmt(item.duration_ms)}
              </p>
            )}
          </div>
        </a>
      ) : (
        <p className="mt-3 text-sm text-faint">Nothing on right now.</p>
      )}
      {track?.is_playing && item && (
        <div className="mt-3 h-0.5 w-full bg-line">
          <div
            className="h-full transition-[width] duration-1000 ease-linear"
            style={{ width: `${(progress / item.duration_ms) * 100}%`, background: 'var(--color-signal)' }}
          />
        </div>
      )}
    </div>
  );
}
