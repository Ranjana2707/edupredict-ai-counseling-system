import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsFilters } from '../types';

export function useExecutiveStats(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'executive', filters],
    queryFn: () => analyticsService.getExecutiveStats(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'attendance', filters],
    queryFn: () => analyticsService.getAttendanceAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'academic', filters],
    queryFn: () => analyticsService.getAcademicAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRiskAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'risk', filters],
    queryFn: () => analyticsService.getRiskAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCounselingAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'counseling', filters],
    queryFn: () => analyticsService.getCounselingAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePredictionAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'prediction', filters],
    queryFn: () => analyticsService.getPredictionAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useComparativeAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'comparative', filters],
    queryFn: () => analyticsService.getComparativeAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSmartInsights(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'insights', filters],
    queryFn: () => analyticsService.getSmartInsights(filters),
    staleTime: 5 * 60 * 1000,
  });
}
