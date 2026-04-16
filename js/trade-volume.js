/* ═══════════════════════════════════════
   Trade Volume Page JS
═══════════════════════════════════════ */

const HOURS_24 = Array.from({length:24},(_,i)=>(i<10?'0':'')+i+':00');

/* ── Hourly trade volume ── */
function buildHourlyChart() {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const vol = [0.05,0.02,0.01,0.01,0.02,0.08,0.25,0.85,1.42,1.78,1.95,1.65,1.40,1.20,1.38,1.52,1.60,1.45,1.20,0.95,0.72,0.45,0.28,0.12];
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels: HOURS_24,
      datasets:[{ label:'Volume (₹M)', data:vol, backgroundColor: vol.map(v=>v>1.5?'#0F0F83':v>0.8?'#4C4CCC':'rgba(76,76,204,.45)'), borderRadius:5, borderSkipped:false }]
    },
    options:{
      ...baseBarOptions('₹M'),
      plugins:{ ...baseBarOptions().plugins, tooltip:{ ...tooltipDefaults(), callbacks:{ label:ctx=>`₹${ctx.raw.toFixed(2)}M` } } }
    }
  });
  registerChart(c);
}

/* ── Trade count line ── */
function buildTradeCountChart() {
  const ctx = document.getElementById('tradeCountChart').getContext('2d');
  const cnt  = [4,2,1,1,3,18,62,185,248,310,342,298,260,225,264,290,310,280,235,188,145,92,58,24];
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: HOURS_24,
      datasets:[{ label:'Trades', data:cnt, borderColor:'#1FB15A', backgroundColor:gradHex(ctx,'#1FB15A',.22,0,200), fill:true, borderWidth:2.5, tension:.4 }]
    },
    options: baseLineOptions('Trades')
  });
  registerChart(c);
}

/* ── Asset class donut ── */
function buildAssetChart() {
  const ctx = document.getElementById('assetChart').getContext('2d');
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Equities','Mutual Funds','F&O','Bonds','ETFs','Commodities'],
      datasets:[{ data:[42,22,18,8,6,4], backgroundColor:['#0F0F83','#4C4CCC','#1FB15A','#F59E0B','#9191C4','#6060A8'], borderWidth:0, hoverOffset:6 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'right', labels:{color:tickColor(),font:{family:'Figtree',size:11},boxWidth:10,padding:12} }, tooltip:{...tooltipDefaults()} }, cutout:'70%' }
  });
}

/* ── 30-day trend ── */
function buildTrendChart() {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const vol30 = [3.1,3.4,2.9,3.6,3.8,4.0,3.7,3.5,3.9,4.1,4.3,4.0,3.8,4.2,4.4,4.1,3.9,4.2,4.5,4.3,4.0,4.2,4.4,4.6,4.3,4.1,4.4,4.6,4.8,4.2];
  const days30 = Array.from({length:30},(_,i)=>{ const d=new Date('2026-03-18'); d.setDate(d.getDate()+i); return d.toLocaleDateString('en',{month:'short',day:'numeric'}); });
  const c = new Chart(ctx, {
    type:'line',
    data:{
      labels: days30,
      datasets:[{ label:'Volume (₹M)', data:vol30, borderColor:'#4C4CCC', backgroundColor:gradHex(ctx,'#4C4CCC',.22,0,175), fill:true, borderWidth:2.5, tension:.4 }]
    },
    options:{
      ...baseLineOptions('₹M'),
      scales:{ ...baseLineOptions().scales, x:{ ...baseLineOptions().scales.x, ticks:{ ...baseLineOptions().scales.x.ticks, maxTicksLimit:10 } } }
    }
  });
  registerChart(c);
}

/* ── Top instruments ── */
const TOP_INSTRUMENTS = [
  { name:'RELIANCE',   type:'Equity',  trades:248, volume:'₹8.42L',  change:'+2.4%', dir:1 },
  { name:'NIFTY50 FUT',type:'F&O',     trades:195, volume:'₹12.10L', change:'+0.8%', dir:1 },
  { name:'HDFC BANK',  type:'Equity',  trades:182, volume:'₹6.80L',  change:'-1.2%', dir:0 },
  { name:'INFY',       type:'Equity',  trades:164, volume:'₹5.22L',  change:'+3.1%', dir:1 },
  { name:'AXIS BANK MF',type:'MF',     trades:142, volume:'₹4.95L',  change:'+0.4%', dir:1 },
  { name:'TCS',        type:'Equity',  trades:138, volume:'₹4.80L',  change:'-0.7%', dir:0 },
  { name:'BANKNIFTY',  type:'F&O',     trades:120, volume:'₹9.60L',  change:'+1.5%', dir:1 },
];

function renderInstrumentTable() {
  const tbody = document.getElementById('instrument-tbody');
  if (!tbody) return;
  tbody.innerHTML = TOP_INSTRUMENTS.map((r,i) => `<tr>
    <td style="font-weight:700;color:var(--text-muted)">#${i+1}</td>
    <td style="font-weight:700">${r.name}</td>
    <td><span class="chip">${r.type}</span></td>
    <td style="color:var(--text-muted)">${r.trades}</td>
    <td style="font-weight:600;color:#4C4CCC">${r.volume}</td>
    <td style="font-weight:700;color:${r.dir?'#1FB15A':'#EF4444'}">${r.change}</td>
  </tr>`).join('');
}

/* ── Recent trades ── */
const RECENT_TRADES = [
  { id:'TXN-8821', user:'U-4421', instrument:'RELIANCE', type:'BUY',  qty:50,  price:'₹2,940', amount:'₹1,47,000', status:'success', time:'17:42:18' },
  { id:'TXN-8820', user:'U-1182', instrument:'NIFTY FUT','type':'SELL', qty:2,   price:'₹22,840','amount':'₹45,680',  status:'success', time:'17:41:55' },
  { id:'TXN-8819', user:'U-7734', instrument:'HDFC BANK', type:'BUY',  qty:100, price:'₹1,620', amount:'₹1,62,000', status:'failed',  time:'17:41:30' },
  { id:'TXN-8818', user:'U-2290', instrument:'INFY',      type:'BUY',  qty:80,  price:'₹1,524', amount:'₹1,21,920', status:'success', time:'17:40:48' },
  { id:'TXN-8817', user:'U-5512', instrument:'TCS',       type:'SELL', qty:30,  price:'₹3,980', amount:'₹1,19,400', status:'success', time:'17:40:10' },
  { id:'TXN-8816', user:'U-6643', instrument:'AXIS MF',   type:'BUY',  qty:500, price:'₹82.4',  amount:'₹41,200',   status:'pending', time:'17:39:42' },
];

function renderTradeTable() {
  const tbody = document.getElementById('trade-tbody');
  if (!tbody) return;
  const cls = { success:'badge-ok', failed:'badge-danger', pending:'badge-warn' };
  tbody.innerHTML = RECENT_TRADES.map(r => `<tr>
    <td style="font-size:11px;font-family:monospace;color:#4C4CCC;font-weight:600">${r.id}</td>
    <td style="color:var(--text-muted);font-size:11px">${r.user}</td>
    <td style="font-weight:600">${r.instrument}</td>
    <td><span class="badge ${r.type==='BUY'?'badge-ok':'badge-danger'}">${r.type}</span></td>
    <td style="color:var(--text-muted)">${r.qty}</td>
    <td style="color:var(--text-muted)">${r.price}</td>
    <td style="font-weight:600;color:var(--text-primary)">${r.amount}</td>
    <td><span class="badge ${cls[r.status]}">${r.status.toUpperCase()}</span></td>
    <td style="color:var(--text-muted);font-size:10.5px">${r.time}</td>
  </tr>`).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  initShared('trade-volume.html','Trade Volume','Internal DB · Live');
  buildHourlyChart();
  buildTradeCountChart();
  buildAssetChart();
  buildTrendChart();
  renderInstrumentTable();
  renderTradeTable();
});
