import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  User,
  Plus,
  Compass,
  AlertTriangle,
  MapPin,
  Bookmark
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCounselorSessions } from '../../hooks/useCounselorData';
import { CounselingSession } from '../../types';

export function SessionCalendar() {
  const { data: sessions, isLoading } = useCounselorSessions();
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-12'); // Focus date
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, upcoming, completed, cancelled

  // Setup static grid calendar parameters for July 2026
  // July 2026 starts on a Wednesday (3rd index of week days: Sun=0, Mon=1, Tue=2, Wed=3)
  const daysInJuly = 31;
  const startDayOffset = 3;

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map session list to dates
  const sessionsByDate = useMemo(() => {
    if (!sessions) return {} as Record<string, CounselingSession[]>;

    const map: Record<string, CounselingSession[]> = {};
    sessions.forEach(s => {
      // Filter out status if needed
      if (filterStatus !== 'all' && s.status !== filterStatus) return;

      if (!map[s.date]) {
        map[s.date] = [];
      }
      map[s.date].push(s);
    });
    return map;
  }, [sessions, filterStatus]);

  const activeDaySessions = useMemo(() => {
    return sessionsByDate[selectedDate] || [];
  }, [sessionsByDate, selectedDate]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 h-80 bg-surface-container rounded-md" />
          <div className="md:col-span-4 h-80 bg-surface-container rounded-md" />
        </div>
      </div>
    );
  }

  const getTypeColor = (type: CounselingSession['type']) => {
    switch (type) {
      case 'academic': return 'bg-blue-500/10 text-blue-600 border border-blue-500/15';
      case 'psychological': return 'bg-pink-500/10 text-pink-600 border border-pink-500/15';
      case 'financial': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15';
      case 'attendance': return 'bg-amber-500/10 text-amber-600 border border-amber-500/15';
      default: return 'bg-purple-500/10 text-purple-600 border border-purple-500/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Intervention Session Calendar</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">July 2026 &bull; Schedule dashboard</p>
        </div>

        <div className="flex items-center gap-2 border border-outline-variant rounded-md bg-surface-container-lowest px-3 py-1.5 shrink-0 select-none">
          <Filter className="h-4 w-4 text-on-surface-variant/70 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent border-0 font-sans text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="all">All Session States</option>
            <option value="upcoming">Show: Scheduled (Upcoming)</option>
            <option value="completed">Show: Completed Outcomes</option>
            <option value="cancelled">Show: Cancelled Slots</option>
          </select>
        </div>
      </div>

      {/* Main Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Grid Calendar */}
        <div className="lg:col-span-8">
          <Card className="p-4 bg-surface-container-lowest">
            {/* Calendar Header Month Name */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/35 mb-4 select-none">
              <h4 className="font-sans text-xs font-black uppercase text-on-surface tracking-wider">July 2026</h4>
              <div className="flex gap-1.5">
                <Button disabled variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <ChevronLeft className="h-4 w-4 text-on-surface-variant/40" />
                </Button>
                <Button disabled variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                </Button>
              </div>
            </div>

            {/* Week Days Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-sans text-[10px] font-black uppercase text-on-surface-variant tracking-wider mb-2">
              {weekdays.map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Day grid boxes */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding offset */}
              {Array.from({ length: startDayOffset }).map((_, idx) => (
                <div key={`offset-${idx}`} className="aspect-square bg-surface-container-low/20 rounded-md border border-transparent" />
              ))}

              {/* Day entries */}
              {Array.from({ length: daysInJuly }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `2026-07-${dayNum.toString().padStart(2, '0')}`;
                const hasSessions = sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0;
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square p-1.5 flex flex-col justify-between rounded-md border transition duration-200 text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-sm text-primary'
                        : 'bg-surface-container-low/40 hover:bg-surface-container/60 border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <span className="text-xs font-mono font-black">{dayNum}</span>

                    {/* Micro dot alerts for counseling items */}
                    <div className="flex gap-1 flex-wrap mt-auto">
                      {hasSessions && sessionsByDate[dateStr].map((sess, sidx) => (
                        <span
                          key={sidx}
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            sess.status === 'upcoming' ? 'bg-primary' :
                            sess.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={`${sess.studentName} (${sess.type})`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Day Timelines list */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-surface-container/10 border-b border-outline-variant/30">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest block">Interventions Logged</span>
              <CardTitle className="text-xs font-black text-on-surface mt-1 uppercase">Date: {selectedDate}</CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-outline-variant/30">
                {activeDaySessions.length > 0 ? (
                  activeDaySessions.map((session) => (
                    <div key={session.id} className="p-4 space-y-2 hover:bg-surface-container/15 transition">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-on-surface-variant"><Clock className="h-3 w-3" /> {session.time} ({session.duration}m)</span>
                        <span className={`px-1.5 py-0.2 rounded ${
                          session.status === 'upcoming' ? 'bg-primary/5 text-primary' :
                          session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {session.status}
                        </span>
                      </div>

                      <h5 className="font-sans font-black text-xs text-on-surface">{session.studentName}</h5>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${getTypeColor(session.type)} block w-fit capitalize`}>
                        {session.type} counseling
                      </span>

                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed line-clamp-3">
                        {session.notes}
                      </p>

                      {session.outcome && (
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          <strong>Outcome:</strong> {session.outcome}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-on-surface-variant text-xs">
                    No active sessions scheduled on this day.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
