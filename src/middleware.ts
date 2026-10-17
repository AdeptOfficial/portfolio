import { defineMiddleware } from 'astro:middleware';

// Security headers for every response (the studio gets these from nginx;
// here the Node server must set them itself).
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
});
