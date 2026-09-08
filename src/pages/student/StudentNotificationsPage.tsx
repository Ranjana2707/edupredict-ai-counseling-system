import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  ShieldAlert,
  Sparkles,
  Search
} from 'lucide-react';
import {
  useStudentNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

export default function StudentNotificationsPage() {
  const { data: notifications, isLoading } = useStudentNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Filters State
  const [activeCategory, setActiveCategory] = useState<'all' | 'risk' | 'attendance' | 'assignment' | 'counseling'>('all');

  if (isLoading || !notifications) {
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
  const total = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.type === activeCategory;
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case 'attendance':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'assignment':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'counseling':
        return <Clock className="h-5 w-5 text-secondary" />;
      default:
        return <Bell className="h-5 w-5 text-outline" />;
    }
  };

  const getTypeStyle = (type: string, isRead: boolean) => {
    if (isRead) return 'border-outline-variant/40 bg-surface-container-low/20 opacity-70';
    switch (type) {
      case 'risk':
        return 'border-rose-500/35 bg-rose-500/5 shadow-sm shadow-rose-500/5';
      case 'attendance':
        return 'border-amber-500/35 bg-amber-500/5 shadow-sm shadow-amber-500/5';
      case 'assignment':
        return 'border-primary/35 bg-primary/5 shadow-sm shadow-primary/5';
      case 'counseling':
        return 'border-secondary/35 bg-secondary/5 shadow-sm shadow-secondary/5';
      default:
        return 'border-outline-variant bg-surface-container-lowest';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert & Notification Hub"
        description="Monitor active risk alerts, lecture shortages, overdue assignments, and counselor responses."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Notification Registry', path: '/student/notifications' }
        ]}
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="h-9">
              <CheckCheck className="h-4.5 w-4.5" />
              Mark All Read
            </Button>
          )
        }
      />

      {/* Grid: Main alerts vs category selectors */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Category filters layout */}
        <div>
          <Card>
            <CardHeader className="pb-3 border-b border-outline-variant/40">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-on-surface">
                Alert Categorization
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-3 space-y-1.5 select-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-default transition-all flex items-center justify-between ${
                  activeCategory === 'all'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span>All Alerts</span>
                <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50">
                  {total}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('risk')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-default transition-all flex items-center justify-between ${
                  activeCategory === 'risk'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Risk Triggers
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-rose-500">
                  {notifications.filter((n) => n.type === 'risk').length}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('attendance')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-default transition-all flex items-center justify-between ${
                  activeCategory === 'attendance'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Attendance
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-amber-500">
                  {notifications.filter((n) => n.type === 'attendance').length}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('assignment')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-default transition-all flex items-center justify-between ${
                  activeCategory === 'assignment'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Coursework
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-primary">
                  {notifications.filter((n) => n.type === 'assignment').length}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('counseling')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-default transition-all flex items-center justify-between ${
                  activeCategory === 'counseling'
                    ? 'bg-secondary/10 text-secondary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  Counseling
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-secondary">
                  {notifications.filter((n) => n.type === 'counseling').length}
                </span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications list */}
        <div className="md:col-span-3 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-4 rounded-lg border transition-all flex items-start gap-4 ${getTypeStyle(
                    n.type,
                    n.isRead
                  )}`}
                >
                  <div className="shrink-0 p-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-sans text-sm font-extrabold text-on-surface">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-outline font-bold">{n.date}</span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 h-7 px-2.5 rounded border border-outline-variant hover:border-primary/30 hover:bg-primary/5 text-[10px] font-extrabold text-primary uppercase transition-all flex items-center gap-1 cursor-pointer"
                      title="Dismiss alert"
                    >
                      <Check className="h-3 w-3" />
                      Mark Read
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-on-surface-variant font-medium text-xs">
                  No alerts listed under the selected category.
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
