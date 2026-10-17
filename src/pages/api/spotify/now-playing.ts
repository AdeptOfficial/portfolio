import type { APIRoute } from 'astro';
import { getAccessToken } from '@/lib/spotify';
import { cacheGet, cacheSet } from '@/lib/cache';

const IDLE = { is_playing: false, item: null };
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export const GET: APIRoute = async () => {
  try {
    const cached = cacheGet<object>('now-playing');
    if (cached) return new Response(JSON.stringify(cached), { headers });

    const token = await getAccessToken();
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = nothing playing
    if (res.status === 204) {
      cacheSet('now-playing', IDLE, 5);
      return new Response(JSON.stringify(IDLE), { headers });
    }
    if (!res.ok) {
      return new Response(JSON.stringify({ ...IDLE, error: 'Spotify API call failed' }), {
        status: res.status,
        headers,
      });
    }

    const data = await res.json();
    const payload = {
      is_playing: data.is_playing ?? false,
      progress_ms: data.progress_ms ?? 0,
      item: data.item
        ? {
            id: data.item.id,
            name: data.item.name,
            artists: (data.item.artists ?? []).map((a: { name: string }) => ({ name: a.name })),
            duration_ms: data.item.duration_ms,
            album: { images: data.item.album?.images ?? [] },
            external_urls: data.item.external_urls ?? {},
          }
        : null,
      timestamp: Date.now(),
    };

    cacheSet('now-playing', payload, 5);
    return new Response(JSON.stringify(payload), { headers });
  } catch {
    return new Response(JSON.stringify({ ...IDLE, error: 'Unauthorized' }), { status: 401, headers });
  }
};
