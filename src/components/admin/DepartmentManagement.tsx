import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  X,
  TrendingDown,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  useAdminDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment
} from '../../hooks/useAdminData';
import { Department } from '../../types';

export function DepartmentManagement() {
  const { data: departments = [], isLoading } = useAdminDepartments();

  // Mutations
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDeptMutation();
  const deleteDeptMutation = useDeleteDepartment();

  // State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<Department | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hod, setHod] = useState('');
  const [studentsCount, setStudentsCount] = useState<number>(10);
  const [staffCount, setStaffCount] = useState<number>(3);
  const [budget, setBudget] = useState('$100,000');
  const [risk, setRisk] = useState<number>(15.0);

  // Hook safety wrapper
  function useUpdateDeptMutation() {
    return useUpdateDepartment();
  }

  // General department statistics
  const stats = useMemo(() => {
    if (departments.length === 0) return { total: 0, avgRisk: 0, maxRisk: '', totalStudents: 0 };
    const totalStudents = departments.reduce((acc, d) => acc + d.studentCount, 0);
    const avgRisk = parseFloat((departments.reduce((acc, d) => acc + d.riskPercentage, 0) / departments.length).toFixed(1));
    const highestRiskDeptObj = [...departments].sort((a, b) => b.riskPercentage - a.riskPercentage)[0];

    return {
      total: departments.length,
      avgRisk,
      maxRisk: `${highestRiskDeptObj.code} (${highestRiskDeptObj.riskPercentage}%)`,
      totalStudents
    };
  }, [departments]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !hod) return;

    createDeptMutation.mutate(
      {
        name,
        code: code.toUpperCase(),
        hod,
        studentCount: Number(studentsCount),
        staffCount: Number(staffCount),
        budget,
        riskPercentage: Number(risk)
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          clearForm();
        }
      }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDept || !name || !code || !hod) return;

    updateDeptMutation.mutate(
      {
        id: activeDept.id,
        updates: {
          name,
          code: code.toUpperCase(),
          hod,
          studentCount: Number(studentsCount),
          staffCount: Number(staffCount),
          budget,
          riskPercentage: Number(risk)
        }
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setActiveDept(null);
          clearForm();
        }
      }
    );
  };

  const handleDelete = () => {
    if (!activeDept) return;
    deleteDeptMutation.mutate(activeDept.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setActiveDept(null);
      }
    });
  };

  const openCreate = () => {
    clearForm();
    setIsCreateOpen(true);
  };

  const openEdit = (dept: Department) => {
    setActiveDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHod(dept.hod);
    setStudentsCount(dept.studentCount);
    setStaffCount(dept.staffCount);
    setBudget(dept.budget);
    setRisk(dept.riskPercentage);
    setIsEditOpen(true);
  };

  const openDelete = (dept: Department) => {
    setActiveDept(dept);
    setIsDeleteOpen(true);
  };

  const clearForm = () => {
    setName('');
    setCode('');
    setHod('');
    setStudentsCount(10);
    setStaffCount(3);
    setBudget('$100,000');
    setRisk(15.0);
  };

  const getRiskColor = (pct: number) => {
    if (pct >= 25.0) return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
    if (pct >= 15.0) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container rounded-md w-1/4" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="h-44 bg-surface-container rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Department roster index</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Regulate branches, staff-to-student load ratios, and fiscal budgets.</p>
        </div>
        <Button
          onClick={openCreate}
          variant="primary"
          size="sm"
          className="text-xs font-black gap-1.5 self-start sm:self-auto h-9"
        >
          <Plus className="h-4.5 w-4.5" /> Provision Branch
        </Button>
      </div>

      {/* Grid of Department Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 select-none">
        <Card className="p-4 hover:border-primary/25 transition cursor-default">
          <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wider">Assigned Branches</span>
          <h4 className="text-2xl font-black text-on-surface mt-2">{stats.total}</h4>
          <p className="text-[10px] text-primary font-bold mt-1 uppercase">Active Departments</p>
        </Card>

        <Card className="p-4 hover:border-primary/25 transition cursor-default">
          <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wider">Enrolled Cohort</span>
          <h4 className="text-2xl font-black text-on-surface mt-2">{stats.totalStudents}</h4>
          <p className="text-[10px] text-secondary font-bold mt-1 uppercase">Students Monitored</p>
        </Card>

        <Card className="p-4 hover:border-primary/25 transition cursor-default">
          <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wider">Average Branch Risk</span>
          <h4 className="text-2xl font-black text-on-surface mt-2">{stats.avgRisk}%</h4>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Dropout Factor</p>
        </Card>

        <Card className="p-4 hover:border-primary/25 transition cursor-default">
          <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wider">Highest Threat Density</span>
          <h4 className="text-2xl font-black text-rose-500 mt-2 truncate">{stats.maxRisk}</h4>
          <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">Critical Zone</p>
        </Card>
      </div>

      {/* Departments Grid layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {departments.map((dept) => (
          <Card key={dept.id} className="border-outline-variant/60 hover:border-primary/20 transition duration-200">
            <CardHeader className="bg-surface-container/20 border-b border-outline-variant/30 p-lg flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-sm">
                    {dept.code}
                  </span>
                  <span className="text-[10px] text-outline font-extrabold select-none tracking-wider uppercase">
                    ID: {dept.id}
                  </span>
                </div>
                <CardTitle className="font-sans text-xs font-black uppercase text-on-surface">
                  {dept.name}
                </CardTitle>
                <p className="text-[11px] text-on-surface-variant font-semibold">
                  HOD Assigned: <strong>{dept.hod}</strong>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => openEdit(dept)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-on-surface-variant hover:text-secondary hover:bg-secondary/5"
                  title="Edit details"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => openDelete(dept)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/5"
                  title="Remove branch"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-lg space-y-4 text-xs font-semibold">
              {/* Stats detail grid */}
              <div className="grid grid-cols-3 gap-2 text-center select-none">
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 space-y-0.5">
                  <Users className="h-4 w-4 mx-auto text-on-surface-variant" />
                  <p className="font-mono font-bold text-on-surface text-[11px] pt-1">{dept.studentCount}</p>
                  <p className="text-[8px] uppercase font-black text-on-surface-variant">Students</p>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 space-y-0.5">
                  <GraduationCap className="h-4 w-4 mx-auto text-on-surface-variant" />
                  <p className="font-mono font-bold text-on-surface text-[11px] pt-1">{dept.staffCount}</p>
                  <p className="text-[8px] uppercase font-black text-on-surface-variant">Faculty</p>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 space-y-0.5">
                  <Coins className="h-4 w-4 mx-auto text-on-surface-variant" />
                  <p className="font-mono font-bold text-on-surface text-[11px] pt-1 truncate">{dept.budget}</p>
                  <p className="text-[8px] uppercase font-black text-on-surface-variant">Budget</p>
                </div>
              </div>

              {/* Progress Risk Factor Bar */}
              <div className="space-y-1.5 select-none">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-black uppercase text-on-surface-variant">Branch Dropout Risk Density</span>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getRiskColor(dept.riskPercentage)}`}>
                    {dept.riskPercentage}% AVG
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.riskPercentage >= 25.0 ? 'bg-rose-500' : dept.riskPercentage >= 15.0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, dept.riskPercentage * 3)}%` }} // Scaled for visual prominence
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- CREATE BRANCH MODAL --- */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h4 className="font-sans text-sm font-black uppercase tracking-wider text-on-surface">Provision Branch Department</h4>
                </div>
                <Button onClick={() => setIsCreateOpen(false)} variant="ghost" className="h-7 w-7 p-0 rounded-full text-on-surface-variant hover:bg-surface-container">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleCreate} className="p-lg space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Department Title</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mechanical Engineering"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Code Tag</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="MECH"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase text-center focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">HOD Supervisor Name</label>
                  <input
                    type="text"
                    required
                    value={hod}
                    onChange={(e) => setHod(e.target.value)}
                    placeholder="Enter full name of HOD..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Budget Alloc.</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="$120,000"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Students</label>
                    <input
                      type="number"
                      value={studentsCount}
                      onChange={(e) => setStudentsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Faculty Staff</label>
                    <input
                      type="number"
                      value={staffCount}
                      onChange={(e) => setStaffCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Default Average Risk Coefficient (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button onClick={() => setIsCreateOpen(false)} variant="outline" size="sm" type="button" className="text-xs uppercase font-extrabold">
                    Cancel
                  </Button>
                  <Button loading={createDeptMutation.isPending} variant="primary" size="sm" type="submit" className="text-xs uppercase font-black">
                    Commit Branch
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT BRANCH MODAL --- */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-secondary" />
                  <h4 className="font-sans text-sm font-black uppercase tracking-wider text-on-surface">Modify Department Profiles</h4>
                </div>
                <Button onClick={() => setIsEditOpen(false)} variant="ghost" className="h-7 w-7 p-0 rounded-full text-on-surface-variant hover:bg-surface-container">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleUpdate} className="p-lg space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Department Title</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mechanical Engineering"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Code Tag</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="MECH"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-extrabold uppercase text-center focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">HOD Supervisor Name</label>
                  <input
                    type="text"
                    required
                    value={hod}
                    onChange={(e) => setHod(e.target.value)}
                    placeholder="Enter full name of HOD..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Budget Alloc.</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="$120,000"
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Students</label>
                    <input
                      type="number"
                      value={studentsCount}
                      onChange={(e) => setStudentsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant">Faculty Staff</label>
                    <input
                      type="number"
                      value={staffCount}
                      onChange={(e) => setStaffCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Default Average Risk Coefficient (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-semibold focus:outline-hidden focus:border-primary text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button onClick={() => setIsEditOpen(false)} variant="outline" size="sm" type="button" className="text-xs uppercase font-extrabold">
                    Cancel
                  </Button>
                  <Button loading={updateDeptMutation.isPending} variant="secondary" size="sm" type="submit" className="text-xs uppercase font-black">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE MODAL --- */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-sm shadow-xl p-lg space-y-4"
            >
              <div className="flex items-start gap-3 text-xs">
                <div className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-sans font-black uppercase tracking-wider text-on-surface">Deprovision Department?</h4>
                  <p className="font-sans font-semibold text-on-surface-variant leading-relaxed">
                    Are you sure you want to permanently delete the department: <strong>{activeDept?.name}</strong>? This decouples all assigned student cohort data files and removes assigned faculty logs.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => { setIsDeleteOpen(false); setActiveDept(null); }} variant="outline" size="sm" className="text-[11px] font-bold uppercase h-8">
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  loading={deleteDeptMutation.isPending}
                  variant="primary"
                  size="sm"
                  className="text-[11px] font-black uppercase bg-rose-600 hover:bg-rose-700 text-white border-rose-600 h-8"
                >
                  Delete Department
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
