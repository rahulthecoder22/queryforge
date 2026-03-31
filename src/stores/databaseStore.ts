import { create } from 'zustand';
import type { FullSchemaInfo } from '@/types/queryforge';

interface DatabaseState {
  activeDbPath: string | null;
  schema: FullSchemaInfo | null;
  schemaLoading: boolean;
  setActiveDbPath: (path: string | null) => void;
  setSchema: (schema: FullSchemaInfo | null) => void;
  setSchemaLoading: (v: boolean) => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  activeDbPath: null,
  schema: null,
  schemaLoading: false,
  setActiveDbPath: (activeDbPath) => set({ activeDbPath }),
  setSchema: (schema) => set({ schema }),
  setSchemaLoading: (schemaLoading) => set({ schemaLoading }),
}));
