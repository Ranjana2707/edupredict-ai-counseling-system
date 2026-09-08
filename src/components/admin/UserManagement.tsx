import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  X,
  Check,
  Shield,
  Eye,
  GraduationCap,
  Sparkles,
  MoreVertical,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetPassword,
  useToggleLock,
  useToggleActivation
} from '../../hooks/useAdminData';
import { AdminUser } from '../../types';

export function UserManagement() {
  const { data: users = [], isLoading } = useAdminUsers();

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useResetPassword();
  const toggleLockMutation = useToggleLock();
  const toggleActivationMutation = useToggleActivation();

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Modals/Dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToModify, setUserToModify] = useState<AdminUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'student' | 'faculty' | 'counselor' | 'admin'>('student');
  const [formDept, setFormDept] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Filter & Search users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  // Handle Form triggers
  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('student');
    setFormDept('');
    setFormStatus('active');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    createUserMutation.mutate(
      {
        name: formName,
        email: formEmail,
        role: formRole,
        department: formDept || 'General Education',
        status: formStatus,
        isLocked: false,
        passwordResetRequired: false,
        avatarUrl: `https://images.unsplash.com/photo-${Math.floor(1500000000000 + Math.random() * 90000000000)}?w=150`
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
        }
      }
    );
  };

  const openEditModal = (user: AdminUser) => {
    setUserToModify(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDept(user.department || '');
    setFormStatus(user.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToModify || !formName || !formEmail) return;

    updateUserMutation.mutate(
      {
        id: userToModify.id,
        updates: {
          name: formName,
          email: formEmail,
          role: formRole,
          department: formDept,
          status: formStatus
        }
      },
      {
        onSuccess: (updated) => {
          setIsEditModalOpen(false);
          if (selectedUser?.id === updated.id) {
            setSelectedUser(updated);
          }
        }
      }
    );
  };

  const triggerDeleteConfirm = (user: AdminUser) => {
    setUserToModify(user);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToModify) return;
    deleteUserMutation.mutate(userToModify.id, {
      onSuccess: () => {
        setIsConfirmDeleteOpen(false);
        setUserToModify(null);
        if (selectedUser?.id === userToModify.id) {
          setSelectedUser(null);
        }
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-600 border-rose-500/15';
      case 'counselor': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/15';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Access & User directory</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Audit, edit, provision access keys, and secure client role models.</p>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          size="sm"
          className="text-xs font-black gap-1.5 self-start sm:self-auto h-9 shadow-sm"
        >
          <UserPlus className="h-4.5 w-4.5" /> Provision User
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table List container */}
        <div className={`xl:col-span-8 space-y-4 transition-all duration-300`}>
          <Card className="border-outline-variant/60">
            {/* Toolbar Filters */}
            <div className="p-4 border-b border-outline-variant/30 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between bg-surface-container/10">
              {/* Search input bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                <input
                  type="text"
                  placeholder="Search user ID, full name, email index..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-hidden focus:border-primary placeholder:text-outline-variant transition"
                />
              </div>

              {/* Advanced Dropdown filter selects */}
              <div className="flex flex-wrap items-center gap-2 select-none text-xs">
                {/* Role select */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-surface-container-low border border-outline-variant/80 text-on-surface font-extrabold uppercase py-1.5 px-3 rounded-lg focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
                >
                  <option value="all">ALL ROLES</option>
                  <option value="student">STUDENTS</option>
                  <option value="faculty">FACULTY</option>
                  <option value="counselor">COUNSELORS</option>
                  <option value="admin">ADMINISTRATORS</option>
                </select>

                {/* Status Select */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-surface-container-low border border-outline-variant/80 text-on-surface font-extrabold uppercase py-1.5 px-3 rounded-lg focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
                >
                  <option value="all">ALL STATUS</option>
                  <option value="active">ACTIVE ONLY</option>
                  <option value="inactive">INACTIVE ONLY</option>
                </select>
              </div>
            </div>

            {/* Table layout */}
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/40 border-b border-outline-variant/40">
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none">User Identity</th>
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none">Authorized Role</th>
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none">Assigned Dept</th>
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant select-none">Security Attributes</th>
                    <th className="p-4 text-[10px] font-black text-right uppercase text-on-surface-variant select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-semibold text-on-surface/90">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="p-5 h-16 bg-surface-container/10" />
                      </tr>
                    ))
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-surface-container/10 transition cursor-pointer ${
                          selectedUser?.id === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        {/* Profile Identity cell */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-outline-variant/30"
                            />
                            <div className="space-y-0.5">
                              <h5 className="font-sans font-black text-[11px] text-on-surface">{user.name}</h5>
                              <p className="text-[10px] text-on-surface-variant leading-none">{user.email}</p>
                              <p className="text-[9px] text-outline font-extrabold tracking-wider uppercase leading-none">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role cell */}
                        <td className="p-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Department cell */}
                        <td className="p-4">
                          <span className="text-[11px] text-on-surface-variant font-bold truncate max-w-[150px] block">
                            {user.department || 'N/A'}
                          </span>
                        </td>

                        {/* Status cell */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                            user.status === 'active' ? 'text-emerald-500' : 'text-on-surface-variant/70'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-on-surface-variant/40'}`} />
                            {user.status}
                          </span>
                        </td>

                        {/* Security indicators */}
                        <td className="p-4 select-none">
                          <div className="flex items-center gap-1.5">
                            {user.isLocked && (
                              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/15 p-1 rounded-sm" title="Account Locked">
                                <Lock className="h-3 w-3" />
                              </span>
                            )}
                            {user.passwordResetRequired && (
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/15 px-1.5 py-0.5 rounded text-[8px] font-black uppercase" title="Reset Pending">
                                Reset Required
                              </span>
                            )}
                            {!user.isLocked && !user.passwordResetRequired && (
                              <span className="text-[9px] text-emerald-500/80 font-black uppercase tracking-wider">Secured</span>
                            )}
                          </div>
                        </td>

                        {/* Action triggers */}
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setSelectedUser(user)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-on-surface-variant hover:text-primary hover:bg-primary/5"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => openEditModal(user)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-on-surface-variant hover:text-secondary hover:bg-secondary/5"
                              title="Modify Profile"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => triggerDeleteConfirm(user)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/5"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant/60">
                        <Users className="h-10 w-10 mx-auto text-on-surface-variant/30" />
                        <h4 className="font-sans text-xs font-bold text-on-surface mt-3">No profiles match</h4>
                        <p className="text-[11px] mt-1 text-on-surface-variant">Try refining your searches or filter matrix criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between select-none bg-surface-container/10">
                <span className="text-[10px] text-on-surface-variant font-extrabold uppercase">
                  Page {currentPage} of {totalPages} ({filteredUsers.length} total matched)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 px-2 font-bold uppercase"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-8 px-2 font-bold uppercase"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Master Detail Right Panel (Drawer-like) */}
        <div className="xl:col-span-4">
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="border border-primary/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3" onClick={() => setSelectedUser(null)}>
                  <Button variant="ghost" className="h-6 w-6 p-0 rounded-full text-on-surface-variant hover:bg-surface-container">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 text-center pb-6">
                  <div className="flex flex-col items-center gap-3 mt-4">
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-primary/10"
                    />
                    <div className="space-y-0.5">
                      <h4 className="font-sans text-xs font-black uppercase tracking-wider text-on-surface">
                        {selectedUser.name}
                      </h4>
                      <p className="font-sans text-[11px] font-semibold text-on-surface-variant">
                        {selectedUser.email}
                      </p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role} Key
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-lg space-y-4 text-xs">
                  {/* Bio details list */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant font-bold uppercase text-[9px]">User ID Reference</span>
                      <span className="font-mono font-bold text-on-surface">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant font-bold uppercase text-[9px]">Department</span>
                      <span className="font-bold text-on-surface">{selectedUser.department || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant font-bold uppercase text-[9px]">Enrolled / Created At</span>
                      <span className="font-bold text-on-surface">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant font-bold uppercase text-[9px]">Uptime last Login</span>
                      <span className="font-bold text-on-surface">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant font-bold uppercase text-[9px]">Security Status</span>
                      <span className={`font-black uppercase text-[10px] ${selectedUser.isLocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {selectedUser.isLocked ? 'Locked / Blocked' : 'Secured'}
                      </span>
                    </div>
                  </div>

                  {/* Operational Security Action triggers inside details panel */}
                  <div className="space-y-2 pt-2 select-none">
                    <h5 className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Quick Admin Controls</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Password Reset */}
                      <Button
                        onClick={() => resetPasswordMutation.mutate(selectedUser.id)}
                        loading={resetPasswordMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold uppercase gap-1.5 h-9"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Force Reset
                      </Button>

                      {/* Lock Toggle */}
                      <Button
                        onClick={() => toggleLockMutation.mutate(selectedUser.id)}
                        loading={toggleLockMutation.isPending}
                        variant="outline"
                        size="sm"
                        className={`text-[10px] font-bold uppercase gap-1.5 h-9 ${
                          selectedUser.isLocked ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-rose-600 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'
                        }`}
                      >
                        {selectedUser.isLocked ? (
                          <><Unlock className="h-3.5 w-3.5" /> Unlock User</>
                        ) : (
                          <><Lock className="h-3.5 w-3.5" /> Lock Account</>
                        )}
                      </Button>

                      {/* Activation toggler */}
                      <Button
                        onClick={() => toggleActivationMutation.mutate(selectedUser.id, {
                          onSuccess: (res) => {
                            setSelectedUser(prev => prev ? { ...prev, status: res ? 'active' : 'inactive' } : null);
                          }
                        })}
                        loading={toggleActivationMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-[10px] font-bold uppercase gap-1.5 h-9 col-span-2"
                      >
                        <Check className="h-3.5 w-3.5" /> Toggle Active State (Currently: {selectedUser.status})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border border-dashed border-outline-variant/60 p-12 text-center h-full flex flex-col justify-center bg-surface-container/5">
              <Eye className="h-10 w-10 text-outline-variant/40 mx-auto" />
              <h4 className="font-sans text-xs font-bold text-on-surface mt-3">Roster Audit Center</h4>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                Select any row to invoke 360-degree security credentials, password force keys, and database logs.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h4 className="font-sans text-sm font-black uppercase tracking-wider text-on-surface">Provision Roster Account</h4>
                </div>
                <Button onClick={() => setIsAddModalOpen(false)} variant="ghost" className="h-7 w-7 p-0 rounded-full text-on-surface-variant hover:bg-surface-container">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateUser} className="p-lg space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter candidate name..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Academic/Institutional Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. name@university.edu"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Authorized Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                    >
                      <option value="student">STUDENT</option>
                      <option value="faculty">FACULTY</option>
                      <option value="counselor">COUNSELOR</option>
                      <option value="admin">ADMINISTRATOR</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Primary Department</label>
                    <input
                      type="text"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 select-none">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Initial Activation Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                  >
                    <option value="active">ACTIVE SYSTEM LOGS</option>
                    <option value="inactive">SUSPENDED</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button onClick={() => setIsAddModalOpen(false)} variant="outline" size="sm" type="button" className="text-xs uppercase font-extrabold">
                    Cancel
                  </Button>
                  <Button loading={createUserMutation.isPending} variant="primary" size="sm" type="submit" className="text-xs uppercase font-black">
                    Commit Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT USER MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-secondary" />
                  <h4 className="font-sans text-sm font-black uppercase tracking-wider text-on-surface">Update Account Settings</h4>
                </div>
                <Button onClick={() => setIsEditModalOpen(false)} variant="ghost" className="h-7 w-7 p-0 rounded-full text-on-surface-variant hover:bg-surface-container">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-lg space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter candidate name..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Academic/Institutional Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Authorized Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                    >
                      <option value="student">STUDENT</option>
                      <option value="faculty">FACULTY</option>
                      <option value="counselor">COUNSELOR</option>
                      <option value="admin">ADMINISTRATOR</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Primary Department</label>
                    <input
                      type="text"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 select-none">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Initial Activation Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase focus:outline-hidden focus:border-primary text-[11px] tracking-wider"
                  >
                    <option value="active">ACTIVE SYSTEM LOGS</option>
                    <option value="inactive">SUSPENDED</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button onClick={() => setIsEditModalOpen(false)} variant="outline" size="sm" type="button" className="text-xs uppercase font-extrabold">
                    Cancel
                  </Button>
                  <Button loading={updateUserMutation.isPending} variant="secondary" size="sm" type="submit" className="text-xs uppercase font-black">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-sm shadow-xl p-lg space-y-4"
            >
              <div className="flex items-start gap-3 text-xs">
                <div className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-sans font-black uppercase tracking-wider text-on-surface">Deprovision Roster Profile?</h4>
                  <p className="font-sans font-semibold text-on-surface-variant leading-relaxed">
                    Are you sure you want to permanently delete <strong>{userToModify?.name}</strong>? All persistent counseling, marks rosters, and analytics indices for this user ID will be decoupled and lost.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => { setIsConfirmDeleteOpen(false); setUserToModify(null); }} variant="outline" size="sm" className="text-[11px] font-bold uppercase h-8">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  loading={deleteUserMutation.isPending}
                  variant="primary"
                  size="sm"
                  className="text-[11px] font-black uppercase bg-rose-600 hover:bg-rose-700 text-white border-rose-600 h-8"
                >
                  Confirm Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
