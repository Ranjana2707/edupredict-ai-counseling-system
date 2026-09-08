import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
        <ShieldAlert className="h-10 w-10 animate-pulse" />
      </div>
      <h1 className="mt-8 font-sans text-3xl font-extrabold tracking-tight text-on-surface">
        Access Denied
      </h1>
      <h2 className="mt-2 font-sans text-base font-bold text-error">
        Insufficient System Permissions
      </h2>
      <p className="mt-2 font-sans text-xs text-on-surface-variant max-w-sm leading-relaxed">
        Your current student/staff account role does not have authorization clearance to inspect this secure prediction section.
      </p>
      <div className="mt-8">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
