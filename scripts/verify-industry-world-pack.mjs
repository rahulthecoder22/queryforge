#!/usr/bin/env node
/**
 * Sanity check: each industry_wNN.sql loads and GROUP BY / HAVING row counts
 * match values embedded in industryWorldRowCounts.ts (regex parse).
 *
 *   node scripts/verify-industry-world-pack.mjs
 */
import { readFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dbDir = join(root, 'src/data/databases');
const countsPath = join(root, 'src/data/courses/worlds/industryWorldRowCounts.ts');

function execSql(dbPath, sql) {
  return execFileSync('sqlite3', [dbPath, sql], { encoding: 'utf8' }).trim();
}

const text = readFileSync(countsPath, 'utf8');
let failed = false;

for (let wid = 15; wid <= 30; wid++) {
  const re = new RegExp(`\\b${wid}\\s*:\\s*\\{[^}]*"groupByParties"\\s*:\\s*(\\d+)[^}]*"havingFivePlus"\\s*:\\s*(\\d+)`, 's');
  const m = text.match(re);
  if (!m) {
    console.error(`World ${wid}: could not parse snapshot from industryWorldRowCounts.ts`);
    failed = true;
    continue;
  }
  const expectG = Number(m[1]);
  const expectH = Number(m[2]);

  const sqlFile = join(dbDir, `industry_w${wid}.sql`);
  const tmpDb = join(dbDir, `.verify_${wid}.db`);
  execFileSync('sqlite3', [tmpDb, `.read ${sqlFile}`]);

  const g = Number(
    execSql(tmpDb, `SELECT COUNT(*) FROM (SELECT party_id FROM value_events GROUP BY party_id);`),
  );
  const h = Number(
    execSql(
      tmpDb,
      `SELECT COUNT(*) FROM (SELECT party_id FROM value_events GROUP BY party_id HAVING COUNT(*) >= 5);`,
    ),
  );

  try {
    unlinkSync(tmpDb);
  } catch {
    /* ignore */
  }

  if (g !== expectG || h !== expectH) {
    console.error(`World ${wid}: file has groupBy=${g} having5+=${h}, TS expects ${expectG} ${expectH}`);
    failed = true;
  } else {
    console.log(`World ${wid}: OK`);
  }
}

if (failed) process.exit(1);
console.log('All industry worlds match industryWorldRowCounts.ts');
