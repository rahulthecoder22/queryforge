import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { getNextDsaChallengeId, loadDsaCatalog } from '@/data/dsa/catalog';
import type { DsaChallenge } from '@/data/dsa/types';
import { runDsaUserCode } from '@/lib/dsa/runUserCode';
import { HintsSlideOver } from '@/components/learn/HintsSlideOver';
import { useCourseStore } from '@/stores/courseStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function DsaChallenge() {
  const { challengeId = '' } = useParams<{ challengeId: string }>();
  return <DsaChallengeSession key={challengeId} challengeId={challengeId} />;
}

function DsaChallengeSession({ challengeId }: { challengeId: string }) {
  const theme = useSettingsStore((s) => s.theme);
  const editorTheme = theme === 'dawn' ? 'light' : 'vs-dark';
  const completeLevel = useCourseStore((s) => s.completeLevel);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);

  const [challenge, setChallenge] = useState<DsaChallenge | null>(null);
  const [catalogReady, setCatalogReady] = useState(false);
  const [code, setCode] = useState('');
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState<boolean | null>(null);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [nextId, setNextId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadDsaCatalog().then((c) => {
      if (cancelled) return;
      const ch = c.byId.get(challengeId) ?? null;
      setChallenge(ch);
      setCatalogReady(true);
      setCode(ch?.starterCode ?? '');
      setResultMsg(null);
      setResultOk(null);
      setHintTier(0);
      setHintsOpen(false);
      setNextId(ch ? getNextDsaChallengeId(c.worlds, ch.id) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  const runTests = useCallback(() => {
    if (!challenge) return;
    setResultMsg(null);
    setResultOk(null);
    const r = runDsaUserCode(code, challenge.functionName, challenge.testCases);
    if (r.ok) {
      setResultOk(true);
      setResultMsg(`All ${challenge.testCases.length} tests passed. +${challenge.xpReward} XP`);
      if (!levelsCompleted[challenge.id]?.completed) {
        completeLevel(challenge.id, 3, challenge.xpReward);
      }
    } else if (r.phase === 'assert') {
      setResultOk(false);
      setResultMsg(
        `Test #${(r.testIndex ?? 0) + 1} failed. Expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.received)}.`,
      );
    } else {
      setResultOk(false);
      setResultMsg(r.message + (r.testIndex != null ? ` (test ${r.testIndex + 1})` : ''));
    }
  }, [challenge, code, completeLevel, levelsCompleted]);

  if (!challengeId) {
    return (
      <div className="p-8 text-sm text-[var(--text-muted)]">
        Missing challenge id.{' '}
        <Link to="/learn/dsa" className="text-[var(--accent-primary)] hover:underline">
          Back to hub
        </Link>
      </div>
    );
  }

  if (!catalogReady) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-[var(--text-muted)]">
        Loading challenge…
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 text-sm text-[var(--text-secondary)]">
        <p>No challenge named “{challengeId}”.</p>
        <Link to="/learn/dsa" className="mt-3 inline-block text-[var(--accent-primary)] hover:underline">
          ← DSA hub
        </Link>
      </div>
    );
  }

  const worldLabel = challenge.worldId.replace(/^dsa-w\d+-/, '').replace(/-/g, ' ');

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="qf-glass shrink-0 border-b border-[var(--border-subtle)] px-4 py-3 pl-16 md:pl-20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link to="/learn/dsa" className="text-xs font-medium text-[var(--accent-primary)] hover:underline">
              ← DSA hub
            </Link>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-secondary)]">
              {worldLabel} · {challenge.difficulty}
            </p>
            <h1 className="qf-display mt-1 text-lg font-bold text-[var(--text-primary)] md:text-xl">{challenge.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHintsOpen(true)}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--glass-highlight)]"
            >
              Hints
            </button>
            <button
              type="button"
              onClick={() => void runTests()}
              className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#9333ea] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[var(--accent-primary)]/25 hover:brightness-110"
            >
              Run tests
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="qf-glass min-h-[40vh] shrink-0 border-b border-[var(--border-subtle)] lg:max-w-md lg:border-b-0 lg:border-r xl:max-w-lg">
          <div className="max-h-[min(52vh,480px)] overflow-y-auto p-4 md:p-5 lg:max-h-none lg:flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Theory & story</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
              {challenge.flavorStory}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
              {challenge.conceptDeepDive}
            </p>
            <h2 className="mt-6 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Task</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
              {challenge.problem}
            </p>
            {challenge.constraints.length ? (
              <>
                <h2 className="mt-5 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  Constraints
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {challenge.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-[280px] min-w-0 flex-1 border-b border-[var(--border-subtle)] lg:min-h-0">
            <Editor
              height="420px"
              defaultLanguage="javascript"
              theme={editorTheme}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                tabSize: 2,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <div className="shrink-0 p-4">
            {resultMsg ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  resultOk
                    ? 'border-[var(--accent-success)]/40 bg-[var(--accent-success)]/10 text-[var(--accent-success)]'
                    : 'border-[var(--accent-error)]/40 bg-[var(--accent-error)]/10 text-[var(--accent-error)]'
                }`}
              >
                {resultMsg}
              </motion.div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Implement <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono">{challenge.functionName}</code>{' '}
                exactly as named. No exports — top-level function only.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {nextId ? (
                <Link
                  to={`/learn/dsa/${nextId}`}
                  className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--accent-info)] hover:bg-[var(--bg-tertiary)]"
                >
                  Next challenge →
                </Link>
              ) : (
                <Link
                  to="/learn/dsa"
                  className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--accent-info)] hover:bg-[var(--bg-tertiary)]"
                >
                  Back to hub
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      <HintsSlideOver
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        hints={challenge.hints}
        hintTier={hintTier}
        onNextHint={() =>
          setHintTier((t) => Math.min(t + 1, Math.max(0, challenge.hints.length - 1)))
        }
        title="DSA hints"
      />
    </div>
  );
}
