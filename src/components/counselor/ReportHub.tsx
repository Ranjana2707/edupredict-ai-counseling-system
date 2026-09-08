import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  Calendar,
  Building,
  TrendingDown,
  Sparkles,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  History,
  FileBadge
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGenerateCounselorReport } from '../../hooks/useCounselorData';

type ReportType = 'student' | 'monthly' | 'department' | 'risk_improvement';

export function ReportHub() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('student');
  const generateReportMutation = useGenerateCounselorReport();

  const reportsList = [
    {
      id: 'student' as ReportType,
      title: 'Student Counseling Profile',
      description: 'Compiles personal, academic, financial, past dialogue notes, and counseling progression logs for active cohorts.',
      icon: FileBadge
    },
    {
      id: 'monthly' as ReportType,
      title: 'Monthly Counselor Audit',
      description: 'Summarizes session load ratios (completed, scheduled, canceled) across the active calendar period.',
      icon: Calendar
    },
    {
      id: 'department' as ReportType,
      title: 'Department-wise Risk density',
      description: 'Breaks down active dropout risks and counselor assignments across CS, EE, ME, and BA branches.',
      icon: Building
    },
    {
      id: 'risk_improvement' as ReportType,
      title: 'Risk Improvement Report',
      description: 'Details historical trajectories of high-risk student recovery successes post-intervention plans.',
      icon: TrendingDown
    }
  ];

  const handleGenerate = () => {
    generateReportMutation.mutate(selectedReport);
  };

  // Compile mock visual preview tables based on selected report category
  const reportPreviewContent = useMemo(() => {
    switch (selectedReport) {
      case 'student':
        return {
          headers: ['Student ID', 'Student Name', 'Semester', 'Current Attendance', 'Counseling Sessions', 'Last Session Outcome'],
          rows: [
            ['ST-2026-BTECH-101', 'Priyanka Nair', '6th Sem', '62.5%', '2 sessions', 'Peer tutor assigned; 3-installment fees approved.'],
            ['ST-2026-BTECH-115', 'Neha Sen', '6th Sem', '60.1%', '3 sessions', 'Crisis intake; temporary homework freeze initiated.'],
            ['ST-2026-BTECH-104', 'Aisha Patel', '6th Sem', '58.0%', '1 session', 'Medical dentist leave processed; extensions granted.'],
            ['ST-2026-BTECH-042', 'Rohan Sharma', '6th Sem', '74.2%', '0 sessions', 'New cohort assign; scheduled check-in planned.'],
          ]
        };
      case 'monthly':
        return {
          headers: ['Calendar Month', 'Total Enrolled Cohort', 'Completed Sessions', 'Canceled Sessions', 'Follow-up Success Rate'],
          rows: [
            ['July 2026 (Active)', '5 students', '3 completed', '0 canceled', '85% check-in rate'],
            ['June 2026', '4 students', '30 completed', '3 canceled', '91% check-in rate'],
            ['May 2026', '4 students', '22 completed', '1 canceled', '88% check-in rate'],
            ['April 2026', '3 students', '25 completed', '4 canceled', '92% check-in rate'],
          ]
        };
      case 'department':
        return {
          headers: ['Department Branch', 'Total Assessed Students', 'High/Critical Risk Density', 'Medium Threat Density', 'Active Counselor Assignments'],
          rows: [
            ['Computer Science & Eng', '24 students', '4 High / 1 Critical', '6 Medium', 'Dr. Sunita Sharma (Direct Cohort)'],
            ['Information Technology', '18 students', '1 High / 0 Critical', '4 Medium', 'Dr. Anand Venkatraman'],
            ['Mechanical Engineering', '8 students', '0 High / 0 Critical', '2 Medium', 'Dr. Sunita Sharma (Rerouted)'],
            ['Business Administration', '6 students', '0 High / 0 Critical', '1 Medium', 'Unassigned'],
          ]
        };
      case 'risk_improvement':
        return {
          headers: ['Student Name', 'Initial ML Risk Index', 'Post-Intervention Index', 'Attendance recovery', 'Current Academic Status'],
          rows: [
            ['Priyanka Nair', '78% (High)', '65% (Medium)', '+4.5% (62.5%)', 'Rehab study path active'],
            ['Neha Sen', '92% (Critical)', '90% (Critical)', '0.0% (Stabilized)', 'Hard crisis program monitoring'],
            ['Aisha Patel', '72% (High)', '52% (Medium)', '+8.0% (58.0%)', 'Medical recovery; caught up on CS-3004'],
            ['Rohan Sharma', '42% (Medium)', '38% (Low)', '+1.2% (74.2%)', 'Sports balance approved'],
          ]
        };
      default:
        return { headers: [], rows: [] };
    }
  }, [selectedReport]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Reports & Data compiler</h3>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Export official counselor audit logs and academic retention reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories checklist selector */}
        <div className="lg:col-span-5 space-y-3.5">
          {reportsList.map((rep) => {
            const Icon = rep.icon;
            const isSelected = selectedReport === rep.id;

            return (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`w-full text-left p-4 rounded-xl border transition duration-200 cursor-pointer flex gap-4 ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-sm text-primary'
                    : 'bg-surface-container-low/50 hover:bg-surface-container/40 border-outline-variant/35 text-on-surface'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-black uppercase tracking-wider">{rep.title}</h4>
                  <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                    {rep.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live tabular Preview window */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 flex flex-row items-center justify-between p-lg">
              <div>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Live PDF Table Preview</span>
                <CardTitle className="text-xs font-black text-on-surface mt-1 uppercase">
                  {reportsList.find(r => r.id === selectedReport)?.title}
                </CardTitle>
              </div>

              {/* Download trigger button */}
              <Button
                onClick={handleGenerate}
                loading={generateReportMutation.isPending}
                variant="primary"
                size="sm"
                className="text-xs font-black gap-1.5 h-9"
              >
                <Download className="h-4 w-4" /> Export Excel
              </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/40 border-b border-outline-variant/40">
                    {reportPreviewContent.headers.map((head, hidx) => (
                      <th key={hidx} className="p-3 text-[10px] font-black uppercase text-on-surface-variant select-none">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-semibold text-on-surface/90">
                  {reportPreviewContent.rows.map((row, ridx) => (
                    <tr key={ridx} className="hover:bg-surface-container/10 transition">
                      {row.map((cell, cidx) => (
                        <td key={cidx} className="p-3 leading-relaxed">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Watermark footprint */}
              <div className="p-4 border-t border-outline-variant/30 text-[9px] text-on-surface-variant/75 font-bold uppercase tracking-wider flex justify-between select-none">
                <span>Verified by Counselor: Dr. Sunita Sharma, Ph.D.</span>
                <span>System Compiled Date: July 12, 2026</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
