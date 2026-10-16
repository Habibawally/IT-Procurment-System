const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbReady } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (loaded after DB ready)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

dbReady.then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Procurement API running on http://localhost:${PORT}`);
    console.log('\n📌 Endpoints: POST /api/auth/login | GET /api/requests | POST /api/requests | etc.\n');
  });
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

