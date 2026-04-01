import type { WikiArticle } from '@/data/wiki/types';

type Props = {
  article: WikiArticle;
  titleById: Map<string, string>;
  onOpenArticle: (id: string) => void;
};

/** Split wiki bodies on blank lines into paragraphs; lines starting with • or - become lists. */
function SectionBody({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter((b) => b.trim().length > 0);

  return (
    <div className="mt-3 space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
      {blocks.map((block, bi) => {
        const rawLines = block.split('\n');
        const lines = rawLines.map((l) => l.trimEnd());
        const nonEmpty = lines.filter((l) => l.trim().length > 0);
        const isBulletBlock =
          nonEmpty.length > 0 &&
          nonEmpty.every((l) => /^(?:•|-)\s/.test(l) || /^\d+\.\s/.test(l));

        if (isBulletBlock) {
          return (
            <ul
              key={bi}
              className="list-disc space-y-2 pl-5 marker:text-[var(--accent-primary)] [li]:pl-1"
            >
              {nonEmpty.map((line, li) => {
                const cleaned = line.replace(/^(?:•|-)\s/, '').replace(/^\d+\.\s/, '');
                return (
                  <li key={li} className="whitespace-pre-wrap">
                    {cleaned}
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={bi} className="whitespace-pre-wrap first:mt-0">
            {block.trim()}
          </p>
        );
      })}
    </div>
  );
}

export function WikiArticleView({ article, titleById, onOpenArticle }: Props) {
  return (
    <article className="mx-auto max-w-3xl pb-16">
      <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {article.summary.split(/\n\n+/).map((p, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : undefined}>
            {p.trim()}
          </p>
        ))}
      </div>

      {article.sections.length > 1 ? (
        <nav
          aria-label="On this page"
          className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">On this page</p>
          <ol className="mt-2 space-y-1.5 text-sm">
            {article.sections.map((sec) => (
              <li key={sec.id}>
                <a href={`#sec-${article.id}-${sec.id}`} className="text-[var(--accent-info)] hover:underline">
                  {sec.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="mt-8 space-y-10">
        {article.sections.map((sec) => (
          <section key={sec.id} id={`sec-${article.id}-${sec.id}`} className="scroll-mt-24">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{sec.heading}</h3>
            <SectionBody text={sec.body} />
            {sec.diagram ? (
              <pre
                className="mt-4 overflow-x-auto rounded-xl border border-dashed border-[var(--accent-info)]/45 bg-[var(--bg-secondary)]/90 p-4 font-mono text-[11px] leading-snug text-[var(--accent-info)]"
                aria-label="Diagram"
              >
                {sec.diagram.trimEnd()}
              </pre>
            ) : null}
            {sec.code ? (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-editor)] p-4 font-mono text-xs leading-relaxed text-[var(--accent-success)]">
                {sec.code.trim()}
              </pre>
            ) : null}
            {sec.codeExtra?.map((block, ci) => (
              <pre
                key={ci}
                className="mt-3 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-editor)] p-4 font-mono text-xs leading-relaxed text-[var(--accent-success)]"
              >
                {block.trim()}
              </pre>
            ))}
          </section>
        ))}
      </div>

      {article.seeAlso && article.seeAlso.length > 0 ? (
        <div className="mt-12 border-t border-[var(--border-subtle)] pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">See also</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {article.seeAlso.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpenArticle(id)}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
                >
                  {titleById.get(id) ?? id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
