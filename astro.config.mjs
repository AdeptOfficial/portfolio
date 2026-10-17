// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://adept.dev',
  // Server output: API routes (Spotify/Discord/GitHub) + admin need a runtime.
  // Static-able pages are prerendered individually via `export const prerender = true`.
  output: 'server',
  // Default HTML compression swallows spaces around inline elements.
  compressHTML: false,
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
