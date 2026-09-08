import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { CounselorFloatingChat } from '../components/counselor/CounselorFloatingChat';

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-sans text-sm font-medium text-on-surface-variant animate-pulse">
            Establishing secure data streams...
          </p>
        </div>
      </div>
    );
  }

  // Double check authorization
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top Header Controls bar */}
      <Navbar onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Main Container Workspace */}
      <div className="flex flex-1">
        {/* Navigation Sidebar Drawer */}
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

        {/* Content Canvas Workspace */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 p-lg md:p-xl overflow-y-auto">
            <Outlet />
          </main>

          {/* Copyright System info Footer */}
          <Footer />
        </div>
      </div>
      {/* Floating Chat assistant for counselors, faculty, and admins */}
      <CounselorFloatingChat />
    </div>
  );
}
