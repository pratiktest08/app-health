/* ═══════════════════════════════════════════════
   PL Capital — App Health Dashboard
   Shared JS: Theme · Sidebar · Charts · Alerts
═══════════════════════════════════════════════ */

/* ── Theme ────────────────────────────────── */
let isDark = true;

function initTheme() {
  const saved = localStorage.getItem('plc-theme') || 'dark';
  isDark = saved === 'dark';
  applyTheme();
}

function applyTheme() {
  document.documentElement.classList.toggle('dark',  isDark);
  document.documentElement.classList.toggle('light', !isDark);
  if (typeof onThemeChange === 'function') onThemeChange(isDark);
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('plc-theme', isDark ? 'dark' : 'light');
  applyTheme();
}

/* ── Sidebar nav highlight ─────────────────── */
function initNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('href') === path) el.classList.add('active');
  });
}

/* ── Alert panel ──────────────────────────── */
let alertOpen = false;
function toggleAlertPanel() {
  alertOpen = !alertOpen;
  const p = document.getElementById('alert-panel');
  if (p) p.style.transform = alertOpen ? 'translateX(0)' : 'translateX(100%)';
}

/* ── Live clock ───────────────────────────── */
function startClock() {
  const el = document.getElementById('last-update');
  if (!el) return;
  const tick = () => { el.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════
   CHART.JS DEFAULTS
══════════════════════════════════════════════ */
function gridColor()  { return isDark ? 'rgba(76,76,204,.1)'  : 'rgba(15,15,131,.07)'; }
function tickColor()  { return isDark ? '#9191C4' : '#6060A8'; }
function tooltipDefaults() {
  return {
    backgroundColor: isDark ? '#1F1F4D' : '#ffffff',
    titleColor:      isDark ? '#F0F0FF' : '#0F0F83',
    bodyColor:       isDark ? '#9191C4' : '#6060A8',
    borderColor:     'rgba(76,76,204,.3)',
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
    titleFont: { family: 'Figtree', size: 12, weight: '600' },
    bodyFont:  { family: 'Figtree', size: 11 },
  };
}

function baseScales(yLabel = '') {
  return {
    x: {
      grid: { color: gridColor(), drawBorder: false },
      ticks: { color: tickColor(), font: { family: 'Figtree', size: 10 } }
    },
    y: {
      grid: { color: gridColor(), drawBorder: false },
      ticks: { color: tickColor(), font: { family: 'Figtree', size: 10 } },
      title: yLabel ? { display: true, text: yLabel, color: tickColor(), font: { family: 'Figtree', size: 10 } } : {}
    }
  };
}

function baseLineOptions(yLabel = '') {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, ...tooltipDefaults() }
    },
    scales: baseScales(yLabel),
    elements: { point: { radius: 0, hoverRadius: 5, hoverBorderWidth: 2 } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };
}

function baseBarOptions(yLabel = '') {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipDefaults() }
    },
    scales: {
      ...baseScales(yLabel),
      x: { ...baseScales().x, grid: { display: false } }
    }
  };
}

/* ── Gradient helper ─────────────────────── */
function makeGrad(ctx, color, alpha1 = .3, alpha2 = 0, height = 200) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, color.replace(')', `,${alpha1})`).replace('rgb', 'rgba'));
  g.addColorStop(1, color.replace(')', `,${alpha2})`).replace('rgb', 'rgba'));
  return g;
}

/* ── Hex to rgba ─────────────────────────── */
function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function gradHex(ctx, hex, a1, a2, h = 220) {
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0, hexAlpha(hex, a1));
  g.addColorStop(1, hexAlpha(hex, a2));
  return g;
}

/* ── Export CSV helper ───────────────────── */
function exportCSV(rows, filename = 'export.csv') {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a   = Object.assign(document.createElement('a'), {
    href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
    download: filename
  });
  a.click();
}

/* ── Theme change → redraw charts ──────────── */
const _chartRefs = [];
function registerChart(c) { _chartRefs.push(c); }

function onThemeChange() {
  _chartRefs.forEach(c => {
    if (!c) return;
    if (c.options.scales?.x) { c.options.scales.x.grid.color = gridColor(); c.options.scales.x.ticks.color = tickColor(); }
    if (c.options.scales?.y) { c.options.scales.y.grid.color = gridColor(); c.options.scales.y.ticks.color = tickColor(); }
    if (c.options.plugins?.tooltip) Object.assign(c.options.plugins.tooltip, tooltipDefaults());
    c.update();
  });
}

/* ── Sidebar HTML (injected by each page) ── */
function buildSidebar(activePage) {
  const nav = [
    { label:'Overview', items:[
      { href:'index.html',           icon:'home',    text:'Dashboard' },
    ]},
    { label:'Monitoring', items:[
      { href:'app-performance.html', icon:'zap',     text:'App Performance' },
      { href:'user-analytics.html',  icon:'users',   text:'User Analytics' },
      { href:'trade-volume.html',    icon:'trending', text:'Trade Volume' },
      { href:'crash-anr.html',       icon:'alert',   text:'Crash & ANR' },
    ]},
    { label:'Reports', items:[
      { href:'reports.html',         icon:'file',    text:'Reports & Export' },
      { href:'alerts.html',          icon:'bell',    text:'Alerts & Config' },
    ]}
  ];

  const icons = {
    home:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
    zap:      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
    users:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
    trending: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
    alert:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    file:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    bell:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>',
  };

  let html = `
    <div style="display:flex;align-items:center;gap:12px;padding:18px 16px 16px;border-bottom:1px solid var(--border)">
      <div style="width:36px;height:36px;border-radius:10px;background:#0F0F83;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">PL</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);line-height:1">PL Capital</div>
        <div style="font-size:10.5px;color:var(--text-muted);margin-top:2px">Trading App</div>
      </div>
    </div>
    <nav style="flex:1;padding:10px 10px;overflow-y:auto">`;

  nav.forEach(section => {
    html += `<div class="nav-section-label">${section.label}</div>`;
    section.items.forEach(item => {
      const active = item.href === activePage ? 'active' : '';
      html += `<a href="${item.href}" class="nav-item ${active}">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[item.icon]}</svg>
        <span class="nav-label">${item.text}</span>
      </a>`;
    });
  });

  html += `</nav>
    <div style="padding:14px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:#4C4CCC;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0">AD</div>
      <div class="sidebar-user-info" style="min-width:0">
        <div style="font-size:12px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Admin User</div>
        <div style="font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">admin@plcapital.com</div>
      </div>
    </div>`;

  const el = document.getElementById('sidebar');
  if (el) el.innerHTML = html;
}

/* ── Alert panel HTML (injected) ──────────── */
const ALERTS_DATA = [
  { type:'danger', title:'ANR spike detected',    sub:'v3.1.0 · 14 events in 10 min', time:'2 min ago' },
  { type:'warn',   title:'Login failures rising', sub:'38 failures in last hour',     time:'14 min ago' },
  { type:'warn',   title:'Startup time elevated', sub:'Avg 2.4s on Android 12',       time:'32 min ago' },
  { type:'ok',     title:'Crash rate normalised', sub:'Back below 0.5% threshold',    time:'1 hr ago' },
  { type:'ok',     title:'Trade volume milestone',sub:'₹4M/day crossed for Q2',       time:'2 hr ago' },
];

function buildAlertPanel() {
  const wrap = document.getElementById('alert-panel');
  if (!wrap) return;
  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <span style="font-size:14px;font-weight:600;color:var(--text-primary)">Alerts</span>
      <button onclick="toggleAlertPanel()" style="background:none;border:none;cursor:pointer;color:var(--text-muted)">
        <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">`;
  ALERTS_DATA.forEach(a => { html += alertRowHTML(a); });
  html += '</div>';
  wrap.innerHTML = html;
}

function alertRowHTML(a) {
  const color = a.type === 'danger' ? '#EF4444' : a.type === 'warn' ? '#F59E0B' : '#1FB15A';
  const badge = a.type === 'danger' ? 'badge-danger' : a.type === 'warn' ? 'badge-warn' : 'badge-ok';
  const label = a.type === 'danger' ? 'CRITICAL' : a.type === 'warn' ? 'WARNING' : 'OK';
  return `<div class="alert-row" style="border-left-color:${color}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${a.title}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${a.sub}</div>
      </div>
      <span class="badge ${badge}">${label}</span>
    </div>
    <div style="font-size:10px;color:var(--text-muted);margin-top:5px">${a.time}</div>
  </div>`;
}

/* ── Topbar HTML (injected) ───────────────── */
function buildTopbar(pageLabel = 'Dashboard', pageDesc = '') {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div class="live-dot"></div>
      <span style="font-size:11.5px;color:var(--text-muted);font-weight:500">Live · <span id="last-update">--:--:--</span></span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <button onclick="toggleAlertPanel()" style="position:relative;width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card2);cursor:pointer;display:flex;align-items:center;justify-content:center">
        <svg style="width:15px;height:15px;color:var(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        <span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#EF4444;color:#fff;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:700">3</span>
      </button>
      <select id="timeRange" class="dash-select" style="font-size:11px">
        <option value="1h">Last 1 Hour</option>
        <option value="6h" selected>Last 6 Hours</option>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
      </select>
      <div style="display:flex;align-items:center;gap:6px">
        <svg style="width:13px;height:13px;color:var(--text-muted)" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>
        <div class="toggle-track" onclick="toggleTheme()"><div class="toggle-thumb"></div></div>
        <svg style="width:13px;height:13px;color:var(--text-muted)" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
      </div>
    </div>`;
}

/* ── Init all shared UI ───────────────────── */
function initShared(activePage, pageLabel = '', pageDesc = '') {
  initTheme();
  buildSidebar(activePage);
  buildTopbar(pageLabel, pageDesc);
  buildAlertPanel();
  startClock();
}
