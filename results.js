// ============================================
//  RouteWise — results.js
//  Single source of truth: PANEL_DATA drives
//  both the left panel cards AND the map.
// ============================================

// ── SVG icons (reusable strings) ─────────────────────────
const ICONS = {
  bus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 9h18M7 17v2M17 17v2" stroke="white" stroke-width="1.5" fill="none"/><circle cx="7.5" cy="15" r="1" fill="white"/><circle cx="16.5" cy="15" r="1" fill="white"/></svg>`,
  metro: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 9h16M8 18v2M16 18v2" stroke="white" stroke-width="1.5" fill="none"/><circle cx="8.5" cy="14" r="1" fill="white"/><circle cx="15.5" cy="14" r="1" fill="white"/></svg>`,
  walk: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><circle cx="12" cy="4" r="1.5" fill="#6b7280"/><path d="M9 8l2 2 2-4 3 2M9 14l1 6M13 14l2 6M9 8l-2 6h4l2-4"/></svg>`,
  cab:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="7" rx="2"/><circle cx="7.5" cy="18" r="2" fill="white"/><circle cx="16.5" cy="18" r="2" fill="white"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
};

// ── Full data for all 4 tabs ─────────────────────────────
const PANEL_DATA = {

  cheapest: {
    // ── Card meta ──
    label:     'Cheapest',
    badge:     1,
    badgeCls:  'badge-green',
    headerCls: 'green-header',
    borderCls: 'green-card',
    fareCls:   'green-fare',
    fare:      '₹60',
    time:      '45 min',
    meta:      '2 transfers · 18.7 km',
    // ── Why banner ──
    why: {
      text:   'This is the cheapest route based on current bus, metro and cab fares.',
      pill1:  { color: '#16a34a', icon: '✓', text: 'Saves ₹22 compared to fastest route', cls: 'green-pill' },
      pill2:  { text: 'Adds 13 min more', cls: 'grey-pill' },
    },
    // ── Steps ──
    steps: [
      { type: 'bus',   circleCls: 'bus-circle',   lineCls: 'bus-line',   dur: '12 min', name: 'Bus 23',          route: 'Pune Station (Platform 2) → Shivajinagar',  sub: '8 stops',  fare: '₹15', detail: '🕐 12 min · 🛑 8 stops · 💵 ₹15',         hasLine: true  },
      { type: 'metro', circleCls: 'metro-circle', lineCls: 'metro-line', dur: '20 min', name: 'Metro Blue Line', route: 'Shivajinagar Metro → Phase 1 (Hinjewadi)',   sub: '11 stops', fare: '₹30', detail: '🕐 20 min · 🛑 11 stops · 💵 ₹30',        hasLine: true  },
      { type: 'walk',  circleCls: 'walk-circle',  lineCls: 'walk-line',  dur: '5 min',  name: 'Walk',            route: 'Phase 1 Metro Station → Pickup Point',       sub: '350 m',    fare: '₹0',  detail: '',                                          hasLine: true  },
      { type: 'cab',   circleCls: 'cab-circle',   lineCls: '',           dur: '8 min',  name: 'Cab (Auto/Taxi)', route: 'Pickup Point → Hinjewadi Phase 1',           sub: '3.2 km',   fare: '₹15', detail: '🕐 8 min · 📏 3.2 km · 💵 ₹15',            hasLine: false },
    ],
    // ── Map ──
    map: {
      segments: [
        { d: 'M 30 18 Q 36 28 40 36',                       stroke: '#16a34a', dash: '2,1.5',   width: 0.9 },
        { d: 'M 40 36 Q 44 46 46 55 Q 48 63 52 68',        stroke: '#2563eb', dash: '',         width: 1.0 },
        { d: 'M 52 68 Q 58 70 64 72',                       stroke: '#9ca3af', dash: '1.5,1.5', width: 0.7 },
        { d: 'M 64 72 Q 72 76 80 80',                       stroke: '#d97706', dash: '',         width: 1.0 },
      ],
      dots: [
        { top: '27%', left: '34%', cls: 'bus-dot'   },
        { top: '33%', left: '37%', cls: 'bus-dot'   },
        { top: '41%', left: '43%', cls: 'metro-dot' },
        { top: '50%', left: '45%', cls: 'metro-dot' },
        { top: '58%', left: '47%', cls: 'metro-dot' },
      ],
      cards: [
        { top: '28%', left: '42%', name: 'Bus 23',          color: '#16a34a', detail: '12 min · 8 stops'  },
        { top: '50%', left: '53%', name: 'Metro Blue Line', color: '#2563eb', detail: '20 min · 11 stops' },
        { top: '63%', left: '61%', name: 'Walk',            color: '#6b7280', detail: '5 min · 350 m'     },
      ],
      endPos: { top: '76%', left: '77%' },
      stats:  { fare: '₹60', time: '45 min', transfers: '2', distance: '18.7 km' },
    },
    // ── Other cards shown collapsed below ──
    others: ['fastest', 'comfortable', 'all'],
  },

  fastest: {
    label:     'Fastest',
    badge:     1,
    badgeCls:  'badge-purple',
    headerCls: 'purple-header',
    borderCls: 'purple-card',
    fareCls:   'purple-fare',
    fare:      '₹82',
    time:      '32 min',
    meta:      '1 transfer · 16.4 km',
    why: {
      text:  'Fastest route using Metro Express directly to Phase 1, then a short cab ride.',
      pill1: { color: '#7c3aed', icon: '⚡', text: 'Saves 13 min vs cheapest route', cls: 'purple-pill' },
      pill2: { text: 'Costs ₹22 more', cls: 'grey-pill' },
    },
    steps: [
      { type: 'metro', circleCls: 'metro-circle', lineCls: 'metro-line', dur: '22 min', name: 'Metro Express',  route: 'Pune Station Metro → Phase 1 (Hinjewadi)',  sub: '9 stops',  fare: '₹52', detail: '🕐 22 min · 🛑 9 stops · 💵 ₹52',  hasLine: true  },
      { type: 'cab',   circleCls: 'cab-circle',   lineCls: '',           dur: '10 min', name: 'Cab (OLA)',      route: 'Phase 1 Station → Hinjewadi Phase 1',       sub: '4.1 km',   fare: '₹30', detail: '🕐 10 min · 📏 4.1 km · 💵 ₹30', hasLine: false },
    ],
    map: {
      segments: [
        { d: 'M 30 18 Q 38 30 48 46 Q 54 57 58 65', stroke: '#2563eb', dash: '',   width: 1.1 },
        { d: 'M 58 65 Q 68 70 80 75',               stroke: '#d97706', dash: '',   width: 1.0 },
      ],
      dots: [
        { top: '30%', left: '36%', cls: 'metro-dot' },
        { top: '40%', left: '42%', cls: 'metro-dot' },
        { top: '50%', left: '47%', cls: 'metro-dot' },
        { top: '58%', left: '52%', cls: 'metro-dot' },
      ],
      cards: [
        { top: '38%', left: '44%', name: 'Metro Express', color: '#2563eb', detail: '22 min · 9 stops' },
        { top: '62%', left: '62%', name: 'Cab (OLA)',      color: '#d97706', detail: '10 min · 4.1 km' },
      ],
      endPos: { top: '72%', left: '78%' },
      stats:  { fare: '₹82', time: '32 min', transfers: '1', distance: '16.4 km' },
    },
    others: ['cheapest', 'comfortable', 'all'],
  },

  comfortable: {
    label:     'Most Comfortable',
    badge:     1,
    badgeCls:  'badge-amber',
    headerCls: 'amber-header',
    borderCls: 'amber-card',
    fareCls:   'amber-fare',
    fare:      '₹95',
    time:      '38 min',
    meta:      '1 transfer · 17.6 km',
    why: {
      text:  'AC Bus all the way with fewer stops, then a short auto ride. Most comfortable experience.',
      pill1: { color: '#d97706', icon: '😊', text: 'AC bus · no crowding · 1 seat change', cls: 'amber-pill' },
      pill2: { text: 'Costs ₹35 more than cheapest', cls: 'grey-pill' },
    },
    steps: [
      { type: 'bus',  circleCls: 'bus-circle',  lineCls: 'bus-line',  dur: '28 min', name: 'AC Bus 156',  route: 'Pune Station → Hinjewadi Phase 1 Gate',   sub: '12 stops', fare: '₹80', detail: '🕐 28 min · 🛑 12 stops · ❄️ AC · 💵 ₹80', hasLine: true  },
      { type: 'walk', circleCls: 'walk-circle', lineCls: 'walk-line', dur: '6 min',  name: 'Walk',         route: 'Bus Stop → Pickup Point',                 sub: '400 m',    fare: '₹0',  detail: '',                                              hasLine: true  },
      { type: 'cab',  circleCls: 'cab-circle',  lineCls: '',          dur: '4 min',  name: 'Auto',         route: 'Pickup Point → Hinjewadi Phase 1',        sub: '1.2 km',   fare: '₹15', detail: '🕐 4 min · 📏 1.2 km · 💵 ₹15',               hasLine: false },
    ],
    map: {
      segments: [
        { d: 'M 30 18 Q 32 30 34 40 Q 36 52 40 60 Q 46 68 56 72', stroke: '#16a34a', dash: '3,1.5',   width: 1.1 },
        { d: 'M 56 72 Q 65 74 74 77',                              stroke: '#9ca3af', dash: '1.5,1.5', width: 0.7 },
        { d: 'M 74 77 Q 78 78 80 79',                              stroke: '#d97706', dash: '',         width: 1.0 },
      ],
      dots: [
        { top: '30%', left: '32%', cls: 'bus-dot' },
        { top: '40%', left: '34%', cls: 'bus-dot' },
        { top: '50%', left: '37%', cls: 'bus-dot' },
        { top: '60%', left: '41%', cls: 'bus-dot' },
      ],
      cards: [
        { top: '40%', left: '34%', name: 'AC Bus 156', color: '#16a34a', detail: '28 min · 12 stops' },
        { top: '67%', left: '58%', name: 'Walk',        color: '#6b7280', detail: '6 min · 400 m'    },
        { top: '74%', left: '73%', name: 'Auto',        color: '#d97706', detail: '4 min · 1.2 km'   },
      ],
      endPos: { top: '77%', left: '78%' },
      stats:  { fare: '₹95', time: '38 min', transfers: '1', distance: '17.6 km' },
    },
    others: ['cheapest', 'fastest', 'all'],
  },

  all: {
    label:     'All Options',
    badge:     1,
    badgeCls:  'badge-blue',
    headerCls: 'blue-header',
    borderCls: 'blue-card',
    fareCls:   'blue-fare',
    fare:      '₹60–₹120',
    time:      '32–50 min',
    meta:      '6 routes available',
    why: {
      text:  'All possible routes from Pune Station to Hinjewadi Phase 1, sorted by your preference.',
      pill1: { color: '#2563eb', icon: '📋', text: '6 routes compared in real-time', cls: 'blue-pill' },
      pill2: { text: 'Prices vary by time of day', cls: 'grey-pill' },
    },
    // Show a comparison table instead of steps
    steps: [
      { type: 'bus',   circleCls: 'bus-circle',   lineCls: 'bus-line',   dur: '45 min', name: 'Bus + Metro + Cab',    route: 'Cheapest option',      sub: '2 transfers', fare: '₹60', detail: '🏆 Best value · 18.7 km total', hasLine: true  },
      { type: 'metro', circleCls: 'metro-circle', lineCls: 'metro-line', dur: '32 min', name: 'Metro Express + Cab',  route: 'Fastest option',       sub: '1 transfer',  fare: '₹82', detail: '⚡ Quickest · 16.4 km total',  hasLine: true  },
      { type: 'bus',   circleCls: 'bus-circle',   lineCls: 'bus-line',   dur: '38 min', name: 'AC Bus + Auto',        route: 'Most comfortable',     sub: '1 transfer',  fare: '₹95', detail: '😊 AC bus · 17.6 km total',    hasLine: true  },
      { type: 'cab',   circleCls: 'cab-circle',   lineCls: '',           dur: '28 min', name: 'Direct Cab (OLA)',     route: 'Most expensive option',sub: '0 transfers', fare: '₹320',detail: '🚗 Door to door · 18.2 km',    hasLine: false },
    ],
    map: {
      segments: [
        { d: 'M 30 18 Q 36 28 40 36',                              stroke: '#16a34a', dash: '2,1.5',   width: 0.7, opacity: 0.5 },
        { d: 'M 40 36 Q 44 46 46 55 Q 48 63 52 68',               stroke: '#2563eb', dash: '',         width: 0.7, opacity: 0.5 },
        { d: 'M 52 68 Q 58 70 64 72',                              stroke: '#9ca3af', dash: '1.5,1.5', width: 0.5, opacity: 0.5 },
        { d: 'M 64 72 Q 72 76 80 80',                              stroke: '#d97706', dash: '',         width: 0.7, opacity: 0.5 },
        { d: 'M 30 18 Q 38 30 48 46 Q 54 57 58 65',               stroke: '#7c3aed', dash: '',         width: 0.7, opacity: 0.5 },
        { d: 'M 58 65 Q 68 70 80 75',                              stroke: '#d97706', dash: '',         width: 0.7, opacity: 0.5 },
        { d: 'M 30 18 Q 32 34 34 48 Q 36 58 42 66 Q 52 72 62 74', stroke: '#16a34a', dash: '3,1.5',   width: 0.7, opacity: 0.5 },
        { d: 'M 62 74 Q 70 76 80 78',                              stroke: '#d97706', dash: '',         width: 0.7, opacity: 0.5 },
      ],
      dots: [
        { top: '30%', left: '34%', cls: 'bus-dot'   },
        { top: '42%', left: '44%', cls: 'metro-dot' },
        { top: '55%', left: '48%', cls: 'metro-dot' },
      ],
      cards: [
        { top: '22%', left: '42%', name: '6 Routes Available', color: '#2563eb', detail: 'Tap to compare' },
      ],
      endPos: { top: '76%', left: '77%' },
      stats:  { fare: '₹60–₹320', time: '28–50 min', transfers: '0–2', distance: '16–19 km' },
    },
    others: ['cheapest', 'fastest', 'comfortable'],
  },
};

// ── Collapsed card data (for the "other" cards below) ────
const COLLAPSED_META = {
  cheapest:    { badge: 'badge-green',  label: 'Cheapest',          meta: '2 transfers · 18.7 km', fare: '₹60',  fareCls: 'green-fare',  time: '45 min', timeCls: '' },
  fastest:     { badge: 'badge-purple', label: 'Fastest',           meta: '1 transfer · 16.4 km',  fare: '₹82',  fareCls: 'purple-fare', time: '32 min', timeCls: 'purple-time' },
  comfortable: { badge: 'badge-amber',  label: 'Most Comfortable',  meta: '1 transfer · 17.6 km',  fare: '₹95',  fareCls: 'amber-fare',  time: '38 min', timeCls: 'amber-time'  },
  all:         { badge: 'badge-blue',   label: 'All Options',       meta: 'Compare all 6 routes',   fare: '',     fareCls: '',            time: '',       timeCls: '' },
};

// ── Tab color classes ─────────────────────────────────────
const TAB_COLOR_CLASS = {
  cheapest:    'tab-active-green',
  fastest:     'tab-active-purple',
  comfortable: 'tab-active-amber',
  all:         'tab-active-blue',
};

let activeTab = 'cheapest';

// ── Fixed order of all tabs — never changes ───────────────
const TAB_ORDER = ['cheapest', 'fastest', 'comfortable', 'all'];
const BADGE_NUM = { cheapest: 1, fastest: 2, comfortable: 3, all: 4 };

// ============================================================
//  PANEL RENDERER — always renders all 4 cards in fixed order
//  Active tab expands in its own slot, others collapse
// ============================================================

function renderPanel(tabId) {
  const container = document.getElementById('route-cards-scroll');
  if (!container) return;

  container.style.opacity    = '0';
  container.style.transition = 'opacity 0.2s ease';

  setTimeout(() => {
    container.innerHTML =
      TAB_ORDER.map(id =>
        id === tabId
          ? buildExpandedCard(id, PANEL_DATA[id])
          : buildCollapsedCard(id)
      ).join('')
      + buildWhyBanner(PANEL_DATA[tabId].why);

    container.style.opacity = '1';
  }, 200);
}

// ── Build the expanded (active) card ─────────────────────
function buildExpandedCard(tabId, data) {
  return `
    <div class="route-card expanded ${data.borderCls}" id="card-${tabId}">
      <div class="card-header ${data.headerCls}">
        <div class="card-header-left">
          <span class="badge ${data.badgeCls}">${BADGE_NUM[tabId]}</span>
          <span class="card-label">${data.label}</span>
          <button class="info-btn">${ICONS.info}</button>
        </div>
        <div class="card-header-right">
          <span class="card-fare ${data.fareCls}">${data.fare}</span>
          <span class="card-time">${data.time}</span>
        </div>
      </div>
      <p class="card-meta">${data.meta}</p>

      <div class="steps">
        ${data.steps.map((step, i) => buildStepRow(step, i, tabId)).join('')}
      </div>

      <div class="total-fare-bar" style="border-color:${getAccentColor(tabId)}33; background:${getAccentBg(tabId)}">
        <span class="total-fare-label" style="color:${getAccentColor(tabId)}">Total Fare</span>
        <span class="total-fare-amount" style="color:${getAccentColor(tabId)}">${data.fare}</span>
      </div>
    </div>
  `;
}

// ── Build a single step row ───────────────────────────────
function buildStepRow(step, index, tabId) {
  const isWalk    = step.type === 'walk';
  const isFree    = step.fare === '₹0';
  const stepId    = `step-${tabId}-${index}`;
  const hasDetail = step.detail !== '';

  return `
    <div class="step-row">
      <span class="step-dur">${step.dur}</span>
      <div class="step-timeline">
        <div class="step-icon-circle ${step.circleCls}">${ICONS[step.type]}</div>
        ${step.hasLine ? `<div class="step-line ${step.lineCls}"></div>` : ''}
      </div>
      <div class="step-content">
        <div class="step-info-row" ${hasDetail ? `onclick="toggleStep('${stepId}')"` : 'style="cursor:default"'}>
          <div>
            <div class="step-name">${step.name}</div>
            <div class="step-route">${step.route}</div>
            <div class="step-sub">${step.sub}</div>
          </div>
          <div class="step-right">
            <span class="step-fare ${isFree ? 'free-fare' : ''}">${step.fare}</span>
            ${hasDetail ? `<svg class="chevron" id="chev-${stepId}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>` : ''}
          </div>
        </div>
        ${hasDetail ? `<div class="step-detail" id="${stepId}"><span>${step.detail}</span></div>` : ''}
      </div>
    </div>
  `;
}

// ── Build a collapsed card ────────────────────────────────
function buildCollapsedCard(id) {
  const m = COLLAPSED_META[id];
  const chevron = `<svg class="card-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>`;
  const arrow   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>`;

  return `
    <div class="route-card collapsed" id="card-${id}">
      <div class="card-header collapsed-header" onclick="switchTab(document.querySelector('[data-tab=\\'${id}\\']'), '${id}')">
        <div class="card-header-left">
          <span class="badge ${m.badge}">${BADGE_NUM[id]}</span>
          <span class="card-label">${m.label}</span>
          <button class="info-btn" onclick="event.stopPropagation()">${ICONS.info}</button>
          <span class="card-meta-inline">${m.meta}</span>
        </div>
        <div class="card-header-right">
          ${m.fare ? `<span class="card-fare ${m.fareCls}">${m.fare}</span>` : ''}
          ${m.time ? `<span class="card-time ${m.timeCls}">${m.time}</span>` : ''}
          ${m.fare ? chevron : arrow}
        </div>
      </div>
    </div>
  `;
}

// ── Build why banner ─────────────────────────────────────
function buildWhyBanner(why) {
  return `
    <div class="why-banner">
      <div class="why-header">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#a855f7"/>
          </linearGradient></defs>
          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" fill="url(#wg)"/>
        </svg>
        <span class="why-title">Why this route?</span>
      </div>
      <p class="why-text">${why.text}</p>
      <div class="why-footer">
        <span class="why-pill ${why.pill1.cls}">
          <span style="color:${why.pill1.color}">${why.pill1.icon}</span>
          ${why.pill1.text}
        </span>
        <span class="why-pill grey-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          ${why.pill2.text}
        </span>
        <a href="#" class="why-link">Learn more</a>
      </div>
    </div>
  `;
}

// ── Accent color helpers ──────────────────────────────────
function getAccentColor(tabId) {
  return { cheapest: '#16a34a', fastest: '#7c3aed', comfortable: '#d97706', all: '#2563eb' }[tabId];
}

function getAccentBg(tabId) {
  return { cheapest: '#dcfce7', fastest: '#ede9fe', comfortable: '#fef3c7', all: '#dbeafe' }[tabId];
}

// ============================================================
//  MAIN switchTab — drives everything
// ============================================================
function switchTab(el, tabId) {
  if (!el) return;

  // 1. Update tab button colors
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('tab-active', ...Object.values(TAB_COLOR_CLASS));
  });
  el.classList.add('tab-active', TAB_COLOR_CLASS[tabId]);

  activeTab = tabId;

  // 2. Rebuild the left panel
  renderPanel(tabId);

  // 3. Update map
  updateMapRoutes(tabId);

  // 4. Update stats bar
  updateStats(tabId);
}

// ============================================================
//  MAP FUNCTIONS
// ============================================================
function updateMapRoutes(tabId) {
  const map = PANEL_DATA[tabId].map;
  const svg = document.querySelector('.route-svg');
  if (!svg) return;

  svg.style.opacity    = '0';
  svg.style.transition = 'opacity 0.25s ease';

  setTimeout(() => {
    svg.innerHTML = map.segments.map(s => `
      <path d="${s.d}" stroke="${s.stroke}" stroke-width="${s.width}" fill="none"
        ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}
        stroke-linecap="round" stroke-linejoin="round"
        opacity="${s.opacity !== undefined ? s.opacity : 1}"/>
    `).join('');

    updateDots(map.dots);
    updateInfoCards(map.cards);
    updateEndMarker(map.endPos);

    svg.style.opacity = '1';
  }, 250);
}

function updateDots(dots) {
  document.querySelectorAll('.route-dot').forEach(d => d.remove());
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  dots.forEach(dot => {
    const el = document.createElement('div');
    el.className  = `route-dot ${dot.cls}`;
    el.style.top  = dot.top;
    el.style.left = dot.left;
    mapEl.appendChild(el);
  });
}

function updateInfoCards(cards) {
  document.querySelectorAll('.map-info-card').forEach(c => c.remove());
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  cards.forEach(card => {
    const el = document.createElement('div');
    el.className  = 'map-info-card';
    el.style.top  = card.top;
    el.style.left = card.left;
    el.innerHTML  = `
      <span class="map-card-name" style="color:${card.color}">${card.name}</span>
      <span class="map-card-detail">${card.detail}</span>
    `;
    mapEl.appendChild(el);
  });
}

function updateEndMarker(pos) {
  const m = document.querySelector('.marker-end');
  if (!m) return;
  m.style.transition = 'top 0.4s ease, left 0.4s ease';
  m.style.top  = pos.top;
  m.style.left = pos.left;
}

function updateStats(tabId) {
  const s      = PANEL_DATA[tabId].map.stats;
  const els    = document.querySelectorAll('.stat-value');
  if (els.length < 4) return;
  [s.fare, s.time, s.transfers, s.distance].forEach((val, i) => {
    const el = els[i];
    el.style.opacity   = '0';
    el.style.transform = 'translateY(5px)';
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    setTimeout(() => {
      el.textContent     = val;
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 150 + i * 50);
  });
}

// ============================================================
//  STEP TOGGLE
// ============================================================
function toggleStep(id) {
  const detail = document.getElementById(id);
  const chev   = document.getElementById('chev-' + id);
  if (!detail) return;
  detail.classList.toggle('open');
  if (chev) chev.classList.toggle('open');
}

// ============================================================
//  NAVBAR / MISC
// ============================================================
function swapLocations() {
  const from = document.getElementById('from-input');
  const to   = document.getElementById('to-input');
  if (!from || !to) return;
  [from.value, to.value] = [to.value, from.value];
  const btn = document.querySelector('.swap-btn');
  if (btn) {
    btn.style.transition = 'transform 0.3s ease';
    btn.style.transform  = 'rotate(180deg)';
    setTimeout(() => { btn.style.transform = 'rotate(0deg)'; }, 320);
  }
}

function toggleTheme() { document.body.classList.toggle('dark'); }

let zoomLevel = 1;
function zoomIn()  { zoomLevel = Math.min(zoomLevel + 0.15, 2);   applyZoom(); }
function zoomOut() { zoomLevel = Math.max(zoomLevel - 0.15, 0.6); applyZoom(); }
function applyZoom() {
  const bg = document.querySelector('.map-bg');
  if (!bg) return;
  bg.style.transition      = 'transform 0.3s ease';
  bg.style.transformOrigin = 'center center';
  bg.style.transform       = `scale(${zoomLevel})`;
}

function recalculate() {
  const btn = document.querySelector('.btn-recalc');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.textContent = 'Recalculating...';
  btn.disabled    = true;
  updateMapRoutes(activeTab);
  setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1400);
}

function lessWalking() {
  const btn = document.querySelector('.btn-walk');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.textContent = 'Optimizing...';
  setTimeout(() => { btn.innerHTML = orig; }, 1200);
}

function startNavigation() {
  const btn = document.querySelector('.btn-navigate');
  if (!btn) return;
  btn.textContent = '⏳ Starting...';
  setTimeout(() => {
    btn.innerHTML    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg> Navigating...`;
    btn.style.background = 'linear-gradient(135deg,#059669,#0891b2)';
  }, 1000);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Render default tab (cheapest)
  renderPanel('cheapest');
  updateMapRoutes('cheapest');

  // Set initial tab button color
  const firstTab = document.querySelector('.tab[data-tab="cheapest"]');
  if (firstTab) firstTab.classList.add('tab-active-green');
});