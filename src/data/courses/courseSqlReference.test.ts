import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { world13 } from './worlds/world13';
import { world14 } from './worlds/world14';
import { world31WindowLab } from './worlds/world31WindowLab';

const coursesDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(coursesDir, '../../..');
const dbDir = join(coursesDir, '../databases');

function drainQuery(db: Database, sql: string): void {
  const stmt = db.prepare(sql);
  try {
    while (stmt.step()) {
      /* exhaust */
    }
  } finally {
    stmt.free();
  }
}

function assertWorld(db: Database, label: string, levels: { id: string; expectedQuery: string }[]) {
  for (const l of levels) {
    expect(
      () => drainQuery(db, l.expectedQuery),
      `${label} ${l.id}`,
    ).not.toThrow();
  }
}

describe('course reference SQL vs bundled databases', () => {
  it('executes every expectedQuery for Summit (13–14) and Window lab (31)', async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => join(repoRoot, 'node_modules/sql.js/dist', file),
    });

    const summit = new SQL.Database();
    summit.run(readFileSync(join(dbDir, 'sql_summit.sql'), 'utf8'));
    assertWorld(summit, 'world13', world13.levels);
    assertWorld(summit, 'world14', world14.levels);

    const lab = new SQL.Database();
    lab.run(readFileSync(join(dbDir, 'sql_analytics_lab.sql'), 'utf8'));
    assertWorld(lab, 'world31', world31WindowLab.levels);
  });
});
