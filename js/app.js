/**
 * APPNOVA - LÓGICA PRINCIPAL DO FRONTEND (Vanilla JS)
 * Gerenciamento de estado, renderização do catálogo, validações, modais e toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // ESTADO DA APLICAÇÃO
  // =========================================================================
  const state = {
    apps: [],
    currentCategory: 'Todas',
    searchQuery: '',
    editingAppId: null,
    deletingAppId: null,
    isLoading: false,
    debounceTimer: null,
  };

  // =========================================================================
  // ELEMENTOS DO DOM
  // =========================================================================
  const DOM = {
    // Header & Status
    apiStatusDot: document.getElementById('apiStatusDot'),
    apiStatusLabel: document.getElementById('apiStatusLabel'),
    btnConfigApi: document.getElementById('btnConfigApi'),
    btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),

    // Métricas (Hero)
    statTotalApps: document.getElementById('statTotalApps'),
    statFreeApps: document.getElementById('statFreeApps'),
    statActiveCategories: document.getElementById('statActiveCategories'),

    // Barra de Ferramentas
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    categoryFilters: document.getElementById('categoryFilters'),

    // Catálogo
    catalogLoading: document.getElementById('catalogLoading'),
    appsGrid: document.getElementById('appsGrid'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    btnResetFilters: document.getElementById('btnResetFilters'),
    errorState: document.getElementById('errorState'),
    errorMessageText: document.getElementById('errorMessageText'),
    btnRetryFetch: document.getElementById('btnRetryFetch'),
    btnConfigApiFromError: document.getElementById('btnConfigApiFromError'),

    // Modal Criar/Editar
    appModalBackdrop: document.getElementById('appModalBackdrop'),
    modalTitle: document.getElementById('modalTitle'),
    btnCloseAppModal: document.getElementById('btnCloseAppModal'),
    btnCancelAppModal: document.getElementById('btnCancelAppModal'),
    appForm: document.getElementById('appForm'),
    appIdInput: document.getElementById('appIdInput'),
    nomeInput: document.getElementById('nomeInput'),
    nomeError: document.getElementById('nomeError'),
    categoriaInput: document.getElementById('categoriaInput'),
    categoriaError: document.getElementById('categoriaError'),
    precoInput: document.getElementById('precoInput'),
    precoError: document.getElementById('precoError'),
    fotoInput: document.getElementById('fotoInput'),
    fotoError: document.getElementById('fotoError'),
    imagePreview: document.getElementById('imagePreview'),
    imagePreviewPlaceholder: document.getElementById('imagePreviewPlaceholder'),
    previewBadge: document.getElementById('previewBadge'),
    descricaoInput: document.getElementById('descricaoInput'),
    descricaoError: document.getElementById('descricaoError'),
    charCounter: document.getElementById('charCounter'),
    btnSaveApp: document.getElementById('btnSaveApp'),
    saveSpinner: document.getElementById('saveSpinner'),
    saveBtnText: document.getElementById('saveBtnText'),

    // Modal Excluir
    deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
    deleteAppName: document.getElementById('deleteAppName'),
    btnCloseDeleteModal: document.getElementById('btnCloseDeleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    deleteSpinner: document.getElementById('deleteSpinner'),

    // Modal Configurar API
    configApiModalBackdrop: document.getElementById('configApiModalBackdrop'),
    apiUrlInput: document.getElementById('apiUrlInput'),
    btnSetLocalApi: document.getElementById('btnSetLocalApi'),
    btnSetProdApi: document.getElementById('btnSetProdApi'),
    btnCloseConfigApiModal: document.getElementById('btnCloseConfigApiModal'),
    btnCancelConfigApi: document.getElementById('btnCancelConfigApi'),
    btnSaveConfigApi: document.getElementById('btnSaveConfigApi'),

    // Container de Toasts
    toastContainer: document.getElementById('toastContainer'),
  };

  // =========================================================================
  // SISTEMA DE NOTIFICAÇÕES (TOASTS)
  // =========================================================================
  function showToast(title, message, type = 'info', duration = 4500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '•'}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-message">${escapeHTML(message)}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Fechar notificação">&times;</button>
    `;

    DOM.toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  // =========================================================================
  // FORMATAÇÃO E HELPERS
  // =========================================================================
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Formata preço em Real brasileiro (R$ 19,90) ou 'Gratuito' se 0
   */
  function formatPrice(preco) {
    const valor = Number(preco);
    if (isNaN(valor) || valor <= 0) {
      return { text: 'Gratuito', isFree: true };
    }
    const formatted = valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return { text: formatted, isFree: false };
  }

  // =========================================================================
  // STATUS DA API
  // =========================================================================
  async function updateApiStatus() {
    try {
      DOM.apiStatusDot.className = 'status-dot status-loading';
      DOM.apiStatusLabel.textContent = 'Verificando...';

      const health = await API.checkHealth();
      if (health && (health.status === 'ok' || health.service)) {
        DOM.apiStatusDot.className = 'status-dot status-online';
        DOM.apiStatusLabel.textContent = 'API Online';
      } else {
        DOM.apiStatusDot.className = 'status-dot status-loading';
        DOM.apiStatusLabel.textContent = 'API Degradada';
      }
    } catch {
      DOM.apiStatusDot.className = 'status-dot status-offline';
      DOM.apiStatusLabel.textContent = 'API Offline';
    }
  }

  // =========================================================================
  // CARREGAMENTO E RENDERIZAÇÃO DO CATÁLOGO
  // =========================================================================
  async function loadApplications() {
    state.isLoading = true;
    DOM.catalogLoading.classList.remove('hidden');
    DOM.appsGrid.classList.add('hidden');
    DOM.emptyState.classList.add('hidden');
    DOM.errorState.classList.add('hidden');

    try {
      const response = await API.listarAplicativos({
        busca: state.searchQuery,
        categoria: state.currentCategory,
      });

      state.apps = (response && response.data) || [];
      renderApplications();
      updateStats();
      updateApiStatus();
    } catch (err) {
      console.error('Erro ao listar aplicativos:', err);
      DOM.catalogLoading.classList.add('hidden');
      DOM.errorMessageText.textContent = err.message || 'Falha ao conectar com o Backend.';
      DOM.errorState.classList.remove('hidden');
      updateApiStatus();
    } finally {
      state.isLoading = false;
    }
  }

  function renderApplications() {
    DOM.catalogLoading.classList.add('hidden');

    if (!state.apps || state.apps.length === 0) {
      DOM.appsGrid.innerHTML = '';
      DOM.appsGrid.classList.add('hidden');

      if (state.searchQuery || state.currentCategory !== 'Todas') {
        DOM.emptyStateTitle.textContent = 'Nenhum resultado encontrado';
        DOM.emptyStateDesc.textContent =
          'Não encontramos nenhum aplicativo correspondente aos termos ou categoria informados.';
      } else {
        DOM.emptyStateTitle.textContent = 'Catálogo vazio';
        DOM.emptyStateDesc.textContent =
          'Nenhum aplicativo foi cadastrado ainda. Clique em "Novo Aplicativo" acima para iniciar!';
      }

      DOM.emptyState.classList.remove('hidden');
      return;
    }

    DOM.emptyState.classList.add('hidden');
    DOM.appsGrid.classList.remove('hidden');

    DOM.appsGrid.innerHTML = state.apps
      .map((app) => {
        const { text: priceText, isFree } = formatPrice(app.preco);
        const priceBadgeClass = isFree ? 'app-badge-price free' : 'app-badge-price paid';

        const hasFoto = app.foto && app.foto.trim() !== '';
        const initial = (app.nome || 'A').charAt(0).toUpperCase();

        const coverHtml = hasFoto
          ? `<img
              src="${escapeHTML(app.foto)}"
              alt="${escapeHTML(app.nome)}"
              class="app-card-img"
              loading="lazy"
              onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'app-card-cover-fallback\\'><span>${initial}</span></div>';"
             >`
          : `<div class="app-card-cover-fallback"><span>${initial}</span></div>`;

        return `
          <article class="app-card" data-id="${app._id}">
            <div class="app-card-cover">
              ${coverHtml}
              <span class="app-badge-category">${escapeHTML(app.categoria)}</span>
              <span class="${priceBadgeClass}">${priceText}</span>
            </div>
            <div class="app-card-body">
              <h3 class="app-card-title" title="${escapeHTML(app.nome)}">${escapeHTML(app.nome)}</h3>
              <p class="app-card-desc" title="${escapeHTML(app.descricao)}">${escapeHTML(app.descricao)}</p>
              <div class="app-card-footer">
                <div class="card-actions">
                  <button
                    type="button"
                    class="btn-card-action btn-edit"
                    data-action="edit"
                    data-id="${app._id}"
                    title="Editar aplicativo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn-card-action btn-delete"
                    data-action="delete"
                    data-id="${app._id}"
                    data-name="${escapeHTML(app.nome)}"
                    title="Excluir aplicativo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function updateStats() {
    const total = state.apps.length;
    const free = state.apps.filter((a) => Number(a.preco) === 0).length;
    const categories = new Set(state.apps.map((a) => a.categoria)).size;

    DOM.statTotalApps.textContent = total;
    DOM.statFreeApps.textContent = free;
    DOM.statActiveCategories.textContent = categories;
  }

  // =========================================================================
  // PESQUISA E FILTROS DE CATEGORIA
  // =========================================================================
  DOM.searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    state.searchQuery = value;

    if (value.trim()) {
      DOM.btnClearSearch.classList.remove('hidden');
    } else {
      DOM.btnClearSearch.classList.add('hidden');
    }

    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      loadApplications();
    }, 300);
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.btnClearSearch.classList.add('hidden');
    loadApplications();
  });

  DOM.categoryFilters.addEventListener('click', (e) => {
    const button = e.target.closest('.category-pill');
    if (!button) return;

    DOM.categoryFilters
      .querySelectorAll('.category-pill')
      .forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    state.currentCategory = button.getAttribute('data-category');
    loadApplications();
  });

  DOM.btnResetFilters.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.btnClearSearch.classList.add('hidden');

    DOM.categoryFilters
      .querySelectorAll('.category-pill')
      .forEach((btn) => btn.classList.remove('active'));

    const allBtn = DOM.categoryFilters.querySelector('[data-category="Todas"]');
    if (allBtn) allBtn.classList.add('active');
    state.currentCategory = 'Todas';

    loadApplications();
  });

  DOM.btnRetryFetch.addEventListener('click', () => {
    loadApplications();
  });

  // =========================================================================
  // GESTÃO DO MODAL DE CRIAÇÃO / EDIÇÃO
  // =========================================================================
  function openCreateModal() {
    state.editingAppId = null;
    DOM.modalTitle.textContent = 'Cadastrar Novo Aplicativo';
    DOM.saveBtnText.textContent = 'Salvar Aplicativo';
    DOM.appForm.reset();
    DOM.appIdInput.value = '';
    clearValidationErrors();
    updateImagePreview('');
    DOM.charCounter.textContent = '0 / 1000';
    DOM.appModalBackdrop.classList.remove('hidden');
    DOM.nomeInput.focus();
  }

  async function openEditModal(id) {
    clearValidationErrors();
    const app = state.apps.find((a) => a._id === id);
    if (!app) {
      showToast('Erro', 'Aplicativo não encontrado no estado local.', 'error');
      return;
    }

    state.editingAppId = id;
    DOM.modalTitle.textContent = 'Editar Aplicativo';
    DOM.saveBtnText.textContent = 'Atualizar Aplicativo';

    DOM.appIdInput.value = app._id;
    DOM.nomeInput.value = app.nome || '';
    DOM.categoriaInput.value = app.categoria || '';
    DOM.precoInput.value = app.preco !== undefined ? app.preco : '';
    DOM.fotoInput.value = app.foto || '';
    DOM.descricaoInput.value = app.descricao || '';

    updateImagePreview(app.foto || '');
    DOM.charCounter.textContent = `${(app.descricao || '').length} / 1000`;

    DOM.appModalBackdrop.classList.remove('hidden');
    DOM.nomeInput.focus();
  }

  function closeAppModal() {
    DOM.appModalBackdrop.classList.add('hidden');
    DOM.appForm.reset();
    clearValidationErrors();
    state.editingAppId = null;
  }

  DOM.btnOpenCreateModal.addEventListener('click', openCreateModal);
  DOM.btnCloseAppModal.addEventListener('click', closeAppModal);
  DOM.btnCancelAppModal.addEventListener('click', closeAppModal);

  // Contador de caracteres da descrição
  DOM.descricaoInput.addEventListener('input', (e) => {
    const len = e.target.value.length;
    DOM.charCounter.textContent = `${len} / 1000`;
  });

  // Pré-visualização de imagem em tempo real
  function updateImagePreview(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      DOM.imagePreview.src = '';
      DOM.imagePreview.classList.add('hidden');
      DOM.imagePreviewPlaceholder.classList.remove('hidden');
      DOM.previewBadge.textContent = 'Sem imagem definida';
      return;
    }

    const isValidFormat =
      /^(https?:\/\/[^\s$.?#].[^\s]*|data:image\/[a-zA-Z]+;base64,[^\s]+)$/i.test(trimmed);

    if (!isValidFormat) {
      DOM.imagePreview.src = '';
      DOM.imagePreview.classList.add('hidden');
      DOM.imagePreviewPlaceholder.classList.remove('hidden');
      DOM.previewBadge.textContent = 'URL inválida (use http/https)';
      return;
    }

    DOM.previewBadge.textContent = 'Carregando prévia...';
    DOM.imagePreview.src = trimmed;
    DOM.imagePreview.onload = () => {
      DOM.imagePreview.classList.remove('hidden');
      DOM.imagePreviewPlaceholder.classList.add('hidden');
      DOM.previewBadge.textContent = 'Prévia carregada com sucesso';
    };
    DOM.imagePreview.onerror = () => {
      DOM.imagePreview.classList.add('hidden');
      DOM.imagePreviewPlaceholder.classList.remove('hidden');
      DOM.previewBadge.textContent = 'Falha ao carregar imagem na URL';
    };
  }

  DOM.fotoInput.addEventListener('input', (e) => {
    updateImagePreview(e.target.value);
  });

  // =========================================================================
  // VALIDAÇÕES DO FORMULÁRIO
  // =========================================================================
  function clearValidationErrors() {
    [
      DOM.nomeError,
      DOM.categoriaError,
      DOM.precoError,
      DOM.fotoError,
      DOM.descricaoError,
    ].forEach((el) => (el.textContent = ''));

    [
      DOM.nomeInput,
      DOM.categoriaInput,
      DOM.precoInput,
      DOM.fotoInput,
      DOM.descricaoInput,
    ].forEach((el) => el.classList.remove('input-invalid'));
  }

  function validateForm() {
    clearValidationErrors();
    let isValid = true;

    // Nome
    const nomeVal = DOM.nomeInput.value.trim();
    if (!nomeVal) {
      DOM.nomeError.textContent = 'O nome do aplicativo é obrigatório.';
      DOM.nomeInput.classList.add('input-invalid');
      isValid = false;
    } else if (nomeVal.length < 2) {
      DOM.nomeError.textContent = 'O nome deve ter pelo menos 2 caracteres.';
      DOM.nomeInput.classList.add('input-invalid');
      isValid = false;
    }

    // Categoria
    const catVal = DOM.categoriaInput.value;
    if (!catVal) {
      DOM.categoriaError.textContent = 'Selecione uma categoria para o aplicativo.';
      DOM.categoriaInput.classList.add('input-invalid');
      isValid = false;
    }

    // Preço
    const precoRaw = DOM.precoInput.value;
    if (precoRaw === '' || precoRaw === null || isNaN(Number(precoRaw))) {
      DOM.precoError.textContent = 'Informe um preço válido (use 0 para gratuito).';
      DOM.precoInput.classList.add('input-invalid');
      isValid = false;
    } else if (Number(precoRaw) < 0) {
      DOM.precoError.textContent = 'O preço não pode ser negativo.';
      DOM.precoInput.classList.add('input-invalid');
      isValid = false;
    }

    // Foto (se fornecida)
    const fotoVal = DOM.fotoInput.value.trim();
    if (fotoVal) {
      const isUrl =
        /^(https?:\/\/[^\s$.?#].[^\s]*|data:image\/[a-zA-Z]+;base64,[^\s]+)$/i.test(fotoVal);
      if (!isUrl) {
        DOM.fotoError.textContent = 'Informe uma URL válida iniciando com http:// ou https://';
        DOM.fotoInput.classList.add('input-invalid');
        isValid = false;
      }
    }

    // Descrição
    const descVal = DOM.descricaoInput.value.trim();
    if (!descVal) {
      DOM.descricaoError.textContent = 'A descrição do aplicativo é obrigatória.';
      DOM.descricaoInput.classList.add('input-invalid');
      isValid = false;
    } else if (descVal.length < 5) {
      DOM.descricaoError.textContent = 'A descrição deve ter pelo menos 5 caracteres.';
      DOM.descricaoInput.classList.add('input-invalid');
      isValid = false;
    }

    return isValid;
  }

  // =========================================================================
  // SUBMISSÃO DO FORMULÁRIO (CRIAR / ATUALIZAR)
  // =========================================================================
  DOM.appForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Validação', 'Por favor, corrija os campos destacados.', 'error');
      return;
    }

    const payload = {
      nome: DOM.nomeInput.value.trim(),
      categoria: DOM.categoriaInput.value,
      preco: Number(DOM.precoInput.value),
      foto: DOM.fotoInput.value.trim(),
      descricao: DOM.descricaoInput.value.trim(),
    };

    DOM.btnSaveApp.disabled = true;
    DOM.saveSpinner.classList.remove('hidden');

    try {
      if (state.editingAppId) {
        // Atualização
        await API.atualizarAplicativo(state.editingAppId, payload);
        showToast('Sucesso', 'Aplicativo atualizado com sucesso!', 'success');
      } else {
        // Criação
        await API.criarAplicativo(payload);
        showToast('Sucesso', 'Aplicativo cadastrado com sucesso!', 'success');
      }

      closeAppModal();
      await loadApplications();
    } catch (err) {
      console.error('Erro ao salvar aplicativo:', err);
      showToast('Erro ao Salvar', err.message || 'Falha na comunicação com a API.', 'error');
    } finally {
      DOM.btnSaveApp.disabled = false;
      DOM.saveSpinner.classList.add('hidden');
    }
  });

  // =========================================================================
  // AÇÕES NOS CARDS (DELEGAÇÃO DE EVENTOS: EDITAR / EXCLUIR)
  // =========================================================================
  DOM.appsGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      openEditModal(id);
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const name = deleteBtn.getAttribute('data-name');
      openDeleteModal(id, name);
    }
  });

  // =========================================================================
  // GESTÃO DO MODAL DE EXCLUSÃO
  // =========================================================================
  function openDeleteModal(id, name) {
    state.deletingAppId = id;
    DOM.deleteAppName.textContent = name || 'Aplicativo selecionado';
    DOM.deleteModalBackdrop.classList.remove('hidden');
  }

  function closeDeleteModal() {
    DOM.deleteModalBackdrop.classList.add('hidden');
    state.deletingAppId = null;
  }

  DOM.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  DOM.btnCancelDelete.addEventListener('click', closeDeleteModal);

  DOM.btnConfirmDelete.addEventListener('click', async () => {
    if (!state.deletingAppId) return;

    DOM.btnConfirmDelete.disabled = true;
    DOM.deleteSpinner.classList.remove('hidden');

    try {
      await API.excluirAplicativo(state.deletingAppId);
      showToast('Excluído', 'Aplicativo removido com sucesso!', 'success');
      closeDeleteModal();
      await loadApplications();
    } catch (err) {
      console.error('Erro ao excluir aplicativo:', err);
      showToast('Erro ao Excluir', err.message || 'Falha ao remover o aplicativo.', 'error');
    } finally {
      DOM.btnConfirmDelete.disabled = false;
      DOM.deleteSpinner.classList.add('hidden');
    }
  });

  // =========================================================================
  // CONFIGURAÇÃO DINÂMICA DA URL DA API
  // =========================================================================
  function openConfigApiModal() {
    DOM.apiUrlInput.value = API.getBaseUrl();
    DOM.configApiModalBackdrop.classList.remove('hidden');
  }

  function closeConfigApiModal() {
    DOM.configApiModalBackdrop.classList.add('hidden');
  }

  DOM.btnConfigApi.addEventListener('click', openConfigApiModal);
  DOM.btnConfigApiFromError.addEventListener('click', openConfigApiModal);
  DOM.btnCloseConfigApiModal.addEventListener('click', closeConfigApiModal);
  DOM.btnCancelConfigApi.addEventListener('click', closeConfigApiModal);

  DOM.btnSetLocalApi.addEventListener('click', () => {
    DOM.apiUrlInput.value = 'http://localhost:5000/api';
  });

  DOM.btnSetProdApi.addEventListener('click', () => {
    DOM.apiUrlInput.value = 'https://aplicativos-api.vercel.app/api';
  });

  DOM.btnSaveConfigApi.addEventListener('click', () => {
    const newUrl = DOM.apiUrlInput.value.trim();
    if (!newUrl) {
      API.setBaseUrl(null);
      showToast('Configuração', 'Restaurado para a URL padrão automática.', 'info');
    } else {
      API.setBaseUrl(newUrl);
      showToast('Configuração', `URL da API atualizada para: ${newUrl}`, 'success');
    }
    closeConfigApiModal();
    loadApplications();
  });

  // Fechar modais ao clicar no backdrop ou pressionar ESC
  [
    DOM.appModalBackdrop,
    DOM.deleteModalBackdrop,
    DOM.configApiModalBackdrop,
  ].forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAppModal();
      closeDeleteModal();
      closeConfigApiModal();
    }
  });

  // =========================================================================
  // INICIALIZAÇÃO
  // =========================================================================
  loadApplications();
});
