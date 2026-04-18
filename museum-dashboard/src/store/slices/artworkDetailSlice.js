import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getObjectById, searchRelatedObjects, getMultipleObjects } from '../../api/metMuseumApi';
import { transformArtwork } from '../../utils/dataTransformers';

// Async thunk for fetching artwork detail
export const fetchArtworkDetail = createAsyncThunk(
  'artworkDetail/fetch',
  async (objectId, { rejectWithValue }) => {
    try {
      const artwork = await getObjectById(objectId);
      return transformArtwork(artwork);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching related artworks
export const fetchRelatedArtworks = createAsyncThunk(
  'artworkDetail/fetchRelated',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { artwork } = getState().artworkDetail;
      
      if (!artwork) {
        return [];
      }
      
      // Search for related objects
      const relatedIds = await searchRelatedObjects({
        departmentId: artwork.department ? null : null, // We'll use department from the artwork
        objectBeginDate: artwork.objectBeginDate,
        objectEndDate: artwork.objectEndDate,
        currentObjectId: artwork.objectID,
      });
      
      if (relatedIds.length === 0) {
        return [];
      }
      
      // Fetch details for related objects (limit to 6)
      const relatedArtworks = await getMultipleObjects(relatedIds, 6);
      
      // Transform artworks
      const transformedArtworks = relatedArtworks
        .map(transformArtwork)
        .filter(artwork => artwork !== null);
      
      return transformedArtworks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  artwork: null,
  relatedArtworks: [],
  loading: false,
  loadingRelated: false,
  error: null,
  relatedError: null,
  relatedAttempted: false, // Track if we've tried to fetch related artworks
};

const artworkDetailSlice = createSlice({
  name: 'artworkDetail',
  initialState,
  reducers: {
    clearArtworkDetail: (state) => {
      state.artwork = null;
      state.relatedArtworks = [];
      state.error = null;
      state.relatedError = null;
      state.relatedAttempted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch artwork detail
      .addCase(fetchArtworkDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtworkDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.artwork = action.payload;
      })
      .addCase(fetchArtworkDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch related artworks
      .addCase(fetchRelatedArtworks.pending, (state) => {
        state.loadingRelated = true;
        state.relatedError = null;
        state.relatedAttempted = true;
      })
      .addCase(fetchRelatedArtworks.fulfilled, (state, action) => {
        state.loadingRelated = false;
        state.relatedArtworks = action.payload;
      })
      .addCase(fetchRelatedArtworks.rejected, (state, action) => {
        state.loadingRelated = false;
        state.relatedError = action.payload;
        // Don't retry - we've attempted once
      });
  },
});

export const { clearArtworkDetail } = artworkDetailSlice.actions;

export default artworkDetailSlice.reducer;
