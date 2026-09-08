import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

type Step = 'email' | 'otp' | 'new-password' | 'success';

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = '',
}: ForgotPasswordModalProps) {
  const { forgotPassword, verifyOtp, resetPassword, user } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(defaultEmail || user?.email || '');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [firebaseSent, setFirebaseSent] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync defaultEmail or user email when opened
  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || user?.email || '');
      setStep('email');
      setOtpValues(Array(6).fill(''));
      setGeneratedOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, defaultEmail, user]);

  if (!isOpen) return null;

  const demoAccounts = [
    { label: 'Student', email: 'student@university.edu' },
    { label: 'Counselor', email: 'counselor@university.edu' },
    { label: 'Faculty', email: 'faculty@university.edu' },
    { label: 'Admin', email: 'admin@university.edu' },
  ];

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Invalid Email', { description: 'Please enter a valid institutional email address.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      if (result && result.otp) {
        setGeneratedOtp(result.otp);
      } else {
        setGeneratedOtp('123456');
      }
      setFirebaseSent(!!result?.firebaseSent);
      setStep('otp');
    } catch (err: any) {
      toast.error('Dispatch Failed', { description: err.message || 'Unable to dispatch recovery code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otpValues];
    next[index] = val;
    setOtpValues(next);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`modal-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const digits = code.split('').slice(0, 6);
    setOtpValues(digits);
    toast.success('Code Auto-Filled', { description: `Applied ${code}` });
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      toast.error('Incomplete Code', { description: 'Please enter all 6 digits.' });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email.trim(), fullOtp);
      setStep('new-password');
    } catch (err: any) {
      toast.error('Invalid OTP', { description: err.message || 'Verification rejected. Try code 123456.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Weak Password', { description: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', { description: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim(), newPassword);
      setStep('success');
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message || 'Could not reset password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-lg font-black text-slate-900 dark:text-white leading-tight">
              Forgot / Reset Password
            </h3>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Recover institutional credentials with secure OTP verification
            </p>
          </div>
        </div>

        {/* Multi-Step Wizard Flow */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Input
                    id="recovery-email"
                    type="email"
                    label="Institutional Email Address"
                    placeholder="student@university.edu"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Demo Quick Selectors */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Quick Demo Accounts:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.label}
                        type="button"
                        onClick={() => setEmail(acc.email)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${
                          email === acc.email
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    isLoading={isLoading}
                  >
                    Send Recovery OTP
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    Security Passcode Dispatched
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp(generatedOtp || '123456')}
                    className="text-[10px] font-black text-blue-600 dark:text-cyan-400 underline cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Target: <strong className="font-mono">{email}</strong>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Sandbox Code:</span>
                  <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-cyan-400 text-xs">
                    {generatedOtp || '123456'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedOtp || '123456')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy code"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                {firebaseSent && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Official Firebase reset link also dispatched to inbox.
                  </p>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-between gap-1.5">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        id={`modal-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center font-mono font-bold text-lg border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email')}
                    className="w-1/3 h-11"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-2/3 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    isLoading={isLoading}
                  >
                    Verify Passcode
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Set New Password */}
          {step === 'new-password' && (
            <motion.div
              key="step-new-pass"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Input
                    id="modal-new-password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Input
                    id="modal-confirm-password"
                    type="password"
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    isLoading={isLoading}
                  >
                    Update Password
                    <CheckCircle2 className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans text-xl font-black text-slate-900 dark:text-white">
                  Password Updated!
                </h4>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Credentials for <strong className="font-mono">{email}</strong> have been securely updated.
                </p>
              </div>
              <Button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Close & Return
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
