/* ═══════════════════════════════════════
   Dashboard Page JS
═══════════════════════════════════════ */

const LABELS_18H = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17'];
const CRASH_D  = [0.30,0.28,0.35,0.42,0.38,0.29,0.31,0.45,0.52,0.48,0.41,0.39,0.42,0.38,0.44,0.42,0.40,0.42];
const ANR_D    = [0.12,0.10,0.15,0.18,0.22,0.14,0.16,0.28,0.31,0.25,0.20,0.19,0.21,0.18,0.24,0.31,0.28,0.31];
const SESSION_D= [1200,980,850,720,650,800,1400,2800,4200,5600,6800,7200,7800,8000,8100,8241,8100,8241];
const TRADE_D  = [0.2,0.1,0.1,0.05,0.08,0.15,0.45,1.2,2.1,2.8,3.2,3.5,3.8,4.0,4.1,4.2,4.15,4.2];

const METRICS = [
  { metric:'Crash Rate',      current:'0.42%',   source:'Google Play / Firebase',   threshold:'> 1%',         status:'ok'   },
  { metric:'ANR Rate',        current:'0.31%',   source:'Google Play Console',      threshold:'> 0.5%',       status:'warn' },
  { metric:'Login Failures',  current:'18/hr',   source:'Internal DB',              threshold:'> 50/hr',      status:'ok'   },
  { metric:'App Startup',     current:'1.8s',    source:'Firebase Performance',     threshold:'> 3s',         status:'ok'   },
  { metric:'Trade Volume',    current:'₹4.2M',   source:'Internal DB',              threshold:'< 80% avg',    status:'ok'   },
  { metric:'Active Users',    current:'8,241',   source:'Firebase Analytics',       threshold:'< 5,000',      status:'ok'   },
  { metric:'App Rating',      current:'4.3 ★',   source:'Play Store / App Store',   threshold:'< 3.5',        status:'ok'   },
  { metric:'Session Duration',current:'6m 12s',  source:'Firebase Analytics',       threshold:'< 2m',         status:'ok'   },
];

let crashChart, sessionChart, tradeChart, versionChart;

function buildCrashChart() {
  const ctx = document.getElementById('crashChart').getContext('2d');
  const gC = gradHex(ctx,'#EF4444',.22,0,220);
  const gA = gradHex(ctx,'#F59E0B',.16,0,220);
  crashChart = new Chart(ctx, {
    type:'line',
    data:{
      labels: LABELS_18H,
      datasets:[
        { label:'Crash %', data:[...CRASH_D], borderColor:'#EF4444', backgroundColor:gC, fill:true, borderWidth:2, tension:.4 },
        { label:'ANR %',   data:[...ANR_D],   borderColor:'#F59E0B', backgroundColor:gA, fill:true, borderWidth:2, tension:.4 },
      ]
    },
    options:{
      ...baseLineOptions('%'),
      plugins:{
        ...baseLineOptions().plugins,
        annotation:{
          annotations:{
            thr:{ type:'line', yMin:.5, yMax:.5, borderColor:'rgba(239,68,68,.4)', borderWidth:1, borderDash:[5,5],
              label:{ content:'Crash threshold 1%', display:true, position:'end', color:'#EF4444', font:{size:9,family:'Figtree'} } }
          }
        }
      }
    }
  });
  registerChart(crashChart);
}

function buildSessionChart() {
  const ctx = document.getElementById('sessionChart').getContext('2d');
  sessionChart = new Chart(ctx, {
    type:'line',
    data:{ labels:LABELS_18H, datasets:[{ label:'Sessions', data:[...SESSION_D], borderColor:'#4C4CCC', backgroundColor:gradHex(ctx,'#4C4CCC',.28,0,175), fill:true, borderWidth:2.5, tension:.4 }] },
    options: baseLineOptions('Users')
  });
  registerChart(sessionChart);
}

function buildTradeChart() {
  const ctx = document.getElementById('tradeChart').getContext('2d');
  tradeChart = new Chart(ctx, {
    type:'line',
    data:{ labels:LABELS_18H, datasets:[{ label:'₹M', data:[...TRADE_D], borderColor:'#1FB15A', backgroundColor:gradHex(ctx,'#1FB15A',.28,0,175), fill:true, borderWidth:2.5, tension:.4 }] },
    options: baseLineOptions('₹M')
  });
  registerChart(tradeChart);
}

function buildVersionChart() {
  const ctx = document.getElementById('versionChart').getContext('2d');
  versionChart = new Chart(ctx, {
    type:'doughnut',
    data:{ labels:['v3.2.1','v3.1.0','v3.0.x','Older'], datasets:[{ data:[58,27,11,4], backgroundColor:['#0F0F83','#4C4CCC','#1FB15A','#9191C4'], borderWidth:0, hoverOffset:6 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{...tooltipDefaults()} }, cutout:'72%' }
  });
}

function renderAlertFeed() {
  const feed = document.getElementById('alert-feed');
  if (!feed) return;
  feed.innerHTML = ALERTS_DATA.map(a => alertRowHTML(a)).join('');
}

function renderMetricsTable() {
  const tbody = document.getElementById('metrics-tbody');
  if (!tbody) return;
  tbody.innerHTML = METRICS.map(r => {
    const cls = r.status === 'warn' ? 'badge-warn' : 'badge-ok';
    const lbl = r.status === 'warn' ? 'WARNING' : 'HEALTHY';
    return `<tr>
      <td style="font-weight:600">${r.metric}</td>
      <td style="font-weight:700;color:#4C4CCC">${r.current}</td>
      <td style="color:var(--text-muted)">${r.source}</td>
      <td style="color:var(--text-muted)">${r.threshold}</td>
      <td><span class="badge ${cls}">${lbl}</span></td>
    </tr>`;
  }).join('');
}

function buildHeatmap() {
  const days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = Array.from({length:24},(_,i)=>(i<10?'0':'')+i+':00');
  const data  = days.map(()=>hours.map(()=>Math.floor(Math.random()*800+50)));

  let html = `<div style="display:grid;grid-template-columns:34px repeat(24,1fr);gap:3px;min-width:580px">`;
  html += '<div></div>';
  hours.forEach((h,i)=>{ if(i%4===0) html+=`<div style="grid-column:span 4;font-size:9px;color:var(--text-muted);text-align:center">${h}</div>`; });
  days.forEach((d,di)=>{
    html+=`<div style="font-size:10px;color:var(--text-muted);display:flex;align-items:center">${d}</div>`;
    data[di].forEach(v=>{
      const a=(0.07+v/850*.86).toFixed(2);
      html+=`<div class="hm-cell" title="${v} logins" style="background:rgba(76,76,204,${a})"></div>`;
    });
  });
  html+='</div>';
  html+=`<div style="display:flex;align-items:center;gap:6px;margin-top:10px">
    <span style="font-size:10px;color:var(--text-muted)">Low</span>
    ${[.1,.25,.4,.6,.8,1].map(v=>`<div style="width:16px;height:10px;border-radius:2px;background:rgba(76,76,204,${(0.07+v*.86).toFixed(2)})"></div>`).join('')}
    <span style="font-size:10px;color:var(--text-muted)">High</span>
  </div>`;
  document.getElementById('heatmap').innerHTML = html;
}

function doExportCSV() {
  exportCSV(
    [['Metric','Current','Source','Threshold','Status'], ...METRICS.map(r=>[r.metric,r.current,r.source,r.threshold,r.status])],
    'plcapital-health-report.csv'
  );
}

/* Live simulation */
let _loginCount = 18, _activeUsers = 8241;
function liveSimulate() {
  _loginCount  = Math.max(5,  Math.min(49,  _loginCount  + Math.floor(Math.random()*5-2)));
  _activeUsers = Math.max(7000,Math.min(10000,_activeUsers + Math.floor(Math.random()*60-20)));
  const lf = document.getElementById('login-fail-count');
  const au = document.getElementById('active-count');
  if (lf) lf.textContent = _loginCount;
  if (au) au.textContent = _activeUsers.toLocaleString();
  if (crashChart) {
    crashChart.data.datasets[0].data.push(+(0.25+Math.random()*.35).toFixed(2)); crashChart.data.datasets[0].data.shift();
    crashChart.data.datasets[1].data.push(+(0.08+Math.random()*.25).toFixed(2)); crashChart.data.datasets[1].data.shift();
    crashChart.update('none');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('index.html','Dashboard','PL Capital Trading · Production');
  buildCrashChart();
  buildSessionChart();
  buildTradeChart();
  buildVersionChart();
  renderAlertFeed();
  renderMetricsTable();
  buildHeatmap();
  setInterval(liveSimulate, 3000);
});
