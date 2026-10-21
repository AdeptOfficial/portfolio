# AdepT · portfolio

The personal site at **https://me.adeptproductions.dev**: a single-page,
dossier-themed portfolio ("Mark 2") in English and Simplified Chinese.

## Stack

- Astro 7 with the Node adapter, React islands, Tailwind 4
- The AdepT design system shared with the studio site (dark terminal-dossier look,
  cyan signal accent, magenta signature)
- Containerised with the `Dockerfile` and `compose.yaml` in this repo

## Branches

- `main`: Mark 2, the version that is live. Work happens here.
- `mark-1-nextjs` (tag `mark-1`): the frozen Next.js Mark 1. Kept for history; do not merge it into `main`.

## Run locally

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # runs the i18n check first, then astro build
npm run preview      # serves the built site from dist/
```

`npm run check:i18n` verifies that every string exists in both languages.

## Deploy

Build the image from the `Dockerfile` and run it with `compose.yaml`. Where it runs,
how it is fronted and how a release is approved are documented privately; the
publishing flow is user-gated, dev first, then production.

## // codesign

<img src="https://raw.githubusercontent.com/AdeptOfficial/AdeptOfficial/main/assets/codesign.svg" alt="// code-signed by AdepT_X · stay sad and dead <3" width="440" height="36">

<img src="https://raw.githubusercontent.com/AdeptOfficial/AdeptOfficial/main/assets/codesign-badge.svg" alt="code-signed by AdepT_X">
