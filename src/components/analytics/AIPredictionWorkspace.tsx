import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFacultyStudents } from '../../hooks/useFacultyData';
import { predictionService } from '../../services/predictionService';
import {
  PredictionInput,
  PredictionResult,
  PredictionHistoryItem,
  ModelPerformanceMetrics,
  MLBranch,
  ML_BRANCHES,
  ML_SEMESTERS
} from '../../types/prediction';

// Unambiguous branch mapping to the 6 exact ML dataset categories
function mapToMLBranch(repoDept?: string): { branch: MLBranch; isMapped: boolean } {
  if (!repoDept) {
    return { branch: 'Computer Science & Engineering', isMapped: false };
  }
  const clean = repoDept.trim().toLowerCase();

  // Explicit guard: Do NOT map "Electrical & Physics Eng" to "Electrical Engineering"
  if (clean.includes('physics')) {
    return { branch: 'Computer Science & Engineering', isMapped: false };
  }

  if (clean === 'computer science & engineering' || clean === 'computer science' || clean === 'cse') {
    return { branch: 'Computer Science & Engineering', isMapped: true };
  }
  if (clean === 'information technology' || clean === 'it') {
    return { branch: 'Information Technology', isMapped: true };
  }
  if (clean === 'electronics & communication' || clean === 'electronics and communication' || clean === 'ece') {
    return { branch: 'Electronics & Communication', isMapped: true };
  }
  if (clean === 'electrical engineering' || clean === 'ee') {
    return { branch: 'Electrical Engineering', isMapped: true };
  }
  if (clean === 'mechanical engineering' || clean === 'me') {
    return { branch: 'Mechanical Engineering', isMapped: true };
  }
  if (clean === 'civil engineering' || clean === 'ce') {
    return { branch: 'Civil Engineering', isMapped: true };
  }

  return { branch: 'Computer Science & Engineering', isMapped: false };
}

// Convert "6th Semester", "Semester 6", or numeric values safely to integer 1-8
function mapToMLSemester(repoSem?: string | number): number {
  if (typeof repoSem === 'number' && repoSem >= 1 && repoSem <= 8) {
    return repoSem;
  }
  if (typeof repoSem === 'string') {
    const match = repoSem.match(/\b([1-8])(?:st|nd|rd|th)?\b/i);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 1 && parsed <= 8) {
        return parsed;
      }
    }
  }
  return 6; // Default to semester 6
}

import { RiskMeter } from './RiskMeter';
import { ShapDashboard } from './ShapDashboard';
import { RecommendationEngine } from './RecommendationEngine';
import { RiskTimeline } from './RiskTimeline';
import { InsightsPanel } from './InsightsPanel';
import { PredictionComparison } from './PredictionComparison';
import { AIAssistant } from './AIAssistant';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Sparkles,
  Upload,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Cpu,
  History,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function AIPredictionWorkspace() {
  const { data: rawStudents } = useFacultyStudents();

  // Selected student id from existing list
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Manual Form States
  const [name, setName] = useState<string>('');
  const [branch, setBranch] = useState<MLBranch>('Computer Science & Engineering');
  const [semester, setSemester] = useState<number>(6);
  const [cgpa, setCgpa] = useState<number>(7.2);
  const [attendance, setAttendance] = useState<number>(82);
  const [backlogs, setBacklogs] = useState<number>(0);
  const [completedAssignments, setCompletedAssignments] = useState<number>(85);
  const [scholarship, setScholarship] = useState<boolean>(false);
  const [financialStatus, setFinancialStatus] = useState<'low' | 'medium' | 'high'>('medium');
  const [behavioralScore, setBehavioralScore] = useState<number>(7);
  const [counselingSessions, setCounselingSessions] = useState<number>(0);

  // Flow & Result States
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionHistoryItem[]>([]);

  // CSV Drag and Drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [csvUploadProgress, setCsvUploadProgress] = useState<string>('');

  // Load history on mount
  useEffect(() => {
    predictionService.getPredictionHistory().then((hist) => {
      setRecentPredictions(hist);
    });
  }, [predictionResult]);

  // Synchronize selected student metrics to form
  const handleSelectStudentChange = (id: string) => {
    setSelectedStudentId(id);
    if (!id) return;

    const matched = rawStudents?.find((s) => s.id === id);
    if (matched) {
      setName(matched.name);
      
      // Map standard 4.0 scale to 10.0 scale if needed
      let calculatedCgpa = matched.cgpa;
      if (calculatedCgpa <= 4.0) {
        calculatedCgpa = Math.min(Number((calculatedCgpa * 2.5).toFixed(2)), 10.0);
      }
      setCgpa(calculatedCgpa);
      
      setAttendance(Math.round(matched.attendance));

      // Safe mapping for Branch (matches only verified ML categories)
      const branchMapping = mapToMLBranch(matched.department);
      if (branchMapping.isMapped) {
        setBranch(branchMapping.branch);
      } else {
        setBranch('Computer Science & Engineering');
        toast.warning(
          `Department "${matched.department}" is not a recognized ML category. Defaulted to "Computer Science & Engineering".`
        );
      }

      // Safe mapping for Semester (e.g. "6th Semester" -> 6)
      const mappedSem = mapToMLSemester(matched.semester);
      setSemester(mappedSem);
      
      // Infer plausible values for secondary factors based on risk profile
      if (matched.riskLevel === 'high' || matched.riskLevel === 'critical') {
        setBacklogs(1 + Math.floor(Math.random() * 2));
        setCompletedAssignments(62 + Math.floor(Math.random() * 10));
        setFinancialStatus('low');
        setScholarship(false);
        setBehavioralScore(4 + Math.floor(Math.random() * 2));
        setCounselingSessions(1 + Math.floor(Math.random() * 2));
      } else if (matched.riskLevel === 'medium') {
        setBacklogs(Math.random() > 0.5 ? 1 : 0);
        setCompletedAssignments(76 + Math.floor(Math.random() * 8));
        setFinancialStatus('medium');
        setScholarship(Math.random() > 0.7);
        setBehavioralScore(6 + Math.floor(Math.random() * 2));
        setCounselingSessions(Math.random() > 0.5 ? 1 : 0);
      } else {
        setBacklogs(0);
        setCompletedAssignments(92 + Math.floor(Math.random() * 8));
        setFinancialStatus(Math.random() > 0.5 ? 'high' : 'medium');
        setScholarship(Math.random() > 0.5);
        setBehavioralScore(8 + Math.floor(Math.random() * 2));
        setCounselingSessions(0);
      }

      toast.info(`Pre-loaded ${matched.name}'s profile data to ML form.`);
    }
  };

  // Run Prediction Flow
  const triggerPrediction = async () => {
    setIsPredicting(true);
    setPredictionResult(null);

    const inputData: PredictionInput = {
      studentId: selectedStudentId || undefined,
      name: name || 'Anonymous Student',
      branch,
      semester: Number(semester),
      attendance,
      assignments: completedAssignments,
      completedAssignments,
      cgpa,
      backlogs,
      scholarship,
      financialStatus,
      behavioralScore,
      counselingSessions
    };

    try {
      const result = await predictionService.predict(inputData);
      setPredictionResult(result);
      toast.success(`ML Inference succeeded for ${result.studentName}!`);
    } catch {
      toast.error('ML Inference failed. Please check parameters.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        await processCSVUpload(file.name);
      } else {
        toast.error('Unsupported file format. Please upload a student metadata .csv');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        await processCSVUpload(file.name);
      } else {
        toast.error('Unsupported file format. Please upload a student metadata .csv');
      }
    }
  };

  // Simulation of CSV parsing
  const processCSVUpload = async (fileName: string) => {
    setCsvUploadProgress(`Reading ${fileName}...`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCsvUploadProgress('Parsing columns schema...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCsvUploadProgress('Syncing telemetry vectors...');
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Select a random profile template
    const profiles = [
      { name: 'Kunal Sen (CSV Upload)', branch: 'Computer Science & Engineering' as MLBranch, semester: 5, cgpa: 5.2, attendance: 64, backlogs: 2, completedAssignments: 58, scholarship: false, financialStatus: 'low' as const, behavioralScore: 4, counselingSessions: 3 },
      { name: 'Riya Gupta (CSV Upload)', branch: 'Information Technology' as MLBranch, semester: 4, cgpa: 8.9, attendance: 95, backlogs: 0, completedAssignments: 98, scholarship: true, financialStatus: 'medium' as const, behavioralScore: 9, counselingSessions: 0 },
      { name: 'Vikram Malhotra (CSV Upload)', branch: 'Electronics & Communication' as MLBranch, semester: 6, cgpa: 6.9, attendance: 77, backlogs: 1, completedAssignments: 76, scholarship: false, financialStatus: 'medium' as const, behavioralScore: 6, counselingSessions: 1 }
    ];

    const chosen = profiles[Math.floor(Math.random() * profiles.length)];
    setName(chosen.name);
    setBranch(chosen.branch);
    setSemester(chosen.semester);
    setCgpa(chosen.cgpa);
    setAttendance(chosen.attendance);
    setBacklogs(chosen.backlogs);
    setCompletedAssignments(chosen.completedAssignments);
    setScholarship(chosen.scholarship);
    setFinancialStatus(chosen.financialStatus);
    setBehavioralScore(chosen.behavioralScore);
    setCounselingSessions(chosen.counselingSessions);

    setCsvUploadProgress('');
    toast.success(`Successfully uploaded and parsed ${fileName}! Form metrics synced.`);
  };

  // Tab states for analysis tabs
  const [activeTab, setActiveTab] = useState<'shap' | 'recommendations' | 'timeline'>('shap');

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-surface-container/20 border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-primary/10 to-transparent blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/25 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider w-fit">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Advanced predictive core v3
            </div>
            <h2 className="text-xl font-black text-on-surface tracking-tight uppercase">AI Inference & Diagnostics Center</h2>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-2xl">
              Execute individual student risk assessments using our custom high-fidelity machine learning core. Drill down into Shapley (SHAP) feature attributions, continuous improvement curves, and strategic interventions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: inputs & forms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* CSV File Upload Card */}
          <Card className="border border-outline-variant/60 shadow-xs">
            <CardHeader className="p-lg pb-3 border-b border-outline-variant/20">
              <CardTitle className="text-xs font-black uppercase">Ingest Bulk Metrics Vector</CardTitle>
              <CardDescription>Drag student CSV schema or manual drop to sync metrics</CardDescription>
            </CardHeader>

            <CardContent className="p-lg">
              {csvUploadProgress ? (
                <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-xl p-6 text-center space-y-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center animate-spin">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-primary animate-pulse">
                    {csvUploadProgress}
                  </p>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/80 hover:border-primary/50 hover:bg-surface-container/20'
                  }`}
                >
                  <input
                    type="file"
                    id="csv-file-input"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="h-7 w-7 text-outline mx-auto animate-bounce" />
                    <p className="text-xs font-bold text-on-surface">
                      Drag & Drop student `.csv` or <span className="text-primary underline">Browse Files</span>
                    </p>
                    <p className="text-[10px] text-outline">Supported schema formatting: CSV matrix with target weights</p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Input form */}
          <Card className="border border-outline-variant/60 shadow-xs">
            <CardHeader className="p-lg pb-3 border-b border-outline-variant/20">
              <CardTitle className="text-xs font-black uppercase">Individual ML Input Parameters</CardTitle>
              <CardDescription>Configure specific parameters to evaluate inference outcomes</CardDescription>
            </CardHeader>

            <CardContent className="p-lg space-y-5">
              {/* Existing Student Selection */}
              <div className="space-y-1.5 select-none">
                <label className="text-[9px] font-black uppercase text-outline flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" /> Bind Existing Student Profile
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudentChange(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary"
                >
                  <option value="">-- Customize Manual Profile --</option>
                  {rawStudents?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) - Risk: {(s.riskLevel || 'low').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name (if manual) */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-outline">Student Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter custom student name"
                  className="text-xs h-9 font-semibold"
                />
              </div>

              {/* Branch Selector (ML Feature 1) */}
              <div className="space-y-1.5 select-none">
                <label className="text-[9px] font-black uppercase text-outline flex items-center justify-between">
                  <span>Branch</span>
                  <span className="text-[9px] text-primary lowercase font-medium font-mono">ML Feature 1</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as MLBranch)}
                  className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  {ML_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Selector (ML Feature 2) */}
              <div className="space-y-1.5 select-none">
                <label className="text-[9px] font-black uppercase text-outline flex items-center justify-between">
                  <span>Semester</span>
                  <span className="text-[9px] text-primary lowercase font-medium font-mono">ML Feature 2 (1–8)</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary cursor-pointer"
                >
                  {ML_SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance slider */}
              <div className="space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-outline">Attendance (%)</span>
                  <span className="text-primary font-mono">{attendance}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* CGPA Slider */}
              <div className="space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-outline">Cumulative GPA (CGPA)</span>
                  <span className="text-primary font-mono">{cgpa.toFixed(2)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Completed Assignments */}
              <div className="space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-outline">Assignments Written (%)</span>
                  <span className="text-primary font-mono">{completedAssignments}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={completedAssignments}
                  onChange={(e) => setCompletedAssignments(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Grid factors (Backlogs & Behavioral) */}
              <div className="grid grid-cols-2 gap-4 select-none">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-outline">Active Backlogs</label>
                  <select
                    value={backlogs}
                    onChange={(e) => setBacklogs(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary"
                  >
                    <option value={0}>0 Backlogs</option>
                    <option value={1}>1 Backlog</option>
                    <option value={2}>2 Backlogs</option>
                    <option value={3}>3 Backlogs</option>
                    <option value={4}>4 Backlogs</option>
                    <option value={5}>5+ Backlogs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-outline">Behavioral Index</label>
                  <select
                    value={behavioralScore}
                    onChange={(e) => setBehavioralScore(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s}/10 Rating</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Socioeconomic, Scholarship, Counseling */}
              <div className="grid grid-cols-2 gap-4 select-none">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-outline">Financial Status</label>
                  <select
                    value={financialStatus}
                    onChange={(e) => setFinancialStatus(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary"
                  >
                    <option value="high">HIGH SES</option>
                    <option value="medium">MEDIUM SES</option>
                    <option value="low">LOW SES</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-outline">Counseling Sessions</label>
                  <select
                    value={counselingSessions}
                    onChange={(e) => setCounselingSessions(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2 bg-surface-container border border-outline rounded-lg focus:outline-primary"
                  >
                    <option value={0}>0 Sessions</option>
                    <option value={1}>1 Session</option>
                    <option value={2}>2 Sessions</option>
                    <option value={3}>3 Sessions</option>
                    <option value={4}>4+ Sessions</option>
                  </select>
                </div>
              </div>

              {/* Scholarship Toggle */}
              <div className="flex items-center justify-between bg-surface-container/20 p-3 rounded-xl border border-outline-variant/30 select-none">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-on-surface">Institutional Scholarship</p>
                  <p className="text-[10px] text-outline">Cushions financial support constraints</p>
                </div>
                <input
                  type="checkbox"
                  checked={scholarship}
                  onChange={(e) => setScholarship(e.target.checked)}
                  className="h-4.5 w-4.5 accent-primary cursor-pointer"
                />
              </div>

              {/* Run button */}
              <Button
                onClick={triggerPrediction}
                disabled={isPredicting}
                className="w-full h-11 bg-primary text-surface-container-lowest font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer select-none flex items-center justify-center gap-2 hover:bg-primary/95 shadow-md shadow-primary/10 transition mt-2"
              >
                {isPredicting ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" /> Inferences running...
                  </>
                ) : (
                  <>
                    Run AI Dropout Predict <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column: results & details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {isPredicting ? (
              /* Loading Screen state */
              <motion.div
                key="loading-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] bg-surface-container/30 border border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xs"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="h-6 w-6 text-primary absolute top-5 left-5 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-black uppercase text-on-surface tracking-widest animate-pulse">
                    Executing Tensor Calculus
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                    Analyzing attendance matrices, cumulative SGPA historical distributions, and extracting feature importance weights via SHAP tree solvers...
                  </p>
                </div>
              </motion.div>
            ) : predictionResult ? (
              /* Success results view */
              <motion.div
                key="results-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Result Overview Header Card */}
                <Card className="border border-outline-variant/60 shadow-xs overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
                  <CardHeader className="p-lg pb-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 select-none">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-lg font-black text-on-surface uppercase">
                          {predictionResult.studentName}
                        </h3>
                        <span className="text-[9px] font-black uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50 text-outline">
                          {predictionResult.studentId}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-outline font-black uppercase">
                        <span>Prediction ID: <strong className="text-on-surface font-extrabold">{predictionResult.predictionId}</strong></span>
                        <span>Model: <strong className="text-on-surface font-extrabold">{predictionResult.modelVersion}</strong></span>
                        <span>Time: <strong className="text-on-surface font-extrabold">{new Date(predictionResult.predictionTime).toLocaleTimeString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border leading-none ${
                        predictionResult.riskLevel === 'low' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15' :
                        predictionResult.riskLevel === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/15' :
                        predictionResult.riskLevel === 'high' ? 'text-orange-500 bg-orange-500/10 border-orange-500/15' :
                        'text-rose-500 bg-rose-500/10 border-rose-500/15'
                      }`}>
                        {predictionResult.riskLevel} risk
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
                      {/* Risk Gauge (7 cols) */}
                      <div className="md:col-span-6 p-4">
                        <RiskMeter
                          probability={predictionResult.dropoutProbability}
                          riskLevel={predictionResult.riskLevel}
                          confidence={predictionResult.confidenceScore}
                        />
                      </div>

                      {/* Diagnostic Insights (5 cols) */}
                      <div className="md:col-span-6 p-4 flex flex-col justify-between">
                        <div className="space-y-3.5 select-none font-sans text-xs">
                          <h5 className="text-[10px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5">
                            <Info className="h-4 w-4 text-primary" /> Profile Evaluation
                          </h5>

                          <div className="space-y-2 font-semibold">
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Branch</span>
                              <span className="text-on-surface font-black truncate max-w-[170px] text-right" title={branch}>{branch}</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Semester</span>
                              <span className="text-on-surface font-black">Semester {semester}</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">CGPA Index</span>
                              <span className="text-on-surface font-black">{cgpa.toFixed(2)} / 10.0</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Class Attendance</span>
                              <span className="text-on-surface font-black">{attendance}%</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Assignments Written</span>
                              <span className="text-on-surface font-black">{completedAssignments}%</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Active Backlogs</span>
                              <span className="text-on-surface font-black">{backlogs}</span>
                            </div>
                            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                              <span className="text-outline">Engagement Score</span>
                              <span className="text-on-surface font-black">{behavioralScore}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-outline">Counseling Referrals</span>
                              <span className="text-on-surface font-black">{counselingSessions} Sessions</span>
                            </div>
                          </div>
                        </div>

                        {/* Confidence metrics */}
                        <div className="pt-4 border-t border-outline-variant/20 mt-4 select-none">
                          <p className="text-[9px] font-black uppercase text-outline">Telemetry Confidence Profile</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${predictionResult.confidenceScore}%` }} />
                            </div>
                            <span className="font-mono text-xs font-black text-primary leading-none">
                              {predictionResult.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tab Navigation for Detailed Reports */}
                <div className="flex border-b border-outline-variant/30 select-none">
                  {[
                    { id: 'shap', label: 'Explainable AI (SHAP)' },
                    { id: 'recommendations', label: 'Interventions & Insights' },
                    { id: 'timeline', label: 'Timeline & History' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 font-sans text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-outline hover:text-on-surface'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div>
                  {activeTab === 'shap' && (
                    <ShapDashboard
                      shapData={predictionResult.shapData}
                      dropoutProbability={predictionResult.dropoutProbability}
                    />
                  )}

                  {activeTab === 'recommendations' && (
                    <div className="space-y-6">
                      <RecommendationEngine recommendations={predictionResult.recommendations} />
                      <InsightsPanel insights={predictionResult.insights} />
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="space-y-6">
                      <RiskTimeline historicalTrend={predictionResult.historicalTrend} />
                      <PredictionComparison history={recentPredictions} />
                    </div>
                  )}
                </div>

                {/* AI Assistant Chat Panel */}
                <AIAssistant predictionResult={predictionResult} />
              </motion.div>
            ) : (
              /* Empty Workspace State */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[600px] border border-dashed border-outline-variant/60 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 bg-surface-container/10 select-none"
              >
                <div className="h-14 w-14 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center text-outline animate-pulse">
                  <Cpu className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-black uppercase text-on-surface tracking-widest">
                    ML Inference Terminal Idle
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                    Select an active student, adjust manual parameters, or drop a telemetry CSV file and click **Run AI Dropout Predict** to compute dropout vulnerability levels and Shapley attributions.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Historical List Records / Recent Predictions (Full Width) */}
      <Card className="border border-outline-variant/60 shadow-xs select-none">
        <CardHeader className="p-lg pb-3 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-container/5">
          <div>
            <div className="flex items-center gap-1.5">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-xs font-black uppercase">Recent Inference Registry Logs</CardTitle>
            </div>
            <CardDescription>Review previous predictions and outcomes executed on this server</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-container/50">
                <tr className="border-b border-outline-variant/30">
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px]">Prediction Target</th>
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px]">Execution Timestamp</th>
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px] text-center">Dropout Risk Score</th>
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px] text-center">Risk Level</th>
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px] text-center">Inference Engine</th>
                  <th className="p-4 font-sans font-extrabold text-on-surface-variant uppercase text-[10px] text-right">Inference Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-medium">
                {(recentPredictions || []).map((hist) => (
                  <tr key={hist.id} className="hover:bg-surface-container/15 transition duration-150">
                    <td className="p-4 font-bold text-on-surface">{hist.studentName}</td>
                    <td className="p-4 font-mono text-outline">{new Date(hist.date).toLocaleString()}</td>
                    <td className="p-4 text-center font-mono font-black text-primary">{hist.riskScore}%</td>
                    <td className="p-4 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        hist.riskLevel === 'low' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15' :
                        hist.riskLevel === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/15' :
                        hist.riskLevel === 'high' ? 'text-orange-500 bg-orange-500/10 border-orange-500/15' :
                        'text-rose-500 bg-rose-500/10 border-rose-500/15'
                      }`}>
                        {hist.riskLevel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-[10px] text-outline font-bold uppercase">{hist.modelVersion}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={async () => {
                          setIsPredicting(true);
                          await new Promise((resolve) => setTimeout(resolve, 600));
                          
                          // Preload metrics corresponding to this history student profile
                          setName(hist.studentName);
                          setAttendance(hist.attendance);
                          setCgpa(hist.cgpa);
                          setCounselingSessions(hist.counselingSessions);
                          setBacklogs(hist.riskLevel === 'high' || hist.riskLevel === 'critical' ? 2 : 0);
                          setCompletedAssignments(hist.attendance > 80 ? 92 : 68);
                          setBehavioralScore(hist.riskLevel === 'low' ? 9 : 5);
                          setFinancialStatus(hist.riskLevel === 'critical' ? 'low' : 'medium');
                          setScholarship(hist.riskLevel === 'low');
                          setSelectedStudentId('');

                          // Execute Prediction
                          const fakeResult = await predictionService.simulateMLInference({
                            studentId: '',
                            name: hist.studentName,
                            branch: branch || 'Computer Science & Engineering',
                            semester: Number(semester) || 6,
                            attendance: hist.attendance,
                            assignments: hist.attendance > 80 ? 92 : 68,
                            completedAssignments: hist.attendance > 80 ? 92 : 68,
                            cgpa: hist.cgpa,
                            counselingSessions: hist.counselingSessions,
                            backlogs: hist.riskLevel === 'high' || hist.riskLevel === 'critical' ? 2 : 0,
                            behavioralScore: hist.riskLevel === 'low' ? 9 : 5,
                            financialStatus: hist.riskLevel === 'critical' ? 'low' : 'medium',
                            scholarship: hist.riskLevel === 'low'
                          });
                          setPredictionResult(fakeResult);
                          setIsPredicting(false);
                          toast.success(`Loaded historic result for ${hist.studentName}`);
                        }}
                        className="text-[10px] font-black uppercase text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 px-3 py-1.5 rounded-lg cursor-pointer transition select-none"
                      >
                        Load Inference
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
