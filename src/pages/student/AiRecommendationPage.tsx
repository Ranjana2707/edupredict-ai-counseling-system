import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Award,
  Calendar,
  BookOpen,
  ArrowRight,
  ThumbsUp,
  Clock,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useStudentRecommendations } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export default function AiRecommendationPage() {
  const { data: recommendations, isLoading } = useStudentRecommendations();
  const [completedRecommendations, setCompletedRecommendations] = useState<string[]>([]);

  if (isLoading || !recommendations) {
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

  const handleAction = (id: string, title: string) => {
    if (completedRecommendations.includes(id)) return;
    
    setCompletedRecommendations((prev) => [...prev, id]);
    toast.success('Recommendation Initialized', {
      description: `Action sequence started for: "${title}". Real-time tracker synchronized.`,
    });
  };

  // Group recommendations by priority
  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const mediumPriority = recommendations.filter((r) => r.priority === 'medium');

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Personal Suggestions"
        description="Explore targeted recovery tracks, dynamic study guides, and custom actions compiled by the modeling core."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'AI Advice Engine', path: '/student/recommendations' }
        ]}
      />

      {/* Hero Header Advice Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-primary/20 bg-primary/5 p-5 flex items-start gap-4 select-none"
      >
        <Sparkles className="h-6 w-6 text-primary shrink-0 animate-pulse mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-sans text-sm font-extrabold text-on-surface uppercase tracking-wider">
            Active Recovery Program Activated
          </h4>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-semibold">
            The AI Retention engine has detected a temporary dip in CS-301 (Algorithms) engagement. These recommendations are specifically curated to restore safe academic standings.
          </p>
        </div>
      </motion.div>

      {/* Grid: High Priority vs General Priority Suggestions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Priority Actions list */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
                <div>
                  <CardTitle className="text-base font-extrabold">Priority Recommendations</CardTitle>
                  <CardDescription>Actions requiring immediate student attention this week</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <AnimatePresence>
                {highPriority.map((rec) => {
                  const isDone = completedRecommendations.includes(rec.id);
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isDone
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-outline-variant/50 hover:border-primary/20'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/15">
                            CRITICAL
                          </span>
                          <span className="text-[10px] uppercase font-bold text-outline">
                            Category: {rec.category}
                          </span>
                        </div>
                        <h4 className={`font-sans text-sm font-extrabold ${isDone ? 'line-through text-outline' : 'text-on-surface'}`}>
                          {rec.title}
                        </h4>
                        <p className="font-sans text-xs text-on-surface-variant font-semibold">
                          {rec.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <Check className="h-4 w-4" />
                            Confirmed Done
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAction(rec.id, rec.title)}
                            className="text-xs font-bold"
                          >
                            {rec.actionLabel}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* General/Medium suggestions list */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-extrabold">General Suggestions & Advisories</CardTitle>
                  <CardDescription>Supportive tasks recommended for overall progression</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {mediumPriority.map((rec) => {
                const isDone = completedRecommendations.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-lg border bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isDone
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-outline-variant/50 hover:border-primary/20'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/20">
                          RECOMMENDED
                        </span>
                        <span className="text-[10px] uppercase font-bold text-outline">
                          Category: {rec.category}
                        </span>
                      </div>
                      <h4 className={`font-sans text-sm font-extrabold ${isDone ? 'line-through text-outline' : 'text-on-surface'}`}>
                        {rec.title}
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant font-semibold">
                        {rec.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                          <Check className="h-4 w-4" />
                          Committed
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(rec.id, rec.title)}
                          className="text-xs font-bold"
                        >
                          {rec.actionLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right side study & attendance tips sidebar layout */}
        <div className="space-y-6">
          {/* Study & Performance suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                  Engagement Tips
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-1.5 text-xs">
                <p className="font-extrabold text-on-surface">1. Pomodoro Study Cycles</p>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  Break Advanced Algorithms concepts into 25-minute focused blocks. This mitigates mid-term anxiety slides.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-1.5 text-xs">
                <p className="font-extrabold text-on-surface">2. Clear Lab Checklists Early</p>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  Pre-reading distributed Paxos guidelines before the lab session guarantees completion within the class hour.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg space-y-1.5 text-xs">
                <p className="font-extrabold text-on-surface">3. Check-In with Your Peer Group</p>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  Discussing complex assignments with your cohort in study rooms improves submission quality metrics.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Model Information explanation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                  How AI Curates Advice
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-semibold text-on-surface-variant">
              <p className="leading-relaxed">
                The engine checks student markers (grades, attendance, submission status) against historical profiles that successfully completed B.Tech CSE.
              </p>
              <p className="leading-relaxed">
                It curates low-weight, high-impact tasks first to bolster course engagement without adding workload anxiety.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
