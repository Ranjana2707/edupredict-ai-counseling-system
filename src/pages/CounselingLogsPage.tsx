import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PageHeader } from '../components/ui/PageHeader';
import { SessionManager } from '../components/counselor/SessionManager';
import { SessionCalendar } from '../components/counselor/SessionCalendar';
import { RecommendationsEditor } from '../components/counselor/RecommendationsEditor';
import { FollowUpChecklist } from '../components/counselor/FollowUpChecklist';
import { ReportHub } from '../components/counselor/ReportHub';
import { AdvisorNotesLedger } from '../components/counselor/AdvisorNotesLedger';
import {
  CalendarDays,
  ClipboardList,
  Sparkles,
  Clock,
  FileSpreadsheet,
  Layers,
  FileCheck2,
  BookOpen,
  FileText
} from 'lucide-react';

type CounselingTab = 'notes' | 'sessions' | 'calendar' | 'recommendations' | 'followup' | 'reports';

export default function CounselingLogsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Support direct tab deep-linking from dashboard
  const [activeTab, setActiveTab] = useState<CounselingTab>('notes');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as CounselingTab;
    if (tabParam && ['notes', 'sessions', 'calendar', 'recommendations', 'followup', 'reports'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (tab: CounselingTab) => {
    setActiveTab(tab);
    // Silent update of the URL query parameter for clean back navigation
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Get deep schedule direct parameters
  const params = new URLSearchParams(location.search);
  const directScheduleId = params.get('scheduleStudentId');
  const directScheduleName = params.get('scheduleStudentName');

  const handleClearDirectSchedule = () => {
    const newParams = new URLSearchParams(location.search);
    newParams.delete('scheduleStudentId');
    newParams.delete('scheduleStudentName');
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const workspaceTabs = [
    { id: 'notes' as CounselingTab, label: 'Advisor Session Notes', icon: FileText },
    { id: 'sessions' as CounselingTab, label: 'Appointments Ledger', icon: ClipboardList },
    { id: 'calendar' as CounselingTab, label: 'Sessions Calendar', icon: CalendarDays },
    { id: 'recommendations' as CounselingTab, label: 'AI Support Plans', icon: Sparkles },
    { id: 'followup' as CounselingTab, label: 'Follow-ups Checklist', icon: FileCheck2 },
    { id: 'reports' as CounselingTab, label: 'Reports & Audits', icon: FileSpreadsheet }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counseling & Advising Workspace"
        description="Confidential advisor workstations: structured session notes with urgency flags, calendar dialogue grids, and intervention diaries stored in Firestore."
        breadcrumbs={[{ label: 'Counseling Logs', path: '/counseling-logs' }]}
      />

      {/* Horizontal Nav Bar Tabs */}
      <div className="flex border-b border-outline-variant pb-px gap-1.5 overflow-x-auto select-none">
        {workspaceTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-sans text-xs font-black uppercase tracking-wider transition-all duration-200 border-b-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Component */}
      <div className="pt-2">
        {activeTab === 'notes' && <AdvisorNotesLedger />}
        {activeTab === 'sessions' && (
          <SessionManager
            directScheduleStudentId={directScheduleId}
            directScheduleStudentName={directScheduleName}
            onClearDirectSchedule={handleClearDirectSchedule}
          />
        )}
        {activeTab === 'calendar' && <SessionCalendar />}
        {activeTab === 'recommendations' && <RecommendationsEditor />}
        {activeTab === 'followup' && <FollowUpChecklist />}
        {activeTab === 'reports' && <ReportHub />}
      </div>
    </div>
  );
}
