# ConstróiCRM — Sistema de CRM para Atacado B2B de Material de Construção

> Gerencie clientes, oportunidades e equipe de vendas em um único lugar, feito para distribuidoras e atacadistas do setor de construção civil.

---

## 📋 Sobre o projeto

O **ConstróiCRM** é um sistema de gestão de relacionamento com clientes (CRM) desenvolvido sob medida para empresas que vendem **material de construção no atacado B2B** — distribuidoras, atacadistas e representantes comerciais que atendem construtoras, empreiteiras, incorporadoras e revendedores.

O sistema centraliza toda a operação comercial: do primeiro contato com um cliente potencial até o fechamento do pedido, passando pelo acompanhamento de propostas, follow-ups e histórico de negociações.

---

## 🎯 Para quem é este sistema

Este CRM foi pensado para empresas como:

- **Atacadistas de material de construção** que atendem construtoras e empreiteiras
- **Distribuidoras** de cimento, aço, tintas, hidráulica, argamassa e similares
- **Representantes comerciais** com equipe de vendedores externos

**Perfil do cliente ideal:**
- Empresa B2B com 3 a 20 vendedores
- Carteira de 50 a 500 clientes corporativos (CNPJ)
- Ciclo de venda longo (semanas a meses)
- Produtos de alto volume e necessidade de relacionamento contínuo

---

## ✨ Funcionalidades

### 📊 Dashboard
- KPIs em tempo real: valor em negociação, oportunidades abertas, ticket médio e taxa de conversão
- Gráfico de receita fechada por mês
- Funil de vendas visual por fase
- Lista de follow-ups do dia com alertas de urgência
- Ranking de desempenho por vendedor

### 📌 Pipeline de Vendas (Kanban)
- Visualização de todas as oportunidades em andamento por fase
- Fases: Prospecção → Qualificação → Proposta → Negociação → Fechado
- Arrastar e soltar entre fases (drag & drop)
- Filtros por vendedor, prioridade e busca por nome/cliente
- Criação e edição de oportunidades

### 👥 Clientes
- Cadastro completo de empresas (CNPJ, tipo, segmento, cidade, estado)
- Registro de contato principal (nome, cargo, email, telefone)
- Limite de crédito por cliente
- Histórico de todas as oportunidades por cliente
- Filtros por tipo de empresa e status
- Criação e edição de cadastros

### 📁 Oportunidades
- Detalhamento completo de cada negociação
- Valor estimado e probabilidade de fechamento
- Produtos de interesse e produto principal
- Próxima ação necessária
- Histórico de atividades (ligações, e-mails, reuniões, propostas)
- Registro de novas atividades diretamente pelo sistema

### 📦 Pedidos
- Listagem de pedidos com itens, quantidades e valores
- Atualização de status: Aguardando → Em separação → Faturado → Entregue
- Filtros por status e cliente

### 📈 Relatórios
- Receita acumulada por mês (gráfico de linha)
- Top clientes por receita fechada
- Volume de negócios por categoria de produto
- Resumo de oportunidades por fase com ticket médio

### 📉 Analytics
- Desempenho individual de cada vendedor
- Win rate (taxa de conversão) por vendedor
- Receita fechada vs. pipeline ativo por vendedor
- Distribuição de oportunidades por fase (gráfico de pizza)

### 🧑‍💼 Equipe
- Visão consolidada de cada vendedor
- Métricas individuais: receita, pipeline, número de clientes, win rate
- Acesso direto ao pipeline filtrado por vendedor

### ✅ Tarefas & Follow-ups
- Lista centralizada de todas as ações pendentes
- Filtros: todas, urgentes, hoje
- Marcar tarefas como concluídas
- Vinculação direta com oportunidades

### 🔔 Notificações
- Painel de alertas em tempo real
- Alertas de oportunidades vencidas e follow-ups atrasados
- Marcar notificações como lidas individualmente ou em lote

---

## 🏗️ Estrutura do projeto

```
crm-construcao/
├── index.html              # Entrada da aplicação (SPA)
├── css/
│   ├── main.css            # Design system, variáveis, layout
│   ├── components.css      # Componentes reutilizáveis (botões, cards, modais, formulários)
│   └── pages.css           # Layouts específicos de cada página
└── js/
    ├── data.js             # Dados mock (clientes, oportunidades, produtos, pedidos)
    ├── dashboard.js        # Dashboard e gráficos
    ├── pipeline.js         # Kanban com drag & drop
    ├── clients.js          # Listagem e modal de clientes
    ├── forms.js            # Formulários de criação e edição
    ├── pages.js            # Relatórios, Analytics, Pedidos, Equipe, Tarefas, Config
    └── app.js              # Roteamento SPA, navegação, modais, toasts
```

---

## 🚀 Como executar

Este é um protótipo frontend estático. Não requer instalação de dependências.

### Opção 1 — Python (recomendado)
```bash
cd crm-construcao
python -m http.server 3000
```
Acesse: [http://localhost:3000](http://localhost:3000)

### Opção 2 — Node.js
```bash
npx serve .
```

### Opção 3 — Extensão Live Server (VS Code)
Abra a pasta no VS Code e clique em **Go Live** na barra inferior.

> ⚠️ Não abra o `index.html` diretamente pelo explorador de arquivos — o Chart.js e os scripts precisam de um servidor HTTP para carregar corretamente.

---

## 🎨 Design

- **Modo:** Dark mode
- **Paleta:** Azul petróleo `#1e6fb5` + Laranja âmbar `#f97316`
- **Tipografia:** Inter (Google Fonts)
- **Estilo:** Glassmorphism, micro-animações, gradientes suaves
- **Gráficos:** Chart.js 4.4

---

## 🧪 Dados de demonstração

O sistema vem com dados mock realistas do setor:

| Entidade | Quantidade |
|---|---|
| Clientes | 12 empresas (SP, RJ, MG, CE, PE, RS, PR, BA, GO, AM) |
| Oportunidades | 15 negócios distribuídos pelo funil |
| Produtos | 10 categorias (cimento, aço, tintas, hidráulica...) |
| Vendedores | 4 representantes |
| Pedidos | 8 pedidos com itens detalhados |

---

## 🗺️ Próximos passos (roadmap)

Para evoluir este protótipo para um produto SaaS completo:

- [ ] Backend com autenticação (Node.js + NestJS ou Java + Spring Boot)
- [ ] Banco de dados relacional (PostgreSQL)
- [ ] Multi-tenant (um sistema, múltiplos atacadistas)
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com ERP e sistemas de nota fiscal
- [ ] Envio de e-mails e WhatsApp automatizados
- [ ] Exportação de relatórios em PDF e Excel
- [ ] Gestão de metas por vendedor
- [ ] API pública para integrações

---

## 📄 Licença

Projeto proprietário. Todos os direitos reservados.

---

*Desenvolvido com foco no setor de construção civil brasileiro — onde relacionamento e confiança são o diferencial competitivo.*
