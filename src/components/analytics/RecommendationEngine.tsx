import React from 'react';
import { PredictionRecommendation } from '../../types/prediction';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  GraduationCap,
  Calendar,
  Compass,
  TrendingUp,
  Heart,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface RecommendationEngineProps {
  recommendations: PredictionRecommendation[];
}

export function RecommendationEngine({ recommendations = [] }: RecommendationEngineProps) {
  // Map category to styles/icons
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'academic':
        return {
          icon: <GraduationCap className="h-5 w-5 text-indigo-500" />,
          label: 'Academic Support',
          border: 'border-indigo-500/15',
          bg: 'bg-indigo-500/5 hover:bg-indigo-500/8'
        };
      case 'attendance':
        return {
          icon: <Calendar className="h-5 w-5 text-sky-500" />,
          label: 'Attendance Improvement',
          border: 'border-sky-500/15',
          bg: 'bg-sky-500/5 hover:bg-sky-500/8'
        };
      case 'study_plan':
        return {
          icon: <Compass className="h-5 w-5 text-amber-500" />,
          label: 'Custom Study Plan',
          border: 'border-amber-500/15',
          bg: 'bg-amber-500/5 hover:bg-amber-500/8'
        };
      case 'counseling':
        return {
          icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
          label: 'Counseling Pathway',
          border: 'border-emerald-500/15',
          bg: 'bg-emerald-500/5 hover:bg-emerald-500/8'
        };
      case 'mental_health':
        return {
          icon: <Heart className="h-5 w-5 text-rose-500" />,
          label: 'Mental Health Support',
          border: 'border-rose-500/15',
          bg: 'bg-rose-500/5 hover:bg-rose-500/8'
        };
      case 'financial_aid':
        return {
          icon: <DollarSign className="h-5 w-5 text-teal-500" />,
          label: 'Financial Aid Suggestion',
          border: 'border-teal-500/15',
          bg: 'bg-teal-500/5 hover:bg-teal-500/8'
        };
      default:
        return {
          icon: <Sparkles className="h-5 w-5 text-primary" />,
          label: 'AI Recommendation',
          border: 'border-outline-variant/60',
          bg: 'bg-surface-container/30 hover:bg-surface-container/50'
        };
    }
  };

  const getPriorityBadgeClass = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 select-none">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h4 className="font-sans text-[11px] font-black text-on-surface uppercase tracking-wider">
          AI-Generated Strategic Recommendations
        </h4>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(recommendations || []).map((rec, i) => {
          const det = getCategoryDetails(rec.category);

          return (
            <Card
              key={i}
              className={`border ${det.border} ${det.bg} transition duration-200 cursor-default flex flex-col justify-between`}
            >
              <CardHeader className="p-lg pb-3 space-y-2">
                {/* Header line with badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-outline tracking-wider">
                    {det.label}
                  </span>
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-full select-none ${getPriorityBadgeClass(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                </div>

                {/* Main recommendation text */}
                <CardTitle className="font-sans text-[11px] font-bold text-on-surface leading-relaxed">
                  {rec.recommendation}
                </CardTitle>
              </CardHeader>

              {/* Expected Improvement footer */}
              <CardContent className="p-lg pt-2 border-t border-outline-variant/10 bg-surface-container/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-outline font-black uppercase select-none">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Expected Outcome
                </div>
                <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                  {rec.expectedImprovement}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
