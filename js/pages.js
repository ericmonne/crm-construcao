// ============================================================
// PAGES.JS — Páginas: Relatórios, Analytics, Pedidos, Equipe, Tarefas, Config
// ============================================================

// ---- RELATÓRIOS ----
function renderRelatorios() {
  const container = document.getElementById('page-content');
  container.innerHTML = '';
  container.className = 'page-content';

  const ganhas  = OPORTUNIDADES.filter(o => o.fase === 'Fechado Ganho');
  const perdidas = OPORTUNIDADES.filter(o => o.fase === 'Fechado Perdido');
  const abertas = OPORTUNIDADES.filter(o => !o.fase.startsWith('Fechado'));
  const totalGanho = ganhas.reduce((s,o)=>s+o.valor_estimado,0);
  const totalPerdido = perdidas.reduce((s,o)=>s+o.valor_estimado,0);
  const totalAberto = abertas.reduce((s,o)=>s+o.valor_estimado,0);

  // Group by client
  const porCliente = CLIENTES.map(c => {
    const opps = OPORTUNIDADES.filter(o => o.cliente_id === c.id && o.fase === 'Fechado Ganho');
    return { nome: c.nome_fantasia, total: opps.reduce((s,o)=>s+o.valor_estimado,0) };
  }).filter(c => c.total > 0).sort((a,b) => b.total - a.total).slice(0,6);

  // Group by product category
  const porCategoria = {};
  OPORTUNIDADES.forEach(o => {
    const prod = getProduto(o.produto_principal_id);
    if (!prod) return;
    if (!porCategoria[prod.categoria]) porCategoria[prod.categoria] = 0;
    porCategoria[prod.categoria] += o.valor_estimado;
  });

  container.innerHTML = `
    <!-- KPIs de Resultado -->
    <div class="dashboard-grid" style="margin-bottom:var(--space-6)">
      <div class="kpi-card kpi-green">
        <div class="kpi-top">
          <span class="kpi-label">Receita Fechada</span>
          <div class="kpi-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        </div>
        <div class="kpi-value">${formatCurrency(totalGanho)}</div>
        <div class="kpi-change up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="18 15 12 9 6 15"/></svg> ${ganhas.length} negócios ganhos</div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-top">
          <span class="kpi-label">Em Pipeline</span>
          <div class="kpi-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
        </div>
        <div class="kpi-value">${formatCurrency(totalAberto)}</div>
        <div class="kpi-change up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="18 15 12 9 6 15"/></svg> ${abertas.length} em andamento</div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-top">
          <span class="kpi-label">Perdido</span>
          <div class="kpi-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
        </div>
        <div class="kpi-value">${formatCurrency(totalPerdido)}</div>
        <div class="kpi-change down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg> ${perdidas.length} negócios perdidos</div>
      </div>
      <div class="kpi-card kpi-purple">
        <div class="kpi-top">
          <span class="kpi-label">Win Rate</span>
          <div class="kpi-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        </div>
        <div class="kpi-value">${ganhas.length + perdidas.length > 0 ? ((ganhas.length/(ganhas.length+perdidas.length))*100).toFixed(0) : 0}%</div>
        <div class="kpi-change up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="18 15 12 9 6 15"/></svg> Taxa de conversão</div>
      </div>
    </div>

    <div class="dashboard-row">
      <!-- Receita por mês -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Receita Acumulada por Mês</div>
        </div>
        <div class="chart-container"><canvas id="chart-relatorio-receita"></canvas></div>
      </div>

      <!-- Top Clientes -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Top Clientes por Receita</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">
          ${porCliente.map((c,i) => `
            <div style="display:flex;align-items:center;gap:var(--space-3)">
              <div style="width:20px;font-size:12px;font-weight:700;color:var(--text-muted);text-align:center">${i+1}</div>
              <div style="flex:1">
                <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);margin-bottom:4px">${c.nome}</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${(c.total/porCliente[0].total*100).toFixed(0)}%;background:var(--brand-primary)"></div>
                </div>
              </div>
              <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);white-space:nowrap">${formatCurrency(c.total)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="dashboard-row" style="margin-top:var(--space-5)">
      <!-- Por categoria de produto -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Volume por Categoria de Produto</div>
        </div>
        <div class="chart-container"><canvas id="chart-categorias"></canvas></div>
      </div>

      <!-- Tabela resumo -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:var(--space-5);border-bottom:1px solid var(--border-subtle)">
          <div class="card-title">Resumo por Fase</div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Qtd</th>
              <th>Valor Total</th>
              <th>Ticket Médio</th>
            </tr>
          </thead>
          <tbody>
            ${FASES.map(fase => {
              const opps = OPORTUNIDADES.filter(o => o.fase === fase);
              const total = opps.reduce((s,o)=>s+o.valor_estimado,0);
              const media = opps.length ? total/opps.length : 0;
              return `<tr>
                <td><span class="badge ${faseBadgeClass(fase)}">${fase}</span></td>
                <td class="td-primary">${opps.length}</td>
                <td class="td-primary">${formatCurrency(total)}</td>
                <td>${formatCurrency(media)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render charts after DOM
  setTimeout(() => {
    renderRelatorioChart();
    renderCategoriasChart(porCategoria);
  }, 50);
}

function renderRelatorioChart() {
  const canvas = document.getElementById('chart-relatorio-receita');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Cumulative
  let acc = 0;
  const cumulative = RECEITA_MENSAL.map(r => { acc += r.valor; return acc; });
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: RECEITA_MENSAL.map(r => r.mes),
      datasets: [{
        label: 'Receita Acumulada',
        data: cumulative,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#122038', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#f0f6ff', bodyColor: '#9ab2cc', callbacks: { label: ctx => ' ' + formatCurrency(ctx.raw) } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a7590', font: { family: 'Inter', size: 12 } }, border: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a7590', font: { family: 'Inter', size: 12 }, callback: v => 'R$ '+(v/1000).toFixed(0)+'k' }, border: { display: false } }
      }
    }
  });
}

function renderCategoriasChart(porCategoria) {
  const canvas = document.getElementById('chart-categorias');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = Object.keys(porCategoria);
  const data   = Object.values(porCategoria);
  const colors = ['#3b82f6','#f97316','#22c55e','#a855f7','#f59e0b','#14b8a6','#ef4444','#6366f1'];
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors.slice(0,labels.length), borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#9ab2cc', font: { family: 'Inter', size: 12 }, padding: 14 } },
        tooltip: { backgroundColor: '#122038', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#f0f6ff', bodyColor: '#9ab2cc', callbacks: { label: ctx => ' ' + formatCurrency(ctx.raw) } }
      }
    }
  });
}

// ---- ANALYTICS ----
function renderAnalytics() {
  const container = document.getElementById('page-content');
  container.className = 'page-content';

  const porVendedor = VENDEDORES.map(v => {
    const opps = OPORTUNIDADES.filter(o => o.vendedor_id === v.id);
    const ganhas = opps.filter(o => o.fase === 'Fechado Ganho');
    const perdidas = opps.filter(o => o.fase === 'Fechado Perdido');
    return {
      ...v,
      total: opps.length,
      ganhos: ganhas.length,
      perdidos: perdidas.length,
      receita: ganhas.reduce((s,o)=>s+o.valor_estimado,0),
      pipeline: opps.filter(o=>!o.fase.startsWith('Fechado')).reduce((s,o)=>s+o.valor_estimado,0),
      winRate: (ganhas.length + perdidas.length) > 0 ? ((ganhas.length / (ganhas.length + perdidas.length))*100).toFixed(0) : 0,
    };
  });

  container.innerHTML = `
    <div class="section-header" style="margin-bottom:var(--space-6)">
      <div>
        <div class="section-title">Analytics de Vendas</div>
        <div class="section-subtitle">Desempenho detalhado da equipe comercial</div>
      </div>
    </div>

    <!-- Tabela Equipe -->
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:var(--space-5)">
      <div style="padding:var(--space-5);border-bottom:1px solid var(--border-subtle)">
        <div class="card-title">Desempenho por Vendedor</div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Vendedor</th>
            <th>Oportunidades</th>
            <th>Ganhos</th>
            <th>Perdidos</th>
            <th>Win Rate</th>
            <th>Receita Fechada</th>
            <th>Pipeline Ativo</th>
          </tr>
        </thead>
        <tbody>
          ${porVendedor.map(v => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar avatar-sm" style="background:${v.cor}">${v.avatar}</div>
                  <span style="font-weight:600;color:var(--text-primary)">${v.nome}</span>
                </div>
              </td>
              <td class="td-primary">${v.total}</td>
              <td><span style="color:var(--green);font-weight:700">${v.ganhos}</span></td>
              <td><span style="color:var(--red);font-weight:700">${v.perdidos}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar" style="width:60px">
                    <div class="progress-fill" style="width:${v.winRate}%;background:${parseInt(v.winRate)>=50?'var(--green)':'var(--amber)'}"></div>
                  </div>
                  <span style="font-size:12px;font-weight:700;color:var(--text-primary)">${v.winRate}%</span>
                </div>
              </td>
              <td class="td-primary">${formatCurrency(v.receita)}</td>
              <td style="color:var(--brand-accent);font-weight:600">${formatCurrency(v.pipeline)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Charts -->
    <div class="dashboard-row">
      <div class="card">
        <div class="card-header"><div class="card-title">Receita por Vendedor</div></div>
        <div class="chart-container"><canvas id="chart-analytics-vendedor"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Distribuição de Fases</div></div>
        <div class="chart-container"><canvas id="chart-analytics-fases"></canvas></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Vendedor bar chart
    const cv = document.getElementById('chart-analytics-vendedor');
    if (cv) {
      new Chart(cv.getContext('2d'), {
        type: 'bar',
        data: {
          labels: porVendedor.map(v => v.nome.split(' ')[0]),
          datasets: [
            { label: 'Receita Fechada', data: porVendedor.map(v => v.receita), backgroundColor: porVendedor.map(v => v.cor+'cc'), borderColor: porVendedor.map(v => v.cor), borderWidth: 2, borderRadius: 6, borderSkipped: false },
            { label: 'Pipeline Ativo', data: porVendedor.map(v => v.pipeline), backgroundColor: 'rgba(30,111,181,0.2)', borderColor: 'rgba(30,111,181,0.6)', borderWidth: 2, borderRadius: 6, borderSkipped: false }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#9ab2cc', font: { family:'Inter',size:12 } } }, tooltip: { backgroundColor:'#122038', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, titleColor:'#f0f6ff', bodyColor:'#9ab2cc', callbacks: { label: ctx => ' ' + formatCurrency(ctx.raw) } } },
          scales: {
            x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a7590',font:{family:'Inter',size:12}}, border:{display:false} },
            y: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a7590',font:{family:'Inter',size:12},callback:v=>'R$'+(v/1000).toFixed(0)+'k'}, border:{display:false} }
          }
        }
      });
    }
    // Fases pie
    const cf = document.getElementById('chart-analytics-fases');
    if (cf) {
      const counts = FASES.map(f => OPORTUNIDADES.filter(o=>o.fase===f).length);
      const faseColors = ['#6366f1','#f59e0b','#3b82f6','#f97316','#22c55e','#ef4444'];
      new Chart(cf.getContext('2d'), {
        type: 'pie',
        data: {
          labels: FASES,
          datasets: [{ data: counts, backgroundColor: faseColors, borderWidth: 0, hoverOffset: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position:'right', labels:{color:'#9ab2cc',font:{family:'Inter',size:12},padding:12} },
            tooltip: { backgroundColor:'#122038', borderColor:'rgba(255,255,255,0.1)', borderWidth:1, titleColor:'#f0f6ff', bodyColor:'#9ab2cc' }
          }
        }
      });
    }
  }, 50);
}

// ---- PEDIDOS ----
const PEDIDOS = [
  { id: 'pd1', cliente_id:'c8', vendedor_id:'v1', data:'2026-06-01', valor:210000, status:'Entregue',   itens:[{produto:'Tubo PVC 100mm x 6m',qty:500,unit:42.50},{produto:'Lona Plástica 200 micras',qty:100,unit:320.00}] },
  { id: 'pd2', cliente_id:'c4', vendedor_id:'v1', data:'2026-06-10', valor:145000, status:'Em separação',itens:[{produto:'Vergalhão CA-50 12mm',qty:400,unit:210.00},{produto:'Perfil de Aço Galvanizado',qty:200,unit:87.50}] },
  { id: 'pd3', cliente_id:'c1', vendedor_id:'v1', data:'2026-05-28', valor:78000,  status:'Entregue',   itens:[{produto:'Cimento CP-II 50kg',qty:1200,unit:38.90},{produto:'Areia Média (m³)',qty:80,unit:115.00}] },
  { id: 'pd4', cliente_id:'c7', vendedor_id:'v3', data:'2026-06-18', valor:98000,  status:'Faturado',   itens:[{produto:'Vergalhão CA-50 12mm',qty:300,unit:210.00},{produto:'Perfil de Aço Galvanizado',qty:200,unit:87.50}] },
  { id: 'pd5', cliente_id:'c11',vendedor_id:'v3', data:'2026-06-22', valor:54500,  status:'Aguardando', itens:[{produto:'Argamassa Colante AC-II',qty:800,unit:24.90},{produto:'Cimento CP-II 50kg',qty:500,unit:38.90}] },
  { id: 'pd6', cliente_id:'c10',vendedor_id:'v2', data:'2026-06-25', valor:86000,  status:'Aguardando', itens:[{produto:'Tinta Acrílica Fosca 18L',qty:200,unit:189.00},{produto:'Tubo PVC 100mm x 6m',qty:300,unit:42.50},{produto:'Argamassa Colante AC-II',qty:400,unit:24.90}] },
  { id: 'pd7', cliente_id:'c3', vendedor_id:'v3', data:'2026-05-15', valor:28500,  status:'Entregue',   itens:[{produto:'Tinta Acrílica Fosca 18L',qty:120,unit:189.00}] },
  { id: 'pd8', cliente_id:'c12',vendedor_id:'v4', data:'2026-06-26', valor:43000,  status:'Em separação',itens:[{produto:'Tubo PVC 100mm x 6m',qty:400,unit:42.50},{produto:'Lona Plástica 200 micras',qty:60,unit:320.00}] },
];

const STATUS_PEDIDO_COLOR = {
  'Entregue':      'badge-green',
  'Faturado':      'badge-blue',
  'Em separação':  'badge-amber',
  'Aguardando':    'badge-default',
  'Cancelado':     'badge-red',
};

function renderPedidos() {
  const container = document.getElementById('page-content');
  container.className = 'page-content';

  const totalFaturado = PEDIDOS.filter(p=>p.status==='Entregue'||p.status==='Faturado').reduce((s,p)=>s+p.valor,0);
  const emAndamento   = PEDIDOS.filter(p=>p.status==='Em separação'||p.status==='Aguardando').length;

  container.innerHTML = `
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <div>
        <div class="section-title">Pedidos</div>
        <div class="section-subtitle">${PEDIDOS.length} pedidos · ${formatCurrency(totalFaturado)} faturado</div>
      </div>
      <div style="display:flex;gap:var(--space-3)">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="pedidos-search" placeholder="Buscar pedido..." oninput="filterPedidos()">
        </div>
        <select class="filter-select" id="pedidos-status" onchange="filterPedidos()">
          <option value="all">Todos os status</option>
          ${Object.keys(STATUS_PEDIDO_COLOR).map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-sm" onclick="showToast('Funcionalidade de novo pedido em desenvolvimento','info')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Pedido
        </button>
      </div>
    </div>

    <!-- KPIs rápidos -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4);margin-bottom:var(--space-5)">
      ${[
        {label:'Total de Pedidos',value:PEDIDOS.length,color:'blue'},
        {label:'Em Andamento',value:emAndamento,color:'amber'},
        {label:'Entregues',value:PEDIDOS.filter(p=>p.status==='Entregue').length,color:'green'},
        {label:'Valor Faturado',value:formatCurrency(totalFaturado),color:'purple'},
      ].map(k=>`
        <div class="card" style="padding:var(--space-4)">
          <div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">${k.label}</div>
          <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--text-primary)">${k.value}</div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div class="table-wrapper" style="border:none">
        <table class="data-table" id="pedidos-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Data</th>
              <th>Itens</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="pedidos-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  renderPedidosTable(PEDIDOS);
}

function filterPedidos() {
  const search = (document.getElementById('pedidos-search')?.value||'').toLowerCase();
  const status = document.getElementById('pedidos-status')?.value||'all';
  const filtered = PEDIDOS.filter(p => {
    const c = getCliente(p.cliente_id);
    const matchSearch = !search || (c && c.nome_fantasia.toLowerCase().includes(search)) || p.id.includes(search);
    const matchStatus = status==='all' || p.status===status;
    return matchSearch && matchStatus;
  });
  renderPedidosTable(filtered);
}

function renderPedidosTable(pedidos) {
  const tbody = document.getElementById('pedidos-tbody');
  if (!tbody) return;
  if (!pedidos.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg><div class="empty-state-title">Nenhum pedido encontrado</div></div></td></tr>`;
    return;
  }
  tbody.innerHTML = pedidos.map(p => {
    const c = getCliente(p.cliente_id);
    const v = getVendedor(p.vendedor_id);
    return `
      <tr onclick="openPedidoModal('${p.id}')" style="cursor:pointer">
        <td class="td-primary">#${p.id.replace('pd','').padStart(4,'0')}</td>
        <td class="td-primary">${c?.nome_fantasia||'—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="avatar avatar-sm" style="background:${v?.cor}">${v?.avatar}</div>
            <span style="font-size:var(--font-size-sm)">${v?.nome}</span>
          </div>
        </td>
        <td>${formatDate(p.data)}</td>
        <td style="color:var(--text-muted)">${p.itens.length} ${p.itens.length===1?'item':'itens'}</td>
        <td class="td-primary">${formatCurrency(p.valor)}</td>
        <td><span class="badge ${STATUS_PEDIDO_COLOR[p.status]||'badge-default'}">${p.status}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();updatePedidoStatus('${p.id}')" data-tooltip="Atualizar status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openPedidoModal(pedidoId) {
  const p = PEDIDOS.find(p => p.id === pedidoId);
  if (!p) return;
  const c = getCliente(p.cliente_id);
  const v = getVendedor(p.vendedor_id);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'pedido-modal';
  modal.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="modal-title">Pedido #${p.id.replace('pd','').padStart(4,'0')}</div>
          <div class="modal-subtitle">${c?.razao_social} · ${formatDate(p.data)}</div>
        </div>
        <button class="modal-close" onclick="closeModal('pedido-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)">
          <span class="badge ${STATUS_PEDIDO_COLOR[p.status]||'badge-default'}" style="font-size:13px">${p.status}</span>
          <span style="color:var(--text-muted);font-size:var(--font-size-sm)">Vendedor: ${v?.nome}</span>
        </div>
        <div class="opp-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 16-4 4-1.5-1.5"/><path d="M3 12V6l9-3 9 3v6"/></svg>
          Itens do Pedido
        </div>
        <table class="data-table" style="margin-bottom:var(--space-4)">
          <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Total</th></tr></thead>
          <tbody>
            ${p.itens.map(i=>`
              <tr>
                <td class="td-primary">${i.produto}</td>
                <td>${i.qty.toLocaleString('pt-BR')}</td>
                <td>${formatCurrency(i.unit)}</td>
                <td class="td-primary">${formatCurrency(i.qty*i.unit)}</td>
              </tr>
            `).join('')}
            <tr style="background:var(--bg-elevated)">
              <td colspan="3" style="text-align:right;font-weight:700;color:var(--text-secondary)">Total do Pedido</td>
              <td style="font-size:var(--font-size-md);font-weight:800;color:var(--green)">${formatCurrency(p.valor)}</td>
            </tr>
          </tbody>
        </table>

        <div class="opp-section-title">Atualizar Status</div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
          ${Object.keys(STATUS_PEDIDO_COLOR).map(s=>`
            <button class="btn ${p.status===s?'btn-primary':'btn-secondary'} btn-sm" onclick="setPedidoStatus('${p.id}','${s}')">
              <span class="badge ${STATUS_PEDIDO_COLOR[s]}" style="padding:2px 6px;font-size:10px">${s}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('pedido-modal')">Fechar</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal('pedido-modal'); });
  document.body.appendChild(modal);
}

function updatePedidoStatus(pedidoId) {
  openPedidoModal(pedidoId);
}

function setPedidoStatus(pedidoId, status) {
  const p = PEDIDOS.find(p => p.id === pedidoId);
  if (p) {
    p.status = status;
    closeModal('pedido-modal');
    showToast(`Status atualizado para "${status}"`, 'success');
    renderPage(currentPage);
  }
}

// ---- EQUIPE ----
function renderEquipe() {
  const container = document.getElementById('page-content');
  container.className = 'page-content';

  const stats = VENDEDORES.map(v => {
    const opps   = OPORTUNIDADES.filter(o => o.vendedor_id === v.id);
    const ganhas  = opps.filter(o => o.fase === 'Fechado Ganho');
    const abertas = opps.filter(o => !o.fase.startsWith('Fechado'));
    const clientes = CLIENTES.filter(c => c.vendedor_id === v.id);
    return {
      ...v,
      totalOpps: opps.length,
      ganhas: ganhas.length,
      receita: ganhas.reduce((s,o)=>s+o.valor_estimado,0),
      pipeline: abertas.reduce((s,o)=>s+o.valor_estimado,0),
      clientes: clientes.length,
      winRate: (ganhas.length + opps.filter(o=>o.fase==='Fechado Perdido').length) > 0
        ? ((ganhas.length / (ganhas.length + opps.filter(o=>o.fase==='Fechado Perdido').length))*100).toFixed(0)
        : 0,
    };
  });

  container.innerHTML = `
    <div class="section-header" style="margin-bottom:var(--space-6)">
      <div>
        <div class="section-title">Equipe de Vendas</div>
        <div class="section-subtitle">${VENDEDORES.length} vendedores ativos</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showToast('Convite de novo vendedor em desenvolvimento','info')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Adicionar Vendedor
      </button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-5)">
      ${stats.map(v => `
        <div class="card" style="position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:${v.cor}"></div>
          <div style="padding-left:var(--space-3)">
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5)">
              <div class="avatar avatar-xl" style="background:${v.cor}">${v.avatar}</div>
              <div>
                <div style="font-size:var(--font-size-lg);font-weight:700;color:var(--text-primary)">${v.nome}</div>
                <div style="font-size:var(--font-size-sm);color:var(--text-muted)">Vendedor Sênior · ${v.clientes} clientes</div>
                <div style="margin-top:6px">
                  <span class="badge badge-green">Ativo</span>
                </div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-bottom:var(--space-4)">
              <div class="client-stat-box">
                <span class="client-stat-value" style="color:var(--green)">${formatCurrency(v.receita)}</span>
                <span class="client-stat-label">Receita Fechada</span>
              </div>
              <div class="client-stat-box">
                <span class="client-stat-value">${v.totalOpps}</span>
                <span class="client-stat-label">Oportunidades</span>
              </div>
              <div class="client-stat-box">
                <span class="client-stat-value" style="color:${parseInt(v.winRate)>=50?'var(--green)':'var(--amber)'}">${v.winRate}%</span>
                <span class="client-stat-label">Win Rate</span>
              </div>
            </div>
            <div style="margin-bottom:var(--space-2)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:var(--font-size-xs);color:var(--text-muted)">Pipeline ativo: ${formatCurrency(v.pipeline)}</span>
                <span style="font-size:var(--font-size-xs);font-weight:700;color:var(--text-muted)">${v.ganhas} ganhos</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${v.winRate}%;background:${v.cor}"></div>
              </div>
            </div>
            <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
              <button class="btn btn-secondary btn-sm" onclick="navigate('pipeline');setTimeout(()=>{document.getElementById('filter-vendedor').value='${v.id}';applyPipelineFilters();},200)">
                Ver Pipeline
              </button>
              <button class="btn btn-ghost btn-sm" onclick="showToast('Perfil do vendedor em desenvolvimento','info')">
                Perfil Completo
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---- TAREFAS (página completa) ----
let tarefasFilter = 'todas';

function renderTarefas() {
  const container = document.getElementById('page-content');
  container.className = 'page-content';

  // Gerar todas as tarefas de follow-ups das oportunidades
  const todasTarefas = [
    ...TAREFAS_HOJE.map(t => ({...t, categoria:'follow-up', data:'Hoje'})),
    ...OPORTUNIDADES.filter(o => !o.fase.startsWith('Fechado')).map(o => ({
      id: 'tf-' + o.id,
      titulo: o.proxima_acao,
      oportunidade_id: o.id,
      responsavel: o.vendedor_id,
      urgente: o.prioridade === 'Alta',
      concluida: false,
      categoria: 'oportunidade',
      data: o.data_prevista,
    })).filter(t => !TAREFAS_HOJE.some(th => th.oportunidade_id === t.oportunidade_id))
  ];

  const pendentes  = todasTarefas.filter(t => !t.concluida);
  const urgentes   = todasTarefas.filter(t => t.urgente && !t.concluida);

  container.innerHTML = `
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <div>
        <div class="section-title">Tarefas & Follow-ups</div>
        <div class="section-subtitle">${pendentes.length} pendentes · ${urgentes.length} urgentes</div>
      </div>
      <div style="display:flex;gap:var(--space-3)">
        <button class="btn ${tarefasFilter==='todas'?'btn-primary':'btn-secondary'} btn-sm" onclick="tarefasFilter='todas';renderPage('tarefas')">Todas</button>
        <button class="btn ${tarefasFilter==='urgentes'?'btn-primary':'btn-secondary'} btn-sm" onclick="tarefasFilter='urgentes';renderPage('tarefas')">Urgentes</button>
        <button class="btn ${tarefasFilter==='hoje'?'btn-primary':'btn-secondary'} btn-sm" onclick="tarefasFilter='hoje';renderPage('tarefas')">Hoje</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;flex-direction:column;gap:var(--space-2)" id="tarefas-lista">
        ${todasTarefas
          .filter(t => tarefasFilter==='urgentes' ? t.urgente : tarefasFilter==='hoje' ? t.categoria==='follow-up' : true)
          .map(t => {
            const v = getVendedor(t.responsavel);
            const opp = OPORTUNIDADES.find(o => o.id === t.oportunidade_id);
            const cliente = opp ? getCliente(opp.cliente_id) : null;
            return `
              <div class="task-item ${t.urgente?'urgente':''} ${t.concluida?'opacity-50':''}" id="task-item-${t.id}">
                <div class="task-check" onclick="toggleTarefa('${t.id}',this)" style="cursor:pointer;${t.concluida?'background:var(--green);border-color:var(--green)':''}">
                  ${t.concluida?'<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>':''}
                </div>
                <div style="flex:1;min-width:0">
                  <div class="task-title ${t.concluida?'line-through text-muted':''}">${t.titulo}</div>
                  ${cliente ? `<div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px">
                    ${cliente.nome_fantasia} · ${t.data==='Hoje'?'<span style="color:var(--brand-secondary)">Hoje</span>':formatDate(t.data)}
                  </div>` : ''}
                </div>
                ${t.urgente && !t.concluida ? '<span class="task-urgente-badge">Urgente</span>' : ''}
                ${opp ? `<button class="btn btn-ghost btn-sm" onclick="openOppModal('${opp.id}')" style="font-size:11px;color:var(--brand-accent)">Ver opp.</button>` : ''}
                <div class="avatar avatar-sm" style="background:${v?.cor||'#666'}">${v?.avatar||'?'}</div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;
}

function toggleTarefa(id, el) {
  const item = document.getElementById('task-item-' + id);
  if (!item) return;
  const isNowDone = !el.innerHTML.includes('polyline');
  el.style.background = isNowDone ? 'var(--green)' : '';
  el.style.borderColor = isNowDone ? 'var(--green)' : '';
  el.innerHTML = isNowDone ? '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  const titleEl = item.querySelector('.task-title');
  if (titleEl) {
    titleEl.classList.toggle('line-through', isNowDone);
    titleEl.classList.toggle('text-muted', isNowDone);
  }
  if (isNowDone) showToast('Tarefa marcada como concluída!', 'success');
}

// ---- CONFIGURAÇÕES ----
function openConfigModal() {
  if (document.getElementById('config-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'config-modal';
  modal.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:560px">
      <div class="modal-header">
        <div class="modal-title">Configurações</div>
        <button class="modal-close" onclick="closeModal('config-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="opp-section-title">Perfil da Empresa</div>
        <div class="form-grid">
          <div class="form-group form-span-2">
            <label class="form-label">Nome da Empresa</label>
            <input class="form-input" type="text" value="ConstróiCRM Distribuidora Ltda" placeholder="Nome da empresa">
          </div>
          <div class="form-group">
            <label class="form-label">CNPJ</label>
            <input class="form-input" type="text" value="00.000.000/0001-00" placeholder="CNPJ">
          </div>
          <div class="form-group">
            <label class="form-label">Segmento</label>
            <select class="form-input">
              <option selected>Atacado B2B</option>
              <option>Varejo</option>
              <option>Distribuição</option>
            </select>
          </div>
        </div>

        <hr class="divider">
        <div class="opp-section-title">Notificações</div>
        ${[
          ['Alertas de oportunidades vencidas', true],
          ['Resumo diário por email', true],
          ['Alertas de follow-up', true],
          ['Relatório semanal', false],
        ].map(([label, checked]) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)">
            <span style="font-size:var(--font-size-sm);color:var(--text-secondary)">${label}</span>
            <label style="position:relative;width:40px;height:22px;cursor:pointer">
              <input type="checkbox" ${checked?'checked':''} style="opacity:0;width:0;height:0" onchange="showToast('Preferência salva','success')">
              <span style="position:absolute;inset:0;background:${checked?'var(--brand-primary)':'var(--bg-hover)'};border-radius:11px;transition:background 0.2s;display:flex;align-items:center;padding:3px;">
                <span style="width:16px;height:16px;background:white;border-radius:50%;transform:${checked?'translateX(18px)':'translateX(0)'};transition:transform 0.2s;display:block"></span>
              </span>
            </label>
          </div>
        `).join('')}

        <hr class="divider">
        <div class="opp-section-title">Conta</div>
        <div class="info-row"><span class="info-label">Usuário</span><span class="info-value">Gerente Comercial</span></div>
        <div class="info-row"><span class="info-label">Plano</span><span class="info-value"><span class="badge badge-purple">Pro</span></span></div>
        <div class="info-row"><span class="info-label">Versão</span><span class="info-value">v1.0.0</span></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('config-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="showToast('Configurações salvas!','success');closeModal('config-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Salvar
        </button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal('config-modal'); });
  document.body.appendChild(modal);
}

// ---- NOTIFICAÇÕES ----
const NOTIFICACOES = [
  { id:'n1', tipo:'urgente', texto:'Contraproposta para Horizonte Obras vence amanhã', opp:'o1', tempo:'Agora' },
  { id:'n2', tipo:'info',    texto:'Nova atividade registrada em "Kit Estrutural EngBR"', opp:'o2', tempo:'1h atrás' },
  { id:'n3', tipo:'sucesso', texto:'Contrato Anual – Materiais Hidráulicos foi fechado!', opp:'o4', tempo:'3h atrás' },
  { id:'n4', tipo:'aviso',   texto:'Oportunidade "Lote de Tijolos – Sol Nascente" sem follow-up há 5 dias', opp:'o5', tempo:'Ontem' },
  { id:'n5', tipo:'info',    texto:'SuperObra AM enviou revisão de contrato', opp:'o11', tempo:'Ontem' },
];

let notifsLidas = new Set();

function openNotificacoesPanel() {
  if (document.getElementById('notif-panel')) { closeModal('notif-panel'); return; }
  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = `
    position:fixed;top:70px;right:16px;width:360px;max-height:500px;
    background:var(--bg-elevated);border:1px solid var(--border-default);
    border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);z-index:500;
    overflow:hidden;animation:slideUp 200ms ease;display:flex;flex-direction:column;
  `;
  const tipoIcon = {
    urgente: { bg:'var(--red-dim)', color:'var(--red)', icon:'🔴' },
    info:    { bg:'var(--blue-dim)', color:'var(--blue)', icon:'ℹ️' },
    sucesso: { bg:'var(--green-dim)', color:'var(--green)', icon:'✅' },
    aviso:   { bg:'var(--amber-dim)', color:'var(--amber)', icon:'⚠️' },
  };

  panel.innerHTML = `
    <div style="padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">
      <div style="font-weight:700;color:var(--text-primary)">Notificações</div>
      <div style="display:flex;gap:var(--space-2)">
        <button class="btn btn-ghost btn-sm" onclick="marcarTodasLidas()" style="font-size:11px">Marcar todas lidas</button>
        <button class="modal-close" onclick="closeModal('notif-panel')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div style="overflow-y:auto;flex:1">
      ${NOTIFICACOES.map(n => {
        const t = tipoIcon[n.tipo] || tipoIcon.info;
        const lida = notifsLidas.has(n.id);
        return `
          <div id="notif-${n.id}" style="padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 150ms;${lida?'opacity:0.5':'background:rgba(30,111,181,0.04)'}"
            onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='${lida?'transparent':'rgba(30,111,181,0.04)'}'"
            onclick="lerNotificacao('${n.id}','${n.opp}')">
            <div style="display:flex;align-items:flex-start;gap:var(--space-3)">
              <span style="font-size:16px;flex-shrink:0">${t.icon}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:var(--font-size-sm);color:var(--text-primary);font-weight:${lida?'400':'600'};line-height:1.4">${n.texto}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${n.tempo}</div>
              </div>
              ${!lida ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--brand-primary);flex-shrink:0;margin-top:4px"></div>' : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);text-align:center">
      <button class="btn btn-ghost btn-sm" onclick="closeModal('notif-panel')" style="color:var(--brand-accent);font-size:12px">Ver todas as notificações</button>
    </div>
  `;
  document.body.appendChild(panel);
  // close on outside click
  setTimeout(() => {
    document.addEventListener('click', function outsideClick(e) {
      if (!panel.contains(e.target) && !e.target.closest('[data-notif-btn]')) {
        closeModal('notif-panel');
        document.removeEventListener('click', outsideClick);
      }
    });
  }, 100);
}

function lerNotificacao(id, oppId) {
  notifsLidas.add(id);
  closeModal('notif-panel');
  if (oppId) openOppModal(oppId);
}

function marcarTodasLidas() {
  NOTIFICACOES.forEach(n => notifsLidas.add(n.id));
  closeModal('notif-panel');
  showToast('Todas as notificações marcadas como lidas', 'success');
}
