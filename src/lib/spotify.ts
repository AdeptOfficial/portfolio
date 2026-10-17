import { cacheGet, cacheSet } from './cache';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/** Refresh-token flow; access token cached in-process until a minute before expiry. */
export async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const cached = cacheGet<string>('spotify_access_token');
  if (cached) return cached;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) throw new Error('Spotify token refresh failed');
  const data = (await res.json()) as TokenResponse;
  if (!data.access_token) throw new Error('Spotify returned no access_token');

  cacheSet('spotify_access_token', data.access_token, Math.max(data.expires_in - 60, 60));
  return data.access_token;
}
