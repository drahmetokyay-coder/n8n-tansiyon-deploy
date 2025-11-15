import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobReducer from './slices/jobSlice';
import matchReducer from './slices/matchSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    job: jobReducer,
    match: matchReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
