import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid institutional email (e.g. name@university.edu)'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [firebaseSent, setFirebaseSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoAccounts = [
    { label: 'Student', email: 'student@university.edu' },
    { label: 'Counselor', email: 'counselor@university.edu' },
    { label: 'Faculty', email: 'faculty@university.edu' },
    { label: 'Admin', email: 'admin@university.edu' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      const result = await forgotPassword(data.email.trim());
      setSentEmail(data.email.trim());
      setDispatchedOtp(result?.otp || '123456');
      setFirebaseSent(!!result?.firebaseSent);
      setIsSent(true);
      toast.success('Passcode Dispatched', {
        description: 'Check your institutional mailbox or use the sandbox code below.',
      });
    } catch (err: any) {
      toast.error('Dispatch Refused', {
        description: err.message || 'Please check your connection and email address.',
      });
    }
  };

  const copyOtp = () => {
    navigator.clipboard.writeText(dispatchedOtp);
    setCopied(true);
    toast.success('Passcode Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence mode="wait">
      {!isSent ? (
        <motion.div
          key="forgot-form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-2 text-center">
            <h3 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Recover System Access
            </h3>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Confirm your institutional identity to receive a temporary recovery PIN
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Institutional Email"
              placeholder="student@university.edu"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Quick Demo Selectors */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Quick Select Test Identity:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => setValue('email', acc.email)}
                    className="text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
              isLoading={isSubmitting}
            >
              Dispatch Security OTP
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="flex justify-center mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 font-bold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="forgot-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6 py-4"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 shadow-md">
            <KeyRound className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h4 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Reset Token Dispatched
            </h4>
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              A 6-digit access code was dispatched to:
              <br />
              <span className="font-semibold text-blue-600 dark:text-cyan-400 block mt-1 break-all select-all font-mono text-xs">
                {sentEmail}
              </span>
            </p>
          </div>

          {/* Sandbox OTP Card with Copy & Auto-fill */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-blue-200/80 dark:border-blue-900/60 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                Dispatched Security PIN
              </span>
              <button
                type="button"
                onClick={copyOtp}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                {dispatchedOtp}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Active Code
              </span>
            </div>

            {firebaseSent && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Firebase password reset email also dispatched to inbox.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={() =>
                navigate(
                  `/verify-otp?email=${encodeURIComponent(sentEmail)}&flow=forgot&otp=${encodeURIComponent(
                    dispatchedOtp
                  )}`
                )
              }
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Auto-Fill Code & Proceed
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold py-1 transition-colors"
            >
              Use a different email address
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
