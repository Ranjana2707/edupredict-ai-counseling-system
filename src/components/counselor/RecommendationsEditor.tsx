import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Award,
  GraduationCap,
  ShieldAlert,
  Edit2,
  Check,
  X,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  HeartPulse,
  CalendarDays
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCounselorRecommendations, useUpdateRecommendation } from '../../hooks/useCounselorData';
import { CounselorRecommendation } from '../../types';

export function RecommendationsEditor() {
  const { data: recommendations, isLoading } = useCounselorRecommendations();
  const updateRecMutation = useUpdateRecommendation();

  // Active editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for the selected recommendation
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [academicSupport, setAcademicSupport] = useState('');
  const [psychologicalSupport, setPsychologicalSupport] = useState('');
  const [financialSupport, setFinancialSupport] = useState('');
  const [attendanceImprovementPlan, setAttendanceImprovementPlan] = useState('');
  const [personalizedSuggestionsStr, setPersonalizedSuggestionsStr] = useState('');

  const handleStartEdit = (rec: CounselorRecommendation) => {
    setEditingId(rec.id);
    setSummary(rec.summary);
    setPriority(rec.priority);
    setAcademicSupport(rec.academicSupport);
    setPsychologicalSupport(rec.psychologicalSupport);
    setFinancialSupport(rec.financialSupport);
    setAttendanceImprovementPlan(rec.attendanceImprovementPlan);
    setPersonalizedSuggestionsStr(rec.personalizedSuggestions.join('\n'));
  };

  const handleSaveSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const suggestionsArr = (personalizedSuggestionsStr || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    updateRecMutation.mutate({
      id,
      updates: {
        summary,
        priority,
        academicSupport,
        psychologicalSupport,
        financialSupport,
        attendanceImprovementPlan,
        personalizedSuggestions: suggestionsArr
      }
    }, {
      onSuccess: () => {
        setEditingId(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/4" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-72 bg-surface-container rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div>
        <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">AI Support Plans & Recommendations</h3>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Review prediction triggers and configure personalized academic, psychological, and financial support templates.
        </p>
      </div>

      <div className="space-y-6">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec) => {
            const isEditing = editingId === rec.id;

            return (
              <Card key={rec.id} className="border border-outline-variant/60">
                {/* Recommendation Header */}
                <CardHeader className="bg-surface-container/10 border-b border-outline-variant/30 flex flex-row items-center justify-between p-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                      <h4 className="font-sans text-xs font-black text-on-surface uppercase select-none">Support Outline: {rec.studentName}</h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                        rec.priority === 'high' ? 'bg-rose-500/10 text-rose-600 border-rose-500/15' :
                        rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/15' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15'
                      }`}>
                        {rec.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Student ID: {rec.studentId} &bull; recommendation ID: {rec.id}</p>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => handleStartEdit(rec)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-black gap-1 h-9 px-4"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-primary" /> Edit Support Plan
                    </Button>
                  )}
                </CardHeader>

                {/* Content Area */}
                <CardContent className="p-lg">
                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveSubmit(e, rec.id)} className="space-y-4">
                      {/* Grid Summary and Priority */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Intervention Outline Summary</label>
                          <input
                            type="text"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Priority Tier</label>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                            required
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                      </div>

                      {/* Four pillars of support */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Academic */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> Academic Support Blueprint</label>
                          <textarea
                            value={academicSupport}
                            onChange={(e) => setAcademicSupport(e.target.value)}
                            rows={2}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                          />
                        </div>

                        {/* Psychological */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><HeartPulse className="h-4 w-4 text-pink-500" /> Psychological Counseling Program</label>
                          <textarea
                            value={psychologicalSupport}
                            onChange={(e) => setPsychologicalSupport(e.target.value)}
                            rows={2}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                          />
                        </div>

                        {/* Financial */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-500" /> Financial Aid & Fee Splits</label>
                          <textarea
                            value={financialSupport}
                            onChange={(e) => setFinancialSupport(e.target.value)}
                            rows={2}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                          />
                        </div>

                        {/* Attendance */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-amber-500" /> Attendance Improvement schedule</label>
                          <textarea
                            value={attendanceImprovementPlan}
                            onChange={(e) => setAttendanceImprovementPlan(e.target.value)}
                            rows={2}
                            className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Suggestions list */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Personalized Action Steps (one per line)</label>
                        <textarea
                          value={personalizedSuggestionsStr}
                          onChange={(e) => setPersonalizedSuggestionsStr(e.target.value)}
                          rows={3}
                          className="w-full text-xs font-semibold p-2.5 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none"
                          placeholder="Study 3 hours/week with tutor Anya...&#10;Utilize Pomodoro timers...&#10;Sit in row 1..."
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3.5 pt-2">
                        <Button onClick={() => setEditingId(null)} type="button" variant="outline" className="text-xs font-bold">
                          Cancel
                        </Button>
                        <Button
                          loading={updateRecMutation.isPending}
                          type="submit"
                          variant="primary"
                          className="text-xs font-black gap-1"
                        >
                          <Check className="h-4 w-4" /> Save Plan
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {/* Overview Statement */}
                      <div className="p-md bg-surface-container/40 rounded-lg border border-outline-variant/30 text-xs">
                        <span className="text-[9px] font-black uppercase text-on-surface-variant block tracking-wider">AI recommendation Summary</span>
                        <p className="text-on-surface font-semibold leading-relaxed mt-1">{rec.summary}</p>
                      </div>

                      {/* Four pillars of support view */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Academic */}
                        <div className="space-y-1 border border-outline-variant/20 p-3 rounded-lg bg-surface-container-low/20">
                          <h5 className="text-[10px] font-black uppercase text-primary flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Academic Support Plan</h5>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed leading-snug">{rec.academicSupport || 'Not specified'}</p>
                        </div>

                        {/* Psychological */}
                        <div className="space-y-1 border border-outline-variant/20 p-3 rounded-lg bg-surface-container-low/20">
                          <h5 className="text-[10px] font-black uppercase text-pink-500 flex items-center gap-1.5"><HeartPulse className="h-4 w-4" /> Psychological Program</h5>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed leading-snug">{rec.psychologicalSupport || 'Not specified'}</p>
                        </div>

                        {/* Financial */}
                        <div className="space-y-1 border border-outline-variant/20 p-3 rounded-lg bg-surface-container-low/20">
                          <h5 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Financial Aid Arrangements</h5>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed leading-snug">{rec.financialSupport || 'Not specified'}</p>
                        </div>

                        {/* Attendance */}
                        <div className="space-y-1 border border-outline-variant/20 p-3 rounded-lg bg-surface-container-low/20">
                          <h5 className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Attendance improvement plan</h5>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed leading-snug">{rec.attendanceImprovementPlan || 'Not specified'}</p>
                        </div>
                      </div>

                      {/* Personalized Suggestions lists */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wider block">Personalized suggestions log</span>
                        <ul className="space-y-1.5 pl-1.5 text-xs">
                          {rec.personalizedSuggestions.map((sug, sidx) => (
                            <li key={sidx} className="flex items-start gap-2 font-medium text-on-surface-variant leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-outline-variant rounded-lg">
            <Sparkles className="h-10 w-10 text-on-surface-variant/40 mx-auto animate-pulse" />
            <h4 className="font-sans text-sm font-bold text-on-surface mt-3">No predictions suggestions mapped</h4>
            <p className="text-xs text-on-surface-variant mt-1">High-risk students must be flagged to activate AI recommend triggers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
