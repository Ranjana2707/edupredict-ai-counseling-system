import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, GraduationCap, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { facultyService } from '../../services/facultyService';
import { counselorService } from '../../services/counselorService';
import { getRiskColorClass, cn } from '../../utils';
import { Modal } from '../ui/Modal';

interface SearchStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  attendance?: number;
  cgpa?: number;
}

export function GlobalSearchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Render search bar for authenticated users only
  if (!user) {
    return null;
  }

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState<SearchStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<SearchStudent | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Fetch student directory relative to user role
  useEffect(() => {
    let active = true;
    const loadDirectory = async () => {
      setIsLoading(true);
      try {
        let rawStudents: any[] = [];
        if (user.role === 'counselor') {
          rawStudents = await counselorService.getStudents();
        } else {
          // Faculty, Admin, and Student roles access standard directory
          rawStudents = await facultyService.getStudents();
        }

        const formatted: SearchStudent[] = rawStudents.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email || '',
          department: s.department || '',
          semester: s.semester || '',
          riskLevel: (s.riskLevel || 'low').toLowerCase() as any,
          attendance: s.attendance,
          cgpa: s.cgpa,
        }));

        if (active) {
          setStudents(formatted);
        }
      } catch (err) {
        console.error('Error loading students for global search:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDirectory();
    return () => {
      active = false;
    };
  }, [user]);

  // Focus mobile input on open
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

  // Handle click away to close search dropdown (Desktop mode)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to global shortcut key (e.g., '/') to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement !== mobileInputRef.current && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtering logic
  const filteredStudents = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [query, students]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => Math.min(filteredStudents.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredStudents.length) {
        handleSelectStudent(filteredStudents[activeIndex]);
      } else if (filteredStudents.length > 0) {
        handleSelectStudent(filteredStudents[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsMobileSearchOpen(false);
      inputRef.current?.blur();
      mobileInputRef.current?.blur();
    }
  };

  const handleSelectStudent = (student: SearchStudent) => {
    setQuery('');
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    mobileInputRef.current?.blur();
    if (user.role === 'student') {
      setSelectedStudentForModal(student);
    } else {
      navigate(`/students?viewStudentId=${student.id}`);
    }
  };

  return (
    <>
      {/* 1. MOBILE TRIGGER BUTTON (Visible on screens < md, hidden on md+) */}
      <div className="md:hidden flex items-center">
        <button
          id="global-search-mobile-trigger"
          onClick={() => setIsMobileSearchOpen(true)}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low focus:bg-surface-container active:scale-95 transition-all duration-150"
          aria-label="Search directory"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* 2. DESKTOP/TABLET INLINE SEARCH (Visible on md+ only, fluid and adjustable) */}
      <div 
        id="global-search-bar-container" 
        ref={containerRef} 
        className="hidden md:block relative w-full max-w-md"
      >
        <div className="relative flex items-center">
          <div className="absolute left-3 text-outline/80 pointer-events-none flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-on-surface-variant/70" />
            )}
          </div>

          <input
            id="global-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search students by name or ID..."
            className="w-full h-10 pl-9 pr-14 bg-surface-container-lowest border border-outline-variant/60 rounded-xl font-sans text-xs text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary/80 focus:ring-4 focus:ring-primary/5 shadow-inner"
          />

          {/* Clear / Shortcut Indicators */}
          <div className="absolute right-3 flex items-center gap-1.5 select-none pointer-events-auto">
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-outline-variant/50 bg-surface-container-low text-[9px] font-mono text-outline font-black leading-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Suggestion Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (query.trim() || students.length > 0) && (
            <motion.div
              id="global-search-dropdown"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden bg-surface-container-lowest border border-outline-variant/80 rounded-xl shadow-lg shadow-on-surface/5 max-h-[380px] flex flex-col"
            >
              {query.trim() ? (
                <div className="overflow-y-auto py-2 divide-y divide-outline-variant/30">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-outline uppercase tracking-wider select-none">
                    Student Results ({filteredStudents.length})
                  </div>

                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, idx) => (
                      <div
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-3 cursor-pointer transition-all duration-150 border-l-2",
                          idx === activeIndex
                            ? "bg-surface-container border-primary pl-4"
                            : "border-transparent hover:bg-surface-container-low"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary font-sans text-xs shrink-0 select-none">
                            {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans font-bold text-on-surface text-xs truncate">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-primary/80 font-semibold uppercase tracking-wider">
                                {student.id}
                              </span>
                              <span className="text-[10px] text-outline/80 font-medium truncate">
                                • {student.department}
                              </span>
                            </div>
                          </div>
                        </div>

                        {user.role === 'student' ? (
                          <span className="text-[10px] text-outline font-semibold">
                            {student.semester}
                          </span>
                        ) : (
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 select-none",
                            getRiskColorClass(student.riskLevel)
                          )}>
                            {student.riskLevel}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center select-none">
                      <GraduationCap className="h-8 w-8 text-outline/40 mx-auto mb-2" />
                      <p className="font-sans text-xs font-bold text-on-surface">No students found</p>
                      <p className="font-sans text-[10px] text-outline mt-1">
                        No matching records for "{query}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Empty query but search bar active
                user.role === 'student' ? (
                  <div className="py-3 px-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider select-none">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      University Directory
                    </div>
                    <p className="font-sans text-[10px] text-outline leading-relaxed select-none">
                      Type a name or ID above to search, or select from active peers:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {students
                        .slice(0, 3)
                        .map((student) => (
                          <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 cursor-pointer transition duration-150"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-[10px] shrink-0">
                                {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-sans font-bold text-on-surface text-[11px] truncate">
                                  {student.name}
                                </p>
                                <p className="font-mono text-[9px] text-outline">
                                  {student.id}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-outline font-semibold">
                              {student.semester}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  // Empty query but search bar active: Show helpful Cohort Hotlist / Quick Access
                  <div className="py-3 px-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider select-none">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Cohort Priority Watchlist
                    </div>
                    <p className="font-sans text-[10px] text-outline leading-relaxed select-none">
                      Type a name or ID above, or select one of these priority student profiles directly:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {students
                        .filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical')
                        .slice(0, 3)
                        .map((student) => (
                          <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 cursor-pointer transition duration-150"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-6 w-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-600 dark:text-rose-400 text-[10px] shrink-0">
                                {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-sans font-bold text-on-surface text-[11px] truncate">
                                  {student.name}
                                </p>
                                <p className="font-mono text-[9px] text-outline">
                                  {student.id}
                                </p>
                              </div>
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                              getRiskColorClass(student.riskLevel)
                            )}>
                              {student.riskLevel}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. MOBILE FULL-SCREEN SEARCH OVERLAY (AnimatePresence slide-down/fade, premium feel) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            id="global-search-mobile-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-background flex flex-col md:hidden"
          >
            {/* Mobile Header input line */}
            <div className="h-16 flex items-center gap-3 px-4 bg-surface-container-lowest border-b border-outline-variant/30 shrink-0">
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setQuery('');
                }}
                className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  id="global-search-mobile-input"
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search students by name or ID..."
                  className="w-full h-10 pl-3 pr-10 bg-surface-container-low border border-outline-variant/40 rounded-xl font-sans text-sm text-on-surface placeholder:text-outline/60 outline-none focus:border-primary/80 transition-all duration-200"
                />

                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      mobileInputRef.current?.focus();
                    }}
                    className="absolute right-3 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Results Area */}
            <div className="flex-1 overflow-y-auto bg-background p-4 space-y-4">
              {query.trim() ? (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-outline select-none">
                    Student Results ({filteredStudents.length})
                  </div>

                  {filteredStudents.length > 0 ? (
                    <div className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
                      {filteredStudents.map((student, idx) => (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="flex items-center justify-between p-3.5 hover:bg-surface-container-low cursor-pointer transition-all active:bg-surface-container"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary font-sans text-xs shrink-0 select-none">
                              {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-sans font-bold text-on-surface text-xs truncate">
                                {student.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[9px] text-primary/80 font-semibold uppercase tracking-wider">
                                  {student.id}
                                </span>
                                <span className="text-[9px] text-outline/80 font-medium truncate">
                                  • {student.department}
                                </span>
                              </div>
                            </div>
                          </div>

                          {user.role === 'student' ? (
                            <span className="text-[10px] text-outline font-semibold">
                              {student.semester}
                            </span>
                          ) : (
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 select-none",
                              getRiskColorClass(student.riskLevel)
                            )}>
                              {student.riskLevel}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center select-none bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
                      <GraduationCap className="h-10 w-10 text-outline/40 mx-auto mb-3" />
                      <p className="font-sans text-sm font-bold text-on-surface">No students found</p>
                      <p className="font-sans text-xs text-outline mt-1.5">
                        No matching records for "{query}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Empty query mobile overview
                user.role === 'student' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider select-none">
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      University Directory
                    </div>
                    <p className="font-sans text-xs text-outline leading-relaxed select-none">
                      Search by name or ID above, or quickly select from these peers:
                    </p>
                    <div className="space-y-2">
                      {students.slice(0, 4).map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/30 cursor-pointer transition-all active:bg-surface-container"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-[10px] shrink-0">
                              {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-sans font-bold text-on-surface text-xs truncate">
                                {student.name}
                              </p>
                              <p className="font-mono text-[9px] text-outline mt-0.5">
                                {student.id}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-outline font-semibold">
                            {student.semester}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider select-none">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Cohort Priority Watchlist
                    </div>
                    <p className="font-sans text-xs text-outline leading-relaxed select-none">
                      Select one of these high priority students directly to view details:
                    </p>
                    <div className="space-y-2">
                      {students
                        .filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical')
                        .slice(0, 4)
                        .map((student) => (
                          <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/30 cursor-pointer transition-all active:bg-surface-container"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-600 dark:text-rose-400 text-[10px] shrink-0">
                                {student?.name ? student.name.split(' ').map((n) => n[0]).join('') : '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-sans font-bold text-on-surface text-xs truncate">
                                  {student.name}
                                </p>
                                <p className="font-mono text-[9px] text-outline mt-0.5">
                                  {student.id}
                                </p>
                              </div>
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                              getRiskColorClass(student.riskLevel)
                            )}>
                              {student.riskLevel}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Student Profile Dialog Modal (For standard student peer lookups) */}
      <Modal
        isOpen={selectedStudentForModal !== null}
        onClose={() => setSelectedStudentForModal(null)}
        title="Student Academic Profile"
        description="Public educational standing directory & peer-to-peer engagement registry"
        className="max-w-md border-primary/25 bg-surface-container-lowest"
      >
        {selectedStudentForModal && (
          <div className="space-y-6">
            {/* Top Student Header Card with avatar */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center font-bold text-primary font-sans text-lg shrink-0 select-none">
                {selectedStudentForModal?.name ? selectedStudentForModal.name.split(' ').map((n) => n[0]).join('') : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans font-black text-on-surface text-base truncate">
                  {selectedStudentForModal.name}
                </h3>
                <p className="font-mono text-xs text-primary font-bold mt-0.5">
                  {selectedStudentForModal.id}
                </p>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  {selectedStudentForModal.email}
                </p>
              </div>
            </div>

            {/* Program Details Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40">
                <p className="text-[10px] font-black uppercase tracking-wider text-outline">Department</p>
                <p className="font-sans text-xs font-bold text-on-surface mt-1">
                  {selectedStudentForModal.department}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40">
                <p className="text-[10px] font-black uppercase tracking-wider text-outline">Semester</p>
                <p className="font-sans text-xs font-bold text-on-surface mt-1">
                  {selectedStudentForModal.semester}
                </p>
              </div>
            </div>

            {/* Performance metrics (Academic & Attendance Standings) */}
            <div className="space-y-4 pt-1">
              <h4 className="font-sans text-[10px] font-black uppercase tracking-wider text-outline">Public Academic Standings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">CGPA Standing</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-on-surface">
                      {selectedStudentForModal.cgpa ? selectedStudentForModal.cgpa.toFixed(2) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-outline font-medium">/ 10.00</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedStudentForModal.cgpa ? (selectedStudentForModal.cgpa * 10) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Class Attendance</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-on-surface">
                      {selectedStudentForModal.attendance ? `${Math.round(selectedStudentForModal.attendance)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedStudentForModal.attendance || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-[10px] text-on-surface-variant font-medium text-center leading-relaxed">
              For privacy and safety, ML advisory classifications and counseling progress history are restricted to authorized advisors, counselors, and system coordinators.
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
