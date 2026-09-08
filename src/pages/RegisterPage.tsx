import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, Lock, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { UserRole } from '../types';
import { toast } from 'sonner';
import { Logo } from '../components/ui/Logo';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid institutional email (e.g., student@university.edu)'),
    phoneNumber: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .regex(/^\+?[0-9\s-()]+$/, 'Please enter a valid phone number'),
    role: z.enum(['student', 'faculty', 'counselor']),
    department: z.string().min(1, 'Department is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms & conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const DEPARTMENTS = [
  { value: 'Computer Science', label: 'Computer Science & Engineering' },
  { value: 'Data Science', label: 'Data Science & AI' },
  { value: 'Student Care', label: 'Student Care & Counseling' },
  { value: 'Institutional Intelligence', label: 'Institutional Intelligence' },
  { value: 'Information Technology', label: 'Information Technology' },
];

const ROLES = [
  { value: 'student', label: 'Student Enrollment' },
  { value: 'faculty', label: 'Academic Faculty Staff' },
  { value: 'counselor', label: 'Student Counselor' },
];

export default function RegisterPage() {
  const { registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const renderProgress = (currentStep: number) => {
    return (
      <div className="flex items-center justify-between w-full mb-6 select-none bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
        {[
          { step: 1, label: 'Profile' },
          { step: 2, label: 'Verify' },
          { step: 3, label: 'Access' },
        ].map((item, index) => (
          <div key={item.step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300 ${
                  currentStep >= item.step
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {item.step}
              </div>
              <span
                className={`font-sans text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
                  currentStep === item.step
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < 2 && (
              <div className="flex-1 mx-3 h-0.5 bg-slate-150 dark:bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: currentStep > item.step ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'student',
      department: '',
      password: '',
      confirmPassword: '',
      terms: undefined,
    },
  });

  const password = watch('password') || '';

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800', textColor: 'text-slate-400', criteria: { minLength: false, uppercase: false, lowercase: false, digit: false, special: false } };
    
    let score = 0;
    const hasMinLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasDigit) score++;
    if (hasSpecial) score++;

    const criteria = {
      minLength: hasMinLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      digit: hasDigit,
      special: hasSpecial
    };

    if (score <= 2) {
      return {
        score,
        label: 'Weak',
        color: 'bg-red-500',
        textColor: 'text-red-500 dark:text-red-400',
        criteria
      };
    } else if (score <= 4) {
      return {
        score,
        label: 'Fair',
        color: 'bg-amber-500',
        textColor: 'text-amber-500 dark:text-amber-400',
        criteria
      };
    } else {
      return {
        score,
        label: 'Strong',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500 dark:text-emerald-400',
        criteria
      };
    }
  };

  const strength = getPasswordStrength(password);


  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data.fullName, data.email, data.phoneNumber, data.role as UserRole, data.department);
      setRegisteredEmail(data.email);
      setIsSuccess(true);
      toast.success('Registration Initiated', {
        description: 'Your temporary profile is cached. Verification OTP dispatched!',
      });
    } catch (err: any) {
      toast.error('Registration Failed', {
        description: err.message || 'Validation or network rejection. Please try again.',
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      toast.success('Sign Up Successful', {
        description: 'Successfully authenticated with Google!',
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Google Sign Up Failed', {
        description: err.message || 'Authentication failed. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* LEFT SIDE: Split Screen Brand Cover - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative h-screen sticky top-0 overflow-hidden select-none">
        {/* Full-height professional background image with rich colors */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1080"
            alt="Academic Collaboration Workspace"
            className="w-full h-full object-cover transform scale-100 hover:scale-[1.03] transition-transform duration-10000 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Subtle elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-900/40 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-blue-900/10 to-transparent z-10 mix-blend-color" />
        </div>

        {/* Floating atmospheric glows */}
        <div className="absolute top-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none z-15" />
        <div className="absolute bottom-[-20%] right-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none z-15" />

        {/* Premium Content Overlay */}
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white w-full">
          {/* Brand Identity / Logo */}
          <Link to="/" className="w-fit hover:opacity-95 transition-opacity">
            <Logo size="md" withText lightText />
          </Link>

          {/* Centered Inspirational Quote & Academic Value Subtitle */}
          <div className="max-w-xl mb-12">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-200 font-sans text-[10px] font-black tracking-widest uppercase">
                <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-pulse" />
                Empowering Campus Excellence
              </div>

              <blockquote className="space-y-4">
                <p className="font-sans text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white/95">
                  "The key to academic persistence is not simply identifying struggles, but proactive counseling and targeted foresight."
                </p>
                <footer className="font-sans text-xs text-white/60 font-bold tracking-wider uppercase flex items-center gap-2">
                  <span className="h-px w-6 bg-white/30" />
                  Office of Student Retention & Success
                </footer>
              </blockquote>
            </motion.div>
          </div>

          {/* Compliance Info Line */}
          <div className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-white/30">
            Enterprise Core Platform • FERPA Security Certified
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Centered Form Card Layout */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center px-4 py-12 sm:px-12 md:px-16 overflow-y-auto min-h-screen">
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-[540px] bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 select-none transition-all duration-300"
            >
              {/* Header Info */}
              <div className="space-y-4 mb-8">
                <div className="flex lg:hidden items-center justify-center">
                  <Logo size="sm" withText />
                </div>

                {renderProgress(1)}

                <h3 className="font-sans text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Create Account
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Establish your institutional prediction and student intervention profile.
                </p>
              </div>

              {/* Form segment */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name & Institutional Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="fullName"
                    type="text"
                    label="Full Name"
                    placeholder="Rohan Sharma"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.fullName?.message}
                    className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10"
                    {...register('fullName')}
                  />

                  <Input
                    id="email"
                    type="email"
                    label="Institutional Email"
                    placeholder="marcus@university.edu"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10"
                    {...register('email')}
                  />
                </div>

                {/* Phone Number & Academic Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    label="Phone Number"
                    placeholder="+1 (555) 019-2834"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phoneNumber?.message}
                    className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10"
                    {...register('phoneNumber')}
                  />

                  <Select
                    id="department"
                    label="Academic Department"
                    placeholder="Select department..."
                    options={DEPARTMENTS}
                    error={errors.department?.message}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl"
                    {...register('department')}
                  />
                </div>

                {/* System Role Selection */}
                <Select
                  id="role"
                  label="System Role"
                  placeholder="Select system role..."
                  options={ROLES}
                  error={errors.role?.message}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl"
                  {...register('role')}
                />

                {/* Password & Confirm Password with Show/Hide Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Min 8 chars, mixed strength"
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      error={errors.password?.message}
                      className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10"
                      {...register('password')}
                    />

                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Strength</span>
                            <span className={strength.textColor}>{strength.label}</span>
                          </div>
                          
                          <div className="flex gap-1 h-1">
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.color}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score > 2 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score > 4 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                          </div>

                          {/* Requirements list */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                            <div className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${strength.criteria.minLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className={`text-[9.5px] font-medium leading-none transition-colors duration-300 ${strength.criteria.minLength ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>8+ characters</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${strength.criteria.uppercase && strength.criteria.lowercase ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className={`text-[9.5px] font-medium leading-none transition-colors duration-300 ${strength.criteria.uppercase && strength.criteria.lowercase ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>A-z casing</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${strength.criteria.digit ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className={`text-[9.5px] font-medium leading-none transition-colors duration-300 ${strength.criteria.digit ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>Number (0-9)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${strength.criteria.special ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className={`text-[9.5px] font-medium leading-none transition-colors duration-300 ${strength.criteria.special ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>Special symbol</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Re-type password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none cursor-pointer p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      error={errors.confirmPassword?.message}
                      className="focus:ring-blue-500/10 dark:focus:ring-blue-500/10"
                      {...register('confirmPassword')}
                    />
                  </div>
                </div>

                {/* Terms of Service Checkbox */}
                <div className="flex flex-col gap-1 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      id="terms"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/10 accent-blue-600 cursor-pointer"
                      {...register('terms')}
                    />
                    <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-normal group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      I accept the academic security charter, consent to automated dropout analytics under FERPA policies, and agree to the{' '}
                      <span className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Terms of Service</span>.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="font-sans text-[11.5px] text-red-500 font-semibold mt-1 pl-7">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  className="w-full mt-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
                  isLoading={isSubmitting}
                >
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>

              {/* OR Divider */}
              <div className="relative my-6 select-none">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200/60 dark:border-slate-800/80" />
                </div>
                <div className="relative flex justify-center text-xs uppercase leading-none">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                    OR
                  </span>
                </div>
              </div>

              {/* Google Sign-In Option */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-2 h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs"
              >
                <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.29c1.92,-1.77 3.03,-4.38 3.03,-7.38C21.65,11.83 21.54,11.45 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.6c2.59,0 4.77,-0.86 6.36,-2.3l-3.29,-2.58c-0.91,0.61 -2.08,0.98 -3.07,0.98 -2.36,0 -4.36,-1.59 -5.07,-3.72H3.55v2.66C5.13,18.77 8.35,20.6 12,20.6z" fill="#34A853" />
                    <path d="M6.93,12.98c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V6.92H3.55c-0.6,1.21 -0.95,2.57 -0.95,4.08s0.35,2.87 0.95,4.08L6.93,12.98z" fill="#FBBC05" />
                    <path d="M12,6.02c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.77,3.12 14.59,2.4 12,2.4c-3.65,0 -6.87,1.83 -8.45,4.52l3.38,2.66C7.64,7.61 9.64,6.02 12,6.02z" fill="#EA4335" strokeWidth="0" />
                  </g>
                </svg>
                Sign Up with Google
              </button>

              {/* Already have an account */}
              <p className="font-sans text-xs text-center text-slate-500 dark:text-slate-400 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold transition-all ml-1">
                  Sign In
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="register-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 select-none text-center space-y-6"
            >
              {renderProgress(2)}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-md">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-sans text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Profile Registered!
                </h4>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                  A 6-digit dynamic authentication passcode (OTP) has been sent to:
                  <br />
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mt-1.5 break-all select-all font-mono text-xs">
                    {registeredEmail}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-150 dark:border-slate-800/80 text-left space-y-2.5">
                <div className="flex gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Academic Verification Flow</span>
                </div>
                <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  To active your predictive retention profile, retrieve your verification code from your student or staff inbox and proceed below.
                </p>
              </div>

              <Button
                onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(registeredEmail)}&flow=register`)}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                Go to OTP Verification
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
