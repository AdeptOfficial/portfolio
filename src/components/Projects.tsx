import { useEffect, useState } from 'react';

interface Repo {
  id: string;
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  primaryLanguage: string | null;
  languages: { nodes: { name: string }[] };
}

const HIDDEN = ['AdeptOfficial', 'HomeControl'];
const ACTIVE = ['adept.dev', 'DevHub', 'Syna'];

function Row({ repo }: { repo: Repo }) {
  const active = ACTIVE.includes(repo.name);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-card px-5 py-4 transition-colors hover:border-muted">
      <div className="min-w-0">
        <h4 className="font-display font-bold">{repo.name}</h4>
        {repo.description && <p className="mt-1 text-sm leading-relaxed text-muted">{repo.description}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {repo.languages.nodes.map((l) => (
            <span key={l.name} className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
              #{l.name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className="border border-line px-2 py-1 font-mono text-[10px] font-bold tracking-[0.2em]"
          style={{ color: active ? 'var(--color-signal)' : 'var(--color-faint)' }}
        >
          {active ? 'ACTIVE' : 'PAUSED'}
        </span>
        {repo.homepageUrl && (
          <a
            href={repo.homepageUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted hover:text-ink"
          >
            Live ↗
          </a>
        )}
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted hover:text-ink"
        >
          GitHub ↗
        </a>
      </div>
    </div>
  );
}

/** Compact archive rows fed by /api/github. */
export default function Projects() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/github')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Repo[]) => setRepos(data.filter((r) => !HIDDEN.includes(r.name))))
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <p className="border border-dashed border-line px-5 py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-faint">
        GitHub feed offline — the archive lives at github.com/AdeptOfficial
      </p>
    );
  if (!repos)
    return (
      <p className="px-1 font-mono text-[11px] uppercase tracking-[0.15em] text-faint">Loading the archive…</p>
    );

  const sorted = [...repos].sort((a, b) => {
    const aa = ACTIVE.includes(a.name) ? 0 : 1;
    const bb = ACTIVE.includes(b.name) ? 0 : 1;
    return aa === bb ? a.name.localeCompare(b.name) : aa - bb;
  });

  return (
    <div className="grid gap-px">
      {sorted.map((repo) => (
        <Row key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
