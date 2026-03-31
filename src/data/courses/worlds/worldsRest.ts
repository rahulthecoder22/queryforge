import { buildWorld } from '../worldFactory';

const sg3 = (s: string) =>
  `${s}\n\nInterview tip: state the grain (one row = ?), then add the smallest clause that moves you forward.`;

export const world03 = buildWorld(
  {
    id: 3,
    name: 'Aggregation Mountain',
    subtitle: 'Lodge & hospitality',
    theme: 'mountain',
    description:
      'Hotel ops data at realistic volume (~200+ rows across facts). Aggregates and joins framed like DS screens, not textbook drills.',
    database: 'mountain_lodge.sql',
    icon: '🏔️',
    color: '#4ade80',
    prerequisites: [2],
  },
  [
    {
      title: 'Inventory cardinality',
      isBoss: false,
      difficulty: 'Easy',
      constraints: ['scalar', 'alias total_rooms'],
      solveGuide: sg3('COUNT(*) counts rows — no WHERE unless the prompt filters.'),
      story:
        'Ops is reconciling PMS export: leadership wants a single number — how many bookable rooms exist in rooms?',
      concept: 'COUNT(*)',
      task: 'Return one row: COUNT(*) AS total_rooms from rooms.',
      starterCode: '-- Fill in the aggregate; one scalar.\nSELECT\nFROM rooms;',
      expectedQuery: 'SELECT COUNT(*) AS total_rooms FROM rooms;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['total_rooms'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 120,
      xpReward: 70,
      relevantTables: ['rooms'],
    },
    {
      title: 'CRM master count',
      isBoss: false,
      difficulty: 'Easy',
      constraints: ['alias guests'],
      solveGuide: sg3('Same pattern as rooms — different table.'),
      story: 'Marketing asks for the size of the guest master list before a campaign load.',
      concept: 'COUNT',
      task: 'Scalar guests: COUNT(*) from guests with alias guests.',
      starterCode: 'SELECT\nFROM guests;',
      expectedQuery: 'SELECT COUNT(*) AS guests FROM guests;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['guests'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 120,
      xpReward: 72,
      relevantTables: ['guests'],
    },
    {
      title: 'Recognized stay revenue',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['SUM(total_amount)', 'alias revenue'],
      solveGuide: sg3('Additive metric across all booking rows — watch for NULLs (none here).'),
      story: 'Finance close: total booking revenue already captured in bookings.total_amount.',
      concept: 'SUM',
      task: 'One number: SUM(total_amount) AS revenue over all bookings.',
      starterCode: 'SELECT\nFROM bookings;',
      expectedQuery: 'SELECT SUM(total_amount) AS revenue FROM bookings;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['revenue'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 150,
      xpReward: 95,
      relevantTables: ['bookings'],
    },
    {
      title: 'Folio enrichment',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['join key guest_id', 'three output columns'],
      solveGuide: sg3('Start from bookings (fact), join guests for email dimension.'),
      story: 'Data science feature store needs booking id, amount, and guest email in one frame.',
      concept: 'JOIN',
      task: 'Columns b.id, b.total_amount, g.email — bookings b joined to guests g.',
      starterCode:
        'SELECT b.id, b.total_amount, g.email\nFROM bookings b\nJOIN guests g ON ',
      expectedQuery: `SELECT b.id, b.total_amount, g.email
FROM bookings b
JOIN guests g ON b.guest_id = g.id;`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 116 },
      parTimeSeconds: 220,
      xpReward: 115,
      relevantTables: ['bookings', 'guests'],
    },
    {
      title: 'Stay frequency by guest',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['GROUP BY guest_id', 'COUNT(*) AS stay_count'],
      solveGuide: sg3('Grain becomes one row per guest_id; COUNT rows inside each group.'),
      story: 'Identify repeat visitors: for each guest_id, how many booking rows (stays) exist?',
      concept: 'GROUP BY',
      task: 'guest_id and COUNT(*) AS stay_count from bookings, grouped by guest_id.',
      starterCode: 'SELECT guest_id,\nFROM bookings\nGROUP BY ',
      expectedQuery: 'SELECT guest_id, COUNT(*) AS stay_count FROM bookings GROUP BY guest_id;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 48 },
      parTimeSeconds: 200,
      xpReward: 115,
      relevantTables: ['bookings'],
    },
    {
      title: 'Power users (4+ stays)',
      isBoss: false,
      difficulty: 'Hard',
      constraints: ['HAVING COUNT(*) >= 4', 'aliases guest_id, stay_count'],
      solveGuide: sg3('WHERE filters rows before groups; HAVING filters after aggregation.'),
      story: 'VIP program qualification: guests with four or more distinct booking rows.',
      concept: 'HAVING',
      task: 'guest_id and COUNT(*) AS stay_count; only groups with count >= 4.',
      starterCode:
        'SELECT guest_id, COUNT(*) AS stay_count\nFROM bookings\nGROUP BY guest_id\n',
      expectedQuery:
        'SELECT guest_id, COUNT(*) AS stay_count FROM bookings GROUP BY guest_id HAVING COUNT(*) >= 4;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 6 },
      parTimeSeconds: 260,
      xpReward: 135,
      relevantTables: ['bookings'],
    },
    {
      title: 'Comp-set ADR (2-bed)',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['beds = 2', 'ROUND optional but use ROUND(AVG(...),2)'],
      solveGuide: sg3('Filter rooms first, then average rate_per_night.'),
      story: 'Revenue management wants average nightly rate restricted to two-bed inventory.',
      concept: 'AVG + WHERE',
      task: 'ROUND(AVG(rate_per_night), 2) AS avg_rate for rooms where beds = 2.',
      starterCode: 'SELECT\nFROM rooms\nWHERE beds = 2;',
      expectedQuery: 'SELECT ROUND(AVG(rate_per_night), 2) AS avg_rate FROM rooms WHERE beds = 2;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['avg_rate'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 160,
      xpReward: 100,
      relevantTables: ['rooms'],
    },
    {
      title: 'Menu price outlier (max)',
      isBoss: false,
      difficulty: 'Easy',
      constraints: ['scalar max_price'],
      solveGuide: sg3('MAX scans the column — no sort required.'),
      story: 'Kitchen cost review: what is the highest menu_items.price in the lodge menu?',
      concept: 'MAX',
      task: 'MAX(price) AS max_price from menu_items.',
      starterCode: 'SELECT\nFROM menu_items;',
      expectedQuery: 'SELECT MAX(price) AS max_price FROM menu_items;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['max_price'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 120,
      xpReward: 85,
      relevantTables: ['menu_items'],
    },
    {
      title: 'Ticket quantity for order #1',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['order_id = 1', 'SUM(qty) AS units'],
      solveGuide: sg3('Filtered SUM — only lines belonging to that order id.'),
      story: 'F&B analytics: total units sold on the first captured order (order_id = 1).',
      concept: 'SUM filter',
      task: 'SUM(qty) AS units from order_items where order_id = 1.',
      starterCode: 'SELECT\nFROM order_items\nWHERE order_id = 1;',
      expectedQuery: 'SELECT SUM(qty) AS units FROM order_items WHERE order_id = 1;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['units'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 140,
      xpReward: 95,
      relevantTables: ['order_items'],
    },
    {
      title: 'Mountain Boss: top guest ledger',
      isBoss: true,
      difficulty: 'Hard',
      constraints: [
        'SUM(total_amount) per guest',
        'ORDER BY total_spent DESC',
        'LIMIT 1',
      ],
      solveGuide: sg3('Aggregate first, then sort summaries, then trim to one row.'),
      story: 'Executive asks: which guest_id generated the highest lifetime booking spend?',
      concept: 'GROUP BY + ORDER BY',
      task: 'guest_id and SUM(total_amount) AS total_spent; highest spend first; one row.',
      starterCode:
        'SELECT guest_id, SUM(total_amount) AS total_spent\nFROM bookings\nGROUP BY guest_id\n',
      expectedQuery: `SELECT guest_id, SUM(total_amount) AS total_spent
FROM bookings
GROUP BY guest_id
ORDER BY total_spent DESC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedColumns: ['guest_id', 'total_spent'],
        expectedRowCount: 1,
      },
      parTimeSeconds: 300,
      xpReward: 300,
      relevantTables: ['bookings'],
    },
  ],
);

const sgHospital = (s: string) =>
  `${s}\n\nRead the yellow **Problem pack** box for the exact columns and filters. The lesson diagram may use another dataset (ships, voyages) only to show SQL shape — your tables are listed under “Tables”.`;

export const world04 = buildWorld(
  {
    id: 4,
    name: 'The Bridge of JOINs',
    subtitle: 'Healthcare',
    theme: 'hospital',
    description:
      'Patients, doctors, departments — INNER and filtered JOINs. Each level states the business question first; the previous level is often the warm-up for the boss.',
    database: 'city_hospital.sql',
    icon: '🏥',
    color: '#f472b6',
    prerequisites: [3],
  },
  [
    {
      title: 'Patient directory',
      isBoss: false,
      story: 'Front desk needs id and full names.',
      concept: 'SELECT',
      task: 'id, first_name, last_name from patients.',
      starterCode: 'SELECT id, first_name, last_name FROM patients;',
      expectedQuery: 'SELECT id, first_name, last_name FROM patients;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 8 },
      parTimeSeconds: 60,
      xpReward: 55,
      relevantTables: ['patients'],
    },
    {
      title: 'Cardiology roster',
      isBoss: false,
      story: 'List doctor first and last names in Cardiology.',
      concept: 'JOIN',
      task: 'JOIN doctors to departments WHERE departments.name = Cardiology.',
      starterCode:
        'SELECT d.first_name, d.last_name\nFROM doctors d\nJOIN departments dept ON d.department_id = dept.id\nWHERE ',
      expectedQuery: `SELECT d.first_name, d.last_name
FROM doctors d
JOIN departments dept ON d.department_id = dept.id
WHERE dept.name = 'Cardiology';`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 2 },
      parTimeSeconds: 200,
      xpReward: 100,
      relevantTables: ['doctors', 'departments'],
    },
    {
      title: 'Scheduled visits',
      isBoss: false,
      story: 'Appointments still scheduled.',
      concept: 'WHERE',
      task: 'id, patient_id, doctor_id where status = scheduled.',
      starterCode: "SELECT id, patient_id, doctor_id FROM appointments WHERE status = 'scheduled';",
      expectedQuery:
        "SELECT id, patient_id, doctor_id FROM appointments WHERE status = 'scheduled';",
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 4 },
      parTimeSeconds: 90,
      xpReward: 75,
      relevantTables: ['appointments'],
    },
    {
      title: 'Visit sheet',
      isBoss: false,
      story: 'Patient first name + doctor last name per appointment.',
      concept: 'Two-table JOIN',
      task: 'JOIN appointments to patients and doctors; show patient first_name, doctor last_name, appointment_date.',
      starterCode:
        'SELECT p.first_name, d.last_name, a.appointment_date\nFROM appointments a\nJOIN patients p ON a.patient_id = p.id\nJOIN doctors d ON ',
      expectedQuery: `SELECT p.first_name, d.last_name, a.appointment_date
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id;`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 10 },
      parTimeSeconds: 240,
      xpReward: 120,
      relevantTables: ['appointments', 'patients', 'doctors'],
    },
    {
      title: 'No-shows',
      isBoss: false,
      story: 'Patients who had a no_show appointment.',
      concept: 'JOIN + filter',
      task: 'Distinct patient first_name where appointment status is no_show.',
      starterCode:
        'SELECT DISTINCT p.first_name\nFROM appointments a\nJOIN patients p ON a.patient_id = p.id\nWHERE ',
      expectedQuery: `SELECT DISTINCT p.first_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.status = 'no_show';`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 1 },
      parTimeSeconds: 180,
      xpReward: 100,
      relevantTables: ['appointments', 'patients'],
    },
    {
      title: 'Radiology floor',
      isBoss: false,
      story: 'Doctors working on floor 4 (Radiology).',
      concept: 'Double JOIN',
      task: 'Doctors first_name where department floor = 4.',
      starterCode:
        'SELECT d.first_name\nFROM doctors d\nJOIN departments dept ON d.department_id = dept.id\nWHERE ',
      expectedQuery: `SELECT d.first_name
FROM doctors d
JOIN departments dept ON d.department_id = dept.id
WHERE dept.floor = 4;`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 1 },
      parTimeSeconds: 150,
      xpReward: 95,
      relevantTables: ['doctors', 'departments'],
    },
    {
      title: 'Appointments per doctor',
      isBoss: false,
      difficulty: 'Medium',
      constraints: [
        'Each output row is one doctor.',
        'Columns: doctor_id and appts (appointment row count for that doctor).',
        'Use the appointments table only.',
      ],
      solveGuide: sgHospital(
        'Count how many rows in appointments belong to each doctor_id. That number is “how many appointments that doctor has” in this dataset.',
      ),
      story:
        'Scheduling is building a load report: for every doctor who appears in appointments, how many appointment rows do they have?',
      concept: 'GROUP BY',
      task: 'Return a table with one row per doctor_id: column doctor_id and column appts = COUNT(*) of appointments for that doctor.',
      starterCode:
        'SELECT doctor_id, COUNT(*) AS appts\nFROM appointments\nGROUP BY doctor_id;',
      expectedQuery:
        'SELECT doctor_id, COUNT(*) AS appts FROM appointments GROUP BY doctor_id;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 6 },
      parTimeSeconds: 150,
      xpReward: 105,
      relevantTables: ['appointments'],
    },
    {
      title: 'Youngest patient',
      isBoss: false,
      story: 'Who is the youngest?',
      concept: 'ORDER BY',
      task: 'One row: first_name, last_name, birth_year — youngest = highest birth_year.',
      starterCode:
        'SELECT first_name, last_name, birth_year FROM patients ORDER BY birth_year DESC LIMIT 1;',
      expectedQuery:
        'SELECT first_name, last_name, birth_year FROM patients ORDER BY birth_year DESC LIMIT 1;',
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 1 },
      parTimeSeconds: 120,
      xpReward: 85,
      relevantTables: ['patients'],
    },
    {
      title: '2024 registrations',
      isBoss: false,
      story: 'Patients who registered in 2024 (registration_date starts with 2024).',
      concept: 'LIKE',
      task: 'first_name, last_name WHERE registration_date LIKE 2024%.',
      starterCode:
        "SELECT first_name, last_name FROM patients WHERE registration_date LIKE '2024%';",
      expectedQuery:
        "SELECT first_name, last_name FROM patients WHERE registration_date LIKE '2024%';",
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 5 },
      parTimeSeconds: 120,
      xpReward: 90,
      relevantTables: ['patients'],
    },
    {
      title: 'Hospital Boss: busiest doctor',
      isBoss: true,
      difficulty: 'Hard',
      constraints: [
        'You only need the appointments table.',
        'Output exactly one row.',
        'Columns must be named doctor_id and c.',
        'c = number of appointment rows for that doctor (same idea as “appts” on the previous level).',
        'Winner = doctor with the largest c. If two doctors share the same top count, pick the one with the smaller doctor_id.',
      ],
      solveGuide: sgHospital(
        '1) Group appointments by doctor_id and count rows — that gives each doctor’s load.\n2) Sort those summaries so the highest count is first, and when counts tie, the smaller doctor_id comes first.\n3) Keep only the first row (LIMIT 1).',
      ),
      story:
        'Ops wants a single answer: which doctor has the heaviest schedule in this database — meaning the most rows in appointments? If there is a tie for first place, report the doctor with the lower doctor_id so the answer is deterministic.',
      concept: 'GROUP BY + ORDER BY',
      task: 'Return one row: doctor_id and c (the appointment count for that doctor). It must be the doctor with the maximum appointment count; break ties by choosing the smallest doctor_id.',
      starterCode:
        'SELECT doctor_id, COUNT(*) AS c\nFROM appointments\nGROUP BY doctor_id\nORDER BY c DESC, doctor_id ASC\nLIMIT 1;',
      expectedQuery: `SELECT doctor_id, COUNT(*) AS c
FROM appointments
GROUP BY doctor_id
ORDER BY c DESC, doctor_id ASC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['doctor_id', 'c'],
      },
      parTimeSeconds: 220,
      xpReward: 290,
      relevantTables: ['appointments'],
    },
  ],
);
