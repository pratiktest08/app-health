/* ═══════════════════════════════════════
   User Analytics Page JS
═══════════════════════════════════════ */

const DAYS_30 = Array.from({length:30},(_,i)=>{ const d=new Date('2026-03-18'); d.setDate(d.getDate()+i); return d.toLocaleDateString('en',{month:'short',day:'numeric'}); });

/* ── DAU / MAU trend ── */
function buildDauChart() {
  const ctx = document.getElementById('dauChart').getContext('2d');
  const dau = [6200,6400,6100,6800,7000,6900,7200,7500,7100,7400,7600,7800,7900,8000,7800,8100,8200,8000,8241,8300,8100,8400,8500,8300,8600,8700,8500,8800,8900,8241];
  const mau = Array(30).fill(null).map((_,i)=>Math.round(120000+i*200+Math.random()*500));
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: DAYS_30,
      datasets:[
        { label:'DAU',  data:dau, borderColor:'#4C4CCC', backgroundColor:gradHex(ctx,'#4C4CCC',.22,0,230), fill:true, borderWidth:2.5, tension:.4, yAxisID:'y' },
        { label:'MAU÷15', data:mau.map(v=>Math.round(v/15)), borderColor:'#1FB15A', backgroundColor:'transparent', borderWidth:2, tension:.4, borderDash:[5,5], yAxisID:'y' },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true, labels:{ color:tickColor(), font:{family:'Figtree',size:11}, boxWidth:10, padding:16 } }, tooltip:{ mode:'index', intersect:false, ...tooltipDefaults() } },
      scales:{ x:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:9},maxTicksLimit:10}}, y:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}}} },
      elements:{ point:{radius:0,hoverRadius:5} }, interaction:{mode:'nearest',axis:'x',intersect:false}
    }
  });
  registerChart(c);
}

/* ── Retention curve ── */
function buildRetentionChart() {
  const ctx = document.getElementById('retentionChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels:['Day 0','Day 1','Day 3','Day 7','Day 14','Day 21','Day 30'],
      datasets:[
        { label:'v3.2.1', data:[100,68,54,41,32,28,24], borderColor:'#4C4CCC', borderWidth:2.5, tension:.3, fill:false },
        { label:'v3.1.0', data:[100,62,48,35,26,22,18], borderColor:'#1FB15A', borderWidth:2, tension:.3, fill:false, borderDash:[5,5] },
        { label:'v3.0.x', data:[100,55,40,28,19,15,12], borderColor:'#9191C4', borderWidth:1.5, tension:.3, fill:false, borderDash:[3,3] },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true, labels:{ color:tickColor(), font:{family:'Figtree',size:11}, boxWidth:10, padding:16 } }, tooltip:{ ...tooltipDefaults(), callbacks:{ label: ctx=>`${ctx.dataset.label}: ${ctx.raw}%` } } },
      scales:{ x:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}}}, y:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10},callback:v=>v+'%'},min:0,max:100} },
      elements:{ point:{radius:3,hoverRadius:6} }, interaction:{mode:'nearest',axis:'x',intersect:false}
    }
  });
  registerChart(c);
}

/* ── Session distribution ── */
function buildSessionDistChart() {
  const ctx = document.getElementById('sessionDistChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels:['< 1m','1-2m','2-5m','5-10m','10-20m','> 20m'],
      datasets:[{ label:'Users', data:[820,1240,2800,2100,980,301], backgroundColor:['#9191C4','#4C4CCC','#0F0F83','#4C4CCC','#9191C4','#6060A8'], borderRadius:6, borderSkipped:false }]
    },
    options:{...baseBarOptions('Users'), plugins:{...baseBarOptions().plugins,legend:{display:false}}}
  });
  registerChart(c);
}

/* ── Geo donut ── */
function buildGeoChart() {
  const ctx = document.getElementById('geoChart').getContext('2d');
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Others'],
      datasets:[{ data:[28,22,18,12,10,10], backgroundColor:['#0F0F83','#4C4CCC','#1FB15A','#F59E0B','#9191C4','#6060A8'], borderWidth:0, hoverOffset:6 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'right', labels:{color:tickColor(),font:{family:'Figtree',size:11},boxWidth:10,padding:12} }, tooltip:{...tooltipDefaults()} }, cutout:'68%' }
  });
}

/* ── Top screens table ── */
const TOP_SCREENS = [
  { screen:'Portfolio Overview', sessions:'24,820', avgTime:'4m 12s', bounceRate:'8%',  change:'+5%'  },
  { screen:'Market Overview',    sessions:'18,340', avgTime:'6m 48s', bounceRate:'5%',  change:'+12%' },
  { screen:'Order Placement',    sessions:'14,200', avgTime:'2m 30s', bounceRate:'12%', change:'+8%'  },
  { screen:'Trade History',      sessions:'9,870',  avgTime:'3m 10s', bounceRate:'14%', change:'-2%'  },
  { screen:'Watchlist',          sessions:'8,420',  avgTime:'5m 22s', bounceRate:'6%',  change:'+18%' },
  { screen:'Account Settings',   sessions:'3,100',  avgTime:'1m 45s', bounceRate:'22%', change:'-5%'  },
];

function renderScreensTable() {
  const tbody = document.getElementById('screens-tbody');
  if (!tbody) return;
  tbody.innerHTML = TOP_SCREENS.map(r => {
    const up = r.change.startsWith('+');
    return `<tr>
      <td style="font-weight:600">${r.screen}</td>
      <td style="color:#4C4CCC;font-weight:600">${r.sessions}</td>
      <td style="color:var(--text-muted)">${r.avgTime}</td>
      <td style="color:var(--text-muted)">${r.bounceRate}</td>
      <td style="font-weight:600;color:${up?'#1FB15A':'#EF4444'}">${r.change}</td>
    </tr>`;
  }).join('');
}

/* ── Funnel ── */
function buildFunnelChart() {
  const ctx = document.getElementById('funnelChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels:['App Open','Login','View Portfolio','Browse Market','Place Order','Order Complete'],
      datasets:[{ label:'Users', data:[10000,8750,7200,5800,3200,3136], backgroundColor:['#0F0F83','#1414A0','#4C4CCC','#6666D4','#8080DC','#1FB15A'], borderRadius:6, borderSkipped:false }]
    },
    options:{
      indexAxis:'y',
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ ...tooltipDefaults(), callbacks:{ label: ctx=>` ${ctx.raw.toLocaleString()} users (${(ctx.raw/10000*100).toFixed(1)}%)` } } },
      scales:{ x:{grid:{color:gridColor()},ticks:{color:tickColor(),font:{family:'Figtree',size:10}}}, y:{grid:{display:false},ticks:{color:tickColor(),font:{family:'Figtree',size:11}}} }
    }
  });
  registerChart(c);
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('user-analytics.html','User Analytics','Firebase Analytics · 30-day view');
  buildDauChart();
  buildRetentionChart();
  buildSessionDistChart();
  buildGeoChart();
  renderScreensTable();
  buildFunnelChart();
});
