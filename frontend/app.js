/* ══════════════════════════════════════════
   RoutePlanner — app.js
   ══════════════════════════════════════════ */

'use strict';

/* ── DATA ── */

const STAYS = [
  { name: 'Ocean View Resort', loc: 'Goa, India', rating: 4.6, price: '₹2,499', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop' },
  { name: 'Mountain Bliss Hostel', loc: 'Manali, Himachal', rating: 4.3, price: '₹799', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
  { name: 'City Center Stay', loc: 'Bangalore, Karnataka', rating: 4.5, price: '₹1,299', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' },
  { name: 'Backpacker Hostel', loc: 'Rishikesh, Uttarakhand', rating: 4.2, price: '₹599', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa' },
  { name: 'Beachside Villa', loc: 'Pondicherry', rating: 4.7, price: '₹2,199', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85' },
  { name: 'Heritage Stay', loc: 'Jaipur, Rajasthan', rating: 4.4, price: '₹1,899', img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791' },
];

const POPULAR_ROUTES = [
  { from: 'Mumbai', to: 'Pune', modes: ['bus', 'cab'], fare: '₹160', time: '2h 45m' },
  { from: 'Delhi', to: 'Jaipur', modes: ['bus', 'cab'], fare: '₹220', time: '4h 30m' },
  { from: 'Bangalore', to: 'Mysore', modes: ['bus', 'cab'], fare: '₹180', time: '3h 15m' },
  { from: 'Hyderabad', to: 'Vijayawada', modes: ['plane', 'bus'], fare: '₹250', time: '4h 10m' },
];

const RECENT_SEARCHES = [
  { from: 'Home', to: 'Office', when: 'Today, 8:30 AM', fare: '₹120', time: '35 min' },
  { from: 'Pune Station', to: 'Airport', when: 'Yesterday, 6:45 PM', fare: '₹240', time: '50 min' },
  { from: 'Wakad', to: 'Hinjewadi', when: 'May 12, 4:20 PM', fare: '₹60', time: '25 min' },
  { from: 'Mumbai', to: 'Lonavala', when: 'May 10, 9:10 AM', fare: '₹180', time: '1h 45m' },
  { from: 'Shivajinagar', to: 'Baner', when: 'May 8, 7:30 AM', fare: '₹40', time: '20 min' },
];

const RECENT_ROUTES = [
  { modes: ['bus', 'metro'], from: 'Wakad', to: 'Hinjewadi', fare: '₹60', time: '25 min' },
  { modes: ['metro', 'cab'], from: 'Pune Station', to: 'Airport', fare: '₹240', time: '50 min' },
  { modes: ['bus', 'metro'], from: 'Home', to: 'Office', fare: '₹120', time: '35 min' },
  { modes: ['green', 'pink'], from: 'Pune', to: 'Lonavala', fare: '₹180', time: '1h 45m' },
  { modes: ['teal', 'pink'], from: 'Baner', to: 'Aundh', fare: '₹50', time: '20 min' },
];

/* ── RENDER HELPERS ── */

const modeEmoji = { bus: '🚌', metro: '🚇', cab: '🚕', plane: '✈️', green: '🚌', pink: '🚇', teal: '🚇' };

function modeChip(type) {
  return `<span class="mode-chip ${type}">${modeEmoji[type] || '🚌'}</span>`;
}

function modeDot(type) {
  const cls = { bus: 'bus', metro: 'metro', cab: 'cab', plane: 'plane', green: 'green', pink: 'pink', teal: 'teal' };
  return `<span class="mode-dot ${cls[type] || 'bus'}">${modeEmoji[type] || '🚌'}</span>`;
}

/* ── STAYS ── */
function renderStays() {
  const container = document.getElementById('stays-row');
  if (!container) return;

  container.innerHTML = STAYS.map((s, i) => `
    <div class="stay-card" style="animation: fadeUp 0.45s ease ${0.05 * i}s both">
      <div class="stay-img-wrap">
        <img src="${s.img}" class="stay-img" />
        <button class="stay-fav-btn" data-fav="false" aria-label="Favourite">🤍</button>
      </div>
      <div class="stay-info">
        <div class="stay-name">${s.name}</div>
        <div class="stay-loc">${s.loc}</div>
        <div class="stay-meta">
          <span class="star">★</span>
          <span class="stay-rating">${s.rating}</span>
          <span class="stay-price">${s.price}/night</span>
        </div>
      </div>
    </div>
  `).join('');

  // Heart toggle
  container.querySelectorAll('.stay-fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const faved = btn.dataset.fav === 'true';
      btn.dataset.fav = String(!faved);
      btn.textContent = faved ? '🤍' : '❤️';
    });
  });
}

/* ── POPULAR ROUTES ── */
function renderPopularRoutes() {
  const container = document.getElementById('popular-routes');
  if (!container) return;

  container.innerHTML = POPULAR_ROUTES.map(r => `
    <div class="route-row">
      <span class="route-name">
        ${r.from} <span class="route-arrow">→</span> ${r.to}
      </span>
      <div class="route-modes">${r.modes.map(modeChip).join('')}</div>
      <div class="route-meta">
        <div class="route-fare">${r.fare}</div>
        <div class="route-time">${r.time}</div>
      </div>
    </div>
  `).join('');
}

/* ── RECENT SEARCHES ── */
function renderRecentSearches() {
  const container = document.getElementById('recent-searches');
  if (!container) return;

  container.innerHTML = RECENT_SEARCHES.map(r => `
    <div class="recent-row">
      <div class="clock-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="recent-info">
        <div class="recent-route">
          ${r.from} <span class="sr-arrow">→</span> ${r.to}
        </div>
        <div class="recent-when">
          ${r.when}
          <span class="dot">•</span> ${r.fare}
          <span class="dot">•</span> ${r.time}
        </div>
      </div>
    </div>
  `).join('');
}

/* ── RECENT ROUTES ── */
function renderRecentRoutes() {
  const container = document.getElementById('recent-routes');
  if (!container) return;

  container.innerHTML = RECENT_ROUTES.map(r => `
    <div class="saved-row">
      <div class="mode-dots">${r.modes.map(modeDot).join('')}</div>
      <div class="saved-info">
        <div class="saved-route">
          ${r.from} <span class="sr-arrow">→</span> ${r.to}
        </div>
        <div class="saved-meta">${r.fare} • ${r.time}</div>
      </div>
      <button class="bookmark-btn" aria-label="Save route">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  `).join('');
}

/* ── PREFERENCE PILLS ── */
function initPrefs() {
  const pills = document.querySelectorAll('.pref-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
}

/* ── SWAP BUTTON ── */
function initSwap() {
  const btn = document.getElementById('swap-btn');
  const from = document.getElementById('from-input');
  const to = document.getElementById('to-input');
  if (!btn || !from || !to) return;

  btn.addEventListener('click', () => {
    const tmp = from.value;
    from.value = to.value;
    to.value = tmp;
  });
}

/* ── PLAN ROUTE ── */
function initPlanBtn() {
  const btn = document.getElementById('plan-btn');
  const from = document.getElementById('from-input');
  const to = document.getElementById('to-input');
  if (!btn) return;

  function shake(el) {
    el.closest('.search-field').style.borderColor = 'rgba(239,68,68,0.5)';
    el.closest('.search-field').style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
    setTimeout(() => {
      el.closest('.search-field').style.borderColor = '';
      el.closest('.search-field').style.boxShadow = '';
    }, 1800);
  }

  btn.addEventListener('click', () => {
    const f = from.value.trim();
    const t = to.value.trim();
    let valid = true;

    if (!f) { shake(from); valid = false; }
    if (!t) { shake(to); valid = false; }
    if (!valid) return;

    // Get active preference
    const activePref = document.querySelector('.pref-pill.active');
    const pref = activePref ? activePref.dataset.pref : 'cheap';

    // Navigate to route results page
    window.location.href = `results.html?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}&pref=${encodeURIComponent(pref)}`;
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderStays();
  renderPopularRoutes();
  renderRecentSearches();
  renderRecentRoutes();
  initPrefs();
  initSwap();
  initPlanBtn();
  initAutocomplete('from-input', 'from-autocomplete');
  initAutocomplete('to-input', 'to-autocomplete');
});

/* ── AUTOCOMPLETE LOGIC ── */
function initAutocomplete(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/stops/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          renderAutocomplete(data.results, dropdown, input);
        } else {
          dropdown.style.display = 'none';
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    }, 300);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { dropdown.style.display = 'none'; }, 200);
  });
}

function renderAutocomplete(results, dropdown, input) {
  dropdown.innerHTML = results.map(stop => `
    <div class="autocomplete-item" data-id="${stop.id}" data-name="${stop.name}">
      <span class="name">${stop.name}</span>
      <span class="type">${stop.type.replace('_', ' ')}</span>
    </div>
  `).join('');

  dropdown.style.display = 'block';

  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      input.value = item.dataset.name;
      input.dataset.selectedId = item.dataset.id;
      dropdown.style.display = 'none';
    });
  });
}
