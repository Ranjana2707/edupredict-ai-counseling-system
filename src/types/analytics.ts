export interface AnalyticsFilters {
  department: string;
  semester: string;
  dateRange: string;
  riskLevel: string;
  attendanceRange: [number, number];
  cgpaRange: [number, number];
  searchQuery: string;
}

export interface ExecutiveStats {
  totalStudents: number;
  totalPredictions: number;
  highRiskStudents: number;
  mediumRiskStudents: number;
  lowRiskStudents: number;
  activeCounselingSessions: number;
  overallRetentionRate: number;
  predictionAccuracy: number;
  monthlyGrowth: number; // e.g. 1.2%
}

export interface AttendanceAnalytics {
  monthlyTrend: { month: string; attendance: number }[];
  subjectAttendance: { subject: string; attendance: number }[];
  deptComparison: { department: string; attendance: number }[];
  semesterComparison: { semester: string; attendance: number }[];
  attendanceHeatmap: { day: string; [week: string]: string | number }[];
  attendanceDistribution: { range: string; count: number }[];
}

export interface AcademicAnalytics {
  cgpaDistribution: { range: string; count: number }[];
  semesterPerformance: { semester: string; averageCgpa: number }[];
  departmentPerformance: { department: string; averageCgpa: number }[];
  marksAnalysis: { subject: string; classAverage: number; passingRate: number }[];
  topPerformers: { name: string; cgpa: number; department: string }[];
  studentsNeedingSupport: { name: string; cgpa: number; attendance: number; reason: string }[];
}

export interface DropoutRiskAnalytics {
  riskDistribution: { level: string; count: number; percentage: number }[];
  deptRisk: { department: string; high: number; medium: number; low: number }[];
  semesterRisk: { semester: string; high: number; medium: number; low: number }[];
  genderRisk: { gender: string; high: number; medium: number; low: number }[];
  trendAnalysis: { date: string; riskScore: number }[];
  riskHeatmap: { factor: string; riskWeight: number; impactLevel: 'high' | 'medium' | 'low' }[];
}

export interface CounselingAnalytics {
  sessionsConducted: number;
  sessionsCompleted: number;
  followUpSuccess: number; // percentage
  counselingEffectiveness: { category: string; before: number; after: number }[];
  monthlyTrends: { month: string; sessions: number }[];
}

export interface PredictionAnalytics {
  predictionHistory: { date: string; count: number }[];
  dailyPredictions: number;
  weeklyPredictions: number;
  monthlyPredictions: number;
  modelAccuracyTrend: { date: string; accuracy: number; validation: number }[];
  confidenceDistribution: { range: string; count: number }[];
}

export interface ComparativeAnalytics {
  deptVsDept: { department: string; cgpa: number; attendance: number; riskIndex: number }[];
  semVsSem: { semester: string; cgpa: number; attendance: number; riskIndex: number }[];
  attendanceVsCgpa: { attendance: number; cgpa: number; name: string; risk: string }[];
  cgpaVsRisk: { cgpa: number; riskScore: number; name: string }[];
  attendanceVsRisk: { attendance: number; riskScore: number; name: string }[];
  counselingVsImprovement: { sessions: number; academicGain: number; attendanceGain: number }[];
}

export interface SmartInsight {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  text: string;
  trend?: 'up' | 'down' | 'neutral';
  impact?: string;
}
