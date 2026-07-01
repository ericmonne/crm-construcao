// ============================================================
// APP.JS — SPA Router, Navigation, Modals, Toast
// ============================================================

let currentPage = 'dashboard';

// ---- Navigation ----
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  updateTopbar(page);
  renderPage(page);
}

function updateTopbar(page) {
  const titles = {
    dashboard:  { title: 'Dashboard',          sub: 'Visão geral · Junho 2026' },
    pipeline:   { title: 'Pipeline de Vendas',  sub: 'Kanban de oportunidades' },
    clients:    { title: 'Clientes',            sub: 'Base de clientes B2B' },
    relatorios: { title: 'Relatórios',          sub: 'Análise de resultados' },
    analytics:  { title: 'Analytics',           sub: 'Desempenho da equipe' },
    pedidos:    { title: 'Pedidos',             sub: 'Gestão de pedidos' },
    equipe:     { title: 'Equipe de Vendas',    sub: 'Vendedores e resultados' },
    tarefas:    { title: 'Tarefas & Follow-ups',sub: 'Atividades pendentes' },
  };
  const info = titles[page] || { title: page, sub: '' };
  const titleEl = document.getElementById('topbar-title');
  const subEl   = document.getElementById('topbar-subtitle');
  if (titleEl) titleEl.textContent = info.title;
  if (subEl)   subEl.textContent   = info.sub;
}

function renderPage(page) {
  // Clear existing modals
  document.querySelectorAll('.modal-backdrop').forEach(m => m.remove());

  switch (page) {
    case 'dashboard':  renderDashboard();  break;
    case 'pipeline':   renderPipeline();   break;
    case 'clients':    renderClients();    break;
    case 'relatorios': renderRelatorios(); break;
    case 'analytics':  renderAnalytics();  break;
    case 'pedidos':    renderPedidos();    break;
    case 'equipe':     renderEquipe();     break;
    case 'tarefas':    renderTarefas();    break;
    default:           renderDashboard();
  }
}

// ---- Opportunity Detail Modal ----
function openOppModal(oppId) {
  const opp = OPORTUNIDADES.find(o => o.id === oppId);
  if (!opp) return;

  const cliente  = getCliente(opp.cliente_id);
  const vendedor = getVendedor(opp.vendedor_id);
  const prodPrin = getProduto(opp.produto_principal_id);

  const phaseColor = FASE_COLORS ? FASE_COLORS[opp.fase] : '#999';
  const statusBadge = faseBadgeClass(opp.fase);

  const tipoAtivIcon = {
    'Ligação': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.8 19.79 19.79 0 0 1 1.62 3.17 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    'Email':   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    'Reunião': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    'Proposta':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };

  const tipoClass = {
    'Ligação': 'ligacao', 'Email': 'email', 'Reunião': 'reuniao', 'Proposta': 'proposta'
  };

  const produtos = opp.produtos.map(pid => getProduto(pid)).filter(Boolean);

  // Conic gradient for probability
  const probPct = opp.probabilidade;
  const probColor = probPct >= 70 ? 'var(--green)' : probPct >= 40 ? 'var(--amber)' : 'var(--red)';

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'opp-modal';

  modal.innerHTML = `
    <div class="modal modal-lg" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div style="flex:1;min-width:0;">
          <div class="modal-title" style="padding-right:var(--space-4)">${opp.titulo}</div>
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-top:var(--space-2);">
            <span class="badge ${statusBadge}" style="font-size:12px">${opp.fase}</span>
            <span class="badge badge-default" style="font-size:11px">
              ${opp.prioridade === 'Alta' ? '🔴' : opp.prioridade === 'Média' ? '🟡' : '⚪'}
              Prioridade ${opp.prioridade}
            </span>
          </div>
        </div>
        <button class="modal-close" onclick="closeModal('opp-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Value + Probability -->
        <div class="opp-detail-grid">
          <div class="opp-detail-value-box">
            <span class="opp-detail-value-number">${formatCurrency(opp.valor_estimado)}</span>
            <span class="opp-detail-value-label">Valor Estimado</span>
          </div>
          <div class="opp-detail-value-box" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-2)">
            <div style="position:relative;width:64px;height:64px;">
              <svg width="64" height="64" viewBox="0 0 64 64" style="transform:rotate(-90deg)">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-hover)" stroke-width="8"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke="${probColor}" stroke-width="8"
                  stroke-dasharray="${2 * Math.PI * 26}"
                  stroke-dashoffset="${2 * Math.PI * 26 * (1 - probPct / 100)}"
                  stroke-linecap="round"
                  style="transition:stroke-dashoffset 0.8s ease"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:${probColor}">${probPct}%</div>
            </div>
            <span class="opp-detail-value-label">Probabilidade de Fechamento</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);margin-bottom:var(--space-5)">
          <div>
            <div class="opp-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              Dados da Oportunidade
            </div>
            <div class="info-row"><span class="info-label">Cliente</span><span class="info-value">${cliente?.nome_fantasia || '—'}</span></div>
            <div class="info-row"><span class="info-label">Responsável</span><span class="info-value" style="display:flex;align-items:center;gap:8px;justify-content:flex-end"><div class="avatar avatar-sm" style="background:${vendedor?.cor}">${vendedor?.avatar}</div>${vendedor?.nome}</span></div>
            <div class="info-row"><span class="info-label">Abertura</span><span class="info-value">${formatDate(opp.data_abertura)}</span></div>
            <div class="info-row"><span class="info-label">Previsão Fechamento</span><span class="info-value">${formatDate(opp.data_prevista)}</span></div>
            <div class="info-row"><span class="info-label">Produto Principal</span><span class="info-value">${prodPrin?.nome || '—'}</span></div>
            ${opp.motivo_perda ? `<div class="info-row"><span class="info-label">Motivo da Perda</span><span class="info-value" style="color:var(--red);font-size:12px">${opp.motivo_perda}</span></div>` : ''}
          </div>

          <div>
            <div class="opp-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/></svg>
              Produtos de Interesse
            </div>
            <div class="chips-row" style="margin-bottom:var(--space-5)">
              ${produtos.map(p => `
                <div class="chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 16-4 4-1.5-1.5"/><path d="M3 12V6l9-3 9 3v6"/><path d="M3 12l9 3 9-3"/></svg>
                  ${p.nome}
                </div>
              `).join('')}
            </div>

            <div class="opp-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Próxima Ação
            </div>
            <div style="background:var(--amber-dim);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);font-size:var(--font-size-sm);color:var(--amber)">
              ${opp.proxima_acao}
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Timeline -->
        <div class="opp-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Histórico de Atividades
        </div>
        <div class="timeline">
          ${opp.atividades.map(a => `
            <div class="timeline-item">
              <div class="timeline-dot ${tipoClass[a.tipo] || 'ligacao'}">
                ${tipoAtivIcon[a.tipo] || tipoAtivIcon['Ligação']}
              </div>
              <div class="timeline-meta">
                <span class="timeline-type">${a.tipo}</span>
                <span class="timeline-date">· ${formatDate(a.data)}</span>
              </div>
              <div class="timeline-body">${a.descricao}</div>
              <div class="timeline-user">por ${a.usuario}</div>
            </div>
          `).join('')}
        </div>

        <!-- Add Activity -->
        <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);align-items:center;">
          <input type="text" id="new-activity-input" placeholder="Registrar nova atividade..." style="flex:1;background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:10px 14px;color:var(--text-primary);font-size:var(--font-size-sm)">
          <button class="btn btn-primary btn-sm" onclick="addActivity('${opp.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('opp-modal')">Fechar</button>
        ${opp.fase !== 'Fechado Ganho' && opp.fase !== 'Fechado Perdido' ? `
          <button class="btn btn-primary" onclick="closeModal('opp-modal');openOppForm('${opp.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar Oportunidade
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('opp-modal');
  });
  document.body.appendChild(modal);
}

function addActivity(oppId) {
  const input = document.getElementById('new-activity-input');
  const text = input?.value?.trim();
  if (!text) { showToast('Digite uma descrição para a atividade', 'warning'); return; }

  const opp = OPORTUNIDADES.find(o => o.id === oppId);
  if (opp) {
    opp.atividades.unshift({
      tipo: 'Ligação',
      data: new Date().toISOString().split('T')[0],
      descricao: text,
      usuario: 'Você'
    });
    closeModal('opp-modal');
    setTimeout(() => openOppModal(oppId), 50);
    showToast('Atividade registrada!', 'success');
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---- Toast Notification ----
function showToast(message, type = 'info') {
  const colors = {
    success: { bg: 'var(--green-dim)', border: 'rgba(34,197,94,0.3)', text: 'var(--green)', icon: '✓' },
    warning: { bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.3)', text: 'var(--amber)', icon: '⚠' },
    error:   { bg: 'var(--red-dim)',   border: 'rgba(239,68,68,0.3)',  text: 'var(--red)',   icon: '✕' },
    info:    { bg: 'var(--blue-dim)',  border: 'rgba(59,130,246,0.3)', text: 'var(--blue)',  icon: 'ℹ' },
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
    padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600;
    display:flex; align-items:center; gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideInRight 250ms ease;
    font-family:Inter,sans-serif;
    backdrop-filter:blur(8px);
  `;
  toast.innerHTML = `<span style="font-size:16px">${c.icon}</span> ${message}`;

  // Add keyframe
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = `
      @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes slideOutRight { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 250ms ease forwards';
    setTimeout(() => toast.remove(), 260);
  }, 3000);
}

// ---- Phase badge classes ----
function faseBadgeClass(fase) {
  return {
    'Prospecção':    'badge-purple',
    'Qualificação':  'badge-amber',
    'Proposta':      'badge-blue',
    'Negociação':    'badge-default',
    'Fechado Ganho': 'badge-green',
    'Fechado Perdido':'badge-red',
  }[fase] || 'badge-default';
}

// ---- Build Sidebar ----
function buildSidebar() {
  return `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="sidebar-logo-text">
          <div class="sidebar-logo-name">ConstróiCRM</div>
          <div class="sidebar-logo-sub">Atacado B2B</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Principal</div>
        <div class="nav-item active" data-page="dashboard" onclick="navigate('dashboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </div>
        <div class="nav-item" data-page="pipeline" onclick="navigate('pipeline')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Pipeline
          <span class="nav-badge">${OPORTUNIDADES.filter(o=>!o.fase.startsWith('Fechado')).length}</span>
        </div>
        <div class="nav-item" data-page="clients" onclick="navigate('clients')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Clientes
        </div>

        <div class="sidebar-section-label" style="margin-top:var(--space-4)">Análise</div>
        <div class="nav-item" data-page="relatorios" onclick="navigate('relatorios')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Relatórios
        </div>
        <div class="nav-item" data-page="analytics" onclick="navigate('analytics')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </div>

        <div class="sidebar-section-label" style="margin-top:var(--space-4)">Gestão</div>
        <div class="nav-item" data-page="pedidos" onclick="navigate('pedidos')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="m8 21 4-4 4 4"/><path d="M10 17H14"/></svg>
          Pedidos
          <span class="nav-badge" style="background:var(--amber)">${PEDIDOS ? PEDIDOS.filter(p=>p.status==='Aguardando'||p.status==='Em separação').length : ''}</span>
        </div>
        <div class="nav-item" data-page="equipe" onclick="navigate('equipe')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Equipe
        </div>
        <div class="nav-item" data-page="tarefas" onclick="navigate('tarefas')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Tarefas
          <span class="nav-badge">${TAREFAS_HOJE ? TAREFAS_HOJE.length : ''}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">GM</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">Gerente Comercial</div>
            <div class="sidebar-user-role">Admin · Todas as regiões</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---- Build Topbar ----
function buildTopbar() {
  return `
    <div class="topbar">
      <span id="topbar-title" class="topbar-title">Dashboard</span>
      <span id="topbar-subtitle" class="topbar-subtitle">Visão geral · Junho 2026</span>
      <div class="topbar-actions">
        <button class="btn btn-ghost btn-icon" onclick="openNotificacoesPanel()" data-notif-btn data-tooltip="Notificações" style="position:relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span id="notif-badge" style="position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--brand-secondary);box-shadow:0 0 6px rgba(249,115,22,0.7)"></span>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="openConfigModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Config
        </button>
      </div>
    </div>
  `;
}

// ---- Init App ----
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${buildSidebar()}
    <div class="main-content">
      ${buildTopbar()}
      <div id="page-content" class="page-content"></div>
    </div>
  `;

  navigate('dashboard');
});
