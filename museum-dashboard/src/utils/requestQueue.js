/**
 * Request Queue Utility
 * Manages API requests with throttling, retry logic, and rate limiting
 */

class RequestQueue {
  constructor(options = {}) {
    this.delayBetweenBatches = options.delayBetweenBatches || 300; // ms between batches
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // Initial retry delay
    this.queue = [];
    this.processing = false;
  }

  /**
   * Add a request to the queue
   * @param {Function} requestFn - Function that returns a Promise
   * @returns {Promise} - Resolves with the request result
   */
  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject, retries: 0 });
      this.processQueue();
    });
  }

  /**
   * Process the queue sequentially with delays
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        const result = await this.executeWithRetry(item);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Add delay between requests to avoid rate limiting
      if (this.queue.length > 0) {
        await this.delay(this.delayBetweenBatches);
      }
    }

    this.processing = false;
  }

  /**
   * Execute a request with exponential backoff retry logic
   */
  async executeWithRetry(item) {
    try {
      return await item.requestFn();
    } catch (error) {
      // Check if it's a rate limit error (403 or network error)
      const isRateLimitError = 
        error.message.includes('403') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Forbidden');

      if (isRateLimitError && item.retries < this.maxRetries) {
        item.retries++;
        const backoffDelay = this.retryDelay * Math.pow(2, item.retries - 1);
        
        console.warn(`Rate limit hit, retrying in ${backoffDelay}ms (attempt ${item.retries}/${this.maxRetries})`);
        
        await this.delay(backoffDelay);
        return this.executeWithRetry(item);
      }

      throw error;
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Get queue length
   */
  get length() {
    return this.queue.length;
  }
}

// Create a singleton instance for the Met Museum API
export const metMuseumQueue = new RequestQueue({
  delayBetweenBatches: 200, // 200ms between batch requests
  maxRetries: 3,
  retryDelay: 1000, // Start with 1s, then 2s, then 4s
});

export default RequestQueue;
