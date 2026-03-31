import type { ReactNode } from 'react';
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
  const hasSteps = theory.steps != null && theory.steps.length > 0;

  return (
    <div className="flex min-h-0 flex-col gap-5 overflow-hidden">
      {/* Guide */}
      <article className="shrink-0 border-b border-[var(--border-subtle)] pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
            {theory.eyebrow ?? 'Guide'}
          </p>
          <span className="rounded-md bg-[var(--bg-tertiary)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
            {conceptLabel}
          </span>
        </div>

        {theory.title ? (
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {theory.title}
          </h2>
        ) : null}

        {theory.goal ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{theory.goal}</p>
        ) : null}

        {theory.visualId != null && theory.visualId !== 'none' ? (
          <div className="mt-4">
            <TheoryVisualStage id={theory.visualId} compact />
          </div>
        ) : null}

        {hasSteps ? (
          <ol className="mt-5 list-none space-y-4 p-0">
            {theory.steps!.map((step, i) => (
              <li key={`${step.title}-${i}`} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-muted)]"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
                  {step.sql ? (
                    <pre className="mt-2 overflow-x-auto border-l-2 border-[var(--accent-primary)]/40 bg-[var(--bg-editor)]/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-[var(--text-primary)]">
                      {step.sql}
                    </pre>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 space-y-4">
            {theory.sections.map((sec) => (
              <section key={sec.heading} className="border-l-2 border-[var(--accent-primary)]/35 pl-3">
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">{sec.heading}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{sec.body}</p>
                {sec.codeExample ? (
                  <pre className="mt-2 overflow-x-auto border-l-2 border-[var(--accent-primary)]/40 bg-[var(--bg-editor)]/90 px-3 py-2 font-mono text-[11px] text-[var(--text-primary)]">
                    {sec.codeExample}
                  </pre>
                ) : null}
              </section>
            ))}
          </div>
        )}

        {theory.checklist && theory.checklist.length > 0 ? (
          <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Before you run
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)]">
              {theory.checklist.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-[var(--accent-primary)]">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>

      {showSample ? (
        <div className="min-h-0 shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 px-3 py-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {sampleDocTitle}
          </div>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-[var(--text-secondary)]">
            {sampleDocJson}
          </pre>
        </div>
      ) : null}

      {/* Challenge */}
      <div className="shrink-0 space-y-2 border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--accent-warning)]">
          Challenge
        </p>
        <p className="text-sm font-medium text-[var(--text-primary)]">{story}</p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{task}</p>
      </div>

      {children}
    </div>
  );
}
