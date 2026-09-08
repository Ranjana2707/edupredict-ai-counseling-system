import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-sans text-sm font-medium text-on-surface-variant">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If already logged in, send directly to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
