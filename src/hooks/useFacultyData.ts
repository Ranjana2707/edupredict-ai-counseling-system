import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/facultyService';
import { toast } from 'sonner';
import { FacultyAssignment } from '../types';

export function useFacultyProfile() {
  return useQuery({
    queryKey: ['faculty', 'profile'],
    queryFn: facultyService.getProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacultyStats() {
  return useQuery({
    queryKey: ['faculty', 'stats'],
    queryFn: facultyService.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacultySubjects() {
  return useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn: facultyService.getSubjects,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacultyStudents() {
  return useQuery({
    queryKey: ['faculty', 'students'],
    queryFn: facultyService.getStudents,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, subjectCode, attendanceValue }: { studentId: string; subjectCode: string; attendanceValue: number }) =>
      facultyService.updateStudentAttendance(studentId, subjectCode, attendanceValue),
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty', 'stats'] });
      toast.success(`Attendance updated for ${updatedStudent.name}`);
    },
    onError: () => {
      toast.error('Failed to update student attendance.');
    }
  });
}

export function useBulkUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectCode, records }: { subjectCode: string; records: { studentId: string; present: boolean }[] }) =>
      facultyService.bulkUpdateAttendance(subjectCode, records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty', 'stats'] });
      toast.success('Bulk attendance record updated successfully');
    },
    onError: () => {
      toast.error('Failed to apply bulk attendance updates.');
    }
  });
}

export function useUpdateStudentMarks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, subjectCode, internalMarks }: { studentId: string; subjectCode: string; internalMarks: number }) =>
      facultyService.updateStudentMarks(studentId, subjectCode, internalMarks),
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty', 'stats'] });
      toast.success(`Internal marks updated for ${updatedStudent.name}`);
    },
    onError: () => {
      toast.error('Failed to update student marks.');
    }
  });
}

export function useFacultyAssignments() {
  return useQuery({
    queryKey: ['faculty', 'assignments'],
    queryFn: facultyService.getAssignments,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignment: Omit<FacultyAssignment, 'id' | 'totalSubmissions' | 'pendingSubmissions'>) =>
      facultyService.createAssignment(assignment),
    onSuccess: (newAssignment) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'assignments'] });
      toast.success(`Assignment "${newAssignment.title}" created successfully`);
    },
    onError: () => {
      toast.error('Failed to create assignment.');
    }
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FacultyAssignment> }) =>
      facultyService.updateAssignment(id, updates),
    onSuccess: (updatedAssignment) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'assignments'] });
      toast.success(`Assignment "${updatedAssignment.title}" updated`);
    },
    onError: () => {
      toast.error('Failed to update assignment.');
    }
  });
}

export function useFacultyNotifications() {
  return useQuery({
    queryKey: ['faculty', 'notifications'],
    queryFn: facultyService.getNotifications,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useMarkFacultyNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'notifications'] });
    }
  });
}

export function useImportCSV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => facultyService.importCSV(file),
    onSuccess: (result) => {
      if (result.successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['faculty', 'students'] });
        queryClient.invalidateQueries({ queryKey: ['faculty', 'stats'] });
        toast.success(`Successfully imported ${result.successCount} student profiles!`);
      } else if (result.errors.length > 0) {
        toast.error('CSV import failed', { description: result.errors[0] });
      }
    },
    onError: () => {
      toast.error('Failed to process CSV file import.');
    }
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (type: 'student' | 'attendance' | 'marks' | 'risk') => facultyService.generateReport(type),
    onSuccess: (result) => {
      toast.success('Report compiled successfully!', {
        description: `Your ${result.downloadName} is compiled and ready to download.`,
      });
    },
    onError: () => {
      toast.error('Failed to compile report.');
    }
  });
}
