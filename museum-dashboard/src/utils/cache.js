/**
 * Cache Utility for Artwork Data
 * Stores and retrieves artwork data from localStorage with expiration
 */

const CACHE_PREFIX = 'met_museum_';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Cache manager for artwork data
 */
class CacheManager {
  /**
   * Get cached data by key
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/not found
   */
  get(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - timestamp > CACHE_EXPIRATION) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache set error:', error);
      // If localStorage is full, clear old cache entries
      if (error.name === 'QuotaExceededError') {
        this.clearExpired();
      }
    }
  }

  /**
   * Remove cached data by key
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }

  /**
   * Clear all expired cache entries
   */
  clearExpired() {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            const { timestamp } = JSON.parse(cached);
            
            if (now - timestamp > CACHE_EXPIRATION) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Invalid cache entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache clearExpired error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      console.warn('Cache clearAll error');
    }
  }

  /**
   * Get cache key for artwork object
   * @param {number} objectId - Object ID
   * @returns {string} - Cache key
   */
  getArtworkKey(objectId) {
    return `artwork_${objectId}`;
  }

  /**
   * Get cache key for search results
   * @param {Object} params - Search parameters
   * @returns {string} - Cache key
   */
  getSearchKey(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `search_${sortedParams}`;
  }
}

// Create singleton instance
export const cache = new CacheManager();

export default CacheManager;
