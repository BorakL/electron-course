import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice.ts'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// ✅ Create types for RootState and Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
