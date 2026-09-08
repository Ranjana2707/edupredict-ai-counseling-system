import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Megaphone,
  Mail,
  Send,
  Trash2,
  Users,
  Clock,
  MessageSquare,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAdminNotifications, useSendNotification } from '../../hooks/useAdminData';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

export function NotificationManagement() {
  const { data: notifications = [], refetch } = useAdminNotifications();
  const sendMutation = useSendNotification();

  // Broadcaster Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'system' | 'email' | 'sms' | 'push'>('system');
  const [targetType, setTargetType] = useState<'broadcast' | 'role' | 'individual'>('broadcast');
  const [targetRole, setTargetRole] = useState<'student' | 'faculty' | 'counselor' | 'admin'>('student');
  const [targetEmail, setTargetEmail] = useState('');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    if (targetType === 'individual' && !targetEmail) {
      toast.error('Specific email index is required for individual routing.');
      return;
    }

    sendMutation.mutate(
      {
        title,
        message,
        channel,
        type: targetType,
        targetRole: targetType === 'role' ? targetRole : undefined,
        targetEmail: targetType === 'individual' ? targetEmail : undefined
      },
      {
        onSuccess: () => {
          setTitle('');
          setMessage('');
          setTargetEmail('');
        }
      }
    );
  };

  const handleClearAll = () => {
    adminService.clearNotifications();
    refetch();
    toast.success('Dispatched notifications board cleared successfully.');
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'email': return <Mail className="h-4 w-4 text-sky-500" />;
      case 'push': return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">System Broadcaster & Alert matrix</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Broadcast high-priority notices, dispatch warning emails, and trigger notifications.</p>
        </div>

        <Button
          onClick={handleClearAll}
          variant="outline"
          size="sm"
          className="text-xs font-bold gap-1.5 h-9 text-rose-500 border-rose-500/20 hover:bg-rose-500/5 hover:border-rose-500/40 self-start sm:self-auto select-none"
        >
          <Trash2 className="h-4 w-4" /> Purge Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dispatch Form panel */}
        <div className="lg:col-span-5">
          <Card className="border border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-lg">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle className="text-xs font-black uppercase text-on-surface">Launch Alert Broadcast</CardTitle>
              </div>
              <CardDescription className="text-xs font-medium text-on-surface-variant">
                Enables immediate alerts directly to users inboxes and device terminals.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleDispatch}>
              <CardContent className="p-lg space-y-4 text-xs font-semibold">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Subject Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mandatory Retention Review Session..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs text-on-surface"
                  />
                </div>

                {/* Message text block */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Warning message payload</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detail the alerts instructions or warning vectors..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs text-on-surface leading-relaxed resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Channel dropdown select */}
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Dispatch Channel</label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
                    >
                      <option value="system">IN-APP NOTIFICATION</option>
                      <option value="email">SECURE EMAIL HUB</option>
                      <option value="sms">SMS CELLULAR CARRIER</option>
                      <option value="push">MOBILE PUSH WARNING</option>
                    </select>
                  </div>

                  {/* Target Audience type */}
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Target Audience</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
                    >
                      <option value="broadcast">BROADCAST ALL ROLES</option>
                      <option value="role">TARGET SPECIFIC ROLE</option>
                      <option value="individual">SINGLE USER PROFILE</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Subtargets inputs */}
                <AnimatePresence mode="wait">
                  {targetType === 'role' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1.5 select-none overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase text-on-surface-variant">Audience Role Target</label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
                      >
                        <option value="student">STUDENTS ONLY</option>
                        <option value="faculty">FACULTY MENTORS ONLY</option>
                        <option value="counselor">WELLNESS COUNSELORS ONLY</option>
                      </select>
                    </motion.div>
                  )}

                  {targetType === 'individual' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase text-on-surface-variant">Recipient Email index</label>
                      <input
                        type="email"
                        required
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="e.g. targetuser@university.edu"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs text-on-surface"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              {/* Action Submit */}
              <div className="p-lg border-t border-outline-variant/30 bg-surface-container/10 flex justify-end">
                <Button
                  loading={sendMutation.isPending}
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs uppercase font-black gap-1.5 h-9"
                >
                  <Send className="h-4 w-4" /> Dispatch Warning
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* History dispatched Feed */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 p-lg">
              <CardTitle className="text-xs font-black uppercase text-on-surface">Active Alert Broadcast History</CardTitle>
              <CardDescription className="text-xs font-medium">History of live dispatches emitted from administrative terminals.</CardDescription>
            </CardHeader>

            <CardContent className="p-lg space-y-4">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest/40 hover:border-primary/20 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 select-none">
                          {getChannelIcon(notif.channel)}
                          <h5 className="font-sans font-black text-on-surface text-xs uppercase">{notif.title}</h5>
                        </div>
                        <span className="text-[9px] text-outline font-extrabold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="font-sans text-[11px] font-semibold text-on-surface-variant leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-2 select-none border-t border-outline-variant/10 flex items-center justify-between flex-wrap gap-2 text-[10px] text-on-surface-variant/80 font-bold uppercase">
                        <span>
                          Target Group: <strong>{notif.type === 'broadcast' ? 'Broadcast' : notif.type === 'role' ? `${notif.targetRole} role` : notif.targetEmail}</strong>
                        </span>
                        <span>Channel: <strong>{notif.channel}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center text-on-surface-variant">
                  <Bell className="h-10 w-10 mx-auto text-on-surface-variant/30" />
                  <h4 className="font-sans text-xs font-bold text-on-surface mt-3">Dispatched Feed Clear</h4>
                  <p className="text-[11px] text-on-surface-variant mt-1 font-sans">No notifications have been launched in the current system session.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
