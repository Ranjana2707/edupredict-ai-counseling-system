import { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  Layers,
  Search,
  Sparkles
} from 'lucide-react';
import { useStudentAssignments } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export default function AssignmentPage() {
  const { data: assignments, isLoading, refetch } = useStudentAssignments();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [search, setSearch] = useState('');

  if (isLoading || !assignments) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse bg-surface-container-highest/40 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Statistics
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const pending = assignments.filter((a) => a.status === 'pending').length;
  const overdue = assignments.filter((a) => a.status === 'overdue').length;

  const filteredAssignments = assignments.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUploadPlaceholder = (title: string) => {
    toast.success('Document Received', {
      description: `Submission queue loaded for "${title}". Document checksum verified.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments & Coursework"
        description="Verify due dates, submit deliverables, and track completion progress across your engineering courses."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Coursework Ledger', path: '/student/assignments' }
        ]}
      />

      {/* Grid: Stats & Completion Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card hoverable className="border-l-4 border-l-primary">
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-outline">
              Total Coursework
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-on-surface-variant font-medium">All components this semester.</p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed Units
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {completed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-on-surface-variant font-medium">Evaluated and grades locked.</p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Drafts
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 text-amber-600 dark:text-amber-400">
              {pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-on-surface-variant font-medium">Awaiting final upload.</p>
          </CardContent>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-1">
            <CardDescription className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Overdue Thresholds
            </CardDescription>
            <CardTitle className="text-3xl font-black mt-1 text-rose-600 dark:text-rose-400">
              {overdue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-on-surface-variant font-medium">Requires immediate submission.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtering Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-default text-xs font-semibold uppercase transition-all ${
                filter === 'all'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              All Items ({total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-default text-xs font-semibold uppercase transition-all ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              Pending ({pending})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-default text-xs font-semibold uppercase transition-all ${
                filter === 'completed'
                  ? 'bg-emerald-500 text-white font-bold shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              Completed ({completed})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 rounded-default text-xs font-semibold uppercase transition-all ${
                filter === 'overdue'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              Overdue ({overdue})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <input
              id="search-coursework"
              type="text"
              placeholder="Search coursework, subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-default border border-outline-variant bg-surface-container-lowest text-xs font-semibold focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((a) => {
            const isCompleted = a.status === 'completed';
            const isOverdue = a.status === 'overdue';
            const isPending = a.status === 'pending';

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-lg border bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all ${
                  isOverdue
                    ? 'border-rose-500/30 shadow-sm shadow-rose-500/5 hover:border-rose-500/45'
                    : isCompleted
                    ? 'border-emerald-500/15 hover:border-emerald-500/30'
                    : 'border-outline-variant/60 hover:border-primary/30'
                }`}
              >
                {/* Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold uppercase bg-surface-container border border-outline-variant/50 px-2 py-0.5 rounded text-on-surface-variant">
                      {a.subject}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                        <Check className="h-3 w-3" />
                        Submitted
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                        <Clock className="h-3 w-3" />
                        In Draft
                      </span>
                    )}
                  </div>

                  <h3 className="font-sans text-base font-extrabold text-on-surface">{a.title}</h3>

                  <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-outline" />
                      Due Date: <span className="text-on-surface font-bold">{a.dueDate}</span>
                    </span>
                    {a.score && (
                      <span className="flex items-center gap-1">
                        Score: <span className="text-emerald-500 font-black">{a.score}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Workload Progress indicators */}
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>Workload Draft Complete:</span>
                    <span>{a.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${a.progress}%` }}
                    />
                  </div>

                  {/* Submit Trigger Actions */}
                  <div className="pt-1 flex justify-end">
                    {isCompleted ? (
                      <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Receipt Locked
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        variant={isOverdue ? 'default' : 'outline'}
                        onClick={() => handleUploadPlaceholder(a.title)}
                        className="text-[11px] h-8 px-3"
                      >
                        Submit deliverable
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-on-surface-variant font-medium text-xs">
              No coursework items matching current search filters.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Homework Retention Suggestion Box */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 animate-pulse" />
        <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-semibold">
          <strong>Retention Correlation:</strong> Students submitting DP Optimization algorithms late typically experience a 0.2 GPA drop on final evaluations. Complete overdue drafts immediately.
        </p>
      </div>
    </div>
  );
}
