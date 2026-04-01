import type { World } from './types';

let cached: World[] | null = null;
let inflight: Promise<World[]> | null = null;

const listeners = new Set<() => void>();

function notifyCatalogReady() {
  for (const l of listeners) {
    l();
  }
}

/** Subscribe to catalog load completion (for useSyncExternalStore). */
export function subscribeSqlWorldsCatalog(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Current catalog if already imported; otherwise null. */
export function getSqlWorldsSnapshot(): World[] | null {
  return cached;
}

/**
 * Loads the full SQL course catalog (including interview bank) in one async chunk.
 * Cached after first resolve so Dashboard + Learn SQL share work and avoid duplicate parse.
 */
export function loadSqlWorlds(): Promise<World[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = import('./index').then((m) => {
      cached = m.worlds;
      notifyCatalogReady();
      return cached;
    });
  }
  return inflight;
}
