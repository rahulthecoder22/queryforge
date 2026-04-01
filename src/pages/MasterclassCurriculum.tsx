import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MongoMatchAnimation } from '@/components/masterclass/MongoMatchAnimation';
import { SqlGroupByAnimation } from '@/components/masterclass/SqlGroupByAnimation';
import { SqlJoinAnimation } from '@/components/masterclass/SqlJoinAnimation';
import { SqlWhereAnimation } from '@/components/masterclass/SqlWhereAnimation';
import { VISUAL_LAB_ITEMS } from '@/data/masterclass/visualLabs';
import { MONGO_MASTERCLASS, SQL_MASTERCLASS } from '@/lib/masterclass/curriculum';
import { listMasterclassSchemaMetas } from '@/lib/masterclass/generator';

const schemas = listMasterclassSchemaMetas();

type Tab = 'visuals' | 'syllabus' | 'datasets';

function VisualFor({ kind }: { kind: (typeof VISUAL_LAB_ITEMS)[0]['visual'] }) {
  switch (kind) {
    case 'join':
      return <SqlJoinAnimation />;
    case 'where':
      return <SqlWhereAnimation />;
    case 'groupBy':
      return <SqlGroupByAnimation />;
    case 'mongoMatch':
      return <MongoMatchAnimation />;
    default:
      return null;
  }
}

export function MasterclassCurriculum() {
  const [tab, setTab] = useState<Tab>('visuals');

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-48 w-48 -translate-x-1/2 rounded-full opacity-15 blur-[90px]"
        style={{ background: 'var(--accent-warning)' }}
        aria-hidden
      />
      <header className="qf-glass relative shrink-0 border-b border-[var(--border-subtle)] px-4 py-6 pl-16 md:pl-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">
          Masterclass
        </p>
        <h1 className="qf-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-4xl">
          <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[var(--accent-info)] bg-clip-text text-transparent">
            SQL & Mongo — full reference path
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Suggested order:</span>{' '}
          Visual lab → Syllabus → Datasets (workspace).{' '}
          <span className="text-[var(--text-muted)]">Long reads: wiki.</span>{' '}
          <span className="text-[var(--text-muted)]">Switch sections with the tabs below.</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/learn/wiki"
            className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--accent-primary)]/25 hover:brightness-110"
          >
            Open wiki (deep topics)
          </Link>
          <Link
            to="/workspace"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/80 px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-highlight)]"
          >
            Workspace
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--glass-highlight)]"
          >
            SQL challenges
          </Link>
          <Link
            to="/learn/mongo"
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--glass-highlight)]"
          >
            Mongo challenges
          </Link>
        </div>

        <div className="mt-6 flex gap-1 rounded-xl bg-[var(--bg-tertiary)] p-1">
          {(
            [
              ['visuals', 'Visual lab'],
              ['syllabus', 'Syllabus'],
              ['datasets', 'Datasets'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-colors md:text-sm ${
                tab === id ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'visuals' ? (
          <div className="mx-auto max-w-4xl space-y-16 px-4 py-10 pb-24 md:px-6">
            {VISUAL_LAB_ITEMS.map((item) => (
              <section
                key={item.id}
                className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 p-6 shadow-sm md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
                      {item.subtitle}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{item.title}</h2>
                  </div>
                  <Link
                    to={`/learn/wiki?a=${encodeURIComponent(item.wikiArticleId)}`}
                    className="shrink-0 rounded-xl border border-[var(--accent-info)]/50 bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-medium text-[var(--accent-info)] hover:bg-[var(--accent-info)]/10"
                  >
                    Full wiki article →
                  </Link>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.narrative.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <div className="mt-8">
                  <VisualFor kind={item.visual} />
                </div>
                <ul className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--text-primary)]">
                  {item.takeaways.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-[var(--accent-success)]">✓</span>
                      <span className="text-[var(--text-secondary)]">{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}

        {tab === 'syllabus' ? (
          <div className="mx-auto max-w-3xl space-y-12 px-4 py-10 pb-24">
            <section>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">SQL syllabus</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Each bullet below maps to topics expanded in the wiki — search by keyword or browse SQL category.
              </p>
              <div className="mt-6 space-y-6">
                {SQL_MASTERCLASS.map((mod) => (
                  <article
                    key={mod.id}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
                  >
                    <h3 className="font-medium text-[var(--text-primary)]">{mod.title}</h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{mod.summary}</p>
                    <ul className="mt-4 space-y-3 border-t border-[var(--border-subtle)] pt-4">
                      {mod.lessons.map((les) => (
                        <li key={les.id}>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{les.title}</div>
                          <ul className="mt-1 list-inside list-disc text-xs text-[var(--text-muted)]">
                            {les.topics.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">MongoDB syllabus</h2>
              <div className="mt-6 space-y-6">
                {MONGO_MASTERCLASS.map((mod) => (
                  <article
                    key={mod.id}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
                  >
                    <h3 className="font-medium text-[var(--text-primary)]">{mod.title}</h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{mod.summary}</p>
                    <ul className="mt-4 space-y-3 border-t border-[var(--border-subtle)] pt-4">
                      {mod.lessons.map((les) => (
                        <li key={les.id}>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{les.title}</div>
                          <ul className="mt-1 list-inside list-disc text-xs text-[var(--text-muted)]">
                            {les.topics.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {tab === 'datasets' ? (
          <div className="mx-auto max-w-5xl px-4 py-10 pb-24">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Large practice schemas</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
              Twenty domains × four tables × 200 rows each. Generate from Workspace (Electron persists to disk; browser
              loads in-memory). Prefer LIMIT while exploring.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {schemas.map((sch) => (
                <div
                  key={sch.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 transition-colors hover:border-[var(--accent-primary)]/40"
                >
                  <div className="font-medium text-[var(--text-primary)]">{sch.title}</div>
                  <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">{sch.id}</div>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{sch.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
