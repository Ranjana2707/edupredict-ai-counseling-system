import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-center select-none">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HelpCircle className="h-10 w-10 animate-bounce" />
      </div>
      <h1 className="mt-8 font-sans text-5xl font-extrabold tracking-tight text-on-surface">
        404
      </h1>
      <h2 className="mt-2 font-sans text-xl font-bold text-on-surface">
        Predictive Target Not Found
      </h2>
      <p className="mt-2 font-sans text-xs text-on-surface-variant max-w-sm leading-relaxed">
        The system analytics directory path you entered does not exist or has been shifted in active system memory.
      </p>
      <div className="mt-8 flex items-center gap-3">
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
