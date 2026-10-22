# CLAUDE.md

Guidance for Claude Code in this repository.

## Project Overview

AdepT's personal portfolio ("Mark 2") — a single-page dossier-themed site, LIVE at
**https://me.adeptproductions.dev** (prod LXC 126; dev deploy at http://10.0.2.26/, LXC 226).
Astro 7 + Node adapter, React islands, Tailwind 4, AdepT design system (shared with
`../studio`). Branch `main` (GitHub default since 2026-10-20; was `astro-rebuild`);
GitHub repo `AdeptOfficial/portfolio` (renamed from adept.dev 2026-10-17). The frozen
Next.js Mark 1 lives on branch `mark-1-nextjs` and tag `mark-1` (Vercel project
paused); never merge it into `main`.

## Non-negotiables

- **Identity redaction:** the user's real name, employer, universities, phone, personal
  email, and venture names must NEVER appear in site source or built output. Redactions
  render via `.redact` bars as a style feature. After content changes, grep `dist/` for
  leaks before deploying.
- **Projects are a hand-picked list** (`PROJECTS` in `src/pages/index.astro`). Never
  reinstate auto-listing from the GitHub API (it leaked private repo names). Private
  projects get `href: null` → "Private", no link.
- The old Next.js app (`app/`, `components/`, `lib/`, `middleware.ts`) is frozen reference
  for the future internal-only admin port — don't build on it, don't delete it yet.

## Commands

```bash
npm run dev        # http://localhost:4321
npm run build      # SSR build → dist/ (server + prerendered pages)
npm run preview    # node ./dist/server/entry.mjs
```

## Architecture

- `src/pages/index.astro` — the whole site: hero + sections (1.0 About, 2.0 Experience,
  3.0 System, 4.0 Projects as a card deck where suits = lifecycle stages, 5.0 Contact).
  Data consts live at the top (`PROJECTS`, `STAGES`, `EXPERIENCE`, `RIGS`, `CAPABILITIES`).
- `src/layouts/Base.astro` — nav/footer (commit hash via `__COMMIT__` define) + the FX
  engine: per-element IntersectionObserver reveals, text decode, typewriter prompts.
- `src/styles/global.css` — design tokens, rv-* reveal variants, card chrome, decrypt
  expander. Reduced-motion must always degrade to a static page.
- API routes (`src/pages/api/`): `spotify/now-playing`, `discord` — secrets via env;
  in-process TTL cache in `src/lib/cache.ts`. Secrets live in `.env.local` (master, never
  committed/printed) and `/opt/stacks/adept-dev/.env` on LXC 226.

## Deploy (DEV)

Procedure in `~/git/homeserver/configs/dev/services/portfolio/README.md` — rsync to the
Proxmox host, wipe-except-`.env`, tar into LXC 226, `docker compose up -d --build`.
Prod (LXC 126 + tunnel route) is live; updates require explicit user authorization.

## Project-card lifecycle — status promotion is USER-GATED (2026-10-17 rule)

A card's suit/status in `PROJECTS` mirrors the app's real deployment stage, and **only
the user promotes it**:

1. Idea created → idea-stage card (matching the studio catalogue).
2. Built + tested on the **DEV server only** → ♥ IN DEVELOPMENT. Running clean on dev
   is NOT released.
3. The user ALONE confirms it's good and says "deploy to prod" — no agent decides this.
4. Only after prod is actually deployed → ♠ OPERATIONAL. Any announcement copy still
   goes past the user before posting.

Never on your own initiative: flip a card's suit/status forward, add an `href` to a
repo, or write "now open source / operational" blurb text. (An agent once dealt Domain
Watcher into spades with a repo link while it was still in dev testing — rolled back
across prod. Don't be that agent.)

Card links: once the studio app is past `idea` (it then has a page), the card's `href` is
`https://adeptproductions.dev/apps/<slug>/`; before that, `https://adeptproductions.dev/#software`.
`i18n.ts` turns either into the zh page and, in dev builds, the dev origin. This is not a
repo link; GitHub repo links stay user-gated as above.

## Localization

English remains at existing URLs; Simplified Chinese is under `/zh-hans/`.
Chinese routes reuse the original pages; `src/lib/i18n.ts` derives the locale from
Astro.url. Text translations live in `src/i18n/zh-Hans.json`; technical identifiers,
redactions and project facts remain shared. Update both languages together.

Run `npm run check:i18n` after copy changes (also runs during `npm run build`).
A new English source string needs a Chinese entry and a reviewed-source hash:
`node scripts/review-i18n.mjs string "English source"` after reviewing the wording.
Full maintenance and browser tests:
[localization feature](../studio/docs/features/website-localization.md).

Dev Docker builds require `--build-arg PUBLIC_DEPLOY_ENV=dev` to keep links between
sites on dev; then use `docker compose up -d --no-build`. Default builds use public
origins. Production still requires separate explicit authorization.

Language choices are available from matching globe menus in the header and footer.
Header controls stay grouped on the right. The footer Mark 2 build label is plain
text, and the homepage contact section does not link the GitHub profile. Project
repository links remain intentional. Production build flag: PUBLIC_DEPLOY_ENV=production.
