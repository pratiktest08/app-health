/* ═══════════════════════════════════════
   Reports & Export Page JS
═══════════════════════════════════════ */

/* ── Report templates ── */
const REPORT_TEMPLATES = [
  { id:'RPT-001', name:'Daily App Health Summary',     category:'Health',    schedule:'Daily 08:00',  last:'Apr 16, 08:00', format:'PDF',   status:'active'   },
  { id:'RPT-002', name:'Weekly Crash & ANR Report',    category:'Stability', schedule:'Mon 09:00',    last:'Apr 14, 09:00', format:'Excel', status:'active'   },
  { id:'RPT-003', name:'Monthly Trade Volume Report',  category:'Business',  schedule:'1st of month', last:'Apr 01, 08:00', format:'Excel', status:'active'   },
  { id:'RPT-004', name:'User Retention Analysis',      category:'Analytics', schedule:'Weekly Mon',   last:'Apr 14, 10:00', format:'PDF',   status:'active'   },
  { id:'RPT-005', name:'Performance Benchmark Report', category:'Performance',schedule:'Weekly Fri',  last:'Apr 11, 15:00', format:'PDF',   status:'paused'   },
  { id:'RPT-006', name:'ANR Root Cause Analysis',      category:'Stability', schedule:'On demand',    last:'Apr 13, 14:30', format:'PDF',   status:'active'   },
  { id:'RPT-007', name:'Login Failure Audit',          category:'Security',  schedule:'Daily 00:00',  last:'Apr 16, 00:00', format:'CSV',   status:'active'   },
];

/* ── Export history ── */
const EXPORT_HISTORY = [
  { report:'Daily App Health Summary',     format:'PDF',   size:'1.2 MB', by:'admin@plcapital.com', date:'Apr 16, 08:02', status:'done'    },
  { report:'Weekly Crash & ANR Report',    format:'Excel', size:'840 KB', by:'pm@plcapital.com',    date:'Apr 14, 09:05', status:'done'    },
  { report:'Monthly Trade Volume Report',  format:'Excel', size:'2.4 MB', by:'cfo@plcapital.com',   date:'Apr 01, 08:10', status:'done'    },
  { report:'User Retention Analysis',      format:'PDF',   size:'980 KB', by:'analyst@plcapital.com',date:'Apr 14, 10:12',status:'done'    },
  { report:'Login Failure Audit',          format:'CSV',   size:'320 KB', by:'security@plcapital.com',date:'Apr 16, 00:05',status:'done'   },
  { report:'Performance Benchmark Report', format:'PDF',   size:'1.8 MB', by:'admin@plcapital.com', date:'Apr 11, 15:04', status:'done'    },
  { report:'ANR Root Cause Analysis',      format:'PDF',   size:'640 KB', by:'dev@plcapital.com',   date:'Apr 13, 14:35', status:'done'    },
  { report:'Ad-Hoc: Startup Time Study',   format:'Excel', size:'560 KB', by:'lead@plcapital.com',  date:'Apr 12, 11:20', status:'done'    },
];

function renderTemplateTable() {
  const tbody = document.getElementById('template-tbody');
  if (!tbody) return;
  const catColor = { Health:'#4C4CCC', Stability:'#EF4444', Business:'#1FB15A', Analytics:'#F59E0B', Performance:'#6060A8', Security:'#F97316' };
  const fmtIcon  = { PDF:'📄', Excel:'📊', CSV:'📋' };
  tbody.innerHTML = REPORT_TEMPLATES.map(r => {
    const cc = catColor[r.category] || '#9191C4';
    return `<tr>
      <td style="font-family:monospace;font-size:11px;color:#4C4CCC;font-weight:600">${r.id}</td>
      <td style="font-weight:600">${r.name}</td>
      <td><span class="badge" style="background:${cc}22;color:${cc};border-color:${cc}55">${r.category}</span></td>
      <td style="color:var(--text-muted);font-size:11px">${r.schedule}</td>
      <td style="color:var(--text-muted);font-size:11px">${r.last}</td>
      <td><span class="chip">${fmtIcon[r.format]} ${r.format}</span></td>
      <td><span class="badge ${r.status==='active'?'badge-ok':'badge-muted'}">${r.status.toUpperCase()}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-secondary" style="padding:3px 10px;font-size:11px" onclick="runNow('${r.id}')">Run Now</button>
          <button class="btn-secondary" style="padding:3px 10px;font-size:11px">Edit</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function renderExportHistory() {
  const tbody = document.getElementById('export-tbody');
  if (!tbody) return;
  const fmtColor = { PDF:'#EF4444', Excel:'#1FB15A', CSV:'#4C4CCC' };
  tbody.innerHTML = EXPORT_HISTORY.map(r => {
    const fc = fmtColor[r.format] || '#9191C4';
    return `<tr>
      <td style="font-weight:600;max-width:220px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.report}</div></td>
      <td><span class="badge" style="background:${fc}22;color:${fc};border-color:${fc}44">${r.format}</span></td>
      <td style="color:var(--text-muted)">${r.size}</td>
      <td style="color:var(--text-muted);font-size:11px">${r.by}</td>
      <td style="color:var(--text-muted);font-size:11px">${r.date}</td>
      <td><span class="badge badge-ok">DONE</span></td>
      <td>
        <button class="btn-secondary" style="padding:3px 10px;font-size:11px">↓ Download</button>
      </td>
    </tr>`;
  }).join('');
}

function runNow(id) {
  const tpl = REPORT_TEMPLATES.find(r=>r.id===id);
  if (!tpl) return;
  const note = document.getElementById('run-notice');
  if (note) {
    note.textContent = `Generating "${tpl.name}" — you'll be notified when ready.`;
    note.style.display = 'block';
    setTimeout(()=>{ note.style.display='none'; }, 4000);
  }
}

/* ── Exports per day bar ── */
function buildExportChart() {
  const ctx = document.getElementById('exportChart');
  if (!ctx) return;
  const days = ['Apr 10','Apr 11','Apr 12','Apr 13','Apr 14','Apr 15','Apr 16'];
  const c = new Chart(ctx, {
    type:'bar',
    data:{
      labels:days,
      datasets:[
        { label:'PDF',   data:[3,2,4,3,5,2,3], backgroundColor:'#EF4444AA', borderRadius:4, borderSkipped:false },
        { label:'Excel', data:[2,1,2,4,3,1,2], backgroundColor:'#1FB15AAA', borderRadius:4, borderSkipped:false },
        { label:'CSV',   data:[1,0,1,1,2,1,2], backgroundColor:'#4C4CCCAA', borderRadius:4, borderSkipped:false },
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

window.addEventListener('DOMContentLoaded', () => {
  initShared('reports.html','Reports & Export','Scheduled · On-demand · History');
  renderTemplateTable();
  renderExportHistory();
  buildExportChart();
});
