import { configureStore } from '@reduxjs/toolkit';
import artworksReducer from './slices/artworksSlice';
import artworkDetailReducer from './slices/artworkDetailSlice';
import filtersReducer from './slices/filtersSlice';
import departmentsReducer from './slices/departmentsSlice';

export const store = configureStore({
  reducer: {
    artworks: artworksReducer,
    artworkDetail: artworkDetailReducer,
    filters: filtersReducer,
    departments: departmentsReducer,
  },
});

export default store;
