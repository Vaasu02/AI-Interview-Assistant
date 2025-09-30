import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  candidates: [],
  currentCandidate: null,
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      // Create a new array with the new candidate
      return {
        ...state,
        candidates: [...(state.candidates || []), action.payload]
      };
    },
    updateCandidate: (state, action) => {
      const candidates = state.candidates || [];
      const index = candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        return {
          ...state,
          candidates: candidates.map((candidate, i) => 
            i === index ? { ...candidate, ...action.payload } : candidate
          )
        };
      }
      return state;
    },
    setCurrentCandidate: (state, action) => {
      return {
        ...state,
        currentCandidate: action.payload
      };
    },
    updateCandidateScore: (state, action) => {
      const { candidateId, score, summary } = action.payload;
      const candidates = state.candidates || [];
      return {
        ...state,
        candidates: candidates.map(candidate => 
          candidate.id === candidateId 
            ? { 
                ...candidate, 
                finalScore: score, 
                summary: summary, 
                status: 'completed' 
              }
            : candidate
        )
      };
    },
  },
});

export const { 
  addCandidate, 
  updateCandidate, 
  setCurrentCandidate, 
  updateCandidateScore 
} = candidateSlice.actions;

export default candidateSlice.reducer;
