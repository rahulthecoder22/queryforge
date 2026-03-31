import { getMongoCollection, type MongoCollectionId } from '@/data/documentSamples';
import { filterDocuments } from '@/lib/mongoLite';

export function parseMongoFilter(
  text: string,
): { ok: true; q: Record<string, unknown> } | { ok: false; error: string } {
  try {
    const v = JSON.parse(text) as unknown;
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      return { ok: false, error: 'Filter must be a single JSON object.' };
    }
    return { ok: true, q: v as Record<string, unknown> };
  } catch {
    return { ok: false, error: 'Invalid JSON — check brackets and commas.' };
  }
}

function sortedIds(docs: Record<string, unknown>[]): string {
  return docs
    .map((d) => String(d._id))
    .sort()
    .join(',');
}

export function compareMongoFilters(
  userText: string,
  expectedText: string,
  collection: MongoCollectionId,
): { ok: boolean; feedback: string } {
  const docs = getMongoCollection(collection);
  const u = parseMongoFilter(userText);
  const e = parseMongoFilter(expectedText);
  if (!u.ok) return { ok: false, feedback: u.error };
  if (!e.ok) return { ok: false, feedback: 'Invalid expected filter (internal).' };
  const ur = filterDocuments(docs, u.q);
  const er = filterDocuments(docs, e.q);
  const ui = sortedIds(ur);
  const ei = sortedIds(er);
  if (ui === ei) {
    return { ok: true, feedback: `Correct — ${er.length} matching document(s).` };
  }
  return {
    ok: false,
    feedback: `Your filter matched ${ur.length} doc(s); expected ${er.length}. Tip: compare _id values (${ui || '∅'} vs ${ei || '∅'}).`,
  };
}
