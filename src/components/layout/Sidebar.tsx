import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingDown,
  FileText,
  GraduationCap,
  Settings,
  X,
  Calendar,
  Sparkles,
  Compass,
  User,
  Bell,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

// Safe explicit Lucide Icons mapping to avoid dynamic bundler resolving issues
const iconMap: Record<string, any> = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  TrendingDown: TrendingDown,
  FileText: FileText,
  GraduationCap: GraduationCap,
  Settings: Settings,
  Calendar: Calendar,
  Sparkles: Sparkles,
  Compass: Compass,
  User: User,
  Bell: Bell,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Filter navigation links based on user role permission matrix
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-inverse-surface/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header (Mobile ONLY) */}
        <div className="flex h-16 items-center justify-between border-b border-outline-variant px-lg md:hidden">
          <Logo size="sm" withText />
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-on-surface-variant hover:bg-surface-container-low"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 p-lg overflow-y-auto">
          {filteredNavItems.map((item) => {
            const IconComponent = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-lg py-3 rounded-default font-sans text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold shadow-sm shadow-primary/5'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <IconComponent className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-outline'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info container inside sidebar */}
        <div className="border-t border-outline-variant/30 p-lg bg-surface-container-low/20">
          <div className="rounded-lg bg-surface-container p-lg space-y-2 select-none border border-outline-variant/40">
            <p className="font-sans text-[10px] font-extrabold text-primary tracking-wider uppercase">
              Current Session
            </p>
            <div className="space-y-0.5">
              <p className="font-sans text-xs font-bold text-on-surface truncate">
                {user.name}
              </p>
              <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                ID: {user.id}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
