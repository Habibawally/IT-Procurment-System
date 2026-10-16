const path = require('path');

// Load backend/.env if present (Node's built-in loader, no dotenv needed)
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env file */ }

const express = require('express');
const cors = require('cors');
const { dbReady } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100kb' }));
// Delivery images are served through GET /api/requests/:id/delivery-image (login required),
// not as public static files.

// Routes (loaded after DB ready)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Unknown API routes and unexpected errors always answer in JSON
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

dbReady.then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Procurement API running on http://localhost:${PORT}`);
    console.log('\n📌 Endpoints: POST /api/auth/login | GET /api/requests | POST /api/requests | etc.\n');
  });
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

