/* ═══════════════════════════════════════
   App Performance Page JS
═══════════════════════════════════════ */

const LABELS_12H = ['06','07','08','09','10','11','12','13','14','15','16','17'];

/* ── Startup time chart ── */
function buildStartupChart() {
  const ctx = document.getElementById('startupChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: LABELS_12H,
      datasets:[
        { label:'Cold Start (s)', data:[2.1,2.3,2.0,1.9,1.8,1.85,1.8,1.75,1.8,1.82,1.78,1.8], borderColor:'#EF4444', backgroundColor:gradHex(ctx,'#EF4444',.18,0,200), fill:true, borderWidth:2, tension:.4 },
        { label:'Warm Start (s)', data:[1.0,1.1,0.95,0.9,0.88,0.9,0.92,0.89,0.9,0.91,0.9,0.9], borderColor:'#F59E0B', backgroundColor:gradHex(ctx,'#F59E0B',.14,0,200), fill:true, borderWidth:2, tension:.4 },
        { label:'Hot Start (s)',  data:[0.35,0.32,0.3,0.29,0.28,0.3,0.31,0.3,0.3,0.29,0.3,0.3], borderColor:'#1FB15A', backgroundColor:gradHex(ctx,'#1FB15A',.14,0,200), fill:true, borderWidth:2, tension:.4 },
      ]
    },
    options: baseLineOptions('Seconds')
  });
  registerChart(c);
}

/* ── FPS Chart ── */
function buildFpsChart() {
  const ctx = document.getElementById('fpsChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: LABELS_12H,
      datasets:[
        { label:'FPS', data:[60,58,60,57,56,59,60,58,59,60,58,59], borderColor:'#4C4CCC', backgroundColor:gradHex(ctx,'#4C4CCC',.22,0,175), fill:true, borderWidth:2.5, tension:.3 }
      ]
    },
    options:{
      ...baseLineOptions('FPS'),
      plugins:{
        ...baseLineOptions().plugins,
        annotation:{ annotations:{ thr:{ type:'line', yMin:50, yMax:50, borderColor:'rgba(245,158,11,.5)', borderWidth:1, borderDash:[5,5] } } }
      },
      scales:{ ...baseLineOptions().scales, y:{ ...baseLineOptions().scales.y, min:40, max:65 } }
    }
  });
  registerChart(c);
}

/* ── Network latency bar ── */
function buildNetworkChart() {
  const ctx = document.getElementById('networkChart').getContext('2d');
  const endpoints = ['/api/login','/api/trades','/api/portfolio','/api/market','/api/profile','/api/orders'];
  const latencies = [142,320,198,87,165,245];
  const colors = latencies.map(v => v > 250 ? '#EF4444' : v > 180 ? '#F59E0B' : '#1FB15A');
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels: endpoints,
      datasets:[{ label:'Avg Latency (ms)', data:latencies, backgroundColor:colors, borderRadius:6, borderSkipped:false }]
    },
    options:{
      ...baseBarOptions('ms'),
      plugins:{ ...baseBarOptions().plugins, legend:{display:false},
        tooltip:{ ...tooltipDefaults(), callbacks:{ label: ctx => `${ctx.raw} ms` } }
      }
    }
  });
  registerChart(c);
}

/* ── Memory / CPU ── */
function buildMemoryChart() {
  const ctx = document.getElementById('memoryChart').getContext('2d');
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: LABELS_12H,
      datasets:[
        { label:'Memory (MB)', data:[128,132,138,135,142,145,140,138,142,144,141,142], borderColor:'#4C4CCC', backgroundColor:gradHex(ctx,'#4C4CCC',.2,0,175), fill:true, borderWidth:2, tension:.4, yAxisID:'y' },
        { label:'CPU (%)',     data:[18,22,25,20,28,30,24,22,27,29,26,25], borderColor:'#F59E0B', backgroundColor:'transparent', borderWidth:2, tension:.4, borderDash:[4,4], yAxisID:'y1' },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true, labels:{ color: tickColor(), font:{family:'Figtree',size:11}, boxWidth:10, padding:16 } }, tooltip:{ mode:'index', intersect:false, ...tooltipDefaults() } },
      scales:{
        x:{ grid:{color:gridColor()}, ticks:{color:tickColor(),font:{family:'Figtree',size:10}} },
        y:{ grid:{color:gridColor()}, ticks:{color:tickColor(),font:{family:'Figtree',size:10}}, position:'left', title:{display:true,text:'MB',color:tickColor(),font:{family:'Figtree',size:10}} },
        y1:{ grid:{display:false}, ticks:{color:'#F59E0B',font:{family:'Figtree',size:10}}, position:'right', title:{display:true,text:'CPU %',color:'#F59E0B',font:{family:'Figtree',size:10}} },
      },
      elements:{ point:{radius:0,hoverRadius:5} }, interaction:{mode:'nearest',axis:'x',intersect:false}
    }
  });
  registerChart(c);
}

/* ── Slow renders table ── */
const SLOW_RENDERS = [
  { screen:'Portfolio Screen',    p50:'18ms', p90:'52ms', p99:'148ms', status:'warn' },
  { screen:'Trade History',       p50:'12ms', p90:'38ms', p99:'95ms',  status:'ok'   },
  { screen:'Market Overview',     p50:'22ms', p90:'68ms', p99:'210ms', status:'danger'},
  { screen:'Login Screen',        p50:'8ms',  p90:'21ms', p99:'48ms',  status:'ok'   },
  { screen:'Order Placement',     p50:'14ms', p90:'42ms', p99:'120ms', status:'ok'   },
  { screen:'Account Dashboard',   p50:'16ms', p90:'55ms', p99:'165ms', status:'warn' },
  { screen:'Watchlist',           p50:'10ms', p90:'28ms', p99:'72ms',  status:'ok'   },
];

function renderSlowTable() {
  const tbody = document.getElementById('slow-tbody');
  if (!tbody) return;
  tbody.innerHTML = SLOW_RENDERS.map(r => {
    const cls = r.status === 'danger' ? 'badge-danger' : r.status === 'warn' ? 'badge-warn' : 'badge-ok';
    const lbl = r.status === 'danger' ? 'SLOW' : r.status === 'warn' ? 'WARN' : 'OK';
    return `<tr>
      <td style="font-weight:600">${r.screen}</td>
      <td style="color:var(--text-muted)">${r.p50}</td>
      <td style="color:var(--text-muted)">${r.p90}</td>
      <td style="font-weight:600;color:${r.status==='danger'?'#EF4444':r.status==='warn'?'#F59E0B':'#1FB15A'}">${r.p99}</td>
      <td><span class="badge ${cls}">${lbl}</span></td>
    </tr>`;
  }).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('app-performance.html','App Performance','Firebase Performance · Play Console');
  buildStartupChart();
  buildFpsChart();
  buildNetworkChart();
  buildMemoryChart();
  renderSlowTable();
});
