/**
 * Pre-processes MySQL-flavored SQL for SQLite execution and registers
 * helper functions on a sql.js Database instance.
 */

import type { Database } from 'sql.js';

type DbWithFns = Database & {
  create_function: (name: string, fn: (...args: unknown[]) => unknown) => void;
};

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function parseSqlDate(input: string | null | undefined): Date | null {
  if (input == null || input === '') return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mysqlDateFormat(dateStr: string, format: string): string {
  const d = parseSqlDate(dateStr);
  if (!d) return '';
  const map: Record<string, string> = {
    '%Y': String(d.getFullYear()),
    '%y': String(d.getFullYear()).slice(-2),
    '%m': pad2(d.getMonth() + 1),
    '%d': pad2(d.getDate()),
    '%H': pad2(d.getHours()),
    '%i': pad2(d.getMinutes()),
    '%s': pad2(d.getSeconds()),
    '%M': d.toLocaleString('en', { month: 'long' }),
    '%b': d.toLocaleString('en', { month: 'short' }),
    '%W': d.toLocaleString('en', { weekday: 'long' }),
    '%w': String(d.getDay()),
  };
  let out = format;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

function dateDiffDays(d1: string, d2: string): number {
  const a = parseSqlDate(d1);
  const b = parseSqlDate(d2);
  if (!a || !b) return 0;
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function lastDayOfMonth(dateStr: string): string {
  const d = parseSqlDate(dateStr);
  if (!d) return '';
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

export function registerMySQLFunctions(db: Database): void {
  const d = db as DbWithFns;
  const create = (name: string, _argc: number, fn: (...args: unknown[]) => unknown) => {
    d.create_function(name, (...args: unknown[]) => {
      try {
        const r = fn(...args);
        return r as string | number | null;
      } catch {
        return null;
      }
    });
  };

  create('NOW', 0, () =>
    new Date().toISOString().replace('T', ' ').substring(0, 19),
  );
  create('CURDATE', 0, () => new Date().toISOString().substring(0, 10));
  create('CURTIME', 0, () => new Date().toISOString().substring(11, 19));

  create('IFNULL', 2, (a, b) => (a == null ? b : a));
  create('IF', 3, (cond, y, n) => (cond ? y : n));
  create('NULLIF', 2, (a, b) => (a === b ? null : a));

  create('CONCAT_WS', -1, (sep: unknown, ...rest: unknown[]) => {
    const s = String(sep ?? '');
    return rest.filter((x) => x != null && x !== '').map(String).join(s);
  });

  create('LEFT', 2, (str: unknown, n: unknown) =>
    String(str ?? '').substring(0, Number(n)),
  );
  create('RIGHT', 2, (str: unknown, n: unknown) => {
    const t = String(str ?? '');
    const k = Number(n);
    return t.substring(Math.max(0, t.length - k));
  });
  create('LPAD', 3, (str: unknown, len: unknown, pad: unknown) =>
    String(str ?? '').padStart(Number(len), String(pad ?? ' ')),
  );
  create('RPAD', 3, (str: unknown, len: unknown, pad: unknown) =>
    String(str ?? '').padEnd(Number(len), String(pad ?? ' ')),
  );
  create('LOCATE', 2, (sub: unknown, str: unknown) => {
    const i = String(str ?? '').indexOf(String(sub ?? ''));
    return i < 0 ? 0 : i + 1;
  });
  create('FIELD', -1, (val: unknown, ...list: unknown[]) => {
    const v = String(val ?? '');
    const idx = list.map(String).indexOf(v);
    return idx < 0 ? 0 : idx + 1;
  });
  create('REVERSE', 1, (str: unknown) =>
    String(str ?? '')
      .split('')
      .reverse()
      .join(''),
  );

  create('DATE_FORMAT', 2, (d: unknown, f: unknown) =>
    mysqlDateFormat(String(d ?? ''), String(f ?? '')),
  );
  create('DATEDIFF', 2, (a: unknown, b: unknown) =>
    dateDiffDays(String(a ?? ''), String(b ?? '')),
  );
  create('YEAR', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.getFullYear() : null;
  });
  create('MONTH', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.getMonth() + 1 : null;
  });
  create('DAY', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.getDate() : null;
  });
  create('DAYNAME', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.toLocaleDateString('en', { weekday: 'long' }) : '';
  });
  create('MONTHNAME', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.toLocaleDateString('en', { month: 'long' }) : '';
  });
  create('WEEKDAY', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? dt.getDay() : null;
  });
  create('QUARTER', 1, (d: unknown) => {
    const dt = parseSqlDate(String(d ?? ''));
    return dt ? Math.ceil((dt.getMonth() + 1) / 3) : null;
  });
  create('LAST_DAY', 1, (d: unknown) => lastDayOfMonth(String(d ?? '')));

  create('TRUNCATE', 2, (n: unknown, d: unknown) => {
    const x = Number(n);
    const dec = Number(d);
    const f = 10 ** dec;
    return Math.trunc(x * f) / f;
  });
  create('RAND', 0, () => Math.random());
  create('MOD', 2, (a: unknown, b: unknown) => Number(a) % Number(b));
  create('CEIL', 1, (n: unknown) => Math.ceil(Number(n)));
  create('FLOOR', 1, (n: unknown) => Math.floor(Number(n)));
  create('POWER', 2, (a: unknown, b: unknown) => Number(a) ** Number(b));
  create('SQRT', 1, (n: unknown) => Math.sqrt(Number(n)));
  create('LOG', 1, (n: unknown) => Math.log(Number(n)));
  create('LOG2', 1, (n: unknown) => Math.log2(Number(n)));
  create('LOG10', 1, (n: unknown) => Math.log10(Number(n)));
  create('SIGN', 1, (n: unknown) => Math.sign(Number(n)));
}

/** Strip line comments and simplify for keyword detection */
function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, ' ');
}

function trimStatement(sql: string): string {
  return sql.trim().replace(/;+\s*$/, '').trim();
}

/**
 * MySQL → SQLite surface syntax. Best-effort; complex DDL may still need manual fixes.
 */
export function translateMySQLToSQLite(raw: string): string {
  let sql = raw.trim();
  if (!sql) return sql;

  const upper = stripComments(sql).toUpperCase();
  const t = trimStatement(sql);

  // SHOW TABLES
  if (/^SHOW\s+TABLES/i.test(t)) {
    return `SELECT name AS Tables_in_database FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`;
  }

  // SHOW CREATE TABLE `x` / SHOW CREATE TABLE x
  const showCreate = t.match(/^SHOW\s+CREATE\s+TABLE\s+`?([\w]+)`?/i);
  if (showCreate) {
    const tbl = showCreate[1];
    return `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tbl.replace(/'/g, "''")}'`;
  }

  // DESCRIBE / DESC table
  const describe = t.match(/^(?:DESCRIBE|DESC)\s+`?([\w]+)`?/i);
  if (describe) {
    return `PRAGMA table_info('${describe[1].replace(/'/g, "''")}')`;
  }

  // Backticks → double-quotes for SQLite identifiers
  sql = sql.replace(/`([^`]+)`/g, '"$1"');

  // LIMIT offset, count → LIMIT count OFFSET offset
  sql = sql.replace(
    /\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/gi,
    'LIMIT $2 OFFSET $1',
  );

  // Common DDL sugar
  sql = sql.replace(/\bAUTO_INCREMENT\b/gi, 'AUTOINCREMENT');
  sql = sql.replace(/\bENGINE\s*=\s*InnoDB\b/gi, '');
  sql = sql.replace(/\bENGINE\s*=\s*\w+\b/gi, '');
  sql = sql.replace(/\bDEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
  sql = sql.replace(/\bCOLLATE\s+\w+/gi, '');
  sql = sql.replace(/\bUNSIGNED\b/gi, '');
  sql = sql.replace(/\bINT\s*\(\s*\d+\s*\)/gi, 'INTEGER');
  sql = sql.replace(/\bBOOLEAN\b/gi, 'INTEGER');
  sql = sql.replace(/\bDOUBLE\b/gi, 'REAL');
  sql = sql.replace(/\bFLOAT\b/gi, 'REAL');

  // RIGHT JOIN → swap (SQLite has no RIGHT JOIN)
  if (/\bRIGHT\s+JOIN\b/i.test(sql)) {
    // Minimal swap: FROM A RIGHT JOIN B → FROM B LEFT JOIN A (fragile; good for teaching demos)
    sql = sql.replace(
      /\bFROM\s+(\S+)\s+(\w+)\s+RIGHT\s+JOIN\s+(\S+)\s+(\w+)\s+ON\b/gi,
      'FROM $3 $4 LEFT JOIN $1 $2 ON',
    );
  }

  // FULL OUTER JOIN → documented limitation: leave for advanced parser; replace with UNION pattern is unsafe generically
  if (/\bFULL\s+(?:OUTER\s+)?JOIN\b/i.test(upper)) {
    throw new Error(
      'FULL OUTER JOIN is not supported in SQLite. Rewrite using LEFT JOIN UNION ALL or two LEFT JOINs.',
    );
  }

  return sql;
}

export function friendlySqlError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("near \"form\"") || m.includes("syntax error near \"form\"")) {
    return "Did you mean FROM? SQL uses FROM to specify which table to read.";
  }
  if (m.includes('no such column')) {
    return message.replace(/^Error:?\s*/i, 'Column problem: ');
  }
  if (m.includes('no such table')) {
    return message.replace(/^Error:?\s*/i, 'Unknown table: ');
  }
  return message;
}
