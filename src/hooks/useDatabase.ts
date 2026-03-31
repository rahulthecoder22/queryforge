import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBrowserSqlSession,
  isBrowserDbPath,
} from '@/lib/browserSqlSession';
import { getQueryForge } from '@/lib/electron';
import type { ExplainResult, FullSchemaInfo, QueryResult } from '@/types/queryforge';
import { useDatabaseStore } from '@/stores/databaseStore';

function schemaEnabled(dbPath: string | null): boolean {
  if (!dbPath) return false;
  if (isBrowserDbPath(dbPath)) return true;
  return getQueryForge() != null;
}

export function useSchema(dbPath: string | null) {
  return useQuery({
    queryKey: ['schema', dbPath],
    enabled: schemaEnabled(dbPath),
    queryFn: async (): Promise<FullSchemaInfo> => {
      if (!dbPath) throw new Error('No database');
      if (isBrowserDbPath(dbPath)) {
        const s = await getBrowserSqlSession();
        return s.getSchema();
      }
      const qf = getQueryForge();
      if (!qf) throw new Error('No database');
      return qf.db.getSchema(dbPath);
    },
  });
}

export function useExecuteQuery(dbPath: string | null) {
  const qc = useQueryClient();
  const setSchema = useDatabaseStore((s) => s.setSchema);

  return useMutation({
    mutationFn: async (sql: string): Promise<QueryResult> => {
      if (!dbPath) throw new Error('No database connection');
      if (isBrowserDbPath(dbPath)) {
        const s = await getBrowserSqlSession();
        return s.executeQuery(sql);
      }
      const qf = getQueryForge();
      if (!qf) throw new Error('No database connection');
      return qf.db.execute(dbPath, sql);
    },
    onSuccess: async () => {
      if (!dbPath) return;
      if (isBrowserDbPath(dbPath)) {
        const s = await getBrowserSqlSession();
        setSchema(s.getSchema());
        void qc.invalidateQueries({ queryKey: ['schema', dbPath] });
        return;
      }
      const qf = getQueryForge();
      if (!qf) return;
      const schema = await qf.db.getSchema(dbPath);
      setSchema(schema);
      void qc.invalidateQueries({ queryKey: ['schema', dbPath] });
    },
  });
}

export function useExplainQuery(dbPath: string | null) {
  return useMutation({
    mutationFn: async (sql: string): Promise<ExplainResult> => {
      if (!dbPath) throw new Error('No database connection');
      if (isBrowserDbPath(dbPath)) {
        const s = await getBrowserSqlSession();
        return s.explainQuery(sql);
      }
      const qf = getQueryForge();
      if (!qf) throw new Error('No database connection');
      return qf.db.explain(dbPath, sql);
    },
  });
}
