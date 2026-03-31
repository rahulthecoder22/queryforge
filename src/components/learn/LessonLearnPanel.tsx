import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LessonTheory } from '@/data/lessonTheory/types';
import { TheoryVisualStage } from '@/components/learn/TheoryVisualStage';

type Props = {
  theory: LessonTheory;
  story: string;
  task: string;
  conceptLabel: string;
  sampleDocTitle?: string;
  sampleDocJson?: string;
  children?: ReactNode;
};

export function LessonLearnPanel({
  theory,
  story,
  task,
  conceptLabel,
  sampleDocTitle,
  sampleDocJson,
  children,
}: Props) {
  const showSample = sampleDocTitle != null && sampleDocJson != null;
  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-4 shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
          {theory.eyebrow ?? 'Learn'}
        </p>
        {theory.title ? (
          <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">{theory.title}</h2>
        ) : null}

        <TheoryVisualStage id={theory.visualId ?? 'none'} />

        <div className="mt-4 space-y-4">
          {theory.sections.map((sec, i) => (
            <motion.section
              key={sec.heading}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="border-l-2 border-[var(--accent-primary)]/50 pl-3"
            >
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">{sec.heading}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{sec.body}</p>
              {sec.codeExample ? (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg-editor)] p-2 font-mono text-[10px] text-[var(--accent-success)]">
                  {sec.codeExample}
                </pre>
              ) : null}
            </motion.section>
          ))}
        </div>

        {theory.checklist && theory.checklist.length > 0 ? (
          <div className="mt-4 rounded-xl bg-[var(--bg-primary)]/60 p-3">
            <p className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Before you type</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--text-secondary)]">
              {theory.checklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </motion.div>

      {showSample ? (
        <div className="min-h-0 shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
          <div className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">{sampleDocTitle}</div>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-[var(--text-secondary)]">
            {sampleDocJson}
          </pre>
        </div>
      ) : null}

      <div className="shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-sm">
        <p className="text-[var(--text-primary)]">{story}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--accent-warning)]">Your mission</p>
        <p className="mt-1 text-[var(--text-secondary)]">{task}</p>
        <p className="mt-2 text-[10px] text-[var(--text-muted)]">Tag: {conceptLabel}</p>
      </div>

      {children}
    </div>
  );
}
