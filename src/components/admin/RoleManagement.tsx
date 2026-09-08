import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Lock,
  Info,
  Layers,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRolePermissions, useUpdateRolePermissions } from '../../hooks/useAdminData';
import { STATIC_PERMISSIONS } from '../../services/adminService';

export function RoleManagement() {
  const { data: rolePermissions = [], isLoading } = useRolePermissions();
  const updatePermissionsMutation = useUpdateRolePermissions();

  const rolesList: ('student' | 'faculty' | 'counselor' | 'admin')[] = ['admin', 'counselor', 'faculty', 'student'];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'System Admin';
      case 'counselor': return 'Counselor';
      case 'faculty': return 'Faculty / Mentor';
      default: return 'Student Cohort';
    }
  };

  const handleTogglePermission = (role: 'student' | 'faculty' | 'counselor' | 'admin', permissionId: string) => {
    // Admin is root, prevent locking admin out of system configuration
    if (role === 'admin' && (permissionId === 'configure_systems' || permissionId === 'access_audit_logs')) {
      return; // Absolute safegard!
    }

    const currentRolePerm = rolePermissions.find(p => p.role === role);
    if (!currentRolePerm) return;

    let updatedPerms = [...currentRolePerm.permissions];
    if (updatedPerms.includes(permissionId)) {
      updatedPerms = updatedPerms.filter(id => id !== permissionId);
    } else {
      updatedPerms.push(permissionId);
    }

    updatePermissionsMutation.mutate({ role, permissions: updatedPerms });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/4" />
        <div className="h-96 bg-surface-container rounded-lg" />
      </div>
    );
  }

  // Group permissions by category
  const categories = [
    { id: 'users', label: 'Roster & User Accounts' },
    { id: 'academic', label: 'Academics & Analytics' },
    { id: 'counseling', label: 'Clinical Counseling' },
    { id: 'reports', label: 'Analytical Reports' },
    { id: 'system', label: 'Central Infrastructure' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">RBAC Policy Access control matrix</h3>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Interlock role models dynamically to enforce secure client boundary rules.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main interactive matrix table */}
        <div className="xl:col-span-8">
          <Card className="border-outline-variant/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                {/* Header row with Roles */}
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/40">
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none min-w-[240px]">
                      Access Security Permissions
                    </th>
                    {rolesList.map(role => (
                      <th
                        key={role}
                        className="p-4 text-center text-[10px] font-black uppercase text-on-surface-variant select-none min-w-[100px]"
                      >
                        {getRoleLabel(role)}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Categories and rows */}
                <tbody className="divide-y divide-outline-variant/20 font-semibold text-on-surface">
                  {categories.map((cat) => {
                    const catPerms = STATIC_PERMISSIONS.filter(p => p.category === cat.id);

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Section Header */}
                        <tr className="bg-surface-container/20 border-y border-outline-variant/30">
                          <td colSpan={rolesList.length + 1} className="p-3 text-[9px] font-black uppercase tracking-widest text-primary/80 select-none">
                            {cat.label}
                          </td>
                        </tr>

                        {/* Permission rows */}
                        {catPerms.map((perm) => {
                          return (
                            <tr key={perm.id} className="hover:bg-surface-container/10 transition">
                              <td className="p-4 space-y-1">
                                <h5 className="font-sans font-black text-[11px] text-on-surface uppercase leading-none">{perm.name}</h5>
                                <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed font-semibold">{perm.description}</p>
                                <p className="font-mono text-[8px] text-outline font-extrabold select-none tracking-wider uppercase">ID: {perm.id}</p>
                              </td>

                              {/* Interactive check grid */}
                              {rolesList.map((role) => {
                                const rolePermObj = rolePermissions.find(p => p.role === role);
                                const hasPermission = rolePermObj?.permissions.includes(perm.id);

                                // Check if this is an un-mutable Admin root key
                                const isLockedAdminKey = role === 'admin' && (perm.id === 'configure_systems' || perm.id === 'access_audit_logs');

                                return (
                                  <td key={role} className="p-4 text-center">
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => handleTogglePermission(role, perm.id)}
                                        disabled={isLockedAdminKey}
                                        className={`h-6 w-6 rounded-md border flex items-center justify-center transition focus:outline-none cursor-pointer ${
                                          isLockedAdminKey
                                            ? 'bg-surface-container border-outline text-outline cursor-not-allowed'
                                            : hasPermission
                                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/15'
                                              : 'bg-surface-container-low border-outline-variant hover:border-primary/20 hover:bg-primary/5 text-transparent'
                                        }`}
                                      >
                                        {isLockedAdminKey ? (
                                          <Lock className="h-3.5 w-3.5" />
                                        ) : hasPermission ? (
                                          <Check className="h-4 w-4 stroke-[3px]" />
                                        ) : (
                                          <X className="h-3.5 w-3.5 text-on-surface-variant/30" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Informative Side-Panel */}
        <div className="xl:col-span-4 space-y-4">
          <Card className="border-outline-variant/60">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 p-lg">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-xs font-black uppercase text-on-surface">Matrix Security Policies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-lg space-y-4 text-xs font-semibold leading-relaxed">
              <p className="text-on-surface-variant">
                Role-Based Access Control (RBAC) represents our core institutional privacy firewall. Changing these parameters updates Client Guards instantly.
              </p>

              <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/10 flex gap-3 text-xs">
                <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h6 className="font-sans font-black uppercase text-[10px] text-primary">Live Guard Invalidation</h6>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Any modification made here immediately takes effect. Logged-in users will receive session rights updates dynamically without needing system restarts.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 select-none">
                <h6 className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Access Guidelines</h6>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                    <p className="text-[11px] text-on-surface-variant">
                      <strong>System Admins</strong> have full root overrides. System security and audit trail keys cannot be de-authorized from the admin.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                    <p className="text-[11px] text-on-surface-variant">
                      <strong>Counselors</strong> require active clinical keys to edit academic support plans and log dialogue sessions.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    <p className="text-[11px] text-on-surface-variant">
                      <strong>Faculty</strong> are authorized to submit grades and track classroom attendance benchmarks.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                    <p className="text-[11px] text-on-surface-variant">
                      <strong>Students</strong> operate on read-only constraints, allowing profile views but prohibiting grading or clinical edits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
