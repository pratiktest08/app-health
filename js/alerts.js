/* ═══════════════════════════════════════
   Alerts & Config Page JS
═══════════════════════════════════════ */

/* ── Alert rules ── */
const ALERT_RULES = [
  { id:'RUL-001', metric:'Crash Rate',        condition:'> 1%',        window:'5 min avg',  severity:'critical', channels:'Slack, Email', enabled:true  },
  { id:'RUL-002', metric:'ANR Rate',           condition:'> 0.5%',      window:'10 min avg', severity:'warning',  channels:'Slack',        enabled:true  },
  { id:'RUL-003', metric:'Login Failures',     condition:'> 50/hr',     window:'Rolling 1h', severity:'critical', channels:'Email',        enabled:true  },
  { id:'RUL-004', metric:'App Startup Time',   condition:'> 3s',        window:'P90 15 min', severity:'warning',  channels:'Slack',        enabled:true  },
  { id:'RUL-005', metric:'Trade Volume',       condition:'< 80% avg',   window:'Hourly',     severity:'warning',  channels:'Slack, Email', enabled:true  },
  { id:'RUL-006', metric:'Active Users Drop',  condition:'> 30% drop',  window:'vs 1h ago',  severity:'critical', channels:'Slack, Email', enabled:false },
  { id:'RUL-007', metric:'Network Latency',    condition:'> 500ms',     window:'P99 rolling',severity:'warning',  channels:'Slack',        enabled:true  },
  { id:'RUL-008', metric:'Memory Usage',       condition:'> 200 MB',    window:'5 min avg',  severity:'info',     channels:'Email',        enabled:false },
];

/* ── Active alerts ── */
const ACTIVE_ALERTS = [
  { id:'ALT-088', rule:'ANR Rate',          severity:'critical', value:'0.31%', threshold:'0.5%', triggered:'17:28:42', ack:false },
  { id:'ALT-087', rule:'Login Failures',    severity:'warning',  value:'38/hr', threshold:'50/hr',triggered:'16:55:00', ack:true  },
  { id:'ALT-086', rule:'App Startup Time',  severity:'warning',  value:'2.4s',  threshold:'3s',   triggered:'16:32:10', ack:true  },
];

/* ── Alert history ── */
const ALERT_HISTORY = [
  { id:'ALT-085', rule:'Crash Rate',          severity:'critical', value:'1.2%', threshold:'1%',   fired:'Apr 15 14:22', resolved:'Apr 15 14:48', duration:'26 min' },
  { id:'ALT-084', rule:'Trade Volume',         severity:'warning',  value:'74%',  threshold:'80%',  fired:'Apr 15 09:10', resolved:'Apr 15 10:30', duration:'1h 20m' },
  { id:'ALT-083', rule:'Login Failures',       severity:'critical', value:'68/hr',threshold:'50/hr',fired:'Apr 14 22:05', resolved:'Apr 14 23:15', duration:'1h 10m' },
  { id:'ALT-082', rule:'ANR Rate',             severity:'warning',  value:'0.48%',threshold:'0.5%', fired:'Apr 14 11:40', resolved:'Apr 14 12:05', duration:'25 min' },
  { id:'ALT-081', rule:'App Startup Time',     severity:'warning',  value:'3.1s', threshold:'3s',   fired:'Apr 13 08:15', resolved:'Apr 13 08:50', duration:'35 min' },
  { id:'ALT-080', rule:'Active Users Drop',    severity:'critical', value:'38%',  threshold:'30%',  fired:'Apr 12 16:00', resolved:'Apr 12 16:45', duration:'45 min' },
];

function renderRulesTable() {
  const tbody = document.getElementById('rules-tbody');
  if (!tbody) return;
  const sevCls = { critical:'badge-danger', warning:'badge-warn', info:'badge-info' };
  tbody.innerHTML = ALERT_RULES.map(r => `<tr>
    <td style="font-family:monospace;font-size:11px;color:#4C4CCC;font-weight:600">${r.id}</td>
    <td style="font-weight:600">${r.metric}</td>
    <td style="color:var(--text-muted)">${r.condition}</td>
    <td style="color:var(--text-muted);font-size:11px">${r.window}</td>
    <td><span class="badge ${sevCls[r.severity]}">${r.severity.toUpperCase()}</span></td>
    <td style="color:var(--text-muted);font-size:11px">${r.channels}</td>
    <td>
      <label class="switch">
        <input type="checkbox" ${r.enabled?'checked':''} onchange="toggleRule('${r.id}',this.checked)">
        <span class="switch-slider"></span>
      </label>
    </td>
    <td>
      <div style="display:flex;gap:6px">
        <button class="btn-secondary" style="padding:3px 10px;font-size:11px">Edit</button>
        <button class="btn-danger" style="padding:3px 10px;font-size:11px">Delete</button>
      </div>
    </td>
  </tr>`).join('');
}

function renderActiveAlerts() {
  const wrap = document.getElementById('active-alerts');
  if (!wrap) return;
  const sevCls = { critical:'badge-danger', warning:'badge-warn' };
  const bdrClr = { critical:'#EF4444', warning:'#F59E0B' };
  wrap.innerHTML = ACTIVE_ALERTS.map(a => `
    <div class="alert-row" style="border-left-color:${bdrClr[a.severity]};border-radius:10px;padding:14px 16px;background:var(--bg-card2);margin-bottom:8px;border-left-width:4px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="badge ${sevCls[a.severity]}">${a.severity.toUpperCase()}</span>
            <span style="font-family:monospace;font-size:10px;color:var(--text-muted)">${a.id}</span>
            ${a.ack?'<span class="badge badge-muted">ACK\'d</span>':''}
          </div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${a.rule}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">
            Current: <span style="font-weight:600;color:${bdrClr[a.severity]}">${a.value}</span>
            &nbsp;·&nbsp; Threshold: ${a.threshold}
            &nbsp;·&nbsp; Since: ${a.triggered}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${!a.ack?`<button class="btn-secondary" onclick="ackAlert('${a.id}')">Acknowledge</button>`:''}
          <button class="btn-primary">Investigate →</button>
        </div>
      </div>
    </div>`).join('');
}

function renderHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;
  const sevCls = { critical:'badge-danger', warning:'badge-warn' };
  tbody.innerHTML = ALERT_HISTORY.map(a => `<tr>
    <td style="font-family:monospace;font-size:11px;color:#4C4CCC;font-weight:600">${a.id}</td>
    <td style="font-weight:600">${a.rule}</td>
    <td><span class="badge ${sevCls[a.severity]}">${a.severity.toUpperCase()}</span></td>
    <td style="font-weight:600;color:#EF4444">${a.value}</td>
    <td style="color:var(--text-muted)">${a.threshold}</td>
    <td style="color:var(--text-muted);font-size:11px">${a.fired}</td>
    <td style="color:var(--text-muted);font-size:11px">${a.resolved}</td>
    <td style="color:#1FB15A;font-weight:600">${a.duration}</td>
  </tr>`).join('');
}

/* ── Alerts by day/severity bar ── */
function buildAlertVolumeChart() {
  const ctx = document.getElementById('alertVolumeChart');
  if (!ctx) return;
  const days = ['Apr 10','Apr 11','Apr 12','Apr 13','Apr 14','Apr 15','Apr 16'];
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels:days,
      datasets:[
        { label:'Critical', data:[1,2,3,2,3,1,1], backgroundColor:'#EF4444AA', borderRadius:4, borderSkipped:false },
        { label:'Warning',  data:[3,2,4,3,5,3,2], backgroundColor:'#F59E0BAA', borderRadius:4, borderSkipped:false },
        { label:'Info',     data:[1,0,1,2,1,1,0], backgroundColor:'#4C4CCCAA', borderRadius:4, borderSkipped:false },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true, labels:{color:tickColor(),font:{family:'Figtree',size:11},boxWidth:10,padding:14} }, tooltip:{...tooltipDefaults()} },
      scales:{ x:{grid:{display:false},ticks:{color:tickColor(),font:{family:'Figtree',size:10}},stacked:true}, y:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}},stacked:true} }
    }
  });
  registerChart(c);
}

function toggleRule(id, enabled) {
  const rule = ALERT_RULES.find(r=>r.id===id);
  if (rule) rule.enabled = enabled;
}

function ackAlert(id) {
  const a = ACTIVE_ALERTS.find(a=>a.id===id);
  if (a) { a.ack = true; renderActiveAlerts(); }
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('alerts.html','Alerts & Config','Rules · Active Alerts · History · Channels');
  renderRulesTable();
  renderActiveAlerts();
  renderHistory();
  buildAlertVolumeChart();
});
