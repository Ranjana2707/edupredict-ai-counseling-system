import { motion } from 'motion/react';
import {
  User,
  GraduationCap,
  Award,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Layers,
  BookOpen,
  Bookmark
} from 'lucide-react';
import { useStudentProfile } from '../../hooks/useStudentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';

export default function StudentProfilePage() {
  const { data: profile, isLoading } = useStudentProfile();

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse bg-surface-container-highest/40 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Student Profile"
        description="Verify academic records, contact directories, and verified institutional achievements."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Student Profile', path: '/student/profile' }
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Avatar and core academic credentials */}
        <Card className="text-center p-6 h-fit bg-surface-container-lowest">
          <CardContent className="flex flex-col items-center gap-4 pt-4 select-none">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-4 border-primary/20">
                <User className="h-12 w-12" />
              </div>
              <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs border-2 border-white font-bold" title="Institutional Profile Verified">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-sans text-xl font-black text-on-surface">{profile.name}</h3>
              <p className="font-sans text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                B.Tech Student • {profile.semester}
              </p>
              <p className="font-mono text-xs text-outline font-extrabold">{profile.id}</p>
            </div>

            {/* Quick overview of key grades */}
            <div className="w-full grid grid-cols-2 gap-2 pt-2 text-xs font-semibold select-none">
              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/30">
                <p className="text-outline uppercase text-[9px] tracking-wider font-extrabold">CGPA Grade</p>
                <p className="text-lg font-black text-on-surface mt-0.5">{profile.cgpa}</p>
              </div>
              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/30">
                <p className="text-outline uppercase text-[9px] tracking-wider font-extrabold">Attendance</p>
                <p className="text-lg font-black text-amber-500 mt-0.5">{profile.overallAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right columns: Academic Details & Contact Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Student details, department, semester, contact */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <CardTitle className="text-base font-extrabold">Institutional Parameters</CardTitle>
              <CardDescription>Academic registration and enrollment details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 text-xs font-semibold">
                {/* Department */}
                <div className="space-y-1 bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/30">
                  <span className="text-outline uppercase font-extrabold text-[9px] tracking-widest block mb-1">
                    Enrolled Faculty / Department
                  </span>
                  <p className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-primary" />
                    Department of Computer Science & Engineering
                  </p>
                  <p className="text-on-surface-variant font-medium mt-0.5">B.Tech Engineering Program</p>
                </div>

                {/* Semester */}
                <div className="space-y-1 bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/30">
                  <span className="text-outline uppercase font-extrabold text-[9px] tracking-widest block mb-1">
                    Active Study Term
                  </span>
                  <p className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-primary" />
                    Semester 6 (Spring Term 2026)
                  </p>
                  <p className="text-on-surface-variant font-medium mt-0.5">Continuous evaluation program active</p>
                </div>

                {/* Contact: email */}
                <div className="space-y-1 bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/30">
                  <span className="text-outline uppercase font-extrabold text-[9px] tracking-widest block mb-1">
                    Institutional Email Address
                  </span>
                  <p className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                    <Mail className="h-4.5 w-4.5 text-outline" />
                    {profile.email}
                  </p>
                  <p className="text-on-surface-variant font-medium mt-0.5">Active directory SSO bound</p>
                </div>

                {/* Contact: phone */}
                <div className="space-y-1 bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/30">
                  <span className="text-outline uppercase font-extrabold text-[9px] tracking-widest block mb-1">
                    Registered Mobile Number
                  </span>
                  <p className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                    <Phone className="h-4.5 w-4.5 text-outline" />
                    {profile.phoneNumber}
                  </p>
                  <p className="text-on-surface-variant font-medium mt-0.5">Active for emergency alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Cards */}
          <Card>
            <CardHeader className="border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                <div>
                  <CardTitle className="text-base font-extrabold">Verified Achievements & Recognitions</CardTitle>
                  <CardDescription>Official Dean's entries and extracurricular honors</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {(profile?.achievements || []).map((ach, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/25 transition-all text-xs text-on-surface font-semibold"
                >
                  <Bookmark className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-sans font-bold text-on-surface">{ach}</p>
                    <p className="font-sans text-[11px] text-on-surface-variant font-medium leading-relaxed">
                      Approved by Academic Dean. This marker boosts student retention scores on academic profiles.
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Info & compliance details */}
      <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/50 flex gap-3 text-xs items-center">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-on-surface-variant font-semibold leading-relaxed">
          <strong>FERPA Security Protocol:</strong> This institutional profile is encrypted and mapped to the active university directory system. All performance analytics and attendance traces are restricted to authorized academic support personnel.
        </p>
      </div>
    </div>
  );
}
