export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  executionTimeMs: number;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER';
  affectedRows?: number;
  error?: string;
}

export interface ExplainRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
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

export interface IndexInfo {
  name: string;
  unique: boolean;
  origin: string;
  partial: number;
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
  match: string;
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

export interface DBStatistics {
  pageCount: number;
  pageSize: number;
  freelistCount: number;
}
