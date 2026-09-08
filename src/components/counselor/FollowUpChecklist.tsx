import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  User,
  Plus,
  Compass,
  Zap,
  Bookmark,
  CalendarDays,
  FileCheck2,
  CalendarClock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCounselorFollowups, useToggleFollowupStatus } from '../../hooks/useCounselorData';
import { FollowUpItem } from '../../types';

export function FollowUpChecklist() {
  const { data: followups, isLoading } = useCounselorFollowups();
  const toggleStatusMutation = useToggleFollowupStatus();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredFollowups = React.useMemo(() => {
    if (!followups) return [];
    if (activeFilter === 'all') return followups;
    return followups.filter(f => f.status === activeFilter);
  }, [followups, activeFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/4" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface-container rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: FollowUpItem['priority']) => {
    switch (priority) {
      case 'high': return 'bg-rose-500/10 text-rose-600 border-rose-500/15';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/15';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Follow-up checklists</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Continuous verification monitoring for student recovery paths.</p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-surface-container p-1 rounded-lg gap-1 border border-outline-variant/30 select-none">
          {[
            { id: 'all', label: 'All Actions' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-md transition ${
                activeFilter === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {filteredFollowups.length > 0 ? (
          filteredFollowups.map((item) => {
            const isCompleted = item.status === 'completed';
            return (
              <Card
                key={item.id}
                className={`border border-outline-variant/60 transition duration-200 ${
                  isCompleted ? 'bg-surface-container/10 border-outline-variant/30' : 'bg-surface-container-lowest hover:border-primary/20'
                }`}
              >
                <div className="p-lg flex items-start gap-4">
                  {/* Dynamic check button */}
                  <button
                    onClick={() => toggleStatusMutation.mutate(item.id)}
                    className="mt-1 flex items-center justify-center h-5 w-5 rounded-md border border-outline-variant hover:border-primary hover:bg-primary/5 transition focus:outline-none cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-sm bg-transparent group-hover:bg-primary/20" />
                    )}
                  </button>

                  {/* Description body */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-sans font-black text-sm text-on-surface ${isCompleted ? 'line-through text-on-surface-variant/70' : ''}`}>
                        {item.studentName}
                      </h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                    </div>

                    <p className={`font-medium text-on-surface-variant leading-relaxed text-xs ${isCompleted ? 'text-on-surface-variant/60' : ''}`}>
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider pt-1.5 select-none">
                      <span className="flex items-center gap-1 text-rose-500 font-extrabold"><CalendarClock className="h-3.5 w-3.5" /> Due date: {item.dueDate}</span>
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[9px] font-extrabold text-on-surface">Next action: {item.nextAction}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-outline-variant rounded-lg bg-surface-container/15">
            <FileCheck2 className="h-10 w-10 text-on-surface-variant/40 mx-auto" />
            <h4 className="font-sans text-sm font-bold text-on-surface mt-3">All followups cleared</h4>
            <p className="text-xs text-on-surface-variant mt-1">Intervention milestones are up-to-date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
