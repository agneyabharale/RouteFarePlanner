// ============================================
//  RouteWise — results.js
//  Integrated with backend.
// ============================================

// ── SVG icons ─────────────────────────
const ICONS = {
  bus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 9h18M7 17v2M17 17v2" stroke="white" stroke-width="1.5" fill="none"/><circle cx="7.5" cy="15" r="1" fill="white"/><circle cx="16.5" cy="15" r="1" fill="white"/></svg>`,
  metro: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 9h16M8 18v2M16 18v2" stroke="white" stroke-width="1.5" fill="none"/><circle cx="8.5" cy="14" r="1" fill="white"/><circle cx="15.5" cy="14" r="1" fill="white"/></svg>`,
  walk: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><circle cx="12" cy="4" r="1.5" fill="#6b7280"/><path d="M9 8l2 2 2-4 3 2M9 14l1 6M13 14l2 6M9 8l-2 6h4l2-4"/></svg>`,
  cab: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="7" rx="2"/><circle cx="7.5" cy="18" r="2" fill="white"/><circle cx="16.5" cy="18" r="2" fill="white"/></svg>`,
  transfer: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M16 3h5v5M4 21h5v-5M21 3l-7 7M3 21l7-7"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
  train: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7 15h10M7 11h10M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM9 19l-2 2M15 19l2 2" stroke="white" stroke-width="1.5" fill="none"/></svg>`,
};

let ROUTES_DATA = {
  cheapest: null,
  fastest: null,
  comfortable: null,
  all: []
};

let activeTab = 'cheapest';

// ── Tab configuration ─────────────────────────────────────
const TAB_CONFIG = {
  cheapest:    { label: 'Cheapest',          badge: 1, badgeCls: 'badge-green',  headerCls: 'green-header',  borderCls: 'green-card',  fareCls: 'green-fare',  accent: '#16a34a', bg: '#dcfce7' },
  fastest:     { label: 'Fastest',           badge: 2, badgeCls: 'badge-purple', headerCls: 'purple-header', borderCls: 'purple-card', fareCls: 'purple-fare', accent: '#7c3aed', bg: '#ede9fe' },
  comfortable: { label: 'Comfortable',       badge: 3, badgeCls: 'badge-amber',  headerCls: 'amber-header',  borderCls: 'amber-card',  fareCls: 'amber-fare',  accent: '#d97706', bg: '#fef3c7' },
  all:         { label: 'All Options',       badge: 4, badgeCls: 'badge-blue',   headerCls: 'blue-header',   borderCls: 'blue-card',   fareCls: 'blue-fare',   accent: '#2563eb', bg: '#dbeafe' }
};

const TAB_COLOR_CLASS = {
  cheapest:    'tab-active-green',
  fastest:     'tab-active-purple',
  comfortable: 'tab-active-amber',
  all:         'tab-active-blue',
};

// ── Initialization ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');
  const to   = urlParams.get('to');
  const pref = urlParams.get('pref') || 'cheap';

  if (from) document.getElementById('from-input').value = decodeURIComponent(from);
  if (to)   document.getElementById('to-input').value   = decodeURIComponent(to);

  activeTab = pref === 'cheap' ? 'cheapest'
            : pref === 'fastest' ? 'fastest'
            : pref === 'comfy'   ? 'comfortable'
            : 'cheapest';

  // Initial tab styling
  const initialTabBtn = document.querySelector(`.tab[data-tab="${activeTab}"]`);
  if (initialTabBtn) initialTabBtn.classList.add('tab-active', TAB_COLOR_CLASS[activeTab]);

  await fetchAllRoutes(from, to);

  // ── Wire up input listeners for auto-recalculate ──────────────────────────
  initInputListeners();
});

// ── Input listeners: auto-recalculate on change ───────────────────────────────
function initInputListeners() {
  const fromInput = document.getElementById('from-input');
  const toInput   = document.getElementById('to-input');
  if (!fromInput || !toInput) return;

  let debounceTimer;

  function scheduleRecalc() {
    clearTimeout(debounceTimer);

    // Visual cue that a recalc is pending
    const container = document.getElementById('route-cards-scroll');
    if (container) container.style.opacity = '0.5';

    debounceTimer = setTimeout(() => {
      const f = fromInput.value.trim();
      const t = toInput.value.trim();
      if (f && t && f !== t) {
        fetchAllRoutes(f, t);
      } else if (container) {
        container.style.opacity = '1';
      }
    }, 600); // 600ms debounce — comfortable for typing
  }

  fromInput.addEventListener('input', scheduleRecalc);
  toInput.addEventListener('input', scheduleRecalc);

  // Also trigger on Enter key
  [fromInput, toInput].forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        clearTimeout(debounceTimer);
        const f = fromInput.value.trim();
        const t = toInput.value.trim();
        if (f && t && f !== t) fetchAllRoutes(f, t);
      }
    });
  });
}

// ── Recalculate button (manual trigger) ──────────────────────────────────────
function recalculate() {
  const from = document.getElementById('from-input')?.value.trim();
  const to   = document.getElementById('to-input')?.value.trim();
  if (!from || !to) return;
  if (from === to) {
    showToast('Origin and destination cannot be the same.', 'error');
    return;
  }
  fetchAllRoutes(from, to);
}

// ── Fetch routes ──────────────────────────────────────────────────────────────
async function fetchAllRoutes(start, end) {
  const container = document.getElementById('route-cards-scroll');
  container.style.opacity = '1';
  container.innerHTML = `
    <div style="padding: 32px 20px; text-align: center; color: #94a3b8;">
      <div style="font-size: 13px; font-weight: 500; margin-bottom: 6px;">Planning your route…</div>
      <div style="font-size: 12px;">Comparing cheapest, fastest & most comfortable options</div>
    </div>
  `;

  const prefs = ['cheapest', 'fastest', 'comfiest'];
  const promises = prefs.map(p => fetchRoute(start, end, p));

  try {
    const results = await Promise.all(promises);
    ROUTES_DATA.cheapest    = results[0];
    ROUTES_DATA.fastest     = results[1];
    ROUTES_DATA.comfortable = results[2];
    ROUTES_DATA.all         = results;

    renderPanel(activeTab);
    updateStats(activeTab);
  } catch (err) {
    container.innerHTML = `
      <div style="padding: 24px 20px; color: #ef4444; font-size: 13px; text-align: center;">
        ⚠️ Could not fetch routes. Is the backend running on localhost:8000?
        <br><br>
        <button onclick="recalculate()" style="padding: 8px 16px; border: 1px solid #ef4444; border-radius: 8px; background: transparent; color: #ef4444; font-size: 13px; cursor: pointer;">Retry</button>
      </div>
    `;
    console.error(err);
  }
}

async function fetchRoute(start, end, preference) {
  const res = await fetch('http://localhost:8000/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end, preference })
  });
  return await res.json();
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderPanel(tabId) {
  const container = document.getElementById('route-cards-scroll');
  if (!container) return;

  const order = ['cheapest', 'fastest', 'comfortable', 'all'];

  let html = order.map(id => {
    const data = ROUTES_DATA[id];
    if (id === tabId) {
      return id === 'all' ? buildAllOptionsExpandedCard() : buildExpandedCard(id, data);
    } else {
      return id === 'all' ? buildAllOptionsCard(id) : buildCollapsedCard(id, data);
    }
  }).join('');

  container.innerHTML = html;
}

function buildExpandedCard(tabId, data) {
  if (!data || !data.success) return `<div class="route-card expanded" style="padding:20px; color:#94a3b8; font-size:13px;">No route found</div>`;

  const config  = TAB_CONFIG[tabId];
  const summary = data.summary;

  return `
    <div class="route-card expanded ${config.borderCls}" id="card-${tabId}">
      <div class="card-header ${config.headerCls}">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
          <button class="info-btn">${ICONS.info}</button>
        </div>
        <div class="card-header-right">
          <span class="card-fare ${config.fareCls}">₹${summary.total_cost_inr}</span>
          <span class="card-time">${summary.total_time_min} min</span>
        </div>
      </div>
      <p class="card-meta">${summary.transfers} transfer${summary.transfers !== 1 ? 's' : ''} · ${summary.total_stops} stop${summary.total_stops !== 1 ? 's' : ''}</p>

      <div class="steps">
        ${data.legs.map((leg, i) => buildStepRow(leg, i, data.legs.length)).join('')}
      </div>

      <div class="total-fare-bar" style="border-color:${config.accent}33; background:${config.bg}">
        <span class="total-fare-label" style="color:${config.accent}">Total Fare Breakdown</span>
        <span class="total-fare-amount" style="color:${config.accent}">₹${summary.total_cost_inr}</span>
      </div>

      <div style="margin: 0 12px 12px; text-align: center;">
        <button
          class="btn btn-outline"
          style="width:100%; font-size:13px;"
          onclick="saveRoute('${tabId}')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          Save this Route
        </button>
      </div>
    </div>
  `;
}

function buildStepRow(leg, index, totalLegs) {
  const iconType = leg.mode === 'transfer' ? 'transfer'
                 : leg.mode === 'metro'    ? 'metro'
                 : leg.mode === 'cab'      ? 'cab'
                 : leg.mode === 'train'    ? 'train'
                 : 'bus';
  const hasLine   = index < totalLegs - 1;
  const instruction = getInstruction(leg);

  return `
    <div class="step-row">
      <span class="step-dur">${leg.time_min}m</span>
      <div class="step-timeline">
        <div class="step-icon-circle ${leg.mode}-circle">${ICONS[iconType]}</div>
        ${hasLine ? `<div class="step-line ${leg.mode}-line"></div>` : ''}
      </div>
      <div class="step-content">
        <div class="step-info-row">
          <div>
            <div class="step-name">${instruction}</div>
            <div class="step-sub">${leg.time_min} min · ₹${leg.cost_inr}</div>
          </div>
          <div class="step-right">
            ${leg.mode !== 'transfer' ? `<span class="step-fare">₹${leg.cost_inr}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getInstruction(leg) {
  const from = `<span style="font-weight:600">${leg.from_stop}</span>`;
  const to   = `<span style="font-weight:600">${leg.to_stop}</span>`;

  if (leg.mode === 'transfer') return `Walk to ${to}`;
  if (leg.mode === 'bus')      return `Take <span style="color:#16a34a; font-weight:600">Bus ${leg.route_name || leg.route_id || ''}</span> from ${from} to ${to}`;
  if (leg.mode === 'metro')    return `Take <span style="color:#2563eb; font-weight:600">Metro ${leg.route_name || ''}</span> from ${from} to ${to}`;
  if (leg.mode === 'cab')      return `Take <span style="color:#d97706; font-weight:600">Cab / Auto</span> from ${from} to ${to}`;
  if (leg.mode === 'train')    return `Take <span style="color:#6366f1; font-weight:600">Local Train</span> from ${from} to ${to}`;
  return `Travel from ${from} to ${to} via ${leg.mode}`;
}

function buildCollapsedCard(id, data) {
  if (!data || !data.success) return '';
  const config  = TAB_CONFIG[id];
  const summary = data.summary;

  return `
    <div class="route-card collapsed" id="card-${id}" onclick="switchTab(null, '${id}')">
      <div class="card-header collapsed-header">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
          <span class="card-meta-inline">${summary.transfers} transfer${summary.transfers !== 1 ? 's' : ''}</span>
        </div>
        <div class="card-header-right">
          <span class="card-fare ${config.fareCls}">₹${summary.total_cost_inr}</span>
          <span class="card-time">${summary.total_time_min} min</span>
        </div>
      </div>
    </div>
  `;
}

function buildAllOptionsCard(id) {
  const config = TAB_CONFIG[id];
  return `
    <div class="route-card collapsed" id="card-${id}" onclick="switchTab(null, '${id}')">
      <div class="card-header collapsed-header">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
          <span class="card-meta-inline">Compare all available routes</span>
        </div>
      </div>
    </div>
  `;
}

function buildAllOptionsExpandedCard() {
  const config = TAB_CONFIG['all'];
  const routes = ROUTES_DATA.all || [];
  const tabKeys = ['cheapest', 'fastest', 'comfortable'];

  return `
    <div class="route-card expanded ${config.borderCls}" id="card-all">
      <div class="card-header ${config.headerCls}">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
        </div>
      </div>
      <div style="padding: 10px 0;">
        ${routes.map((r, i) => {
          if (!r || !r.success) return '';
          const key    = tabKeys[i];
          const pref   = TAB_CONFIG[key].label;
          const accent = TAB_CONFIG[key].accent;
          return `
            <div onclick="switchTab(null, '${key}')"
                 style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;"
                 onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <div>
                <div style="font-weight: 700; font-size: 14px;">${pref} Route</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                  ${r.summary.transfers} transfer${r.summary.transfers !== 1 ? 's' : ''} · ${r.summary.total_time_min} min · ${r.summary.total_stops} stops
                </div>
              </div>
              <div style="font-weight: 800; font-size: 18px; color: ${accent}">₹${r.summary.total_cost_inr}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(el, tabId) {
  if (!el) el = document.querySelector(`.tab[data-tab="${tabId}"]`);

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('tab-active', ...Object.values(TAB_COLOR_CLASS));
  });
  if (el) el.classList.add('tab-active', TAB_COLOR_CLASS[tabId]);

  activeTab = tabId;
  renderPanel(tabId);
  updateStats(tabId);
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function updateStats(tabId) {
  // For 'all' tab fall back to cheapest for the stats bar
  const key  = tabId === 'all' ? 'cheapest' : tabId;
  const data = ROUTES_DATA[key];
  if (!data || !data.success) return;

  const summary = data.summary;
  const els     = document.querySelectorAll('.stat-value');
  if (els.length >= 4) {
    els[0].textContent = `₹${summary.total_cost_inr}`;
    els[1].textContent = `${summary.total_time_min} min`;
    els[2].textContent = summary.transfers;
    els[3].textContent = `${summary.total_stops} stops`;
  }
}

// ── Save Route (localStorage, no login required) ──────────────────────────────
function saveRoute(tabId) {
  const data = ROUTES_DATA[tabId];
  if (!data || !data.success) {
    showToast('No route data to save.', 'error');
    return;
  }

  const key        = 'routewise_saved_routes';
  const savedRoutes = JSON.parse(localStorage.getItem(key) || '[]');

  // Deduplicate: same origin + destination + preference
  const isDuplicate = savedRoutes.some(r =>
    r.data.origin      === data.origin &&
    r.data.destination === data.destination &&
    r.preference       === tabId
  );

  if (isDuplicate) {
    showToast(`"${data.origin} → ${data.destination}" is already saved.`, 'info');
    return;
  }

  savedRoutes.push({
    id:          Date.now(),
    preference:  tabId,
    customName:  `${data.origin} → ${data.destination}`,
    data:        data,
    savedAt:     new Date().toISOString(),
  });

  try {
    localStorage.setItem(key, JSON.stringify(savedRoutes));
    showToast(`Route saved: ${data.origin} → ${data.destination}`, 'success');
  } catch (e) {
    // localStorage full or blocked
    showToast('Could not save route. Storage may be full.', 'error');
  }
}

// ── Toast notification ────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  // Remove any existing toast
  document.getElementById('rw-toast')?.remove();

  const colors = {
    success: { bg: '#16a34a', icon: '✓' },
    error:   { bg: '#ef4444', icon: '✕' },
    info:    { bg: '#2563eb', icon: 'ℹ' },
  };
  const { bg, icon } = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.id = 'rw-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${bg};
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    padding: 12px 18px;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    animation: rw-slide-in 0.25s ease;
    max-width: 320px;
  `;

  toast.innerHTML = `
    <span style="font-weight:700; font-size:15px;">${icon}</span>
    <span>${message}</span>
  `;

  // Inject keyframe if not already present
  if (!document.getElementById('rw-toast-style')) {
    const style = document.createElement('style');
    style.id = 'rw-toast-style';
    style.textContent = `
      @keyframes rw-slide-in  { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
      @keyframes rw-slide-out { from { opacity:1; transform: translateY(0); }  to { opacity:0; transform: translateY(12px); } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-dismiss after 3s
  setTimeout(() => {
    toast.style.animation = 'rw-slide-out 0.25s ease forwards';
    setTimeout(() => toast.remove(), 260);
  }, 3000);
}

// ── Swap locations ────────────────────────────────────────────────────────────
function swapLocations() {
  const fromInput = document.getElementById('from-input');
  const toInput   = document.getElementById('to-input');
  if (!fromInput || !toInput) return;

  // Swap values
  [fromInput.value, toInput.value] = [toInput.value, fromInput.value];

  // Re-fetch with the now-correct order
  const f = fromInput.value.trim();
  const t = toInput.value.trim();
  if (f && t && f !== t) fetchAllRoutes(f, t);
}

// ── Dark mode toggle ──────────────────────────────────────────────────────────
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('rw_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Restore saved theme on load
(function applyTheme() {
  if (localStorage.getItem('rw_theme') === 'dark') {
    document.body.classList.add('dark');
  }
})();

// ── Map stubs ─────────────────────────────────────────────────────────────────
function zoomIn()  {}
function zoomOut() {}
function startNavigation() { showToast('Navigation coming soon!', 'info'); }
function lessWalking()     { showToast('Recalculating with less walking…', 'info'); recalculate(); }