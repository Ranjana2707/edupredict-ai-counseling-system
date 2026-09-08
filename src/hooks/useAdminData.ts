import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';
import { AdminUser, Department, AdminNotification, SystemSettingsConfig } from '../types';

// Cache keys
export const ADMIN_KEYS = {
  STATS: ['admin', 'stats'],
  USERS: ['admin', 'users'],
  DEPARTMENTS: ['admin', 'departments'],
  PERMISSIONS: ['admin', 'permissions'],
  LOGS: ['admin', 'logs'],
  NOTIFICATIONS: ['admin', 'notifications'],
  SETTINGS: ['admin', 'settings']
};

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.STATS,
    queryFn: adminService.getDashboardStats,
    staleTime: 60 * 1000 // 1 minute
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ADMIN_KEYS.USERS,
    queryFn: adminService.getUsers,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`User ${newUser.name} created successfully! ID assigned: ${newUser.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create user profile.');
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdminUser> }) =>
      adminService.updateUser(id, updates),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`Profile updated for ${updatedUser.name}!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update user.');
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`User profile deleted successfully (ID: ${id}).`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete user.');
    }
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success('Password reset triggered. User will be prompted to change password at next login.');
    },
    onError: () => {
      toast.error('Failed to trigger password reset.');
    }
  });
}

export function useToggleLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.toggleLock,
    onSuccess: (newLockState) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`Account has been successfully ${newLockState ? 'locked' : 'unlocked'}.`);
    },
    onError: () => {
      toast.error('Failed to toggle account lock state.');
    }
  });
}

export function useToggleActivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.toggleActivation,
    onSuccess: (newActivationState) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.USERS });
      toast.success(`Account status set to: ${newActivationState ? 'Active' : 'Inactive'}.`);
    },
    onError: () => {
      toast.error('Failed to toggle account status.');
    }
  });
}

export function useAdminDepartments() {
  return useQuery({
    queryKey: ADMIN_KEYS.DEPARTMENTS,
    queryFn: adminService.getDepartments,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createDepartment,
    onSuccess: (newDep) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.DEPARTMENTS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`Department ${newDep.name} (${newDep.code}) created successfully.`);
    },
    onError: () => {
      toast.error('Failed to create department.');
    }
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Department> }) =>
      adminService.updateDepartment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.DEPARTMENTS });
      toast.success('Department details updated.');
    },
    onError: () => {
      toast.error('Failed to update department.');
    }
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.DEPARTMENTS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.STATS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success('Department deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete department.');
    }
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ADMIN_KEYS.PERMISSIONS,
    queryFn: adminService.getRolePermissions,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions }: { role: 'student' | 'faculty' | 'counselor' | 'admin'; permissions: string[] }) =>
      adminService.updateRolePermissions(role, permissions),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`Access matrix updated successfully for role: ${res.role.toUpperCase()}`);
    },
    onError: () => {
      toast.error('Failed to modify access policies.');
    }
  });
}

export function useSystemLogs() {
  return useQuery({
    queryKey: ADMIN_KEYS.LOGS,
    queryFn: adminService.getLogs,
    staleTime: 15 * 1000 // 15 seconds (logs are more dynamic)
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ADMIN_KEYS.NOTIFICATIONS,
    queryFn: adminService.getNotifications,
    staleTime: 5 * 60 * 1000
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.sendNotification,
    onSuccess: (notif) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success(`Alert Broadcasted: "${notif.title}" sent through ${notif.channel.toUpperCase()} successfully.`);
    },
    onError: () => {
      toast.error('Failed to launch notification.');
    }
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ADMIN_KEYS.SETTINGS,
    queryFn: adminService.getSettings,
    staleTime: 10 * 60 * 1000
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.SETTINGS });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.LOGS });
      toast.success('Central settings configuration committed successfully.');
    },
    onError: () => {
      toast.error('Failed to update core settings.');
    }
  });
}
