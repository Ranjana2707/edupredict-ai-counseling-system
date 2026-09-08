import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Palette,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types';
import { toast } from 'sonner';
import { Logo } from '../components/ui/Logo';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid institutional email (e.g., student@university.edu)'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 130,
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 140,
    },
  },
};

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme, isClayUI, toggleClayUI } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Remember Me pre-fill logic
  const rememberedEmail = localStorage.getItem('edupredict_remembered_email') || '';
  const initialRememberMe = !!rememberedEmail;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberMe: initialRememberMe,
    },
  });

  // Ensure prefilled value propagates
  useEffect(() => {
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [rememberedEmail, setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Save or remove Remember Me email
      if (data.rememberMe) {
        localStorage.setItem('edupredict_remembered_email', data.email);
      } else {
        localStorage.removeItem('edupredict_remembered_email');
      }

      const user = await login(data.email, data.password);
      toast.success('Access Granted', {
        description: `Successfully signed in as ${user.name} (${user.role.toUpperCase()}).`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Authentication Error', {
        description: err.message || 'Credentials rejected. Please try again.',
      });
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      const user = await login('', '', role);
      toast.success('Instant Access Authorization', {
        description: `Logged into sandbox view as ${user.name} (${user.role.toUpperCase()}).`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Sandbox login failed', {
        description: err.message,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      toast.loading('Connecting to Google Single Sign-On...', { id: 'google-auth' });
      const user = await loginWithGoogle();
      toast.success('Access Granted via Google SSO', {
        id: 'google-auth',
        description: `Successfully signed in as ${user.name} (${user.role.toUpperCase()}).`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Google Sign-In Failed', {
        id: 'google-auth',
        description: err.message || 'Verification could not be completed.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* LEFT COLUMN: Main Credentials & Authentication Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center px-4 py-12 sm:px-12 md:px-16 overflow-y-auto min-h-screen">
        
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 select-none transition-all duration-300 relative"
        >
          {/* Header & Theme switcher */}
          <motion.div variants={childVariants} className="flex items-center justify-between mb-8 select-none">
            <Logo size="sm" withText />

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleClayUI}
                type="button"
                className={`flex h-8 px-2.5 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-all cursor-pointer gap-1 text-[10px] font-extrabold ${isClayUI ? 'bg-blue-500/15 text-blue-600 dark:text-cyan-400 border-blue-500/30' : 'bg-slate-50 dark:bg-slate-950/80'}`}
                title="Toggle Claymorphism UI style"
              >
                <Palette className={`h-3.5 w-3.5 ${isClayUI ? 'animate-pulse' : ''}`} />
                <span>{isClayUI ? 'Clay UI' : 'Flat UI'}</span>
              </button>

              <button
                onClick={toggleTheme}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                title="Toggle theme mode"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>

          {/* Form Header */}
          <motion.div variants={childVariants} className="space-y-2 mb-8">
            <h3 className="font-sans text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Sign In to Portal
            </h3>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Provide your institutional credentials below to connect to your retention dashboard.
            </p>
          </motion.div>

          {/* Form container */}
          <motion.div variants={childVariants}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="email"
                type="email"
                label="Institutional Email"
                placeholder="student@university.edu"
                leftIcon={<Mail className="h-4.5 w-4.5" />}
                error={errors.email?.message}
                className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10 h-11 rounded-xl"
                {...register('email')}
              />

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4.5 w-4.5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none cursor-pointer p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10 h-11 rounded-xl"
                  {...register('password')}
                />
              </div>

              {/* Remember Me and Forgot Password bar */}
              <div className="flex items-center justify-between select-none px-0.5 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/10 accent-blue-600 cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-semibold">
                    Remember Me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-sans text-xs text-blue-600 dark:text-cyan-400 hover:underline font-extrabold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Action */}
              <Button
                type="submit"
                className="w-full mt-3 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
                isLoading={isSubmitting}
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Authorize Connection
              </Button>
            </form>
          </motion.div>

          {/* OR Divider */}
          <motion.div variants={childVariants} className="relative my-6 select-none">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200/60 dark:border-slate-800/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase leading-none">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                OR
              </span>
            </div>
          </motion.div>

          {/* Google Sign-In */}
          <motion.button
            variants={childVariants}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Single Sign-On (Google Workspace)
          </motion.button>

          {/* Already have an account link */}
          <motion.p variants={childVariants} className="font-sans text-xs text-center text-slate-500 dark:text-slate-400 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
            New to prediction portal?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold transition-all ml-1">
              Create System Profile
            </Link>
          </motion.p>

        </motion.div>
      </div>

      {/* RIGHT COLUMN: Interactive Institutional Sandbox Console - Split Screen on Desktop */}
      <div className="w-full lg:w-[55%] xl:w-[60%] relative h-auto lg:h-screen lg:sticky lg:top-0 overflow-y-auto select-none bg-slate-950 flex flex-col justify-between p-6 sm:p-12 md:p-16 text-white border-t lg:border-t-0 lg:border-l border-slate-800">
        
        {/* Background photo & overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1080"
            alt="Collaborative University Library"
            className="w-full h-full object-cover transform scale-100 hover:scale-[1.02] transition-transform duration-10000 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-900/50 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-blue-900/20 to-transparent z-10 mix-blend-color" />
        </div>

        {/* Brand floating glow */}
        <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none z-15" />
        <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none z-15" />

        {/* Logo and header (Visible only on desktop right section) */}
        <div className="relative z-20 hidden lg:flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="font-sans text-[10px] font-black tracking-widest text-white/50 uppercase leading-none">
              Academic Retention Console
            </span>
          </div>
          <span className="font-sans text-[9px] font-black tracking-wider text-blue-400/80 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 uppercase">
            Authorized Sandbox Sandbox
          </span>
        </div>

        {/* Center Content: Interactive Role Selector */}
        <div className="relative z-20 max-w-2xl my-auto py-8 space-y-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-200 font-sans text-[10px] font-black tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-pulse" />
              Demo Portal Sandbox Sandbox
            </div>
            
            <h4 className="font-sans text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Instant Institutional Access Sandbox
            </h4>
            
            <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed">
              Bypass credentials authentication using the sandbox console. Select a predefined institutional role profile below to assess specific retention dashboards, predictive metrics, and counseling tools.
            </p>
          </div>

          {/* Core Roles Grid - Desktop: 2x2 grid, comfortable spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Student Portal */}
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="group relative flex flex-col justify-between items-start text-left p-5 rounded-[15px] border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-blue-400/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer min-h-[145px]"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1 mt-4">
                <span className="font-sans text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                  Student Portal
                </span>
                <p className="font-sans text-[11px] text-white/60 leading-snug">
                  Analyze specific course performance, attendance trackers, and tailored behavioral counseling interventions.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between w-full border-t border-white/5 pt-2 font-mono text-[8.5px] text-white/40 group-hover:text-white/60">
                <span>Default: Rohan Sharma</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded tracking-wide uppercase">rohan@university.edu.in</span>
              </div>
            </button>

            {/* 2. Faculty Staff */}
            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              className="group relative flex flex-col justify-between items-start text-left p-5 rounded-[15px] border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-blue-400/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer min-h-[145px]"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1 mt-4">
                <span className="font-sans text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                  Academic Faculty
                </span>
                <p className="font-sans text-[11px] text-white/60 leading-snug">
                  Monitor courses list, evaluate predictive indicators, and log feedback for students at high dropout risk.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between w-full border-t border-white/5 pt-2 font-mono text-[8.5px] text-white/40 group-hover:text-white/60">
                <span>Default: Dr. Sunita Sharma</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded tracking-wide uppercase">sunita@university.edu.in</span>
              </div>
            </button>

            {/* 3. Counselor Core */}
            <button
              type="button"
              onClick={() => handleQuickLogin('counselor')}
              className="group relative flex flex-col justify-between items-start text-left p-5 rounded-[15px] border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-blue-400/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer min-h-[145px]"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1 mt-4">
                <span className="font-sans text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                  Student Counselor
                </span>
                <p className="font-sans text-[11px] text-white/60 leading-snug">
                  Track instant risk alerts, draft structured counseling reports, and manage appointment workflows.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between w-full border-t border-white/5 pt-2 font-mono text-[8.5px] text-white/40 group-hover:text-white/60">
                <span>Default: Aris Vance</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded tracking-wide uppercase">aris@univ.edu</span>
              </div>
            </button>

            {/* 4. System Admin Controller */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="group relative flex flex-col justify-between items-start text-left p-5 rounded-[15px] border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-blue-400/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer min-h-[145px]"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1 mt-4">
                <span className="font-sans text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                  System Admin
                </span>
                <p className="font-sans text-[11px] text-white/60 leading-snug">
                  Full control access to model configurations, parameter thresholds, database collections, and system logs.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between w-full border-t border-white/5 pt-2 font-mono text-[8.5px] text-white/40 group-hover:text-white/60">
                <span>Default: Admin Controller</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded tracking-wide uppercase">admin@univ.edu</span>
              </div>
            </button>

          </div>
        </div>

        {/* Footer info (Visible only on desktop right section) */}
        <div className="relative z-20 flex justify-between items-center w-full text-white/40 text-[9.5px] uppercase font-bold tracking-widest pt-6 border-t border-white/10">
          <span>FERPA Security Standard Certification</span>
          <span>© 2026 EduPredict AI LLC</span>
        </div>

      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={getValues('email') || ''}
      />
    </div>
  );
}
