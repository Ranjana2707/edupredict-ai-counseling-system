import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationItem } from '../../types';
import { Button } from './Button';

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // High-fidelity predictive system notifications customized to current user's role
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const base: NotificationItem[] = [
      {
        id: '1',
        title: 'Model Sync Successful',
        message: 'The risk forecasting engine completed daily training synchronization.',
        type: 'success',
        timestamp: '10 mins ago',
        isRead: false,
      },
    ];

    if (user?.role === 'student') {
      return [
        ...base,
        {
          id: 'student-01',
          title: 'New Support Resource',
          message: 'CS-201 study groups are now open for registration.',
          type: 'info',
          timestamp: '1 hour ago',
          isRead: false,
        },
      ];
    }

    return [
      ...base,
      {
        id: 'staff-01',
        title: 'Critical Risk Alert',
        message: 'Student Rohan Sharma risk profile escalated to high risk.',
        type: 'alert',
        timestamp: '5 mins ago',
        isRead: false,
      },
      {
        id: 'staff-02',
        title: 'Counseling Session Overdue',
        message: '3 student logs require follow-up reviews.',
        type: 'alert',
        timestamp: '2 hours ago',
        isRead: false,
      },
    ];
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 p-0 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest" />
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-lg z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-lg border-b border-outline-variant/30 bg-surface-container-low/40">
            <h4 className="font-sans text-sm font-semibold text-on-surface">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-primary-container transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant font-sans">
                No active system alerts.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleRead(item.id)}
                  className={`flex gap-3 p-lg cursor-pointer transition-all hover:bg-surface-container-low/40 ${
                    !item.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'alert' && (
                      <CircleAlert className="h-4.5 w-4.5 text-error" />
                    )}
                    {item.type === 'success' && (
                      <CircleCheck className="h-4.5 w-4.5 text-emerald-500" />
                    )}
                    {item.type === 'info' && (
                      <Info className="h-4.5 w-4.5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-sans text-xs font-semibold text-on-surface">
                        {item.title}
                      </p>
                      <span className="font-sans text-[10px] text-on-surface-variant">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="font-sans text-xs leading-normal text-on-surface-variant">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
