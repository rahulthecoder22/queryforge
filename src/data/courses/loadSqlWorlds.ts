import type { World } from './types';

let cached: World[] | null = null;
let inflight: Promise<World[]> | null = null;

/**
 * Loads the full SQL course catalog (including interview bank) in one async chunk.
 * Cached after first resolve so Dashboard + Learn SQL share work and avoid duplicate parse.
 */
export function loadSqlWorlds(): Promise<World[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = import('./index').then((m) => {
      cached = m.worlds;
      return cached;
    });
  }
  return inflight;
}
