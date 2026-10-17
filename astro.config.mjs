// @ts-check
import { execSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Footer "Mark 2 #<hash>" — baked at build time.
const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
})();

// https://astro.build/config
export default defineConfig({
  // The personal page of the studio (original adept.dev domain was lost to a drop-catcher).
  site: 'https://me.adeptproductions.dev',
  // Server output: API routes (Spotify/Discord/GitHub) + admin need a runtime.
  // Static-able pages are prerendered individually via `export const prerender = true`.
  output: 'server',
  // Default HTML compression swallows spaces around inline elements.
  compressHTML: false,
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __COMMIT__: JSON.stringify(commit),
    },
  },
});
