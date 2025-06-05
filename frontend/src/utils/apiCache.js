// Sistema de cache simples para melhorar performance
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 segundos
  }

  // Gerar chave de cache baseada na URL e parâmetros
  generateKey(url, params = {}) {
    const paramString = new URLSearchParams(params).toString();
    return `${url}${paramString ? '?' + paramString : ''}`;
  }

  // Verificar se o cache é válido
  isValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  // Obter dados do cache
  get(key) {
    const cached = this.cache.get(key);
    if (cached && this.isValid(cached.timestamp)) {
      return cached.data;
    }
    // Remover cache expirado
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  // Definir dados no cache
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Limpar cache específico
  clear(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Fazer fetch com cache
  async fetchWithCache(url, params = {}) {
    const key = this.generateKey(url, params);
    const cached = this.get(key);
    
    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}${queryString ? '?' + queryString : ''}`;
    
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.set(key, data);
      return data;
    } catch (error) {
      console.error('Erro ao fazer fetch:', error);
      throw error;
    }
  }
}

// Instância singleton
const apiCache = new ApiCache();

export default apiCache; 