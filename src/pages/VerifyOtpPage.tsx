import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Timer, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export default function VerifyOtpPage() {
  const { verifyOtp, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') || 'user@university.edu';
  const flow = searchParams.get('flow') || 'register'; // 'register' or 'forgot'
  const queryOtp = searchParams.get('otp') || '';

  const [otpValues, setOtpValues] = useState<string[]>(() => {
    if (queryOtp && queryOtp.length === 6) {
      return queryOtp.split('');
    }
    return Array(6).fill('');
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If queryOtp changes or loads, populate
  useEffect(() => {
    if (queryOtp && queryOtp.length === 6) {
      setOtpValues(queryOtp.split(''));
    }
  }, [queryOtp]);

  // Count down timer logic
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Autofocus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Format time (e.g., 115 -> "01:55")
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle single digit input
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return; // Allow only digits

    const newValues = [...otpValues];
    newValues[index] = val;
    setOtpValues(newValues);

    // If a digit was entered, shift focus to the next box
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Keyboard navigation & Backspace deletions
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpValues[index] === '' && index > 0) {
        // Clear previous field and shift focus
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current field
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Clipboard Paste Support (e.g., pasting "123456" splits into inputs)
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Invalid clipboard data', {
        description: 'Please paste exactly a 6-digit number.',
      });
      return;
    }

    const digits = pastedData.split('');
    setOtpValues(digits);
    // Focus the last input
    inputRefs.current[5]?.focus();
  };

  // Submit OTP
  const handleVerify = async () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      toast.error('Verification Prevented', {
        description: 'Please provide all 6 authentication digits.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(email, fullOtp);
      toast.success('Identity Verified', {
        description: 'Clearing secure channel initialization...',
      });

      if (flow === 'forgot') {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        navigate(`/verification-success?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      toast.error('Verification Blocked', {
        description: err.message || 'OTP authentication rejected.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code trigger
  const handleResend = async () => {
    if (!canResend) return;
    try {
      await forgotPassword(email);
      setCountdown(120);
      setCanResend(false);
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      toast.success('Verification Resent', {
        description: 'A brand-new 6-digit OTP code has been dispatched.',
      });
    } catch (err: any) {
      toast.error('Resend Blocked', {
        description: err.message || 'Failed to dispatch a new OTP. Please try again.',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h3 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Institutional MFA Verification
        </h3>
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          We sent a temporary verification token to:
          <br />
          <span className="font-semibold text-blue-600 dark:text-cyan-400 block mt-1 break-all select-all font-mono text-xs">
            {email}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {/* 6-digit Code Grid */}
        <div className="flex justify-between gap-2">
          {otpValues.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center text-xl font-bold text-slate-900 dark:text-slate-100 font-mono transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/10 select-none shadow-sm"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Sandbox Auto-Fill Helper */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Testing code?</span>
          <button
            type="button"
            onClick={() => {
              const code = queryOtp && queryOtp.length === 6 ? queryOtp : '123456';
              setOtpValues(code.split(''));
              toast.success('Code Auto-Filled', { description: `Applied ${code}` });
            }}
            className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Auto-fill Sandbox Code ({queryOtp && queryOtp.length === 6 ? queryOtp : '123456'})
          </button>
        </div>

        {/* Live Timer Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Timer className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="font-mono">{formatTime(countdown)}</span>
          </div>

          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
              canResend
                ? 'text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer'
                : 'text-slate-400/40 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            Resend Passcode
          </button>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleVerify}
          className="w-full mt-2 h-11"
          isLoading={isSubmitting}
        >
          Verify Passcode
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-center pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 font-bold transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel and Sign In
        </Link>
      </div>
    </motion.div>
  );
}
