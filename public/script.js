let wheel, currentConfig = { segments: [], history: [], preventRepeats: false };
const API_BASE = 'http://localhost:3000';

// Load config on page load
document.addEventListener('DOMContentLoaded', loadConfig);

async function loadConfig() {
  const res = await fetch(`${API_BASE}/wheels`);
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
    const winner = wheel.getWinningSegment(currentConfig.preventRepeats);
    if (!winner || (currentConfig.preventRepeats && winner.disabled)) {
      alert('No available segments to spin!');
      return;
    }
    document.getElementById('result').textContent = `You won: ${winner.name}`;
    document.getElementById('result').classList.remove('hidden');
    currentConfig.history.push({ name: winner.name, time: new Date().toISOString() });
    if (currentConfig.preventRepeats) {
      winner.disabled = true;
      wheel.draw(); // Redraw to show grayed out
    }
    updateHistory();
    saveConfig();
  }, currentConfig.preventRepeats);
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
    `;
    list.appendChild(div);
  });
  document.getElementById('preventRepeats').checked = currentConfig.preventRepeats;
}

function updateSegment(index, key, value) {
  currentConfig.segments[index][key] = value;
}

function removeSegment(index) {
  currentConfig.segments.splice(index, 1);
  renderSegments();
}

document.getElementById('saveSettings').addEventListener('click', () => {
  currentConfig.preventRepeats = document.getElementById('preventRepeats').checked;
  saveConfig();
  initWheel();
  document.getElementById('settings').classList.add('hidden');
});

async function saveConfig() {
  await fetch(`${API_BASE}/wheels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentConfig)
  });
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const dataStr = JSON.stringify(currentConfig, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wheel-config.json';
  a.click();
});

document.getElementById('importBtn').addEventListener('click', () => {
  const file = document.getElementById('importFile').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentConfig = JSON.parse(e.target.result);
      initWheel();
      updateHistory();
      saveConfig();
    };
    reader.readAsText(file);
  }
});

function updateHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = currentConfig.history.slice(-10).map(h => `<li>${h.name} - ${new Date(h.time).toLocaleString()}</li>`).join('');
}
