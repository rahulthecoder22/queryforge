import type { QueryResult } from '@/types/queryforge';

export interface ValidationFeedback {
  type: 'success' | 'error' | 'warning' | 'hint';
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  isCorrect: boolean;
  score: number;
  feedback: ValidationFeedback[];
  executionTimeMs: number;
  resultMatch: 'exact' | 'equivalent' | 'partial' | 'wrong';
}

function normalizeCell(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return String(v).trim();
}

function sortRows(
  columns: string[],
  rows: unknown[][],
): { key: string; row: unknown[] }[] {
  return rows.map((row) => ({
    key: columns.map((_, i) => normalizeCell(row[i])).join('\t'),
    row,
  }));
}

/** Compare two result sets for learning challenges */
export function compareResults(
  user: QueryResult,
  expected: QueryResult,
  orderSensitive: boolean,
  expectedColumns?: string[],
  expectedRowCount?: number,
): ValidationResult {
  const feedback: ValidationFeedback[] = [];
  let score = 0;
  let resultMatch: ValidationResult['resultMatch'] = 'wrong';

  if (user.error) {
    return {
      isCorrect: false,
      score: 0,
      feedback: [{ type: 'error', message: user.error }],
      executionTimeMs: user.executionTimeMs,
      resultMatch: 'wrong',
    };
  }

  if (expected.error) {
    return {
      isCorrect: false,
      score: 0,
      feedback: [
        { type: 'error', message: 'Reference query failed to run. Report this level.' },
      ],
      executionTimeMs: user.executionTimeMs,
      resultMatch: 'wrong',
    };
  }

  if (expectedColumns?.length) {
    const set = new Set(user.columns.map((c) => c.toLowerCase()));
    const missing = expectedColumns.filter((c) => !set.has(c.toLowerCase()));
    if (missing.length) {
      feedback.push({
        type: 'warning',
        message: `Expected columns missing or renamed: ${missing.join(', ')}. Check aliases match.`,
      });
    }
  }

  if (expectedRowCount != null && user.rowCount !== expectedRowCount) {
    feedback.push({
      type: 'hint',
      message: `Your query returned ${user.rowCount} rows; expected ${expectedRowCount}.`,
    });
  }

  const uCols = user.columns.map((c) => c.toLowerCase());
  const eCols = expected.columns.map((c) => c.toLowerCase());
  if (uCols.length !== eCols.length) {
    feedback.push({
      type: 'error',
      message: `Column count differs (yours: ${uCols.length}, expected: ${eCols.length}).`,
    });
    return {
      isCorrect: false,
      score: 20,
      feedback,
      executionTimeMs: user.executionTimeMs,
      resultMatch: 'partial',
    };
  }

  const colMatch = uCols.every((c, i) => c === eCols[i]);
  if (!colMatch && expectedColumns) {
    feedback.push({
      type: 'hint',
      message: 'Column names or order may differ from the expected answer.',
    });
  }

  let userRows = user.rows;
  let expRows = expected.rows;

  if (!orderSensitive) {
    const us = sortRows(user.columns, user.rows).sort((a, b) => a.key.localeCompare(b.key));
    const es = sortRows(expected.columns, expected.rows).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
    userRows = us.map((x) => x.row);
    expRows = es.map((x) => x.row);
  }

  if (userRows.length !== expRows.length) {
    feedback.push({
      type: 'error',
      message: `Row count mismatch: got ${userRows.length}, expected ${expRows.length}.`,
    });
    return {
      isCorrect: false,
      score: 40,
      feedback,
      executionTimeMs: user.executionTimeMs,
      resultMatch: 'partial',
    };
  }

  let matches = 0;
  const totalCells = userRows.length * user.columns.length;
  for (let r = 0; r < userRows.length; r++) {
    const ur = userRows[r]!;
    const er = expRows[r]!;
    for (let c = 0; c < ur.length; c++) {
      if (normalizeCell(ur[c]) === normalizeCell(er[c])) matches++;
    }
  }

  const ratio = totalCells ? matches / totalCells : 1;
  score = Math.round(ratio * 100);
  if (ratio >= 0.99) {
    resultMatch = orderSensitive ? 'exact' : 'equivalent';
    feedback.push({ type: 'success', message: 'Results match the expected answer.' });
    return {
      isCorrect: true,
      score: 100,
      feedback,
      executionTimeMs: user.executionTimeMs,
      resultMatch,
    };
  }

  if (ratio >= 0.5) {
    resultMatch = 'partial';
    feedback.push({
      type: 'hint',
      message: 'Some values differ. Re-read filters, JOINs, or sorting.',
    });
  }

  return {
    isCorrect: false,
    score,
    feedback,
    executionTimeMs: user.executionTimeMs,
    resultMatch,
  };
}
