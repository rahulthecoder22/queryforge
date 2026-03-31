#!/usr/bin/env node
/**
 * Cross-industry practice schema (~200 fact rows) for worlds 15–30.
 * Neutral names map to banking / hospital / retail stories in copy only.
 * Run: node scripts/generate-uniform-industry.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '../src/data/databases/uniform_industry.sql');

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(991003);

const segments = ['enterprise', 'smb', 'public', 'partner'];
const channels = ['web', 'phone', 'field', 'partner_portal'];
const kinds = ['invoice', 'credit', 'adjustment', 'subscription'];

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
for (let i = 1; i <= 12; i++) {
  bu.push(`  ('BU-${String(i).padStart(2, '0')}', '${['NA', 'EMEA', 'APAC'][i % 3]}', '${segments[i % 4]}')`);
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
for (let i = 1; i <= 45; i++) {
  parties.push(
    `  (${1 + (i % 12)}, 'Account ${i}', '${['gold', 'silver', 'bronze'][i % 3]}', '202${(i % 4) + 2}-${String((i % 12) + 1).padStart(2, '0')}-15')`,
  );
}
lines.push(parties.join(',\n') + ';\n');

lines.push(`CREATE TABLE value_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL REFERENCES parties(id),
  event_ts TEXT NOT NULL,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount_usd REAL NOT NULL
);

INSERT INTO value_events (party_id, event_ts, channel, kind, amount_usd) VALUES`);
const ev = [];
for (let i = 1; i <= 210; i++) {
  const p = 1 + (i % 45);
  const bias = p === 17 ? 3 : 1; /* party 17 wins top spender */
  const base = Math.round((50 + rng() * 800) * bias);
  const m = 1 + (i % 11);
  const d = 1 + (i % 27);
  ev.push(
    `  (${p}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', '${channels[i % 4]}', '${kinds[i % 4]}', ${base})`,
  );
}
lines.push(ev.join(',\n') + ';\n');

writeFileSync(out, lines.join('\n'), 'utf8');
console.log('Wrote', out, 'events:', ev.length);
