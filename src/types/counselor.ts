import { RiskLevel } from './index';

export interface CounselingSession {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  type: 'academic' | 'psychological' | 'financial' | 'attendance' | 'general';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string;
  outcome?: string;
  studentFeedback?: string;
  followUpReminder?: string;
  followUpDate?: string;
  followUpPriority?: 'high' | 'medium' | 'low';
}

export interface CounselorRecommendation {
  id: string;
  studentId: string;
  studentName: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  academicSupport: string;
  psychologicalSupport: string;
  financialSupport: string;
  attendanceImprovementPlan: string;
  personalizedSuggestions: string[];
}

export interface FollowUpItem {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  dueDate: string; // YYYY-MM-DD
  description: string;
  status: 'pending' | 'completed';
  nextAction: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CounselorNotification {
  id: string;
  title: string;
  message: string;
  type: 'high_risk' | 'session_reminder' | 'assigned' | 'faculty_msg' | 'announcement';
  timestamp: string; // ISO String
  isRead: boolean;
}

export interface CounselorStudentDetails {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department: string;
  semester: string;
  cgpa: number;
  attendance: number; // percentage
  riskLevel: RiskLevel;
  predictionScore: number; // out of 100
  predictionConfidence: number; // percentage
  predictionTimeline: { date: string; score: number }[];
  
  // 360 Degree specific profiles
  phone?: string;
  dob?: string;
  guardianName?: string;
  guardianPhone?: string;
  
  academicHistory: { semester: string; gpa: number }[];
  attendanceHistory: { subject: string; percentage: number; classesAttended: number; classesTotal: number }[];
  assignmentStatus: { title: string; dueDate: string; status: 'submitted' | 'overdue' | 'pending'; grade?: string }[];
  counselingHistory: { date: string; counselorName: string; type: string; notes: string; outcome: string }[];
  facultyRemarks: { facultyName: string; date: string; remark: string }[];
  financialStatus: 'clear' | 'pending_installment' | 'overdue_fees';
  scholarshipDetails: string;
  engagementMetrics: { lmsActivityHours: number; libraryCheckins: number; forumContributions: number };
}

export interface CounselorDashboardStats {
  totalAssigned: number;
  highRiskCount: number;
  mediumRiskCount: number;
  sessionsTodayCount: number;
  upcomingSessionsCount: number;
  pendingFollowupsCount: number;
}
