import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function VerificationSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'user@university.edu';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center space-y-6 py-6 select-none"
    >
      {/* Dynamic graphic: circle with checkmark ring animations */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        {/* Animated glowing decorative rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.3, opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/5 border border-emerald-500/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1.6, opacity: [0, 0.3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />

        {/* Core solid circle */}
        <div className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <Check className="h-8 w-8 stroke-[3]" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-sans text-2xl font-black text-on-surface tracking-tight">
          Profile Verified!
        </h3>
        <p className="font-sans text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
          MFA Authentication Active
        </p>
      </div>

      <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
        Your email address has been successfully verified. Your predictive dropout modeling profile and counseling queue have been provisioned under:
        <br />
        <span className="font-mono text-xs text-primary font-bold block mt-1 select-all break-all">
          {email}
        </span>
      </p>

      {/* Audit/FERPA Security Compliance Banner */}
      <div className="bg-surface-container-low rounded-default p-4 border border-outline-variant/60 text-left space-y-2">
        <div className="flex gap-2 text-xs font-bold text-on-surface-variant items-center">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>University Data Safe Harbor</span>
        </div>
        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          The prediction engine complies with HIPAA/FERPA standards. Safe harbor encryption is active. Let’s head to the dashboard!
        </p>
      </div>

      {/* Primary Action */}
      <Button
        onClick={() => navigate('/login')}
        className="w-full"
      >
        Go to Portal Dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
