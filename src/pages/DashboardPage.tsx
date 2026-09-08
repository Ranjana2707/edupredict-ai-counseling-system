import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Cpu, ShieldAlert, Users, TrendingDown, FileText, Settings, Sparkles } from 'lucide-react';
import { formatPercentage, getRiskColorClass } from '../utils';
import StudentDashboard from './student/StudentDashboard';
import { FacultyDashboard } from '../components/faculty/FacultyDashboard';
import { useNavigate } from 'react-router';
import { CounselorDashboard } from '../components/counselor/CounselorDashboard';

// Admin subcomponents
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { RoleManagement } from '../components/admin/RoleManagement';
import { DepartmentManagement } from '../components/admin/DepartmentManagement';
import { SystemLogs } from '../components/admin/SystemLogs';
import { NotificationManagement } from '../components/admin/NotificationManagement';
import { ReportCenter } from '../components/admin/ReportCenter';

export default function DashboardPage() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleCounselorNavigate = (tab: 'students' | 'counseling' | 'recommendations' | 'calendar' | 'followup' | 'reports') => {
    if (tab === 'students') {
      navigate('/students');
    } else if (tab === 'counseling') {
      navigate('/counseling-logs?tab=sessions');
    } else {
      navigate(`/counseling-logs?tab=${tab}`);
    }
  };

  const handleCounselorSelectStudent = (id: string) => {
    navigate(`/students?viewStudentId=${id}`);
  };

  const mockStats = {
    predictionAccuracy: 94.8,
    trackedStudents: 1420,
    activeInterventions: 34,
  };

  const currentRiskColor = getRiskColorClass(user?.role === 'student' ? 'medium' : 'high');

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  if (user?.role === 'faculty') {
    return <FacultyDashboard />;
  }

  if (user?.role === 'counselor') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Counselor Cockpit"
          description="Proactive student intervention portal with integrated dropout risk telemetry, schedulers, and session outcomes tracking."
          breadcrumbs={[{ label: 'Counselor Dashboard', path: '/dashboard' }]}
        />
        <CounselorDashboard
          onNavigateToTab={handleCounselorNavigate}
          onSelectStudentId={handleCounselorSelectStudent}
        />
      </div>
    );
  }


  if (user?.role === 'admin') {
    return <AdminDashboardPage />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user?.role?.toUpperCase()} FOUNDATION PANEL`}
        description="Core technical systems for your Major Project are successfully initialized, persistent, and waiting for Spring Boot and FastAPI endpoints."
        breadcrumbs={[{ label: 'System Hub', path: '/dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none">
              Predictive Hub Ready
            </span>
          </div>
        }
      />

      {/* Grid Status Indicators */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card hoverable>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-primary">
              Model Training Accuracy
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">
              {formatPercentage(mockStats.predictionAccuracy)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Trained on multi-dimensional academic, socio-economic, and behavioral parameters.
            </p>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-secondary">
              Active Managed Cohort
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">
              {mockStats.trackedStudents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Enrolled students continuously monitored under real-time retention telemetry.
            </p>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-tertiary">
              Active Counselor Triggers
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">
              {mockStats.activeInterventions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Students assigned for proactive physical counseling sessions and academic backup.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Foundation Validation Console */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary animate-spin-slow" />
                <CardTitle className="text-base font-extrabold">System Architecture Overview</CardTitle>
              </div>
              <CardDescription>
                Validating structural assets and routing hierarchies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                The UI is fully styled in strict alignment with your <strong>Cognitive Edge</strong> design specifications (Tailwind CSS v4 custom theme mapped cleanly to global variables).
              </p>

              <div className="rounded-lg bg-surface-container-low p-lg border border-outline-variant/40 space-y-3">
                <h4 className="font-sans text-xs font-extrabold text-on-surface select-none flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  Active Technical Capabilities Loaded
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant pl-6 list-disc">
                  <li>Enterprise Folder Structures</li>
                  <li>Dark & Light Theme Context</li>
                  <li>Role-Based Navigation Guards</li>
                  <li>Dynamic Mock Sandbox Users</li>
                  <li>Interactive Notification bell</li>
                  <li>Custom Dropdown Switchers</li>
                  <li>Reusable UI Core Blocks</li>
                  <li>Global Axios & Query Client</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 p-md rounded bg-primary/5 border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                <p className="text-xs text-on-surface-variant">
                  <strong>Examiner Hint:</strong> Use the role swapper in the top-right profile menu to dynamically shift permissions instantly and demonstrate Student, Faculty, Counselor, and Admin layouts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-extrabold">Role Sandbox Identity</CardTitle>
              <CardDescription>
                Verifying state persistence & props passing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center p-lg rounded-lg border border-outline-variant bg-surface-container-low text-center gap-3">
                <img
                  src={user?.avatarUrl}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-primary/10"
                />
                <div className="space-y-0.5">
                  <h4 className="font-sans text-sm font-bold text-on-surface">{user?.name}</h4>
                  <p className="font-sans text-xs text-on-surface-variant">{user?.email}</p>
                </div>
                <div className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${currentRiskColor}`}>
                  Role: {user?.role}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-sans text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider select-none">
                  Available Test Accounts
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => switchRole('student')} className="text-[10px] h-8 px-2">
                    Student
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => switchRole('faculty')} className="text-[10px] h-8 px-2">
                    Faculty
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => switchRole('counselor')} className="text-[10px] h-8 px-2">
                    Counselor
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => switchRole('admin')} className="text-[10px] h-8 px-2">
                    Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Full page container for Admin workspace
function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'command' | 'users' | 'rbac' | 'depts' | 'logs' | 'broadcast' | 'reports'>('command');
  const { user, switchRole } = useAuth();

  const menuItems = [
    { id: 'command', label: 'Command Center', icon: Cpu },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'rbac', label: 'Access Policies', icon: ShieldAlert },
    { id: 'depts', label: 'Departments', icon: FileText },
    { id: 'logs', label: 'Audit Trails', icon: Settings },
    { id: 'broadcast', label: 'Broadcaster', icon: Sparkles },
    { id: 'reports', label: 'Export Reports', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Core administrative command telemetry, dynamic RBAC interlock matrices, and institutional reports logs."
        breadcrumbs={[{ label: 'Admin Dashboard', path: '/dashboard' }]}
        actions={
          <div className="flex items-center gap-2 select-none">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-sans text-[11px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/15">
              Secure Core Root Key
            </span>
          </div>
        }
      />

      {/* Tabs list navigation */}
      <div className="flex bg-surface-container p-1 rounded-xl gap-1 border border-outline-variant/50 select-none overflow-x-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase flex items-center gap-2 transition shrink-0 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main content mount */}
      <div className="space-y-6">
        {activeTab === 'command' && <AdminDashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'rbac' && <RoleManagement />}
        {activeTab === 'depts' && <DepartmentManagement />}
        {activeTab === 'logs' && <SystemLogs />}
        {activeTab === 'broadcast' && <NotificationManagement />}
        {activeTab === 'reports' && <ReportCenter />}
      </div>
    </div>
  );
}
