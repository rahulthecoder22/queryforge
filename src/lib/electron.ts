import type { QueryForgeApi } from '@/types/queryforge';

export function getQueryForge(): QueryForgeApi | null {
  if (typeof window !== 'undefined' && window.queryforge) {
    return window.queryforge;
  }
  return null;
}

export function isElectron(): boolean {
  return getQueryForge() !== null;
}
