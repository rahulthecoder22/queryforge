import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WIKI_ARTICLES } from '@/data/wiki/articles';
import type { WikiCategory } from '@/data/wiki/types';
import { WikiArticleView } from '@/components/learn/WikiArticleView';
import { SQL_MASTERCLASS, MONGO_MASTERCLASS } from '@/lib/masterclass/curriculum';

const CATS: Array<'all' | WikiCategory | 'Syllabus' | 'Concept deck'> = [
  'all',
  'SQL',
  'MongoDB',
  'Concepts',
  'Visual guides',
  'Concept deck',
  'Syllabus',
];

export function DatabaseWiki() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATS)[number]>('all');
  const [openId, setOpenId] = useState<string | null>(WIKI_ARTICLES[0]?.id ?? null);

  const titleById = useMemo(() => new Map(WIKI_ARTICLES.map((a) => [a.id, a.title])), []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return WIKI_ARTICLES.filter((a) => {
      if (cat === 'Concept deck') {
        if (!a.tags.includes('concept-deck')) return false;
      } else if (cat !== 'all' && cat !== 'Syllabus' && a.category !== cat) return false;
      if (!s) return true;
      const inSummary = a.summary.toLowerCase().includes(s);
      const inSection = a.sections.some(
        (sec) =>
          sec.heading.toLowerCase().includes(s) ||
          sec.body.toLowerCase().includes(s) ||
          (sec.code?.toLowerCase().includes(s) ?? false),
      );
      return (
        a.title.toLowerCase().includes(s) ||
        a.tags.some((t) => t.includes(s)) ||
        inSummary ||
        inSection
      );
    });
  }, [q, cat]);

  const selected =
    cat === 'Syllabus' ? null : (filtered.find((a) => a.id === openId) ?? filtered[0] ?? null);

  const openArticle = useCallback(
    (id: string) => {
      setOpenId(id);
      setCat('all');
      setSearchParams({ a: id }, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    const fromUrl = searchParams.get('a');
    if (fromUrl && WIKI_ARTICLES.some((a) => a.id === fromUrl)) {
      setOpenId(fromUrl);
      setCat('all');
    }
  }, [searchParams]);

  useEffect(() => {
    if (cat === 'Syllabus' || filtered.length === 0) return;
    if (!filtered.some((a) => a.id === openId)) {
      const next = filtered[0]!.id;
      setOpenId(next);
      setSearchParams({ a: next }, { replace: true });
    }
  }, [cat, filtered, openId, setSearchParams]);

  const onPickArticle = (id: string) => {
    setOpenId(id);
    setSearchParams({ a: id }, { replace: true });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div
        className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full opacity-20 blur-[100px]"
        style={{ background: 'var(--accent-primary)' }}
        aria-hidden
      />
      <header className="qf-glass relative shrink-0 border-b border-[var(--border-subtle)] px-4 py-6 pl-16 md:pl-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">Reference</p>
        <h1 className="qf-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-4xl">
          <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            Database wiki
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">{WIKI_ARTICLES.length} articles.</span> Left: search
          or chip filters → right: the article (desktop).{' '}
          <strong className="text-[var(--text-primary)]">Concept deck</strong> is 500 short glossary pages.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/masterclass"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/60 px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--glass-highlight)]"
          >
            Masterclass Visual lab
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold hover:bg-[var(--glass-highlight)]"
          >
            SQL course
          </Link>
          <Link
            to="/learn/mongo"
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold hover:bg-[var(--glass-highlight)]"
          >
            Mongo course
          </Link>
          <Link
            to="/workspace"
            className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[var(--accent-primary)]/20 hover:brightness-110"
          >
            Workspace
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="qf-glass flex max-h-[40vh] shrink-0 flex-col border-b border-[var(--border-subtle)] lg:max-h-none lg:w-[min(100%,300px)] lg:border-b-0 lg:border-r xl:w-[22rem]">
          <div className="border-b border-[var(--border-subtle)] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Browse
            </p>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
            />
            <div className="mt-2 flex max-h-20 flex-wrap gap-1 overflow-y-auto">
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
                    cat === c
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--text-muted)]">
              {cat === 'Syllabus' ? '—' : `${filtered.length} article(s)`}
            </p>
          </div>
          <nav className="min-h-0 flex-1 overflow-auto p-2">
            {cat === 'Syllabus' ? (
              <SyllabusNav />
            ) : (
              <ul className="space-y-1">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onPickArticle(a.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        openId === a.id || selected?.id === a.id
                          ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] ring-1 ring-[var(--accent-primary)]/30'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span className="block font-medium leading-snug">{a.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <span>{a.category}</span>
                        <span className="line-clamp-1 min-w-0 flex-1 text-[var(--text-muted)]/80">
                          {a.summary}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8 lg:bg-transparent">
          <AnimatePresence mode="wait">
            {cat === 'Syllabus' ? (
              <motion.div
                key="syllabus"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-3xl"
              >
                <SyllabusContent />
              </motion.div>
            ) : selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="mx-auto max-w-3xl">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Reading
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {selected.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{selected.title}</h2>
                </div>
                <WikiArticleView article={selected} titleById={titleById} onOpenArticle={openArticle} />
              </motion.div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No articles match.</p>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SyllabusNav() {
  return (
    <div className="space-y-3 p-2 text-xs text-[var(--text-secondary)]">
      <p className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Syllabus tab</p>
      <p>Scroll the main panel for the full SQL and Mongo topic trees. Each bullet is expanded in wiki articles.</p>
    </div>
  );
}

function SyllabusContent() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">SQL master path</h2>
        <div className="mt-4 space-y-6">
          {SQL_MASTERCLASS.map((m) => (
            <div key={m.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h3 className="font-medium text-[var(--text-primary)]">{m.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{m.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium text-[var(--text-primary)]">{l.title}</span>
                    <ul className="ml-3 mt-1 list-inside list-disc text-xs text-[var(--text-muted)]">
                      {l.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">MongoDB master path</h2>
        <div className="mt-4 space-y-6">
          {MONGO_MASTERCLASS.map((m) => (
            <div key={m.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h3 className="font-medium text-[var(--text-primary)]">{m.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{m.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium text-[var(--text-primary)]">{l.title}</span>
                    <ul className="ml-3 mt-1 list-inside list-disc text-xs text-[var(--text-muted)]">
                      {l.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
