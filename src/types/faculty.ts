import { RiskLevel } from './index';

export interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  avatarUrl?: string;
  designation: string;
  subjectsTaught: string[];
}

export interface FacultyStats {
  totalStudents: number;
  highRiskStudents: number;
  mediumRiskStudents: number;
  lowRiskStudents: number;
  averageAttendance: number;
  averageCgpa: number;
}

export interface FacultyStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: string;
  cgpa: number;
  attendance: number;
  riskLevel: RiskLevel;
  predictionConfidence: number;
  riskDrivers: string[];
  riskTimeline: { date: string; score: number }[];
  predictionHistory: {
    id: string;
    date: string;
    riskLevel: RiskLevel;
    confidence: number;
    status: 'pending' | 'resolved' | 'counseling_referred';
    recommendations: string[];
  }[];
  subjectMarks: {
    subjectCode: string;
    subjectName: string;
    internalMarks: number;
    totalInternal: number;
    examMarks?: number;
    totalExam?: number;
  }[];
}

export interface FacultySubject {
  code: string;
  name: string;
  department: string;
  semester: string;
  totalStudents: number;
}

export interface FacultyAssignment {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string;
  totalSubmissions: number;
  pendingSubmissions: number;
  averageScore?: number;
  status: 'active' | 'closed' | 'graded';
}

export interface FacultyNotification {
  id: string;
  title: string;
  message: string;
  type: 'risk' | 'attendance' | 'assignment' | 'counseling' | 'system';
  timestamp: string;
  isRead: boolean;
  studentId?: string;
}
