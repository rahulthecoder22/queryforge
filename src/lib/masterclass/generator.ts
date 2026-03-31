/**
 * Deterministic masterclass SQLite datasets: 20 domains × 4 tables × 200 rows.
 * Batched INSERTs stay under typical SQLite host parameter limits (~999).
 */

export type MasterclassSchemaMeta = {
  id: string;
  title: string;
  description: string;
  suggestedQuery: string;
};

const ROWS = 200;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function esc(v: string | number | null): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') {
    return Number.isFinite(v) ? String(v) : 'NULL';
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

type Row = (string | number | null)[];

function insertBatches(table: string, cols: string[], rows: Row[], maxParams = 900): string[] {
  if (cols.length === 0) return [];
  const perBatch = Math.max(1, Math.floor(maxParams / cols.length));
  const chunks: string[] = [];
  const quotedCols = cols.map((c) => `"${c}"`);
  for (let i = 0; i < rows.length; i += perBatch) {
    const slice = rows.slice(i, i + perBatch);
    const tuples = slice.map((r) => `(${r.map(esc).join(',')})`).join(',\n');
    chunks.push(`INSERT INTO "${table}" (${quotedCols.join(',')}) VALUES ${tuples};`);
  }
  return chunks;
}

type TableSpec = {
  name: string;
  cols: string[];
  rows: Row[];
};

type SchemaSpec = MasterclassSchemaMeta & {
  seed: number;
  tables: [string, string, string, string];
};

function buildTables(spec: SchemaSpec): TableSpec[] {
  const [n1, n2, n3, n4] = spec.tables;
  const p = spec.id;
  const t1 = `${p}_${n1}`;
  const t2 = `${p}_${n2}`;
  const t3 = `${p}_${n3}`;
  const t4 = `${p}_${n4}`;
  const rnd = mulberry32(spec.seed);

  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!;
  const ri = (min: number, max: number) =>
    min + Math.floor(rnd() * (max - min + 1));
  const price = () => Math.round((5 + rnd() * 495) * 100) / 100;

  const r1: Row[] = [];
  for (let i = 1; i <= ROWS; i++) {
    r1.push([i, `${spec.id.slice(3).toUpperCase()}-${String(i).padStart(3, '0')}`, `${n1} ${i}`]);
  }

  const r2: Row[] = [];
  for (let i = 1; i <= ROWS; i++) {
    r2.push([
      i,
      `${n2} ${i}`,
      `u${i}_${spec.seed}@lab.queryforge`,
      ri(1, ROWS),
      pick(['A', 'B', 'C', 'D']),
    ]);
  }

  const r3: Row[] = [];
  for (let i = 1; i <= ROWS; i++) {
    r3.push([i, `SKU-${String(i).padStart(4, '0')}`, pick(['std', 'pro', 'eco', 'plus']), price()]);
  }

  const r4: Row[] = [];
  for (let i = 1; i <= ROWS; i++) {
    const d = new Date(2024, 0, 1 + (i % 320));
    const iso = d.toISOString().slice(0, 10);
    r4.push([
      i,
      ri(1, ROWS),
      ri(1, ROWS),
      ri(1, 12),
      iso,
      pick(['open', 'done', 'hold', 'void']),
    ]);
  }

  return [
    { name: t1, cols: ['id', 'code', 'label'], rows: r1 },
    { name: t2, cols: ['id', 'name', 'email', 'parent_id', 'segment'], rows: r2 },
    { name: t3, cols: ['id', 'sku', 'category', 'unit_price'], rows: r3 },
    {
      name: t4,
      cols: ['id', 'ref_a_id', 'ref_b_id', 'qty', 'event_date', 'status'],
      rows: r4,
    },
  ];
}

function ddlFor(spec: SchemaSpec): string {
  const [n1, n2, n3, n4] = spec.tables;
  const p = spec.id;
  const t1 = `${p}_${n1}`;
  const t2 = `${p}_${n2}`;
  const t3 = `${p}_${n3}`;
  const t4 = `${p}_${n4}`;
  const ix = (suffix: string) => `idx_${p.replace(/[^a-z0-9]/gi, '_')}_${suffix}`.slice(0, 60);

  return `
PRAGMA foreign_keys=ON;
CREATE TABLE "${t1}" (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL,
  label TEXT NOT NULL
);
CREATE TABLE "${t2}" (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  parent_id INTEGER NOT NULL REFERENCES "${t1}"(id),
  segment TEXT NOT NULL
);
CREATE TABLE "${t3}" (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price REAL NOT NULL
);
CREATE TABLE "${t4}" (
  id INTEGER PRIMARY KEY,
  ref_a_id INTEGER NOT NULL REFERENCES "${t2}"(id),
  ref_b_id INTEGER NOT NULL REFERENCES "${t3}"(id),
  qty INTEGER NOT NULL,
  event_date TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE INDEX "${ix('a')}" ON "${t4}"(ref_a_id);
CREATE INDEX "${ix('b')}" ON "${t4}"(ref_b_id);
CREATE INDEX "${ix('d')}" ON "${t4}"(event_date);
`.trim();
}

export const MASTERCLASS_SCHEMAS: SchemaSpec[] = [
  {
    id: 'mc_retail',
    title: 'Retail & POS',
    description:
      'Store regions, customers, catalog products, and orders — ideal for revenue joins and cohort filters.',
    suggestedQuery: `SELECT r.label, SUM(f.qty * p.unit_price) AS revenue
FROM mc_retail_regions r
JOIN mc_retail_customers c ON c.parent_id = r.id
JOIN mc_retail_orders f ON f.ref_a_id = c.id
JOIN mc_retail_products p ON p.id = f.ref_b_id
WHERE f.status = 'done'
GROUP BY r.id
ORDER BY revenue DESC
LIMIT 25;`,
    seed: 11_101,
    tables: ['regions', 'customers', 'products', 'orders'],
  },
  {
    id: 'mc_hr',
    title: 'HR & Projects',
    description:
      'Departments, employees, internal projects, and assignments — practice many-to-many style joins.',
    suggestedQuery: `SELECT d.label, COUNT(DISTINCT e.id) AS headcount
FROM mc_hr_departments d
JOIN mc_hr_employees e ON e.parent_id = d.id
GROUP BY d.id
ORDER BY headcount DESC
LIMIT 25;`,
    seed: 11_203,
    tables: ['departments', 'employees', 'projects', 'assignments'],
  },
  {
    id: 'mc_finance',
    title: 'Finance & GL',
    description:
      'Cost centers, analysts, accounts, and posted lines — grouping, sums, and date filters.',
    suggestedQuery: `SELECT a.segment, ROUND(SUM(l.qty * g.unit_price), 2) AS exposure
FROM mc_finance_analysts a
JOIN mc_finance_postings l ON l.ref_a_id = a.id
JOIN mc_finance_accounts g ON g.id = l.ref_b_id
WHERE l.event_date >= '2024-06-01'
GROUP BY a.segment;`,
    seed: 11_307,
    tables: ['cost_centers', 'analysts', 'accounts', 'postings'],
  },
  {
    id: 'mc_logistics',
    title: 'Logistics & Warehousing',
    description:
      'Hubs, carriers, SKUs, and shipment events — heavy fact tables for LIMIT and indexing habits.',
    suggestedQuery: `SELECT p.sku, SUM(f.qty) AS units
FROM mc_logistics_skus p
JOIN mc_logistics_shipments f ON f.ref_b_id = p.id
WHERE f.status != 'void'
GROUP BY p.id
ORDER BY units DESC
LIMIT 30;`,
    seed: 11_409,
    tables: ['hubs', 'carriers', 'skus', 'shipments'],
  },
  {
    id: 'mc_healthcare',
    title: 'Healthcare Ops',
    description:
      'Facilities, patients, procedures, and visits — anonymized-style rows for privacy-aware querying.',
    suggestedQuery: `SELECT c.name, COUNT(*) AS visits
FROM mc_healthcare_patients c
JOIN mc_healthcare_visits v ON v.ref_a_id = c.id
GROUP BY c.id
HAVING visits > 1
LIMIT 50;`,
    seed: 11_511,
    tables: ['facilities', 'patients', 'procedures', 'visits'],
  },
  {
    id: 'mc_education',
    title: 'Campus & LMS',
    description:
      'Schools, students, modules, and enrollments — segment analysis and enrollment rates.',
    suggestedQuery: `SELECT r.label, AVG(e.qty) AS avg_credits
FROM mc_education_schools r
JOIN mc_education_students s ON s.parent_id = r.id
JOIN mc_education_enrollments e ON e.ref_a_id = s.id
GROUP BY r.id;`,
    seed: 11_613,
    tables: ['schools', 'students', 'modules', 'enrollments'],
  },
  {
    id: 'mc_media',
    title: 'Media Catalog',
    description:
      'Studios, listeners, titles, and play events — practice time-based filters and top-N.',
    suggestedQuery: `SELECT p.category, COUNT(*) AS plays
FROM mc_media_titles p
JOIN mc_media_plays x ON x.ref_b_id = p.id
GROUP BY p.category;`,
    seed: 11_715,
    tables: ['studios', 'listeners', 'titles', 'plays'],
  },
  {
    id: 'mc_iot',
    title: 'IoT & Telemetry',
    description:
      'Sites, devices, metrics, and readings — larger cardinalities for scanning discipline (always LIMIT).',
    suggestedQuery: `SELECT d.label, COUNT(*) AS readings
FROM mc_iot_sites d
JOIN mc_iot_devices dv ON dv.parent_id = d.id
JOIN mc_iot_readings r ON r.ref_a_id = dv.id
GROUP BY d.id
ORDER BY readings DESC
LIMIT 20;`,
    seed: 11_817,
    tables: ['sites', 'devices', 'metrics', 'readings'],
  },
  {
    id: 'mc_support',
    title: 'Support Desk',
    description:
      'Queues, agents, ticket types, and ticket facts — SLA-style filters and status breakdowns.',
    suggestedQuery: `SELECT c.segment, COUNT(*) AS tickets
FROM mc_support_agents c
JOIN mc_support_tickets t ON t.ref_a_id = c.id
WHERE t.status = 'open'
GROUP BY c.segment;`,
    seed: 11_919,
    tables: ['queues', 'agents', 'ticket_types', 'tickets'],
  },
  {
    id: 'mc_manufacturing',
    title: 'Manufacturing & BOM',
    description:
      'Plants, planners, parts, and shop-floor moves — joins across operational dimensions.',
    suggestedQuery: `SELECT p.sku, SUM(m.qty) AS moved
FROM mc_manufacturing_parts p
JOIN mc_manufacturing_moves m ON m.ref_b_id = p.id
GROUP BY p.id
ORDER BY moved DESC
LIMIT 25;`,
    seed: 12_021,
    tables: ['plants', 'planners', 'parts', 'moves'],
  },
  {
    id: 'mc_realestate',
    title: 'Real Estate',
    description:
      'Markets, agents, listings, and showing activity — geographic-style labels and activity joins.',
    suggestedQuery: `SELECT m.label, COUNT(*) AS showings
FROM mc_realestate_markets m
JOIN mc_realestate_agents a ON a.parent_id = m.id
JOIN mc_realestate_showings s ON s.ref_a_id = a.id
GROUP BY m.id;`,
    seed: 12_123,
    tables: ['markets', 'agents', 'listings', 'showings'],
  },
  {
    id: 'mc_gaming',
    title: 'Gaming & Live Ops',
    description:
      'Shards, players, SKUs, and purchase events — monetization rollups and segment splits.',
    suggestedQuery: `SELECT c.segment, ROUND(SUM(x.qty * p.unit_price), 2) AS mtx
FROM mc_gaming_players c
JOIN mc_gaming_purchases x ON x.ref_a_id = c.id
JOIN mc_gaming_skus p ON p.id = x.ref_b_id
GROUP BY c.segment;`,
    seed: 12_225,
    tables: ['shards', 'players', 'skus', 'purchases'],
  },
  {
    id: 'mc_food_delivery',
    title: 'Food Delivery',
    description:
      'Zones, drivers, menu items, and delivery runs — peak-hour style date filters.',
    suggestedQuery: `SELECT DATE(f.event_date) AS d, SUM(f.qty) AS deliveries
FROM mc_food_delivery_deliveries f
WHERE f.status = 'done'
GROUP BY d
ORDER BY d DESC
LIMIT 14;`,
    seed: 12_327,
    tables: ['zones', 'drivers', 'menu_items', 'deliveries'],
  },
  {
    id: 'mc_banking',
    title: 'Core Banking',
    description:
      'Branches, customers, products, and ledger movements — balance-style sums with filters.',
    suggestedQuery: `SELECT r.label, COUNT(DISTINCT c.id) AS customers
FROM mc_banking_branches r
JOIN mc_banking_accountholders c ON c.parent_id = r.id
JOIN mc_banking_movements t ON t.ref_a_id = c.id
WHERE t.status != 'void'
GROUP BY r.id;`,
    seed: 12_429,
    tables: ['branches', 'accountholders', 'products', 'movements'],
  },
  {
    id: 'mc_airline',
    title: 'Airline Network',
    description:
      'Bases, crew, routes, and trip records — network facts for multi-table paths.',
    suggestedQuery: `SELECT p.category, AVG(f.qty) AS avg_pax
FROM mc_airline_routes p
JOIN mc_airline_trips f ON f.ref_b_id = p.id
GROUP BY p.category;`,
    seed: 12_531,
    tables: ['bases', 'crew', 'routes', 'trips'],
  },
  {
    id: 'mc_energy',
    title: 'Energy Grid',
    description:
      'Substations, technicians, assets, and outage/restoration events — time-series friendly.',
    suggestedQuery: `SELECT strftime('%Y-%m', event_date) AS ym, SUM(qty) AS units
FROM mc_energy_events
WHERE status = 'done'
GROUP BY ym
ORDER BY ym;`,
    seed: 12_633,
    tables: ['substations', 'technicians', 'assets', 'events'],
  },
  {
    id: 'mc_insurance',
    title: 'Insurance Claims',
    description:
      'Regions, policyholders, coverage items, and claim transactions — rollups by segment.',
    suggestedQuery: `SELECT c.segment, COUNT(*) AS open_claims
FROM mc_insurance_policyholders c
JOIN mc_insurance_claims cl ON cl.ref_a_id = c.id
WHERE cl.status = 'open'
GROUP BY c.segment;`,
    seed: 12_735,
    tables: ['regions', 'policyholders', 'coverages', 'claims'],
  },
  {
    id: 'mc_nonprofit',
    title: 'Nonprofit CRM',
    description:
      'Chapters, donors, programs, and gifts — fundraising funnel style questions.',
    suggestedQuery: `SELECT r.label, SUM(g.qty * p.unit_price) AS pledged
FROM mc_nonprofit_chapters r
JOIN mc_nonprofit_donors d ON d.parent_id = r.id
JOIN mc_nonprofit_gifts g ON g.ref_a_id = d.id
JOIN mc_nonprofit_programs p ON p.id = g.ref_b_id
GROUP BY r.id
ORDER BY pledged DESC
LIMIT 20;`,
    seed: 12_837,
    tables: ['chapters', 'donors', 'programs', 'gifts'],
  },
  {
    id: 'mc_analytics',
    title: 'Product Analytics',
    description:
      'Experiments, visitors, events, and conversion facts — cohort and funnel patterns.',
    suggestedQuery: `SELECT c.segment, COUNT(DISTINCT f.id) AS converting_users
FROM mc_analytics_visitors c
JOIN mc_analytics_conversions f ON f.ref_a_id = c.id
WHERE f.status = 'done'
GROUP BY c.segment;`,
    seed: 12_939,
    tables: ['experiments', 'visitors', 'event_types', 'conversions'],
  },
  {
    id: 'mc_saas',
    title: 'SaaS Billing',
    description:
      'Data centers, tenants, plans, and invoice lines — MRR-style exploration with joins.',
    suggestedQuery: `SELECT p.category, ROUND(SUM(l.qty * p.unit_price), 2) AS booked
FROM mc_saas_plans p
JOIN mc_saas_invoice_lines l ON l.ref_b_id = p.id
WHERE l.event_date >= '2024-03-01'
GROUP BY p.category;`,
    seed: 13_041,
    tables: ['datacenters', 'tenants', 'plans', 'invoice_lines'],
  },
];

export function listMasterclassSchemaMetas(): MasterclassSchemaMeta[] {
  return MASTERCLASS_SCHEMAS.map(({ seed: _s, tables: _t, ...m }) => m);
}

export function getMasterclassSchemaMeta(id: string): MasterclassSchemaMeta | undefined {
  const s = MASTERCLASS_SCHEMAS.find((x) => x.id === id);
  if (!s) return undefined;
  const { seed: _s, tables: _t, ...m } = s;
  return m;
}

/** Ordered SQL chunks: DDL first, then inserts table-by-table (FK order). */
export function buildMasterclassSqlChunks(schemaId: string): string[] {
  const spec = MASTERCLASS_SCHEMAS.find((s) => s.id === schemaId);
  if (!spec) {
    throw new Error(`Unknown masterclass schema: ${schemaId}`);
  }
  const tables = buildTables(spec);
  const ddl = ddlFor(spec);
  const chunks: string[] = [ddl];
  for (const tbl of tables) {
    chunks.push(...insertBatches(tbl.name, tbl.cols, tbl.rows));
  }
  return chunks;
}
