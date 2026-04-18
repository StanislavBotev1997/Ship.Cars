import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchObjects, getObjectById } from '../../api/metMuseumApi';
import { transformArtwork } from '../../utils/dataTransformers';
import { cache } from '../../utils/cache';

const BATCH_SIZE = 12; // Fetch 12 items in parallel per batch
const MAX_INITIAL_ITEMS = 12; // Load 12 items initially (1 batch for speed)
const LOAD_MORE_SIZE = 12; // Load 12 more items per "Load More" click
const BATCH_DELAY = 150; // Delay between batches in ms

/**
 * Delay helper
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Async thunk for searching and streaming artworks progressively
export const searchAndFetchArtworks = createAsyncThunk(
  'artworks/searchAndFetch',
  async (searchParams, { dispatch, rejectWithValue }) => {
    try {
      // Step 1: Check cache for search results
      const cacheKey = cache.getSearchKey(searchParams);
      const cachedSearch = cache.get(cacheKey);
      
      let searchResult;
      if (cachedSearch) {
        searchResult = cachedSearch;
      } else {
        // Search for object IDs
        searchResult = await searchObjects(searchParams);
        
        // Cache search results
        cache.set(cacheKey, searchResult);
      }
      
      if (!searchResult.objectIDs || searchResult.objectIDs.length === 0) {
        return {
          total: 0,
          objectIDs: [],
        };
      }
      
      // Step 2: Limit to first items for initial load
      const limitedIds = searchResult.objectIDs.slice(0, MAX_INITIAL_ITEMS);
      
      // Step 3: Fetch in batches with parallel requests for progressive rendering
      for (let i = 0; i < limitedIds.length; i += BATCH_SIZE) {
        const batch = limitedIds.slice(i, i + BATCH_SIZE);
        
        // Fetch all items in this batch in parallel
        const artworkPromises = batch.map(id => 
          getObjectById(id).catch(error => {
            console.warn(`Failed to fetch object ${id}:`, error);
            return null;
          })
        );
        
        const artworks = await Promise.all(artworkPromises);
        
        // Transform and filter out nulls
        const transformedArtworks = artworks
          .map(transformArtwork)
          .filter(artwork => artwork !== null);
        
        // Dispatch each artwork immediately for progressive rendering
        transformedArtworks.forEach(artwork => {
          dispatch(addArtwork(artwork));
        });
        
        // Add small delay between batches to avoid overwhelming the API
        if (i + BATCH_SIZE < limitedIds.length) {
          await delay(BATCH_DELAY);
        }
      }
      
      return {
        total: searchResult.total,
        objectIDs: searchResult.objectIDs,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading more artworks (pagination with streaming)
export const loadMoreArtworks = createAsyncThunk(
  'artworks/loadMore',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().artworks;
      const { objectIDs, fetchedCount } = state;
      
      // Use fetchedCount instead of artworks.length to track position
      const startIndex = fetchedCount;
      const endIndex = startIndex + LOAD_MORE_SIZE;
      const nextBatch = objectIDs.slice(startIndex, endIndex);
      
      if (nextBatch.length === 0) {
        return { completed: true, fetchedCount: 0 };
      }
      
      // Fetch in batches with parallel requests for progressive rendering
      for (let i = 0; i < nextBatch.length; i += BATCH_SIZE) {
        const batch = nextBatch.slice(i, i + BATCH_SIZE);
        
        // Fetch all items in this batch in parallel
        const artworkPromises = batch.map(id => 
          getObjectById(id).catch(error => {
            console.warn(`Failed to fetch object ${id}:`, error);
            return null;
          })
        );
        
        const artworks = await Promise.all(artworkPromises);
        
        const transformedArtworks = artworks
          .map(transformArtwork)
          .filter(artwork => artwork !== null);
        
        transformedArtworks.forEach(artwork => {
          dispatch(addArtwork(artwork));
        });
        
        // Add small delay between batches
        if (i + BATCH_SIZE < nextBatch.length) {
          await delay(BATCH_DELAY);
        }
      }
      
      return { completed: true, fetchedCount: nextBatch.length };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  artworks: [],
  objectIDs: [],
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: false,
  fetchedCount: 0, // Track how many IDs we've attempted to fetch (not just successful loads)
};

const artworksSlice = createSlice({
  name: 'artworks',
  initialState,
  reducers: {
    clearArtworks: (state) => {
      state.artworks = [];
      state.objectIDs = [];
      state.total = 0;
      state.hasMore = false;
      state.fetchedCount = 0;
    },
    addArtwork: (state, action) => {
      // Add artwork progressively (avoid duplicates)
      const exists = state.artworks.some(art => art.objectID === action.payload.objectID);
      if (!exists) {
        state.artworks.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Search and fetch artworks (streaming)
      .addCase(searchAndFetchArtworks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.artworks = []; // Clear previous results
      })
      .addCase(searchAndFetchArtworks.fulfilled, (state, action) => {
        state.loading = false;
        state.objectIDs = action.payload.objectIDs;
        state.total = action.payload.total;
        state.fetchedCount = Math.min(MAX_INITIAL_ITEMS, action.payload.objectIDs.length);
        state.hasMore = state.fetchedCount < action.payload.objectIDs.length;
      })
      .addCase(searchAndFetchArtworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load more artworks (streaming)
      .addCase(loadMoreArtworks.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(loadMoreArtworks.fulfilled, (state, action) => {
        state.loadingMore = false;
        // Increment fetchedCount by the number of IDs we attempted (not just successful loads)
        if (action.payload.fetchedCount) {
          state.fetchedCount += action.payload.fetchedCount;
        }
        state.hasMore = state.fetchedCount < state.objectIDs.length;
      })
      .addCase(loadMoreArtworks.rejected, (state, action) => {
        state.loadingMore = false;
        // Don't overwrite the main error, just log it
        console.error('Load more failed:', action.payload);
      });
  },
});

export const { clearArtworks, addArtwork } = artworksSlice.actions;

export default artworksSlice.reducer;
