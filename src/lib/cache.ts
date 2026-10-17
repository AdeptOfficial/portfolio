/**
 * In-process TTL cache + rate limiter.
 * Replaces Upstash/Vercel KV — this app runs as a single Node instance on the
 * homeserver, so distributed state isn't needed.
 */

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Sliding-window-ish counter: true when `ip` exceeded `max` hits per `windowSeconds`. */
export function isRateLimited(bucket: string, ip: string, max: number, windowSeconds: number): boolean {
  if (import.meta.env.DEV) return false;
  const key = `rl:${bucket}:${ip}`;
  const count = (cacheGet<number>(key) ?? 0) + 1;
  // Keep the original expiry by re-reading the entry's window; simplest: reset TTL only on first hit.
  const entry = store.get(key);
  const expiresAt = entry && Date.now() <= entry.expiresAt ? entry.expiresAt : Date.now() + windowSeconds * 1000;
  store.set(key, { value: count, expiresAt });
  return count > max;
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
