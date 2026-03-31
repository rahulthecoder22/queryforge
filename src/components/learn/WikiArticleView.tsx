import type { WikiArticle } from '@/data/wiki/types';

type Props = {
  article: WikiArticle;
  titleById: Map<string, string>;
  onOpenArticle: (id: string) => void;
};

export function WikiArticleView({ article, titleById, onOpenArticle }: Props) {
  return (
    <article className="mx-auto max-w-3xl pb-16">
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{article.summary}</p>

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
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">{sec.body}</p>
            {sec.code ? (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-editor)] p-4 font-mono text-xs leading-relaxed text-[var(--accent-success)]">
                {sec.code.trim()}
              </pre>
            ) : null}
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
