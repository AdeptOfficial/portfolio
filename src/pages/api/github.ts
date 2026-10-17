import type { APIRoute } from 'astro';
import { cacheGet, cacheSet, clientIp, isRateLimited } from '@/lib/cache';

const headers = { 'Content-Type': 'application/json' };
const QUERY = `
  query {
    user(login: "adeptofficial") {
      repositories(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          id
          name
          description
          url
          homepageUrl
          primaryLanguage { name }
          languages(first: 5) { nodes { name } }
        }
      }
    }
  }
`;

export const GET: APIRoute = async ({ request }) => {
  const token = process.env.GITHUB_AUTH_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'GitHub token is not set' }), { status: 500, headers });
  }

  const cached = cacheGet<object[]>('repositories');
  if (cached) return new Response(JSON.stringify(cached), { headers });

  if (isRateLimited('github', clientIp(request), 5, 60)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: QUERY }),
    });
    const { data, errors } = await res.json();
    if (errors || !data?.user) {
      return new Response(JSON.stringify({ error: 'GraphQL query failed' }), { status: 500, headers });
    }

    const repositories = data.user.repositories.nodes.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.url,
      homepageUrl: repo.homepageUrl,
      primaryLanguage: repo.primaryLanguage?.name ?? null,
      languages: repo.languages,
    }));

    cacheSet('repositories', repositories, 3600);
    return new Response(JSON.stringify(repositories), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'GitHub fetch failed' }), { status: 500, headers });
  }
};
