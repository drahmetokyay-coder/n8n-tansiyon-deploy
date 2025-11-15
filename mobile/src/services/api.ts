import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          // Optionally: Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/auth/profile', data);
    return response.data;
  }

  // Job endpoints
  async getJobs(params?: any) {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getMyJobs(params?: any) {
    const response = await this.api.get('/jobs/my-jobs', { params });
    return response.data;
  }

  async getJobById(jobId: string) {
    const response = await this.api.get(`/jobs/${jobId}`);
    return response.data;
  }

  async createJob(data: any) {
    const response = await this.api.post('/jobs', data);
    return response.data;
  }

  async updateJob(jobId: string, data: any) {
    const response = await this.api.put(`/jobs/${jobId}`, data);
    return response.data;
  }

  async deleteJob(jobId: string) {
    const response = await this.api.delete(`/jobs/${jobId}`);
    return response.data;
  }

  async getCandidates(jobId: string, params?: any) {
    const response = await this.api.get(`/jobs/${jobId}/candidates`, { params });
    return response.data;
  }

  // Swipe endpoints
  async swipeJob(jobId: string, direction: string) {
    const response = await this.api.post('/swipes/job', { jobId, direction });
    return response.data;
  }

  async swipeCandidate(candidateId: string, jobId: string, direction: string) {
    const response = await this.api.post('/swipes/candidate', {
      candidateId,
      jobId,
      direction,
    });
    return response.data;
  }

  async getSwipeHistory(params?: any) {
    const response = await this.api.get('/swipes/history', { params });
    return response.data;
  }

  // Match endpoints
  async getMatches(params?: any) {
    const response = await this.api.get('/matches', { params });
    return response.data;
  }

  async getMatchById(matchId: string) {
    const response = await this.api.get(`/matches/${matchId}`);
    return response.data;
  }

  async unmatch(matchId: string) {
    const response = await this.api.delete(`/matches/${matchId}`);
    return response.data;
  }

  async getMatchMessages(matchId: string, params?: any) {
    const response = await this.api.get(`/matches/${matchId}/messages`, { params });
    return response.data;
  }

  async sendMessage(matchId: string, content: string) {
    const response = await this.api.post(`/matches/${matchId}/messages`, { content });
    return response.data;
  }

  // Notification endpoints
  async getNotifications(params?: any) {
    const response = await this.api.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }
}

export default new ApiService();
