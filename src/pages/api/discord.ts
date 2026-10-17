import type { APIRoute } from 'astro';
import { cacheGet, cacheSet, clientIp, isRateLimited } from '@/lib/cache';

const headers = { 'Content-Type': 'application/json' };

export const GET: APIRoute = async ({ request }) => {
  if (isRateLimited('discord', clientIp(request), 5, 60)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  const userId = process.env.DISCORD_USER_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!userId || !botToken) {
    return new Response(JSON.stringify({ error: 'Discord env not configured' }), { status: 500, headers });
  }

  try {
    const cached = cacheGet<string>(`discord_avatar:${userId}`);
    if (cached) return new Response(JSON.stringify({ profilePicUrl: cached }), { headers });

    const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: { Authorization: `Bot ${botToken}` },
    });
    if (!res.ok) throw new Error(`Discord API error: ${res.status}`);

    const data = await res.json();
    const profilePicUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}?size=2048`;
    cacheSet(`discord_avatar:${userId}`, profilePicUrl, 3600);

    return new Response(JSON.stringify({ profilePicUrl }), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Discord avatar', details: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers }
    );
  }
};
