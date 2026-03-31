import { useCallback, useEffect, useRef, useState } from 'react';
import { SQLEditor } from '@/components/editor/SQLEditor';
import { ResultsTable } from '@/components/editor/ResultsTable';
import { SchemaExplorer } from '@/components/editor/SchemaExplorer';
import {
  getBrowserSqlSession,
  resetBrowserSqlSession,
} from '@/lib/browserSqlSession';
import villageSql from '@/data/databases/village_census.sql?raw';
import {
  buildMasterclassSqlChunks,
  getMasterclassSchemaMeta,
  listMasterclassSchemaMetas,
} from '@/lib/masterclass/generator';
import { getQueryForge } from '@/lib/electron';
import { subscribeExplain, subscribeRun } from '@/lib/workspaceEvents';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useExecuteQuery, useExplainQuery, useSchema } from '@/hooks/useDatabase';
import type { ExplainResult, QueryResult } from '@/types/queryforge';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCourseStore } from '@/stores/courseStore';
import { ResultPulse } from '@/components/effects/QueryCelebration';

const defaultSql = `SELECT * FROM residents
LIMIT 20;`;

export function Workspace() {
  const isDesktop = getQueryForge() != null;
  const activeDbPath = useDatabaseStore((s) => s.activeDbPath);
  const setActiveDbPath = useDatabaseStore((s) => s.setActiveDbPath);
  const setSchema = useDatabaseStore((s) => s.setSchema);

  const theme = useSettingsStore((s) => s.theme);
  const editorTheme = theme === 'dawn' ? 'light' : 'vs-dark';

  const [sql, setSql] = useState(defaultSql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [explain, setExplain] = useState<ExplainResult | null>(null);
  const [tab, setTab] = useState<'results' | 'explain'>('results');
  const [resultPulseKey, setResultPulseKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordQueryRun = useCourseStore((s) => s.recordQueryRun);
  const masterclassSchemas = listMasterclassSchemaMetas();
  const [masterclassId, setMasterclassId] = useState('mc_retail');
  const [masterclassBusy, setMasterclassBusy] = useState(false);

  const { data: schema, isLoading: schemaLoading } = useSchema(activeDbPath);
  const executeMut = useExecuteQuery(activeDbPath);
  const explainMut = useExplainQuery(activeDbPath);

  useEffect(() => {
    if (schema) setSchema(schema);
  }, [schema, setSchema]);

  const run = useCallback(async () => {
    if (!activeDbPath) return;
    setTab('results');
    const r = await executeMut.mutateAsync(sql);
    setResult(r);
    setExplain(null);
    if (!r.error) {
      recordQueryRun();
      setResultPulseKey((k) => k + 1);
    }
  }, [activeDbPath, executeMut, sql, recordQueryRun]);

  const runExplain = useCallback(async () => {
    if (!activeDbPath) return;
    setTab('explain');
    const r = await explainMut.mutateAsync(sql);
    setExplain(r);
  }, [activeDbPath, explainMut, sql]);

  useEffect(() => {
    return subscribeRun(() => {
      void run();
    });
  }, [run]);

  useEffect(() => {
    return subscribeExplain(() => {
      void runExplain();
    });
  }, [runExplain]);

  const handleNewDb = useCallback(async () => {
    const qf = getQueryForge();
    if (qf) {
      const name = window.prompt('Database name', 'my_database');
      if (!name) return;
      const p = await qf.db.create(name);
      await qf.db.setActive(p);
      setActiveDbPath(p);
      setSql('-- New empty database\nSELECT sqlite_version();');
      setResult(null);
      return;
    }
    resetBrowserSqlSession();
    const s = await getBrowserSqlSession();
    await s.openEmpty();
    setActiveDbPath('browser:memory');
    setSql('-- New empty database\nSELECT sqlite_version();');
    setResult(null);
  }, [setActiveDbPath]);

  useEffect(() => {
    const onNew = () => {
      void handleNewDb();
    };
    window.addEventListener('queryforge-new-database', onNew);
    return () => window.removeEventListener('queryforge-new-database', onNew);
  }, [handleNewDb]);

  async function handleMasterclass() {
    const meta = getMasterclassSchemaMeta(masterclassId);
    const starter = meta?.suggestedQuery ?? 'SELECT sqlite_version();';
    const qf = getQueryForge();
    if (qf) {
      setMasterclassBusy(true);
      try {
        const p = await qf.db.generateMasterclass(masterclassId);
        await qf.db.setActive(p);
        setActiveDbPath(p);
        setSql(starter);
        setResult(null);
      } finally {
        setMasterclassBusy(false);
      }
      return;
    }
    setMasterclassBusy(true);
    try {
      resetBrowserSqlSession();
      const s = await getBrowserSqlSession();
      await s.openEmpty();
      await s.importSqlChunks(buildMasterclassSqlChunks(masterclassId));
      setActiveDbPath(`browser:masterclass:${masterclassId}`);
      setSql(starter);
      setResult(null);
    } finally {
      setMasterclassBusy(false);
    }
  }

  async function handleSample() {
    const qf = getQueryForge();
    if (qf) {
      const p = await qf.db.copySample('village_census.sql');
      await qf.db.setActive(p);
      setActiveDbPath(p);
      setSql(`SELECT * FROM residents
LIMIT 20;`);
      setResult(null);
      return;
    }
    resetBrowserSqlSession();
    const s = await getBrowserSqlSession();
    await s.openEmpty();
    await s.importSql(villageSql);
    setActiveDbPath('browser:village');
    setSql(`SELECT * FROM residents
LIMIT 20;`);
    setResult(null);
  }

  async function handlePickDb() {
    const qf = getQueryForge();
    if (qf) {
      const { canceled, filePaths } = await qf.dialog.openFile({
        properties: ['openFile'],
        filters: [{ name: 'SQLite', extensions: ['db', 'sqlite', 'sqlite3'] }],
      });
      if (canceled || !filePaths[0]) return;
      await qf.db.setActive(filePaths[0]);
      setActiveDbPath(filePaths[0]);
      return;
    }
    fileInputRef.current?.click();
  }

  async function onDbFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const buf = await file.arrayBuffer();
    const s = await getBrowserSqlSession();
    await s.loadFromBuffer(buf);
    setActiveDbPath(`browser:${file.name}`);
    setResult(null);
  }

  const insertCol = (table: string, col: string) => {
    setSql((s) => `${s.trimEnd()}\n${table}.${col}`);
  };

  const dbLabel =
    activeDbPath == null
      ? 'None — load sample or create new'
      : activeDbPath.startsWith('browser:')
        ? `In-memory (${activeDbPath.slice('browser:'.length) || 'session'})`
        : activeDbPath;

  return (
    <div className="flex h-full flex-col">
      {!isDesktop ? (
        <div className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-center text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--accent-warning)]">Browser mode</strong> — SQL runs in your
          browser (in-memory). For saving <code className="text-[var(--text-primary)]">.db</code>{' '}
          files on disk and native menus, run{' '}
          <code className="rounded bg-[var(--bg-editor)] px-1 font-mono">npm run dev</code> and use
          the <strong>Electron</strong> window.
        </div>
      ) : null}

      <header className="drag flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 pl-20">
        <div className="no-drag flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--text-muted)]">Database:</span>
          <span className="max-w-[min(100%,320px)] truncate font-mono text-[var(--text-primary)]">
            {dbLabel}
          </span>
        </div>
        <div className="no-drag flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3,application/x-sqlite3,application/octet-stream"
            className="hidden"
            onChange={(e) => void onDbFileChosen(e)}
          />
          <button
            type="button"
            className="rounded-lg bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            onClick={() => void handleNewDb()}
          >
            New
          </button>
          <button
            type="button"
            className="rounded-lg bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            onClick={() => void handlePickDb()}
          >
            Open…
          </button>
          <button
            type="button"
            className="rounded-lg bg-[var(--accent-primary)]/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-primary)]"
            onClick={() => void handleSample()}
          >
            Village sample
          </button>
          <select
            value={masterclassId}
            onChange={(e) => setMasterclassId(e.target.value)}
            className="max-w-[140px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
            title="Masterclass schema"
          >
            {masterclassSchemas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg border border-[var(--accent-primary)]/50 bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50"
            disabled={masterclassBusy}
            onClick={() => void handleMasterclass()}
            title="200 rows × 4 tables — may take a few seconds"
          >
            {masterclassBusy ? 'Building…' : 'Load masterclass'}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="w-56 shrink-0 overflow-auto border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="border-b border-[var(--border-subtle)] px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Schema
          </div>
          <SchemaExplorer
            schema={schema ?? null}
            loading={schemaLoading}
            onInsertColumn={insertCol}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <SQLEditor value={sql} onChange={setSql} onRun={() => void run()} theme={editorTheme} />
            <div className="no-drag flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                onClick={() => void run()}
                disabled={!activeDbPath || executeMut.isPending}
              >
                {executeMut.isPending ? 'Running…' : 'Run ⌘↵'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                onClick={() => void runExplain()}
                disabled={!activeDbPath || explainMut.isPending}
              >
                Explain
              </button>
            </div>
          </div>

          <div className="shrink-0">
            <div className="mb-2 flex gap-2 border-b border-[var(--border-subtle)] text-sm">
              <button
                type="button"
                className={`border-b-2 px-2 pb-2 ${
                  tab === 'results'
                    ? 'border-[var(--accent-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                }`}
                onClick={() => setTab('results')}
              >
                Results
              </button>
              <button
                type="button"
                className={`border-b-2 px-2 pb-2 ${
                  tab === 'explain'
                    ? 'border-[var(--accent-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                }`}
                onClick={() => setTab('explain')}
              >
                Plan
              </button>
            </div>
            {tab === 'results' ? (
              <ResultPulse pulseKey={resultPulseKey}>
                <ResultsTable result={result} maxHeight={280} />
              </ResultPulse>
            ) : explain?.error ? (
              <div className="text-sm text-[var(--accent-error)]">{explain.error}</div>
            ) : explain ? (
              <ResultsTable
                result={{
                  columns: explain.columns,
                  rows: explain.rows,
                  rowCount: explain.rows.length,
                  executionTimeMs: explain.executionTimeMs,
                  type: 'SELECT',
                }}
                maxHeight={240}
              />
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Run Explain on a SELECT query.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
