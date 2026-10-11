/**
 * Centralização da comunicação com o Backend da API REST.
 * Suporta ambientes local e produção (Vercel) com detecção inteligente e override.
 */
const API = (() => {
  // Configuração de endpoints padrão
  const LOCAL_API_URL = 'http://localhost:5000/api';
  const PRODUCTION_API_URL = 'https://aplicativos-api.vercel.app/api';

  /**
   * Determina a URL base ativa.
   * Permite que o usuário ou ambiente customize através de localStorage ou window.__API_URL__
   */
  function getBaseUrl() {
    const customUrl = localStorage.getItem('APPNOVA_API_URL') || window.__API_URL__;
    if (customUrl) {
      return customUrl.replace(/\/+$/, '');
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:';

    return isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL;
  }

  function setBaseUrl(newUrl) {
    if (newUrl) {
      localStorage.setItem('APPNOVA_API_URL', newUrl.trim());
    } else {
      localStorage.removeItem('APPNOVA_API_URL');
    }
  }

  /**
   * Helper genérico para requisições com timeout e tratamento unificado de erros
   */
  async function request(endpoint, options = {}) {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMessage =
          (data && data.message) ||
          `Erro HTTP ${response.status}: ${response.statusText || 'Falha na requisição'}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(
          `Falha de conexão com a API (${baseUrl}). Verifique se o servidor está ativo e com CORS configurado.`
        );
      }
      throw err;
    }
  }

  return {
    getBaseUrl,
    setBaseUrl,

    /**
     * Verifica o status da API (Health Check)
     */
    async checkHealth() {
      return request('/health', { method: 'GET' });
    },

    /**
     * Lista aplicativos com filtros opcionais de busca e categoria
     * @param {Object} params - { busca: string, categoria: string }
     */
    async listarAplicativos({ busca = '', categoria = '' } = {}) {
      const queryParams = new URLSearchParams();
      if (busca && busca.trim()) {
        queryParams.append('busca', busca.trim());
      }
      if (categoria && categoria.trim() && categoria.toLowerCase() !== 'todas') {
        queryParams.append('categoria', categoria.trim());
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/aplicativos?${queryString}` : '/aplicativos';
      return request(endpoint, { method: 'GET' });
    },

    /**
     * Busca um aplicativo por ID
     */
    async obterAplicativo(id) {
      if (!id) throw new Error('ID do aplicativo é obrigatório.');
      return request(`/aplicativos/${encodeURIComponent(id)}`, { method: 'GET' });
    },

    /**
     * Cadastra um novo aplicativo
     */
    async criarAplicativo(dados) {
      return request('/aplicativos', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
    },

    /**
     * Atualiza um aplicativo existente por ID
     */
    async atualizarAplicativo(id, dados) {
      if (!id) throw new Error('ID do aplicativo é obrigatório.');
      return request(`/aplicativos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      });
    },

    /**
     * Exclui um aplicativo por ID
     */
    async excluirAplicativo(id) {
      if (!id) throw new Error('ID do aplicativo é obrigatório.');
      return request(`/aplicativos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };
})();

// Exportação global
window.API = API;
