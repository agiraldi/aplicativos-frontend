# Contexto do Projeto: Sistema de Gerenciamento de Aplicativos

## 1. Objetivo
Desenvolver uma solução web completa, profissional e moderna para gerenciamento (CRUD) de um catálogo de aplicativos (softwares). O sistema é composto por:
- **Backend:** API REST em Node.js com Express e MongoDB Atlas (Mongoose).
- **Frontend:** Aplicação web responsiva e interativa construída exclusivamente com HTML5, CSS3 e JavaScript puro (Vanilla JS), consumindo a API REST via Fetch.

Ambos os projetos são arquitetados para publicação independente na plataforma Vercel e versionados em repositórios dedicados no GitHub.

---

## 2. Arquitetura
- **Modelo em Duas Camadas Desacopladas:**
  - `aplicativos-api`: API RESTful stateless, pronta para execução local (`node src/app.js`) e serverless na Vercel (`api/index.js`).
  - `aplicativos-frontend`: Single Page Application (SPA) leve em HTML/CSS/JS puro com gerenciamento de estado local reativo, modals acessíveis e centralização de requisições.
- **Comunicação:** JSON via HTTP/HTTPS com CORS configurável.
- **Banco de Dados:** MongoDB Atlas usando o Mongoose com pooling e cache de conexão otimizado para ambientes serverless e tradicionais.

---

## 3. Tecnologias
- **Backend:**
  - Node.js (v24.x LTS)
  - Express.js
  - MongoDB Atlas & Mongoose ODM
  - Cors, Dotenv
  - Jest & Supertest (com `mongodb-memory-server` para testes de integração 100% isolados)
- **Frontend:**
  - HTML5 Semântico
  - CSS3 Moderno (Custom Properties, Flexbox, Grid, Glassmorphism, Micro-animações)
  - JavaScript ES6+ (Fetch API, Async/Await, DOM manipulation)
  - Fontes: Google Fonts (Plus Jakarta Sans, Inter)
- **DevOps & Hospedagem:**
  - Git & GitHub (`agiraldi/aplicativos-api` e `agiraldi/aplicativos-frontend`)
  - Vercel CLI & Hosting

---

## 4. Estrutura de Pastas Planejada

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
│   │   ├── aplicativo.test.js
│   │   └── setup.js
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
    │   └── favicon.svg
    ├── .gitignore
    ├── README.md
    ├── Roadmap.md
    └── Contexto.md
```

---

## 5. Funcionalidades Implementadas
- [x] Planejamento de requisitos e definição de arquitetura.
- [x] Definição da identidade visual (AppNova: Dark Theme, Glassmorphism, Paleta Indigo/Cyan/Emerald).
- [ ] Criação dos repositórios GitHub.
- [ ] Modelagem de dados e endpoints da API.
- [ ] Testes automatizados do Backend.
- [ ] Interface visual do Frontend.
- [ ] Integração e deploy na Vercel.

---

## 6. Decisões Técnicas
1. **Cache de Conexão no Mongoose (`src/config/database.js`):**
   - Funções serverless da Vercel recriam instâncias rapidamente. Implementamos um padrão Singleton para reutilizar a conexão existente do Mongoose (`global.mongooseCached`), evitando o estouro do limite de conexões no MongoDB Atlas.
2. **Ambiente de Testes com `mongodb-memory-server`:**
   - Permite executar a suíte completa de testes de integração com banco de dados real em memória sem depender de credenciais de rede ou poluir a base de dados de produção do Atlas.
3. **Frontend Sem Frameworks:**
   - Uso de Vanilla JavaScript com separação de responsabilidades: `api.js` (cliente HTTP e endpoints) e `app.js` (UI, eventos, toasts, modals, renderização).
4. **Formatação de Preços:**
   - Utilitário para formatar números para BRL (`R$ XX,XX`), tratando especificamente `0` como "Gratuito" com destaque visual verde.
5. **Pré-visualização de Imagens no Formulário:**
   - Validador de URL com evento `input`/`blur` para carregar preview com fallback caso a imagem falhe (`onerror`).

---

## 7. Configurações Necessárias
- **Backend (`.env`):**
  - `PORT`: Porta do servidor local (padrão: `5000`)
  - `MONGODB_URI`: String de conexão do MongoDB Atlas (`mongodb+srv://...`)
  - `CLIENT_URL`: URL permitida para requisições CORS (ex: `http://localhost:3000`, `http://127.0.0.1:5500`, ou domínio na Vercel)
  - `NODE_ENV`: `development` | `production` | `test`
- **Frontend (`js/api.js`):**
  - Configuração centralizada da URL base (`API_BASE_URL`), detectando automaticamente se está rodando em `localhost` ou no domínio de produção.

---

## 8. Testes Executados e Resultados
- *Aguardando implementação da etapa de testes.*

---

## 9. Problemas Encontrados e Soluções
- *Vercel CLI local requer novo login (`vercel login`) para deploy automático via terminal. Forneceremos suporte e comandos claros para login ou deploy manual/Git caso necessário.*

---

## 10. Estado Atual
- Etapas 1, 2 e 3 do Roadmap concluídas (Requisitos, Arquitetura e Tema Visual).
- Próxima etapa: Criação dos repositórios GitHub e desenvolvimento do Backend (`aplicativos-api`).

---

## 11. Próxima Tarefa
- Criar os repositórios locais e no GitHub: `agiraldi/aplicativos-api` e `agiraldi/aplicativos-frontend`.

---

## 12. Pendências
- Obter ou configurar string de conexão do MongoDB Atlas para o ambiente de produção.
- Concluir login na Vercel para publicação com domínios públicos.

---

## 13. Links dos Repositórios e Domínios
- **Backend GitHub:** *A ser criado (agiraldi/aplicativos-api)*
- **Frontend GitHub:** *A ser criado (agiraldi/aplicativos-frontend)*
- **Backend Vercel (Produção):** *Aguardando deploy*
- **Frontend Vercel (Produção):** *Aguardando deploy*
