import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  Download,
  Terminal,
  Clock,
  RefreshCw,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useSystemLogs } from '../../hooks/useAdminData';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

export function SystemLogs() {
  const { data: logs = [], isLoading, refetch } = useSystemLogs();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Filters logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [logs, searchTerm, typeFilter, severityFilter]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;

  const handleClearLogs = () => {
    adminService.clearLogs();
    refetch();
    toast.success('Central logging container cleared successfully.');
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `system_audit_logs_${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Audit log JSON package compiled and downloaded.');
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-rose-500/10 text-rose-600 border-rose-500/15';
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/15';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/15';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-black text-on-surface uppercase tracking-wider">Security and Inference Audit trails</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1 font-sans">Monitor core middleware connections, login attempts, and FastAPI prediction events.</p>
        </div>

        <div className="flex items-center gap-2 select-none">
          <Button
            onClick={handleExportLogs}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 h-9"
          >
            <Download className="h-4 w-4" /> Export Logs
          </Button>

          <Button
            onClick={handleClearLogs}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 h-9 text-rose-500 border-rose-500/20 hover:bg-rose-500/5 hover:border-rose-500/40"
          >
            <Trash2 className="h-4 w-4" /> Purge Container
          </Button>
        </div>
      </div>

      <Card className="border-outline-variant/60">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container/10 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <input
              type="text"
              placeholder="Filter by message text, admin email, or payload reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-hidden focus:border-primary placeholder:text-outline-variant"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Log Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface-container-low border border-outline-variant text-on-surface font-extrabold uppercase py-1.5 px-3 rounded-lg focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
            >
              <option value="all">ALL EVENT TYPES</option>
              <option value="login">LOGIN TRAFFIC</option>
              <option value="user_mgmt">USER DIRECTORY CRUD</option>
              <option value="dept_mgmt">BRANCH MODIFICATIONS</option>
              <option value="rbac">ACCESS MATRIX SETS</option>
              <option value="settings">SYSTEM RE-SETTINGS</option>
              <option value="prediction">FASTAPI INFERENCES</option>
              <option value="notification">ALERT BROADCASTS</option>
            </select>

            {/* Severity selector */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface-container-low border border-outline-variant text-on-surface font-extrabold uppercase py-1.5 px-3 rounded-lg focus:outline-hidden focus:border-primary text-[10px] tracking-wider"
            >
              <option value="all">ALL SEVERITIES</option>
              <option value="info">INFO OVERVIEWS</option>
              <option value="warning">WARNING HAZARDS</option>
              <option value="critical">CRITICAL OVERRIDES</option>
            </select>

            <Button
              onClick={() => {
                refetch();
                toast.success('Audit log timeline synced with server state.');
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Sync with Server"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Interactive Log Table */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low/40 border-b border-outline-variant/40 select-none">
                <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant">Timestamp</th>
                <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant">Category</th>
                <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant">User Context</th>
                <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant">Severity</th>
                <th className="p-4 text-[10px] font-black uppercase text-on-surface-variant">Log Message Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-semibold text-on-surface-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center animate-pulse">
                    Connecting central database container logs...
                  </td>
                </tr>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container/10 transition leading-normal">
                    <td className="p-4 font-mono text-[10px] text-outline font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-surface-container text-on-surface text-[10px] font-black uppercase px-2 py-0.5 rounded border border-outline-variant/30">
                        {log.type}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap text-on-surface font-black">
                      {log.user}
                    </td>

                    <td className="p-4 whitespace-nowrap select-none">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityStyle(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 max-w-[500px]">
                        <p className="text-[11px] font-semibold text-on-surface leading-relaxed">
                          {log.message}
                        </p>
                        {log.details && (
                          <pre className="font-mono text-[9px] bg-surface-container-low text-on-surface-variant/90 p-2 rounded border border-outline-variant/30 overflow-x-auto leading-relaxed">
                            {log.details}
                          </pre>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-on-surface-variant/60">
                    <Terminal className="h-10 w-10 mx-auto text-on-surface-variant/30" />
                    <h4 className="font-sans text-xs font-bold text-on-surface mt-3">No logs found</h4>
                    <p className="text-[11px] text-on-surface-variant mt-1">Refine your active filters or invoke actions to trigger logging.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between select-none bg-surface-container/10">
            <span className="text-[10px] text-on-surface-variant font-extrabold uppercase">
              Page {currentPage} of {totalPages} ({filteredLogs.length} matching indices)
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
  );
}
