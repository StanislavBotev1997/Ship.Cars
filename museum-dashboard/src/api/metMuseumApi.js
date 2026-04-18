/**
 * Metropolitan Museum of Art Collection API Service
 * API Documentation: https://collectionapi.metmuseum.org/public/collection/v1/
 */

import { cache } from '../utils/cache';

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

/**
 * Delay helper
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Search for object IDs based on query parameters with retry logic
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query
 * @param {number} params.departmentId - Department ID
 * @param {number} params.dateBegin - Start date (can be negative for BCE)
 * @param {number} params.dateEnd - End date (can be negative for BCE)
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} - Object containing total count and objectIDs array
 */
export const searchObjects = async (params = {}, retryCount = 0) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add query parameter (required by API, use empty string if not provided)
    queryParams.append('q', params.q || '');
    
    // NOTE: hasImages parameter causes CORS 403 Forbidden error in browser
    // The Met Museum API blocks this parameter from browser requests
    // We filter images client-side in transformArtwork instead
    // queryParams.append('hasImages', 'true');
    
    // Add optional filters
    if (params.departmentId) {
      queryParams.append('departmentId', params.departmentId);
    }
    
    if (params.dateBegin !== undefined && params.dateBegin !== null && params.dateBegin !== '') {
      queryParams.append('dateBegin', params.dateBegin);
    }
    
    if (params.dateEnd !== undefined && params.dateEnd !== null && params.dateEnd !== '') {
      queryParams.append('dateEnd', params.dateEnd);
    }
    
    const response = await fetch(`${BASE_URL}/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Retry logic for rate limit errors
    const isRateLimitError = 
      error.message.includes('403') || 
      error.message.includes('Failed to fetch');
    
    if (isRateLimitError && retryCount < MAX_RETRIES) {
      const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`Retrying search in ${backoffDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      await delay(backoffDelay);
      return searchObjects(params, retryCount + 1);
    }
    
    console.error('Error searching objects:', error);
    throw error;
  }
};

/**
 * Fetch object details by ID with caching and retry logic
 * @param {number} objectId - The object ID
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} - Object details
 */
export const getObjectById = async (objectId, useCache = true, retryCount = 0) => {
  try {
    // Check cache first
    if (useCache) {
      const cacheKey = cache.getArtworkKey(objectId);
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
    }
    
    // Fetch from API
    const response = await fetch(`${BASE_URL}/objects/${objectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch object ${objectId}: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    if (useCache) {
      const cacheKey = cache.getArtworkKey(objectId);
      cache.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    // Retry logic for rate limit errors
    const isRateLimitError = 
      error.message.includes('403') || 
      error.message.includes('Failed to fetch');
    
    if (isRateLimitError && retryCount < MAX_RETRIES) {
      const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`Retrying object ${objectId} in ${backoffDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      await delay(backoffDelay);
      return getObjectById(objectId, useCache, retryCount + 1);
    }
    
    console.error(`Error fetching object ${objectId}:`, error);
    throw error;
  }
};

/**
 * Fetch multiple objects with parallel batching and error handling
 * @param {number[]} objectIds - Array of object IDs
 * @param {number} limit - Maximum number of objects to fetch
 * @param {number} batchSize - Number of objects to fetch in parallel per batch
 * @param {number} batchDelay - Delay between batches in ms
 * @returns {Promise<Object[]>} - Array of object details (excluding failed fetches)
 */
export const getMultipleObjects = async (objectIds, limit = 20, batchSize = 12, batchDelay = 100) => {
  try {
    const idsToFetch = objectIds.slice(0, limit);
    const results = [];
    
    // Process in batches with parallel requests within each batch
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize);
      
      // Fetch all items in this batch in parallel
      const promises = batch.map(id => 
        getObjectById(id).catch(error => {
          console.warn(`Failed to fetch object ${id}:`, error);
          return null; // Return null for failed fetches
        })
      );
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter(obj => obj !== null));
      
      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < idsToFetch.length) {
        await delay(batchDelay);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching multiple objects:', error);
    throw error;
  }
};

/**
 * Get all departments
 * @returns {Promise<Object>} - Object containing departments array
 */
export const getDepartments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/departments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Search for related objects based on department and date range
 * @param {Object} params - Search parameters
 * @param {number} params.departmentId - Department ID
 * @param {number} params.objectBeginDate - Object begin date
 * @param {number} params.objectEndDate - Object end date
 * @param {number} params.currentObjectId - Current object ID to exclude
 * @returns {Promise<number[]>} - Array of related object IDs
 */
export const searchRelatedObjects = async ({ departmentId, objectBeginDate, objectEndDate, currentObjectId }) => {
  try {
    // Calculate date range (±50 years)
    const dateBegin = (objectBeginDate || 0) - 50;
    const dateEnd = (objectEndDate || objectBeginDate || 0) + 50;
    
    const params = {
      q: '', // Empty query to get all objects
      departmentId,
      dateBegin,
      dateEnd
    };
    
    const result = await searchObjects(params);
    
    // Filter out the current object
    const relatedIds = (result.objectIDs || []).filter(id => id !== currentObjectId);
    
    return relatedIds;
  } catch (error) {
    console.error('Error searching related objects:', error);
    return [];
  }
};
