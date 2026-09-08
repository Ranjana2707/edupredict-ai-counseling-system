import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Sparkles,
  Phone,
  SlidersHorizontal,
  Plus,
  BookOpen,
  TrendingDown,
  User,
  ShieldCheck,
  Building,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCounselorStudents, useGenerateCounselorReport } from '../../hooks/useCounselorData';
import { Student360Drawer } from './Student360Drawer';
import { getRiskColorClass } from '../../utils';

interface CounselorStudentsPageProps {
  onScheduleSessionForId?: (id: string, name: string) => void;
  selectedStudentId?: string | null;
  onClearSelectedStudentId?: () => void;
}

export function CounselorStudentsPage({ onScheduleSessionForId, selectedStudentId, onClearSelectedStudentId }: CounselorStudentsPageProps) {
  const { data: students, isLoading } = useCounselorStudents();
  const generateReportMutation = useGenerateCounselorReport();

  // Selected student state for 360 view
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewedStudentId, setViewedStudentId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk_desc'); // risk_desc, attendance_asc, cgpa_asc, name_asc
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sync state if dashboard requested student profile directly
  React.useEffect(() => {
    if (selectedStudentId) {
      setViewedStudentId(selectedStudentId);
      setDrawerOpen(true);
      if (onClearSelectedStudentId) onClearSelectedStudentId();
    }
  }, [selectedStudentId, onClearSelectedStudentId]);

  // Open 360 profile
  const handleOpen360 = (id: string) => {
    setViewedStudentId(id);
    setDrawerOpen(true);
  };

  // Close drawer
  const handleClose360 = () => {
    setDrawerOpen(false);
    setViewedStudentId(null);
  };

  // Extract department/semester lists for filter drop downs
  const uniqueDepts = useMemo(() => {
    if (!students) return [];
    const depts = students.map(s => s.department);
    return Array.from(new Set(depts));
  }, [students]);

  const uniqueSemesters = useMemo(() => {
    if (!students) return [];
    const sems = students.map(s => s.semester);
    return Array.from(new Set(sems));
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    if (!students) return [];

    let result = [...students];

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    // Risk Filter
    if (selectedRisk !== 'all') {
      result = result.filter(s => s.riskLevel === selectedRisk);
    }

    // Department Filter
    if (selectedDept !== 'all') {
      result = result.filter(s => s.department === selectedDept);
    }

    // Semester Filter
    if (selectedSemester !== 'all') {
      result = result.filter(s => s.semester === selectedSemester);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'risk_desc':
          return b.predictionScore - a.predictionScore;
        case 'risk_asc':
          return a.predictionScore - b.predictionScore;
        case 'attendance_asc':
          return a.attendance - b.attendance;
        case 'attendance_desc':
          return b.attendance - a.attendance;
        case 'cgpa_asc':
          return a.cgpa - b.cgpa;
        case 'cgpa_desc':
          return b.cgpa - a.cgpa;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return b.predictionScore - a.predictionScore;
      }
    });

    return result;
  }, [students, searchQuery, selectedRisk, selectedDept, selectedSemester, sortBy]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);

  const handleExportExcel = () => {
    generateReportMutation.mutate('student');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-container animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-surface-container animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/70" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search cohort by name, ID, or email..."
            className="pl-10 h-10 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 h-10"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {showAdvanced ? 'Hide Filters' : 'Filters'}
          </Button>

          <div className="flex items-center gap-2 h-10 border border-outline-variant rounded-md bg-surface-container-lowest px-3">
            <ArrowUpDown className="h-4 w-4 text-on-surface-variant/70 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 font-sans text-xs font-bold text-on-surface focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="risk_desc">Sort: Risk Index High</option>
              <option value="risk_asc">Sort: Risk Index Low</option>
              <option value="attendance_asc">Sort: Attendance Low</option>
              <option value="attendance_desc">Sort: Attendance High</option>
              <option value="cgpa_asc">Sort: CGPA Low</option>
              <option value="cgpa_desc">Sort: CGPA High</option>
              <option value="name_asc">Sort: Student Alphabet</option>
            </select>
          </div>

          <Button
            onClick={handleExportExcel}
            loading={generateReportMutation.isPending}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 h-10 ml-auto md:ml-0"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
            Export Cohort
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-md bg-surface-container-low rounded-lg border border-outline-variant/60 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Risk Level dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Intervention Threat Level</label>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
            >
              <option value="all">All Threat Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          {/* Department filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Academic Major / Dept</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Class Term / Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold p-2 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
            >
              <option value="all">All Semesters</option>
              {uniqueSemesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {/* Cohort Grid */}
      {filteredAndSortedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStudents.map((s) => (
            <Card
              key={s.id}
              hoverable
              className="flex flex-col h-full border border-outline-variant/60 hover:border-primary/30 relative"
            >
              {/* Card Header Info */}
              <div className="p-lg flex items-start justify-between gap-3 border-b border-outline-variant/30">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full border border-outline-variant/60 shrink-0 font-sans font-black text-xs text-primary bg-primary/5 flex items-center justify-center overflow-hidden">
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                      s?.name ? s.name.split(' ').map(n => n[0]).join('') : '?'
                    )}
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm text-on-surface hover:underline cursor-pointer" onClick={() => handleOpen360(s.id)}>
                      {s.name}
                    </h3>
                    <p className="font-mono text-[10px] text-on-surface-variant leading-none mt-1">ID: {s.id}</p>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-semibold mt-1">
                      <Building className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[130px]">{s.department}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${getRiskColorClass(s.riskLevel)}`}>
                  {s.riskLevel}
                </span>
              </div>

              {/* Core Telemetry Info */}
              <div className="p-lg pt-3 flex-1 space-y-3 bg-surface-container/10">
                {/* Prediction Score Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                    <span className="flex items-center gap-1 uppercase tracking-wide"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Dropout Threat Score</span>
                    <span className="font-mono font-black text-xs text-rose-500">{s.predictionScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.predictionScore}%` }} />
                  </div>
                </div>

                {/* Grid for Academic Status */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Attendance summary</span>
                    <span className={`text-xs font-mono font-bold block mt-0.5 ${s.attendance < 75 ? 'text-rose-500 font-extrabold' : 'text-on-surface'}`}>
                      {s.attendance}%
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-2 rounded border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase block">CGPA status</span>
                    <span className="text-xs font-mono font-bold text-on-surface block mt-0.5">
                      {s.cgpa} / 4.0
                    </span>
                  </div>
                </div>

                {/* Scholarship / Financial brief indicator */}
                <div className="flex items-center justify-between text-[10px] font-bold px-2 py-1.5 rounded bg-surface-container-low border border-outline-variant/30">
                  <span className="text-on-surface-variant">Scholarship Status:</span>
                  <span className="text-on-surface truncate max-w-[130px] font-extrabold">{s.scholarshipDetails || 'No Active Grant'}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-lg pb-lg pt-0 flex gap-2.5 bg-surface-container/10 border-t border-outline-variant/20">
                <Button
                  onClick={() => handleOpen360(s.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-bold h-9"
                >
                  View 360° Profile
                </Button>
                {onScheduleSessionForId && (
                  <Button
                    onClick={() => onScheduleSessionForId(s.id, s.name)}
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs font-bold gap-1 h-9"
                  >
                    <Plus className="h-3.5 w-3.5" /> Direct Sync
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-outline-variant rounded-lg">
          <BookOpen className="h-10 w-10 text-on-surface-variant/40 mx-auto" />
          <h4 className="font-sans text-sm font-bold text-on-surface mt-3">No cohort student files matched</h4>
          <p className="text-xs text-on-surface-variant mt-1">Adjust search parameters or risk categories above.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
          <span className="text-xs text-on-surface-variant font-medium">
            Showing Page <strong className="font-black text-on-surface">{currentPage}</strong> of <strong className="font-black text-on-surface">{totalPages}</strong> ({filteredAndSortedStudents.length} entries)
          </span>
          <div className="flex gap-2 select-none">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 360 Degree Drawer */}
      <Student360Drawer
        studentId={viewedStudentId}
        isOpen={drawerOpen}
        onClose={handleClose360}
      />
    </div>
  );
}
