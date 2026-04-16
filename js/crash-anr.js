/* ═══════════════════════════════════════
   Crash & ANR Page JS
═══════════════════════════════════════ */

const DAYS_14 = Array.from({length:14},(_,i)=>{ const d=new Date('2026-04-03'); d.setDate(d.getDate()+i); return d.toLocaleDateString('en',{month:'short',day:'numeric'}); });

/* ── Crash / ANR trend ── */
function buildCrashTrendChart() {
  const ctx = document.getElementById('crashTrendChart').getContext('2d');
  const crashes = [28,32,25,41,38,29,22,30,35,42,38,31,34,34];
  const anrs    = [8, 10,7, 14,12,8, 6, 9, 11,14,12,9, 12,12];
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: DAYS_14,
      datasets:[
        { label:'Crashes', data:crashes, borderColor:'#EF4444', backgroundColor:gradHex(ctx,'#EF4444',.2,0,230), fill:true, borderWidth:2.5, tension:.4 },
        { label:'ANRs',    data:anrs,    borderColor:'#F59E0B', backgroundColor:gradHex(ctx,'#F59E0B',.14,0,230), fill:true, borderWidth:2, tension:.4 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true, labels:{color:tickColor(),font:{family:'Figtree',size:11},boxWidth:10,padding:16} }, tooltip:{ mode:'index', intersect:false, ...tooltipDefaults() } },
      scales:{ x:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}}}, y:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}},min:0} },
      elements:{ point:{radius:0,hoverRadius:5} }, interaction:{mode:'nearest',axis:'x',intersect:false}
    }
  });
  registerChart(c);
}

/* ── Crash by OS ── */
function buildOsChart() {
  const ctx = document.getElementById('osChart').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{
      labels:['Android 12','Android 13','Android 14','Android 11','Android 10','iOS 17','iOS 16'],
      datasets:[{ label:'Crash Count', data:[14,8,4,5,2,1,0], backgroundColor:['#EF4444','#F59E0B','#1FB15A','#F97316','#9191C4','#4C4CCC','#6060A8'], borderRadius:6, borderSkipped:false }]
    },
    options:{ ...baseBarOptions('Count'), plugins:{...baseBarOptions().plugins,legend:{display:false}} }
  });
}

/* ── Crash by version ── */
function buildVersionCrashChart() {
  const ctx = document.getElementById('versionCrashChart').getContext('2d');
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['v3.1.0','v3.2.1','v3.0.x','Older'],
      datasets:[{ data:[52,28,14,6], backgroundColor:['#EF4444','#F59E0B','#F97316','#9191C4'], borderWidth:0, hoverOffset:6 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'right', labels:{color:tickColor(),font:{family:'Figtree',size:11},boxWidth:10,padding:12} }, tooltip:{...tooltipDefaults()} }, cutout:'68%' }
  });
}

/* ── Crash issues table ── */
const CRASHES = [
  { id:'CRH-001', title:'NullPointerException in TradeViewModel',          count:14, users:12, version:'v3.1.0', os:'Android 12', status:'open',          first:'Apr 10' },
  { id:'CRH-002', title:'IndexOutOfBoundsException in PortfolioAdapter',   count:8,  users:7,  version:'v3.2.1', os:'Android 13', status:'investigating',  first:'Apr 12' },
  { id:'CRH-003', title:'OutOfMemoryError in MarketChart render',          count:6,  users:6,  version:'v3.1.0', os:'Android 12', status:'open',           first:'Apr 09' },
  { id:'CRH-004', title:'IllegalStateException in SessionManager',         count:4,  users:4,  version:'v3.0.x', os:'Android 11', status:'resolved',       first:'Apr 03' },
  { id:'CRH-005', title:'SocketTimeoutException in OrderService',          count:2,  users:2,  version:'v3.2.1', os:'Android 14', status:'open',           first:'Apr 14' },
];

const ANRS = [
  { id:'ANR-001', title:'Main thread blocked in PortfolioLoader',     count:8,  users:7,  version:'v3.1.0', os:'Android 12', status:'open',         first:'Apr 11' },
  { id:'ANR-002', title:'Deadlock in DatabaseHelper.getConnection()', count:3,  users:3,  version:'v3.2.1', os:'Android 13', status:'investigating', first:'Apr 13' },
  { id:'ANR-003', title:'Slow layout inflate in TradeHistoryScreen',  count:1,  users:1,  version:'v3.0.x', os:'Android 10', status:'resolved',     first:'Apr 05' },
];

function renderCrashTable() {
  const tbody = document.getElementById('crash-tbody');
  if (!tbody) return;
  const sCls = { open:'badge-danger', investigating:'badge-warn', resolved:'badge-ok' };
  tbody.innerHTML = CRASHES.map(r => `<tr>
    <td style="font-family:monospace;font-size:11px;color:#4C4CCC;font-weight:600">${r.id}</td>
    <td style="font-weight:600;max-width:280px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.title}</div></td>
    <td style="font-weight:700;color:#EF4444">${r.count}</td>
    <td style="color:var(--text-muted)">${r.users}</td>
    <td><span class="chip">${r.version}</span></td>
    <td style="color:var(--text-muted);font-size:11px">${r.os}</td>
    <td><span class="badge ${sCls[r.status]}">${r.status.toUpperCase()}</span></td>
    <td style="color:var(--text-muted);font-size:11px">${r.first}</td>
  </tr>`).join('');
}

function renderAnrTable() {
  const tbody = document.getElementById('anr-tbody');
  if (!tbody) return;
  const sCls = { open:'badge-danger', investigating:'badge-warn', resolved:'badge-ok' };
  tbody.innerHTML = ANRS.map(r => `<tr>
    <td style="font-family:monospace;font-size:11px;color:#F59E0B;font-weight:600">${r.id}</td>
    <td style="font-weight:600;max-width:280px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.title}</div></td>
    <td style="font-weight:700;color:#F59E0B">${r.count}</td>
    <td style="color:var(--text-muted)">${r.users}</td>
    <td><span class="chip">${r.version}</span></td>
    <td style="color:var(--text-muted);font-size:11px">${r.os}</td>
    <td><span class="badge ${sCls[r.status]}">${r.status.toUpperCase()}</span></td>
    <td style="color:var(--text-muted);font-size:11px">${r.first}</td>
  </tr>`).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('crash-anr.html','Crash & ANR','Google Play Console · Firebase Crashlytics');
  buildCrashTrendChart();
  buildOsChart();
  buildVersionCrashChart();
  renderCrashTable();
  renderAnrTable();
});
