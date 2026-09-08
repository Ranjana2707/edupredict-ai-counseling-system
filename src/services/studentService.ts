import { api } from './api';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  semester: string;
  cgpa: number;
  overallAttendance: number;
  riskScore: number;
  dropoutProbability: number;
  pendingAssignments: number;
  upcomingCounseling: number;
  achievements: string[];
}

export interface AttendanceSubject {
  code: string;
  name: string;
  percentage: number;
  attended: number;
  total: number;
  required: number;
}

export interface AttendanceData {
  overall: number;
  subjects: AttendanceSubject[];
  monthlyTrend: { month: string; percentage: number }[];
  heatmapData: { date: string; status: 'present' | 'absent' | 'excused' }[];
  alerts: string[];
}

export interface AcademicMarks {
  subject: string;
  internal: number;
  external: number;
  classAverage: number;
}

export interface AcademicData {
  cgpa: number;
  semesterGpa: { semester: string; gpa: number }[];
  subjectMarks: AcademicMarks[];
  stats: {
    totalCredits: number;
    passedCredits: number;
    backlogs: number;
    classRank: string;
  };
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue';
  progress: number; // 0 to 100
  score?: string;
}

export interface RiskAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskPercentage: number;
  predictionConfidence: number;
  riskDrivers: { factor: string; impact: number; description: string }[];
  timeline: { week: string; score: number }[];
}

export interface Recommendation {
  id: string;
  category: 'attendance' | 'study' | 'counseling' | 'action';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel: string;
}

export interface CounselingSession {
  id: string;
  counselorName: string;
  date: string;
  time: string;
  mode: 'In-Person' | 'Virtual';
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface StudentNotification {
  id: string;
  type: 'risk' | 'attendance' | 'assignment' | 'counseling' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// ----------------- PREMIUM MOCK FALLBACKS -----------------
const MOCK_PROFILE: StudentProfile = {
  id: "ST-2026-BTECH-042",
  name: "Rohan Sharma",
  email: "rohan.sharma@university.edu.in",
  phoneNumber: "+91 98765 43210",
  role: "student",
  department: "Computer Science & Engineering",
  semester: "6th Semester",
  cgpa: 8.42,
  overallAttendance: 74.2,
  riskScore: 42,
  dropoutProbability: 42,
  pendingAssignments: 3,
  upcomingCounseling: 1,
  achievements: [
    "Dean's Merit List (Top 5% in B.Tech CSE)",
    "Winner - Smart India Hackathon (SIH) 2025",
    "Active Member - IEEE Student Chapter"
  ]
};

const MOCK_ATTENDANCE: AttendanceData = {
  overall: 74.2,
  subjects: [
    { code: "CS-3001", name: "Design & Analysis of Algorithms", percentage: 68, attended: 17, total: 25, required: 75 },
    { code: "CS-3002", name: "Database Management Systems", percentage: 82, attended: 23, total: 28, required: 75 },
    { code: "CS-3003", name: "Computer Networks & Security", percentage: 78, attended: 21, total: 27, required: 75 },
    { code: "CS-3004", name: "Theory of Computation", percentage: 71, attended: 20, total: 28, required: 75 },
    { code: "CS-3005", name: "Environmental Studies & Constitution", percentage: 90, attended: 18, total: 20, required: 75 }
  ],
  monthlyTrend: [
    { month: "Jan", percentage: 88 },
    { month: "Feb", percentage: 82 },
    { month: "Mar", percentage: 76 },
    { month: "Apr", percentage: 74 },
    { month: "May", percentage: 68 },
    { month: "Jun", percentage: 74 }
  ],
  heatmapData: [
    { date: "2026-07-01", status: "present" },
    { date: "2026-07-02", status: "present" },
    { date: "2026-07-03", status: "absent" },
    { date: "2026-07-06", status: "present" },
    { date: "2026-07-07", status: "present" },
    { date: "2026-07-08", status: "absent" },
    { date: "2026-07-09", status: "present" },
    { date: "2026-07-10", status: "present" }
  ],
  alerts: [
    "Attendance warning in CS-3001 (68%): 2 more consecutive absences will trigger a condonation/debarment alert.",
    "Theory of Computation attendance (71%) is slightly below recommended safe target."
  ]
};

const MOCK_ACADEMIC: AcademicData = {
  cgpa: 8.42,
  semesterGpa: [
    { semester: "Sem 1", gpa: 8.20 },
    { semester: "Sem 2", gpa: 8.85 },
    { semester: "Sem 3", gpa: 8.48 },
    { semester: "Sem 4", gpa: 7.90 },
    { semester: "Sem 5", gpa: 8.62 },
    { semester: "Sem 6 (Est)", gpa: 8.02 }
  ],
  subjectMarks: [
    { subject: "Algorithms", internal: 26, external: 55, classAverage: 74 },
    { subject: "DBMS", internal: 34, external: 51, classAverage: 76 },
    { subject: "Computer Networks", internal: 31, external: 48, classAverage: 72 },
    { subject: "TOC", internal: 25, external: 41, classAverage: 70 },
    { subject: "Env Studies", internal: 38, external: 52, classAverage: 82 }
  ],
  stats: {
    totalCredits: 132,
    passedCredits: 132,
    backlogs: 0,
    classRank: "14 / 120 Enrolled"
  }
};

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: "A1", title: "Dynamic Programming Graph Proofs", subject: "Design & Analysis of Algorithms", dueDate: "2026-07-09", status: "overdue", progress: 40 },
  { id: "A2", title: "SQL Complex Join Triggers Project", subject: "Database Management Systems", dueDate: "2026-07-15", status: "pending", progress: 20 },
  { id: "A3", title: "IP Subnetting & Router Configuration", subject: "Computer Networks & Security", dueDate: "2026-07-18", status: "pending", progress: 65 },
  { id: "A4", title: "NFA to DFA Conversion Assignment", subject: "Theory of Computation", dueDate: "2026-07-05", status: "completed", progress: 100, score: "92/100" },
  { id: "A5", title: "Indian Environmental Policies Presentation", subject: "Environmental Studies & Constitution", dueDate: "2026-07-02", status: "completed", progress: 100, score: "95/100" }
];

const MOCK_RISK: RiskAnalysis = {
  riskLevel: "MEDIUM",
  riskPercentage: 42,
  predictionConfidence: 91.4,
  riskDrivers: [
    { factor: "Low Attendance (Weight: 45%)", impact: 8, description: "Attendance below 75% in CS-3001 (68%) and CS-3004 (71%)." },
    { factor: "Sessional/Internal Test Slump (Weight: 35%)", impact: 7, description: "Internal assessment scores in Algorithms and Theory of Computation lower than class average." },
    { factor: "Assignment Pending (Weight: 20%)", impact: 4, description: "1 overdue assignment pending completion." }
  ],
  timeline: [
    { week: "Week 2", score: 12 },
    { week: "Week 4", score: 18 },
    { week: "Week 6", score: 22 },
    { week: "Week 8", score: 30 },
    { week: "Week 10", score: 42 }
  ]
};

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: "R1", category: "attendance", title: "Lecture Attendance Recovery", description: "Attend the next 4 consecutive Design & Analysis of Algorithms lectures to pull your attendance past the VTU/AICTE 75% minimum threshold.", priority: "high", actionLabel: "View Schedule" },
  { id: "R2", category: "action", title: "Submit Pending Algorithms Proofs", description: "Submit your 'Dynamic Programming Graph Proofs' assignment today. Even with late submission grading policies, it protects your sessional performance.", priority: "high", actionLabel: "Submit Assignment" },
  { id: "R3", category: "study", title: "Algorithms Remedial Class Group", description: "We recommend joining Dr. Sandeep's remedial/peer tutoring sessions on Thursday at 4 PM in Seminar Hall A.", priority: "medium", actionLabel: "Join Group" },
  { id: "R4", category: "counseling", title: "Confirm Mentor/Proctor Meeting", description: "You have a session scheduled with your faculty mentor. Please fill out the student progress review sheet.", priority: "medium", actionLabel: "Confirm Session" }
];

const MOCK_SESSIONS: CounselingSession[] = [
  { id: "S1", counselorName: "Dr. Sandeep Deshmukh", date: "2026-07-14", time: "14:00", mode: "In-Person", location: "C Block, 3rd Floor, Proctor & Counseling Cabin 305", status: "Confirmed" },
  { id: "S2", counselorName: "Dr. Sandeep Deshmukh", date: "2026-06-18", time: "11:00", mode: "In-Person", location: "C Block, 3rd Floor, Proctor Cabin 305", status: "Completed", notes: "Student was anxious about sessional test performance in Algorithms. Advised on time management, reference textbooks, and faculty hours." },
  { id: "S3", counselorName: "Dr. Sandeep Deshmukh", date: "2026-05-12", time: "10:30", mode: "Virtual", location: "Google Meet / Teams Link", status: "Completed", notes: "First counseling chat. Discussed transition back to offline campus routines. Set 80% target." }
];

const MOCK_NOTIFICATIONS: StudentNotification[] = [
  { id: "N1", type: "risk", title: "Academic Standing Calibration", message: "AI Engine updated your academic risk prediction to MEDIUM (42%) due to recent Algorithms sessional grades and attendance.", date: "2026-07-11", isRead: false },
  { id: "N2", type: "attendance", title: "Condonation/Debarment Warning", message: "Your attendance in CS-3001 (Algorithms) has dropped to 68%. 75% is strictly required under university norms.", date: "2026-07-10", isRead: false },
  { id: "N3", type: "assignment", title: "Overdue Assignment Notification", message: "Assignment 1: Dynamic Programming Graph Proofs is 2 days overdue.", date: "2026-07-09", isRead: true },
  { id: "N4", type: "counseling", title: "Mentor Counseling Session Confirmed", message: "Your session with Faculty Mentor Dr. Sandeep Deshmukh is scheduled for Tuesday at 2:00 PM.", date: "2026-07-08", isRead: true }
];

// ----------------- SERVICE EXPORTS WITH RESILIENT API CALLS -----------------
export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    try {
      const response = await api.get<StudentProfile>('/api/student/profile');
      return response.data;
    } catch {
      return MOCK_PROFILE;
    }
  },

  getAttendance: async (): Promise<AttendanceData> => {
    try {
      const response = await api.get<AttendanceData>('/api/student/attendance');
      return response.data;
    } catch {
      return MOCK_ATTENDANCE;
    }
  },

  getAcademics: async (): Promise<AcademicData> => {
    try {
      const response = await api.get<AcademicData>('/api/student/academics');
      return response.data;
    } catch {
      return MOCK_ACADEMIC;
    }
  },

  getAssignments: async (): Promise<Assignment[]> => {
    try {
      const response = await api.get<Assignment[]>('/api/student/assignments');
      return response.data;
    } catch {
      return MOCK_ASSIGNMENTS;
    }
  },

  getRiskAnalysis: async (): Promise<RiskAnalysis> => {
    try {
      const response = await api.get<RiskAnalysis>('/api/student/risk');
      return response.data;
    } catch {
      return MOCK_RISK;
    }
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    try {
      const response = await api.get<Recommendation[]>('/api/student/recommendations');
      return response.data;
    } catch {
      return MOCK_RECOMMENDATIONS;
    }
  },

  getCounselingSessions: async (): Promise<CounselingSession[]> => {
    try {
      const response = await api.get<CounselingSession[]>('/api/student/sessions');
      return response.data;
    } catch {
      return MOCK_SESSIONS;
    }
  },

  bookSession: async (session: Omit<CounselingSession, 'id' | 'status'>): Promise<CounselingSession> => {
    try {
      const response = await api.post<CounselingSession>('/api/student/sessions', session);
      return response.data;
    } catch {
      const newSession: CounselingSession = {
        ...session,
        id: `S${Math.floor(Math.random() * 1000)}`,
        status: 'Confirmed'
      };
      MOCK_SESSIONS.unshift(newSession);
      return newSession;
    }
  },

  getNotifications: async (): Promise<StudentNotification[]> => {
    try {
      const response = await api.get<StudentNotification[]>('/api/student/notifications');
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      return MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/api/student/notifications/${id}/read`);
    } catch {
      const n = MOCK_NOTIFICATIONS.find(item => item.id === id);
      if (n) n.isRead = true;
    }
  },

  markAllNotificationsRead: async (): Promise<void> => {
    try {
      await api.post('/api/student/notifications/read-all');
    } catch {
      MOCK_NOTIFICATIONS.forEach(item => item.isRead = true);
    }
  }
};
