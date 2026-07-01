// ============================================================
// PIPELINE.JS — Kanban Board with Drag & Drop
// ============================================================

let dragSrcCard = null;
let dragSrcFase = null;
let filterVendedor = 'all';
let filterPrioridade = 'all';

const FASE_COLORS = {
  'Prospecção':    'var(--fase-prospeccao)',
  'Qualificação':  'var(--fase-qualificacao)',
  'Proposta':      'var(--fase-proposta)',
  'Negociação':    'var(--fase-negociacao)',
  'Fechado Ganho': 'var(--fase-ganho)',
  'Fechado Perdido':'var(--fase-perdido)',
};

function renderPipeline() {
  const container = document.getElementById('page-content');
  container.innerHTML = '';
  container.className = 'page-content';

  container.innerHTML = `
    <div class="pipeline-header">
      <div>
        <div class="section-title">Pipeline de Vendas</div>
        <div class="section-subtitle">Gerencie oportunidades por fase de negociação</div>
      </div>
      <div class="pipeline-filters">
        <div class="search-box" id="pipeline-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="pipeline-search" placeholder="Buscar oportunidade..." oninput="applyPipelineFilters()">
        </div>
        <select class="filter-select" id="filter-vendedor" onchange="applyPipelineFilters()">
          <option value="all">Todos os vendedores</option>
          ${VENDEDORES.map(v=>`<option value="${v.id}">${v.nome}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-prioridade" onchange="applyPipelineFilters()">
          <option value="all">Todas as prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="openOppForm()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Oportunidade
        </button>
      </div>
    </div>

    <div class="pipeline-board" id="pipeline-board"></div>
  `;

  renderKanbanBoard(OPORTUNIDADES);
}

function getFilteredOpps() {
  const search = (document.getElementById('pipeline-search')?.value || '').toLowerCase();
  const vend   = document.getElementById('filter-vendedor')?.value || 'all';
  const prior  = document.getElementById('filter-prioridade')?.value || 'all';

  return OPORTUNIDADES.filter(o => {
    const c = getCliente(o.cliente_id);
    const matchSearch = !search ||
      o.titulo.toLowerCase().includes(search) ||
      (c && c.nome_fantasia.toLowerCase().includes(search));
    const matchVend  = vend === 'all' || o.vendedor_id === vend;
    const matchPrior = prior === 'all' || o.prioridade === prior;
    return matchSearch && matchVend && matchPrior;
  });
}

function applyPipelineFilters() {
  renderKanbanBoard(getFilteredOpps());
}

function renderKanbanBoard(opps) {
  const board = document.getElementById('pipeline-board');
  if (!board) return;
  board.innerHTML = '';

  FASES.forEach(fase => {
    const faseOpps = opps.filter(o => o.fase === fase);
    const totalVal = faseOpps.reduce((s,o)=>s+o.valor_estimado,0);
    const col = document.createElement('div');
    col.className = 'kanban-column';
    col.dataset.fase = fase;

    col.innerHTML = `
      <div class="kanban-column-header">
        <div class="kanban-col-dot" style="background:${FASE_COLORS[fase]}"></div>
        <span class="kanban-col-name">${fase}</span>
        <span class="kanban-col-count">${faseOpps.length}</span>
      </div>
      <div class="kanban-cards" data-fase="${fase}" id="col-${slugify(fase)}"></div>
    `;

    board.appendChild(col);

    const dropzone = col.querySelector('.kanban-cards');

    // Drag-over events on column
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', (e) => {
      if (!dropzone.contains(e.relatedTarget)) {
        dropzone.classList.remove('drag-over');
      }
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (dragSrcCard && dragSrcFase !== fase) {
        const oppId = dragSrcCard.dataset.oppId;
        const opp = OPORTUNIDADES.find(o => o.id === oppId);
        if (opp) {
          opp.fase = fase;
          showToast(`Movido para "${fase}"`, 'success');
          renderKanbanBoard(getFilteredOpps());
        }
      }
    });

    // Render cards
    faseOpps.forEach(opp => {
      dropzone.appendChild(buildOppCard(opp));
    });
  });
}

function buildOppCard(opp) {
  const cliente = getCliente(opp.cliente_id);
  const vendedor = getVendedor(opp.vendedor_id);
  const produto = getProduto(opp.produto_principal_id);

  const priorityColor = {
    'Alta': 'var(--red)', 'Média': 'var(--amber)', 'Baixa': 'var(--text-muted)'
  }[opp.prioridade] || 'var(--text-muted)';

  const card = document.createElement('div');
  card.className = 'opp-card';
  card.draggable = true;
  card.dataset.oppId = opp.id;

  card.innerHTML = `
    <div class="opp-card-accent" style="background:${FASE_COLORS[opp.fase]}"></div>
    <div class="opp-card-title">${opp.titulo}</div>
    <div class="opp-card-client">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      ${cliente ? cliente.nome_fantasia : '—'}
    </div>
    <div style="display:flex; align-items:center; gap:8px; padding-left:8px; margin-bottom:8px;">
      <span class="chip" style="background:transparent;border:none;padding:0;color:var(--text-muted);font-size:11px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="M10 17H14"/></svg>
        ${produto ? produto.categoria : ''}
      </span>
      <span class="badge ${opp.prioridade === 'Alta' ? 'badge-red' : opp.prioridade === 'Média' ? 'badge-amber' : 'badge-default'}" style="font-size:10px;padding:2px 8px;">${opp.prioridade}</span>
    </div>
    <div class="opp-card-value">${formatCurrency(opp.valor_estimado)}</div>
    <div class="opp-card-footer">
      <div class="opp-card-date">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDate(opp.data_prevista)}
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <div class="opp-card-prob">${opp.probabilidade}%</div>
        <div class="avatar avatar-sm" style="background:${vendedor?.cor || '#444'}" data-tooltip="${vendedor?.nome || ''}">${vendedor?.avatar || '?'}</div>
      </div>
    </div>
  `;

  // Drag events
  card.addEventListener('dragstart', (e) => {
    dragSrcCard = card;
    dragSrcFase = opp.fase;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    dragSrcCard = null;
    dragSrcFase = null;
  });

  // Click to open modal
  card.addEventListener('click', () => openOppModal(opp.id));

  return card;
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g,'');
}

function openNewOppModal() {
  showToast('Funcionalidade em desenvolvimento', 'info');
}
