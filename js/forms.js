// ============================================================
// FORMS.JS — Modais de criação/edição de Oportunidades e Clientes
// ============================================================

// ---- NOVA / EDITAR OPORTUNIDADE ----
function openOppForm(oppId = null) {
  const isEdit = !!oppId;
  const opp = isEdit ? OPORTUNIDADES.find(o => o.id === oppId) : null;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'opp-form-modal';

  modal.innerHTML = `
    <div class="modal modal-lg" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="modal-title">${isEdit ? 'Editar Oportunidade' : 'Nova Oportunidade'}</div>
          <div class="modal-subtitle">${isEdit ? opp.titulo : 'Preencha os dados da oportunidade'}</div>
        </div>
        <button class="modal-close" onclick="closeModal('opp-form-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <form id="opp-form" onsubmit="submitOppForm(event, ${isEdit ? `'${oppId}'` : 'null'})">
          <div class="form-grid">

            <div class="form-group form-span-2">
              <label class="form-label">Título da Oportunidade *</label>
              <input class="form-input" type="text" id="f-titulo" required placeholder="Ex: Fornecimento de Cimento – Obra Residencial"
                value="${opp ? escapeHtml(opp.titulo) : ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Cliente *</label>
              <select class="form-input" id="f-cliente" required>
                <option value="">Selecione o cliente...</option>
                ${CLIENTES.map(c => `<option value="${c.id}" ${opp?.cliente_id === c.id ? 'selected' : ''}>${c.nome_fantasia}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Vendedor Responsável *</label>
              <select class="form-input" id="f-vendedor" required>
                <option value="">Selecione o vendedor...</option>
                ${VENDEDORES.map(v => `<option value="${v.id}" ${opp?.vendedor_id === v.id ? 'selected' : ''}>${v.nome}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Valor Estimado (R$) *</label>
              <input class="form-input" type="number" id="f-valor" required min="0" step="100"
                value="${opp ? opp.valor_estimado : ''}" placeholder="0,00">
            </div>

            <div class="form-group">
              <label class="form-label">Probabilidade (%)</label>
              <input class="form-input" type="number" id="f-prob" min="0" max="100" step="5"
                value="${opp ? opp.probabilidade : '30'}" placeholder="30">
            </div>

            <div class="form-group">
              <label class="form-label">Fase *</label>
              <select class="form-input" id="f-fase" required>
                ${FASES.map(f => `<option value="${f}" ${(opp?.fase || 'Prospecção') === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Prioridade</label>
              <select class="form-input" id="f-prioridade">
                ${['Alta','Média','Baixa'].map(p => `<option value="${p}" ${(opp?.prioridade || 'Média') === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Data de Abertura</label>
              <input class="form-input" type="date" id="f-abertura"
                value="${opp ? opp.data_abertura : new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
              <label class="form-label">Previsão de Fechamento *</label>
              <input class="form-input" type="date" id="f-prevista" required
                value="${opp ? opp.data_prevista : ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Produto Principal</label>
              <select class="form-input" id="f-produto">
                <option value="">Selecione...</option>
                ${PRODUTOS.map(p => `<option value="${p.id}" ${opp?.produto_principal_id === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}
              </select>
            </div>

            <div class="form-group form-span-2">
              <label class="form-label">Próxima Ação</label>
              <input class="form-input" type="text" id="f-acao"
                value="${opp ? escapeHtml(opp.proxima_acao) : ''}"
                placeholder="Descreva a próxima ação necessária...">
            </div>

            ${opp?.fase === 'Fechado Perdido' ? `
            <div class="form-group form-span-2">
              <label class="form-label">Motivo da Perda</label>
              <input class="form-input" type="text" id="f-motivo"
                value="${opp ? escapeHtml(opp.motivo_perda || '') : ''}"
                placeholder="Descreva o motivo da perda...">
            </div>` : ''}

          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('opp-form-modal')">Cancelar</button>
        ${isEdit ? `<button class="btn btn-danger btn-sm" onclick="deleteOpp('${oppId}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>` : ''}
        <button class="btn btn-primary" onclick="document.getElementById('opp-form').requestSubmit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          ${isEdit ? 'Salvar Alterações' : 'Criar Oportunidade'}
        </button>
      </div>
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) closeModal('opp-form-modal'); });
  document.body.appendChild(modal);
}

function submitOppForm(event, oppId) {
  event.preventDefault();
  const isEdit = !!oppId;

  const titulo    = document.getElementById('f-titulo').value.trim();
  const clienteId = document.getElementById('f-cliente').value;
  const vendedorId= document.getElementById('f-vendedor').value;
  const valor     = parseFloat(document.getElementById('f-valor').value);
  const prob      = parseInt(document.getElementById('f-prob').value) || 30;
  const fase      = document.getElementById('f-fase').value;
  const prioridade= document.getElementById('f-prioridade').value;
  const abertura  = document.getElementById('f-abertura').value;
  const prevista  = document.getElementById('f-prevista').value;
  const produtoId = document.getElementById('f-produto').value;
  const acao      = document.getElementById('f-acao').value.trim();
  const motivoEl  = document.getElementById('f-motivo');
  const motivo    = motivoEl ? motivoEl.value.trim() : '';

  if (isEdit) {
    const opp = OPORTUNIDADES.find(o => o.id === oppId);
    if (opp) {
      opp.titulo = titulo;
      opp.cliente_id = clienteId;
      opp.vendedor_id = vendedorId;
      opp.valor_estimado = valor;
      opp.probabilidade = prob;
      opp.fase = fase;
      opp.prioridade = prioridade;
      opp.data_abertura = abertura;
      opp.data_prevista = prevista;
      if (produtoId) opp.produto_principal_id = produtoId;
      if (acao) opp.proxima_acao = acao;
      if (motivo) opp.motivo_perda = motivo;
      closeModal('opp-form-modal');
      closeModal('opp-modal');
      showToast('Oportunidade atualizada com sucesso!', 'success');
      renderPage(currentPage);
    }
  } else {
    const newOpp = {
      id: 'o' + Date.now(),
      titulo,
      cliente_id: clienteId,
      vendedor_id: vendedorId,
      produto_principal_id: produtoId || PRODUTOS[0].id,
      valor_estimado: valor,
      fase,
      probabilidade: prob,
      data_abertura: abertura,
      data_prevista: prevista,
      proxima_acao: acao || 'Definir próxima ação',
      prioridade,
      produtos: produtoId ? [produtoId] : [],
      atividades: [],
    };
    OPORTUNIDADES.push(newOpp);
    closeModal('opp-form-modal');
    showToast('Oportunidade criada com sucesso!', 'success');
    renderPage(currentPage);
  }
}

function deleteOpp(oppId) {
  if (!confirm('Tem certeza que deseja excluir esta oportunidade?')) return;
  const idx = OPORTUNIDADES.findIndex(o => o.id === oppId);
  if (idx !== -1) {
    OPORTUNIDADES.splice(idx, 1);
    closeModal('opp-form-modal');
    closeModal('opp-modal');
    showToast('Oportunidade excluída.', 'warning');
    renderPage(currentPage);
  }
}

// ---- NOVO / EDITAR CLIENTE ----
function openClientForm(clientId = null) {
  const isEdit = !!clientId;
  const c = isEdit ? CLIENTES.find(c => c.id === clientId) : null;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'client-form-modal';

  modal.innerHTML = `
    <div class="modal modal-lg" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="modal-title">${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</div>
          <div class="modal-subtitle">${isEdit ? c.razao_social : 'Cadastrar nova empresa'}</div>
        </div>
        <button class="modal-close" onclick="closeModal('client-form-modal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <form id="client-form" onsubmit="submitClientForm(event, ${isEdit ? `'${clientId}'` : 'null'})">

          <div class="form-section-title">Dados da Empresa</div>
          <div class="form-grid">
            <div class="form-group form-span-2">
              <label class="form-label">Razão Social *</label>
              <input class="form-input" type="text" id="fc-razao" required
                value="${c ? escapeHtml(c.razao_social) : ''}" placeholder="Razão Social Ltda">
            </div>
            <div class="form-group">
              <label class="form-label">Nome Fantasia *</label>
              <input class="form-input" type="text" id="fc-fantasia" required
                value="${c ? escapeHtml(c.nome_fantasia) : ''}" placeholder="Nome Fantasia">
            </div>
            <div class="form-group">
              <label class="form-label">CNPJ *</label>
              <input class="form-input" type="text" id="fc-cnpj" required
                value="${c ? c.cnpj : ''}" placeholder="00.000.000/0001-00" maxlength="18"
                oninput="maskCNPJ(this)">
            </div>
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <select class="form-input" id="fc-tipo" required>
                ${['Construtora','Empreiteira','Revendedor','Incorporadora','Distribuidor'].map(t =>
                  `<option value="${t}" ${c?.tipo === t ? 'selected':''}>${t}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Segmento</label>
              <select class="form-input" id="fc-segmento">
                ${['Residencial','Comercial','Industrial','Infraestrutura','Varejo','Atacado'].map(s =>
                  `<option value="${s}" ${c?.segmento === s ? 'selected':''}>${s}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Cidade *</label>
              <input class="form-input" type="text" id="fc-cidade" required
                value="${c ? escapeHtml(c.cidade) : ''}" placeholder="São Paulo">
            </div>
            <div class="form-group">
              <label class="form-label">Estado (UF) *</label>
              <select class="form-input" id="fc-estado" required>
                ${['SP','RJ','MG','RS','PR','SC','BA','CE','PE','GO','AM','DF','ES','MA','MT','MS','PA','PB','PI','RN','SE','AL','AP','AC','RO','RR','TO'].map(uf =>
                  `<option value="${uf}" ${c?.estado === uf ? 'selected':''}>${uf}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div class="form-section-title" style="margin-top:var(--space-5)">Financeiro & Comercial</div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Limite de Crédito (R$)</label>
              <input class="form-input" type="number" id="fc-limite" min="0" step="1000"
                value="${c ? c.limite_credito : '50000'}" placeholder="50000">
            </div>
            <div class="form-group">
              <label class="form-label">Vendedor Responsável</label>
              <select class="form-input" id="fc-vendedor">
                ${VENDEDORES.map(v => `<option value="${v.id}" ${c?.vendedor_id === v.id ? 'selected':''}>${v.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-input" id="fc-status">
                <option value="Ativo" ${c?.status === 'Ativo' ? 'selected':''}>Ativo</option>
                <option value="Inativo" ${c?.status === 'Inativo' ? 'selected':''}>Inativo</option>
              </select>
            </div>
          </div>

          <div class="form-section-title" style="margin-top:var(--space-5)">Contato Principal</div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nome do Responsável *</label>
              <input class="form-input" type="text" id="fc-resp-nome" required
                value="${c ? escapeHtml(c.responsavel_nome) : ''}" placeholder="João da Silva">
            </div>
            <div class="form-group">
              <label class="form-label">Cargo</label>
              <input class="form-input" type="text" id="fc-resp-cargo"
                value="${c ? escapeHtml(c.responsavel_cargo) : ''}" placeholder="Gerente de Compras">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" id="fc-resp-email"
                value="${c ? c.responsavel_email : ''}" placeholder="contato@empresa.com.br">
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-input" type="text" id="fc-resp-tel"
                value="${c ? c.responsavel_telefone : ''}" placeholder="(11) 99999-9999">
            </div>
          </div>

        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('client-form-modal')">Cancelar</button>
        ${isEdit ? `<button class="btn btn-danger btn-sm" onclick="deleteClient('${clientId}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          Excluir
        </button>` : ''}
        <button class="btn btn-primary" onclick="document.getElementById('client-form').requestSubmit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          ${isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </button>
      </div>
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) closeModal('client-form-modal'); });
  document.body.appendChild(modal);
}

function submitClientForm(event, clientId) {
  event.preventDefault();
  const isEdit = !!clientId;

  const data = {
    razao_social:       document.getElementById('fc-razao').value.trim(),
    nome_fantasia:      document.getElementById('fc-fantasia').value.trim(),
    cnpj:               document.getElementById('fc-cnpj').value.trim(),
    tipo:               document.getElementById('fc-tipo').value,
    segmento:           document.getElementById('fc-segmento').value,
    cidade:             document.getElementById('fc-cidade').value.trim(),
    estado:             document.getElementById('fc-estado').value,
    limite_credito:     parseFloat(document.getElementById('fc-limite').value) || 0,
    vendedor_id:        document.getElementById('fc-vendedor').value,
    status:             document.getElementById('fc-status').value,
    responsavel_nome:   document.getElementById('fc-resp-nome').value.trim(),
    responsavel_cargo:  document.getElementById('fc-resp-cargo').value.trim(),
    responsavel_email:  document.getElementById('fc-resp-email').value.trim(),
    responsavel_telefone: document.getElementById('fc-resp-tel').value.trim(),
  };

  if (isEdit) {
    const c = CLIENTES.find(c => c.id === clientId);
    if (c) Object.assign(c, data);
    closeModal('client-form-modal');
    closeModal('client-modal');
    showToast('Cliente atualizado com sucesso!', 'success');
    renderPage(currentPage);
  } else {
    CLIENTES.push({
      id: 'c' + Date.now(),
      ...data,
      data_cadastro: new Date().toISOString().split('T')[0],
      ticket_medio: 0,
      total_pedidos: 0,
    });
    closeModal('client-form-modal');
    showToast('Cliente cadastrado com sucesso!', 'success');
    renderPage(currentPage);
  }
}

function deleteClient(clientId) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  const idx = CLIENTES.findIndex(c => c.id === clientId);
  if (idx !== -1) {
    CLIENTES.splice(idx, 1);
    closeModal('client-form-modal');
    closeModal('client-modal');
    showToast('Cliente excluído.', 'warning');
    renderPage(currentPage);
  }
}

function maskCNPJ(input) {
  let v = input.value.replace(/\D/g,'');
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  input.value = v.slice(0, 18);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
