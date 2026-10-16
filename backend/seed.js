const bcrypt = require('bcryptjs');
const { dbReady } = require('./models/db');

const users = [
  { name: 'Alice Johnson',  email: 'alice@company.com',  password: 'password123', role: 'employee' },
  { name: 'Bob Smith',      email: 'bob@company.com',    password: 'password123', role: 'employee' },
  { name: 'Carol Williams', email: 'carol@company.com',  password: 'password123', role: 'manager' },
  { name: 'David Brown',    email: 'david@company.com',  password: 'password123', role: 'manager' },
  { name: 'Eve Davis',      email: 'eve@company.com',    password: 'password123', role: 'it' },
  { name: 'Frank Miller',   email: 'frank@company.com',  password: 'password123', role: 'it' },
  { name: 'Grace Wilson',   email: 'grace@company.com',  password: 'password123', role: 'procurement' },
  { name: 'Henry Moore',    email: 'henry@company.com',  password: 'password123', role: 'procurement' },
];

dbReady.then(db => {
  console.log('🌱 Seeding users...');
  for (const u of users) {
    try {
      const hash = bcrypt.hashSync(u.password, 10);
      db.prepare('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(u.name, u.email, hash, u.role);
      console.log('  ✓ ' + u.role.padEnd(12) + u.email);
    } catch (e) { console.log('  skip (exists):', u.email); }
  }

  // Sample requests
  const alice = db.prepare('SELECT id FROM users WHERE email = ?').get('alice@company.com');
  const carol = db.prepare('SELECT id FROM users WHERE email = ?').get('carol@company.com');
  const eve   = db.prepare('SELECT id FROM users WHERE email = ?').get('eve@company.com');

  if (alice) {
    const existingCount = db.prepare('SELECT COUNT(*) as c FROM requests').get().c;
    if (existingCount === 0) {
      const now = new Date();
      const d = (days) => new Date(now - days * 86400000).toISOString();

      db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run('New Laptop for Development', 'Need a MacBook Pro 16" for software dev. Current laptop is 5 years old.', 'Hardware', 'high', 'pending_manager', alice.id, d(3));

      db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at, manager_approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run('Microsoft Office License', 'Need MS Office 365 for documentation tasks.', 'Software', 'medium', 'pending_it', alice.id, d(5), d(4));

      const r3 = db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at, manager_approved_at, it_approved_at, procurement_completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      r3.run('USB-C Docking Station', 'Need a docking station to connect multiple monitors.', 'Accessories', 'low', 'completed', alice.id, d(10), d(9), d(8), d(7));

      console.log('  ✓ Sample requests created');
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials (password: password123):');
  console.log('  Employee:    alice@company.com');
  console.log('  Manager:     carol@company.com');
  console.log('  IT:          eve@company.com');
  console.log('  Procurement: grace@company.com');
  process.exit(0);
}).catch(err => { console.error('Seed failed:', err); process.exit(1); });