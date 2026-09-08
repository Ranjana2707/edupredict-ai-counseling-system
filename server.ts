import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers & Hardening Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// User Data Sanitizer (Strips password hash/plaintext before JSON response)
function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

// Dynamic File-Based State Store
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initial Database Schema / Seed Data
const INITIAL_DATABASE = {
  users: [
    {
      id: 'EP-ADMIN-01',
      name: 'Dr. John Doe',
      email: 'admin@university.edu',
      password: 'password123',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      department: 'Institutional Intelligence',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'EP-FACULTY-02',
      name: 'Dr. Sarah Jenkins',
      email: 'faculty@university.edu',
      password: 'password123',
      role: 'faculty',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
      department: 'Computer Science',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'EP-COUNSELOR-03',
      name: 'Dr. Aris Thorne',
      email: 'counselor@university.edu',
      password: 'password123',
      role: 'counselor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: 'Student Care',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'EP-2024-8842',
      name: 'Marcus Thorne',
      email: 'student@university.edu',
      password: 'password123',
      role: 'student',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      department: 'Data Science',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],
  students: [
    {
      id: 'ST-2026-98',
      name: 'Marcus Thorne',
      email: 'student@university.edu',
      phoneNumber: '+1 (555) 019-2834',
      role: 'student',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 3.42,
      overallAttendance: 74.2,
      riskScore: 42,
      dropoutProbability: 42,
      pendingAssignments: 3,
      upcomingCounseling: 1,
      achievements: [
        "Dean's Honor List - Fall 2024",
        "First Place - Annual University Hackathon 2025",
        "IEEE Student Branch Active Member"
      ],
      subjectMarks: [
        { subjectCode: 'CS-301', subjectName: 'Advanced Algorithms', internalMarks: 62, totalInternal: 100, examMarks: 65, totalExam: 100 },
        { subjectCode: 'CS-304', subjectName: 'Distributed Systems', internalMarks: 58, totalInternal: 100, examMarks: 60, totalExam: 100 }
      ],
      attendance: {
        overall: 74.2,
        subjects: [
          { code: 'CS-301', name: 'Advanced Algorithms', percentage: 68, attended: 17, total: 25, required: 75 },
          { code: 'CS-302', name: 'Neural Networks & Deep Learning', percentage: 82, attended: 23, total: 28, required: 75 },
          { code: 'CS-303', name: 'Software Engineering & Agile', percentage: 78, attended: 21, total: 27, required: 75 },
          { code: 'CS-304', name: 'Distributed Systems', percentage: 71, attended: 20, total: 28, required: 75 },
          { code: 'CS-305', name: 'Technical Communications', percentage: 90, attended: 18, total: 20, required: 75 }
        ],
        monthlyTrend: [
          { month: 'Jan', percentage: 88 },
          { month: 'Feb', percentage: 82 },
          { month: 'Mar', percentage: 76 },
          { month: 'Apr', percentage: 74 },
          { month: 'May', percentage: 68 },
          { month: 'Jun', percentage: 74 }
        ],
        heatmapData: [
          { date: '2026-07-01', status: 'present' },
          { date: '2026-07-02', status: 'present' },
          { date: '2026-07-03', status: 'absent' },
          { date: '2026-07-06', status: 'present' },
          { date: '2026-07-07', status: 'present' },
          { date: '2026-07-08', status: 'absent' },
          { date: '2026-07-09', status: 'present' },
          { date: '2026-07-10', status: 'present' }
        ],
        alerts: [
          'Attendance warning in CS-301 (68%): 2 more consecutive absences will trigger a warning alert.',
          'Distributed Systems attendance (71%) is slightly below recommended safe target.'
        ]
      },
      academics: {
        cgpa: 3.42,
        semesterGpa: [
          { semester: 'Semester 1', gpa: 3.65 },
          { semester: 'Semester 2', gpa: 3.48 },
          { semester: 'Semester 3', gpa: 3.52 },
          { semester: 'Semester 4', gpa: 3.21 },
          { semester: 'Semester 5', gpa: 3.42 }
        ],
        subjectMarks: [
          { subject: 'Advanced Algorithms', internal: 22, external: 68, classAverage: 74 },
          { subject: 'Neural Networks & Deep Learning', internal: 28, external: 84, classAverage: 78 },
          { subject: 'Software Engineering & Agile', internal: 26, external: 79, classAverage: 80 },
          { subject: 'Distributed Systems', internal: 21, external: 70, classAverage: 72 },
          { subject: 'Technical Communications', internal: 29, external: 92, classAverage: 85 }
        ],
        stats: {
          totalCredits: 112,
          passedCredits: 112,
          backlogs: 0,
          classRank: 'Top 15%'
        }
      }
    },
    {
      id: 'ST-2026-101',
      name: 'Elena Rostova',
      email: 'elena.rostova@university.edu',
      phoneNumber: '+1 (555) 124-7856',
      role: 'student',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 2.15,
      overallAttendance: 62.5,
      riskScore: 82,
      dropoutProbability: 82,
      pendingAssignments: 5,
      upcomingCounseling: 2,
      achievements: [],
      subjectMarks: [
        { subjectCode: 'CS-301', subjectName: 'Advanced Algorithms', internalMarks: 48, totalInternal: 100, examMarks: 50, totalExam: 100 },
        { subjectCode: 'CS-304', subjectName: 'Distributed Systems', internalMarks: 42, totalInternal: 100, examMarks: 45, totalExam: 100 }
      ],
      attendance: {
        overall: 62.5,
        subjects: [
          { code: 'CS-301', name: 'Advanced Algorithms', percentage: 55, attended: 11, total: 20, required: 75 },
          { code: 'CS-304', name: 'Distributed Systems', percentage: 70, attended: 14, total: 20, required: 75 }
        ],
        monthlyTrend: [
          { month: 'Jan', percentage: 75 },
          { month: 'Feb', percentage: 70 },
          { month: 'Mar', percentage: 65 },
          { month: 'Apr', percentage: 60 },
          { month: 'May', percentage: 58 },
          { month: 'Jun', percentage: 62 }
        ],
        heatmapData: [],
        alerts: [
          'High Risk Dropout Warning: Attendance has sunk to 62.5% overall.'
        ]
      },
      academics: {
        cgpa: 2.15,
        semesterGpa: [
          { semester: 'Semester 1', gpa: 2.50 },
          { semester: 'Semester 2', gpa: 2.30 },
          { semester: 'Semester 3', gpa: 2.20 },
          { semester: 'Semester 4', gpa: 2.10 },
          { semester: 'Semester 5', gpa: 2.15 }
        ],
        subjectMarks: [
          { subject: 'Advanced Algorithms', internal: 14, external: 48, classAverage: 74 },
          { subject: 'Distributed Systems', internal: 12, external: 42, classAverage: 72 }
        ],
        stats: {
          totalCredits: 112,
          passedCredits: 96,
          backlogs: 2,
          classRank: 'Bottom 10%'
        }
      }
    }
  ],
  departments: [
    {
      id: 'DEP-001',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      hod: 'Dr. Alan Turing',
      studentCount: 24,
      staffCount: 8,
      budget: '$180,000',
      riskPercentage: 21.5
    },
    {
      id: 'DEP-002',
      name: 'Electrical & Physics Eng',
      code: 'EEPE',
      hod: 'Dr. Nikola Tesla',
      studentCount: 18,
      staffCount: 6,
      budget: '$150,000',
      riskPercentage: 11.1
    }
  ],
  assignments: [
    {
      id: 'A1',
      title: 'Dynamic Programming Optimization',
      subject: 'Advanced Algorithms',
      dueDate: '2026-07-15',
      status: 'pending',
      progress: 35
    },
    {
      id: 'A2',
      title: 'Paxos Implementation Project',
      subject: 'Distributed Systems',
      dueDate: '2026-07-20',
      status: 'pending',
      progress: 10
    }
  ],
  sessions: [
    {
      id: 'S1',
      studentName: 'Marcus Thorne',
      counselorName: 'Dr. Aris Thorne',
      date: '2026-07-14',
      time: '14:00',
      mode: 'In-Person',
      location: 'Counseling Wing, C-Block, Office 103',
      status: 'Confirmed',
      notes: ''
    },
    {
      id: 'S2',
      studentName: 'Marcus Thorne',
      counselorName: 'Dr. Aris Thorne',
      date: '2026-06-18',
      time: '11:00',
      mode: 'In-Person',
      location: 'Counseling Wing, Office 103',
      status: 'Completed',
      notes: 'Discussed study structures, pomodoro loops, and advised reaching out to prof.'
    }
  ],
  recommendations: [
    { id: 'R1', category: 'attendance', title: 'Lectures Attendance Recovery', description: 'Attend the next 4 consecutive Advanced Algorithms lectures to pull attendance past 75%.', priority: 'high', actionLabel: 'View Schedule' },
    { id: 'R2', category: 'action', title: 'Submit Late DP Code', description: 'Submit your code assignment today. Even with late penalty, it protects your grade curve.', priority: 'high', actionLabel: 'Submit Assignment' }
  ],
  followups: [
    { id: 'F1', name: 'Marcus Thorne', idNumber: 'ST-2026-98', contact: 'marcus@university.edu', lastContact: '2026-07-01', riskLevel: 'medium', category: 'attendance', task: 'Review weekly Algorithms class presence', isCompleted: false },
    { id: 'F2', name: 'Elena Rostova', idNumber: 'ST-2026-101', contact: 'elena.rostova@university.edu', lastContact: '2026-07-10', riskLevel: 'high', category: 'academics', task: 'Follow up on mandatory peer tutoring attendance', isCompleted: false }
  ],
  predictionHistory: [
    {
      id: 'PRD-782910',
      studentName: 'Aarav Sharma',
      date: '2026-07-01T10:30:00Z',
      riskScore: 78,
      riskLevel: 'high',
      attendance: 64,
      cgpa: 5.8,
      counselingSessions: 3,
      modelVersion: 'v3.4.1-fastapi'
    },
    {
      id: 'PRD-521094',
      studentName: 'Priya Patel',
      date: '2026-06-28T14:15:00Z',
      riskScore: 18,
      riskLevel: 'low',
      attendance: 92,
      cgpa: 8.9,
      counselingSessions: 0,
      modelVersion: 'v3.4.1-fastapi'
    }
  ],
  auditLogs: [
    {
      id: 'LOG-3829',
      timestamp: new Date().toISOString(),
      type: 'security',
      message: 'Central server security credentials established.',
      user: 'admin@university.edu',
      severity: 'info'
    }
  ],
  settings: {
    general: { universityName: 'Apex Tech University', academicYear: '2025-2026', currentSemester: 'Spring' },
    email: { smtpServer: 'smtp.university.edu', smtpPort: 587, senderEmail: 'noreply@university.edu' },
    security: { inactivityTimeout: 15, mfaRequired: false, passwordExpiryDays: 90 },
    application: { predictionModel: 'Gradient Boosting Machine v4.2', autoRetrainInterval: 30, riskThreshold: 65 }
  },
  otps: {} as Record<string, string>
};

let db = { ...INITIAL_DATABASE };

// Load Database
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(raw);
    console.log('Database loaded successfully from file.');
  } catch (err) {
    console.error('Failed to load JSON database, running with memory seed.', err);
  }
} else {
  saveDb();
}

// Ensure counselorNotifications is present in database
if (!(db as any).counselorNotifications) {
  (db as any).counselorNotifications = [
    { id: "CN-1", title: "Critical High-Risk Dropout Alert", message: "Chloe Dupont has crossed 90% threshold on ML risk engine due to lack of class attendance and missing midterm exams.", type: "high_risk", timestamp: "2026-07-12T01:30:00Z", isRead: false },
    { id: "CN-2", title: "Urgent Session Reminder", message: "Your crisis support session with Chloe Dupont starts in 2 hours (14:00 PM) in Office Room 2B.", type: "session_reminder", timestamp: "2026-07-12T05:00:00Z", isRead: false },
    { id: "CN-3", title: "New Student Assigned", message: "Marcus Thorne (Sports Merit, CSE) has been auto-assigned to your counselor cohort due to falling attendance (74.2%).", type: "assigned", timestamp: "2026-07-11T16:20:00Z", isRead: false },
    { id: "CN-4", title: "New Faculty Message", message: "Dr. Evelyn Vance left a critical remark on Elena Rostova's profile: 'Sliding rapidly, needs immediate physical counseling check.'", type: "faculty_msg", timestamp: "2026-07-10T12:05:00Z", isRead: true }
  ];
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save JSON database to file.', err);
  }
}

// Lazy Gemini API client initializer
let ai: any = null;
function getAiClient() {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log('Gemini API Engine successfully initialized on server-side.');
  }
  return ai;
}

// ----------------------------------------------------
// AUTH ROUTE HANDLERS
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password, mockRole } = req.body;
  const cleanEmail = email?.toLowerCase()?.trim();

  let matchedUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (mockRole) {
    // If testing/previewing with a role selector, load that user role
    matchedUser = db.users.find((u) => u.role === mockRole);
  }

  // Fallback to auto-creating user if not exists to facilitate smooth testing experience
  if (!matchedUser) {
    let fallbackRole = 'student';
    let fallbackName = 'Marcus Thorne';
    if (cleanEmail?.includes('admin')) {
      fallbackRole = 'admin';
      fallbackName = 'Dr. John Doe';
    } else if (cleanEmail?.includes('faculty')) {
      fallbackRole = 'faculty';
      fallbackName = 'Dr. Sarah Jenkins';
    } else if (cleanEmail?.includes('counselor')) {
      fallbackRole = 'counselor';
      fallbackName = 'Dr. Aris Thorne';
    }

    matchedUser = {
      id: `EP-${fallbackRole.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: fallbackName,
      email: email || `${fallbackRole}@university.edu`,
      password: 'password123',
      role: fallbackRole,
      avatarUrl: `https://images.unsplash.com/photo-${fallbackRole === 'faculty' ? '1573497019940-1c28c88b4f3e' : '1500648767791-00dcc994a43e'}?w=150`,
      department: fallbackRole === 'faculty' ? 'Computer Science' : 'Data Science',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    db.users.push(matchedUser);
    saveDb();
  }

  const token = `jwt_token_resolved_${matchedUser.role}_${Date.now()}`;
  const rToken = `refresh_token_${matchedUser.role}_${Date.now()}`;

  res.json({
    user: {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      avatarUrl: matchedUser.avatarUrl,
      department: matchedUser.department
    },
    token,
    refreshToken: rToken
  });
});

app.post('/api/auth/login-google', (req, res) => {
  const { uid, email, name, role, avatarUrl } = req.body;
  const cleanEmail = email?.toLowerCase()?.trim();

  let matchedUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!matchedUser) {
    matchedUser = {
      id: uid || `EP-GOOGLE-${Math.floor(100 + Math.random() * 900)}`,
      name: name || 'Google User',
      email: cleanEmail,
      password: 'google_oauth_bypass',
      role: role || 'student',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      department: 'Computer Science',
      status: 'active',
      isLocked: false,
      passwordResetRequired: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    db.users.push(matchedUser);
    saveDb();
  } else {
    // Update last login
    matchedUser.lastLogin = new Date().toISOString();
    saveDb();
  }

  const token = `jwt_token_resolved_${matchedUser.role}_${Date.now()}`;
  res.json({
    user: {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      avatarUrl: matchedUser.avatarUrl,
      department: matchedUser.department
    },
    token
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role, department } = req.body;
  
  const existing = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User already exists with this email address.' });
  }

  const newUser = {
    id: `EP-${role.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email,
    password: 'password123',
    role,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department,
    status: 'active',
    isLocked: false,
    passwordResetRequired: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Institutional email address is required' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  if (!db.otps) {
    db.otps = {};
  }
  const normalizedEmail = email.toLowerCase().trim();
  db.otps[normalizedEmail] = otp;
  db.otps[email] = otp;
  saveDb();
  console.log(`[AUTH] Reset OTP code dispatched for ${email}: ${otp}`);
  res.json({ success: true, otp, email: normalizedEmail, message: 'Recovery OTP dispatched successfully' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const matched = db.otps ? (db.otps[normalizedEmail] || db.otps[email]) : null;
  
  if (matched && matched === otp) {
    if (db.otps) {
      delete db.otps[normalizedEmail];
      delete db.otps[email];
      saveDb();
    }
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid or expired 6-digit OTP code.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const matched = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (matched) {
    matched.password = password;
    matched.passwordResetRequired = false;
    saveDb();
  }
  res.json({ success: true, message: 'Password reset successfully' });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role } = req.body;
  const user = db.users.find(u => u.role === role);
  if (!user) {
    return res.status(404).json({ message: `No user seeded for role: ${role}` });
  }
  const token = `jwt_token_resolved_${user.role}_${Date.now()}`;
  res.json({ user, token });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/auth/refresh', (req, res) => {
  const { email, refreshToken } = req.body;
  const matched = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  const token = `jwt_token_resolved_${matched?.role || 'student'}_${Date.now()}`;
  res.json({ token, refreshToken });
});

// ----------------------------------------------------
// STUDENT MODULE ROUTES
// ----------------------------------------------------

app.get('/api/student/profile', (req, res) => {
  res.json(db.students[0]);
});

app.get('/api/student/attendance', (req, res) => {
  res.json(db.students[0].attendance);
});

app.get('/api/student/academics', (req, res) => {
  res.json(db.students[0].academics);
});

app.get('/api/student/assignments', (req, res) => {
  res.json(db.assignments);
});

app.get('/api/student/risk', (req, res) => {
  res.json({
    riskLevel: db.students[0].riskScore >= 75 ? 'HIGH' : db.students[0].riskScore >= 35 ? 'MEDIUM' : 'LOW',
    riskPercentage: db.students[0].riskScore,
    predictionConfidence: 94.2,
    riskDrivers: [
      { factor: 'Class Attendance Rate', impact: 28, description: 'Algorithms attendance dipped below 70%' },
      { factor: 'Internal Assessment Marks', impact: 14, description: 'Neural networks midterm assignment graded below average' }
    ],
    timeline: [
      { week: 'Week 2', score: 12 },
      { week: 'Week 4', score: 18 },
      { week: 'Week 6', score: 25 },
      { week: 'Week 8', score: 38 },
      { week: 'Week 10', score: db.students[0].riskScore }
    ]
  });
});

app.get('/api/student/recommendations', (req, res) => {
  res.json(db.recommendations);
});

app.get('/api/student/sessions', (req, res) => {
  res.json(db.sessions);
});

app.post('/api/student/sessions', (req, res) => {
  const newSession = {
    ...req.body,
    id: `S${Math.floor(100 + Math.random() * 900)}`,
    status: 'Confirmed'
  };
  db.sessions.unshift(newSession);
  saveDb();
  res.json(newSession);
});

app.get('/api/student/notifications', (req, res) => {
  res.json([
    { id: 'N1', type: 'risk', title: 'Dropout Risk Warning', message: 'Model updated your dropout risk score to 42%.', date: '2026-07-11', isRead: false },
    { id: 'N2', type: 'attendance', title: 'Attendance Alert', message: 'Algorithms class attendance has sunk below 70%.', date: '2026-07-10', isRead: true }
  ]);
});

app.post('/api/student/notifications/read-all', (req, res) => {
  res.json({ success: true });
});

// ----------------------------------------------------
// FACULTY MODULE ROUTES
// ----------------------------------------------------

app.get('/api/faculty/profile', (req, res) => {
  res.json({
    id: 'FC-2026-11',
    name: 'Dr. Sarah Jenkins',
    email: 'faculty@university.edu',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    designation: 'Associate Professor & Cohort Supervisor',
    subjectsTaught: ['CS-301: Advanced Algorithms', 'CS-304: Distributed Systems']
  });
});

app.get('/api/faculty/stats', (req, res) => {
  res.json({
    totalStudents: db.students.length,
    highRiskStudents: db.students.filter(s => s.riskScore >= 75).length,
    mediumRiskStudents: db.students.filter(s => s.riskScore >= 35 && s.riskScore < 75).length,
    lowRiskStudents: db.students.filter(s => s.riskScore < 35).length,
    averageAttendance: 79.4,
    averageCgpa: 3.18
  });
});

app.get('/api/faculty/subjects', (req, res) => {
  res.json([
    { code: 'CS-301', name: 'Advanced Algorithms', department: 'Computer Science', semester: '6th Semester', totalStudents: 74 },
    { code: 'CS-304', name: 'Distributed Systems', department: 'Computer Science', semester: '6th Semester', totalStudents: 68 }
  ]);
});

app.get('/api/faculty/students', (req, res) => {
  const formatted = db.students.map((s: any) => {
    const riskScore = typeof s.riskScore === 'number' ? s.riskScore : (s.dropoutProbability || 0);
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 85) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    return {
      ...s,
      riskLevel,
      attendance: s.overallAttendance || 0,
      predictionConfidence: s.predictionConfidence || Math.round(85 + Math.random() * 14),
      riskDrivers: s.riskDrivers || (riskLevel === 'low' ? ["None - stable parameters"] : ["Class attendance concerns", "Academic tracking recommended"]),
      riskTimeline: s.riskTimeline || [
        { date: "Week 2", score: Math.max(5, riskScore - 15) },
        { date: "Week 4", score: Math.max(5, riskScore - 10) },
        { date: "Week 6", score: Math.max(5, riskScore - 5) },
        { date: "Week 8", score: Math.max(5, riskScore - 2) },
        { date: "Week 10", score: riskScore }
      ],
      predictionHistory: s.predictionHistory || [
        { id: `PH-${s.id}`, date: "2026-07-10", riskLevel, confidence: 91.4, status: 'pending', recommendations: ["Review lecture materials", "Target attendance recovery"] }
      ]
    };
  });
  res.json(formatted);
});

app.post('/api/faculty/students/:studentId/attendance', (req, res) => {
  const { studentId } = req.params;
  const { subjectCode, attendanceValue } = req.body;
  const s = db.students.find(x => x.id === studentId);
  if (s) {
    const sub = s.attendance.subjects.find(x => x.code === subjectCode);
    if (sub) {
      sub.percentage = attendanceValue;
    }
    s.overallAttendance = Math.round(s.attendance.subjects.reduce((sum, current) => sum + current.percentage, 0) / s.attendance.subjects.length);
    saveDb();
    res.json(s);
  } else {
    res.status(404).json({ message: 'Student not found.' });
  }
});

app.post('/api/faculty/students/:studentId/marks', (req, res) => {
  const { studentId } = req.params;
  const { subjectCode, internalMarks } = req.body;
  const s = db.students.find(x => x.id === studentId);
  if (s) {
    const sm = s.subjectMarks.find(x => x.subjectCode === subjectCode);
    if (sm) {
      sm.internalMarks = internalMarks;
    }
    saveDb();
    res.json(s);
  } else {
    res.status(404).json({ message: 'Student not found.' });
  }
});

app.post('/api/faculty/attendance/bulk', (req, res) => {
  const { subjectCode, records } = req.body;
  records.forEach((rec: { studentId: string; present: boolean }) => {
    const s = db.students.find(x => x.id === rec.studentId);
    if (s) {
      const sub = s.attendance.subjects.find(x => x.code === subjectCode);
      if (sub) {
        sub.attended = rec.present ? sub.attended + 1 : sub.attended;
        sub.total += 1;
        sub.percentage = Math.round((sub.attended / sub.total) * 100);
      }
    }
  });
  saveDb();
  res.json({ success: true });
});

app.get('/api/faculty/assignments', (req, res) => {
  res.json(db.assignments);
});

app.post('/api/faculty/assignments', (req, res) => {
  const newAssignment = {
    ...req.body,
    id: `A${db.assignments.length + 1}`,
    status: 'pending',
    progress: 0
  };
  db.assignments.unshift(newAssignment);
  saveDb();
  res.json(newAssignment);
});

app.put('/api/faculty/assignments/:id', (req, res) => {
  const { id } = req.params;
  const index = db.assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    db.assignments[index] = { ...db.assignments[index], ...req.body };
    saveDb();
    res.json(db.assignments[index]);
  } else {
    res.status(404).json({ message: 'Assignment not found.' });
  }
});

app.get('/api/faculty/notifications', (req, res) => {
  res.json([
    { id: 'FN1', type: 'system', title: 'Database Synced', message: 'Student profile batch upload successfully committed.', date: new Date().toISOString(), isRead: false }
  ]);
});

app.post('/api/faculty/students/csv-upload', (req, res) => {
  // Simple simulator for bulk cohort syncing
  const mockAdded = [
    {
      id: `ST-2026-${Math.floor(Math.random() * 100 + 100)}`,
      name: 'Amelia Watson',
      email: 'a.watson@university.edu',
      phoneNumber: '+1 (555) 789-2152',
      role: 'student',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 2.30,
      overallAttendance: 69.2,
      riskScore: 68,
      dropoutProbability: 68,
      pendingAssignments: 3,
      upcomingCounseling: 0,
      achievements: [],
      subjectMarks: [],
      attendance: { overall: 69.2, subjects: [], monthlyTrend: [], heatmapData: [], alerts: [] },
      academics: { cgpa: 2.30, semesterGpa: [], subjectMarks: [], stats: { totalCredits: 100, passedCredits: 90, backlogs: 1, classRank: 'Bottom 25%' } }
    }
  ];

  db.students.push(...mockAdded);
  saveDb();

  res.json({
    successCount: mockAdded.length,
    errors: []
  });
});

app.post('/api/reports/generate', (req, res) => {
  res.json({
    reportUrl: '/api/reports/download?type=' + req.body.type,
    downloadName: `Vance_CSE_Report_${req.body.type}_2026_07.csv`
  });
});

app.get('/api/reports/download', (req, res) => {
  const type = req.query.type || 'risk';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=university_academic_report_${type}.csv`);
  
  // Return valid mock CSV contents
  let csv = 'Student ID,Name,Department,Attendance,CGPA,Risk Score,Status\n';
  db.students.forEach(s => {
    csv += `${s.id},${s.name},${s.department},${s.overallAttendance}%,${s.cgpa},${s.riskScore}%,Active\n`;
  });
  res.send(csv);
});

// ----------------------------------------------------
// COUNSELOR MODULE ROUTES
// ----------------------------------------------------

app.get('/api/counselor/stats', (req, res) => {
  res.json({
    activeCases: db.students.filter(s => s.riskScore >= 35).length,
    resolvedCases: 42,
    scheduledSessions: db.sessions.filter(s => s.status === 'Confirmed').length,
    pendingFollowups: db.followups.filter(f => !f.isCompleted).length,
    riskDistribution: {
      high: db.students.filter(s => s.riskScore >= 75).length,
      medium: db.students.filter(s => s.riskScore >= 35 && s.riskScore < 75).length,
      low: db.students.filter(s => s.riskScore < 35).length
    }
  });
});

app.get('/api/counselor/students', (req, res) => {
  const formatted = db.students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phoneNumber: s.phoneNumber,
    department: s.department,
    semester: s.semester,
    cgpa: s.cgpa,
    attendance: s.overallAttendance,
    riskScore: s.riskScore,
    riskLevel: s.riskScore >= 75 ? 'high' : s.riskScore >= 35 ? 'medium' : 'low',
    lastContactDate: '2026-07-02'
  }));
  res.json(formatted);
});

app.get('/api/counselor/sessions', (req, res) => {
  res.json(db.sessions);
});

app.post('/api/counselor/sessions', (req, res) => {
  const sess = {
    ...req.body,
    id: `S${Math.floor(100 + Math.random() * 900)}`,
    status: 'Confirmed'
  };
  db.sessions.unshift(sess);
  saveDb();
  res.json(sess);
});

app.put('/api/counselor/sessions/:id', (req, res) => {
  const { id } = req.params;
  const index = db.sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    db.sessions[index] = { ...db.sessions[index], ...req.body };
    saveDb();
    res.json(db.sessions[index]);
  } else {
    res.status(404).json({ message: 'Session not found.' });
  }
});

app.delete('/api/counselor/sessions/:id', (req, res) => {
  const { id } = req.params;
  db.sessions = db.sessions.filter(s => s.id !== id);
  saveDb();
  res.json({ id });
});

app.get('/api/counselor/recommendations', (req, res) => {
  res.json(db.recommendations);
});

app.get('/api/counselor/followups', (req, res) => {
  res.json(db.followups);
});

app.post('/api/counselor/followups/:id/toggle', (req, res) => {
  const { id } = req.params;
  const index = db.followups.findIndex(f => f.id === id);
  if (index !== -1) {
    db.followups[index].isCompleted = !db.followups[index].isCompleted;
    saveDb();
    res.json(db.followups[index]);
  } else {
    res.status(404).json({ message: 'Followup item not found.' });
  }
});

app.get('/api/counselor/notifications', (req, res) => {
  res.json((db as any).counselorNotifications || []);
});

app.post('/api/counselor/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const list = (db as any).counselorNotifications || [];
  const notif = list.find((n: any) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDb();
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Notification not found.' });
  }
});

// ----------------------------------------------------
// ADMIN CONTROL PANEL ROUTES
// ----------------------------------------------------

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: db.users.length,
    activeIntegrations: 3,
    systemUptime: '99.98%',
    modelHealth: 'Optimal',
    apiUsageTrend: [
      { date: 'Mon', count: 120 },
      { date: 'Tue', count: 145 },
      { date: 'Wed', count: 210 },
      { date: 'Thu', count: 180 },
      { date: 'Fri', count: 240 },
      { date: 'Sat', count: 85 },
      { date: 'Sun', count: 90 }
    ]
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json(db.auditLogs);
});

app.get('/api/admin/users', (req, res) => {
  res.json(db.users.map(sanitizeUser));
});

app.post('/api/admin/users', (req, res) => {
  const user = {
    ...req.body,
    id: `EP-${req.body.role?.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'active',
    isLocked: false,
    createdAt: new Date().toISOString(),
    lastLogin: ''
  };
  db.users.push(user);
  saveDb();
  res.json(sanitizeUser(user));
});

app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const index = db.users.findIndex(u => u.id === id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...req.body };
    saveDb();
    res.json(db.users[index]);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  db.users = db.users.filter(u => u.id !== id);
  saveDb();
  res.json({ id });
});

app.get('/api/admin/system/status', (req, res) => {
  res.json({
    cpu: Math.round(15 + Math.random() * 10) + '%',
    memory: Math.round(42 + Math.random() * 5) + '%',
    dbConnections: 8,
    inferenceLatency: '42ms'
  });
});

app.get('/api/admin/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/admin/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDb();
  res.json(db.settings);
});

// ----------------------------------------------------
// AI MODEL & PREDICTIONS (Spring Boot / FastAPI simulated)
// ----------------------------------------------------

app.get('/api/model/metrics', (req, res) => {
  res.json({
    accuracy: 94.8,
    precision: 93.2,
    recall: 91.5,
    f1Score: 92.3,
    datasetSize: 14200,
    version: 'v3.4.1-fastapi',
    confusionMatrix: {
      tp: 420,
      tn: 850,
      fp: 31,
      fn: 39
    }
  });
});

app.get('/api/predictions/history', (req, res) => {
  res.json(db.predictionHistory);
});

app.post('/api/predict', async (req, res) => {
  const {
    name = 'Anonymous Student',
    studentId = `STU-${Math.floor(100000 + Math.random() * 900000)}`,
    cgpa,
    attendance,
    backlogs,
    completedAssignments,
    scholarship,
    financialStatus,
    behavioralScore,
    counselingSessions
  } = req.body;

  // Real Mathematical Core Predictor Equation
  const attFactor = (80 - attendance) * 0.8;
  const cgpaDiff = 7.5 - cgpa;
  const cgpaFactor = cgpaDiff * 15;
  const backlogFactor = backlogs * 15;
  const assignFactor = (85 - completedAssignments) * 0.5;
  const finFactor = financialStatus === 'low' ? 14 : financialStatus === 'high' ? -6 : 2;
  const scholFactor = scholarship ? -8 : 4;
  const behaviorFactor = (7 - behavioralScore) * 3;
  const counselingFactor = -Math.min(counselingSessions * 3.5, 14);

  let baseProb = 35 + attFactor + cgpaFactor + backlogFactor + assignFactor + finFactor + scholFactor + behaviorFactor + counselingFactor;
  const dropoutProbability = Math.min(Math.max(Math.round(baseProb), 4), 98);
  const confidenceScore = Math.min(Math.max(Math.round(85 + (attendance > 70 ? 5 : -5) + (cgpa > 6.0 ? 3 : -3)), 78), 98);

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (dropoutProbability >= 85) riskLevel = 'critical';
  else if (dropoutProbability >= 60) riskLevel = 'high';
  else if (dropoutProbability >= 30) riskLevel = 'medium';

  const shapData = [
    { feature: 'attendance', displayName: 'Class Attendance Rate', value: `${attendance}%`, contribution: Math.round(attFactor), direction: attFactor >= 0 ? 'supports_dropout' : 'supports_graduation' },
    { feature: 'cgpa', displayName: 'Academic CGPA Indicator', value: cgpa.toString(), contribution: Math.round(cgpaFactor), direction: cgpaFactor >= 0 ? 'supports_dropout' : 'supports_graduation' },
    { feature: 'backlogs', displayName: 'Active Academic Backlogs', value: backlogs.toString(), contribution: Math.round(backlogFactor), direction: backlogFactor >= 0 ? 'supports_dropout' : 'supports_graduation' },
    { feature: 'assignments', displayName: 'Assignment Submission Rate', value: `${completedAssignments}%`, contribution: Math.round(assignFactor), direction: assignFactor >= 0 ? 'supports_dropout' : 'supports_graduation' }
  ];

  let recommendations = [
    { id: 'REC-1', category: 'attendance', title: 'Target Class Attendance', description: 'Recover Algorithms or Core papers to 75% immediately.', priority: 'high', actionLabel: 'View Schedule' },
    { id: 'REC-2', category: 'study', title: 'Academic Peer Support group', description: 'Schedule structural tutoring hours with Counselor Thorne.', priority: 'medium', actionLabel: 'Join Session' }
  ];

  // Try to generate tailored strategies using Gemini API
  const gemini = getAiClient();
  let aiInsights: string | null = null;

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze academic risk indicators for a student: Name: ${name}, CGPA: ${cgpa}, Attendance: ${attendance}%, Backlogs: ${backlogs}, Dropout Probability Calculated: ${dropoutProbability}%. Describe 3 distinct educational recovery strategies that their counselor can implement immediately. Produce response in clean scannable Markdown with bullet points.`,
      });
      aiInsights = response.text || '';
    } catch (err) {
      console.error('Gemini insights creation failed, proceeding with rule-based recommendations.', err);
    }
  }

  const result = {
    id: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
    studentName: name,
    studentId,
    dropoutProbability,
    riskScore: dropoutProbability,
    riskLevel,
    predictionConfidence: confidenceScore,
    shapValues: shapData,
    recommendations,
    aiInsights: aiInsights || `### Student Performance Diagnostic

* **Attendance Review**: The student rate of **${attendance}%** is a leading driver for academic friction.
* **Course Support**: Setting up a **study contract** targeting backlogs reduction can recover performance.
* **Intervention**: We recommend booking **${counselingSessions + 1}** Counseling sessions to monitor GPA curves closely.`,
    date: new Date().toISOString()
  };

  // Add to prediction history
  db.predictionHistory.unshift({
    id: result.id,
    studentName: name,
    date: result.date,
    riskScore: dropoutProbability,
    riskLevel,
    attendance,
    cgpa,
    counselingSessions,
    modelVersion: 'v3.4.1-fastapi'
  });
  saveDb();

  res.json(result);
});

// ----------------------------------------------------
// GEMINI INTELLIGENCE API ENDPOINTS
// ----------------------------------------------------

app.post('/api/ai/chat', async (req, res) => {
  const { message, history = [], systemInstruction, enableSearch = false, enableThinking = false } = req.body;
  const gemini = getAiClient();
  if (!gemini) {
    return res.status(500).json({ error: 'Gemini API client not initialized. Please ensure your GEMINI_API_KEY is configured in your secrets.' });
  }

  try {
    // Choose model based on thinking mode request
    const model = enableThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';

    const config: any = {
      systemInstruction: systemInstruction || "You are EduPredict, a helpful university AI assistant.",
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (enableThinking) {
      config.thinkingConfig = {
        thinkingBudget: 2048,
        thinkingLevel: 'HIGH'
      };
    }

    // Format history to match Gemini's structure
    const contents = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await gemini.models.generateContent({
      model,
      contents,
      config
    });

    let thinkingText = '';
    try {
      const candidate = response.candidates?.[0];
      if (candidate?.thinkingProcess?.parts?.[0]?.text) {
        thinkingText = candidate.thinkingProcess.parts[0].text;
      }
    } catch (e) {
      // ignore
    }

    res.json({
      text: response.text || '',
      thinking: thinkingText
    });
  } catch (err: any) {
    console.error('Gemini Chat API Error:', err);
    res.status(500).json({ error: err.message || 'Error communicating with Gemini' });
  }
});

app.post('/api/ai/transcribe', async (req, res) => {
  const { audio, mimeType } = req.body;
  if (!audio) {
    return res.status(400).json({ error: 'No audio data received' });
  }

  const gemini = getAiClient();
  if (!gemini) {
    return res.status(500).json({ error: 'Gemini API client not initialized' });
  }

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: audio,
            mimeType: mimeType || 'audio/webm'
          }
        },
        'Transcribe this audio clip precisely as spoken. Provide ONLY the raw transcription without any headers, introductions, or pleasantries.'
      ]
    });

    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Gemini Audio Transcription Error:', err);
    res.status(500).json({ error: err.message || 'Error transcribing audio' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION SERVING & WEBSOCKET SETUP
// ----------------------------------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs) => {
  console.log('Client connected to Live API WebSocket');
  const aiClient = getAiClient();
  if (!aiClient) {
    console.error('Gemini API key is not configured for Live API');
    clientWs.send(JSON.stringify({ error: 'Gemini API key is not configured' }));
    clientWs.close();
    return;
  }

  try {
    const session = await aiClient.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: "You are EduPredict, an empathetic, helpful, and supportive AI counselor for university students. You help guide students who are feeling overwhelmed or are at risk of dropping out by offering actionable, comforting, and encouraging advice. Keep responses concise and natural for a voice conversation.",
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message from client', err);
      }
    });

    clientWs.on("close", () => {
      console.log('Client closed Live API connection');
      try {
        session.close();
      } catch (err) {
        // ignore
      }
    });
  } catch (err) {
    console.error('Failed to establish Live API connection with Gemini', err);
    clientWs.send(JSON.stringify({ error: 'Failed to establish Live API connection' }));
    clientWs.close();
  }
});

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Mounting Vite HMR Fallback Middlewares for development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPredict Full-Stack Server online at: http://localhost:${PORT}`);
  });
}

start();
