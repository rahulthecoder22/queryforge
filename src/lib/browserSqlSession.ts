import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';
// Bundled WASM for Vite
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {
  friendlySqlError,
  registerMySQLFunctions,
  translateMySQLToSQLite,
} from '@/lib/mysqlCompat';
import type {
  ColumnInfo,
  ExplainResult,
  FullSchemaInfo,
  QueryResult,
  TableInfo,
} from '@/types/queryforge';

function classifyStatement(sql: string): QueryResult['type'] {
  const s = sql.trim().replace(/^\(+/g, '').trim().toUpperCase();
  if (s.startsWith('SELECT') || s.startsWith('WITH')) return 'SELECT';
  if (s.startsWith('INSERT')) return 'INSERT';
  if (s.startsWith('UPDATE')) return 'UPDATE';
  if (s.startsWith('DELETE')) return 'DELETE';
  if (
    s.startsWith('CREATE') ||
    s.startsWith('ALTER') ||
    s.startsWith('DROP') ||
    s.startsWith('PRAGMA')
  )
    return 'DDL';
  return 'OTHER';
}

function runSingle(
  db: Database,
  statement: string,
): { result?: QueryResult; error?: string } {
  const started = performance.now();
  let translated: string;
  try {
    translated = translateMySQLToSQLite(statement);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: friendlySqlError(msg) };
  }

  const type = classifyStatement(translated);

  try {
    const results = db.exec(translated);
    const executionTimeMs = Math.round(performance.now() - started);
    const changes = db.getRowsModified();
    if (results.length > 0) {
      const last = results[results.length - 1]!;
      const rows: unknown[][] = last.values.map((r: unknown[]) => [...r]);
      return {
        result: {
          columns: last.columns,
          rows,
          rowCount: rows.length,
          executionTimeMs,
          type: 'SELECT',
        },
      };
    }
    return {
      result: {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        type,
        affectedRows: changes,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: friendlySqlError(msg) };
  }
}

type SqlJsModule = Awaited<ReturnType<typeof initSqlJs>>;

export class BrowserSqlSession {
  private SQL: SqlJsModule | null = null;
  private db: Database | null = null;

  private async loadSqlJs(): Promise<SqlJsModule> {
    if (this.SQL) return this.SQL;
    this.SQL = await initSqlJs({
      locateFile: (file: string) =>
        file.endsWith('.wasm') ? sqlWasmUrl : sqlWasmUrl,
    });
    return this.SQL;
  }

  /** Create or replace in-memory database */
  async openEmpty(): Promise<void> {
    const SQL = await this.loadSqlJs();
    this.db?.close();
    this.db = new SQL.Database();
    registerMySQLFunctions(this.db);
  }

  async loadFromBuffer(data: ArrayBuffer | Uint8Array): Promise<void> {
    const SQL = await this.loadSqlJs();
    this.db?.close();
    const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.db = new SQL.Database(u8);
    registerMySQLFunctions(this.db);
  }

  async importSql(script: string): Promise<void> {
    await this.ensureDb();
    this.db!.exec(script);
  }

  /** Chunked import for large generated scripts (avoids huge single exec strings). */
  async importSqlChunks(chunks: string[]): Promise<void> {
    await this.ensureDb();
    for (const chunk of chunks) {
      const t = chunk.trim();
      if (t) this.db!.exec(t);
    }
  }

  private async ensureDb(): Promise<void> {
    if (!this.db) await this.openEmpty();
  }

  dispose(): void {
    this.db?.close();
    this.db = null;
  }

  executeQuery(sql: string): QueryResult {
    if (!this.db) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        type: 'OTHER',
        error: 'No database loaded.',
      };
    }
    const trimmed = sql.trim();
    if (!trimmed) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        type: 'OTHER',
        error: 'Empty query.',
      };
    }
    const { result, error } = runSingle(this.db, trimmed);
    if (error) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        type: 'OTHER',
        error,
      };
    }
    return result!;
  }

  explainQuery(sql: string): ExplainResult {
    if (!this.db) {
      return {
        columns: [],
        rows: [],
        executionTimeMs: 0,
        error: 'No database loaded.',
      };
    }
    const started = performance.now();
    let translated: string;
    try {
      translated = translateMySQLToSQLite(sql);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        columns: [],
        rows: [],
        executionTimeMs: Math.round(performance.now() - started),
        error: friendlySqlError(msg),
      };
    }
    if (!/^SELECT/i.test(translated.trim()) && !/^WITH/i.test(translated.trim())) {
      return {
        columns: [],
        rows: [],
        executionTimeMs: Math.round(performance.now() - started),
        error: 'EXPLAIN is only meaningful for SELECT queries here.',
      };
    }
    try {
      const results = this.db.exec(`EXPLAIN ${translated}`);
      const executionTimeMs = Math.round(performance.now() - started);
      if (results.length === 0) {
        return { columns: [], rows: [], executionTimeMs };
      }
      const last = results[results.length - 1]!;
      const rows = last.values.map((r: unknown[]) => [...r]);
      return { columns: last.columns, rows, executionTimeMs };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        columns: [],
        rows: [],
        executionTimeMs: Math.round(performance.now() - started),
        error: friendlySqlError(msg),
      };
    }
  }

  getTables(): TableInfo[] {
    if (!this.db) return [];
    const res = this.executeQuery(
      `SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    );
    return res.rows.map((r) => ({ name: String(r[0]), type: String(r[1]) }));
  }

  getColumns(table: string): ColumnInfo[] {
    if (!this.db) return [];
    const safe = table.replace(/'/g, "''");
    const res = this.db.exec(`PRAGMA table_info('${safe}')`);
    if (res.length === 0) return [];
    const rows: ColumnInfo[] = [];
    for (const r of res[0]!.values) {
      rows.push({
        cid: Number(r[0]),
        name: String(r[1]),
        type: String(r[2]),
        notnull: Number(r[3]),
        dflt_value: r[4] as string | null,
        pk: Number(r[5]),
      });
    }
    return rows;
  }

  getSchema(): FullSchemaInfo {
    const tables = this.getTables().filter((t) => t.type === 'table');
    const columnsByTable: Record<string, ColumnInfo[]> = {};
    for (const t of tables) {
      columnsByTable[t.name] = this.getColumns(t.name);
    }
    return { tables, columnsByTable };
  }
}

let browserSingleton: BrowserSqlSession | null = null;

export const BROWSER_DB_PREFIX = 'browser:';

export function isBrowserDbPath(path: string | null | undefined): boolean {
  return Boolean(path?.startsWith(BROWSER_DB_PREFIX));
}

export async function getBrowserSqlSession(): Promise<BrowserSqlSession> {
  if (!browserSingleton) {
    browserSingleton = new BrowserSqlSession();
  }
  return browserSingleton;
}

export function resetBrowserSqlSession(): void {
  browserSingleton?.dispose();
  browserSingleton = null;
}
