import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMongoCollection } from '@/data/documentSamples';
import { getMongoLevel, getNextMongoLevelId } from '@/data/mongoCourse/mongoWorlds';
import { resolveMongoTheory } from '@/data/mongoCourse/mongoTheoryResolver';
import { compareMongoFilters, parseMongoFilter } from '@/lib/mongoCompare';
import { filterDocuments } from '@/lib/mongoLite';
import { useCourseStore } from '@/stores/courseStore';
import { QueryCelebration } from '@/components/effects/QueryCelebration';
import { ChallengeMetaPanel } from '@/components/learn/ChallengeMetaPanel';
import { HintsSlideOver } from '@/components/learn/HintsSlideOver';
import { LessonLearnPanel } from '@/components/learn/LessonLearnPanel';
import { MongoResultsDialog } from '@/components/learn/MongoResultsDialog';

export function MongoChallenge() {
  const { levelId = '' } = useParams<{ levelId: string }>();
  return <MongoChallengeSession key={levelId} levelId={levelId} />;
}

type MobileTab = 'learn' | 'practice';

function MongoChallengeSession({ levelId }: { levelId: string }) {
  const found = getMongoLevel(levelId);
  const completeLevel = useCourseStore((s) => s.completeLevel);
  const recordDocumentQuery = useCourseStore((s) => s.recordDocumentQuery);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);

  const [filterText, setFilterText] = useState(() => found?.level.starterFilter ?? '{}');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [hintTier, setHintTier] = useState(0);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('learn');

  const docs = useMemo(() => {
    const key = found?.level.collection;
    if (key == null) return [];
    return getMongoCollection(key);
  }, [found?.level.collection]);

  const theory = useMemo(() => (found ? resolveMongoTheory(found.level) : null), [found?.level]);

  const preview = useMemo(() => {
    const p = parseMongoFilter(filterText);
    if (!p.ok) return { error: p.error, rows: [] as Record<string, unknown>[] };
    return {
      error: null as string | null,
      rows: filterDocuments(docs, p.q),
    };
  }, [filterText, docs]);

  useEffect(() => {
    setHintTier(0);
    setHintsOpen(false);
    setResultsOpen(false);
    setMobileTab('learn');
    setFeedback(null);
  }, [levelId]);

  useEffect(() => {
    if (!found) return;
    setFilterText(found.level.starterFilter);
  }, [levelId, found?.level.id, found?.level.starterFilter]);

  const runPreview = useCallback(() => {
    setFeedback(null);
    if (preview.error) {
      setFeedback(preview.error);
      return;
    }
    recordDocumentQuery();
    setFeedback(`${preview.rows.length} document(s) match your filter.`);
  }, [preview, recordDocumentQuery]);

  const check = useCallback(() => {
    if (!found) return;
    const v = compareMongoFilters(filterText, found.level.expectedFilter, found.level.collection);
    setFeedback(v.feedback);
    if (v.ok) {
      completeLevel(found.level.id, 3, found.level.xpReward);
      setCelebrateKey((k) => k + 1);
      setFeedback(`Correct! +${found.level.xpReward} XP\n${v.feedback}`);
    }
  }, [completeLevel, filterText, found]);

  if (!found || !theory) {
    return (
      <div className="p-8">
        <p className="text-[var(--text-secondary)]">Level not found.</p>
        <Link to="/learn/mongo" className="mt-4 inline-block text-[var(--accent-primary)]">
          ← Mongo map
        </Link>
      </div>
    );
  }

  const { world, level } = found;
  const nextId = getNextMongoLevelId(levelId);
  const done = levelsCompleted[level.id]?.completed === true;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--bg-primary)]">
      <QueryCelebration burstKey={celebrateKey} />
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 pl-14 md:px-4 md:py-3 md:pl-16">
        <div className="min-w-0">
          <Link to="/learn/mongo" className="text-[10px] text-[var(--accent-info)] hover:underline md:text-xs">
            ← Mongo course map
          </Link>
          <h1 className="truncate text-base font-semibold text-[var(--text-primary)] md:text-lg">
            {world.icon} {world.name} · {level.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/learn/wiki"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[10px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)] md:px-3 md:text-xs"
          >
            Wiki
          </Link>
          <button
            type="button"
            onClick={() => setHintsOpen(true)}
            className="rounded-lg border border-[var(--accent-warning)]/40 bg-[var(--bg-tertiary)] px-2 py-1.5 text-[10px] font-medium text-[var(--accent-warning)] md:px-3 md:text-xs"
          >
            Stuck? Hints
          </button>
          {done && nextId ? (
            <Link
              to={`/learn/mongo/${nextId}`}
              className="rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-95 md:px-4 md:py-2 md:text-sm"
            >
              Next →
            </Link>
          ) : null}
        </div>
      </header>

      {/* Mobile: theory first, then practice */}
      <div className="flex shrink-0 gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 md:hidden">
        {(['learn', 'practice'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
              mobileTab === tab
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {tab === 'learn' ? 'Theory' : 'Filter lab'}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 md:grid-cols-12 md:gap-4 md:p-4">
        {/* Theory column */}
        <div
          className={`min-h-0 overflow-y-auto md:col-span-5 ${mobileTab !== 'learn' ? 'hidden md:block' : ''}`}
        >
          <div className="mb-3 md:hidden">
            <p className="rounded-xl border border-[var(--accent-info)]/40 bg-[var(--bg-secondary)] px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              Type your filter JSON on the{' '}
              <button
                type="button"
                className="font-semibold text-[var(--accent-primary)] underline decoration-[var(--accent-primary)]/50 underline-offset-2"
                onClick={() => setMobileTab('practice')}
              >
                Filter lab
              </button>{' '}
              tab.
            </p>
          </div>
          <LessonLearnPanel
            theory={theory}
            story={level.story}
            task={level.task}
            conceptLabel={level.concept}
            sampleDocTitle={`Sample doc (${level.collection})`}
            sampleDocJson={JSON.stringify(docs[0] ?? {}, null, 2)}
          >
            <ChallengeMetaPanel
              variant="mongo"
              difficulty={level.difficulty}
              constraints={level.constraints}
              solveGuide={level.solveGuide}
            />
          </LessonLearnPanel>
        </div>

        {/* Editor */}
        <div
          className={`flex min-h-0 flex-col gap-3 md:col-span-4 ${mobileTab !== 'practice' ? 'hidden md:flex' : ''}`}
        >
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 ring-1 ring-[var(--border-subtle)]/60">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]" htmlFor="mongo-filter">
              Filter (JSON)
            </label>
            <textarea
              id="mongo-filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              spellCheck={false}
              className="mt-2 min-h-[200px] w-full flex-1 resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 font-mono text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 lg:min-h-[280px]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--accent-primary)]/20 hover:opacity-95"
                onClick={() => runPreview()}
              >
                Run filter
              </button>
              <button
                type="button"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                onClick={() => check()}
              >
                Check answer
              </button>
              <button
                type="button"
                onClick={() => setResultsOpen(true)}
                className="rounded-xl border border-[var(--accent-info)]/50 bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium text-[var(--accent-info)]"
              >
                Results window
              </button>
            </div>
          </div>

          {feedback ? (
            <pre className="whitespace-pre-wrap rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3 text-xs text-[var(--text-primary)]">
              {feedback}
            </pre>
          ) : null}

          <p className="text-center text-[10px] text-[var(--text-muted)] md:hidden">
            Tap “Results window” for a full-screen view of matching documents.
          </p>
        </div>

        {/* Desktop preview strip — never competes with hints (hints are off-canvas) */}
        <div className="hidden min-h-0 flex-col gap-2 md:col-span-3 md:flex">
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Live preview</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {preview.error ? '—' : `${preview.rows.length} docs`}
              </span>
            </div>
            <div className="mt-2 min-h-0 flex-1 overflow-auto rounded-xl bg-[var(--bg-tertiary)]/50 p-2">
              {preview.error ? (
                <p className="text-xs text-[var(--accent-error)]">{preview.error}</p>
              ) : (
                <ul className="space-y-2">
                  {preview.rows.slice(0, 4).map((doc) => (
                    <li key={String(doc._id)} className="rounded-lg bg-[var(--bg-secondary)] p-2 font-mono text-[9px] text-[var(--text-secondary)]">
                      <pre className="line-clamp-6 whitespace-pre-wrap break-all">{JSON.stringify(doc)}</pre>
                    </li>
                  ))}
                  {preview.rows.length > 4 ? (
                    <li className="text-center text-[10px] text-[var(--text-muted)]">
                      +{preview.rows.length - 4} more — open Results window
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => setResultsOpen(true)}
              className="mt-2 w-full rounded-xl border border-dashed border-[var(--accent-primary)]/50 py-2 text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
            >
              Open full results window
            </button>
          </div>
        </div>
      </div>

      <HintsSlideOver
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        hints={level.hints}
        hintTier={hintTier}
        onNextHint={() => setHintTier((t) => Math.min(t + 1, level.hints.length - 1))}
      />

      <MongoResultsDialog
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        title={`${level.collection} · matches`}
        count={preview.rows.length}
        error={preview.error}
        rows={preview.rows}
      />
    </div>
  );
}
