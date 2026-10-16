const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // No secret configured: use a random one so nothing guessable is ever used.
  // Tokens will stop working after a restart — set JWT_SECRET in backend/.env.
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('⚠️  JWT_SECRET is not set — using a temporary random secret. See backend/.env.example');
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };