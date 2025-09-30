import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'interviewee',
  showWelcomeBackModal: false,
  hasShownWelcomeBack: false, // Flag to prevent repeated showing
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setShowWelcomeBackModal: (state, action) => {
      state.showWelcomeBackModal = action.payload;
      if (action.payload) {
        state.hasShownWelcomeBack = true;
      }
    },
    resetWelcomeBackFlag: (state) => {
      state.hasShownWelcomeBack = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setActiveTab,
  setShowWelcomeBackModal,
  resetWelcomeBackFlag,
  setLoading,
  setError,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;
