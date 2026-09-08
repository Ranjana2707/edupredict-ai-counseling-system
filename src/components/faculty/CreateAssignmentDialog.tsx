import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, FileSpreadsheet, Save, GraduationCap, Calendar, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateAssignment } from '../../hooks/useFacultyData';

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssignmentDialog({ isOpen, onClose }: CreateAssignmentDialogProps) {
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS-301');
  const [dueDate, setDueDate] = useState('');

  const createMutation = useCreateAssignment();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const subjectsNameMap: Record<string, string> = {
      'CS-301': 'Advanced Algorithms',
      'CS-304': 'Distributed Systems'
    };

    await createMutation.mutateAsync({
      title,
      subjectCode,
      subjectName: subjectsNameMap[subjectCode] || 'Academic Course',
      dueDate,
      status: 'active'
    });

    // Reset and close
    setTitle('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant p-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-extrabold text-on-surface">Publish New Assignment</h3>
              <p className="font-sans text-[10px] text-on-surface-variant font-medium">Broadcast academic homework indicators to enrolled cohort</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-lg space-y-4">
          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Assignment Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Paxos Consensus Design"
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Subject Course</label>
              <select
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full text-xs h-9 bg-surface-container-lowest border border-outline rounded p-2 text-on-surface focus:outline-primary"
              >
                <option value="CS-301">CS-301: Advanced Algorithms</option>
                <option value="CS-304">CS-304: Distributed Systems</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="rounded-lg bg-surface-container p-md border border-outline-variant/40 space-y-1">
            <p className="font-sans text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Cohort Integration
            </p>
            <p className="font-sans text-[10px] text-on-surface-variant leading-normal">
              Publishing this assignment automatically lists it on the students dashboard and triggers submission tracking analytics.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending} className="flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {createMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
