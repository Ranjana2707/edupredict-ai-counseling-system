import { api } from './api';
import {
  CounselingSession,
  CounselorRecommendation,
  FollowUpItem,
  CounselorNotification,
  CounselorStudentDetails,
  CounselorDashboardStats
} from '../types';

// Enriched 360° Student Profiles corresponding to core student IDs
let MOCK_COUNSELOR_STUDENTS: CounselorStudentDetails[] = [
  {
    id: "ST-2026-BTECH-101",
    name: "Priyanka Nair",
    email: "priyanka.nair@university.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 5.15,
    attendance: 62.5,
    riskLevel: "high",
    predictionScore: 78,
    predictionConfidence: 96.2,
    phone: "+91 98765 12345",
    dob: "2005-04-12",
    guardianName: "Rajesh Nair",
    guardianPhone: "+91 98765 12340",
    financialStatus: "pending_installment",
    scholarshipDetails: "None (General State Quota)",
    predictionTimeline: [
      { date: "Week 2", score: 25 },
      { date: "Week 4", score: 38 },
      { date: "Week 6", score: 55 },
      { date: "Week 8", score: 68 },
      { date: "Week 10", score: 78 }
    ],
    academicHistory: [
      { semester: "1st Semester", gpa: 5.92 },
      { semester: "2nd Semester", gpa: 5.75 },
      { semester: "3rd Semester", gpa: 5.45 },
      { semester: "4th Semester", gpa: 5.30 },
      { semester: "5th Semester", gpa: 5.18 }
    ],
    attendanceHistory: [
      { subject: "CS-3001: Design & Analysis of Algorithms", percentage: 65.0, classesAttended: 26, classesTotal: 40 },
      { subject: "CS-3004: Theory of Computation", percentage: 60.0, classesAttended: 24, classesTotal: 40 },
      { subject: "CS-3003: Computer Networks & Security", percentage: 62.5, classesAttended: 25, classesTotal: 40 }
    ],
    assignmentStatus: [
      { title: "NFA to DFA Conversion Assignment", dueDate: "2026-07-15", status: "overdue" },
      { title: "Dynamic Programming Graph Proofs", dueDate: "2026-07-09", status: "submitted", grade: "C" },
      { title: "Graph Algorithms & Flows", dueDate: "2026-07-22", status: "pending" }
    ],
    counselingHistory: [
      {
        date: "2026-06-12",
        counselorName: "Dr. Anand Venkatraman",
        type: "Academic Performance Review",
        notes: "Priyanka expresses anxiety regarding the fast pace of Theory of Computation. Mentions struggling with late-night study shifts due to long commute times.",
        outcome: "Referred to remedial class network and proposed 3-installment college fees payment plan."
      }
    ],
    facultyRemarks: [
      {
        facultyName: "Dr. Anand Venkatraman",
        date: "2026-07-01",
        remark: "Priyanka shows interest during coding lab hours but gets visibly fatigued during the mid-class sessional conceptual lectures. Performance is sliding rapidly."
      }
    ],
    engagementMetrics: {
      lmsActivityHours: 2.8,
      libraryCheckins: 1,
      forumContributions: 3
    }
  },
  {
    id: "ST-2026-BTECH-115",
    name: "Neha Sen",
    email: "neha.sen@university.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 4.95,
    attendance: 60.1,
    riskLevel: "critical",
    predictionScore: 92,
    predictionConfidence: 97.9,
    phone: "+91 94321 98765",
    dob: "2005-09-30",
    guardianName: "Sujata Sen",
    guardianPhone: "+91 94321 98760",
    financialStatus: "overdue_fees",
    scholarshipDetails: "Need-Based Student Grant (Under Threat due to CGPA < 5.0)",
    predictionTimeline: [
      { date: "Week 2", score: 45 },
      { date: "Week 4", score: 55 },
      { date: "Week 6", score: 72 },
      { date: "Week 8", score: 85 },
      { date: "Week 10", score: 92 }
    ],
    academicHistory: [
      { semester: "1st Semester", gpa: 5.50 },
      { semester: "2nd Semester", gpa: 5.41 },
      { semester: "3rd Semester", gpa: 5.10 },
      { semester: "4th Semester", gpa: 4.98 },
      { semester: "5th Semester", gpa: 4.95 }
    ],
    attendanceHistory: [
      { subject: "CS-3001: Design & Analysis of Algorithms", percentage: 58.2, classesAttended: 23, classesTotal: 40 },
      { subject: "CS-3004: Theory of Computation", percentage: 62.0, classesAttended: 25, classesTotal: 40 }
    ],
    assignmentStatus: [
      { title: "NFA to DFA Conversion Assignment", dueDate: "2026-07-15", status: "overdue" },
      { title: "Dynamic Programming Graph Proofs", dueDate: "2026-07-09", status: "overdue" }
    ],
    counselingHistory: [
      {
        date: "2026-06-25",
        counselorName: "Dr. Sunita Sharma (Wellness Counselor)",
        type: "Psychological Support Session",
        notes: "Neha reports profound homesickness, chronic sleep disturbances, and a feeling of alienation in her department. High level of academic sessional burnout detected.",
        outcome: "Structured a wellness routine. Scheduled bi-weekly follow-ups. Discussed potential partial semester drop."
      }
    ],
    facultyRemarks: [
      {
        facultyName: "Dr. Anand Venkatraman",
        date: "2026-07-08",
        remark: "Neha has ceased submitting sessional sheets. Did not show up to the sessional written exams without prior notification."
      }
    ],
    engagementMetrics: {
      lmsActivityHours: 1.1,
      libraryCheckins: 0,
      forumContributions: 0
    }
  },
  {
    id: "ST-2026-BTECH-104",
    name: "Aisha Patel",
    email: "aisha.patel@university.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 6.80,
    attendance: 58.0,
    riskLevel: "high",
    predictionScore: 72,
    predictionConfidence: 93.5,
    phone: "+91 91234 56789",
    dob: "2006-01-14",
    guardianName: "Rajesh Patel",
    guardianPhone: "+91 91234 56780",
    financialStatus: "clear",
    scholarshipDetails: "None",
    predictionTimeline: [
      { date: "Week 2", score: 20 },
      { date: "Week 4", score: 35 },
      { date: "Week 6", score: 48 },
      { date: "Week 8", score: 62 },
      { date: "Week 10", score: 72 }
    ],
    academicHistory: [
      { semester: "1st Semester", gpa: 7.10 },
      { semester: "2nd Semester", gpa: 6.95 },
      { semester: "3rd Semester", gpa: 6.85 },
      { semester: "4th Semester", gpa: 6.82 },
      { semester: "5th Semester", gpa: 6.80 }
    ],
    attendanceHistory: [
      { subject: "CS-3001: Design & Analysis of Algorithms", percentage: 55.0, classesAttended: 22, classesTotal: 40 },
      { subject: "CS-3004: Theory of Computation", percentage: 61.0, classesAttended: 24, classesTotal: 40 }
    ],
    assignmentStatus: [
      { title: "NFA to DFA Conversion Assignment", dueDate: "2026-07-15", status: "pending" },
      { title: "Dynamic Programming Graph Proofs", dueDate: "2026-07-09", status: "overdue" }
    ],
    counselingHistory: [
      {
        date: "2026-07-02",
        counselorName: "Dr. Sunita Sharma (Wellness Counselor)",
        type: "General Well-being Intake",
        notes: "Aisha missed classes due to a prolonged severe wisdom tooth surgery followed by viral fever. No behavioral issues; strictly health-related academic slippage.",
        outcome: "Approved medical leave document processing. Advised faculty to extend assignment grace period."
      }
    ],
    facultyRemarks: [
      {
        facultyName: "Dr. Anand Venkatraman",
        date: "2026-07-07",
        remark: "Aisha is bright but has missed 4 consecutive lab lectures. Once she recovers, she should have no issue completing catch-up tasks."
      }
    ],
    engagementMetrics: {
      lmsActivityHours: 3.4,
      libraryCheckins: 5,
      forumContributions: 1
    }
  },
  {
    id: "ST-2026-BTECH-042",
    name: "Rohan Sharma",
    email: "rohan.sharma@university.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    cgpa: 8.42,
    attendance: 74.2,
    riskLevel: "medium",
    predictionScore: 42,
    predictionConfidence: 91.4,
    phone: "+91 98111 22222",
    dob: "2005-02-19",
    guardianName: "Diana Sharma",
    guardianPhone: "+91 98111 22220",
    financialStatus: "clear",
    scholarshipDetails: "Sports Merit Scholarship: 30% reduction (Athletics)",
    predictionTimeline: [
      { date: "Week 2", score: 12 },
      { date: "Week 4", score: 18 },
      { date: "Week 6", score: 22 },
      { date: "Week 8", score: 30 },
      { date: "Week 10", score: 42 }
    ],
    academicHistory: [
      { semester: "1st Semester", gpa: 8.20 },
      { semester: "2nd Semester", gpa: 8.12 },
      { semester: "3rd Semester", gpa: 8.55 },
      { semester: "4th Semester", gpa: 8.30 },
      { semester: "5th Semester", gpa: 8.42 }
    ],
    attendanceHistory: [
      { subject: "CS-3001: Design & Analysis of Algorithms", percentage: 68.0, classesAttended: 27, classesTotal: 40 },
      { subject: "CS-3004: Theory of Computation", percentage: 80.4, classesAttended: 32, classesTotal: 40 }
    ],
    assignmentStatus: [
      { title: "NFA to DFA Conversion Assignment", dueDate: "2026-07-15", status: "submitted", grade: "B+" },
      { title: "Dynamic Programming Graph Proofs", dueDate: "2026-07-09", status: "overdue" }
    ],
    counselingHistory: [],
    facultyRemarks: [
      {
        facultyName: "Dr. Anand Venkatraman",
        date: "2026-07-05",
        remark: "Rohan is missing morning lectures due to intense athletic practice camps. Attendance warning sent."
      }
    ],
    engagementMetrics: {
      lmsActivityHours: 5.2,
      libraryCheckins: 14,
      forumContributions: 9
    }
  },
  {
    id: "ST-2026-BTECH-105",
    name: "Dev Gupta",
    email: "dev.gupta@university.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    department: "Information Technology",
    semester: "6th Semester",
    cgpa: 7.10,
    attendance: 71.0,
    riskLevel: "medium",
    predictionScore: 38,
    predictionConfidence: 89.2,
    phone: "+91 95432 10987",
    dob: "2005-11-04",
    guardianName: "Vijay Gupta",
    guardianPhone: "+91 95432 10980",
    financialStatus: "clear",
    scholarshipDetails: "None",
    predictionTimeline: [
      { date: "Week 2", score: 10 },
      { date: "Week 4", score: 15 },
      { date: "Week 6", score: 25 },
      { date: "Week 8", score: 32 },
      { date: "Week 10", score: 38 }
    ],
    academicHistory: [
      { semester: "1st Semester", gpa: 7.40 },
      { semester: "2nd Semester", gpa: 7.25 },
      { semester: "3rd Semester", gpa: 7.02 },
      { semester: "4th Semester", gpa: 7.12 },
      { semester: "5th Semester", gpa: 7.10 }
    ],
    attendanceHistory: [
      { subject: "CS-3001: Design & Analysis of Algorithms", percentage: 70.0, classesAttended: 28, classesTotal: 40 },
      { subject: "CS-3004: Theory of Computation", percentage: 72.0, classesAttended: 29, classesTotal: 40 }
    ],
    assignmentStatus: [
      { title: "NFA to DFA Conversion Assignment", dueDate: "2026-07-15", status: "pending" },
      { title: "Dynamic Programming Graph Proofs", dueDate: "2026-07-09", status: "submitted", grade: "B" }
    ],
    counselingHistory: [],
    facultyRemarks: [
      {
        facultyName: "Dr. Anand Venkatraman",
        date: "2026-07-03",
        remark: "Dev is slightly disengaged during theoretical lectures but performs highly during hands-on projects."
      }
    ],
    engagementMetrics: {
      lmsActivityHours: 4.8,
      libraryCheckins: 6,
      forumContributions: 15
    }
  }
];

// Interactive Counseling Sessions Storage
let MOCK_SESSIONS: CounselingSession[] = [
  {
    id: "CS-2026-01",
    studentId: "ST-2026-BTECH-101",
    studentName: "Priyanka Nair",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    date: "2026-07-12",
    time: "10:00",
    duration: 45,
    type: "academic",
    status: "completed",
    notes: "Focused on academic catch-up contract. Priyanka agreed to attend specialized sessional tutoring workshops for Theory of Computation, and check in twice weekly.",
    outcome: "Formal Academic Recovery Plan signed. Initial feedback indicates relief.",
    studentFeedback: "The counselor was very empathetic. The remedial tutorial referrals are super helpful.",
    followUpReminder: "Check weekly attendance report.",
    followUpDate: "2026-07-19",
    followUpPriority: "high"
  },
  {
    id: "CS-2026-02",
    studentId: "ST-2026-BTECH-115",
    studentName: "Neha Sen",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    date: "2026-07-12",
    time: "14:00",
    duration: 60,
    type: "psychological",
    status: "upcoming",
    notes: "Critical support intake. Address severe anxiety, homesickness, and potential leave of absence procedure. Ensure parent check-in is prepared.",
    outcome: "",
    studentFeedback: "",
    followUpReminder: "Review parental feedback on leave options.",
    followUpDate: "2026-07-15",
    followUpPriority: "high"
  },
  {
    id: "CS-2026-03",
    studentId: "ST-2026-BTECH-104",
    studentName: "Aisha Patel",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    date: "2026-07-13",
    time: "11:30",
    duration: 30,
    type: "general",
    status: "upcoming",
    notes: "Sync regarding dental medical leave documentation and coordinate assignment extension emails to CSE faculty.",
    outcome: "",
    followUpReminder: "Verify faculty approved extensions.",
    followUpDate: "2026-07-16",
    followUpPriority: "medium"
  },
  {
    id: "CS-2026-04",
    studentId: "ST-2026-BTECH-042",
    studentName: "Rohan Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    date: "2026-07-14",
    time: "09:00",
    duration: 45,
    type: "attendance",
    status: "upcoming",
    notes: "Discuss balance of morning athletics training with CSE lectures. Implement attendance calendar boundaries.",
    outcome: "",
    followUpReminder: "Confirm athletic team coordinator log.",
    followUpDate: "2026-07-21",
    followUpPriority: "medium"
  },
  {
    id: "CS-2026-05",
    studentId: "ST-2026-BTECH-105",
    studentName: "Dev Gupta",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    date: "2026-07-10",
    time: "15:00",
    duration: 40,
    type: "academic",
    status: "completed",
    notes: "Initial diagnostic on career pathways. Dev interested in transition to practical software testing. Showed high enthusiasm.",
    outcome: "Helped structure internship pipeline applications.",
    studentFeedback: "Loved the career guidelines!",
    followUpReminder: "Check internship application drafts.",
    followUpDate: "2026-07-24",
    followUpPriority: "low"
  },
  {
    id: "CS-2026-06",
    studentId: "ST-2026-BTECH-115",
    studentName: "Neha Sen",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    date: "2026-07-05",
    time: "14:00",
    duration: 60,
    type: "psychological",
    status: "completed",
    notes: "Dealt with mid-term math exam failure panic. Conducted sensory grounding exercises and structured visual tasks charts.",
    outcome: "Neha left the office noticeably calm. Self-harm protocols verified negative.",
    studentFeedback: "Breathing techniques helped me during my breakdown.",
    followUpReminder: "Schedule secondary support intake.",
    followUpDate: "2026-07-12",
    followUpPriority: "high"
  }
];

// Interactive Counseling Recommendations
let MOCK_RECOMMENDATIONS: CounselorRecommendation[] = [
  {
    id: "REC-2026-01",
    studentId: "ST-2026-BTECH-101",
    studentName: "Priyanka Nair",
    summary: "Intense academic rehabilitation with customized peer mentoring and flexible fee structuring.",
    priority: "high",
    academicSupport: "Assigned Senior Peer Tutor (Ananya Sen) for 3hrs/week theory reviews. Mandatory attendance at Friday evening doubt clearing boards.",
    psychologicalSupport: "Low test-anxiety counseling exercises twice a month. Focus on reducing late-night stress loops.",
    financialSupport: "Approved installment scheme: divide semester tuition into 3 equal installments with zero surcharge penalty.",
    attendanceImprovementPlan: "Daily physical biometric check-in at CSE library. Required minimum attendance of 75% across remaining 6 weeks.",
    personalizedSuggestions: [
      "Switch late-night work shifts to weekend mornings to safeguard sleep cycles.",
      "Utilize visual Pomodoro planners to limit sessional cramming fatigue.",
      "Sit in the first two rows during Theory of Computation lectures."
    ]
  },
  {
    id: "REC-2026-02",
    studentId: "ST-2026-BTECH-115",
    studentName: "Neha Sen",
    summary: "Critical psychological crisis intervention, academic load mitigation, and potential medical freeze preparation.",
    priority: "high",
    academicSupport: "Initiate emergency request for temporary assignment freeze. Exempt from next week's sessional practical board with clean sessional makeup option.",
    psychologicalSupport: "Urgent therapy counseling with Dr. Sunita Sharma (bi-weekly). Safe coping contracts. Sleep hygiene checklist logging.",
    financialSupport: "Secure student grant protection. Counselor letter dispatched to Financial Aid confirming medical hardships.",
    attendanceImprovementPlan: "No punitive actions for attendance over next 10 days. Prioritize rest and emotional stabilization.",
    personalizedSuggestions: [
      "Limit social media screen exposure after 9:00 PM.",
      "Check in with campus medical clinic regarding prescription sleep aid evaluation.",
      "Call family support lines daily for active homesickness reassurance."
    ]
  },
  {
    id: "REC-2026-03",
    studentId: "ST-2026-BTECH-104",
    studentName: "Aisha Patel",
    summary: "Structured physical health recovery period and administrative faculty accommodation.",
    priority: "medium",
    academicSupport: "Formal counselor letter sent to Dr. Anand Venkatraman requesting 10-day retroactive extension for Design & Analysis of Algorithms homework assignments.",
    psychologicalSupport: "None required. Aisha exhibits high emotional resilience and positive baseline mindset.",
    financialSupport: "None requested.",
    attendanceImprovementPlan: "Approved medical leave status. Once recovered, target 1.5% incremental daily attendance build.",
    personalizedSuggestions: [
      "Review pre-recorded digital lecture recordings from Week 8.",
      "Obtain peer notebook summaries from Priyanka Nair.",
      "Complete soft-diet physical healing protocols strictly."
    ]
  }
];

// Interactive Follow-Ups
let MOCK_FOLLOWUPS: FollowUpItem[] = [
  {
    id: "FU-01",
    studentId: "ST-2026-BTECH-101",
    studentName: "Priyanka Nair",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    dueDate: "2026-07-19",
    description: "Verify if Priyanka checked in with Ananya Sen (peer tutor) and logged 3 hours of study.",
    status: "pending",
    nextAction: "Confirm with Peer Tutor coordinator via Email",
    priority: "high"
  },
  {
    id: "FU-02",
    studentId: "ST-2026-BTECH-115",
    studentName: "Neha Sen",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    dueDate: "2026-07-15",
    description: "Confirm if Sujata Sen (mother) replied to counselor email regarding medical term freeze guidelines.",
    status: "pending",
    nextAction: "Call guardian if email response remains pending.",
    priority: "high"
  },
  {
    id: "FU-03",
    studentId: "ST-2026-BTECH-104",
    studentName: "Aisha Patel",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    dueDate: "2026-07-16",
    description: "Verify if Dr. Anand Venkatraman approved Aisha's late dynamic programming code assignment extension.",
    status: "pending",
    nextAction: "Verify LMS sessional system approval flags",
    priority: "medium"
  },
  {
    id: "FU-04",
    studentId: "ST-2026-BTECH-042",
    studentName: "Rohan Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    dueDate: "2026-07-10",
    description: "Obtain sports training calendar from athletics board to align with study boundaries.",
    status: "completed",
    nextAction: "File athletic timetable in student folder",
    priority: "low"
  }
];

// Interactive Notifications
let MOCK_COUNSELOR_NOTIFS: CounselorNotification[] = [
  {
    id: "CN-1",
    title: "Critical High-Risk Dropout Alert",
    message: "Neha Sen has crossed 90% threshold on ML risk engine due to lack of class attendance and missing sessional exams.",
    type: "high_risk",
    timestamp: "2026-07-12T01:30:00Z",
    isRead: false
  },
  {
    id: "CN-2",
    title: "Urgent Session Reminder",
    message: "Your crisis support session with Neha Sen starts in 2 hours (14:00 PM) in Office Room 2B.",
    type: "session_reminder",
    timestamp: "2026-07-12T05:00:00Z",
    isRead: false
  },
  {
    id: "CN-3",
    title: "New Student Assigned",
    message: "Rohan Sharma (Sports Merit, CSE) has been auto-assigned to your counselor cohort due to falling attendance (74.2%).",
    type: "assigned",
    timestamp: "2026-07-11T16:20:00Z",
    isRead: false
  },
  {
    id: "CN-4",
    title: "New Faculty Message",
    message: "Dr. Anand Venkatraman left a critical remark on Priyanka Nair's profile: 'Sliding rapidly, needs immediate physical counseling check.'",
    type: "faculty_msg",
    timestamp: "2026-07-10T12:05:00Z",
    isRead: true
  },
  {
    id: "CN-5",
    title: "System Announcement",
    message: "The University Psychological Center will remain closed for maintenance on July 18. All emergencies rerouted to emergency clinic.",
    type: "announcement",
    timestamp: "2026-07-09T09:00:00Z",
    isRead: true
  }
];

export const counselorService = {
  getStats: async (): Promise<CounselorDashboardStats> => {
    try {
      const res = await api.get<CounselorDashboardStats>('/api/counselor/stats');
      return res.data;
    } catch {
      return {
        totalAssigned: MOCK_COUNSELOR_STUDENTS.length,
        highRiskCount: MOCK_COUNSELOR_STUDENTS.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
        mediumRiskCount: MOCK_COUNSELOR_STUDENTS.filter(s => s.riskLevel === 'medium').length,
        sessionsTodayCount: MOCK_SESSIONS.filter(s => s.date === '2026-07-12').length,
        upcomingSessionsCount: MOCK_SESSIONS.filter(s => s.status === 'upcoming').length,
        pendingFollowupsCount: MOCK_FOLLOWUPS.filter(f => f.status === 'pending').length
      };
    }
  },

  getStudents: async (): Promise<CounselorStudentDetails[]> => {
    try {
      const res = await api.get<CounselorStudentDetails[]>('/api/counselor/students');
      return res.data;
    } catch {
      return MOCK_COUNSELOR_STUDENTS;
    }
  },

  getStudentById: async (id: string): Promise<CounselorStudentDetails> => {
    try {
      const res = await api.get<CounselorStudentDetails>(`/api/counselor/students/${id}`);
      return res.data;
    } catch {
      const student = MOCK_COUNSELOR_STUDENTS.find(s => s.id === id);
      if (!student) throw new Error("Student details not found");
      return student;
    }
  },

  getSessions: async (): Promise<CounselingSession[]> => {
    try {
      const res = await api.get<CounselingSession[]>('/api/counselor/sessions');
      return res.data;
    } catch {
      return MOCK_SESSIONS;
    }
  },

  createSession: async (session: Omit<CounselingSession, 'id'>): Promise<CounselingSession> => {
    try {
      const res = await api.post<CounselingSession>('/api/counselor/sessions', session);
      return res.data;
    } catch {
      const newSession: CounselingSession = {
        ...session,
        id: `CS-${Math.floor(Math.random() * 10000 + 1000)}`,
        studentAvatar: MOCK_COUNSELOR_STUDENTS.find(s => s.id === session.studentId)?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      };
      
      MOCK_SESSIONS.unshift(newSession);

      // Add a follow-up item if followUpReminder is filled
      if (session.followUpReminder && session.followUpDate) {
        MOCK_FOLLOWUPS.unshift({
          id: `FU-${Math.floor(Math.random() * 1000)}`,
          studentId: session.studentId,
          studentName: session.studentName,
          studentAvatar: newSession.studentAvatar,
          dueDate: session.followUpDate,
          description: session.followUpReminder,
          status: 'pending',
          nextAction: 'Counselor manual trigger checklist',
          priority: session.followUpPriority || 'medium'
        });
      }

      // Automatically append this session into the student's 360 history
      const student = MOCK_COUNSELOR_STUDENTS.find(s => s.id === session.studentId);
      if (student && session.notes) {
        student.counselingHistory.unshift({
          date: session.date,
          counselorName: "Dr. Sunita Sharma, Ph.D.",
          type: session.type.toUpperCase() + " Intake Session",
          notes: session.notes,
          outcome: session.outcome || "Pending formal summary outcome"
        });
      }

      return newSession;
    }
  },

  updateSession: async (id: string, updates: Partial<CounselingSession>): Promise<CounselingSession> => {
    try {
      const res = await api.put<CounselingSession>(`/api/counselor/sessions/${id}`, updates);
      return res.data;
    } catch {
      const session = MOCK_SESSIONS.find(s => s.id === id);
      if (!session) throw new Error("Session not found");
      Object.assign(session, updates);

      // If marked completed, we can mirror that in student's details counseling history
      if (updates.status === 'completed') {
        const student = MOCK_COUNSELOR_STUDENTS.find(s => s.id === session.studentId);
        if (student) {
          const exists = student.counselingHistory.some(h => h.date === session.date && h.type.toLowerCase().includes(session.type));
          if (!exists) {
            student.counselingHistory.unshift({
              date: session.date,
              counselorName: "Dr. Sunita Sharma, Ph.D.",
              type: session.type.toUpperCase() + " counseling session",
              notes: session.notes,
              outcome: session.outcome || "Completed successfully"
            });
          }
        }
      }

      return session;
    }
  },

  cancelSession: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/counselor/sessions/${id}`);
    } catch {
      const session = MOCK_SESSIONS.find(s => s.id === id);
      if (session) {
        session.status = 'cancelled';
      }
    }
  },

  getRecommendations: async (): Promise<CounselorRecommendation[]> => {
    try {
      const res = await api.get<CounselorRecommendation[]>('/api/counselor/recommendations');
      return res.data;
    } catch {
      return MOCK_RECOMMENDATIONS;
    }
  },

  updateRecommendation: async (id: string, updates: Partial<CounselorRecommendation>): Promise<CounselorRecommendation> => {
    try {
      const res = await api.put<CounselorRecommendation>(`/api/counselor/recommendations/${id}`, updates);
      return res.data;
    } catch {
      const rec = MOCK_RECOMMENDATIONS.find(r => r.id === id);
      if (!rec) throw new Error("Recommendation not found");
      Object.assign(rec, updates);
      return rec;
    }
  },

  getFollowups: async (): Promise<FollowUpItem[]> => {
    try {
      const res = await api.get<FollowUpItem[]>('/api/counselor/followups');
      return res.data;
    } catch {
      return MOCK_FOLLOWUPS;
    }
  },

  toggleFollowupStatus: async (id: string): Promise<FollowUpItem> => {
    try {
      const res = await api.post<FollowUpItem>(`/api/counselor/followups/${id}/toggle`);
      return res.data;
    } catch {
      const item = MOCK_FOLLOWUPS.find(f => f.id === id);
      if (!item) throw new Error("Followup not found");
      item.status = item.status === 'pending' ? 'completed' : 'pending';
      return item;
    }
  },

  getNotifications: async (): Promise<CounselorNotification[]> => {
    try {
      const res = await api.get<CounselorNotification[]>('/api/counselor/notifications');
      if (res && Array.isArray(res.data)) {
        return res.data;
      }
      return MOCK_COUNSELOR_NOTIFS;
    } catch {
      return MOCK_COUNSELOR_NOTIFS;
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await api.post(`/api/counselor/notifications/${id}/read`);
    } catch {
      const notif = MOCK_COUNSELOR_NOTIFS.find(n => n.id === id);
      if (notif) notif.isRead = true;
    }
  },

  generateReport: async (type: 'student' | 'monthly' | 'department' | 'risk_improvement'): Promise<{ reportUrl: string; downloadName: string }> => {
    try {
      const res = await api.post<{ reportUrl: string; downloadName: string }>('/api/counselor/reports/generate', { type });
      return res.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            reportUrl: "#",
            downloadName: `Sunita_Sharma_Counseling_Report_${type}_2026.xlsx`
          });
        }, 1200);
      });
    }
  }
};
