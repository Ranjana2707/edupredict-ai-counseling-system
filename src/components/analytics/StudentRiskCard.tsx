import { motion } from 'motion/react';
import { ShieldAlert, TrendingUp, HelpCircle, GraduationCap, CheckCircle2, AlertTriangle, ArrowUpRight, Clock, Download } from 'lucide-react';
import { cn } from '../../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export interface StudentRiskCardProps {
  probability: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | string;
  confidence?: number; // model confidence, e.g., 94.8%
  studentName?: string;
  factors?: string[];
  compact?: boolean;
  className?: string;
  onActionClick?: () => void;
  lastUpdated?: string;
}

const getRecommendations = (level: string): string[] => {
  const levelLower = level.toLowerCase();
  if (levelLower === 'low' || levelLower === 'low advisory need' || levelLower === 'standard') {
    return [
      'Maintain regular academic advising check-ins to sustain high performance.',
      'Participate actively in peer study groups and collaborative campus sessions.',
      'Regularly monitor portal grades, submissions, and course forum engagements.',
      'Schedule a general progress discussion with an advisor prior to final exam registration.'
    ];
  }
  if (levelLower === 'medium' || levelLower === 'moderate advisory need' || levelLower === 'moderate') {
    return [
      'Schedule a 1-on-1 advisor review session within the next 7 days.',
      'Utilize university tutoring workshops and targeted academic assistance labs.',
      'Re-examine current weekly study schedules and structure a distraction-free calendar.',
      'Connect with instructors directly to obtain quick feedback on any confusing syllabus items.'
    ];
  }
  if (levelLower === 'high' || levelLower === 'high advisory need' || levelLower === 'elevated') {
    return [
      'Reach out immediately to secure a critical academic counseling session (within 48 hours).',
      'Formulate a customized academic recovery action plan detailing target deadlines.',
      'Request flexible deadline extensions or auxiliary office hour reviews from class instructors.',
      'Attend student success seminars or focus workshops tailored to retention backing.'
    ];
  }
  // critical / immediate
  return [
    'Initiate urgent, mandatory academic intervention protocol immediately (within 24 hours).',
    'Convene a joint session with your faculty advisor, dean, and Student Success lead counselor.',
    'Enroll in mandatory daily class attendance tracking and high-frequency coaching checks.',
    'Access formal student health, socio-economic aids, or counseling resources if applicable.'
  ];
};

export function StudentRiskCard({
  probability,
  riskLevel,
  confidence = 94.8,
  studentName,
  factors = ['Low attendance', 'Algorithm assignment overdue', 'Midterm grade warning'],
  compact = false,
  className,
  onActionClick,
  lastUpdated = 'July 13, 2026, 3:27 AM'
}: StudentRiskCardProps) {
  const { user } = useAuth();
  
  // Derive the risk level dynamically based on numerical thresholds of the probability score
  const getEffectiveRiskLevel = (): string => {
    if (probability < 30) return 'low';
    if (probability < 70) return 'medium';
    if (probability < 85) return 'high';
    return 'critical';
  };

  const effectiveRiskLevel = getEffectiveRiskLevel();
  const levelLower = effectiveRiskLevel.toLowerCase();

  const handleDownloadReport = () => {
    const finalStudentName = studentName && studentName !== 'Dropout Probability' ? studentName : (user?.name || 'Anonymous Student');
    const effectiveRiskStyle = getRiskStyles();
    
    const reportContent = `================================================================================
EDUPREDICT - STUDENT ACADEMIC ADVISORY & STANDING REPORT
================================================================================
Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
Report Code: EP-ADVISORY-STATUS

STUDENT PERFORMANCE SUMMARY
--------------------------------------------------------------------------------
Student Name:             ${finalStudentName}
Advisory Score:           ${probability}%
Assessment Standing:      ${effectiveRiskStyle.label}
Data Sync Index:          ${confidence}%
Last Evaluated Sync:      ${lastUpdated}

ACADEMIC ATTENTION & ENGAGEMENT ITEMS
--------------------------------------------------------------------------------
${factors && factors.length > 0 
  ? factors.map((f, i) => `${i + 1}. [!] ${f}`).join('\n')
  : '• No critical advisory areas currently flagged.'}

RECOMMENDED SUPPORT STEPS
--------------------------------------------------------------------------------
${(getRecommendations(effectiveRiskLevel) || []).map((r, i) => `[${i + 1}] ${r}`).join('\n')}

================================================================================
CONFIDENTIALITY NOTICE: This advisory report contains academic analytics.
For official academic advising, counselor, and student success usage only.
================================================================================`;

    // Create a blob and download it
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Academic_Advisory_Report_${finalStudentName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report Downloaded Successfully', {
      description: `Academic advisory standing report generated for ${finalStudentName}.`,
    });
  };

  const getRiskStyles = () => {
    switch (levelLower) {
      case 'low':
        return {
          label: 'Low Advisory Need',
          themeColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/5',
          borderColor: 'border-emerald-500/20 dark:border-emerald-500/10',
          barColor: 'bg-emerald-500',
          accentGlow: 'shadow-emerald-500/10',
          icon: CheckCircle2,
          textColor: 'text-emerald-700 dark:text-emerald-300',
          bgGradient: 'from-emerald-500/15 via-transparent to-transparent'
        };
      case 'medium':
        return {
          label: 'Moderate Advisory Need',
          themeColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10 dark:bg-amber-500/5',
          borderColor: 'border-amber-500/20 dark:border-amber-500/10',
          barColor: 'bg-amber-500',
          accentGlow: 'shadow-amber-500/10',
          icon: AlertTriangle,
          textColor: 'text-amber-700 dark:text-amber-300',
          bgGradient: 'from-amber-500/15 via-transparent to-transparent'
        };
      case 'high':
        return {
          label: 'High Advisory Need',
          themeColor: 'text-orange-500',
          bgColor: 'bg-orange-500/10 dark:bg-orange-500/5',
          borderColor: 'border-orange-500/20 dark:border-orange-500/10',
          barColor: 'bg-orange-500',
          accentGlow: 'shadow-orange-500/10',
          icon: ShieldAlert,
          textColor: 'text-orange-700 dark:text-orange-300',
          bgGradient: 'from-orange-500/15 via-transparent to-transparent'
        };
      case 'critical':
        return {
          label: 'Immediate Support Need',
          themeColor: 'text-rose-500',
          bgColor: 'bg-rose-500/10 dark:bg-rose-500/5',
          borderColor: 'border-rose-500/20 dark:border-rose-500/10',
          barColor: 'bg-rose-500',
          accentGlow: 'shadow-rose-500/10',
          icon: ShieldAlert,
          textColor: 'text-rose-700 dark:text-rose-300',
          bgGradient: 'from-rose-500/15 via-transparent to-transparent'
        };
      default:
        return {
          label: 'Moderate Advisory Need',
          themeColor: 'text-primary',
          bgColor: 'bg-primary/10 dark:bg-primary/5',
          borderColor: 'border-primary/20 dark:border-primary/10',
          barColor: 'bg-primary',
          accentGlow: 'shadow-primary/10',
          icon: AlertTriangle,
          textColor: 'text-primary',
          bgGradient: 'from-primary/15 via-transparent to-transparent'
        };
    }
  };

  const styles = getRiskStyles();
  const IconComponent = styles.icon;

  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  if (compact) {
    return (
      <Card hoverable className={cn('h-full relative overflow-hidden', className)}>
        <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-40 pointer-events-none", styles.bgGradient)} />
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardDescription className="uppercase tracking-widest font-black text-[10px] text-outline flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Advisory Analytics
            </CardDescription>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadReport();
                }}
                className="p-1 rounded-md border border-outline-variant/40 hover:border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface cursor-pointer transition-all"
                title="Download Advisory Report"
              >
                <Download className="h-3 w-3" />
              </button>
              <span className={cn('text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border', styles.bgColor, styles.borderColor, styles.themeColor)}>
                {styles.label}
              </span>
            </div>
          </div>
          {studentName && (
            <CardTitle className="text-base font-black tracking-tight mt-1">
              {studentName}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4 relative z-10 pt-1">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
              <svg className="h-16 w-16 -rotate-90">
                <circle
                  className="text-outline-variant/30"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <motion.circle
                  className={styles.themeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xs font-black text-on-surface">
                  {probability}%
                </span>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <p className="font-sans text-xs font-bold text-on-surface truncate">
                {studentName || 'Attention Index'}
              </p>
              <div className="flex items-center gap-1.5 text-[10.5px] text-on-surface-variant font-medium relative group cursor-help">
                <TrendingUp className="h-3 w-3 text-secondary" />
                <span>Standing Index: <strong className="text-on-surface">{confidence}%</strong></span>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 w-48 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] p-2 rounded-lg shadow-md border border-white/10 text-center">
                  <div className="font-semibold flex items-center justify-center gap-1 mb-0.5">
                    <Clock className="h-3 w-3 text-amber-400" /> Standing Synced
                  </div>
                  <div className="text-slate-300 font-medium">{lastUpdated}</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hoverable className={cn('h-full relative overflow-hidden flex flex-col justify-between', className)}>
      <div className={cn("absolute inset-x-0 top-0 h-40 bg-gradient-to-b opacity-30 pointer-events-none", styles.bgGradient)} />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant/40 relative group cursor-help select-none">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="font-sans text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
              Advisory Standing
            </span>

            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 w-52 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[11px] p-2.5 rounded-xl shadow-lg border border-white/10 text-center flex flex-col gap-0.5">
              <div className="font-bold flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> Status Synced
              </div>
              <span className="text-slate-300 text-[10px]">Evaluated: {lastUpdated}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95" />
            </div>
          </div>
          <span className={cn('text-[11px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-1 shadow-xs', styles.bgColor, styles.borderColor, styles.themeColor)}>
            <IconComponent className="h-3.5 w-3.5 shrink-0" />
            {styles.label}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            {studentName ? (
              <h3 className="font-sans text-lg font-black text-on-surface tracking-tight leading-snug">
                {studentName}
              </h3>
            ) : (
              <h3 className="font-sans text-lg font-black text-on-surface tracking-tight leading-snug">
                Academic standing
              </h3>
            )}
            <p className="font-sans text-xs text-on-surface-variant font-medium mt-0.5">
              Evaluated continuously based on academic engagements.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-3xl font-black text-on-surface leading-none block">
              {probability}%
            </span>
            <span className="font-sans text-[10px] font-bold text-outline block mt-1 uppercase tracking-wider">
              Attention Index
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 relative z-10 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-on-surface-variant">
            <span>Alert Priority Progression</span>
            <span>{probability}/100</span>
          </div>

          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
            <motion.div
              className={cn("h-full rounded-full transition-all duration-500", styles.barColor)}
              initial={{ width: 0 }}
              animate={{ width: `${probability}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-outline font-black uppercase tracking-wider pt-1">
            <span>Low Need (&lt;30)</span>
            <span>Moderate (30-69)</span>
            <span>High (70-84)</span>
            <span>Immediate (&ge;85)</span>
          </div>
        </div>

        {factors && factors.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-outline">
              Academic Attention Items
            </h4>
            <div className="space-y-1.5">
              {factors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container-low/40 p-2 rounded-lg border border-outline-variant/10">
                  <span className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", styles.barColor)} />
                  <span className="font-medium leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant relative group cursor-help">
            <HelpCircle className="h-3.5 w-3.5 text-outline shrink-0" />
            <span>Standing Confidence: <strong className="text-on-surface">{confidence}%</strong></span>
            
            <div className="absolute bottom-full left-0 mb-2.5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 w-52 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[11px] p-2.5 rounded-xl shadow-lg border border-white/10">
              <div className="font-bold flex items-center gap-1 text-amber-400">
                <Clock className="h-3.5 w-3.5" /> Verified Advisory Status
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                Last verified: {lastUpdated}
              </p>
              <div className="absolute top-full left-3 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1 font-sans text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface cursor-pointer hover:shadow-xs transition-all"
              title="Download Formatted Report"
            >
              <Download className="h-3 w-3" />
              Download Report
            </button>

            {onActionClick && (
              <button
                onClick={onActionClick}
                className={cn(
                  "inline-flex items-center gap-1 font-sans text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border cursor-pointer hover:shadow-xs transition-all",
                  styles.bgColor,
                  styles.borderColor,
                  styles.themeColor
                )}
              >
                Analyze Triggers
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
