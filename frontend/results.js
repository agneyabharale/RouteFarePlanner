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
  cheapest: { label: 'Cheapest', badge: 1, badgeCls: 'badge-green', headerCls: 'green-header', borderCls: 'green-card', fareCls: 'green-fare', accent: '#16a34a', bg: '#dcfce7' },
  fastest: { label: 'Fastest', badge: 2, badgeCls: 'badge-purple', headerCls: 'purple-header', borderCls: 'purple-card', fareCls: 'purple-fare', accent: '#7c3aed', bg: '#ede9fe' },
  comfortable: { label: 'Comfortable', badge: 3, badgeCls: 'badge-amber', headerCls: 'amber-header', borderCls: 'amber-card', fareCls: 'amber-fare', accent: '#d97706', bg: '#fef3c7' },
  all: { label: 'All Options', badge: 4, badgeCls: 'badge-blue', headerCls: 'blue-header', borderCls: 'blue-card', fareCls: 'blue-fare', accent: '#2563eb', bg: '#dbeafe' }
};

const TAB_COLOR_CLASS = {
  cheapest: 'tab-active-green',
  fastest: 'tab-active-purple',
  comfortable: 'tab-active-amber',
  all: 'tab-active-blue',
};

// ── Initialization ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');
  const to = urlParams.get('to');
  const pref = urlParams.get('pref') || 'cheap';

  if (from) document.getElementById('from-input').value = decodeURIComponent(from);
  if (to) document.getElementById('to-input').value = decodeURIComponent(to);

  activeTab = pref === 'cheap' ? 'cheapest' : (pref === 'fastest' ? 'fastest' : (pref === 'comfy' ? 'comfortable' : 'all'));

  // Initial tab styling
  const initialTabBtn = document.querySelector(`.tab[data-tab="${activeTab}"]`);
  if (initialTabBtn) initialTabBtn.classList.add('tab-active', TAB_COLOR_CLASS[activeTab]);

  await fetchAllRoutes(from, to);
});

async function fetchAllRoutes(start, end) {
  const container = document.getElementById('route-cards-scroll');
  container.innerHTML = '<div style="padding: 20px; text-align: center;">Planning your routes...</div>';

  const prefs = ['cheapest', 'fastest', 'comfiest'];
  const promises = prefs.map(p => fetchRoute(start, end, p));
  
  try {
    const results = await Promise.all(promises);
    ROUTES_DATA.cheapest = results[0];
    ROUTES_DATA.fastest = results[1];
    ROUTES_DATA.comfortable = results[2];
    ROUTES_DATA.all = results;

    renderPanel(activeTab);
    updateStats(activeTab);
  } catch (err) {
    container.innerHTML = '<div style="padding: 20px; color: #ef4444;">Error fetching routes. Please try again.</div>';
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

// ── Rendering ─────────────────────────────────────
function renderPanel(tabId) {
  const container = document.getElementById('route-cards-scroll');
  if (!container) return;

  const order = ['cheapest', 'fastest', 'comfortable', 'all'];
  
  let html = order.map(id => {
    const data = ROUTES_DATA[id];
    if (id === tabId) {
      if (id === 'all') return buildAllOptionsExpandedCard();
      return buildExpandedCard(id, data);
    } else {
      if (id === 'all') return buildAllOptionsCard(id);
      return buildCollapsedCard(id, data);
    }
  }).join('');

  container.innerHTML = html;
}

function buildExpandedCard(tabId, data) {
  if (!data || !data.success) return `<div class="route-card expanded">No data found</div>`;
  
  const config = TAB_CONFIG[tabId];
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
      <p class="card-meta">${summary.transfers} transfers · ${summary.total_stops} stops</p>

      <div class="steps">
        ${data.legs.map((leg, i) => buildStepRow(leg, i, data.legs.length)).join('')}
      </div>

      <div class="total-fare-bar" style="border-color:${config.accent}33; background:${config.bg}">
        <span class="total-fare-label" style="color:${config.accent}">Total Fare Breakdown</span>
        <span class="total-fare-amount" style="color:${config.accent}">₹${summary.total_cost_inr}</span>
      </div>
      
      <div class="save-route-section" style="margin-top: 15px; text-align: center;">
          <button class="btn btn-outline" onclick="saveRoute('${tabId}')">Save this Route</button>
      </div>
    </div>
  `;
}

function buildStepRow(leg, index, totalLegs) {
  const iconType = leg.mode === 'transfer' ? 'transfer' : (leg.mode === 'metro' ? 'metro' : (leg.mode === 'cab' ? 'cab' : 'bus'));
  const hasLine = index < totalLegs - 1;
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
    const to = `<span style="font-weight:600">${leg.to_stop}</span>`;
    
    if (leg.mode === 'transfer') return `Walk to ${to}`;
    if (leg.mode === 'bus') return `Take <span style="color:#16a34a; font-weight:600">Bus ${leg.route_name || leg.route_id || ''}</span> from ${from} to ${to}`;
    if (leg.mode === 'metro') return `Take <span style="color:#2563eb; font-weight:600">Metro ${leg.route_name || ''}</span> from ${from} to ${to}`;
    if (leg.mode === 'cab') return `Take <span style="color:#d97706; font-weight:600">Cab / Auto</span> from ${from} to ${to}`;
    return `Travel from ${from} to ${to} via ${leg.mode}`;
}

function buildCollapsedCard(id, data) {
  if (!data || !data.success) return '';
  const config = TAB_CONFIG[id];
  const summary = data.summary;

  return `
    <div class="route-card collapsed" id="card-${id}" onclick="switchTab(null, '${id}')">
      <div class="card-header collapsed-header">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
          <span class="card-meta-inline">${summary.transfers} transfers</span>
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
    
    return `
    <div class="route-card expanded ${config.borderCls}" id="card-all">
      <div class="card-header ${config.headerCls}">
        <div class="card-header-left">
          <span class="badge ${config.badgeCls}">${config.badge}</span>
          <span class="card-label">${config.label}</span>
        </div>
      </div>
      <div class="all-options-list" style="padding: 10px 0;">
        ${routes.map((r, i) => {
            if (!r || !r.success) return '';
            const pref = ['Cheapest', 'Fastest', 'Comfortable'][i];
            return `
                <div class="option-row" onclick="switchTab(null, '${['cheapest', 'fastest', 'comfortable'][i]}')" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600;">${pref} Route</div>
                        <div style="font-size: 0.8rem; color: #666;">${r.summary.transfers} transfers · ${r.summary.total_time_min} min</div>
                    </div>
                    <div style="font-weight: 700; color: ${TAB_CONFIG[['cheapest', 'fastest', 'comfortable'][i]].accent}">₹${r.summary.total_cost_inr}</div>
                </div>
            `;
        }).join('')}
      </div>
    </div>
    `;
}

function switchTab(el, tabId) {
  if (!el) {
    el = document.querySelector(`.tab[data-tab="${tabId}"]`);
  }
  
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('tab-active', ...Object.values(TAB_COLOR_CLASS));
  });
  if (el) el.classList.add('tab-active', TAB_COLOR_CLASS[tabId]);

  activeTab = tabId;
  renderPanel(tabId);
  updateStats(tabId);
}

function updateStats(tabId) {
  const data = ROUTES_DATA[tabId];
  if (!data || !data.success) return;
  const summary = data.summary;
  
  const els = document.querySelectorAll('.stat-value');
  if (els.length >= 4) {
      els[0].textContent = `₹${summary.total_cost_inr}`;
      els[1].textContent = `${summary.total_time_min} min`;
      els[2].textContent = summary.transfers;
      els[3].textContent = `${summary.total_stops} stops`;
  }
}

// ── Save Route ─────────────────────────────────────
function saveRoute(tabId) {
    const data = ROUTES_DATA[tabId];
    if (!data) return;

    const customName = prompt("Enter a custom name for this route:", `${data.origin} to ${data.destination}`);
    if (!customName) return;

    const savedRoutes = JSON.parse(localStorage.getItem('saved_routes') || '[]');
    savedRoutes.push({
        id: Date.now(),
        customName,
        data: data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('saved_routes', JSON.stringify(savedRoutes));
    alert("Route saved successfully!");
}

// ── Map Stubs (since map is skipped) ──────────────────
function zoomIn() {}
function zoomOut() {}
function swapLocations() {
    const from = document.getElementById('from-input');
    const to = document.getElementById('to-input');
    [from.value, to.value] = [to.value, from.value];
    fetchAllRoutes(from.value, to.value);
}