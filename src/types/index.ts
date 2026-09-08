export type UserRole = 'student' | 'faculty' | 'counselor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskProfile {
  predictedScore: number; // out of 100
  probability: RiskLevel;
  mainDriver: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  cgpa: number;
  attendance: number; // percentage (e.g. 78)
  creditsEarned: number;
  creditsTarget: number;
  riskProfile: RiskProfile;
}

export interface CounselingLog {
  id: string;
  studentId: string;
  counselorId: string;
  counselorName: string;
  counselorAvatarUrl?: string;
  title: string;
  notes: string;
  date: string; // ISO date string or human readable
}

export interface SystemStat {
  health: 'optimal' | 'warning' | 'critical';
  uptime: string;
  lastSync: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

export * from './faculty';
export * from './counselor';
export * from './admin';
export * from './prediction';
export * from './analytics';

