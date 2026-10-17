# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and admin dashboard built with Next.js 14 (App Router). Features a public portfolio showcasing GitHub projects, Spotify now-playing widget, Discord avatar integration, and a protected admin panel for database/calendar management.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server (requires build first)
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with React 18, TypeScript
- **Auth**: NextAuth.js v4 with GitHub OAuth
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis (distributed) + NodeCache (in-memory)
- **Styling**: Tailwind CSS with Framer Motion animations

### Route Structure
- `/` - Public hero page with portfolio, Spotify widget, Discord profile
- `/admin/*` - Protected routes (middleware-guarded via JWT + Supabase admin check)
- `/api/*` - API routes for auth, GitHub, Spotify, Discord, and admin operations

### Key Integrations
- **Spotify** (`lib/spotify.ts`, `app/api/spotify/`) - OAuth flow with token refresh, 7s polling with visibility optimization
- **GitHub** (`app/api/github/`) - GraphQL API for repos with Redis caching and rate limiting
- **Discord** (`app/api/discord/`) - Bot token for avatar fetching with multi-layer caching
- **Supabase** (`lib/supabase/`, `lib/auth.ts`) - Database client and admin role verification

### Authentication Flow
1. GitHub OAuth via NextAuth (`lib/auth.ts`)
2. Middleware (`middleware.ts`) protects `/admin/*` routes
3. Admin verification checks Supabase `admins` table by email

### Caching Strategy
- **Redis**: Distributed cache for GitHub repos (1h), Discord avatar, rate limiting
- **NodeCache**: In-memory for Spotify tokens (1h) and now-playing (5s)
- **Client-side**: Local maps for profile pictures and GitHub data

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_KV_REST_API_URL`, `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_ID`, `GITHUB_SECRET`, `GITHUB_AUTH_TOKEN`
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `NEXT_PUBLIC_BASE_URL`
- `DISCORD_USER_ID`, `DISCORD_BOT_TOKEN`
