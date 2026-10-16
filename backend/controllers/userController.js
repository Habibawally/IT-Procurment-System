const { getDB } = require('../models/db');

function getUsers(req, res) {
  const db = getDB();
  const users = db.prepare('SELECT id, name, email, role FROM users ORDER BY role, name').all();
  res.json(users);
}

module.exports = { getUsers };