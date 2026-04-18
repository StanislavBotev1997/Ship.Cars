/**
 * Metropolitan Museum of Art Collection API Service
 * API Documentation: https://collectionapi.metmuseum.org/public/collection/v1/
 */

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

/**
 * Search for object IDs based on query parameters
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query
 * @param {number} params.departmentId - Department ID
 * @param {number} params.dateBegin - Start date (can be negative for BCE)
 * @param {number} params.dateEnd - End date (can be negative for BCE)
 * @returns {Promise<Object>} - Object containing total count and objectIDs array
 */
export const searchObjects = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add query parameter (required by API, use empty string if not provided)
    queryParams.append('q', params.q || '');
    
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
    console.error('Error searching objects:', error);
    throw error;
  }
};

/**
 * Fetch object details by ID
 * @param {number} objectId - The object ID
 * @returns {Promise<Object>} - Object details
 */
export const getObjectById = async (objectId) => {
  try {
    const response = await fetch(`${BASE_URL}/objects/${objectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch object ${objectId}: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching object ${objectId}:`, error);
    throw error;
  }
};

/**
 * Fetch multiple objects in parallel with error handling
 * @param {number[]} objectIds - Array of object IDs
 * @param {number} limit - Maximum number of objects to fetch
 * @returns {Promise<Object[]>} - Array of object details (excluding failed fetches)
 */
export const getMultipleObjects = async (objectIds, limit = 20) => {
  try {
    const idsToFetch = objectIds.slice(0, limit);
    
    const promises = idsToFetch.map(id => 
      getObjectById(id).catch(error => {
        console.warn(`Failed to fetch object ${id}:`, error);
        return null; // Return null for failed fetches
      })
    );
    
    const results = await Promise.all(promises);
    
    // Filter out null values (failed fetches)
    return results.filter(obj => obj !== null);
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
