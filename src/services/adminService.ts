import { api } from './api';
import {
  AdminUser,
  Department,
  SystemLog,
  AdminNotification,
  AdminDashboardStats,
  SystemSettingsConfig,
  RolePermissions,
  Permission
} from '../types';

// Storage Keys
const KEYS = {
  USERS: 'edupredict_admin_users',
  DEPARTMENTS: 'edupredict_admin_departments',
  ROLE_PERMISSIONS: 'edupredict_admin_role_permissions',
  LOGS: 'edupredict_admin_logs',
  NOTIFICATIONS: 'edupredict_admin_notifications',
  SETTINGS: 'edupredict_admin_settings'
};

// Initial static data to populate database if empty
const INITIAL_USERS: AdminUser[] = [
  {
    id: 'USR-2026-001',
    name: 'Dr. Sunita Sharma',
    email: 'sunita.sharma@university.edu.in',
    role: 'counselor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Computer Science & Eng',
    status: 'active',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: '2025-01-15T09:00:00Z',
    lastLogin: '2026-07-12T02:10:00Z'
  },
  {
    id: 'USR-2026-002',
    name: 'Prof. Richard Feynman',
    email: 'richard.feynman@university.edu',
    role: 'faculty',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Physics & EE',
    status: 'active',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: '2025-02-10T10:30:00Z',
    lastLogin: '2026-07-11T16:45:00Z'
  },
  {
    id: 'USR-2026-003',
    name: 'Admin Supervisor',
    email: 'admin@university.edu',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    department: 'Central Administration',
    status: 'active',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: '2024-09-01T08:00:00Z',
    lastLogin: '2026-07-12T02:25:00Z'
  },
  {
    id: 'ST-2026-BTECH-101',
    name: 'Priyanka Nair',
    email: 'priyanka.nair@university.edu.in',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Computer Science & Eng',
    status: 'active',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: '2025-09-01T08:00:00Z',
    lastLogin: '2026-07-11T14:30:00Z'
  },
  {
    id: 'ST-2026-BTECH-115',
    name: 'Neha Sen',
    email: 'neha.sen@university.edu.in',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
    department: 'Computer Science & Eng',
    status: 'active',
    isLocked: false,
    passwordResetRequired: true,
    createdAt: '2025-09-01T08:00:00Z',
    lastLogin: '2026-07-10T11:15:00Z'
  },
  {
    id: 'ST-2026-BTECH-104',
    name: 'Aisha Patel',
    email: 'aisha.patel@university.edu.in',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Central Administration',
    status: 'active',
    isLocked: true,
    passwordResetRequired: false,
    createdAt: '2025-09-01T08:00:00Z',
    lastLogin: '2026-07-08T09:20:00Z'
  },
  {
    id: 'USR-2026-004',
    name: 'Dr. Anand Venkatraman',
    email: 'anand.venkatraman@university.edu.in',
    role: 'counselor',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    department: 'Psychology & Wellness',
    status: 'inactive',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: '2025-03-20T11:00:00Z',
    lastLogin: '2026-06-30T15:00:00Z'
  }
];

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'DEP-001',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    hod: 'Dr. Alan Turing',
    studentCount: 24,
    staffCount: 8,
    budget: '$180,000',
    riskPercentage: 21.5
  },
  {
    id: 'DEP-002',
    name: 'Electrical & Physics Eng',
    code: 'EEPE',
    hod: 'Dr. Nikola Tesla',
    studentCount: 18,
    staffCount: 6,
    budget: '$150,000',
    riskPercentage: 11.1
  },
  {
    id: 'DEP-003',
    name: 'Mechanical Engineering',
    code: 'MECH',
    hod: 'Dr. James Watt',
    studentCount: 8,
    staffCount: 4,
    budget: '$95,000',
    riskPercentage: 25.0
  },
  {
    id: 'DEP-004',
    name: 'Business Administration',
    code: 'BBA',
    hod: 'Dr. Peter Drucker',
    studentCount: 6,
    staffCount: 3,
    budget: '$110,000',
    riskPercentage: 16.6
  }
];

export const STATIC_PERMISSIONS: Permission[] = [
  { id: 'view_directory', name: 'View Student Directory', description: 'Permission to access academic roster registries.', category: 'users' },
  { id: 'edit_student_data', name: 'Modify Student Profile', description: 'Update biometric, contact, and enrollment data.', category: 'users' },
  { id: 'view_analytics', name: 'View Risk Analytics', description: 'Access predictive drop-out score telemetry and charts.', category: 'academic' },
  { id: 'manage_grades', name: 'Submit Academic Grades', description: 'Log marks, attendance indices, and exam results.', category: 'academic' },
  { id: 'schedule_sessions', name: 'Schedule Counseling', description: 'Book active clinical dialogue logs on workspace calendar.', category: 'counseling' },
  { id: 'edit_support_plans', name: 'Edit Support Plans', description: 'Formulate intervention paths and clinical recommendations.', category: 'counseling' },
  { id: 'configure_systems', name: 'Configure System Settings', description: 'Modify SMTP servers, JWT keys, and model parameters.', category: 'system' },
  { id: 'access_audit_logs', name: 'Access Audit Logs', description: 'Inspect central security trail, login attempts, and model outputs.', category: 'system' },
  { id: 'generate_reports', name: 'Export Official Audits', description: 'Compile, export, and save Excel/PDF analytics sheets.', category: 'reports' }
];

const INITIAL_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: STATIC_PERMISSIONS.map(p => p.id)
  },
  {
    role: 'counselor',
    permissions: ['view_directory', 'view_analytics', 'schedule_sessions', 'edit_support_plans', 'generate_reports']
  },
  {
    role: 'faculty',
    permissions: ['view_directory', 'view_analytics', 'manage_grades', 'generate_reports']
  },
  {
    role: 'student',
    permissions: ['view_directory']
  }
];

const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-07-12T02:25:10Z',
    type: 'login',
    message: 'User Admin Supervisor successfully authenticated from IP 192.168.1.55',
    user: 'admin@university.edu',
    severity: 'info'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-07-12T02:20:45Z',
    type: 'activity',
    message: 'Counselor Dr. Sunita Sharma scheduled dynamic check-in with Priyanka Nair',
    user: 'sunita.sharma@university.edu.in',
    severity: 'info'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-07-12T02:18:12Z',
    type: 'prediction',
    message: 'FastAPI ML Core executed. Student Neha Sen score increased to 92% (High Risk)',
    user: 'SYSTEM_ML_WORKER',
    severity: 'warning',
    details: 'Model: XGBoost-v2; Accuracy: 94.8%; Main Driver: Consecutive Absenteeism > 30%'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-07-12T01:50:00Z',
    type: 'security',
    message: 'Failed login attempt detected for user charlie.brown@university.edu (MFA Expired)',
    user: 'charlie.brown@university.edu',
    severity: 'warning'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-07-12T00:30:15Z',
    type: 'audit',
    message: 'SMTP Email Configuration successfully updated by Admin',
    user: 'admin@university.edu',
    severity: 'info'
  },
  {
    id: 'LOG-006',
    timestamp: '2026-07-11T23:12:00Z',
    type: 'security',
    message: 'User account Aisha Patel (ST-2026-104) locked automatically after 5 failed password attempts.',
    user: 'aisha.patel@university.edu',
    severity: 'critical',
    details: 'Triggered by PasswordPolicy.maxFailedAttempts; Lock duration set to 30 mins.'
  }
];

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'NTF-001',
    title: 'Midterm Counseling Campaign Active',
    message: 'Attention Counselors: Please prioritize scheduling check-ins for students with risk coefficients > 70% before July 20th.',
    type: 'broadcast',
    channel: 'system',
    status: 'sent',
    timestamp: '2026-07-11T12:00:00Z'
  },
  {
    id: 'NTF-002',
    title: 'Urgent: Complete Marks Entry',
    message: 'All Faculty: Final deadline for entering CS-304 homework grades is July 15th.',
    type: 'role',
    targetRole: 'faculty',
    channel: 'email',
    status: 'sent',
    timestamp: '2026-07-10T14:30:00Z'
  }
];

const INITIAL_SETTINGS: SystemSettingsConfig = {
  general: {
    appName: 'EduPredict AI Platform',
    timezone: 'UTC -07:00 (Pacific Time)',
    defaultLanguage: 'en',
    maintenanceMode: false
  },
  email: {
    smtpServer: 'smtp.university.edu',
    smtpPort: 587,
    smtpUser: 'edupredict-alerts@university.edu',
    senderAddress: 'noreply.edupredict@university.edu',
    enableSsl: true
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChar: true,
    requireNumbers: true,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 30,
    jwtExpiryHours: 24,
    mfaRequired: false
  },
  application: {
    predictionIntervalHours: 12,
    autoArchiveInactiveStudents: true,
    retentionTargetPercentage: 92.5
  }
};

// State Helper Functions
function getStored<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveStored<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Service Implementation
export const adminService = {
  // Helpers to fetch current state
  getUsers: async (): Promise<AdminUser[]> => {
    return getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
  },

  getDepartments: async (): Promise<Department[]> => {
    return getStored<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  getRolePermissions: async (): Promise<RolePermissions[]> => {
    return getStored<RolePermissions[]>(KEYS.ROLE_PERMISSIONS, INITIAL_ROLE_PERMISSIONS);
  },

  getLogs: async (): Promise<SystemLog[]> => {
    return getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
  },

  getNotifications: async (): Promise<AdminNotification[]> => {
    return getStored<AdminNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  getSettings: async (): Promise<SystemSettingsConfig> => {
    return getStored<SystemSettingsConfig>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  // Dynamic Dashboard Stats compiling
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const deps = getStored<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);

    const counts = users.reduce(
      (acc, u) => {
        if (u.role === 'student') acc.students++;
        if (u.role === 'faculty') acc.faculty++;
        if (u.role === 'counselor') acc.counselor++;
        if (u.status === 'active') acc.active++;
        return acc;
      },
      { students: 0, faculty: 0, counselor: 0, active: 0 }
    );

    return {
      totalStudents: counts.students,
      totalFaculty: counts.faculty,
      totalCounselors: counts.counselor,
      totalDepartments: deps.length,
      activeUsersCount: counts.active,
      totalPredictionsCount: 1420,
      highRiskCount: 5,
      mediumRiskCount: 13,
      lowRiskCount: 24,
      predictionAccuracy: 94.8,
      storageUsageGb: 32.4,
      databaseStatus: 'healthy',
      serverUptime: '24d 18h 35m',
      serverStatus: 'online'
    };
  },

  // User Management Actions
  createUser: async (user: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const newUser: AdminUser = {
      ...user,
      id: `USR-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    users.unshift(newUser);
    saveStored(KEYS.USERS, users);

    // Audit Log entry
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `Admin created new user profile: ${newUser.name} (${newUser.email}) - Role: ${newUser.role}`,
      user: 'admin@university.edu',
      severity: 'info'
    });
    saveStored(KEYS.LOGS, logs);

    return newUser;
  },

  updateUser: async (id: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    saveStored(KEYS.USERS, users);

    // Audit Log entry
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `Admin modified user profile for ${updatedUser.name} (${id})`,
      user: 'admin@university.edu',
      severity: 'info',
      details: JSON.stringify(updates)
    });
    saveStored(KEYS.LOGS, logs);

    return updatedUser;
  },

  deleteUser: async (id: string): Promise<string> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const userName = users[index].name;
    const filtered = users.filter(u => u.id !== id);
    saveStored(KEYS.USERS, filtered);

    // Audit Log entry
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `Admin permanently deleted user account: ${userName} (${id})`,
      user: 'admin@university.edu',
      severity: 'warning'
    });
    saveStored(KEYS.LOGS, logs);

    return id;
  },

  resetPassword: async (id: string): Promise<boolean> => {
    await adminService.updateUser(id, { passwordResetRequired: true });
    return true;
  },

  toggleLock: async (id: string): Promise<boolean> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const newLockState = !users[index].isLocked;
    await adminService.updateUser(id, { isLocked: newLockState });

    // Add explicit log
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'security',
      message: `Admin manually ${newLockState ? 'LOCKED' : 'UNLOCKED'} account for ${users[index].name} (${id})`,
      user: 'admin@university.edu',
      severity: newLockState ? 'warning' : 'info'
    });
    saveStored(KEYS.LOGS, logs);

    return newLockState;
  },

  toggleActivation: async (id: string): Promise<boolean> => {
    const users = getStored<AdminUser[]>(KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const newStatusState: 'active' | 'inactive' = users[index].status === 'active' ? 'inactive' : 'active';
    await adminService.updateUser(id, { status: newStatusState });
    return newStatusState === 'active';
  },

  // Role Permissions control
  updateRolePermissions: async (role: 'student' | 'faculty' | 'counselor' | 'admin', permissions: string[]): Promise<RolePermissions> => {
    const matrix = getStored<RolePermissions[]>(KEYS.ROLE_PERMISSIONS, INITIAL_ROLE_PERMISSIONS);
    const index = matrix.findIndex(m => m.role === role);
    if (index === -1) throw new Error('Role not found');

    matrix[index].permissions = permissions;
    saveStored(KEYS.ROLE_PERMISSIONS, matrix);

    // Logs
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `Access Policy Updated: Role [${role}] permissions restructured by Administrator.`,
      user: 'admin@university.edu',
      severity: 'warning',
      details: `New rights count: ${permissions.length}`
    });
    saveStored(KEYS.LOGS, logs);

    return matrix[index];
  },

  // Department Management Actions
  createDepartment: async (dep: Omit<Department, 'id'>): Promise<Department> => {
    const deps = getStored<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const newDep: Department = {
      ...dep,
      id: `DEP-00${deps.length + 1}`
    };
    deps.push(newDep);
    saveStored(KEYS.DEPARTMENTS, deps);

    // Audit logs
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `New Department Added: ${newDep.name} (${newDep.code}) overseen by HOD ${newDep.hod}`,
      user: 'admin@university.edu',
      severity: 'info'
    });
    saveStored(KEYS.LOGS, logs);

    return newDep;
  },

  updateDepartment: async (id: string, updates: Partial<Department>): Promise<Department> => {
    const deps = getStored<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const index = deps.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Department not found');

    const updated = { ...deps[index], ...updates };
    deps[index] = updated;
    saveStored(KEYS.DEPARTMENTS, deps);
    return updated;
  },

  deleteDepartment: async (id: string): Promise<string> => {
    const deps = getStored<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const filtered = deps.filter(d => d.id !== id);
    saveStored(KEYS.DEPARTMENTS, filtered);
    return id;
  },

  // Notification / Alert sending
  sendNotification: async (notif: Omit<AdminNotification, 'id' | 'status' | 'timestamp'>): Promise<AdminNotification> => {
    const notifs = getStored<AdminNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AdminNotification = {
      ...notif,
      id: `NTF-${Math.floor(100 + Math.random() * 900)}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    saveStored(KEYS.NOTIFICATIONS, notifs);

    // Log the notification broadcast
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'activity',
      message: `System Alert Broadcasted: [${newNotif.title}] sent via channel [${newNotif.channel}] targeting [${newNotif.type}]`,
      user: 'admin@university.edu',
      severity: 'info'
    });
    saveStored(KEYS.LOGS, logs);

    return newNotif;
  },

  // Save Settings
  updateSettings: async (updates: Partial<SystemSettingsConfig>): Promise<SystemSettingsConfig> => {
    const current = getStored<SystemSettingsConfig>(KEYS.SETTINGS, INITIAL_SETTINGS);
    const merged = {
      ...current,
      ...updates,
      general: { ...current.general, ...updates.general },
      email: { ...current.email, ...updates.email },
      security: { ...current.security, ...updates.security },
      application: { ...current.application, ...updates.application }
    } as SystemSettingsConfig;

    saveStored(KEYS.SETTINGS, merged);

    // Audit logs
    const logs = getStored<SystemLog[]>(KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      message: `Central System Parameters Modified by Administrator`,
      user: 'admin@university.edu',
      severity: 'warning'
    });
    saveStored(KEYS.LOGS, logs);

    return merged;
  },

  clearLogs: async (): Promise<boolean> => {
    saveStored(KEYS.LOGS, []);
    return true;
  },

  clearNotifications: async (): Promise<boolean> => {
    saveStored(KEYS.NOTIFICATIONS, []);
    return true;
  }
};
