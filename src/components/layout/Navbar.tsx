import { Menu, ShieldAlert, GraduationCap, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { NotificationBell } from '../ui/NotificationBell';
import { ProfileMenu } from '../ui/ProfileMenu';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ClayUISwitcher } from './ClayUISwitcher';
import { GlobalSearchBar } from './GlobalSearchBar';
import { cn } from '../../utils';
import { Logo } from '../ui/Logo';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant/30 bg-surface/85 backdrop-blur-md select-none transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu Trigger and Brand Identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onMobileMenuToggle}
            className="md:hidden h-9 w-9 p-0 rounded-xl hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Logo size="sm" withText />
        </div>

        {/* Center Section: Global Search Bar - Responsive layout managed internally */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 md:mx-6 flex justify-end md:justify-start">
          <GlobalSearchBar />
        </div>

        {/* Right Section: System controls, role awareness, and profile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Institution Sandbox Alert Banner - Styled beautifully with modern indicators */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/[0.04] px-3 py-1 font-sans text-[9px] font-extrabold text-amber-600 dark:text-amber-400 select-none border border-amber-500/20 tracking-wider uppercase leading-none">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500 animate-pulse-slow shrink-0" />
            Virtual Sandbox Active
          </div>

          {/* User Role Badge (Clean, visual role awareness on desktop/tablet) */}
          {user && (
            <div className={cn(
              "hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border select-none leading-none",
              user.role === 'admin' && "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
              user.role === 'counselor' && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
              user.role === 'faculty' && "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
              user.role === 'student' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            )}>
              <UserCheck className="h-3 w-3 shrink-0" />
              {user.role}
            </div>
          )}

          <ClayUISwitcher />
          <ThemeSwitcher />
          <NotificationBell />
          <div className="h-5 w-px bg-outline-variant/40 mx-0.5" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

