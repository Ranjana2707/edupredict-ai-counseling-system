import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingDown,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Layers,
  Activity,
  History,
  GraduationCap,
  Cpu,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getRiskColorClass } from '../utils';
import { useFacultyStudents, useFacultyStats } from '../hooks/useFacultyData';
import { StudentDetailsDrawer } from '../components/faculty/StudentDetailsDrawer';
import { AIPredictionWorkspace } from '../components/analytics/AIPredictionWorkspace';
import { ModelPerformance } from '../components/analytics/ModelPerformance';
import { predictionService } from '../services/predictionService';
import { ModelPerformanceMetrics } from '../types/prediction';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function RiskAnalyticsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Multi-tab workspace navigation state
  const [activeTab, setActiveTab] = useState<'individual' | 'cohort' | 'model'>('individual');
  const [modelMetrics, setModelMetrics] = useState<ModelPerformanceMetrics | null>(null);

  const { data: students, isLoading } = useFacultyStudents();
  const { data: stats } = useFacultyStats();

  // Load model performance telemetry on mount
  useEffect(() => {
    predictionService.getModelMetrics().then((m) => {
      setModelMetrics(m);
    });
  }, []);

  if (isLoading || !students || !stats || !modelMetrics) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-container animate-pulse rounded-md w-1/4" />
        <div className="h-96 bg-surface-container animate-pulse rounded-lg" />
      </div>
    );
  }

  // Risk Distribution Count for Recharts Bar
  const riskCountsData = [
    { name: 'Low Risk', count: stats.lowRiskStudents, fill: '#10B981' },
    { name: 'Medium Risk', count: stats.mediumRiskStudents, fill: '#F59E0B' },
    { name: 'High & Critical', count: stats.highRiskStudents, fill: '#EF4444' }
  ];

  // Department-wise risk breakdown
  const deptRiskData = [
    { name: 'Comp Sci', High: 8, Medium: 15, Low: 42 },
    { name: 'Info Tech', High: 6, Medium: 11, Low: 28 },
    { name: 'Elec Eng', High: 3, Medium: 5, Low: 12 },
    { name: 'Mech Eng', High: 1, Medium: 3, Low: 8 }
  ];

  // Semester risk level comparison
  const semesterRiskData = [
    { name: '1st Year', High: 2, Medium: 8, Low: 35 },
    { name: '2nd Year', High: 5, Medium: 12, Low: 30 },
    { name: '3rd Year', High: 11, Medium: 14, Low: 25 }
  ];

  // Cohort Risk Timeline: representing average risk score index as semester progresses
  const cohortRiskTimeline = [
    { week: 'Week 2', avgScore: 15 },
    { week: 'Week 4', avgScore: 18 },
    { week: 'Week 6', avgScore: 24 },
    { week: 'Week 8', avgScore: 32 },
    { week: 'Week 10', avgScore: 38 }
  ];

  const filteredHistory = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || student.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Risk Analytics"
        description="Complex cohort risk trend analysis with machine learning feature importances, prediction confidences, and intervention tracking."
        breadcrumbs={[{ label: 'Risk Analytics', path: '/risk-analytics' }]}
        actions={
          <div className="flex items-center gap-2 select-none">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active ML Engine: Online
            </span>
          </div>
        }
      />

      {/* Main Mode Navigation Bar */}
      <div className="flex border-b border-outline-variant/30 select-none bg-surface-container/10 p-1.5 rounded-xl border border-outline-variant/30">
        {[
          { id: 'individual', label: 'AI Prediction Center', icon: <Cpu className="h-4 w-4 shrink-0" /> },
          { id: 'cohort', label: 'Cohort Risk Distribution', icon: <PieIcon className="h-4 w-4 shrink-0" /> },
          { id: 'model', label: 'Model Performance Metrics', icon: <Activity className="h-4 w-4 shrink-0" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-xs font-black uppercase tracking-wider transition cursor-pointer flex-1 justify-center sm:flex-initial ${
              activeTab === tab.id
                ? 'bg-primary text-surface-container-lowest'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Render Switcher */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'individual' && (
            <AIPredictionWorkspace />
          )}

          {activeTab === 'cohort' && (
            <div className="space-y-6">
              {/* Analytics KPIs Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-1.5 p-lg">
                    <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-primary">
                      Average ML Confidence
                    </CardDescription>
                    <CardTitle className="text-3xl font-black mt-1">94.8%</CardTitle>
                  </CardHeader>
                  <CardContent className="px-lg pb-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Variance index of cohort feature vectors evaluated against historic graduation matrices.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1.5 p-lg">
                    <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-amber-500">
                      Trigger Warnings Sent
                    </CardDescription>
                    <CardTitle className="text-3xl font-black mt-1">12 Warnings</CardTitle>
                  </CardHeader>
                  <CardContent className="px-lg pb-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Auto-dispatched attendance/performance alerts to critical risk students this month.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1.5 p-lg">
                    <CardDescription className="uppercase tracking-wider font-extrabold text-[10px] text-rose-500">
                      Counseling Referrals
                    </CardDescription>
                    <CardTitle className="text-3xl font-black mt-1">8 Reassigned</CardTitle>
                  </CardHeader>
                  <CardContent className="px-lg pb-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Students successfully routed and checked-in with official university psychological counseling.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Cohort Risk Density Distribution</CardTitle>
                    <CardDescription>Breakdown of enrolled students by classified risk category</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskCountsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40}>
                          {riskCountsData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cohort Risk Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Overall Class Risk Score Trajectory</CardTitle>
                    <CardDescription>Average predictive risk index as semester weeks progress</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cohortRiskTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cohortRiskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="week" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="avgScore" stroke="#3B82F6" fillOpacity={1} fill="url(#cohortRiskGrad)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Department-wise Risk stacked chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Department-wise Risk Distribution</CardTitle>
                    <CardDescription>Risk profile comparisons between engineering branches</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Low" stackId="a" fill="#10B981" />
                        <Bar dataKey="Medium" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="High" stackId="a" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Semester-wise Risk grouped chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Semester-wise Risk Comparison</CardTitle>
                    <CardDescription>Yearly classified student distribution matrices</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={semesterRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Low" fill="#10B981" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="Medium" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="High" fill="#EF4444" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Prediction History Records */}
              <Card>
                <CardHeader className="pb-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Historical System Predictions Logs</CardTitle>
                    <CardDescription>Verify previous machine learning execution outcomes and recommendation records</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search history by name..."
                      className="w-48 h-8 text-xs pl-8"
                    />
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="text-[10px] h-8 bg-surface-container border border-outline rounded px-2 font-bold focus:outline-primary"
                    >
                      <option value="all">All Risks</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-surface-container/60">
                        <tr>
                          <th className="p-4 font-sans font-extrabold text-on-surface-variant">Prediction Target</th>
                          <th className="p-4 font-sans font-extrabold text-on-surface-variant">Prediction Date</th>
                          <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Confidence Score</th>
                          <th className="p-4 font-sans font-extrabold text-on-surface-variant text-center">Intervention Recommendations</th>
                          <th className="p-4 font-sans font-extrabold text-on-surface-variant text-right">Details Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {(filteredHistory || []).map((student) => {
                          const latestPrediction = student?.predictionHistory?.[0] || {
                            date: '2026-07-11',
                            confidence: 90.0,
                            recommendations: ['Maintain academic track']
                          };
                          return (
                            <tr key={student.id} className="hover:bg-surface-container/20 transition">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {student?.name ? student.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                                  </div>
                                  <div>
                                    <p className="font-sans font-bold text-on-surface">{student.name}</p>
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getRiskColorClass(student.riskLevel)}`}>
                                      {student.riskLevel}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-on-surface-variant">{latestPrediction.date}</td>
                              <td className="p-4 text-center font-mono font-black text-primary">{latestPrediction.confidence}%</td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1 justify-center max-w-[280px] mx-auto">
                                  {(latestPrediction?.recommendations || []).map((rec: string, i: number) => (
                                    <span key={i} className="text-[9px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold border border-outline-variant/30">
                                      {rec}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  onClick={() => setSelectedStudent(student)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[11px] font-bold text-primary"
                                >
                                  View Profile
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Slide Drawer detail check */}
              <StudentDetailsDrawer
                student={selectedStudent}
                isOpen={selectedStudent !== null}
                onClose={() => setSelectedStudent(null)}
              />
            </div>
          )}

          {activeTab === 'model' && (
            <ModelPerformance metrics={modelMetrics} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
