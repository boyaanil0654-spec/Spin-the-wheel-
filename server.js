const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const WHEELS_FILE = path.join(__dirname, 'wheels.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'spin-wheel-secret', // Change in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true for HTTPS
}));
app.use(express.static('public'));

// Load wheels from JSON
function loadWheels() {
  if (fs.existsSync(WHEELS_FILE)) {
    return JSON.parse(fs.readFileSync(WHEELS_FILE, 'utf8'));
  }
  return {};
}

// Save wheels to JSON
function saveWheels(wheels) {
  fs.writeFileSync(WHEELS_FILE, JSON.stringify(wheels, null, 2));
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.user) next();
  else res.status(401).json({ error: 'Unauthorized' });
}

// Routes
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Basic auth (replace with real DB)
  if (username === 'admin' && password === 'password') {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/wheels', requireAuth, (req, res) => {
  const wheels = loadWheels();
  res.json(wheels[req.session.user] || { segments: [], history: [] });
});

app.post('/wheels', requireAuth, (req, res) => {
  const wheels = loadWheels();
  wheels[req.session.user] = req.body;
  saveWheels(wheels);
  res.json({ success: true });
});

app.put('/wheels', requireAuth, (req, res) => {
  const wheels = loadWheels();
  if (wheels[req.session.user]) {
    wheels[req.session.user] = { ...wheels[req.session.user], ...req.body };
    saveWheels(wheels);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Wheel not found' });
  }
});

app.delete('/wheels', requireAuth, (req, res) => {
  const wheels = loadWheels();
  delete wheels[req.session.user];
  saveWheels(wheels);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));