#!/usr/bin/env node
/**
 * Regenerates src/data/databases/mountain_lodge.sql with ~200+ realistic rows.
 * Run: node scripts/generate-mountain-lodge.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '../src/data/databases/mountain_lodge.sql');

const firstNames = [
  'Alex',
  'Blake',
  'Casey',
  'Drew',
  'Ellis',
  'Finley',
  'Gray',
  'Harper',
  'Indigo',
  'Jordan',
  'Kai',
  'Logan',
  'Morgan',
  'Noel',
  'Oakley',
  'Parker',
  'Quinn',
  'Reese',
  'Sage',
  'Taylor',
];
const lastNames = [
  'Ash',
  'Brook',
  'Cedar',
  'Dale',
  'Elm',
  'Frost',
  'Glen',
  'Hill',
  'Iris',
  'Knoll',
  'Lake',
  'Marsh',
  'North',
  'Pine',
  'Quarry',
  'Ridge',
  'Stone',
  'Trail',
  'Vale',
  'Wood',
];
const menuPool = [
  ['Trout', 'Entree', 28],
  ['Elk steak', 'Entree', 42],
  ['Burger', 'Entree', 16],
  ['Salad', 'Starter', 9],
  ['Soup', 'Starter', 11],
  ['Hot cocoa', 'Drink', 4],
  ['Fondue', 'Entree', 34],
  ['Charcuterie', 'Starter', 22],
  ['Pasta', 'Entree', 21],
  ['Omelette', 'Entree', 14],
  ['Pancakes', 'Entree', 12],
  ['Latte', 'Drink', 5],
  ['Wine flight', 'Drink', 18],
  ['Cheesecake', 'Dessert', 10],
  ['Sorbet', 'Dessert', 7],
];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260330);

const lines = [];
lines.push('PRAGMA foreign_keys = ON;\n');

// 36 rooms
lines.push(`CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT UNIQUE NOT NULL,
  beds INTEGER NOT NULL,
  rate_per_night REAL NOT NULL
);

INSERT INTO rooms (room_number, beds, rate_per_night) VALUES`);
const roomRows = [];
for (let f = 1; f <= 4; f++) {
  for (let n = 1; n <= 9; n++) {
    const num = `${f}0${n}`;
    const beds = [2, 2, 4, 2, 6][n % 5];
    const rate = Math.round(160 + rng() * 220 + beds * 12);
    roomRows.push(`  ('${num}', ${beds}, ${rate})`);
  }
}
lines.push(roomRows.join(',\n') + ';\n');

// 48 guests
lines.push(`CREATE TABLE guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

INSERT INTO guests (first_name, last_name, email) VALUES`);
const guestRows = [];
for (let i = 0; i < 48; i++) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[Math.floor(i / 2) % lastNames.length];
  const email = `guest${i + 1}@lodge.example`;
  guestRows.push(`  ('${fn}', '${ln}', '${email}')`);
}
lines.push(guestRows.join(',\n') + ';\n');

// ~95 bookings (enough variance for aggregates)
lines.push(`CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  total_amount REAL NOT NULL
);

INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount) VALUES`);
const bookRows = [];
let bid = 0;
for (let g = 1; g <= 48; g++) {
  const stays = g % 7 === 0 ? 4 : g % 5 === 0 ? 3 : 2;
  for (let s = 0; s < stays; s++) {
    bid++;
    const room = 1 + ((g * 3 + s * 5) % 36);
    const m = 1 + (bid % 12);
    const d = 1 + (bid % 20);
    const nights = 2 + (bid % 5);
    const amt = Math.round(180 * nights + rng() * 400 + (g % 11) * 35);
    const coD = d + nights;
    bookRows.push(`  (${g}, ${room}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', '2025-${String(m).padStart(2, '0')}-${String(Math.min(coD, 28)).padStart(2, '0')}', ${amt})`);
  }
}
lines.push(bookRows.join(',\n') + ';\n');

// 24 menu items
lines.push(`CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

INSERT INTO menu_items (name, category, price) VALUES`);
const menuRows = [];
for (let i = 0; i < 24; i++) {
  const [n, c, p] = menuPool[i % menuPool.length];
  menuRows.push(`  ('${n}', '${c}', ${p + (i % 5) * 0.5})`);
}
lines.push(menuRows.join(',\n') + ';\n');

// 40 orders
lines.push(`CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  order_date TEXT NOT NULL
);

INSERT INTO orders (guest_id, order_date) VALUES`);
const ordRows = [];
for (let i = 0; i < 40; i++) {
  const g = 1 + (i % 48);
  const m = 1 + (i % 12);
  const d = 1 + (i % 25);
  ordRows.push(`  (${g}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}')`);
}
lines.push(ordRows.join(',\n') + ';\n');

// ~130 order line rows
lines.push(`CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  qty INTEGER NOT NULL
);

INSERT INTO order_items (order_id, menu_item_id, qty) VALUES`);
const oiRows = [];
let oi = 0;
for (let o = 1; o <= 40; o++) {
  const linesPer = 2 + (o % 4);
  for (let l = 0; l < linesPer; l++) {
    oi++;
    const mi = 1 + ((o * 2 + l * 3) % 24);
    const q = 1 + (oi % 4);
    oiRows.push(`  (${o}, ${mi}, ${q})`);
  }
}
lines.push(oiRows.join(',\n') + ';\n');

writeFileSync(out, lines.join('\n'), 'utf8');
console.log('Wrote', out, 'rows: rooms 36 guests 48 bookings', bookRows.length, 'menu', menuRows.length, 'orders', ordRows.length, 'lines', oiRows.length);
