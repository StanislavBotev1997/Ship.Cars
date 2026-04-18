import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchObjects, getMultipleObjects } from '../../api/metMuseumApi';
import { transformArtwork } from '../../utils/dataTransformers';

// Async thunk for searching and fetching artworks
export const searchAndFetchArtworks = createAsyncThunk(
  'artworks/searchAndFetch',
  async (searchParams, { rejectWithValue }) => {
    try {
      // Step 1: Search for object IDs
      const searchResult = await searchObjects(searchParams);
      
      if (!searchResult.objectIDs || searchResult.objectIDs.length === 0) {
        return {
          artworks: [],
          total: 0,
          objectIDs: [],
        };
      }
      
      // Step 2: Fetch details for first batch of objects
      const artworks = await getMultipleObjects(searchResult.objectIDs, 20);
      
      // Step 3: Transform artworks
      const transformedArtworks = artworks
        .map(transformArtwork)
        .filter(artwork => artwork !== null);
      
      return {
        artworks: transformedArtworks,
        total: searchResult.total,
        objectIDs: searchResult.objectIDs,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading more artworks (pagination)
export const loadMoreArtworks = createAsyncThunk(
  'artworks/loadMore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().artworks;
      const { objectIDs, artworks } = state;
      
      // Get next batch of IDs
      const startIndex = artworks.length;
      const endIndex = startIndex + 20;
      const nextBatch = objectIDs.slice(startIndex, endIndex);
      
      if (nextBatch.length === 0) {
        return [];
      }
      
      // Fetch details for next batch
      const newArtworks = await getMultipleObjects(nextBatch, 20);
      
      // Transform artworks
      const transformedArtworks = newArtworks
        .map(transformArtwork)
        .filter(artwork => artwork !== null);
      
      return transformedArtworks;
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Search and fetch artworks
      .addCase(searchAndFetchArtworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAndFetchArtworks.fulfilled, (state, action) => {
        state.loading = false;
        state.artworks = action.payload.artworks;
        state.objectIDs = action.payload.objectIDs;
        state.total = action.payload.total;
        state.hasMore = action.payload.artworks.length < action.payload.objectIDs.length;
      })
      .addCase(searchAndFetchArtworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load more artworks
      .addCase(loadMoreArtworks.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(loadMoreArtworks.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.artworks = [...state.artworks, ...action.payload];
        state.hasMore = state.artworks.length < state.objectIDs.length;
      })
      .addCase(loadMoreArtworks.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { clearArtworks } = artworksSlice.actions;

export default artworksSlice.reducer;
