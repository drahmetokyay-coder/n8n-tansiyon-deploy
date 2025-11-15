import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface JobState {
  jobs: any[];
  myJobs: any[];
  currentJob: any | null;
  candidates: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: JobState = {
  jobs: [],
  myJobs: [],
  currentJob: null,
  candidates: [],
  isLoading: false,
  error: null,
  hasMore: true,
};

export const fetchJobs = createAsyncThunk(
  'job/fetchJobs',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.getJobs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch jobs');
    }
  }
);

export const fetchMyJobs = createAsyncThunk(
  'job/fetchMyJobs',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.getMyJobs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch jobs');
    }
  }
);

export const createJob = createAsyncThunk(
  'job/createJob',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.createJob(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create job');
    }
  }
);

export const swipeJob = createAsyncThunk(
  'job/swipeJob',
  async ({ jobId, direction }: { jobId: string; direction: string }, { rejectWithValue }) => {
    try {
      const response = await api.swipeJob(jobId, direction);
      return { jobId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to swipe');
    }
  }
);

export const fetchCandidates = createAsyncThunk(
  'job/fetchCandidates',
  async ({ jobId, params }: { jobId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await api.getCandidates(jobId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch candidates');
    }
  }
);

export const swipeCandidate = createAsyncThunk(
  'job/swipeCandidate',
  async (
    { candidateId, jobId, direction }: { candidateId: string; jobId: string; direction: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.swipeCandidate(candidateId, jobId, direction);
      return { candidateId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to swipe');
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.jobs = [];
      state.hasMore = true;
    },
    removeJob: (state, action) => {
      state.jobs = state.jobs.filter((job) => job._id !== action.payload);
    },
    removeCandidate: (state, action) => {
      state.candidates = state.candidates.filter((candidate) => candidate._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Jobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.jobs = action.payload.jobs;
      state.hasMore = action.payload.pagination.page < action.payload.pagination.pages;
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch My Jobs
    builder.addCase(fetchMyJobs.fulfilled, (state, action) => {
      state.myJobs = action.payload.jobs;
    });

    // Create Job
    builder.addCase(createJob.fulfilled, (state, action) => {
      state.myJobs.unshift(action.payload.job);
    });

    // Swipe Job
    builder.addCase(swipeJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter((job) => job._id !== action.payload.jobId);
    });

    // Fetch Candidates
    builder.addCase(fetchCandidates.fulfilled, (state, action) => {
      state.candidates = action.payload.candidates;
    });

    // Swipe Candidate
    builder.addCase(swipeCandidate.fulfilled, (state, action) => {
      state.candidates = state.candidates.filter(
        (candidate) => candidate._id !== action.payload.candidateId
      );
    });
  },
});

export const { clearJobs, removeJob, removeCandidate } = jobSlice.actions;
export default jobSlice.reducer;
