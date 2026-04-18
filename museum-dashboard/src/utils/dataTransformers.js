/**
 * Utility functions for transforming and validating API data
 */

/**
 * Transform raw artwork data to a consistent format
 * Handles missing data and provides fallbacks
 * @param {Object} artwork - Raw artwork object from API
 * @returns {Object} - Transformed artwork object
 */
export const transformArtwork = (artwork) => {
  if (!artwork) return null;
  
  return {
    objectID: artwork.objectID,
    title: artwork.title || 'Untitled',
    artistDisplayName: artwork.artistDisplayName || 'Unknown Artist',
    objectDate: artwork.objectDate || 'Date Unknown',
    primaryImageSmall: artwork.primaryImageSmall || '',
    primaryImage: artwork.primaryImage || '',
    department: artwork.department || 'Unknown Department',
    objectBeginDate: artwork.objectBeginDate || null,
    objectEndDate: artwork.objectEndDate || null,
    medium: artwork.medium || 'Not specified',
    dimensions: artwork.dimensions || 'Not specified',
    creditLine: artwork.creditLine || 'Not specified',
    accessionNumber: artwork.accessionNumber || 'Not available',
    tags: artwork.tags || [],
    isPublicDomain: artwork.isPublicDomain || false,
    objectURL: artwork.objectURL || '',
    culture: artwork.culture || '',
    period: artwork.period || '',
    dynasty: artwork.dynasty || '',
    reign: artwork.reign || '',
    portfolio: artwork.portfolio || '',
    artistRole: artwork.artistRole || '',
    artistPrefix: artwork.artistPrefix || '',
    artistDisplayBio: artwork.artistDisplayBio || '',
    artistSuffix: artwork.artistSuffix || '',
    artistAlphaSort: artwork.artistAlphaSort || '',
    artistNationality: artwork.artistNationality || '',
    artistBeginDate: artwork.artistBeginDate || '',
    artistEndDate: artwork.artistEndDate || '',
    objectName: artwork.objectName || '',
    classification: artwork.classification || '',
    metadataDate: artwork.metadataDate || '',
    repository: artwork.repository || '',
    objectWikidata_URL: artwork.objectWikidata_URL || '',
    isTimelineWork: artwork.isTimelineWork || false,
    GalleryNumber: artwork.GalleryNumber || '',
  };
};

/**
 * Check if artwork has a valid image
 * @param {Object} artwork - Artwork object
 * @returns {boolean} - True if artwork has a valid image
 */
export const hasValidImage = (artwork) => {
  return !!(artwork?.primaryImageSmall || artwork?.primaryImage);
};

/**
 * Parse date string to handle BCE/CE dates
 * @param {string} dateStr - Date string (e.g., "500 BCE", "1500 CE", "1500")
 * @returns {number|null} - Numeric year (negative for BCE) or null
 */
export const parseDateString = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const str = dateStr.trim().toUpperCase();
  
  // Check for BCE
  if (str.includes('BCE') || str.includes('BC')) {
    const match = str.match(/(-?\d+)/);
    return match ? -Math.abs(parseInt(match[1], 10)) : null;
  }
  
  // Check for CE or just a number
  const match = str.match(/(-?\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Format date for display (converts negative years to BCE)
 * @param {number} year - Year (negative for BCE)
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (year) => {
  if (year === null || year === undefined) return '';
  
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  
  return `${year} CE`;
};

/**
 * Validate date range
 * @param {number} dateBegin - Start date
 * @param {number} dateEnd - End date
 * @returns {boolean} - True if valid range
 */
export const isValidDateRange = (dateBegin, dateEnd) => {
  if (dateBegin === null || dateBegin === undefined || dateBegin === '') return true;
  if (dateEnd === null || dateEnd === undefined || dateEnd === '') return true;
  
  return Number(dateBegin) <= Number(dateEnd);
};

/**
 * Filter artworks that have images
 * @param {Object[]} artworks - Array of artwork objects
 * @returns {Object[]} - Filtered array with only artworks that have images
 */
export const filterArtworksWithImages = (artworks) => {
  return artworks.filter(hasValidImage);
};

/**
 * Get placeholder image URL
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = () => {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Build query params object from URL search params
 * @param {URLSearchParams} searchParams - URL search params
 * @returns {Object} - Query params object
 */
export const buildQueryParamsFromURL = (searchParams) => {
  const params = {};
  
  const q = searchParams.get('q');
  if (q) params.q = q;
  
  const departmentId = searchParams.get('departmentId');
  if (departmentId) params.departmentId = parseInt(departmentId, 10);
  
  const dateBegin = searchParams.get('dateBegin');
  if (dateBegin) params.dateBegin = parseInt(dateBegin, 10);
  
  const dateEnd = searchParams.get('dateEnd');
  if (dateEnd) params.dateEnd = parseInt(dateEnd, 10);
  
  return params;
};

/**
 * Build URL search params from query params object
 * @param {Object} params - Query params object
 * @returns {URLSearchParams} - URL search params
 */
export const buildURLFromQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.departmentId) searchParams.set('departmentId', params.departmentId.toString());
  if (params.dateBegin !== undefined && params.dateBegin !== null && params.dateBegin !== '') {
    searchParams.set('dateBegin', params.dateBegin.toString());
  }
  if (params.dateEnd !== undefined && params.dateEnd !== null && params.dateEnd !== '') {
    searchParams.set('dateEnd', params.dateEnd.toString());
  }
  
  return searchParams;
};
