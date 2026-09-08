import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService, CounselingSession } from '../services/studentService';
import { toast } from 'sonner';

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: studentService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStudentAttendance() {
  return useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: studentService.getAttendance,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentAcademics() {
  return useQuery({
    queryKey: ['student', 'academics'],
    queryFn: studentService.getAcademics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentAssignments() {
  return useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: studentService.getAssignments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStudentRiskAnalysis() {
  return useQuery({
    queryKey: ['student', 'risk'],
    queryFn: studentService.getRiskAnalysis,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentRecommendations() {
  return useQuery({
    queryKey: ['student', 'recommendations'],
    queryFn: studentService.getRecommendations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentCounseling() {
  return useQuery({
    queryKey: ['student', 'counseling-sessions'],
    queryFn: studentService.getCounselingSessions,
    staleTime: 3 * 60 * 1000,
  });
}

export function useBookCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: Omit<CounselingSession, 'id' | 'status'>) => studentService.bookSession(session),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'counseling-sessions'] });
      toast.success('Counseling Slot Secured', {
        description: `Your appointment with ${newSession.counselorName} on ${newSession.date} at ${newSession.time} is booked!`,
      });
    },
    onError: (err: any) => {
      toast.error('Booking Refused', {
        description: err.message || 'The selected counseling slot could not be secured.',
      });
    },
  });
}

export function useStudentNotifications() {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: studentService.getNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
      toast.success('All notifications marked as read.');
    },
  });
}
