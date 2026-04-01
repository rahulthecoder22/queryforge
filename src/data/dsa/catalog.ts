import type { DsaChallenge, DsaWorld } from './types';

let cached: { worlds: DsaWorld[]; byId: Map<string, DsaChallenge> } | null = null;
let inflight: Promise<{ worlds: DsaWorld[]; byId: Map<string, DsaChallenge> }> | null = null;

export async function loadDsaCatalog(): Promise<{ worlds: DsaWorld[]; byId: Map<string, DsaChallenge> }> {
  if (cached) return cached;
  if (!inflight) {
    inflight = import('./challenges.generated').then((m) => {
      const byId = new Map<string, DsaChallenge>();
      for (const w of m.DSA_WORLDS) {
        for (const c of w.challenges) {
          byId.set(c.id, c);
        }
      }
      const next = { worlds: m.DSA_WORLDS, byId };
      cached = next;
      return next;
    });
  }
  return inflight;
}

export function getNextDsaChallengeId(
  worlds: DsaWorld[],
  currentId: string,
): string | null {
  const flat: DsaChallenge[] = [];
  for (const w of worlds) {
    for (const c of [...w.challenges].sort((a, b) => a.order - b.order)) {
      flat.push(c);
    }
  }
  const i = flat.findIndex((c) => c.id === currentId);
  if (i < 0 || i >= flat.length - 1) return null;
  return flat[i + 1]!.id;
}
