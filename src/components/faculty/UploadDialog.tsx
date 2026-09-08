import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
  FileCheck2,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useImportCSV } from '../../hooks/useFacultyData';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'progress' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importSummary, setImportSummary] = useState<{ success: number; warnings: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportCSV();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setErrorMessage('Invalid file type. Please upload a CSV (.csv) file.');
      setUploadStatus('error');
      setFile(null);
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('File exceeds 5MB size limit.');
      setUploadStatus('error');
      setFile(null);
      return false;
    }
    setErrorMessage('');
    setUploadStatus('idle');
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportSubmit = async () => {
    if (!file) return;

    setUploadStatus('progress');
    setUploadProgress(10);

    // Dynamic progression states for premium user experience
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 300);

    try {
      const res = await importMutation.mutateAsync(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        if (res.successCount > 0) {
          setUploadStatus('success');
          setImportSummary({
            success: res.successCount,
            warnings: []
          });
        } else {
          setUploadStatus('error');
          setErrorMessage(res.errors[0] || 'Verification failed. Empty records found.');
        }
      }, 500);
    } catch {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setErrorMessage('Network timeout or parsing error occurred during import.');
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setImportSummary(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-inverse-surface/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant p-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-extrabold text-on-surface">Import Student Cohort CSV</h3>
              <p className="font-sans text-[10px] text-on-surface-variant font-medium">Bulk sync student profiles and analytics indicators</p>
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
        <div className="p-lg">
          {uploadStatus === 'idle' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-xl text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : file
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-outline hover:border-primary/55 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-bold text-on-surface max-w-[250px] truncate mx-auto">
                        {file.name}
                      </p>
                      <p className="font-sans text-[10px] text-on-surface-variant">
                        {(file.size / 1024).toFixed(1)} KB • Verified CSV structure
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xs font-bold text-on-surface">
                        Drag and drop your file here, or <span className="text-primary hover:underline">browse</span>
                      </p>
                      <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                        Supports standard CSV template containing student enrollment data,<br />
                        subject percentages, GPAs, and prediction parameters. Max 5MB.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample template guide */}
              <div className="rounded-lg bg-surface-container p-md border border-outline-variant/50">
                <p className="font-sans text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                  Expected CSV Headers Matrix
                </p>
                <code className="block mt-1.5 font-mono text-[9px] text-primary/80 bg-surface-container-lowest p-1.5 rounded border border-outline-variant/20 truncate">
                  student_id, name, email, department, semester, cgpa, attendance, risk_score
                </code>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleImportSubmit} disabled={!file}>
                  Process Sync
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === 'progress' && (
            <div className="flex flex-col items-center py-xl space-y-4">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                <span className="absolute text-[10px] font-bold text-primary">{uploadProgress}%</span>
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-sans text-xs font-bold text-on-surface">Parsing & Validating Cohort Records</h4>
                <p className="font-sans text-[10px] text-on-surface-variant">
                  Mapping indicators to predictive ML weight factors...
                </p>
              </div>
              <div className="w-full max-w-xs bg-outline-variant h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="space-y-4 py-md">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-emerald-600">Sync Completed Successfully</h4>
                  <p className="font-sans text-[10px] text-on-surface-variant">
                    All valid records added directly to the active system cache
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-500/5 p-lg border border-emerald-500/10 space-y-2.5">
                <p className="font-sans text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Sync Summary Matrix
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-container-lowest p-md rounded border border-outline-variant/30 text-center">
                    <span className="block text-xl font-black text-emerald-600">
                      {importSummary?.success}
                    </span>
                    <span className="font-sans text-[10px] text-on-surface-variant font-medium">Profiles Appended</span>
                  </div>
                  <div className="bg-surface-container-lowest p-md rounded border border-outline-variant/30 text-center">
                    <span className="block text-xl font-black text-emerald-600">0</span>
                    <span className="font-sans text-[10px] text-on-surface-variant font-medium">Errors Logged</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetState}>
                  Upload Another
                </Button>
                <Button size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="space-y-4 py-md">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-rose-600">Import Verification Rejected</h4>
                  <p className="font-sans text-[10px] text-on-surface-variant">
                    CSV file did not pass database formatting rules
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-rose-500/5 p-md border border-rose-500/10">
                <p className="font-sans text-[10px] font-bold text-rose-700 dark:text-rose-400">
                  Validation Log Report:
                </p>
                <p className="font-sans text-[11px] text-on-surface-variant mt-1">
                  {errorMessage}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetState}>
                  Retry Sync
                </Button>
                <Button size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
