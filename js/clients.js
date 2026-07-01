// ============================================================
// CLIENTS.JS — Clients table & client detail modal
// ============================================================

let clientsSearchTerm = '';
let clientsFilterTipo = 'all';
let clientsFilterStatus = 'all';

const TIPO_COLORS = {
  'Construtora':   '#3b82f6',
  'Empreiteira':   '#f59e0b',
  'Revendedor':    '#22c55e',
  'Incorporadora': '#a855f7',
  'Distribuidor':  '#f97316',
};

function renderClients() {
  const container = document.getElementById('page-content');
  container.innerHTML = '';
  container.className = 'page-content';

  container.innerHTML = `
    <div class="clients-header">
      <div>
        <div class="section-title">Clientes</div>
        <div class="section-subtitle">${CLIENTES.length} empresas cadastradas</div>
      </div>
      <div class="clients-filters">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="clients-search" placeholder="Buscar empresa, CNPJ..." oninput="applyClientFilters()">
        </div>
        <select class="filter-select" id="filter-tipo" onchange="applyClientFilters()">
          <option value="all">Todos os tipos</option>
          <option value="Construtora">Construtora</option>
          <option value="Empreiteira">Empreiteira</option>
          <option value="Revendedor">Revendedor</option>
          <option value="Incorporadora">Incorporadora</option>
          <option value="Distribuidor">Distribuidor</option>
        </select>
        <select class="filter-select" id="filter-status" onchange="applyClientFilters()">
          <option value="all">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="openClientForm()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Cliente
        </button>
      </div>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrapper" style="border:none;border-radius:var(--radius-lg);">
        <table class="data-table" id="clients-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Cidade / UF</th>
              <th>Responsável</th>
              <th>Ticket Médio</th>
              <th>Pedidos</th>
              <th>Limite Crédito</th>
              <th>Status</th>
              <th>Vendedor</th>
            </tr>
          </thead>
          <tbody id="clients-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  renderClientsTable(CLIENTES);
}

function applyClientFilters() {
  const search = (document.getElementById('clients-search')?.value || '').toLowerCase();
  const tipo   = document.getElementById('filter-tipo')?.value || 'all';
  const status = document.getElementById('filter-status')?.value || 'all';

  const filtered = CLIENTES.filter(c => {
    const matchSearch = !search ||
      c.razao_social.toLowerCase().includes(search) ||
      c.nome_fantasia.toLowerCase().includes(search) ||
      c.cnpj.includes(search) ||
      c.responsavel_nome.toLowerCase().includes(search);
    const matchTipo   = tipo === 'all' || c.tipo === tipo;
    const matchStatus = status === 'all' || c.status === status;
    return matchSearch && matchTipo && matchStatus;
  });

  renderClientsTable(filtered);
}

function renderClientsTable(clients) {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;

  if (clients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <div class="empty-state-title">Nenhum cliente encontrado</div>
            <div class="text-sm text-muted">Tente ajustar os filtros de busca</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = clients.map(c => {
    const v = getVendedor(c.vendedor_id);
    const cor = TIPO_COLORS[c.tipo] || '#9ab2cc';
    const initials = c.nome_fantasia.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

    return `
      <tr onclick="openClientModal('${c.id}')">
        <td>
          <div class="client-avatar-cell">
            <div class="avatar" style="background:${cor}">${initials}</div>
            <div class="client-company-info">
              <div class="client-company-name">${c.nome_fantasia}</div>
              <div class="client-company-cnpj">${c.cnpj}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-default">
            <span class="client-type-dot" style="background:${cor}"></span>
            ${c.tipo}
          </span>
        </td>
        <td class="td-primary">${c.cidade}/${c.estado}</td>
        <td>
          <div style="font-size:var(--font-size-sm);color:var(--text-secondary)">${c.responsavel_nome}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted)">${c.responsavel_cargo}</div>
        </td>
        <td class="td-primary">${formatCurrency(c.ticket_medio)}</td>
        <td class="td-primary">${c.total_pedidos}</td>
        <td class="td-primary">${formatCurrency(c.limite_credito)}</td>
        <td>
          <span class="badge ${c.status === 'Ativo' ? 'badge-green' : 'badge-red'}">${c.status}</span>
        </td>
        <td>
          <div class="avatar avatar-sm" style="background:${v?.cor || '#444'}" data-tooltip="${v?.nome || ''}">${v?.avatar || '?'}</div>
        </td>
      </tr>
    `;
  }).join('');
}

function openClientModal(clientId) {
  const c = CLIENTES.find(c => c.id === clientId);
  if (!c) return;

  const v = getVendedor(c.vendedor_id);
  const cor = TIPO_COLORS[c.tipo] || '#9ab2cc';
  const initials = c.nome_fantasia.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const opps = OPORTUNIDADES.filter(o => o.cliente_id === clientId);
  const emAberto = opps.filter(o => !o.fase.startsWith('Fechado'));
  const totalNeg = emAberto.reduce((s,o)=>s+o.valor_estimado,0);

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'client-modal';

  modal.innerHTML = `
    <div class="modal modal-lg" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="client-detail-header" style="margin-bottom:0">
            <div class="client-detail-avatar" style="background:${cor}">${initials}</div>
            <div>
              <div class="modal-title">${c.nome_fantasia}</div>
              <div class="modal-subtitle">${c.razao_social} · ${c.cnpj}</div>
            </div>
          </div>
        </div>
        <button class="modal-close" onclick="closeModal('client-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">

        <!-- Stats -->
        <div class="client-stats-row">
          <div class="client-stat-box">
            <span class="client-stat-value" style="color:var(--green)">${formatCurrency(totalNeg)}</span>
            <span class="client-stat-label">Em negociação</span>
          </div>
          <div class="client-stat-box">
            <span class="client-stat-value">${c.total_pedidos}</span>
            <span class="client-stat-label">Pedidos realizados</span>
          </div>
          <div class="client-stat-box">
            <span class="client-stat-value">${formatCurrency(c.ticket_medio)}</span>
            <span class="client-stat-label">Ticket médio</span>
          </div>
        </div>

        <hr class="divider">

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
          <!-- Dados da empresa -->
          <div>
            <div class="opp-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              Dados da Empresa
            </div>
            <div class="info-row"><span class="info-label">Tipo</span><span class="info-value"><span class="badge badge-default">${c.tipo}</span></span></div>
            <div class="info-row"><span class="info-label">Segmento</span><span class="info-value">${c.segmento}</span></div>
            <div class="info-row"><span class="info-label">Cidade</span><span class="info-value">${c.cidade}/${c.estado}</span></div>
            <div class="info-row"><span class="info-label">Limite de Crédito</span><span class="info-value">${formatCurrency(c.limite_credito)}</span></div>
            <div class="info-row"><span class="info-label">Cliente desde</span><span class="info-value">${formatDate(c.data_cadastro)}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge ${c.status==='Ativo'?'badge-green':'badge-red'}">${c.status}</span></span></div>
          </div>

          <!-- Contato -->
          <div>
            <div class="opp-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Contato Principal
            </div>
            <div class="info-row"><span class="info-label">Nome</span><span class="info-value">${c.responsavel_nome}</span></div>
            <div class="info-row"><span class="info-label">Cargo</span><span class="info-value">${c.responsavel_cargo}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-value" style="font-size:var(--font-size-xs)">${c.responsavel_email}</span></div>
            <div class="info-row"><span class="info-label">Telefone</span><span class="info-value">${c.responsavel_telefone}</span></div>
            <div class="info-row">
              <span class="info-label">Vendedor</span>
              <span class="info-value" style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
                <div class="avatar avatar-sm" style="background:${v?.cor}">${v?.avatar}</div>
                ${v?.nome}
              </span>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Oportunidades -->
        <div class="opp-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Oportunidades (${opps.length})
        </div>
        ${opps.length === 0
          ? '<div class="text-sm text-muted" style="padding:var(--space-4)">Nenhuma oportunidade registrada.</div>'
          : opps.map(o => `
            <div class="task-item" style="margin-bottom:var(--space-2)" onclick="closeModal('client-modal'); setTimeout(()=>openOppModal('${o.id}'),100)">
              <div style="flex:1">
                <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">${o.titulo}</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px">${o.fase} · ${formatDate(o.data_prevista)}</div>
              </div>
              <span class="badge ${faseBadgeClass(o.fase)}">${o.fase}</span>
              <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);white-space:nowrap">${formatCurrency(o.valor_estimado)}</div>
            </div>
          `).join('')
        }
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('client-modal')">Fechar</button>
        <button class="btn btn-primary" onclick="closeModal('client-modal');openClientForm('${c.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar Cliente
        </button>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal('client-modal');
  });

  document.body.appendChild(modal);
}
