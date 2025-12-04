let wheel, currentConfig = { segments: [], history: [], preventRepeats: false };
const API_BASE = 'http://localhost:3000';

document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  if (res.ok) {
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadConfig();
  } else {
    alert('Login failed');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
});

async function loadConfig() {
  const res = await fetch(`${API_BASE}/wheels`, { credentials: 'include' });
  if (res.ok) {
    currentConfig = await res.json();
    initWheel();
    updateHistory();
  }
}

function initWheel() {
  const canvas = document.getElementById('wheel');
  wheel = new SpinWheel(canvas, currentConfig.segments);
  wheel.draw();
}

document.getElementById('spinBtn').addEventListener('click', () => {
  if (!wheel || currentConfig.segments.length === 0) return;
  wheel.spin(3000, () => {
    const winner = wheel.getWinningSegment();
    document.getElementById('result').textContent = `You won: ${winner.name}`;
    document.getElementById('result').classList.remove('hidden');
    currentConfig.history.push({ name: winner.name, time: new Date().toISOString() });
    if (currentConfig.preventRepeats) {
      winner.disabled = true;
    }
    updateHistory();
    saveConfig();
  });
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('settings').classList.remove('hidden');
  renderSegments();
});

document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settings').classList.add('hidden');
});

document.getElementById('addSegment').addEventListener('click', () => {
  currentConfig.segments.push({ name: 'New Segment', color: '#ff0000', probability: 1 });
  renderSegments();
});

function renderSegments() {
  const list = document.getElementById('segmentList');
  list.innerHTML = '';
  currentConfig.segments.forEach((seg, i) => {
    const div = document.createElement('div');
    div.className = 'segment';
    div.innerHTML = `
      <input type="text" value="${seg.name}" onchange="updateSegment(${i}, 'name', this.value)">
      <input type="color" value="${seg.color}" onchange="updateSegment(${i}, 'color', this.value)">
      <input type="number" value="${seg.probability}" min="1" onchange="updateSegment(${i}, 'probability', this.value)">
      <button onclick="removeSegment(${i})">Remove</button>
   