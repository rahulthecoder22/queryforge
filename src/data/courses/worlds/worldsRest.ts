import { buildWorld } from '../worldFactory';

export const world03 = buildWorld(
  {
    id: 3,
    name: 'Aggregation Mountain',
    subtitle: 'Lodge & hospitality',
    theme: 'mountain',
    description: 'Bookings, rooms, revenue — COUNT, SUM, AVG, GROUP BY, HAVING.',
    database: 'mountain_lodge.sql',
    icon: '🏔️',
    color: '#4ade80',
    prerequisites: [2],
  },
  [
    {
      title: 'Room inventory',
      isBoss: false,
      story: 'How many rooms?',
      concept: 'COUNT(*)',
      task: 'Single value: total number of rooms (alias total_rooms).',
      starterCode: 'SELECT COUNT(*) AS total_rooms FROM rooms;',
      expectedQuery: 'SELECT COUNT(*) AS total_rooms FROM rooms;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['total_rooms'],
      },
      parTimeSeconds: 60,
      xpReward: 65,
      relevantTables: ['rooms'],
    },
    {
      title: 'Guest headcount',
      isBoss: false,
      story: 'Head of housekeeping needs guest count.',
      concept: 'COUNT',
      task: 'COUNT(*) AS guests FROM guests.',
      starterCode: 'SELECT COUNT(*) AS guests FROM guests;',
      expectedQuery: 'SELECT COUNT(*) AS guests FROM guests;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['guests'],
      },
      parTimeSeconds: 60,
      xpReward: 65,
      relevantTables: ['guests'],
    },
    {
      title: 'Booking revenue',
      isBoss: false,
      story: 'Finance wants total revenue from all bookings.',
      concept: 'SUM',
      task: 'SUM(total_amount) AS revenue FROM bookings.',
      starterCode: 'SELECT SUM(total_amount) AS revenue FROM bookings;',
      expectedQuery: 'SELECT SUM(total_amount) AS revenue FROM bookings;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['revenue'],
      },
      parTimeSeconds: 90,
      xpReward: 80,
      relevantTables: ['bookings'],
    },
    {
      title: 'Guest spend list',
      isBoss: false,
      story: 'Each booking with guest email.',
      concept: 'JOIN',
      task: 'bookings.id, bookings.total_amount, guests.email — join bookings to guests.',
      starterCode:
        'SELECT b.id, b.total_amount, g.email\nFROM bookings b\nJOIN guests g ON ',
      expectedQuery: `SELECT b.id, b.total_amount, g.email
FROM bookings b
JOIN guests g ON b.guest_id = g.id;`,
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 6 },
      parTimeSeconds: 180,
      xpReward: 95,
      relevantTables: ['bookings', 'guests'],
    },
    {
      title: 'Bookings per guest',
      isBoss: false,
      story: 'Repeat visitors analysis.',
      concept: 'GROUP BY',
      task: 'guest_id and COUNT(*) AS n FROM bookings GROUP BY guest_id.',
      starterCode:
        'SELECT guest_id, COUNT(*) AS n\nFROM bookings\nGROUP BY ',
      expectedQuery: 'SELECT guest_id, COUNT(*) AS n FROM bookings GROUP BY guest_id;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 5 },
      parTimeSeconds: 150,
      xpReward: 100,
      relevantTables: ['bookings'],
    },
    {
      title: 'Two-stay guests',
      isBoss: false,
      story: 'Guests with more than one booking.',
      concept: 'HAVING',
      task: 'guest_id HAVING COUNT(*) > 1 from bookings.',
      starterCode:
        'SELECT guest_id, COUNT(*) AS c\nFROM bookings\nGROUP BY guest_id\nHAVING ',
      expectedQuery:
        'SELECT guest_id, COUNT(*) AS c FROM bookings GROUP BY guest_id HAVING COUNT(*) > 1;',
      validation: { strategy: ['result_match'], orderSensitive: false, expectedRowCount: 1 },
      parTimeSeconds: 200,
      xpReward: 110,
      relevantTables: ['bookings'],
    },
    {
      title: 'Average nightly rate',
      isBoss: false,
      story: 'Pricing analytics for 2-bed rooms.',
      concept: 'AVG + WHERE',
      task: 'AVG(rate_per_night) AS avg_rate WHERE beds = 2.',
      starterCode: 'SELECT AVG(rate_per_night) AS avg_rate FROM rooms WHERE ',
      expectedQuery: 'SELECT AVG(rate_per_night) AS avg_rate FROM rooms WHERE beds = 2;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['avg_rate'],
      },
      parTimeSeconds: 120,
      xpReward: 90,
      relevantTables: ['rooms'],
    },
    {
      title: 'Menu ceiling',
      isBoss: false,
      story: 'Most expensive menu item price.',
      concept: 'MAX',
      task: 'MAX(price) AS max_price FROM menu_items.',
      starterCode: 'SELECT MAX(price) AS max_price FROM menu_items;',
      expectedQuery: 'SELECT MAX(price) AS max_price FROM menu_items;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['max_price'],
      },
      parTimeSeconds: 90,
      xpReward: 75,
      relevantTables: ['menu_items'],
    },
    {
      title: 'Order line totals',
      isBoss: false,
      story: 'Units ordered on order_id = 1.',
      concept: 'SUM filter',
      task: 'SUM(qty) AS units FROM order_items WHERE order_id = 1.',
      starterCode: 'SELECT SUM(qty) AS units FROM order_items WHERE order_id = 1;',
      expectedQuery: 'SELECT SUM(qty) AS units FROM order_items WHERE order_id = 1;',
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['units'],
      },
      parTimeSeconds: 90,
      xpReward: 85,
      relevantTables: ['order_items'],
    },
    {
      title: 'Mountain Boss: VIP guest',
      isBoss: true,
      story: 'Who spent the most on bookings? guest_id and total_spent.',
      concept: 'GROUP BY + ORDER BY',
      task: 'SUM(total_amount) AS total_spent GROUP BY guest_id ORDER BY total_spent DESC LIMIT 1.',
      starterCode:
        'SELECT guest_id, SUM(total_amount) AS total_spent\nFROM bookings\nGROUP BY guest_id\nORDER BY ',
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
      parTimeSeconds: 260,
      xpReward: 280,
      relevantTables: ['bookings'],
    },
  ],
);

export const world04 = buildWorld(
  {
    id: 4,
    name: 'The Bridge of JOINs',
    subtitle: 'Healthcare',
    theme: 'hospital',
    description: 'Patients, doctors, departments — INNER and filtered JOINs.',
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
      story: 'Volume by doctor.',
      concept: 'GROUP BY',
      task: 'doctor_id, COUNT(*) AS appts FROM appointments GROUP BY doctor_id.',
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
      story: 'Among doctors tied for most appointments, pick the smallest doctor_id.',
      concept: 'GROUP BY + ORDER BY',
      task: 'doctor_id, COUNT(*) AS c — ORDER BY c DESC, doctor_id ASC LIMIT 1 (tie-break).',
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
