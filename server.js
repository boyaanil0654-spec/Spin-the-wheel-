const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const WHEELS_FILE = path.join(__dirname, 'wheels.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load wheel from JSON (single global config)
function loadWheel() {
  if (fs.existsSync(WHEELS_FILE)) {
    return JSON.parse(fs.readFileSync(WHEELS_FILE, 'utf8'));
  }
  return { segments: [], history: [], preventRepeats: false };
}

// Save wheel to JSON
function saveWheel(wheel) {
  fs.writeFileSync(WHEELS_FILE, JSON.stringify(wheel, null, 2));
}

// Routes (now public, no auth)
app.get('/wheels', (req, res) => {
  res.json(loadWheel());
});

app.post('/wheels', (req, res) => {
  saveWheel(req.body);
  res.json({ success: true });
});

app.put('/wheels', (req, res) => {
  const current = loadWheel();
  const updated = { ...current, ...req.body };
  saveWheel(updated);
  res.json({ success: true });
});

app.delete('/wheels', (req, res) => {
  saveWheel({ segments: [], history: [], preventRepeats: false }); // Reset to default
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
