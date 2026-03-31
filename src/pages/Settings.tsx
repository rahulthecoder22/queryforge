import { useSettingsStore } from '@/stores/settingsStore';

export function Settings() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Theme and editor preferences (more options coming soon).
      </p>

      <section className="mt-8 max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
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

      <section className="mt-6 max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Appearance</h2>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${
              theme === 'midnight'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            }`}
            onClick={() => setTheme('midnight')}
          >
            Midnight
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${
              theme === 'dawn'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            }`}
            onClick={() => setTheme('dawn')}
          >
            Dawn
          </button>
        </div>
      </section>
    </div>
  );
}
