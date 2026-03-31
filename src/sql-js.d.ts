declare module 'sql.js' {
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  export class Database {
    constructor(data?: number[] | Buffer | Uint8Array | null);
    exec(sql: string): QueryExecResult[];
    run(sql: string): void;
    close(): void;
    export(): Uint8Array;
    getRowsModified(): number;
    create_function(name: string, fn: (...args: unknown[]) => unknown): void;
  }

  interface SqlJsStatic {
    Database: typeof Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
