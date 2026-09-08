import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { counselorService } from '../services/counselorService';
import { toast } from 'sonner';
import { CounselingSession, CounselorRecommendation } from '../types';

export function useCounselorStats() {
  return useQuery({
    queryKey: ['counselor', 'stats'],
    queryFn: counselorService.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCounselorStudents() {
  return useQuery({
    queryKey: ['counselor', 'students'],
    queryFn: counselorService.getStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCounselorStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['counselor', 'students', id],
    queryFn: () => counselorService.getStudentById(id || ''),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCounselorSessions() {
  return useQuery({
    queryKey: ['counselor', 'sessions'],
    queryFn: counselorService.getSessions,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: Omit<CounselingSession, 'id'>) => counselorService.createSession(session),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'students', newSession.studentId] });
      toast.success(`Counseling session scheduled successfully for ${newSession.studentName}!`);
    },
    onError: () => {
      toast.error('Failed to schedule counseling session.');
    }
  });
}

export function useUpdateCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CounselingSession> }) =>
      counselorService.updateSession(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'students', updated.studentId] });
      toast.success(`Session for ${updated.studentName} updated successfully.`);
    },
    onError: () => {
      toast.error('Failed to update counseling session details.');
    }
  });
}

export function useCancelCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counselorService.cancelSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'stats'] });
      toast.success('Session cancelled.');
    },
    onError: () => {
      toast.error('Failed to cancel session.');
    }
  });
}

export function useCounselorRecommendations() {
  return useQuery({
    queryKey: ['counselor', 'recommendations'],
    queryFn: counselorService.getRecommendations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CounselorRecommendation> }) =>
      counselorService.updateRecommendation(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'recommendations'] });
      toast.success(`Recommendations updated for ${updated.studentName}`);
    },
    onError: () => {
      toast.error('Failed to update counselor recommendations.');
    }
  });
}

export function useCounselorFollowups() {
  return useQuery({
    queryKey: ['counselor', 'followups'],
    queryFn: counselorService.getFollowups,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFollowupStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counselorService.toggleFollowupStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['counselor', 'stats'] });
      toast.success(`Followup marked as ${updated.status}.`);
    },
    onError: () => {
      toast.error('Failed to update followup item status.');
    }
  });
}

export function useCounselorNotifications() {
  return useQuery({
    queryKey: ['counselor', 'notifications'],
    queryFn: counselorService.getNotifications,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useMarkCounselorNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counselorService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor', 'notifications'] });
    }
  });
}

export function useGenerateCounselorReport() {
  return useMutation({
    mutationFn: (type: 'student' | 'monthly' | 'department' | 'risk_improvement') =>
      counselorService.generateReport(type),
    onSuccess: (result) => {
      toast.success('Report compiled successfully!', {
        description: `Your custom counselor sheet ${result.downloadName} is ready.`,
      });
    },
    onError: () => {
      toast.error('Failed to compile counseling report.');
    }
  });
}
