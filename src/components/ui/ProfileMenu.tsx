import { useState, useRef, useEffect } from 'react';
import { LogOut, RefreshCw, Shield, User, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { UserRole } from '../../types';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';

export function ProfileMenu() {
  const { user, logout, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'student', label: 'Student View' },
    { role: 'faculty', label: 'Faculty View' },
    { role: 'counselor', label: 'Counselor View' },
    { role: 'admin', label: 'Admin View' },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors select-none text-left"
      >
        <Avatar
          src={user.avatarUrl}
          fallback={user.name}
          size="sm"
          className="ring-2 ring-primary/10"
        />
        <div className="hidden md:block pr-2">
          <p className="font-sans text-xs font-semibold text-on-surface leading-none">
            {user.name}
          </p>
          <span className="font-sans text-[10px] text-primary font-semibold uppercase tracking-wider">
            {user.role}
          </span>
        </div>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-lg z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {/* User Details */}
          <div className="p-lg border-b border-outline-variant/30 bg-surface-container-low/20">
            <p className="font-sans text-sm font-bold text-on-surface leading-tight">
              {user.name}
            </p>
            <p className="font-sans text-xs text-on-surface-variant truncate">
              {user.email}
            </p>
            <span className="inline-flex mt-2 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              {user.role}
            </span>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="p-sm border-b border-outline-variant/20 bg-primary-container/5">
            <p className="px-lg py-1.5 font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Quick Role Switcher (Demo)
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {rolesList.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded px-lg py-2 font-sans text-xs text-left transition-colors ${
                    user.role === role
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${user.role === role ? 'animate-spin-slow' : ''}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings and Logout */}
          <div className="p-sm space-y-0.5">
            <button
              onClick={() => {
                setIsForgotModalOpen(true);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-lg py-2.5 font-sans text-xs text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-primary" />
              Reset / Forgot Password
            </button>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-lg py-2.5 font-sans text-xs text-error font-medium hover:bg-error/5 transition-colors text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Securely
            </button>
          </div>
        </div>
      )}

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={user.email}
      />
    </div>
  );
}
