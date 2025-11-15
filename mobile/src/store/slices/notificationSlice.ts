import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetch',
  async (params: any = {}) => {
    const response = await api.getNotifications(params);
    return response;
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string) => {
    await api.markNotificationAsRead(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    });
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
