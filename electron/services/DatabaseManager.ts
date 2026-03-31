import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { DatabaseInfo, QueryResult } from '../types.js';
import { buildMasterclassSqlChunks } from '../../src/lib/masterclass/generator.js';
import { SQLEngine } from './SQLEngine.js';

export class DatabaseManager {
  private engines = new Map<string, SQLEngine>();
  private activePath: string | null = null;

  getDataDirectory(): string {
    const home = app.getPath('home');
    const dir = path.join(home, 'queryforge', 'data');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  getSampleDatabasesDir(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'databases');
    }
    return path.join(app.getAppPath(), 'src', 'data', 'databases');
  }

  getProgressFilePath(): string {
    const dir = path.join(app.getPath('userData'));
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'course-progress.json');
  }

  async getOrOpenEngine(dbPath: string): Promise<SQLEngine> {
    let eng = this.engines.get(dbPath);
    if (!eng) {
      eng = new SQLEngine(dbPath);
      await eng.open();
      this.engines.set(dbPath, eng);
    }
    return eng;
  }

  setActiveDatabase(dbPath: string | null): void {
    this.activePath = dbPath;
  }

  getActiveDatabase(): string | null {
    return this.activePath;
  }

  async execute(dbPath: string, sql: string): Promise<QueryResult> {
    const eng = await this.getOrOpenEngine(dbPath);
    return eng.executeQuery(sql);
  }

  async executeMultiple(dbPath: string, sql: string): Promise<QueryResult[]> {
    const eng = await this.getOrOpenEngine(dbPath);
    return eng.executeMultiple(sql);
  }

  async explain(dbPath: string, sql: string) {
    const eng = await this.getOrOpenEngine(dbPath);
    return eng.explainQuery(sql);
  }

  async getSchema(dbPath: string) {
    const eng = await this.getOrOpenEngine(dbPath);
    return eng.getSchema();
  }

  async createDatabase(name: string): Promise<string> {
    const safe = name.replace(/[^\w\- ]/g, '_').trim() || 'untitled';
    const file = `${safe.replace(/\s+/g, '_')}.db`;
    const full = path.join(this.getDataDirectory(), file);
    if (fs.existsSync(full)) {
      const base = safe.replace(/\s+/g, '_');
      let i = 1;
      let candidate = full;
      while (fs.existsSync(candidate)) {
        candidate = path.join(this.getDataDirectory(), `${base}_${i}.db`);
        i += 1;
      }
      const eng = new SQLEngine(candidate);
      await eng.open();
      this.engines.set(candidate, eng);
      return candidate;
    }
    const eng = new SQLEngine(full);
    await eng.open();
    this.engines.set(full, eng);
    return full;
  }

  async copySampleToData(sampleFileName: string): Promise<string> {
    const srcDir = this.getSampleDatabasesDir();
    const src = path.join(srcDir, sampleFileName);
    if (!fs.existsSync(src)) {
      throw new Error(`Sample database script not found: ${sampleFileName}`);
    }
    const base = path.basename(sampleFileName, path.extname(sampleFileName));
    const dest = path.join(this.getDataDirectory(), `${base}.db`);
    const eng = new SQLEngine(dest);
    await eng.open();
    const sql = fs.readFileSync(src, 'utf8');
    eng.importSQL(sql);
    this.engines.set(dest, eng);
    return dest;
  }

  async importSQLFile(dbPath: string, sqlFilePath: string): Promise<void> {
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    const eng = await this.getOrOpenEngine(dbPath);
    eng.importSQL(sql);
  }

  /** Create (or replace) a SQLite file with a generated masterclass dataset. */
  async generateMasterclassDatabase(schemaId: string): Promise<string> {
    const chunks = buildMasterclassSqlChunks(schemaId);
    const safe = schemaId.replace(/[^\w-]/g, '_');
    const dest = path.join(this.getDataDirectory(), `masterclass_${safe}.db`);
    const existing = this.engines.get(dest);
    if (existing) {
      existing.close();
      this.engines.delete(dest);
    }
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    const eng = new SQLEngine(dest);
    await eng.open();
    eng.bulkImportSQL(chunks);
    this.engines.set(dest, eng);
    return dest;
  }

  listDatabases(): DatabaseInfo[] {
    const dir = this.getDataDirectory();
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.db'))
      .map((f) => {
        const p = path.join(dir, f);
        const st = fs.statSync(p);
        return { path: p, name: f, sizeBytes: st.size };
      });
  }

  async closeDatabase(dbPath: string): Promise<void> {
    const eng = this.engines.get(dbPath);
    if (eng) {
      eng.close();
      this.engines.delete(dbPath);
    }
    if (this.activePath === dbPath) this.activePath = null;
  }

  async closeAll(): Promise<void> {
    for (const eng of this.engines.values()) {
      eng.close();
    }
    this.engines.clear();
    this.activePath = null;
  }
}
