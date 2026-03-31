import { describe, expect, it } from 'vitest';
import { compareResults } from './queryDiffEngine';
import type { QueryResult } from '@/types/queryforge';

function q(
  columns: string[],
  rows: unknown[][],
  extra: Partial<QueryResult> = {},
): QueryResult {
  return {
    columns,
    rows,
    rowCount: rows.length,
    executionTimeMs: 1,
    type: 'SELECT',
    ...extra,
  };
}

describe('compareResults', () => {
  it('detects identical results', () => {
    const a = q(['x'], [[1], [2]]);
    const b = q(['x'], [[1], [2]]);
    const v = compareResults(a, b, true);
    expect(v.isCorrect).toBe(true);
    expect(v.resultMatch).toBe('exact');
  });

  it('allows order-insensitive match', () => {
    const user = q(['a'], [[2], [1]]);
    const exp = q(['a'], [[1], [2]]);
    const v = compareResults(user, exp, false);
    expect(v.isCorrect).toBe(true);
  });
});
