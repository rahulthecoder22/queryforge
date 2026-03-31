/**
 * Tiny MongoDB-style filter matcher for education (no server).
 * Supports: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists, $and, $or, nested fields via dot paths.
 */

function getNested(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function matchesOp(value: unknown, op: string, operand: unknown): boolean {
  switch (op) {
    case '$eq':
      return value === operand;
    case '$ne':
      return value !== operand;
    case '$gt':
      return typeof value === 'number' && typeof operand === 'number' && value > operand;
    case '$gte':
      return typeof value === 'number' && typeof operand === 'number' && value >= operand;
    case '$lt':
      return typeof value === 'number' && typeof operand === 'number' && value < operand;
    case '$lte':
      return typeof value === 'number' && typeof operand === 'number' && value <= operand;
    case '$in':
      if (!Array.isArray(operand)) return false;
      if (Array.isArray(value)) return value.some((v) => operand.includes(v));
      return operand.includes(value);
    case '$nin':
      if (!Array.isArray(operand)) return false;
      if (Array.isArray(value)) return !value.some((v) => operand.includes(v));
      return !operand.includes(value);
    case '$exists':
      return operand === true ? value !== undefined : value === undefined;
    case '$elemMatch':
      if (operand === null || typeof operand !== 'object' || Array.isArray(operand)) return false;
      if (!Array.isArray(value)) return false;
      return value.some(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          matchesMongoFilter(item as Record<string, unknown>, operand as Record<string, unknown>),
      );
    default:
      return false;
  }
}

function matchesCondition(value: unknown, cond: unknown): boolean {
  if (cond === null || typeof cond !== 'object' || Array.isArray(cond)) {
    return value === cond;
  }
  const c = cond as Record<string, unknown>;
  const keys = Object.keys(c);
  const allOps = keys.every((k) => k.startsWith('$'));
  if (allOps && keys.length > 0) {
    return keys.every((k) => matchesOp(value, k, c[k]));
  }
  if (typeof value !== 'object' || value === null) return false;
  return matchesMongoFilter(value as Record<string, unknown>, c);
}

export function matchesMongoFilter(doc: Record<string, unknown>, query: Record<string, unknown>): boolean {
  for (const [key, raw] of Object.entries(query)) {
    if (key === '$and') {
      const arr = raw;
      if (!Array.isArray(arr) || !arr.every((q) => typeof q === 'object' && q !== null)) return false;
      if (!arr.every((q) => matchesMongoFilter(doc, q as Record<string, unknown>))) return false;
      continue;
    }
    if (key === '$or') {
      const arr = raw;
      if (!Array.isArray(arr) || !arr.every((q) => typeof q === 'object' && q !== null)) return false;
      if (!arr.some((q) => matchesMongoFilter(doc, q as Record<string, unknown>))) return false;
      continue;
    }
    const v = getNested(doc, key);
    if (!matchesCondition(v, raw)) return false;
  }
  return true;
}

export function filterDocuments(
  docs: Record<string, unknown>[],
  query: Record<string, unknown>,
): Record<string, unknown>[] {
  if (Object.keys(query).length === 0) return [...docs];
  return docs.filter((d) => matchesMongoFilter(d, query));
}
