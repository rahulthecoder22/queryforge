/** Shown while the SQL course catalog chunk is loading or parsing. */
export function LearnSqlLoading() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden p-8 md:p-10" aria-busy="true" aria-label="Loading SQL course">
      <div className="qf-shimmer-title mx-auto max-w-6xl space-y-6">
        <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--glass-highlight)]" />
        <div className="h-10 max-w-md animate-pulse rounded-xl bg-[var(--glass-highlight)]" />
        <div className="h-4 max-w-2xl animate-pulse rounded-lg bg-[var(--glass-highlight)]" />
        <div className="flex flex-wrap gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-36 animate-pulse rounded-2xl bg-[var(--glass-highlight)]"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        <div className="qf-glass mt-8 h-48 max-w-3xl animate-pulse rounded-3xl bg-[var(--bg-secondary)]/40" />
        <div className="grid gap-4 pt-4 md:grid-cols-2">
          <div className="qf-glass h-64 animate-pulse rounded-2xl bg-[var(--bg-secondary)]/30" />
          <div className="qf-glass h-64 animate-pulse rounded-2xl bg-[var(--bg-secondary)]/30" />
        </div>
      </div>
    </div>
  );
}
