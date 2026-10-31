import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-use-env-var';
const JWT_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [`http://localhost:${PORT}`])
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

// User Data Sanitizer (Strips password hash/plaintext before JSON response)
function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

const SENSITIVE_FIELDS = ['password', 'otp', 'refreshToken', 'token', 'secret', 'apiKey'];
function redact(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.includes(k)) continue;
    out[k] = redact(v);
  }
  return out;
}

function logAudit(type: string, message: string, severity: string = 'info', user?: string) {
  const entry = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    user: user || 'system',
    severity,
  };
  try {
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift(entry);
    if (db.auditLogs.length > 1000) db.auditLogs = db.auditLogs.slice(0, 1000);
    saveDb();
  } catch (e) {
    console.error('Audit log failed', e);
  }
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function signRefreshToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function authorize(...allowedRoles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

function validateEmail(email: any): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeCsvValue(value: string): string {
  if (/^[=+\-@\t\r\n].*/.test(value)) {
    return "'" + value;
  }
  return value;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
// AI MODEL & PREDICTIONS
// Architecture: Express -> Python FastAPI ML Service -> Random Forest .pkl
// ----------------------------------------------------

// Real model metrics from model_metadata.json (Random Forest Classifier)
app.get('/api/model/metrics', (req, res) => {
  res.json({
    accuracy: 82.80,
    precision: 87.56,
    recall: 66.25,
    f1Score: 75.43,
    rocAuc: 90.76,
    datasetSize: 10000,
    version: 'v1.0.0-random-forest',
    modelType: 'Random Forest Classifier',
    trainingDataset: 'AKTU_AI_Dropout_Prediction_Dataset.csv',
    confusionMatrix: {
      tp: 420,
      tn: 850,
      fp: 60,
      fn: 214
    }
  });
});

app.get('/api/predictions/history', (req, res) => {
  res.json(db.predictionHistory);
});

// -------------------------------------------------------------------------
// POST /api/predict
//
// Flow:
//   1. Receive frontend payload (branch, semester, attendance, assignments,
//      cgpa, backlogs, plus studentId / name for display)
//   2. Forward the six ML features to the Python FastAPI ML service
//      running at http://127.0.0.1:5001/predict
//   3. Use the real model's dropout probability and risk level
//   4. Call Gemini for personalised counselling recommendations
//   5. Save the prediction record to data/db.json
//   6. Return a result object that the frontend can display
// -------------------------------------------------------------------------
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
const ML_SERVICE_TIMEOUT_MS = 10000; // 10 seconds

app.post('/api/predict', async (req, res) => {
  const {
    name = 'Anonymous Student',
    studentId = `STU-${Math.floor(100000 + Math.random() * 900000)}`,
    branch,
    semester,
    cgpa,
    attendance,
    assignments,
    backlogs,
    counselingSessions = 0,
  } = req.body;

  // -- 1. Validate required ML features ------------------------------------
  const missingFields: string[] = [];
  if (!branch) missingFields.push('branch');
  if (semester === undefined || semester === null) missingFields.push('semester');
  if (cgpa === undefined || cgpa === null) missingFields.push('cgpa');
  if (attendance === undefined || attendance === null) missingFields.push('attendance');
  if (assignments === undefined || assignments === null) missingFields.push('assignments');
  if (backlogs === undefined || backlogs === null) missingFields.push('backlogs');

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required prediction features: ${missingFields.join(', ')}`,
      missingFields
    });
  }

  // -- 2. Call the Python ML service ---------------------------------------
  let mlResult: {
    prediction: number;
    dropout_probability: number;
    dropout_probability_percent: number;
    risk_level: string;
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_SERVICE_TIMEOUT_MS);

    const mlPayload = {
      Branch: branch,
      Semester: Number(semester),
      'Attendance (%)': Number(attendance),
      'Assignments Written (%)': Number(assignments),
      CGPA: Number(cgpa),
      Backlogs: Number(backlogs),
    };

    const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!mlResponse.ok) {
      const errBody = await mlResponse.text();
      console.error('[ML Service] Non-OK response:', mlResponse.status, errBody);
      return res.status(502).json({
        message: 'ML inference service returned an error. Ensure ml-service is running.',
        detail: errBody,
      });
    }

    mlResult = await mlResponse.json() as typeof mlResult;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('[ML Service] Request timed out after', ML_SERVICE_TIMEOUT_MS, 'ms');
      return res.status(504).json({
        message: 'ML inference service timed out. Start ml-service/start.bat and retry.',
      });
    }
    console.error('[ML Service] Connection error:', err.message);
    return res.status(503).json({
      message: 'ML inference service is unavailable. Start ml-service/start.bat before making predictions.',
      detail: err.message,
    });
  }

  // -- 3. Map ML output to application risk scale (0-100) -----------------
  const dropoutProbability = Math.round(mlResult.dropout_probability_percent);
  const riskLevelRaw = mlResult.risk_level.toLowerCase();
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskLevelRaw === 'high' && dropoutProbability >= 85) riskLevel = 'critical';
  else if (riskLevelRaw === 'high') riskLevel = 'high';
  else if (riskLevelRaw === 'medium') riskLevel = 'medium';
  else riskLevel = 'low';

  // -- 4. Feature importance indicators (SHAP pending next stage) ----------
  // Note: Full SHAP computation is deferred to the next integration stage.
  // These values are derived from the input data for display purposes only.
  const shapData = [
    {
      feature: 'attendance',
      displayName: 'Class Attendance Rate',
      value: `${attendance}%`,
      contribution: Math.round((75 - Number(attendance)) * 0.6),
      direction: Number(attendance) < 75 ? 'supports_dropout' : 'supports_graduation',
    },
    {
      feature: 'cgpa',
      displayName: 'Academic CGPA',
      value: cgpa.toString(),
      contribution: Math.round((5.0 - Number(cgpa)) * 8),
      direction: Number(cgpa) < 5.0 ? 'supports_dropout' : 'supports_graduation',
    },
    {
      feature: 'backlogs',
      displayName: 'Active Backlogs',
      value: backlogs.toString(),
      contribution: Math.round(Number(backlogs) * 12),
      direction: Number(backlogs) > 0 ? 'supports_dropout' : 'supports_graduation',
    },
    {
      feature: 'assignments',
      displayName: 'Assignment Completion Rate',
      value: `${assignments}%`,
      contribution: Math.round((75 - Number(assignments)) * 0.4),
      direction: Number(assignments) < 75 ? 'supports_dropout' : 'supports_graduation',
    },
  ];

  // -- 5. Gemini counselling recommendations --------------------------------
  const gemini = getAiClient();
  let aiInsights: string | null = null;

  if (gemini) {
    try {
      const geminiPrompt = `You are a compassionate academic counselor at an Indian engineering university.
A student has been assessed by our AI dropout prediction system.

Student Details:
- Name: ${name}
- Branch: ${branch}
- Semester: ${semester}
- Attendance: ${attendance}%
- Assignment Completion: ${assignments}%
- CGPA: ${cgpa}
- Active Backlogs: ${backlogs}

AI Model Result:
- Dropout Probability: ${mlResult.dropout_probability_percent}%
- Risk Level: ${mlResult.risk_level}

Please provide 3 specific, actionable counseling strategies the academic counselor can use immediately.
Format your response in clean Markdown with bullet points. Keep it practical and empathetic.`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: geminiPrompt,
      });
      aiInsights = response.text || '';
    } catch (err) {
      console.error('[Gemini] Counselling insights generation failed:', err);
    }
  }

  const fallbackInsights = `### Counselling Recommendations for ${name}\n\n* **Attendance Recovery**: Current attendance of **${attendance}%** ${Number(attendance) < 75 ? 'is below the 75% minimum. Create a weekly attendance commitment plan.' : 'is satisfactory. Maintain consistency.'}\n* **Academic Support**: ${Number(backlogs) > 0 ? `Address **${backlogs} active backlog(s)** urgently. Connect with peer tutors or supplementary classes.` : 'No active backlogs — reinforce current study habits.'}\n* **Progress Review**: Schedule a follow-up in **2 weeks** to review CGPA and assignment completion trends.`;

  // -- 6. Assemble result object -------------------------------------------
  const predictionId = `PRD-${Math.floor(100000 + Math.random() * 900000)}`;
  const predictionDate = new Date().toISOString();

  // Recommendations with backward and forward compatibility
  const recList = [
    {
      id: 'REC-1',
      category: (riskLevel === 'high' || riskLevel === 'critical' ? 'attendance' : 'study_plan') as any,
      title: riskLevel === 'high' || riskLevel === 'critical' ? 'Immediate Counselling Required' : 'Academic Performance Monitoring',
      description: riskLevel === 'high' || riskLevel === 'critical'
        ? 'Schedule an urgent counselling session. Student is at high risk of dropping out.'
        : 'Continue regular check-ins. Student shows stable academic engagement.',
      recommendation: riskLevel === 'high' || riskLevel === 'critical'
        ? 'Schedule immediate 1-on-1 academic counselling and attendance recovery contract.'
        : 'Maintain bi-weekly mentor check-in and track ongoing coursework progress.',
      priority: (riskLevel === 'high' || riskLevel === 'critical' ? 'high' : 'medium') as any,
      expectedImprovement: 'Estimated 15-20% risk mitigation over next 4 weeks',
      actionLabel: 'Book Session',
    },
    {
      id: 'REC-2',
      category: 'academic' as const,
      title: Number(backlogs) > 0 ? 'Backlog Clearance Plan' : 'Grade Improvement Strategy',
      description: Number(backlogs) > 0
        ? `Student has ${backlogs} active backlog(s). Connect with subject teachers for remedial support.`
        : 'Encourage participation in advanced seminars to strengthen CGPA.',
      recommendation: Number(backlogs) > 0
        ? `Enroll in targeted remedial modules to clear ${backlogs} backlogs before end-of-term exams.`
        : 'Continue current self-study rhythm and join departmental peer mentoring group.',
      priority: (Number(backlogs) > 1 ? 'high' : 'medium') as any,
      expectedImprovement: Number(backlogs) > 0 ? 'Clear active backlogs to stabilize academic standing' : 'Maintain consistent CGPA growth',
      actionLabel: 'View Plan',
    },
  ];

  // Structured matrix insights for UI InsightsPanel
  const insightsMatrix = {
    strengths: [
      Number(cgpa) >= 7.0 ? `Strong academic standing with CGPA of ${cgpa}` : `Enrolled in active engineering curriculum (${branch})`,
      Number(attendance) >= 75 ? `Good lecture attendance rate (${attendance}%)` : `Documented assignment activity (${assignments}%)`,
      Number(backlogs) === 0 ? 'Clean academic record with 0 active backlogs' : `Engaged across semester ${semester} coursework`,
    ],
    weaknesses: [
      Number(attendance) < 75 ? `Attendance is below statutory 75% requirement (${attendance}%)` : 'Needs continuous consistency in regular attendance',
      Number(backlogs) > 0 ? `Has ${backlogs} active backlog(s) accumulating academic friction` : 'Must maintain momentum through upcoming final examinations',
      Number(assignments) < 70 ? `Assignment submission rate is low (${assignments}%)` : 'Higher course depth requires increased project involvement',
    ],
    keyRiskFactors: [
      Number(attendance) < 70 ? `Critical attendance deficit (${attendance}%)` : `Dropout probability calculated by Random Forest: ${dropoutProbability}%`,
      Number(backlogs) > 0 ? `Unresolved backlog count: ${backlogs}` : `Academic risk classification: ${riskLevel.toUpperCase()}`,
    ],
    positiveIndicators: [
      `Real Random Forest ML Model inference version v1.0.0 active`,
      Number(cgpa) >= 6.0 ? `Passed fundamental prerequisites with CGPA ${cgpa}` : `Faculty advising cohort assigned`,
    ],
    areasForImprovement: [
      Number(attendance) < 75 ? 'Attend mandatory lecture blocks to cross 75% boundary' : 'Maintain consistent class engagement',
      Number(backlogs) > 0 ? 'Prepare structured backlog clearance timeline' : 'Continue strengthening technical foundation',
    ],
  };

  const historicalTrend = [
    { date: 'Month -3', riskScore: Math.max(10, dropoutProbability - 12), attendance: Math.min(100, Number(attendance) + 6), cgpa: Number(cgpa), counselingSessions: 0 },
    { date: 'Month -2', riskScore: Math.max(15, dropoutProbability - 6), attendance: Math.min(100, Number(attendance) + 3), cgpa: Number(cgpa), counselingSessions: 1 },
    { date: 'Current', riskScore: dropoutProbability, attendance: Number(attendance), cgpa: Number(cgpa), counselingSessions: Number(counselingSessions) },
  ];

  const result = {
    id: predictionId,
    predictionId,
    studentName: name,
    studentId,
    predictionStatus: 'Success' as const,
    dropoutProbability,
    riskScore: dropoutProbability,
    riskLevel,
    confidenceScore: 91, // representative of model ROC-AUC (90.76%)
    predictionConfidence: 91,
    predictionTime: predictionDate,
    date: predictionDate,
    modelVersion: 'v1.0.0-random-forest',
    shapData,
    shapValues: shapData,
    recommendations: recList,
    insights: insightsMatrix,
    aiInsights: aiInsights || fallbackInsights,
    historicalTrend,
    mlServiceOutput: {
      prediction: mlResult.prediction,
      dropout_probability: mlResult.dropout_probability,
      dropout_probability_percent: mlResult.dropout_probability_percent,
      risk_level: mlResult.risk_level,
    },
  };

  // -- 7. Persist to data/db.json ------------------------------------------
  db.predictionHistory.unshift({
    id: predictionId,
    studentName: name,
    date: predictionDate,
    riskScore: dropoutProbability,
    riskLevel,
    attendance: Number(attendance),
    cgpa: Number(cgpa),
    counselingSessions: Number(counselingSessions),
    modelVersion: 'v1.0.0-random-forest',
  });
  saveDb();

  logAudit('prediction', `Dropout prediction generated for ${name} - Risk: ${riskLevel} (${dropoutProbability}%)`, 'info', studentId);

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
