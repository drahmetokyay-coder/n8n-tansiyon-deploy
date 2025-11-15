// Shared TypeScript types for JobSwipe

export enum UserType {
  JOB_SEEKER = 'job_seeker',
  EMPLOYER = 'employer'
}

export enum JobType {
  PART_TIME = 'part_time',
  FREELANCE = 'freelance',
  TEMPORARY = 'temporary',
  CONTRACT = 'contract'
}

export enum SwipeDirection {
  LEFT = 'left',   // Pass
  RIGHT = 'right', // Like
  UP = 'up'        // Super like (optional)
}

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  UNMATCHED = 'unmatched'
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  country?: string;
}

export interface User {
  _id: string;
  email: string;
  userType: UserType;
  profile: JobSeekerProfile | EmployerProfile;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  fcmToken?: string; // For push notifications
}

export interface JobSeekerProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  bio?: string;
  skills: string[];
  experience: string; // e.g., "2 years", "Entry level"
  availability: {
    days: string[]; // ["Monday", "Tuesday", ...]
    hours: string; // e.g., "9:00-17:00"
  };
  hourlyRate?: {
    min: number;
    max: number;
    currency: string;
  };
  education?: string;
  languages?: string[];
  resume?: string; // URL to resume file
}

export interface EmployerProfile {
  companyName: string;
  contactName: string;
  phone?: string;
  logo?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  verified: boolean;
}

export interface JobPost {
  _id: string;
  employerId: string;
  title: string;
  description: string;
  jobType: JobType;
  location: Location;
  requirements: {
    skills: string[];
    experience?: string;
    education?: string;
  };
  schedule: {
    days: string[];
    hours: string;
    hoursPerWeek?: number;
  };
  compensation: {
    amount: number;
    currency: string;
    period: 'hour' | 'day' | 'week' | 'month' | 'project';
  };
  benefits?: string[];
  startDate?: Date;
  duration?: string; // e.g., "3 months", "Ongoing"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  swipeCount: number;
  matchCount: number;
}

export interface Swipe {
  _id: string;
  userId: string;
  targetId: string; // Job post ID or user ID
  direction: SwipeDirection;
  createdAt: Date;
}

export interface Match {
  _id: string;
  jobSeekerId: string;
  employerId: string;
  jobPostId: string;
  status: MatchStatus;
  createdAt: Date;
  lastMessageAt?: Date;
}

export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'match' | 'message' | 'profile_view' | 'system';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SwipeRequest {
  targetId: string;
  direction: SwipeDirection;
}

export interface GetJobsQuery {
  page?: number;
  limit?: number;
  maxDistance?: number;
  skills?: string[];
  jobType?: JobType;
}

export interface GetMatchesQuery {
  page?: number;
  limit?: number;
  status?: MatchStatus;
}
