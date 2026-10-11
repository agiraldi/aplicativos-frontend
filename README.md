# 🎨 AppNova Frontend (`aplicativos-frontend`)

Interface moderna, fluida e responsiva para catálogo e gerenciamento de aplicativos e softwares (**AppNova**), desenvolvida exclusivamente com **HTML5**, **CSS3** e **JavaScript puro (Vanilla JS)**.

Projetada com tema Dark Glassmorphism de padrão SaaS internacional, consumindo a API REST de forma reativa e centralizada.

---

## ✨ Funcionalidades da Interface

- **Identidade Visual Premium:**
  - Modo escuro com glassmorphism (`backdrop-filter: blur(16px)`).
  - Paleta de cores com acentos em Indigo, Violeta, Cyan, Verde Esmeralda (Gratuito) e Coral (Avisos/Exclusão).
  - Tipografia moderna com Google Fonts (*Plus Jakarta Sans* e *Inter*).
  - Micro-interações táteis e suaves em cards, botões e campos de formulário.
- **Catálogo Interativo:**
  - Hero com métricas em tempo real (Total de Aplicativos, Aplicativos Gratuitos e Categorias Ativas).
  - Grade responsiva adaptada para telas de celulares, tablets e desktops.
  - Indicador de status de conectividade da API (Online, Offline, Conectando).
- **Busca e Filtros Dinâmicos:**
  - Campo de busca instantânea com debounce de 300ms por nome ou descrição.
  - Barra de seleção rápida por pílulas de categorias (Produtividade, Design, Desenvolvimento, etc.).
- **Gerenciamento Completo (CRUD):**
  - Modal para cadastrar novos aplicativos e editar existentes.
  - Pré-visualização de imagem de capa em tempo real com validação de URL e fallback elegante.
  - Formatação automática de preços em reais (`R$ 19,90`) e destaque estilizado para itens gratuitos (`R$ 0,00` -> `Gratuito`).
  - Modal de confirmação para exclusão segura.
- **Feedback ao Usuário:**
  - Skeletons animados durante o carregamento de dados.
  - Telas ilustradas para estado vazio e falha de conexão.
  - Sistema flutuante de notificações Toast (Sucesso, Erro, Aviso) com auto-dismiss.
- **Centralização da API:**
  - Módulo `js/api.js` centralizando todas as chamadas `fetch`.
  - Detecção automática de ambiente (Localhost vs. Produção Vercel).
  - Modal de configuração de URL para alternar endpoints em tempo de execução sem alterar código.

---

## 🛠️ Tecnologias Utilizadas

- **Estrutura:** HTML5 Semântico
- **Estilização:** CSS3 Moderno (Custom Properties, Flexbox, CSS Grid, Media Queries)
- **Lógica e Interatividade:** JavaScript puro (ES6+, Fetch API, Async/Await)
- **Tipografia:** Google Fonts (*Plus Jakarta Sans*, *Inter*)
- **Hospedagem:** Vercel Static Hosting

*Zero dependências de frameworks externos (sem React, sem Vue, sem Tailwind).*

---

## 📁 Estrutura de Pastas

```
aplicativos-frontend/
├── assets/                  # Ícones e recursos visuais
├── css/
│   └── style.css            # Folha de estilos e design system do AppNova
├── js/
│   ├── api.js               # Cliente HTTP e endpoints centralizados
│   └── app.js               # Gerenciamento de estado, DOM, modais e eventos
├── .gitignore
├── Contexto.md              # Resumo técnico e status do projeto
├── index.html               # Página principal do catálogo
├── README.md
├── Roadmap.md               # Rastreamento de progresso
└── vercel.json              # Configurações de cabeçalhos e segurança para Vercel
```

---

## 🚀 Como Executar Localmente

### Opção 1: Extensão Live Server (VS Code / Antigravity)
Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**.

### Opção 2: Servidor estático com Node.js
```bash
npx serve .
# ou
npx http-server -p 3000
```

### Opção 3: Abertura direta no navegador
Abra o arquivo `index.html` diretamente em qualquer navegador moderno.

---

## 🔌 Configuração da URL da API

Por padrão, a aplicação verifica automaticamente:
- Se estiver rodando em `localhost` ou `127.0.0.1`: utiliza `http://localhost:5000/api`.
- Se estiver rodando em produção (Vercel): utiliza `https://aplicativos-api.vercel.app/api`.

Você também pode alterar a URL da API a qualquer momento clicando no ícone de engrenagem no canto superior direito do cabeçalho.
