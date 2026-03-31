import { useSettingsStore } from '@/stores/settingsStore';

export function Settings() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className="relative h-full overflow-auto bg-transparent p-6 md:p-8">
      <div
        className="pointer-events-none absolute right-10 top-10 h-48 w-48 rounded-full opacity-20 blur-[72px]"
        style={{ background: 'var(--accent-info)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">
          Preferences
        </p>
        <h1 className="qf-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          <span className="bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-primary)] bg-clip-text text-transparent">
            Settings
          </span>
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Theme and editor preferences (more options coming soon).
        </p>

        <section className="qf-glass mt-8 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Learning progress</h2>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            XP, completed levels, streaks, and achievements are saved automatically. In the{' '}
            <strong>desktop app</strong>, they live in{' '}
            <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono text-[11px]">
              ~/Library/Application Support/QueryForge/course-progress.json
            </code>
            . In the <strong>browser</strong>, the same data is stored in{' '}
            <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono text-[11px]">
              localStorage
            </code>
            .
          </p>
        </section>

        <section className="qf-glass mt-6 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Appearance</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                theme === 'midnight'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] text-white shadow-md shadow-[var(--accent-primary)]/25'
                  : 'border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--glass-highlight)]'
              }`}
              onClick={() => setTheme('midnight')}
            >
              Midnight
            </button>
            <button
              type="button"
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                theme === 'dawn'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] text-white shadow-md shadow-[var(--accent-primary)]/25'
                  : 'border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--glass-highlight)]'
              }`}
              onClick={() => setTheme('dawn')}
            >
              Dawn
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
