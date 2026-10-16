const path = require('path');
const { getDB } = require('../models/db');
const { UPLOAD_DIR } = require('../config');

const ITEM_TYPES = ['Hardware', 'Software', 'Accessories', 'Networking', 'Storage', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;

// Employees may only see their own requests; reviewer roles see all.
function canView(user, request) {
  return user.role !== 'employee' || request.created_by === user.id;
}

function logAction(db, request_id, user_id, action, details) {
  db.prepare(
    'INSERT INTO request_logs (request_id, user_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?)'
  ).run(request_id, user_id, action, details || null, new Date().toISOString());
}

function getRequests(req, res) {
  const db = getDB();
  const { role, id: userId } = req.user;
  const { status } = req.query;
  let query = 'SELECT r.*, u.name AS requester_name, u.email AS requester_email FROM requests r JOIN users u ON r.created_by = u.id';
  const params = [];
  const conditions = [];
  if (role === 'employee') { conditions.push('r.created_by = ?'); params.push(userId); }
  if (status) { conditions.push('r.status = ?'); params.push(status); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY r.created_at DESC';
  res.json(db.prepare(query).all(...params));
}

function getRequest(req, res) {
  const db = getDB();
  const request = db.prepare('SELECT r.*, u.name AS requester_name, u.email AS requester_email FROM requests r JOIN users u ON r.created_by = u.id WHERE r.id = ?').get(req.params.id);
  if (!request || !canView(req.user, request)) return res.status(404).json({ error: 'Request not found' });
  const logs = db.prepare('SELECT rl.*, u.name AS user_name, u.role AS user_role FROM request_logs rl JOIN users u ON rl.user_id = u.id WHERE rl.request_id = ? ORDER BY rl.timestamp ASC').all(req.params.id);
  const approvals = db.prepare('SELECT a.*, u.name AS approver_name FROM approvals a JOIN users u ON a.user_id = u.id WHERE a.request_id = ? ORDER BY a.timestamp ASC').all(req.params.id);
  res.json({ ...request, logs, approvals });
}

function createRequest(req, res) {
  const db = getDB();
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const { item_type, priority } = req.body;
  if (!title || !description || !item_type || !priority) return res.status(400).json({ error: 'All fields required' });
  if (!ITEM_TYPES.includes(item_type)) return res.status(400).json({ error: 'Invalid item type' });
  if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });
  if (title.length > MAX_TITLE) return res.status(400).json({ error: `Title must be at most ${MAX_TITLE} characters` });
  if (description.length > MAX_DESCRIPTION) return res.status(400).json({ error: `Description must be at most ${MAX_DESCRIPTION} characters` });
  const now = new Date().toISOString();
  const id = db.transaction(() => {
    const result = db.prepare('INSERT INTO requests (title, description, item_type, priority, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(title, description, item_type, priority, req.user.id, now);
    logAction(db, result.lastInsertRowid, req.user.id, 'created', 'Request submitted: ' + title);
    return result.lastInsertRowid;
  });
  res.status(201).json(db.prepare('SELECT * FROM requests WHERE id = ?').get(id));
}

function approveRequest(req, res) {
  const db = getDB();
  const { role, id: userId } = req.user;
  const { notes } = req.body;
  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  const transitions = {
    manager: { from: 'pending_manager', to: 'pending_it', tsField: 'manager_approved_at' },
    it:      { from: 'pending_it', to: 'pending_procurement', tsField: 'it_approved_at' },
  };
  const t = transitions[role];
  if (!t) return res.status(403).json({ error: 'Role cannot approve' });
  if (request.status !== t.from) return res.status(400).json({ error: 'Wrong status: ' + request.status });
  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare('UPDATE requests SET status = ?, ' + t.tsField + ' = ? WHERE id = ?').run(t.to, now, request.id);
    db.prepare('INSERT INTO approvals (request_id, user_id, role, action, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(request.id, userId, role, 'approved', notes || null, now);
    logAction(db, request.id, userId, role + '_approved', notes);
  });
  res.json({ message: 'Approved', newStatus: t.to });
}

function rejectRequest(req, res) {
  const db = getDB();
  const { role, id: userId } = req.user;
  const { reason } = req.body;
  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  const allowed = { manager: 'pending_manager', it: 'pending_it' };
  if (!allowed[role]) return res.status(403).json({ error: 'Role cannot reject' });
  if (request.status !== allowed[role]) return res.status(400).json({ error: 'Wrong status' });
  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare("UPDATE requests SET status = 'rejected', rejection_reason = ? WHERE id = ?").run(reason || null, request.id);
    db.prepare('INSERT INTO approvals (request_id, user_id, role, action, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(request.id, userId, role, 'rejected', reason || null, now);
    logAction(db, request.id, userId, role + '_rejected', reason);
  });
  res.json({ message: 'Rejected', newStatus: 'rejected' });
}

function completeRequest(req, res) {
  const db = getDB();
  const { id: userId } = req.user;
  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending_procurement') return res.status(400).json({ error: 'Wrong status' });
  const deliveryImage = req.file ? req.file.filename : null;
  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare("UPDATE requests SET status = 'completed', procurement_completed_at = ?, delivery_image = ? WHERE id = ?").run(now, deliveryImage, request.id);
    db.prepare('INSERT INTO approvals (request_id, user_id, role, action, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(request.id, userId, 'procurement', 'approved', req.body?.notes || null, now);
    logAction(db, request.id, userId, 'procurement_completed', deliveryImage ? 'Image: ' + deliveryImage : null);
  });
  res.json({ message: 'Completed', newStatus: 'completed' });
}

// Serves the proof-of-delivery image only to users allowed to view the request.
function getDeliveryImage(req, res) {
  const db = getDB();
  const request = db.prepare('SELECT created_by, delivery_image FROM requests WHERE id = ?').get(req.params.id);
  if (!request || !canView(req.user, request) || !request.delivery_image) {
    return res.status(404).json({ error: 'Image not found' });
  }
  res.sendFile(path.join(UPLOAD_DIR, path.basename(request.delivery_image)), err => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Image not found' });
  });
}

function getStats(req, res) {
  const db = getDB();
  const { id: userId, role } = req.user;
  const where = role === 'employee' ? 'WHERE r.created_by = ?' : '';
  const params = role === 'employee' ? [userId] : [];
  const statusCounts = db.prepare('SELECT status, COUNT(*) as count FROM requests r ' + where + ' GROUP BY status').all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM requests r ' + where).get(...params);
  const avgTimes = db.prepare('SELECT AVG(CASE WHEN manager_approved_at IS NOT NULL THEN (julianday(manager_approved_at) - julianday(created_at)) * 24 ELSE NULL END) as avg_manager_hours, AVG(CASE WHEN it_approved_at IS NOT NULL AND manager_approved_at IS NOT NULL THEN (julianday(it_approved_at) - julianday(manager_approved_at)) * 24 ELSE NULL END) as avg_it_hours, AVG(CASE WHEN procurement_completed_at IS NOT NULL AND it_approved_at IS NOT NULL THEN (julianday(procurement_completed_at) - julianday(it_approved_at)) * 24 ELSE NULL END) as avg_procurement_hours FROM requests r ' + where).get(...params);
  res.json({ total: total.count, statusCounts, avgTimes });
}

module.exports = { getRequests, getRequest, createRequest, approveRequest, rejectRequest, completeRequest, getDeliveryImage, getStats };