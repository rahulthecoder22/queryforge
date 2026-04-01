export type DsaRunResult =
  | { ok: true }
  | { ok: false; phase: 'compile' | 'runtime' | 'assert'; message: string; testIndex?: number; expected?: unknown; received?: unknown };

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b) ? true : a === b;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a as object).sort();
    const bk = Object.keys(b as object).sort();
    if (ak.length !== bk.length) return false;
    for (let i = 0; i < ak.length; i++) {
      if (ak[i] !== bk[i]) return false;
    }
    for (const k of ak) {
      if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}

/**
 * Runs user JavaScript that must define `functionName` globally.
 * Educational use only — do not pass untrusted code in production systems.
 */
export function runDsaUserCode(
  userCode: string,
  functionName: string,
  testCases: { args: unknown[]; expected: unknown }[],
): DsaRunResult {
  const trimmed = userCode.trim();
  if (!trimmed) {
    return { ok: false, phase: 'compile', message: 'Write some code first.' };
  }

  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function(
      `"use strict";\n${trimmed}\nif (typeof ${functionName} !== "function") {\n  throw new Error("Define a function named ${functionName}");\n}\nreturn ${functionName};\n`,
    )() as (...args: unknown[]) => unknown;
  } catch (e) {
    return {
      ok: false,
      phase: 'compile',
      message: e instanceof Error ? e.message : String(e),
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const t = testCases[i]!;
    let received: unknown;
    try {
      received = fn(...t.args);
    } catch (e) {
      return {
        ok: false,
        phase: 'runtime',
        message: e instanceof Error ? e.message : String(e),
        testIndex: i,
      };
    }
    if (!deepEqual(received, t.expected)) {
      return {
        ok: false,
        phase: 'assert',
        message: 'Output does not match expected result for this test.',
        testIndex: i,
        expected: t.expected,
        received,
      };
    }
  }

  return { ok: true };
}
