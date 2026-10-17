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

function RepoCard({ repo, active }: { repo: Repo; active: boolean }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="group block border border-line bg-card p-5 transition-colors hover:border-muted hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{repo.name}</h3>
        <span
          className="border border-line px-2 py-1 font-mono text-[10px] font-bold tracking-[0.2em]"
          style={{ color: active ? 'var(--color-signal)' : 'var(--color-faint)' }}
        >
          {active ? 'ACTIVE' : 'PAUSED'}
        </span>
      </div>
      {repo.description && <p className="mt-2 text-sm leading-relaxed text-muted">{repo.description}</p>}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
        {repo.languages.nodes.map((l) => (
          <span key={l.name} className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
            #{l.name}
          </span>
        ))}
      </div>
      {repo.homepageUrl && (
        <p className="mt-3 font-mono text-[11px] tracking-wider" style={{ color: 'var(--color-signal)' }}>
          {repo.homepageUrl.replace(/^https?:\/\//, '')} →
        </p>
      )}
    </a>
  );
}

/** GitHub project grid, grouped active-first, fetched from /api/github. */
export default function Projects() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/github')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Repo[]) => setRepos(data.filter((r) => !HIDDEN.includes(r.name))))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-faint">Couldn't load projects — see them on GitHub instead.</p>;
  if (!repos) return <p className="font-mono text-[11px] uppercase tracking-widest text-faint">Loading projects…</p>;

  const active = repos.filter((r) => ACTIVE.includes(r.name));
  const paused = repos.filter((r) => !ACTIVE.includes(r.name));

  return (
    <div className="space-y-8">
      {[
        { label: 'Active development', list: active },
        { label: 'On the shelf', list: paused },
      ]
        .filter((g) => g.list.length > 0)
        .map((group) => (
          <div key={group.label}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">{group.label}</h3>
            <div className="mt-3 grid gap-px sm:grid-cols-2">
              {group.list.map((repo) => (
                <RepoCard key={repo.id} repo={repo} active={ACTIVE.includes(repo.name)} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
