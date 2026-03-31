import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SQLEditor } from '@/components/editor/SQLEditor';
import { ResultsTable } from '@/components/editor/ResultsTable';
import { SchemaExplorer } from '@/components/editor/SchemaExplorer';
import { getBundledSampleSql } from '@/data/databases/loadSampleSql';
import { getLevel, getNextLevelId } from '@/data/courses';
import { SCRATCH_SQL_STARTER } from '@/data/courses/scratchChallenges';
import { resolveSqlTheory } from '@/data/courses/sqlTheoryResolver';
import {
  getBrowserSqlSession,
  resetBrowserSqlSession,
} from '@/lib/browserSqlSession';
import { getQueryForge } from '@/lib/electron';
import { compareResults } from '@/lib/queryDiffEngine';
import { useCourseStore } from '@/stores/courseStore';
import { useSchema } from '@/hooks/useDatabase';
import type { QueryResult } from '@/types/queryforge';
import { useSettingsStore } from '@/stores/settingsStore';
import { QueryCelebration, ResultPulse } from '@/components/effects/QueryCelebration';
import { ChallengeMetaPanel } from '@/components/learn/ChallengeMetaPanel';
import { HintsSlideOver } from '@/components/learn/HintsSlideOver';
import { LessonLearnPanel } from '@/components/learn/LessonLearnPanel';
import { SqlResultsDialog } from '@/components/learn/SqlResultsDialog';
import { InterviewPatternsCallout } from '@/components/learn/InterviewPatternsCallout';

export function Challenge() {
  const { levelId = '' } = useParams<{ levelId: string }>();
  return <ChallengeSession key={levelId} levelId={levelId} />;
}

type Tab = 'learn' | 'workspace';

function ChallengeSession({ levelId }: { levelId: string }) {
  const found = getLevel(levelId);
  const theme = useSettingsStore((s) => s.theme);
  const editorTheme = theme === 'dawn' ? 'light' : 'vs-dark';
  const completeLevel = useCourseStore((s) => s.completeLevel);
  const recordQueryRun = useCourseStore((s) => s.recordQueryRun);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);

  const [dbPath, setDbPath] = useState<string | null>(null);
  const [sql, setSql] = useState(() => found?.level.starterCode ?? SCRATCH_SQL_STARTER);
  const [userResult, setUserResult] = useState<QueryResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintTier, setHintTier] = useState(0);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [sqlResultsOpen, setSqlResultsOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<Tab>('learn');
  const [resultPulseKey, setResultPulseKey] = useState(0);
  const runBtnRef = useRef<HTMLButtonElement>(null);

  const { data: schema } = useSchema(dbPath);
  const theory = useMemo(() => (found ? resolveSqlTheory(found.level) : null), [found?.level]);

  useEffect(() => {
    if (!found) return;
    let cancelled = false;
    void (async () => {
      try {
        const qf = getQueryForge();
        if (qf) {
          const p = await qf.db.copySample(found.world.database);
          if (!cancelled) {
            setDbPath(p);
            await qf.db.setActive(p);
          }
          return;
        }
        const rawSql = getBundledSampleSql(found.world.database);
        if (!rawSql) {
          if (!cancelled) {
            setFeedback(
              `Sample "${found.world.database}" is not bundled. Use the desktop app or add the file under src/data/databases/.`,
            );
          }
          return;
        }
        resetBrowserSqlSession();
        const s = await getBrowserSqlSession();
        await s.openEmpty();
        await s.importSql(rawSql);
        if (!cancelled) setDbPath('browser:course');
      } catch (e) {
        console.error(e);
        if (!cancelled) setFeedback('Could not load sample database for this world.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [found?.level.id, found?.world.database]);

  useEffect(() => {
    setHintTier(0);
    setHintsOpen(false);
    setSqlResultsOpen(false);
    setSchemaOpen(false);
    setMobileTab('learn');
    setFeedback(null);
    setUserResult(null);
  }, [levelId]);

  useEffect(() => {
    if (!found) return;
    setSql(found.level.starterCode ?? SCRATCH_SQL_STARTER);
  }, [levelId, found?.level.id, found?.level.starterCode]);

  const run = useCallback(async () => {
    if (!dbPath) return;
    const qf = getQueryForge();
    let r: QueryResult;
    if (qf) {
      r = await qf.db.execute(dbPath, sql);
    } else {
      const s = await getBrowserSqlSession();
      r = s.executeQuery(sql);
    }
    setUserResult(r);
    setFeedback(null);
    if (!r.error) {
      recordQueryRun();
      setResultPulseKey((k) => k + 1);
      runBtnRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: 'ease-out' },
      );
    }
  }, [dbPath, sql, recordQueryRun]);

  const check = useCallback(async () => {
    if (!dbPath || !found) return;
    const qf = getQueryForge();
    let user: QueryResult;
    let expected: QueryResult;
    if (qf) {
      user = await qf.db.execute(dbPath, sql);
      expected = await qf.db.execute(dbPath, found.level.expectedQuery);
    } else {
      const s = await getBrowserSqlSession();
      user = s.executeQuery(sql);
      expected = s.executeQuery(found.level.expectedQuery);
    }
    const v = compareResults(
      user,
      expected,
      found.level.validation.orderSensitive,
      found.level.validation.expectedColumns,
      found.level.validation.expectedRowCount,
    );
    setUserResult(user);
    setResultPulseKey((k) => k + 1);
    setFeedback(v.feedback.map((f) => f.message).join('\n'));
    if (v.isCorrect) {
      completeLevel(found.level.id, 3, found.level.xpReward);
      setCelebrateKey((k) => k + 1);
      setFeedback(`Correct! +${found.level.xpReward} XP\n${v.feedback.map((f) => f.message).join('\n')}`);
    }
  }, [completeLevel, dbPath, found, sql]);

  if (!found || !theory) {
    return (
      <div className="p-8">
        <p className="text-[var(--text-secondary)]">Level not found.</p>
        <Link to="/learn" className="mt-4 inline-block text-[var(--accent-primary)]">
          ← Back to map
        </Link>
      </div>
    );
  }

  const { world, level } = found;
  const hints = level.hints;
  const nextLevelId = getNextLevelId(levelId);
  const currentComplete = levelsCompleted[level.id]?.completed === true;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <QueryCelebration burstKey={celebrateKey} />
      <header className="qf-glass flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2 pl-14 md:px-4 md:py-3 md:pl-16">
        <div className="min-w-0">
          <Link to="/learn" className="text-[10px] text-[var(--accent-info)] hover:underline md:text-xs">
            ← Course map
          </Link>
          <h1 className="qf-display truncate text-base font-bold md:text-lg">
            <span className="mr-1">{world.icon}</span>
            <span className="text-[var(--text-secondary)]">{world.name}</span>
            <span className="text-[var(--text-muted)]"> · </span>
            <span className="text-[var(--text-primary)]">{level.title}</span>
          </h1>
          <details className="mt-1 hidden md:block">
            <summary className="cursor-pointer select-none text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              Keyboard & actions
            </summary>
            <ul className="mt-1.5 space-y-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
              <li>
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-1 font-mono">
                  ⌘
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-1 font-mono">
                  ↵
                </kbd>{' '}
                Run query (when editor focused)
              </li>
              <li>Use Check answer to compare your result set to the reference solution.</li>
              <li>Hints spend XP tiers — try the solve guide in the constraints panel first.</li>
            </ul>
          </details>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setSchemaOpen(true)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[10px] font-medium md:hidden md:px-3 md:text-xs"
          >
            Schema
          </button>
          <Link
            to="/learn/wiki"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[10px] font-medium md:px-3 md:text-xs"
          >
            Wiki
          </Link>
          <button
            type="button"
            onClick={() => setHintsOpen(true)}
            className="rounded-lg border border-[var(--accent-warning)]/40 px-2 py-1.5 text-[10px] font-medium text-[var(--accent-warning)] md:px-3 md:text-xs"
          >
            Stuck? Hints
          </button>
          {currentComplete && nextLevelId ? (
            <Link
              to={`/learn/${nextLevelId}`}
              className="rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white md:px-4 md:py-2 md:text-sm"
            >
              Next →
            </Link>
          ) : null}
          {currentComplete && !nextLevelId ? (
            <span className="text-[10px] text-[var(--text-secondary)]">
              <Link to="/learn" className="text-[var(--accent-info)] hover:underline">
                Done
              </Link>
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex shrink-0 gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 md:hidden">
        {(['learn', 'workspace'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize ${
              mobileTab === tab
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {tab === 'learn' ? 'Guide' : 'SQL lab'}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="qf-glass hidden w-52 shrink-0 overflow-auto border-r border-[var(--border-subtle)] md:block lg:w-56">
          <div className="border-b border-[var(--border-subtle)] px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-secondary)]">
            Schema
          </div>
          <SchemaExplorer schema={schema ?? null} />
        </aside>

        <div className="grid min-h-0 min-w-0 flex-1 gap-3 overflow-hidden p-2 md:grid-cols-12 md:gap-4 md:p-4">
          <div
            className={`min-h-0 overflow-y-auto md:col-span-5 ${mobileTab !== 'learn' ? 'hidden md:block' : ''}`}
          >
            <div className="mb-3 md:hidden">
              <p className="rounded-xl border border-[var(--accent-info)]/40 bg-[var(--bg-secondary)] px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                The lesson text is here; the{' '}
                <span className="font-medium text-[var(--text-primary)]">editable SQL editor</span> lives on the{' '}
                <button
                  type="button"
                  className="font-semibold text-[var(--accent-primary)] underline decoration-[var(--accent-primary)]/50 underline-offset-2"
                  onClick={() => setMobileTab('workspace')}
                >
                  SQL lab
                </button>{' '}
                tab (narrow screens only).
              </p>
            </div>
            <LessonLearnPanel
              theory={theory}
              story={level.story}
              task={level.task}
              conceptLabel={level.concept}
            >
              <ChallengeMetaPanel
                variant="sql"
                difficulty={level.difficulty}
                constraints={level.constraints}
                solveGuide={level.solveGuide}
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                Tables:{' '}
                <span className="font-mono text-[var(--text-secondary)]">{level.relevantTables.join(', ')}</span>
              </p>
              <InterviewPatternsCallout worldId={world.id} />
            </LessonLearnPanel>
          </div>

          <div
            className={`flex min-h-0 flex-col gap-3 md:col-span-7 ${mobileTab !== 'workspace' ? 'hidden md:flex' : ''}`}
          >
            <div className="qf-glass flex min-h-[200px] flex-1 flex-col rounded-2xl p-3">
              <SQLEditor value={sql} onChange={setSql} onRun={() => void run()} theme={editorTheme} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  ref={runBtnRef}
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-primary)]/25 transition hover:brightness-110 active:scale-[0.98]"
                  onClick={() => void run()}
                >
                  Run ⌘↵
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/80 px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--bg-secondary)]"
                  onClick={() => void check()}
                >
                  Check answer
                </button>
                <button
                  type="button"
                  onClick={() => setSqlResultsOpen(true)}
                  className="rounded-xl border border-[var(--accent-info)]/40 bg-[var(--accent-info)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent-info)] transition hover:bg-[var(--accent-info)]/18"
                >
                  Results window
                </button>
              </div>
            </div>

            <div className="qf-glass flex min-h-[200px] shrink-0 flex-col gap-2 rounded-2xl p-3 lg:min-h-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                  Inline results
                </span>
                <button
                  type="button"
                  className="text-[10px] text-[var(--accent-info)] hover:underline"
                  onClick={() => setSqlResultsOpen(true)}
                >
                  Expand
                </button>
              </div>
              <ResultPulse pulseKey={resultPulseKey}>
                <ResultsTable result={userResult} maxHeight={280} />
              </ResultPulse>
              {feedback ? (
                <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/60 p-3 text-[11px] text-[var(--text-primary)] backdrop-blur-sm">
                  {feedback}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <HintsSlideOver
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        hints={hints}
        hintTier={hintTier}
        onNextHint={() => setHintTier((t) => Math.min(t + 1, hints.length - 1))}
      />

      <SqlResultsDialog open={sqlResultsOpen} onClose={() => setSqlResultsOpen(false)} result={userResult} />

      {/* Mobile schema drawer */}
      {schemaOpen ? (
        <div className="fixed inset-0 z-[65] md:hidden">
          <button
            type="button"
            aria-label="Close schema"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSchemaOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-auto rounded-t-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Schema</span>
              <button type="button" className="text-xs text-[var(--accent-info)]" onClick={() => setSchemaOpen(false)}>
                Close
              </button>
            </div>
            <SchemaExplorer schema={schema ?? null} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
