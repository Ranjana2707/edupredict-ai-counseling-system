import { api } from './api';
import {
  FacultyProfile,
  FacultyStats,
  FacultyStudent,
  FacultyAssignment,
  FacultyNotification,
  FacultySubject
} from '../types';

// Premium Mock Database representing a real-time university cohort
const MOCK_FACULTY_PROFILE: FacultyProfile = {
  id: "FC-2026-11",
  name: "Dr. Anand Venkatraman",
  email: "anand.v@university.edu.in",
  department: "Computer Science & Engineering",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  designation: "Professor & B.Tech Cohort Coordinator",
  subjectsTaught: ["CS-3001: Design & Analysis of Algorithms", "CS-3004: Theory of Computation"]
};

const MOCK_FACULTY_STATS: FacultyStats = {
  totalStudents: 142,
  highRiskStudents: 18,
  mediumRiskStudents: 34,
  lowRiskStudents: 90,
  averageAttendance: 79.4,
  averageCgpa: 7.85
};

const MOCK_FACULTY_SUBJECTS: FacultySubject[] = [
  { code: "CS-3001", name: "Design & Analysis of Algorithms", department: "Computer Science & Engineering", semester: "6th Semester", totalStudents: 74 },
  { code: "CS-3004", name: "Theory of Computation", department: "Computer Science & Engineering", semester: "6th Semester", totalStudents: 68 }
];

const MOCK_STUDENTS: FacultyStudent[] = [
  {
    id: "ST-2026-BTECH-042",
    name: "Rohan Sharma",
    email: "rohan.sharma@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 8.42,
    attendance: 74.2,
    riskLevel: "medium",
    predictionConfidence: 91.4,
    riskDrivers: ["Low Attendance in CS-3001 (68%)", "Internal Test Slump", "1 Overdue Assignment"],
    riskTimeline: [
      { date: "Week 2", score: 12 },
      { date: "Week 4", score: 18 },
      { date: "Week 6", score: 22 },
      { date: "Week 8", score: 30 },
      { date: "Week 10", score: 42 }
    ],
    predictionHistory: [
      { id: "PH-1", date: "2026-07-11", riskLevel: "medium", confidence: 91.4, status: 'pending', recommendations: ["Lecture Attendance Recovery", "Submit Late Assignment"] },
      { id: "PH-2", date: "2026-06-15", riskLevel: "low", confidence: 88.0, status: 'resolved', recommendations: ["Maintain current performance"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 26, totalInternal: 40, examMarks: 65, totalExam: 100 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 25, totalInternal: 40, examMarks: 60, totalExam: 100 }
    ]
  },
  {
    id: "ST-2026-BTECH-101",
    name: "Priyanka Nair",
    email: "priyanka.nair@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 5.15,
    attendance: 62.5,
    riskLevel: "high",
    predictionConfidence: 96.2,
    riskDrivers: ["Severe attendance drop (62%)", "Low internal marks in Theory of Computation", "Cumulative CGPA below 5.5"],
    riskTimeline: [
      { date: "Week 2", score: 25 },
      { date: "Week 4", score: 38 },
      { date: "Week 6", score: 55 },
      { date: "Week 8", score: 68 },
      { date: "Week 10", score: 78 }
    ],
    predictionHistory: [
      { id: "PH-3", date: "2026-07-10", riskLevel: "high", confidence: 96.2, status: 'counseling_referred', recommendations: ["Mandatory peer tutoring", "Bi-weekly proctor intervention", "Parent-Teacher consultation"] },
      { id: "PH-4", date: "2026-05-18", riskLevel: "medium", confidence: 85.4, status: 'pending', recommendations: ["Remedial classes", "Attendance warning notice"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 18, totalInternal: 40, examMarks: 50, totalExam: 100 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 15, totalInternal: 40, examMarks: 45, totalExam: 100 }
    ]
  },
  {
    id: "ST-2026-BTECH-002",
    name: "Aarav Mehta",
    email: "aarav.mehta@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 9.45,
    attendance: 94.0,
    riskLevel: "low",
    predictionConfidence: 98.7,
    riskDrivers: ["None - outstanding academic and behavioral indicators"],
    riskTimeline: [
      { date: "Week 2", score: 5 },
      { date: "Week 4", score: 4 },
      { date: "Week 6", score: 6 },
      { date: "Week 8", score: 5 },
      { date: "Week 10", score: 5 }
    ],
    predictionHistory: [
      { id: "PH-5", date: "2026-07-10", riskLevel: "low", confidence: 98.7, status: 'resolved', recommendations: ["Maintain current trajectory", "Apply for Prime Minister's Fellowship / IIT Research internship"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 38, totalInternal: 40, examMarks: 96, totalExam: 100 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 37, totalInternal: 40, examMarks: 92, totalExam: 100 }
    ]
  },
  {
    id: "ST-2026-BTECH-104",
    name: "Aisha Patel",
    email: "aisha.patel@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 6.80,
    attendance: 58.0,
    riskLevel: "high",
    predictionConfidence: 93.5,
    riskDrivers: ["Attendance sub-60% in Algorithms", "Frequent physical absence", "Pending 3 internal assignments"],
    riskTimeline: [
      { date: "Week 2", score: 20 },
      { date: "Week 4", score: 35 },
      { date: "Week 6", score: 48 },
      { date: "Week 8", score: 62 },
      { date: "Week 10", score: 72 }
    ],
    predictionHistory: [
      { id: "PH-6", date: "2026-07-09", riskLevel: "high", confidence: 93.5, status: 'pending', recommendations: ["Proctor meeting requested", "Strict physical attendance contract"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 22, totalInternal: 40 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 26, totalInternal: 40 }
    ]
  },
  {
    id: "ST-2026-BTECH-105",
    name: "Dev Gupta",
    email: "dev.gupta@university.edu.in",
    department: "Information Technology",
    semester: "6th Semester",
    cgpa: 7.10,
    attendance: 71.0,
    riskLevel: "medium",
    predictionConfidence: 89.2,
    riskDrivers: ["Minor attendance slide (71%)", "Missed class quizzes"],
    riskTimeline: [
      { date: "Week 2", score: 10 },
      { date: "Week 4", score: 15 },
      { date: "Week 6", score: 25 },
      { date: "Week 8", score: 32 },
      { date: "Week 10", score: 38 }
    ],
    predictionHistory: [
      { id: "PH-7", date: "2026-07-08", riskLevel: "medium", confidence: 89.2, status: 'pending', recommendations: ["Make up sessional quizzes", "Faculty coordinator touchpoint"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 28, totalInternal: 40 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 29, totalInternal: 40 }
    ]
  },
  {
    id: "ST-2026-BTECH-108",
    name: "Ananya Iyer",
    email: "ananya.iyer@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 8.95,
    attendance: 88.5,
    riskLevel: "low",
    predictionConfidence: 97.4,
    riskDrivers: ["None"],
    riskTimeline: [
      { date: "Week 2", score: 8 },
      { date: "Week 4", score: 7 },
      { date: "Week 6", score: 6 },
      { date: "Week 8", score: 8 },
      { date: "Week 10", score: 9 }
    ],
    predictionHistory: [
      { id: "PH-8", date: "2026-07-08", riskLevel: "low", confidence: 97.4, status: 'resolved', recommendations: ["Maintain current routine"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 36, totalInternal: 40 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 35, totalInternal: 40 }
    ]
  },
  {
    id: "ST-2026-BTECH-112",
    name: "Vikram Rao",
    email: "vikram.rao@university.edu.in",
    department: "Information Technology",
    semester: "6th Semester",
    cgpa: 9.12,
    attendance: 91.2,
    riskLevel: "low",
    predictionConfidence: 96.8,
    riskDrivers: ["None"],
    riskTimeline: [
      { date: "Week 2", score: 4 },
      { date: "Week 4", score: 5 },
      { date: "Week 6", score: 6 },
      { date: "Week 8", score: 5 },
      { date: "Week 10", score: 4 }
    ],
    predictionHistory: [
      { id: "PH-9", date: "2026-07-05", riskLevel: "low", confidence: 96.8, status: 'resolved', recommendations: ["Excellent standing"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 37, totalInternal: 40 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 36, totalInternal: 40 }
    ]
  },
  {
    id: "ST-2026-BTECH-115",
    name: "Neha Sen",
    email: "neha.sen@university.edu.in",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 4.95,
    attendance: 60.1,
    riskLevel: "critical",
    predictionConfidence: 97.9,
    riskDrivers: ["CGPA below academic standing limit (<5.0)", "Extremely poor attendance (60%)", "No submissions for Theory of Computation sessional work"],
    riskTimeline: [
      { date: "Week 2", score: 45 },
      { date: "Week 4", score: 55 },
      { date: "Week 6", score: 72 },
      { date: "Week 8", score: 85 },
      { date: "Week 10", score: 92 }
    ],
    predictionHistory: [
      { id: "PH-10", date: "2026-07-04", riskLevel: "critical", confidence: 97.9, status: 'counseling_referred', recommendations: ["Condonation & debarment warning letters sent", "Parent-Teacher meeting scheduled", "Urgent academic counselor session"] }
    ],
    subjectMarks: [
      { subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 15, totalInternal: 40 },
      { subjectCode: "CS-3004", subjectName: "Theory of Computation", internalMarks: 12, totalInternal: 40 }
    ]
  }
];

const MOCK_ASSIGNMENTS: FacultyAssignment[] = [
  {
    id: "FA-3001-1",
    title: "Dynamic Programming Graph Proofs",
    subjectCode: "CS-3001",
    subjectName: "Design & Analysis of Algorithms",
    dueDate: "2026-07-09",
    totalSubmissions: 68,
    pendingSubmissions: 6,
    averageScore: 78.5,
    status: 'graded'
  },
  {
    id: "FA-3004-1",
    title: "NFA to DFA Conversion Assignment",
    subjectCode: "CS-3004",
    subjectName: "Theory of Computation",
    dueDate: "2026-07-15",
    totalSubmissions: 42,
    pendingSubmissions: 32,
    status: 'active'
  },
  {
    id: "FA-3001-2",
    title: "Graph Algorithms & Network Flows",
    subjectCode: "CS-3001",
    subjectName: "Design & Analysis of Algorithms",
    dueDate: "2026-07-22",
    totalSubmissions: 0,
    pendingSubmissions: 74,
    status: 'active'
  }
];

const MOCK_NOTIFICATIONS: FacultyNotification[] = [
  {
    id: "FN-1",
    title: "Critical Attendance Drop Alert",
    message: "Priyanka Nair's overall attendance in CS-3001 dropped to 62.5%. Recommended to initiate debarment trigger warning.",
    type: "attendance",
    timestamp: "2026-07-12T01:10:00Z",
    isRead: false,
    studentId: "ST-2026-BTECH-101"
  },
  {
    id: "FN-2",
    title: "New AI High Risk Flagged",
    message: "Aisha Patel has been re-classified as HIGH RISK due to repeated sessional failure and lack of physical classroom check-ins.",
    type: "risk",
    timestamp: "2026-07-11T18:45:00Z",
    isRead: false,
    studentId: "ST-2026-BTECH-104"
  },
  {
    id: "FN-3",
    title: "Urgent Mentor Session Confirmed",
    message: "Rohan Sharma accepted your recommendation. Sessional counseling dialogue is confirmed with Mentor Dr. Sandeep Deshmukh on July 14 at 2:00 PM.",
    type: "counseling",
    timestamp: "2026-07-11T11:30:00Z",
    isRead: true,
    studentId: "ST-2026-BTECH-042"
  },
  {
    id: "FN-4",
    title: "Assignment Submission Update",
    message: "Submissions for 'Dynamic Programming Optimization' closed. 6 students have failed to upload documentation.",
    type: "assignment",
    timestamp: "2026-07-10T00:01:00Z",
    isRead: true
  },
  {
    id: "FN-5",
    title: "Database Sync Success",
    message: "Active telemetry records imported successfully from Central ERP database. 142 student profiles sync completed.",
    type: "system",
    timestamp: "2026-07-09T08:00:00Z",
    isRead: true
  }
];

export const facultyService = {
  getProfile: async (): Promise<FacultyProfile> => {
    try {
      const res = await api.get<FacultyProfile>('/api/faculty/profile');
      return res.data;
    } catch {
      return MOCK_FACULTY_PROFILE;
    }
  },

  getStats: async (): Promise<FacultyStats> => {
    try {
      const res = await api.get<FacultyStats>('/api/faculty/stats');
      return res.data;
    } catch {
      return MOCK_FACULTY_STATS;
    }
  },

  getSubjects: async (): Promise<FacultySubject[]> => {
    try {
      const res = await api.get<FacultySubject[]>('/api/faculty/subjects');
      return res.data;
    } catch {
      return MOCK_FACULTY_SUBJECTS;
    }
  },

  getStudents: async (): Promise<FacultyStudent[]> => {
    try {
      const res = await api.get<FacultyStudent[]>('/api/faculty/students');
      return res.data;
    } catch {
      return MOCK_STUDENTS;
    }
  },

  updateStudentAttendance: async (studentId: string, subjectCode: string, attendanceValue: number): Promise<FacultyStudent> => {
    try {
      const res = await api.post<FacultyStudent>(`/api/faculty/students/${studentId}/attendance`, { subjectCode, attendanceValue });
      return res.data;
    } catch {
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      if (student) {
        student.attendance = Math.min(100, Math.max(0, Math.round(attendanceValue)));
      }
      return student || MOCK_STUDENTS[0];
    }
  },

  bulkUpdateAttendance: async (subjectCode: string, records: { studentId: string; present: boolean }[]): Promise<void> => {
    try {
      await api.post('/api/faculty/attendance/bulk', { subjectCode, records });
    } catch {
      records.forEach(rec => {
        const student = MOCK_STUDENTS.find(s => s.id === rec.studentId);
        if (student) {
          if (rec.present) {
            student.attendance = Math.min(100, student.attendance + 1.5);
          } else {
            student.attendance = Math.max(0, student.attendance - 2.5);
          }
        }
      });
    }
  },

  updateStudentMarks: async (studentId: string, subjectCode: string, internalMarks: number): Promise<FacultyStudent> => {
    try {
      const res = await api.post<FacultyStudent>(`/api/faculty/students/${studentId}/marks`, { subjectCode, internalMarks });
      return res.data;
    } catch {
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      if (student) {
        const mark = student.subjectMarks.find(m => m.subjectCode === subjectCode);
        if (mark) {
          mark.internalMarks = internalMarks;
        } else {
          student.subjectMarks.push({
            subjectCode,
            subjectName: MOCK_FACULTY_SUBJECTS.find(s => s.code === subjectCode)?.name || "Academic Course",
            internalMarks,
            totalInternal: 100
          });
        }
      }
      return student || MOCK_STUDENTS[0];
    }
  },

  getAssignments: async (): Promise<FacultyAssignment[]> => {
    try {
      const res = await api.get<FacultyAssignment[]>('/api/faculty/assignments');
      return res.data;
    } catch {
      return MOCK_ASSIGNMENTS;
    }
  },

  createAssignment: async (assignment: Omit<FacultyAssignment, 'id' | 'totalSubmissions' | 'pendingSubmissions'>): Promise<FacultyAssignment> => {
    try {
      const res = await api.post<FacultyAssignment>('/api/faculty/assignments', assignment);
      return res.data;
    } catch {
      const newAssignment: FacultyAssignment = {
        ...assignment,
        id: `FA-${Math.floor(Math.random() * 1000)}`,
        totalSubmissions: 0,
        pendingSubmissions: MOCK_FACULTY_STATS.totalStudents
      };
      MOCK_ASSIGNMENTS.unshift(newAssignment);
      return newAssignment;
    }
  },

  updateAssignment: async (id: string, updates: Partial<FacultyAssignment>): Promise<FacultyAssignment> => {
    try {
      const res = await api.put<FacultyAssignment>(`/api/faculty/assignments/${id}`, updates);
      return res.data;
    } catch {
      const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
      if (assignment) {
        Object.assign(assignment, updates);
      }
      return assignment || MOCK_ASSIGNMENTS[0];
    }
  },

  getNotifications: async (): Promise<FacultyNotification[]> => {
    try {
      const res = await api.get<FacultyNotification[]>('/api/faculty/notifications');
      if (res && Array.isArray(res.data)) {
        return res.data;
      }
      return MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await api.post(`/api/faculty/notifications/${id}/read`);
    } catch {
      const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
      if (notif) notif.isRead = true;
    }
  },

  importCSV: async (file: File): Promise<{ successCount: number; errors: string[] }> => {
    // API mock processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple client-side validation mockup
        if (!file.name.endsWith('.csv')) {
          resolve({ successCount: 0, errors: ["Invalid file format. Only .csv files are supported."] });
          return;
        }

        // Add 2 mock students representing a successful file load
        const successCount = 2;
        MOCK_STUDENTS.push({
          id: `ST-2026-BTECH-${Math.floor(Math.random() * 1000 + 150)}`,
          name: "Jayesh Verma",
          email: "j.verma@university.edu.in",
          department: "Computer Science & Engineering",
          semester: "6th Semester",
          cgpa: 7.25,
          attendance: 84.5,
          riskLevel: "low",
          predictionConfidence: 94.0,
          riskDrivers: ["None"],
          riskTimeline: [{ date: "Week 10", score: 10 }],
          predictionHistory: [],
          subjectMarks: [{ subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 28, totalInternal: 40 }]
        });

        MOCK_STUDENTS.push({
          id: `ST-2026-BTECH-${Math.floor(Math.random() * 1000 + 150)}`,
          name: "Ankita Sen",
          email: "ankita.sen@university.edu.in",
          department: "Computer Science & Engineering",
          semester: "6th Semester",
          cgpa: 5.80,
          attendance: 69.2,
          riskLevel: "medium",
          predictionConfidence: 87.5,
          riskDrivers: ["Attendance sub-75% sessional requirements", "Internal marks low"],
          riskTimeline: [{ date: "Week 10", score: 48 }],
          predictionHistory: [],
          subjectMarks: [{ subjectCode: "CS-3001", subjectName: "Design & Analysis of Algorithms", internalMarks: 22, totalInternal: 40 }]
        });

        MOCK_FACULTY_STATS.totalStudents += 2;
        MOCK_FACULTY_STATS.mediumRiskStudents += 1;
        MOCK_FACULTY_STATS.lowRiskStudents += 1;

        resolve({
          successCount,
          errors: []
        });
      }, 2000);
    });
  },

  generateReport: async (type: 'student' | 'attendance' | 'marks' | 'risk'): Promise<{ reportUrl: string; downloadName: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reportUrl: "#",
          downloadName: `Vance_CSE_Report_${type}_2026_07.xlsx`
        });
      }, 1500);
    });
  }
};
