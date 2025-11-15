export declare enum UserType {
    JOB_SEEKER = "job_seeker",
    EMPLOYER = "employer"
}
export declare enum JobType {
    PART_TIME = "part_time",
    FREELANCE = "freelance",
    TEMPORARY = "temporary",
    CONTRACT = "contract"
}
export declare enum SwipeDirection {
    LEFT = "left",
    RIGHT = "right",
    UP = "up"
}
export declare enum MatchStatus {
    PENDING = "pending",
    MATCHED = "matched",
    UNMATCHED = "unmatched"
}
export interface Location {
    type: 'Point';
    coordinates: [number, number];
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
    fcmToken?: string;
}
export interface JobSeekerProfile {
    firstName: string;
    lastName: string;
    phone?: string;
    photo?: string;
    bio?: string;
    skills: string[];
    experience: string;
    availability: {
        days: string[];
        hours: string;
    };
    hourlyRate?: {
        min: number;
        max: number;
        currency: string;
    };
    education?: string;
    languages?: string[];
    resume?: string;
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
    duration?: string;
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
    targetId: string;
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
//# sourceMappingURL=index.d.ts.map