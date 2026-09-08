export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'counselor' | 'admin';
  avatarUrl?: string;
  department?: string;
  status: 'active' | 'inactive';
  isLocked: boolean;
  passwordResetRequired: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'academic' | 'counseling' | 'system' | 'reports';
}

export interface RolePermissions {
  role: 'student' | 'faculty' | 'counselor' | 'admin';
  permissions: string[]; // List of permission IDs
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string; // Head of Department name
  studentCount: number;
  staffCount: number;
  budget: string;
  riskPercentage: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'login' | 'activity' | 'audit' | 'security' | 'prediction';
  message: string;
  user: string;
  severity: 'info' | 'warning' | 'critical';
  details?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'role' | 'individual';
  targetRole?: string;
  targetUserId?: string;
  targetEmail?: string;
  channel: 'email' | 'system' | 'push' | 'all';
  status: 'sent' | 'pending';
  timestamp: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCounselors: number;
  totalDepartments: number;
  activeUsersCount: number;
  totalPredictionsCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  predictionAccuracy: number;
  storageUsageGb: number;
  databaseStatus: 'healthy' | 'degraded' | 'maintenance';
  serverUptime: string;
  serverStatus: 'online' | 'offline' | 'degraded';
}

export interface SystemSettingsConfig {
  general: {
    appName: string;
    timezone: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    senderAddress: string;
    enableSsl: boolean;
  };
  security: {
    minPasswordLength: number;
    requireSpecialChar: boolean;
    requireNumbers: boolean;
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
    jwtExpiryHours: number;
    mfaRequired: boolean;
  };
  application: {
    predictionIntervalHours: number;
    autoArchiveInactiveStudents: boolean;
    retentionTargetPercentage: number;
  };
}
