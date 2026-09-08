import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'user@university.edu';

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // 0 to 4
    label: 'Too Weak',
    colorClass: 'bg-error',
    checks: {
      length: false,
      upperLower: false,
      number: false,
      special: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password', '');

  // Calculate password strength in real-time
  useEffect(() => {
    const checks = {
      length: passwordVal.length >= 8,
      upperLower: /[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal),
      number: /[0-9]/.test(passwordVal),
      special: /[^A-Za-z0-9]/.test(passwordVal),
    };

    let score = 0;
    if (checks.length) score++;
    if (checks.upperLower) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    let label = 'Too Weak';
    let colorClass = 'bg-error';

    if (passwordVal.length === 0) {
      label = 'Empty';
      colorClass = 'bg-outline-variant/30';
    } else if (score === 1) {
      label = 'Weak';
      colorClass = 'bg-error';
    } else if (score === 2) {
      label = 'Fair';
      colorClass = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Good';
      colorClass = 'bg-primary';
    } else if (score === 4) {
      label = 'Highly Secure';
      colorClass = 'bg-emerald-500';
    }

    setPasswordStrength({
      score,
      label,
      colorClass,
      checks,
    });
  }, [passwordVal]);

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await resetPassword(email, data.password);
      setIsSuccess(true);
      toast.success('Credentials Reconstructed', {
        description: 'New password registered in institutional directories.',
      });
    } catch (err: any) {
      toast.error('Reconstruction Blocked', {
        description: err.message || 'Failed to update credentials.',
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSuccess ? (
        <motion.div
          key="reset-form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-1.5 text-center">
            <h3 className="font-sans text-xl font-bold text-on-surface">
              Design New Credentials
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              Re-establish security barriers on your academic database profile
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="New Security Password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4.5 w-4.5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-outline hover:text-on-surface transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Dynamic Password Strength Indicator bar & labels */}
            <div className="space-y-2 select-none">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <span>Passcode Robustness:</span>
                <span className={`font-bold transition-all px-1.5 py-0.5 rounded-sm text-[10px] uppercase text-white ${passwordStrength.colorClass}`}>
                  {passwordStrength.label}
                </span>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.colorClass}`}
                  style={{ width: `${passwordVal.length === 0 ? 0 : (passwordStrength.score / 4) * 100}%` }}
                />
              </div>

              {/* Individual Bullet Checks */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[11px] text-on-surface-variant font-medium">
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${passwordStrength.checks.length ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                  <span className={passwordStrength.checks.length ? 'text-on-surface' : ''}>Min 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${passwordStrength.checks.upperLower ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                  <span className={passwordStrength.checks.upperLower ? 'text-on-surface' : ''}>Upper & lowercase</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${passwordStrength.checks.number ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                  <span className={passwordStrength.checks.number ? 'text-on-surface' : ''}>At least one number</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${passwordStrength.checks.special ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                  <span className={passwordStrength.checks.special ? 'text-on-surface' : ''}>Special character (!@#)</span>
                </div>
              </div>
            </div>

            <Input
              id="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4.5 w-4.5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Reconstruct Credentials
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="reset-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-6 py-4"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h4 className="font-sans text-xl font-extrabold text-on-surface">
              Password Restored!
            </h4>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              Your password has been securely restructured. Your authentication certificates are refreshed and active.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-default p-4 border border-outline-variant/60 text-left space-y-2.5">
            <div className="flex gap-2 text-xs font-semibold text-on-surface-variant">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Multi-Factor Alignment Complete</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              For security compliance, you can now sign back in with your updated institutional password.
            </p>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Sign In with New Password
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
