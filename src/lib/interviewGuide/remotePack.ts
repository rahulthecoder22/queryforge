import type { InterviewQA, InterviewTopic } from '@/data/interviewGuide/types';

/**
 * Optional remote refresh: set `VITE_INTERVIEW_GUIDE_URL` to a **JSON file you host** (HTTPS, CORS allowed).
 * This is the supported way to ship “latest” content without shipping a new app build.
 *
 * We do **not** scrape third-party interview sites: that typically violates terms of service and copyright.
 * Curate your own JSON, use a licensed API, or paste questions you have rights to use.
 */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isQA(v: unknown): v is InterviewQA {
  if (!isRecord(v)) return false;
  if (typeof v.id !== 'string' || typeof v.question !== 'string' || typeof v.answer !== 'string') return false;
  if (v.tags !== undefined && (!Array.isArray(v.tags) || v.tags.some((t) => typeof t !== 'string'))) return false;
  return true;
}

function isTopic(v: unknown): v is InterviewTopic {
  if (!isRecord(v)) return false;
  if (typeof v.id !== 'string' || typeof v.category !== 'string') return false;
  if (v.description !== undefined && typeof v.description !== 'string') return false;
  if (!Array.isArray(v.items) || !v.items.every(isQA)) return false;
  return true;
}

function isPack(v: unknown): v is { topics: InterviewTopic[] } {
  return isRecord(v) && Array.isArray(v.topics) && v.topics.every(isTopic);
}

export async function fetchOptionalRemoteInterviewTopics(): Promise<InterviewTopic[] | null> {
  const raw = import.meta.env.VITE_INTERVIEW_GUIDE_URL;
  const url = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
  if (!url) return null;

  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!isPack(data)) return null;
    return data.topics;
  } catch {
    return null;
  }
}

/** Merge remote topics into local: matching `topic.id` appends remote items (deduped by `item.id`). */
export function mergeInterviewTopics(local: InterviewTopic[], remote: InterviewTopic[] | null): InterviewTopic[] {
  if (!remote?.length) return local;

  const byId = new Map(local.map((t) => [t.id, { ...t, items: [...t.items] }]));

  for (const rt of remote) {
    const existing = byId.get(rt.id);
    if (existing) {
      const seen = new Set(existing.items.map((i) => i.id));
      for (const item of rt.items) {
        if (!seen.has(item.id)) {
          existing.items.push(item);
          seen.add(item.id);
        }
      }
    } else {
      byId.set(rt.id, { ...rt, items: [...rt.items] });
    }
  }

  return [...byId.values()];
}
