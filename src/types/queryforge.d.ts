export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  executionTimeMs: number;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER';
  affectedRows?: number;
  error?: string;
}

export interface ExplainResult {
  columns: string[];
  rows: unknown[][];
  executionTimeMs: number;
  error?: string;
}

export interface TableInfo {
  name: string;
  type: string;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export interface FullSchemaInfo {
  tables: TableInfo[];
  columnsByTable: Record<string, ColumnInfo[]>;
}

export interface DatabaseInfo {
  path: string;
  name: string;
  sizeBytes: number;
}

export interface QueryForgeApi {
  db: {
    execute: (dbPath: string, sql: string) => Promise<QueryResult>;
    executeMultiple: (dbPath: string, sql: string) => Promise<QueryResult[]>;
    explain: (dbPath: string, sql: string) => Promise<ExplainResult>;
    getSchema: (dbPath: string) => Promise<FullSchemaInfo>;
    create: (name: string) => Promise<string>;
    listDatabases: () => Promise<DatabaseInfo[]>;
    setActive: (dbPath: string | null) => Promise<boolean>;
    getActive: () => Promise<string | null>;
    importSQL: (dbPath: string, sqlFilePath: string) => Promise<boolean>;
    copySample: (fileName: string) => Promise<string>;
    generateMasterclass: (schemaId: string) => Promise<string>;
    getPaths: () => Promise<{ dataDir: string; sampleDir: string }>;
  };
  course: {
    getProgress: () => Promise<unknown>;
    saveProgress: (data: unknown) => Promise<boolean>;
  };
  dialog: {
    openFile: (options: {
      properties?: Array<'openFile' | 'multiSelections'>;
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<{ canceled: boolean; filePaths: string[] }>;
    saveFile: (options: {
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<{ canceled: boolean; filePath?: string }>;
  };
  on: (
    channel:
      | 'new-database'
      | 'open-database-path'
      | 'open-settings'
      | 'run-query'
      | 'explain-query'
      | 'new-tab'
      | 'close-tab'
      | 'goto-learn'
      | 'goto-dashboard'
      | 'goto-documents',
    callback: (...args: unknown[]) => void,
  ) => () => void;
}

declare global {
  interface Window {
    queryforge?: QueryForgeApi;
  }
}

export {};
