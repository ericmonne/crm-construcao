// ============================================================
// DASHBOARD.JS — Dashboard rendering & Chart.js
// ============================================================

function renderDashboard() {
  const container = document.getElementById('page-content');
  container.innerHTML = '';
  container.className = 'page-content';

  // --- Compute KPIs ---
  const abertas = OPORTUNIDADES.filter(o => !o.fase.startsWith('Fechado'));
  const ganhas  = OPORTUNIDADES.filter(o => o.fase === 'Fechado Ganho');
  const totalNegociacao = abertas.reduce((s, o) => s + o.valor_estimado, 0);
  const ticketMedio = ganhas.length ? ganhas.reduce((s,o)=>s+o.valor_estimado,0)/ganhas.length : 0;
  const totalOpps = OPORTUNIDADES.filter(o => o.fase !== 'Prospecção').length;
  const taxaConversao = totalOpps ? ((ganhas.length / totalOpps) * 100).toFixed(0) : 0;

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="dashboard-grid">
      ${kpiCard('Em Negociação', formatCurrency(totalNegociacao), 'up', '+12% este mês', 'green', `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      `)}
      ${kpiCard('Oportunidades Abertas', abertas.length.toString(), 'up', '+3 esta semana', 'blue', `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      `)}
      ${kpiCard('Ticket Médio', formatCurrency(ticketMedio), 'up', '+8% vs mês anterior', 'amber', `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17H5a2 2 0 0 0-2 2"/><path d="M22 17h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4v14z"/><path d="M7 17V5a2 2 0 0 1 2-2h6.5"/></svg>
      `)}
      ${kpiCard('Taxa de Conversão', `${taxaConversao}%`, 'down', '-2% vs mês anterior', 'purple', `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      `)}
    </div>

    <!-- Charts Row -->
    <div class="dashboard-row-3">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Receita Fechada por Mês</div>
            <div class="card-subtitle">Últimos 6 meses</div>
          </div>
          <span class="badge badge-green">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
            +22% vs período anterior
          </span>
        </div>
        <div class="chart-container">
          <canvas id="chart-receita"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Funil de Vendas</div>
            <div class="card-subtitle">Oportunidades por fase</div>
          </div>
        </div>
        <div class="funnel-list" id="funnel-list"></div>
      </div>
    </div>

    <!-- Tasks + Vendedores -->
    <div class="dashboard-row">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Follow-ups de Hoje</div>
            <div class="card-subtitle">${TAREFAS_HOJE.length} atividades pendentes</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('tarefas')">Ver todas</button>
        </div>
        <div class="task-list" id="task-list"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Desempenho por Vendedor</div>
            <div class="card-subtitle">Valor em pipeline ativo</div>
          </div>
        </div>
        <div class="vendedores-list" id="vendedores-list"></div>
      </div>
    </div>
  `;

  renderFunnel();
  renderTasks();
  renderVendedores();
  renderReceitaChart();
}

function kpiCard(label, value, trend, trendText, color, iconSvg) {
  const arrow = trend === 'up'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>`;
  return `
    <div class="kpi-card kpi-${color}">
      <div class="kpi-top">
        <span class="kpi-label">${label}</span>
        <div class="kpi-icon ${color}">${iconSvg}</div>
      </div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-change ${trend}">${arrow} ${trendText}</div>
    </div>
  `;
}

function renderFunnel() {
  const container = document.getElementById('funnel-list');
  const phases = ['Prospecção','Qualificação','Proposta','Negociação','Fechado Ganho','Fechado Perdido'];
  const colors = {
    'Prospecção': 'var(--fase-prospeccao)',
    'Qualificação': 'var(--fase-qualificacao)',
    'Proposta': 'var(--fase-proposta)',
    'Negociação': 'var(--fase-negociacao)',
    'Fechado Ganho': 'var(--fase-ganho)',
    'Fechado Perdido': 'var(--fase-perdido)',
  };
  const maxCount = Math.max(...phases.map(f => OPORTUNIDADES.filter(o=>o.fase===f).length));
  container.innerHTML = phases.map(fase => {
    const opps = OPORTUNIDADES.filter(o => o.fase === fase);
    const count = opps.length;
    const valor = opps.reduce((s,o)=>s+o.valor_estimado,0);
    const pct = maxCount ? (count / maxCount * 100) : 0;
    return `
      <div class="funnel-item">
        <div class="funnel-phase-label">${fase}</div>
        <div class="funnel-bar-wrap">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%; background:${colors[fase]}"></div>
          </div>
        </div>
        <div class="funnel-count">${count}</div>
        <div class="funnel-value">${formatCurrency(valor)}</div>
      </div>
    `;
  }).join('');
}

function renderTasks() {
  const container = document.getElementById('task-list');
  container.innerHTML = TAREFAS_HOJE.map(t => {
    const v = getVendedor(t.responsavel);
    return `
      <div class="task-item ${t.urgente ? 'urgente' : ''}" onclick="openOppModal('${t.oportunidade_id}')">
        <div class="task-check"></div>
        <div class="task-title">${t.titulo}</div>
        ${t.urgente ? '<span class="task-urgente-badge">Urgente</span>' : ''}
        <div class="avatar avatar-sm" style="background:${v.cor}" data-tooltip="${v.nome}">${v.avatar}</div>
      </div>
    `;
  }).join('');
}

function renderVendedores() {
  const container = document.getElementById('vendedores-list');
  const data = VENDEDORES.map(v => {
    const total = OPORTUNIDADES
      .filter(o => o.vendedor_id === v.id && !o.fase.startsWith('Fechado'))
      .reduce((s,o)=>s+o.valor_estimado,0);
    return { ...v, total };
  }).sort((a,b)=>b.total-a.total);
  const maxVal = data[0]?.total || 1;

  container.innerHTML = data.map((v,i) => `
    <div class="vendedor-row">
      <div class="avatar" style="background:${v.cor}">${v.avatar}</div>
      <div class="vendedor-info">
        <div class="vendedor-name">${v.nome}</div>
        <div class="vendedor-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${(v.total/maxVal*100).toFixed(0)}%; background:${v.cor}"></div>
          </div>
        </div>
      </div>
      <div class="vendedor-value">${formatCurrency(v.total)}</div>
    </div>
  `).join('');
}

function renderReceitaChart() {
  const canvas = document.getElementById('chart-receita');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: RECEITA_MENSAL.map(r => r.mes),
      datasets: [{
        label: 'Receita (R$)',
        data: RECEITA_MENSAL.map(r => r.valor),
        backgroundColor: [
          'rgba(30,111,181,0.5)','rgba(30,111,181,0.5)','rgba(30,111,181,0.5)',
          'rgba(30,111,181,0.5)','rgba(30,111,181,0.5)','rgba(30,111,181,0.85)',
        ],
        borderColor: [
          'rgba(30,111,181,0.8)','rgba(30,111,181,0.8)','rgba(30,111,181,0.8)',
          'rgba(30,111,181,0.8)','rgba(30,111,181,0.8)','#38bdf8',
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#122038',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0f6ff',
          bodyColor: '#9ab2cc',
          callbacks: {
            label: ctx => ' ' + formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5a7590', font: { family: 'Inter', size: 12 } },
          border: { display: false }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#5a7590',
            font: { family: 'Inter', size: 12 },
            callback: v => 'R$ ' + (v/1000).toFixed(0) + 'k'
          },
          border: { display: false }
        }
      }
    }
  });
}
