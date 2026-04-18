import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  q: '',
  departmentId: null,
  dateBegin: '',
  dateEnd: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.q = action.payload;
    },
    setDepartmentFilter: (state, action) => {
      state.departmentId = action.payload;
    },
    setDateBeginFilter: (state, action) => {
      state.dateBegin = action.payload;
    },
    setDateEndFilter: (state, action) => {
      state.dateEnd = action.payload;
    },
    setAllFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => {
      return initialState;
    },
  },
});

export const {
  setSearchQuery,
  setDepartmentFilter,
  setDateBeginFilter,
  setDateEndFilter,
  setAllFilters,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
