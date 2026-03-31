import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';
import initSqlJs, { type Database } from 'sql.js';
import type {
  ColumnInfo,
  DBStatistics,
  ExplainResult,
  ForeignKeyInfo,
  FullSchemaInfo,
  IndexInfo,
  QueryResult,
  TableInfo,
} from '../types.js';
import {
  friendlySqlError,
  registerMySQLFunctions,
  translateMySQLToSQLite,
} from './MySQLCompatLayer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadSqlJs() {
  const wasmDir = app.isPackaged
    ? path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'sql.js',
        'dist',
      )
    : path.join(__dirname, '../../../node_modules/sql.js/dist');
  return initSqlJs({
    locateFile: (file: string) => path.join(wasmDir, file),
  });
}

let sqlJsPromise: ReturnType<typeof loadSqlJs> | null = null;

function getSQL() {
  if (!sqlJsPromise) sqlJsPromise = loadSqlJs();
  return sqlJsPromise;
}

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

export class SQLEngine {
  private db: Database | null = null;
  private filePath: string | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  get path(): string | null {
    return this.filePath;
  }

  async open(): Promise<void> {
    const SQL = await getSQL();
    if (this.filePath && fs.existsSync(this.filePath)) {
      const fileBuffer = fs.readFileSync(this.filePath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }
    registerMySQLFunctions(this.db);
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  persist(): void {
    if (!this.db || !this.filePath) return;
    const data = this.db.export();
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, Buffer.from(data));
  }

  executeQuery(sql: string): QueryResult {
    if (!this.db) throw new Error('Database not open');
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
    this.persist();
    return result!;
  }

  executeMultiple(sql: string): QueryResult[] {
    if (!this.db) throw new Error('Database not open');
    const statements = splitSqlStatements(sql);
    const out: QueryResult[] = [];
    for (const st of statements) {
      if (!st.trim()) continue;
      out.push(this.executeQuery(st));
    }
    return out;
  }

  explainQuery(sql: string): ExplainResult {
    if (!this.db) throw new Error('Database not open');
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
    if (!this.db) throw new Error('Database not open');
    const res = this.executeQuery(
      `SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    );
    return res.rows.map((r) => ({ name: String(r[0]), type: String(r[1]) }));
  }

  getColumns(table: string): ColumnInfo[] {
    if (!this.db) throw new Error('Database not open');
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

  getIndexes(table: string): IndexInfo[] {
    if (!this.db) throw new Error('Database not open');
    const safe = table.replace(/'/g, "''");
    const res = this.db.exec(`PRAGMA index_list('${safe}')`);
    if (res.length === 0) return [];
    const rows: IndexInfo[] = [];
    for (const r of res[0]!.values) {
      rows.push({
        name: String(r[1]),
        unique: Number(r[2]) === 1,
        origin: String(r[3]),
        partial: Number(r[4]),
      });
    }
    return rows;
  }

  getForeignKeys(table: string): ForeignKeyInfo[] {
    if (!this.db) throw new Error('Database not open');
    const safe = table.replace(/'/g, "''");
    const res = this.db.exec(`PRAGMA foreign_key_list('${safe}')`);
    if (res.length === 0) return [];
    const rows: ForeignKeyInfo[] = [];
    for (const r of res[0]!.values) {
      rows.push({
        id: Number(r[0]),
        seq: Number(r[1]),
        table: String(r[2]),
        from: String(r[3]),
        to: String(r[4]),
        on_update: String(r[5]),
        on_delete: String(r[6]),
        match: String(r[7]),
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

  importSQL(script: string): void {
    if (!this.db) throw new Error('Database not open');
    this.db.exec(script);
    this.persist();
  }

  /** Run multiple scripts then persist once (large imports). */
  bulkImportSQL(chunks: string[]): void {
    if (!this.db) throw new Error('Database not open');
    for (const chunk of chunks) {
      const t = chunk.trim();
      if (t) this.db.exec(t);
    }
    this.persist();
  }

  exportSQL(): string {
    if (!this.db) throw new Error('Database not open');
    const tables = this.getTables().filter((t) => t.type === 'table');
    const parts: string[] = [];
    for (const t of tables) {
      const row = this.executeQuery(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name='${t.name.replace(/'/g, "''")}'`,
      );
      if (row.rows[0]?.[0]) {
        parts.push(String(row.rows[0][0]) + ';');
      }
    }
    return parts.join('\n\n');
  }

  vacuum(): void {
    if (!this.db) throw new Error('Database not open');
    this.db.run('VACUUM');
    this.persist();
  }

  getStatistics(): DBStatistics {
    if (!this.db) throw new Error('Database not open');
    const pageCount = Number(
      this.executeQuery('PRAGMA page_count').rows[0]?.[0] ?? 0,
    );
    const pageSize = Number(
      this.executeQuery('PRAGMA page_size').rows[0]?.[0] ?? 0,
    );
    const freelistCount = Number(
      this.executeQuery('PRAGMA freelist_count').rows[0]?.[0] ?? 0,
    );
    return { pageCount, pageSize, freelistCount };
  }

  getVersion(): string {
    if (!this.db) throw new Error('Database not open');
    const v = this.executeQuery('select sqlite_version()');
    return String(v.rows[0]?.[0] ?? 'unknown');
  }
}

/** Split on semicolons outside quotes */
export function splitSqlStatements(sql: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i]!;
    const prev = i > 0 ? sql[i - 1]! : '';
    if (c === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    if (c === ';' && !inSingle && !inDouble) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) out.push(cur);
  return out;
}
