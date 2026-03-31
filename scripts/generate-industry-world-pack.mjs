#!/usr/bin/env node
/**
 * Generates one unique SQL file per industry world (15–30) and
 * src/data/courses/worlds/industryWorldRowCounts.ts with golden row counts.
 *
 * Run: node scripts/generate-industry-world-pack.mjs
 * Requires: sqlite3 on PATH
 */
import { execSync, execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dbDir = join(root, 'src/data/databases');
const countsOut = join(root, 'src/data/courses/worlds/industryWorldRowCounts.ts');

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const segments = ['enterprise', 'smb', 'public', 'partner'];
const channels = ['web', 'phone', 'field', 'partner_portal'];
const kinds = ['invoice', 'credit', 'adjustment', 'subscription'];

function buildSql(worldId) {
  const seed = (worldId * 0x9e3779b9) >>> 0;
  const rng = mulberry32(seed);

  const nBu = 10 + Math.floor(rng() * 5);
  const nParties = 42 + Math.floor(rng() * 11);
  const nEvents = 195 + Math.floor(rng() * 31);
  const winner = 1 + Math.floor(rng() * nParties);

  const lines = [];
  lines.push('PRAGMA foreign_keys = ON;\n');
  lines.push(`CREATE TABLE business_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  segment TEXT NOT NULL
);

INSERT INTO business_units (code, region, segment) VALUES`);
  const bu = [];
  for (let i = 1; i <= nBu; i++) {
    bu.push(
      `  ('BU-${String(i).padStart(2, '0')}', '${['NA', 'EMEA', 'APAC'][i % 3]}', '${segments[i % 4]}')`,
    );
  }
  lines.push(bu.join(',\n') + ';\n');

  lines.push(`CREATE TABLE parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL REFERENCES business_units(id),
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  active_since TEXT NOT NULL
);

INSERT INTO parties (unit_id, display_name, tier, active_since) VALUES`);
  const parties = [];
  for (let i = 1; i <= nParties; i++) {
    parties.push(
      `  (${1 + (i % nBu)}, 'Account ${i}', '${['gold', 'silver', 'bronze'][i % 3]}', '202${(i % 4) + 2}-${String((i % 12) + 1).padStart(2, '0')}-15')`,
    );
  }
  lines.push(parties.join(',\n') + ';\n');

  lines.push(`CREATE TABLE value_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL REFERENCES parties(id),
  event_ts TEXT NOT NULL,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount_usd INTEGER NOT NULL
);

INSERT INTO value_events (party_id, event_ts, channel, kind, amount_usd) VALUES`);

  const ev = [];
  let eid = 0;
  for (let p = 1; p <= nParties; p++) {
    eid++;
    const bias = p === winner ? 4 : 1;
    const base = Math.round((40 + rng() * 120) * bias);
    const m = 1 + (eid % 11);
    const d = 1 + (eid % 27);
    ev.push(
      `  (${p}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', '${channels[eid % 4]}', '${kinds[eid % 4]}', ${base})`,
    );
  }
  for (; eid < nEvents; eid++) {
    const p =
      rng() < 0.35
        ? 1 + Math.floor(rng() * nParties)
        : 1 + (eid % nParties);
    const bias = p === winner ? 3 : 1;
    const base = Math.round((50 + rng() * 850) * bias);
    const m = 1 + (eid % 11);
    const d = 1 + (eid % 27);
    ev.push(
      `  (${p}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', '${channels[eid % 4]}', '${kinds[eid % 4]}', ${base})`,
    );
  }
  lines.push(ev.join(',\n') + ';\n');

  return { sql: lines.join('\n'), nParties, nEvents };
}

const QUERIES = {
  groupByParties: `SELECT COUNT(*) FROM (SELECT party_id FROM value_events GROUP BY party_id);`,
  havingFivePlus: `SELECT COUNT(*) FROM (SELECT party_id FROM value_events GROUP BY party_id HAVING COUNT(*) >= 5);`,
};

function sqliteScalar(dbPath, sql) {
  const out = execFileSync('sqlite3', [dbPath, sql], { encoding: 'utf8' }).trim();
  const n = Number(out);
  if (Number.isNaN(n)) throw new Error(`Bad sqlite output: ${out} for ${sql}`);
  return n;
}

const record = {};

for (let wid = 15; wid <= 30; wid++) {
  const { sql, nParties, nEvents } = buildSql(wid);
  const fileName = `industry_w${wid}.sql`;
  const filePath = join(dbDir, fileName);
  writeFileSync(filePath, sql, 'utf8');

  const tmpDb = join(dbDir, `.tmp_verify_${wid}.db`);
  execFileSync('sqlite3', [tmpDb, `.read ${filePath}`]);
  const groupByParties = sqliteScalar(tmpDb, QUERIES.groupByParties);
  const havingFivePlus = sqliteScalar(tmpDb, QUERIES.havingFivePlus);
  try {
    unlinkSync(tmpDb);
  } catch {
    /* ignore */
  }

  if (groupByParties !== nParties) {
    console.warn(`World ${wid}: GROUP BY count ${groupByParties} != parties ${nParties}`);
  }

  record[wid] = { nParties, nEvents, groupByParties, havingFivePlus };
  console.log(`Wrote ${fileName} parties=${nParties} events=${nEvents} having5+=${havingFivePlus}`);
}

const body = Object.entries(record)
  .map(([k, v]) => `  ${k}: ${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')},`)
  .join('\n');

const ts = `/** Auto-generated by scripts/generate-industry-world-pack.mjs — re-run script after changing generator logic. */

export type IndustryWorldRowSnapshot = {
  nParties: number;
  nEvents: number;
  groupByParties: number;
  havingFivePlus: number;
};

export const industryWorldRowCounts: Record<number, IndustryWorldRowSnapshot> = {
${body}
};
`;

writeFileSync(countsOut, ts, 'utf8');
console.log('Wrote', countsOut);
