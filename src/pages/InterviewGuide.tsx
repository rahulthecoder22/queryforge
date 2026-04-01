import { useEffect, useMemo, useState } from 'react';
import type { InterviewQA, InterviewTopic } from '@/data/interviewGuide/types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { INTERVIEW_GUIDE_TOPICS } from '@/data/interviewGuide/pack';
import { fetchOptionalRemoteInterviewTopics, mergeInterviewTopics } from '@/lib/interviewGuide/remotePack';

function resolveSelection(
  filtered: InterviewTopic[],
  selectedItemId: string,
): { topic: InterviewTopic | null; item: InterviewQA | null } {
  for (const t of filtered) {
    const i = t.items.find((row) => row.id === selectedItemId);
    if (i) return { topic: t, item: i };
  }
  const t0 = filtered[0];
  const i0 = t0?.items[0];
  if (t0 && i0) return { topic: t0, item: i0 };
  return { topic: null, item: null };
}

export function InterviewGuide() {
  const [topics, setTopics] = useState<InterviewTopic[]>(INTERVIEW_GUIDE_TOPICS);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [q, setQ] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    INTERVIEW_GUIDE_TOPICS[0]?.items[0]?.id ?? '',
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await fetchOptionalRemoteInterviewTopics();
      if (cancelled) return;
      if (remote?.length) {
        setTopics(mergeInterviewTopics(INTERVIEW_GUIDE_TOPICS, remote));
        setRemoteLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const needle = q.trim().toLowerCase();

  const filteredTopics = useMemo(() => {
    if (!needle) return topics;
    return topics
      .map((t) => ({
        ...t,
        items: t.items.filter(
          (i) =>
            i.question.toLowerCase().includes(needle) ||
            i.answer.toLowerCase().includes(needle) ||
            (i.tags?.some((tag) => tag.toLowerCase().includes(needle)) ?? false),
        ),
      }))
      .filter((t) => t.items.length > 0);
  }, [topics, needle]);

  const { topic, item } = resolveSelection(filteredTopics, selectedItemId);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 rounded-full opacity-20 blur-[90px]"
        style={{ background: 'var(--accent-primary)' }}
        aria-hidden
      />
      <header className="qf-glass relative shrink-0 border-b border-[var(--border-subtle)] px-4 py-5 pl-16 md:pl-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">Career</p>
        <h1 className="qf-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-4xl">
          <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            Interview guide
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Curated SQL and data interview questions with strong answers. Practice the same ideas in the{' '}
          <Link to="/learn?t=bank" className="font-medium text-[var(--accent-primary)] hover:underline">
            Interview bank
          </Link>{' '}
          track.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Optional updates: host your own JSON and set <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono text-[11px]">VITE_INTERVIEW_GUIDE_URL</code> at build time. Scraping random sites breaks ToS and copyright—use content you own or license.
        </p>
        {remoteLoaded ? (
          <p className="mt-2 text-xs font-medium text-[var(--accent-success)]">Loaded supplemental topics from your remote URL.</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/learn?t=bank"
            className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[var(--accent-primary)]/25 hover:brightness-110"
          >
            Open interview bank (levels)
          </Link>
          <Link
            to="/learn/wiki"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/70 px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-highlight)]"
          >
            Wiki deep dives
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="qf-glass flex max-h-[42vh] shrink-0 flex-col border-b border-[var(--border-subtle)] lg:max-h-none lg:w-[min(100%,300px)] lg:border-b-0 lg:border-r xl:w-[20rem]">
          <div className="border-b border-[var(--border-subtle)] p-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
            />
          </div>
          <nav className="min-h-0 flex-1 overflow-auto p-2" aria-label="Interview topics">
            {filteredTopics.length === 0 ? (
              <p className="px-2 py-4 text-sm text-[var(--text-muted)]">No matches. Try another search.</p>
            ) : (
              <ul className="space-y-4">
                {filteredTopics.map((section) => (
                  <li key={section.id}>
                    <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {section.category}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((row) => {
                        const active = row.id === item?.id;
                        return (
                          <li key={row.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemId(row.id);
                              }}
                              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                active
                                  ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] ring-1 ring-[var(--accent-primary)]/30'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                              }`}
                            >
                              {row.question}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          {item && topic ? (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="mx-auto max-w-3xl"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {topic.category}
              </p>
              <h2 className="qf-display mt-2 text-xl font-semibold leading-snug text-[var(--text-primary)] md:text-2xl">
                {item.question}
              </h2>
              {item.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.answer.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.article>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Select a question from the list.</p>
          )}
        </main>
      </div>
    </div>
  );
}
