#!/usr/bin/env node
/**
 * Load sql_summit.sql and run every embedded expectedQuery from world13 + world14.
 *   node scripts/verify-summit-levels.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sqlPath = join(root, 'src/data/databases/sql_summit.sql');
const w13 = readFileSync(join(root, 'src/data/courses/worlds/world13.ts'), 'utf8');
const w14 = readFileSync(join(root, 'src/data/courses/worlds/world14.ts'), 'utf8');

function extractExpectedQueries(ts) {
  const out = [];
  let idx = 0;
  const key = 'expectedQuery:';
  while (true) {
    const start = ts.indexOf(key, idx);
    if (start === -1) break;
    let pos = start + key.length;
    while (pos < ts.length && /\s/.test(ts[pos])) pos++;
    if (ts[pos] === '`') {
      pos++;
      const end = ts.indexOf('`', pos);
      if (end === -1) break;
      out.push(ts.slice(pos, end));
      idx = end + 1;
      continue;
    }
    if (ts[pos] === "'" || ts[pos] === '"') {
      const q = ts[pos];
      pos++;
      let s = '';
      while (pos < ts.length) {
        const c = ts[pos];
        if (c === '\\') {
          s += ts[pos + 1] ?? '';
          pos += 2;
          continue;
        }
        if (c === q) {
          pos++;
          break;
        }
        s += c;
        pos++;
      }
      out.push(s);
      idx = pos;
      continue;
    }
    idx = pos + 1;
  }
  return out;
}

const queries = [...extractExpectedQueries(w13), ...extractExpectedQueries(w14)];

const SQL = await initSqlJs({
  locateFile: (f) => join(root, 'node_modules/sql.js/dist', f),
});
const db = new SQL.Database();
db.run(readFileSync(sqlPath, 'utf8'));

let failed = false;
queries.forEach((q, i) => {
  try {
    const stmt = db.prepare(q);
    const cols = stmt.getColumnNames();
    const rows = [];
    while (stmt.step()) rows.push(stmt.get());
    stmt.free();
    console.log(`[${i + 1}/${queries.length}] rows=${rows.length} cols=${cols.join(',')}`);
    if (rows.length <= 3) console.log(JSON.stringify(rows));
  } catch (e) {
    console.error(`[${i + 1}] FAIL: ${e.message}\n---\n${q}\n---`);
    failed = true;
  }
});

if (failed) process.exit(1);
console.log('All summit reference queries OK.');
