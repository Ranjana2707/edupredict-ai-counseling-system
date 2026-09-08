import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  SlidersHorizontal,
  Calendar,
  GraduationCap,
  FileText,
  FileDown,
  Filter,
  Check,
  X,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getRiskColorClass } from '../utils';
import {
  useFacultyStudents,
  useFacultyStats,
  useFacultySubjects,
  useBulkUpdateAttendance,
  useUpdateStudentMarks,
  useFacultyAssignments,
  useGenerateReport
} from '../hooks/useFacultyData';
import { StudentDetailsDrawer } from '../components/faculty/StudentDetailsDrawer';
import { UploadDialog } from '../components/faculty/UploadDialog';
import { CreateAssignmentDialog } from '../components/faculty/CreateAssignmentDialog';

import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router';
import { CounselorStudentsPage } from '../components/counselor/CounselorStudentsPage';

export default function StudentsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const viewStudentId = queryParams.get('viewStudentId');

  const handleClearViewStudentId = () => {
    const params = new URLSearchParams(location.search);
    params.delete('viewStudentId');
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleScheduleSession = (id: string, name: string) => {
    navigate(`/counseling-logs?tab=sessions&scheduleStudentId=${id}&scheduleStudentName=${encodeURIComponent(name)}`);
  };

  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'marks' | 'assignments' | 'reports'>('directory');

  // Directory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [sortBy, setSortBy] = useState<string>('risk_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Student for Detail Drawer
  const [drawerStudent, setDrawerStudent] = useState<any>(null);

  // Modal Triggers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  // Bulk Attendance States
  const [bulkSubject, setBulkSubject] = useState('CS-301');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, boolean>>({});

  // Bulk Marks Entry States
  const [marksSubject, setMarksSubject] = useState('CS-301');
  const [marksInputs, setMarksInputs] = useState<Record<string, string>>({});

  // Hooks data
  const { data: students, isLoading } = useFacultyStudents();
  const { data: stats } = useFacultyStats();
  const { data: subjects } = useFacultySubjects();
  const { data: assignments } = useFacultyAssignments();

  const bulkAttendanceMutation = useBulkUpdateAttendance();
  const updateMarksMutation = useUpdateStudentMarks();
  const generateReportMutation = useGenerateReport();

  // Listen for viewStudentId from routing (global search)
  React.useEffect(() => {
    if (viewStudentId && students) {
      const found = students.find((s: any) => s.id === viewStudentId);
      if (found) {
        setActiveTab('directory');
        setDrawerStudent(found);
        handleClearViewStudentId();
      }
    }
  }, [viewStudentId, students]);

  if (isLoading || !students || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-container animate-pulse rounded-md w-1/4" />
        <div className="h-96 bg-surface-container animate-pulse rounded-lg" />
      </div>
    );
  }

  if (user?.role === 'counselor') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cohort Student Directory"
          description="Access detailed biometric history logs, ML analytical scores, and academic support matrices."
          breadcrumbs={[{ label: 'Assigned Cohort', path: '/students' }]}
        />
        <CounselorStudentsPage
          onScheduleSessionForId={handleScheduleSession}
          selectedStudentId={viewStudentId}
          onClearSelectedStudentId={handleClearViewStudentId}
        />
      </div>
    );
  }

  // --- FILTERS, SEARCH & SORTING ---
  const getRiskScore = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    let result = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'all' || student.department === selectedDept;
      const matchesSemester = selectedSemester === 'all' || student.semester === selectedSemester;
      const matchesRisk = selectedRisk === 'all' || student.riskLevel === selectedRisk;

      return matchesSearch && matchesDept && matchesSemester && matchesRisk;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'risk_desc':
          return getRiskScore(b.riskLevel) - getRiskScore(a.riskLevel);
        case 'risk_asc':
          return getRiskScore(a.riskLevel) - getRiskScore(b.riskLevel);
        case 'cgpa_desc':
          return b.cgpa - a.cgpa;
        case 'cgpa_asc':
          return a.cgpa - b.cgpa;
        case 'attendance_desc':
          return b.attendance - a.attendance;
        case 'attendance_asc':
          return a.attendance - b.attendance;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return getRiskScore(b.riskLevel) - getRiskScore(a.riskLevel);
      }
    });

    return result;
  }, [students, searchQuery, selectedDept, selectedSemester, selectedRisk, sortBy]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // Initialize Bulk Attendance State
  const initBulkAttendance = () => {
    const init: Record<string, boolean> = {};
    students.forEach((s) => {
      init[s.id] = true; // default present
    });
    setAttendanceRecords(init);
  };

  const handleBulkAttendanceSubmit = async () => {
    const records = Object.entries(attendanceRecords).map(([studentId, present]) => ({
      studentId,
      present: !!present,
    }));
    await bulkAttendanceMutation.mutateAsync({
      subjectCode: bulkSubject,
      records,
    });
  };

  const handleSingleMarkSave = async (studentId: string) => {
    const scoreStr = marksInputs[studentId];
    if (!scoreStr) return;
    const score = parseFloat(scoreStr);
    if (isNaN(score) || score < 0 || score > 100) return;

    await updateMarksMutation.mutateAsync({
      studentId,
      subjectCode: marksSubject,
      internalMarks: score,
    });
  };

  const handleGenerateReport = (type: 'student' | 'attendance' | 'marks' | 'risk') => {
    generateReportMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Cohort Records"
        description="Comprehensive academic directory, performance indicators, dynamic attendance, internal marks, and automated reports."
        breadcrumbs={[{ label: 'Students', path: '/students' }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setIsUploadOpen(true)} variant="outline" size="sm" className="h-9 text-xs font-bold gap-1.5">
              <FileDown className="h-4 w-4" /> Import CSV
            </Button>
            <Button onClick={() => setIsAssignmentOpen(true)} size="sm" className="h-9 text-xs font-bold gap-1.5">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </div>
        }
      />

      {/* Main Tab Switcher bar */}
      <div className="flex border-b border-outline-variant/60 gap-1.5 overflow-x-auto select-none bg-surface-container-low/50 p-1 rounded-lg">
        {[
          { id: 'directory', label: 'Cohort Directory', icon: Users },
          { id: 'attendance', label: 'Bulk Attendance Entry', icon: Calendar },
          { id: 'marks', label: 'Academic Marks Board', icon: GraduationCap },
          { id: 'assignments', label: 'Assignments Hub', icon: FileText },
          { id: 'reports', label: 'Report Generator', icon: ClipboardList },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'attendance') initBulkAttendance();
              }}
              className={`flex items-center gap-2 px-lg py-2.5 font-sans text-xs font-extrabold rounded-md transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DIRECTORY VIEW */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Advanced Search & Filtering Controls */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-3 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by enrollment ID, name or email..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Filters toggle/indicators */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Dept</span>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold"
                  >
                    <option value="all">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Sem</span>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold"
                  >
                    <option value="all">All Semesters</option>
                    <option value="6th Semester">6th Semester</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Risk</span>
                  <select
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold cursor-pointer"
                  >
                    <option value="risk_desc">Risk: High to Low</option>
                    <option value="risk_asc">Risk: Low to High</option>
                    <option value="cgpa_desc">CGPA: High to Low</option>
                    <option value="cgpa_asc">CGPA: Low to High</option>
                    <option value="attendance_desc">Attendance: High to Low</option>
                    <option value="attendance_asc">Attendance: Low to High</option>
                    <option value="name_asc">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Directory Ledger */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-container/60 border-b border-outline-variant/50">
                    <tr>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Enrollment Details</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Department & Semester</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">CGPA Score</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Attendance %</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Risk Tag</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Telemetry Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-surface-container/40 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                                {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                              </div>
                              <div>
                                <p className="font-sans font-extrabold text-on-surface">{student.name}</p>
                                <p className="font-sans text-[10px] text-on-surface-variant font-medium">ID: {student.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-on-surface">
                            <span className="block">{student.department}</span>
                            <span className="text-[10px] text-on-surface-variant block mt-0.5">{student.semester}</span>
                          </td>
                          <td className="p-4 text-center font-mono font-black">{student.cgpa}</td>
                          <td className="p-4 text-center font-mono font-black">{student.attendance}%</td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getRiskColorClass(student.riskLevel)}`}>
                              {student.riskLevel}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              onClick={() => setDrawerStudent(student)}
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-[11px] font-bold"
                            >
                              Explore Record
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          No matching student profiles found under active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-lg border-t border-outline-variant/40">
                  <span className="font-sans text-[10px] text-on-surface-variant font-bold uppercase select-none">
                    Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} Students
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-mono text-xs font-extrabold self-center px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* BULK ATTENDANCE VIEW */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-extrabold uppercase">Daily Lab & Lecture Register</CardTitle>
                <CardDescription>Select subject course and apply bulk daily presence updates</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Course:</span>
                <select
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold focus:outline-primary"
                >
                  <option value="CS-301">CS-301: Advanced Algorithms</option>
                  <option value="CS-304">CS-304: Distributed Systems</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container/60">
                  <tr>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant">Student</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant">Email</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Current Attend %</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Attendance Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container/20 transition">
                      <td className="p-4 font-sans font-bold text-on-surface">{student.name}</td>
                      <td className="p-4 text-on-surface-variant">{student.email}</td>
                      <td className="p-4 text-center font-mono font-bold">{student.attendance}%</td>
                      <td className="p-4 text-right">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceRecords[student.id] !== false}
                            onChange={(e) => {
                              setAttendanceRecords((prev) => ({
                                ...prev,
                                [student.id]: e.target.checked,
                              }));
                            }}
                            className="h-4.5 w-4.5 rounded border-outline text-primary focus:ring-primary"
                          />
                          <span className="font-sans text-xs font-bold text-on-surface-variant">
                            {attendanceRecords[student.id] !== false ? 'Present' : 'Absent'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-lg border-t border-outline-variant/40 flex justify-end">
                <Button
                  onClick={handleBulkAttendanceSubmit}
                  disabled={bulkAttendanceMutation.isPending}
                  className="h-10 text-xs font-bold px-6"
                >
                  {bulkAttendanceMutation.isPending ? 'Syncing...' : 'Save Bulk Attendance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ACADEMIC MARKS BOARD VIEW */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-extrabold uppercase">Internal Marks Ledger Board</CardTitle>
                <CardDescription>Input and update class midterm internal marks directly</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-bold text-on-surface-variant uppercase">Course:</span>
                <select
                  value={marksSubject}
                  onChange={(e) => setMarksSubject(e.target.value)}
                  className="text-xs h-9 bg-surface-container border border-outline rounded px-2 text-on-surface font-semibold focus:outline-primary"
                >
                  <option value="CS-301">CS-301: Advanced Algorithms</option>
                  <option value="CS-304">CS-304: Distributed Systems</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container/60">
                  <tr>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant">Student</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant">CGPA</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Recorded Internal Score (out of 100)</th>
                    <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Update score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {students.map((student) => {
                    const existingMark = student.subjectMarks.find((m) => m.subjectCode === marksSubject)?.internalMarks ?? 'N/A';
                    return (
                      <tr key={student.id} className="hover:bg-surface-container/20 transition">
                        <td className="p-4 font-sans font-bold text-on-surface">{student.name}</td>
                        <td className="p-4 font-mono font-bold text-on-surface-variant">{student.cgpa}</td>
                        <td className="p-4 text-center font-mono font-black text-primary">{existingMark}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Add score"
                              value={marksInputs[student.id] ?? ''}
                              onChange={(e) => {
                                setMarksInputs((prev) => ({
                                  ...prev,
                                  [student.id]: e.target.value,
                                }));
                              }}
                              className="w-24 h-8 text-xs text-center"
                            />
                            <Button
                              onClick={() => handleSingleMarkSave(student.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-[11px] font-bold"
                            >
                              Save
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ASSIGNMENTS HUB VIEW */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/30">
              <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Active Assignments</span>
              <span className="block font-sans text-2xl font-black text-on-surface mt-1">
                {assignments?.filter((a) => a.status === 'active').length || 0}
              </span>
            </div>
            <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/30">
              <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Graded Assignments</span>
              <span className="block font-sans text-2xl font-black text-on-surface mt-1">
                {assignments?.filter((a) => a.status === 'graded').length || 0}
              </span>
            </div>
            <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/30">
              <span className="block font-sans text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Submissions Target</span>
              <span className="block font-sans text-2xl font-black text-on-surface mt-1">110 / class</span>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold uppercase">Broadcasted Course Homework</CardTitle>
                <CardDescription>Track submission metrics, active status and grade outcomes</CardDescription>
              </div>
              <Button onClick={() => setIsAssignmentOpen(true)} size="sm" className="h-8 text-[11px] font-bold gap-1.5">
                <Plus className="h-4 w-4" /> Publish Assignment
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-container/60">
                    <tr>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Assignment Title</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Course Code</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant">Due Date</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Submissions Score</th>
                      <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {assignments?.map((ass) => (
                      <tr key={ass.id} className="hover:bg-surface-container/20 transition">
                        <td className="p-4 font-sans font-bold text-on-surface">{ass.title}</td>
                        <td className="p-4 font-mono font-bold text-primary">{ass.subjectCode}</td>
                        <td className="p-4 font-mono font-semibold text-on-surface-variant">{ass.dueDate}</td>
                        <td className="p-4 text-center font-semibold text-on-surface">
                          {ass.totalSubmissions} uploaded / {ass.pendingSubmissions} pending
                        </td>
                        <td className="p-4 text-right">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            ass.status === 'graded' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' : 'bg-amber-500/10 text-amber-600 border-amber-500/15'
                          }`}>
                            {ass.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* REPORTS GENERATOR VIEW */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-extrabold uppercase">Enterprise Academic Report Generator</CardTitle>
              <CardDescription>Compile real-time class metrics, student risk metrics, and export records safely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF Student Report card */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="font-sans text-[10px] text-primary font-bold uppercase tracking-wider block">Class Performance Ledger</span>
                    <h4 className="font-sans text-sm font-extrabold text-on-surface">Comprehensive Students Index Report</h4>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Compiles complete metadata containing class lists, GPAs, individual overall attendance, and current risk status.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateReport('student')} className="h-9 text-xs font-bold gap-1.5" disabled={generateReportMutation.isPending}>
                      <FileDown className="h-4 w-4" /> Excel Export
                    </Button>
                  </div>
                </div>

                {/* PDF Attendance report card */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="font-sans text-[10px] text-primary font-bold uppercase tracking-wider block">Cohort Presence Registry</span>
                    <h4 className="font-sans text-sm font-extrabold text-on-surface">Presence Trend & Warning Report</h4>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Compiles student attendance percentages, highlights students with active warnings below 75%, and graphs subject-wise attendance averages.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateReport('attendance')} className="h-9 text-xs font-bold gap-1.5" disabled={generateReportMutation.isPending}>
                      <FileDown className="h-4 w-4" /> Excel Export
                    </Button>
                  </div>
                </div>

                {/* PDF Marks report card */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="font-sans text-[10px] text-primary font-bold uppercase tracking-wider block">Internal Scoring Summary</span>
                    <h4 className="font-sans text-sm font-extrabold text-on-surface">Subject-wise Class Performance Report</h4>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Generates subject internal mark lists, class grade curve averages, and tracks performance trends relative to overall CGPA limits.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateReport('marks')} className="h-9 text-xs font-bold gap-1.5" disabled={generateReportMutation.isPending}>
                      <FileDown className="h-4 w-4" /> Excel Export
                    </Button>
                  </div>
                </div>

                {/* PDF Risk report card */}
                <div className="bg-surface-container p-lg rounded-lg border border-outline-variant/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="font-sans text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">ML Predictive Telemetry</span>
                    <h4 className="font-sans text-sm font-extrabold text-on-surface">Dropout Prediction & Intervention Risk Report</h4>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Compiles high & medium risk profiles, prediction confidence weights, principal risk drivers, and timeline indicators for proactive counseling.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateReport('risk')} className="h-9 text-xs font-bold gap-1.5" disabled={generateReportMutation.isPending}>
                      <FileDown className="h-4 w-4" /> Excel Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drawers and Dialogs */}
      <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <CreateAssignmentDialog isOpen={isAssignmentOpen} onClose={() => setIsAssignmentOpen(false)} />
      <StudentDetailsDrawer
        student={drawerStudent}
        isOpen={drawerStudent !== null}
        onClose={() => setDrawerStudent(null)}
      />
    </div>
  );
}
