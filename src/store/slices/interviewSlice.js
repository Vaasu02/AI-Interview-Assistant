import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentInterview: null,
  questions: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isTimerActive: false,
  interviewStatus: 'not_started', // not_started, in_progress, paused, completed
  chatHistory: [],
};

const interviewSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    startInterview: (state, action) => {
      state.currentInterview = action.payload.candidateId;
      state.questions = action.payload.questions;
      state.currentQuestionIndex = 0;
      state.interviewStatus = 'in_progress';
      state.chatHistory = [];
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload.index;
      state.timeRemaining = action.payload.timeLimit;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    submitAnswer: (state, action) => {
      const { answer, timeUsed, score } = action.payload;
      // Update the current question with the answer
      if (state.questions[state.currentQuestionIndex]) {
        state.questions[state.currentQuestionIndex].answer = answer;
        state.questions[state.currentQuestionIndex].timeUsed = timeUsed;
        state.questions[state.currentQuestionIndex].score = score;
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    setTimer: (state, action) => {
      state.timeRemaining = action.payload;
    },
    startTimer: (state) => {
      state.isTimerActive = true;
    },
    stopTimer: (state) => {
      state.isTimerActive = false;
    },
    pauseInterview: (state) => {
      state.interviewStatus = 'paused';
      state.isTimerActive = false;
    },
    resumeInterview: (state) => {
      state.interviewStatus = 'in_progress';
    },
    completeInterview: (state) => {
      state.interviewStatus = 'completed';
      state.isTimerActive = false;
    },
    resetInterview: (state) => {
      return initialState;
    },
  },
});

export const {
  startInterview,
  setCurrentQuestion,
  addChatMessage,
  submitAnswer,
  nextQuestion,
  setTimer,
  startTimer,
  stopTimer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
