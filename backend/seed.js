const path = require('path');
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env file */ }

const bcrypt = require('bcryptjs');

// The server keeps the whole DB in memory and rewrites the file on every change,
// so seeding while it runs would be overwritten (or overwrite the server's data).
async function ensureServerStopped() {
  const port = process.env.PORT || 5000;
  try {
    await fetch(`http://localhost:${port}/api/health`, { signal: AbortSignal.timeout(1500) });
  } catch {
    return; // nothing listening — safe to seed
  }
  console.error(`❌ The API server is running on port ${port}. Stop it before seeding, then start it again.`);
  process.exit(1);
}

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

ensureServerStopped().then(() => require('./models/db').dbReady).then(db => {
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
  const grace = db.prepare('SELECT id FROM users WHERE email = ?').get('grace@company.com');

  if (alice && carol && eve && grace) {
    const existingCount = db.prepare('SELECT COUNT(*) as c FROM requests').get().c;
    if (existingCount === 0) {
      const now = new Date();
      const d = (days) => new Date(now - days * 86400000).toISOString();
      const log = (requestId, userId, action, details, ts) =>
        db.prepare('INSERT INTO request_logs (request_id, user_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?)').run(requestId, userId, action, details, ts);
      const approve = (requestId, userId, role, ts) =>
        db.prepare('INSERT INTO approvals (request_id, user_id, role, action, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(requestId, userId, role, 'approved', null, ts);

      // Sample requests with matching approval and activity history
      db.transaction(() => {
        const r1 = db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run('New Laptop for Development', 'Need a MacBook Pro 16" for software dev. Current laptop is 5 years old.', 'Hardware', 'high', 'pending_manager', alice.id, d(3)).lastInsertRowid;
        log(r1, alice.id, 'created', 'Request submitted: New Laptop for Development', d(3));

        const r2 = db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at, manager_approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run('Microsoft Office License', 'Need MS Office 365 for documentation tasks.', 'Software', 'medium', 'pending_it', alice.id, d(5), d(4)).lastInsertRowid;
        log(r2, alice.id, 'created', 'Request submitted: Microsoft Office License', d(5));
        approve(r2, carol.id, 'manager', d(4)); log(r2, carol.id, 'manager_approved', null, d(4));

        const r3 = db.prepare('INSERT INTO requests (title, description, item_type, priority, status, created_by, created_at, manager_approved_at, it_approved_at, procurement_completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run('USB-C Docking Station', 'Need a docking station to connect multiple monitors.', 'Accessories', 'low', 'completed', alice.id, d(10), d(9), d(8), d(7)).lastInsertRowid;
        log(r3, alice.id, 'created', 'Request submitted: USB-C Docking Station', d(10));
        approve(r3, carol.id, 'manager', d(9));     log(r3, carol.id, 'manager_approved', null, d(9));
        approve(r3, eve.id, 'it', d(8));            log(r3, eve.id, 'it_approved', null, d(8));
        approve(r3, grace.id, 'procurement', d(7)); log(r3, grace.id, 'procurement_completed', null, d(7));
      });

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