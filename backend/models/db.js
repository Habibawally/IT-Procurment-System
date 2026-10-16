const initSqlJs = require('../node_modules/sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../procurement.db');

let dbInstance = null;

class DB {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  exec(sql) {
    try {
      this._db.run(sql);
      this._save();
    } catch (e) {
      console.error('DB exec error:', e.message);
      throw e;
    }
    return this;
  }

  prepare(sql) {
    const self = this;
    return {

      // ── run() ────────────────────────────────────────────────────────────
      run(...params) {
        try {
          const stmt = self._db.prepare(sql);
          stmt.run(params.flat());
          stmt.free();

          // ✅ Capture last_insert_rowid BEFORE _save() resets it
          const r = self._db.exec('SELECT last_insert_rowid() as id');
          const rowid = r?.[0]?.values?.[0]?.[0] ?? null;

          self._save(); // writes to disk (resets last_insert_rowid to 0 — but we already have it)

          return { lastInsertRowid: rowid };
        } catch (e) {
          console.error('DB run error:', e.message, '| SQL:', sql.slice(0, 100));
          throw e;
        }
      },

      // ── get() ─────────────────────────────────────────────────────────────
      get(...params) {
        try {
          const stmt = self._db.prepare(sql);
          const flat = params.flat();
          if (flat.length) stmt.bind(flat);
          if (stmt.step()) {
            const obj = {};
            stmt.getColumnNames().forEach((c, i) => { obj[c] = stmt.get()[i]; });
            stmt.free();
            return obj;
          }
          stmt.free();
          return undefined;
        } catch (e) {
          console.error('DB get error:', e.message, '| SQL:', sql.slice(0, 100));
          throw e;
        }
      },

      // ── all() ─────────────────────────────────────────────────────────────
      all(...params) {
        try {
          const stmt = self._db.prepare(sql);
          const flat = params.flat();
          if (flat.length) stmt.bind(flat);
          const rows = [];
          while (stmt.step()) {
            const obj = {};
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            cols.forEach((c, i) => { obj[c] = vals[i]; });
            rows.push(obj);
          }
          stmt.free();
          return rows;
        } catch (e) {
          console.error('DB all error:', e.message, '| SQL:', sql.slice(0, 100));
          throw e;
        }
      },
    };
  }

  _save() {
    try {
      const data = this._db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }
}

function getDB() {
  if (!dbInstance) throw new Error('DB not ready yet');
  return dbInstance;
}

const dbReady = initSqlJs().then(SQL => {
  const sqlDb = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  dbInstance = new DB(sqlDb);

  dbInstance.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  dbInstance.exec(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, description TEXT NOT NULL,
    item_type TEXT NOT NULL, priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_manager',
    created_by INTEGER NOT NULL, rejection_reason TEXT,
    delivery_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    manager_approved_at DATETIME, it_approved_at DATETIME,
    procurement_completed_at DATETIME
  )`);
  dbInstance.exec(`CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
    role TEXT NOT NULL, action TEXT NOT NULL, notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  dbInstance.exec(`CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
    action TEXT NOT NULL, details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Database ready');
  return dbInstance;
}).catch(err => {
  console.error('❌ DB init failed:', err);
  process.exit(1);
});

module.exports = { getDB, dbReady };