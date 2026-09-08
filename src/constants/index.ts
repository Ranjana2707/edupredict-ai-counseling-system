import { NavigationItem, UserRole } from '../types';

export const APP_NAME = 'EduPredict AI';

export const ROLES = {
  STUDENT: 'student' as UserRole,
  FACULTY: 'faculty' as UserRole,
  COUNSELOR: 'counselor' as UserRole,
  ADMIN: 'admin' as UserRole,
};

export const LOCAL_STORAGE_KEYS = {
  THEME: 'edupredict_theme',
  TOKEN: 'edupredict_token',
  USER: 'edupredict_user',
  CLAY_UI: 'edupredict_clay_ui',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
  },
  STUDENTS: {
    LIST: '/api/students',
    PROFILE: (id: string) => `/api/students/${id}`,
    RISK_ANALYSIS: (id: string) => `/api/students/${id}/risk-analysis`,
  },
  COUNSELING: {
    LOGS: '/api/counseling/logs',
    CREATE_LOG: '/api/counseling/logs',
    SESSIONS: '/api/counseling/sessions',
  },
  SYSTEM: {
    STATS: '/api/system/stats',
    ACTIVITIES: '/api/system/activities',
  },
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'Attendance Tracking',
    path: '/student/attendance',
    icon: 'Calendar',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Academic Performance',
    path: '/student/academic',
    icon: 'GraduationCap',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Assignments & Tasks',
    path: '/student/assignments',
    icon: 'FileText',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Advisory Standing',
    path: '/student/risk',
    icon: 'TrendingDown',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'AI Recommendations',
    path: '/student/recommendations',
    icon: 'Sparkles',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Counseling Portal',
    path: '/student/counseling',
    icon: 'Compass',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Student Profile',
    path: '/student/profile',
    icon: 'User',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Alert & Notifications',
    path: '/student/notifications',
    icon: 'Bell',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'Student Records',
    path: '/students',
    icon: 'Users',
    roles: [ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'Risk Analytics',
    path: '/risk-analytics',
    icon: 'TrendingDown',
    roles: [ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'BI Analytics',
    path: '/analytics',
    icon: 'LayoutDashboard',
    roles: [ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'Counseling Logs',
    path: '/counseling-logs',
    icon: 'FileText',
    roles: [ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'Academic Support',
    path: '/support',
    icon: 'GraduationCap',
    roles: [ROLES.STUDENT],
  },
  {
    label: 'AI Hub (Gemini)',
    path: '/ai-hub',
    icon: 'Sparkles',
    roles: [ROLES.STUDENT, ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN],
  },
  {
    label: 'System Settings',
    path: '/settings',
    icon: 'Settings',
    roles: [ROLES.ADMIN],
  },
];
