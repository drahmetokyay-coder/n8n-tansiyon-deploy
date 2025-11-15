import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface MatchState {
  matches: any[];
  currentMatch: any | null;
  messages: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matches: [],
  currentMatch: null,
  messages: [],
  isLoading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.getMatches(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch matches');
    }
  }
);

export const fetchMatchMessages = createAsyncThunk(
  'match/fetchMessages',
  async (matchId: string, { rejectWithValue }) => {
    try {
      const response = await api.getMatchMessages(matchId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'match/sendMessage',
  async ({ matchId, content }: { matchId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.sendMessage(matchId, content);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentMatch: (state, action) => {
      state.currentMatch = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Matches
    builder.addCase(fetchMatches.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMatches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.matches = action.payload.matches;
    });
    builder.addCase(fetchMatches.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Messages
    builder.addCase(fetchMatchMessages.fulfilled, (state, action) => {
      state.messages = action.payload.messages;
    });

    // Send Message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload.data);
    });
  },
});

export const { addMessage, setCurrentMatch, clearMessages } = matchSlice.actions;
export default matchSlice.reducer;
