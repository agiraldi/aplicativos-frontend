# Contexto do Projeto: Sistema de Gerenciamento de Aplicativos

## 1. Objetivo
Desenvolver uma solução web completa, profissional e moderna para gerenciamento (CRUD) de um catálogo de aplicativos (softwares). O sistema é composto por:
- **Backend:** API REST em Node.js com Express e MongoDB Atlas (Mongoose).
- **Frontend:** Aplicação web responsiva e interativa construída exclusivamente com HTML5, CSS3 e JavaScript puro (Vanilla JS), consumindo a API REST via Fetch.

Ambos os projetos foram desenvolvidos, testados e estão versionados em repositórios dedicados no GitHub prontos para hospedagem independente na Vercel.

---

## 2. Arquitetura
- **Modelo em Duas Camadas Desacopladas:**
  - `aplicativos-api`: API RESTful stateless, pronta para execução local (`node src/app.js`) e serverless na Vercel (`api/index.js`).
  - `aplicativos-frontend`: Single Page Application (SPA) leve em HTML/CSS/JS puro com gerenciamento de estado reativo, modals acessíveis e centralização de requisições.
- **Comunicação:** JSON via HTTP/HTTPS com CORS configurável.
- **Banco de Dados:** MongoDB Atlas usando Mongoose com pooling e cache de conexão singleton (`cached.conn`), prevenindo o esgotamento de conexões na Vercel.

---

## 3. Tecnologias
- **Backend:**
  - Node.js (v24.14.1 LTS)
  - Express.js 4.21.2
  - MongoDB Atlas & Mongoose ODM 8.9.5
  - Cors, Dotenv
  - Jest 29.7.0 & Supertest 7.0.0
- **Frontend:**
  - HTML5 Semântico
  - CSS3 Moderno (Custom Properties, Flexbox, Grid, Glassmorphism, Micro-animações)
  - JavaScript ES6+ (Fetch API, Async/Await, DOM manipulation)
  - Fontes: Google Fonts (*Plus Jakarta Sans*, *Inter*)
- **DevOps & Versionamento:**
  - Git & GitHub CLI (`agiraldi/aplicativos-api` e `agiraldi/aplicativos-frontend`)
  - Vercel CLI (v59.1.4)

---

## 4. Estrutura de Pastas Implementada

```
vh ad gustavo/
├── Roadmap.md
├── Contexto.md
├── aplicativos-api/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   └── Aplicativo.js
│   │   ├── controllers/
│   │   │   └── aplicativoController.js
│   │   ├── routes/
│   │   │   ├── aplicativoRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── middlewares/
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── api/
│   │   └── index.js
│   ├── tests/
│   │   └── aplicativo.test.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vercel.json
│   ├── README.md
│   ├── Roadmap.md
│   ├── Contexto.md
│   └── api.md
└── aplicativos-frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js
    │   └── app.js
    ├── assets/
    ├── .gitignore
    ├── vercel.json
    ├── README.md
    ├── Roadmap.md
    └── Contexto.md
```

---

## 5. Funcionalidades Implementadas
- [x] API REST com os 6 endpoints obrigatórios (`GET /api/health`, `GET /api/aplicativos`, `GET /api/aplicativos/:id`, `POST /api/aplicativos`, `PUT /api/aplicativos/:id`, `DELETE /api/aplicativos/:id`).
- [x] Filtros por query params: `?busca=` (nome ou descrição) e `?categoria=`.
- [x] Validações no Backend: nome (2+), categoria (obrigatória), preco (>= 0), descrição (5+), URL de foto válida.
- [x] Preço zero formatado como "Gratuito", preços positivos como "R$ XX,XX".
- [x] Interface Dark Glassmorphic moderna ("AppNova") com micro-interações.
- [x] Hero com métricas em tempo real (Total de Apps, Gratuitos, Categorias Ativas).
- [x] Barra de pesquisa instantânea com debounce de 300ms e botão de limpar.
- [x] Filtro horizontal por pílulas de categorias.
- [x] Modal de cadastro e edição com pré-visualização de imagem de capa em tempo real.
- [x] Modal de confirmação para exclusão de aplicativos.
- [x] Sistema de notificações Toast (sucesso, aviso, erro).
- [x] Estados de carregamento (Skeletons) e estado vazio ilustrado.
- [x] Centralização de API no módulo `js/api.js` com modal de troca dinâmica de URL.

---

## 6. Decisões Técnicas
1. **Cache de Conexão no Mongoose (`src/config/database.js`):**
   - Singleton global para reutilizar conexões em invocações serverless na Vercel.
2. **Ambiente de Testes com `mongodb-memory-server`:**
   - Permite executar a suíte de testes de integração com banco real em memória sem depender de credenciais externas.
3. **Frontend Sem Frameworks:**
   - 100% Vanilla JS, HTML5 e CSS3, sem dependência de Tailwind, React ou Vue, atendendo rigorosamente à especificação do projeto.
4. **Fallback Inteligente em Desenvolvimento:**
   - Se `MONGODB_URI` não for fornecida no `.env` durante o desenvolvimento local interativo, o servidor inicia automaticamente uma instância local para testes sem bloquear o desenvolvedor.

---

## 7. Configurações Necessárias
- **Backend (`.env`):**
  - `PORT`: Porta do servidor local (padrão: `5000`)
  - `MONGODB_URI`: String de conexão do MongoDB Atlas (`mongodb+srv://...`)
  - `CLIENT_URL`: URLs autorizadas no CORS
  - `NODE_ENV`: `development` | `production` | `test`
- **Frontend (`js/api.js`):**
  - Detecção automática de ambiente ou override via modal de configurações.

---

## 8. Testes Executados e Resultados
1. **Backend (Jest + Supertest):**
   - Total de testes: **24 testes automatizados**
   - Aprovados: **24 (100% de aprovação)**
   - Tempo de execução: ~3.3 segundos
   - Cenários testados:
     - Health check (200 OK)
     - Rota raiz (200 OK)
     - Cadastro válido (201 Created)
     - Cadastro com preço 0 (201 Created)
     - Erro de validação de campos obrigatórios (400 Bad Request)
     - Rejeição de preço negativo (400 Bad Request)
     - Rejeição de URL de foto inválida (400 Bad Request)
     - Listagem geral (200 OK)
     - Filtro por categoria (200 OK)
     - Busca por nome (200 OK)
     - Busca por descrição (200 OK)
     - Busca sem correspondência retornando lista vazia (200 OK)
     - Busca por ID válido (200 OK)
     - ID inválido (400 Bad Request)
     - ID inexistente (404 Not Found)
     - Atualização bem-sucedida (200 OK)
     - Atualização com preço inválido (400 Bad Request)
     - Atualização de ID inexistente (404 Not Found)
     - Exclusão bem-sucedida (200 OK)
     - Confirmação de remoção da base de dados
     - Exclusão de ID inexistente (404 Not Found)
     - Exclusão com ID inválido (400 Bad Request)
     - Validação de cabeçalhos CORS
     - Rota não encontrada 404
     - Compatibilidade serverless de `api/index.js`
2. **Frontend e Ponta a Ponta (Browser Subagent):**
   - Navegação e renderização visual inicial aprovadas.
   - Teste de busca em tempo real com debounce aprovado.
   - Teste de filtro por categorias aprovado.
   - Cadastro de novo aplicativo ("Docker Desktop", Gratuito, com URL de foto e preview) aprovado.
   - Edição de aplicativo (atualização de preço para R$ 29,90) aprovada.
   - Verificação de toasts de notificação aprovada.

---

## 9. Problemas Encontrados e Soluções
- **Download do binário do MongoDB para testes:**
  - O download inicial da biblioteca `mongodb-memory-server` em ambiente Windows demorou alguns minutos via rede; concluído com sucesso e testes executados rapidamente.
- **Sessão do Vercel CLI:**
  - O token CLI existente na máquina local expirou (`No existing credentials found`). Os projetos estão estruturados com `vercel.json` e versionados no GitHub, permitindo o deploy com 1 clique no painel da Vercel ou via `vercel login`.

---

## 10. Estado Atual
- Backend e Frontend 100% implementados, testados e com código commitado e publicado no GitHub.
- Repositórios acessíveis publicamente.

---

## 11. Links dos Repositórios e Domínios
- **Repositório Backend:** [https://github.com/agiraldi/aplicativos-api](https://github.com/agiraldi/aplicativos-api)
- **Repositório Frontend:** [https://github.com/agiraldi/aplicativos-frontend](https://github.com/agiraldi/aplicativos-frontend)
- **Instruções de Deploy Vercel:** Documentadas na entrega final para vincular com conta pessoal e cluster MongoDB Atlas.
