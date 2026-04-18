import { configureStore } from '@reduxjs/toolkit';
import artworksReducer from './slices/artworksSlice';
import artworkDetailReducer from './slices/artworkDetailSlice';
import filtersReducer from './slices/filtersSlice';
import departmentsReducer from './slices/departmentsSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    artworks: artworksReducer,
    artworkDetail: artworkDetailReducer,
    filters: filtersReducer,
    departments: departmentsReducer,
    theme: themeReducer,
  },
});

export default store;
