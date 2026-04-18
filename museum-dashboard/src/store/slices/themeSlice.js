import { createSlice } from '@reduxjs/toolkit';

// Helper function to get system preference
const getSystemPreference = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Helper function to get initial theme
const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  // Fall back to system preference
  return getSystemPreference();
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
    },
    setTheme: (state, action) => {
      if (action.payload === 'light' || action.payload === 'dark') {
        state.mode = action.payload;
        localStorage.setItem('theme', state.mode);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

// Selectors
export const selectTheme = (state) => state.theme.mode;
export const selectIsDarkMode = (state) => state.theme.mode === 'dark';

export default themeSlice.reducer;
