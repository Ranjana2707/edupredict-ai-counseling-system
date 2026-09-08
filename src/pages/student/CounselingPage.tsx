import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Compass,
  FileText,
  PlusCircle,
  CheckCircle,
  HelpCircle,
  Video,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useStudentCounseling, useBookCounselingSession } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

export default function CounselingPage() {
  const { data: sessions, isLoading } = useStudentCounseling();
  const bookSessionMutation = useBookCounselingSession();

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState('Dr. Aris Thorne');
  const [bookingDate, setBookingDate] = useState('2026-07-21');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingMode, setBookingMode] = useState<'In-Person' | 'Virtual'>('In-Person');

  // Past Notes Expanded State
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  if (isLoading || !sessions) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse bg-surface-container-highest/40 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2"><CardSkeleton /></div>
          <div><CardSkeleton /></div>
        </div>
      </div>
    );
  }

  const upcoming = sessions.filter((s) => s.status === 'Confirmed' || s.status === 'Pending');
  const past = sessions.filter((s) => s.status === 'Completed' || s.status === 'Cancelled');

  const handleBookSessionSubmit = (e: FormEvent) => {
    e.preventDefault();
    bookSessionMutation.mutate(
      {
        counselorName: selectedCounselor,
        date: bookingDate,
        time: bookingTime,
        mode: bookingMode,
        location: bookingMode === 'In-Person' ? 'Counseling Wing, C-Block, Office 103' : 'Secure Google Meet Video Link',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counseling & Academic Support"
        description="Schedule advising checkpoints, check diagnostic counselor summaries, and track intervention timelines."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Counseling Core', path: '/student/counseling' }
        ]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="h-4.5 w-4.5" />
            Schedule Dialogue
          </Button>
        }
      />

      {/* Grid: Upcoming vs History & notes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Appointments & History */}
        <div className="md:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <CardTitle className="text-base font-extrabold">Active Advising Bookings</CardTitle>
              <CardDescription>Scheduled support sessions to preserve retention metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {upcoming.length > 0 ? (
                upcoming.map((session) => (
                  <div
                    key={session.id}
                    className="p-5 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <h4 className="font-sans text-sm font-extrabold text-on-surface">
                            {session.counselorName}
                          </h4>
                          <p className="font-sans text-[10px] text-outline uppercase font-extrabold">
                            Lead Academic Counselor
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-x-4 gap-y-1 grid-cols-2 text-xs font-semibold text-on-surface-variant">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-outline" />
                          {session.date}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-outline" />
                          {session.time}
                        </p>
                        <p className="flex items-center gap-1.5 col-span-2">
                          <Compass className="h-4 w-4 text-outline" />
                          {session.mode} ({session.location})
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/15">
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-outline-variant rounded-lg">
                  <p className="text-xs text-on-surface-variant font-medium">
                    No active counseling appointments scheduled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Sessions with Expandable notes */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <CardTitle className="text-base font-extrabold">Advising Log History</CardTitle>
              <CardDescription>Expand past logs to review counseling guidance and action items</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3.5">
              {past.map((session) => {
                const isExpanded = expandedSession === session.id;
                return (
                  <div
                    key={session.id}
                    className="rounded-lg border border-outline-variant/40 bg-surface-container-low/40 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-all text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans text-sm font-extrabold text-on-surface">
                            {session.counselorName}
                          </h4>
                          <span className="text-[9px] uppercase font-bold bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded text-on-surface-variant">
                            {session.date}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-on-surface-variant font-medium">
                          Session Core: Student stress and workload management.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 select-none">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 text-outline">
                          {session.status}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-outline" /> : <ChevronDown className="h-4 w-4 text-outline" />}
                      </div>
                    </button>

                    {/* Expandable diagnostic notes */}
                    {isExpanded && (
                      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest/80 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <FileText className="h-4 w-4" />
                          <span>Counselor Clinical Summary & Diagnoses</span>
                        </div>
                        <p className="font-sans text-on-surface-variant font-semibold leading-relaxed p-3 bg-surface-container/50 rounded border border-outline-variant/40">
                          {session.notes || 'No counselor diagnostics logged for this dialogue.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right side vertical Timeline tracker */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                Support Timeline Trace
              </CardTitle>
              <CardDescription>
                Chronological diagnostic flow of student counselor sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Timeline Items */}
              <div className="relative border-l-2 border-outline-variant pl-5 space-y-6 ml-2 select-none">
                <div className="relative">
                  <div className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface">July 14, 2026</p>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      <strong>Algorithms Attendance Slip Recovery</strong> (Confirmed Slot)
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface">June 18, 2026</p>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      <strong>Stress & Workload Recovery</strong> (Completed Session)
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface">May 12, 2026</p>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      <strong>Academic Onboarding Alignment</strong> (Completed Onboarding)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-outline-variant p-lg">
                <h3 className="font-sans text-base font-extrabold text-on-surface">
                  Book Counseling Dialogue Slot
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBookSessionSubmit} className="p-lg space-y-4">
                <div>
                  <label htmlFor="counselor" className="block text-xs font-extrabold text-on-surface uppercase mb-1.5">
                    Lead Advisor
                  </label>
                  <Select
                    id="counselor"
                    value={selectedCounselor}
                    onChange={(e) => setSelectedCounselor(e.target.value)}
                    options={[
                      { value: 'Dr. Anand Venkatraman', label: 'Dr. Anand Venkatraman (Academic Support Lead)' },
                      { value: 'Dr. Sunita Sharma', label: 'Dr. Sunita Sharma (Student Wellness Lead)' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-xs font-extrabold text-on-surface uppercase mb-1.5">
                      Select Date
                    </label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-xs font-extrabold text-on-surface uppercase mb-1.5">
                      Select Time
                    </label>
                    <Input
                      id="time"
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-on-surface uppercase mb-1.5">
                    Mode of Dialogue
                  </label>
                  <div className="grid grid-cols-2 gap-3.5 select-none">
                    <button
                      type="button"
                      onClick={() => setBookingMode('In-Person')}
                      className={`h-11 flex items-center justify-center gap-2 border rounded-default text-xs font-bold uppercase transition-all cursor-pointer ${
                        bookingMode === 'In-Person'
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <User className="h-4.5 w-4.5" />
                      In-Person (Block C)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingMode('Virtual')}
                      className={`h-11 flex items-center justify-center gap-2 border rounded-default text-xs font-bold uppercase transition-all cursor-pointer ${
                        bookingMode === 'Virtual'
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Video className="h-4.5 w-4.5" />
                      Virtual (Google Meet)
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="text-xs"
                    isLoading={bookSessionMutation.isPending}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
