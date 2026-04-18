import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDepartments } from '../../api/metMuseumApi';

// Async thunk for fetching departments
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDepartments();
      return data.departments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default departmentsSlice.reducer;
