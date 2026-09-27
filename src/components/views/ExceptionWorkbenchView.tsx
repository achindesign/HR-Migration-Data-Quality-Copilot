import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  User,
  MessageSquare,
  Wrench,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ValidationIssue, IssueSeverity, IssueStatus, EmployeeRecord } from '../../types';

interface ExceptionWorkbenchViewProps {
  issues: ValidationIssue[];
  sourceRecords: EmployeeRecord[];
  onUpdateIssue: (updated: ValidationIssue) => void;
  onApplyFix: (issueId: string, fixValue: any) => void;
  onSelectRecord: (record: EmployeeRecord) => void;
}

export const ExceptionWorkbenchView: React.FC<ExceptionWorkbenchViewProps> = ({
  issues,
  sourceRecords,
  onUpdateIssue,
  onApplyFix,
  onSelectRecord,
}) => {
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(issues[0] || null);
  const [newComment, setNewComment] = useState('');

  const filteredIssues = issues.filter((i) => {
    const matchesSev = severityFilter === 'ALL' || i.severity === severityFilter;
    const matchesStat = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesSearch =
      i.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.employeeName && i.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      i.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesStat && matchesSearch;
  });

  const handleStatusChange = (issue: ValidationIssue, newStatus: IssueStatus) => {
    const updated: ValidationIssue = { ...issue, status: newStatus };
    onUpdateIssue(updated);
    if (selectedIssue?.id === issue.id) setSelectedIssue(updated);
  };

  const handleSeverityChange = (issue: ValidationIssue, newSev: IssueSeverity) => {
    const updated: ValidationIssue = { ...issue, severity: newSev };
    onUpdateIssue(updated);
    if (selectedIssue?.id === issue.id) setSelectedIssue(updated);
  };

  const handleAssignOwner = (issue: ValidationIssue, owner: string) => {
    const updated: ValidationIssue = { ...issue, assignedTo: owner };
    onUpdateIssue(updated);
    if (selectedIssue?.id === issue.id) setSelectedIssue(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !newComment.trim()) return;

    const comments = selectedIssue.comments || [];
    const updatedComments = [
      ...comments,
      {
        user: 'Migration Lead (Current User)',
        text: newComment.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    const updated: ValidationIssue = { ...selectedIssue, comments: updatedComments };
    onUpdateIssue(updated);
    setSelectedIssue(updated);
    setNewComment('');
  };

  const selectedRecord = selectedIssue
    ? sourceRecords.find((r) => r.Employee_ID === selectedIssue.recordId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Migration Exception Workbench</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational queue for triage, ownership assignment, risk acceptance, and audit sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exceptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Severity:</span>
          {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Status:</span>
          {(['ALL', 'OPEN', 'UNDER REVIEW', 'REMEDIATION REQUIRED', 'ACCEPTED', 'RESOLVED'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Exception Queue (7 cols) + Resolution Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issues Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Active Exception Queue ({filteredIssues.length})
            </h3>
            <span className="text-xs text-slate-500">Sorted by Severity</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssue?.id === issue.id;
              const sevBadge =
                issue.severity === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : issue.severity === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800';

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${sevBadge}`}>
                        {issue.severity}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900">{issue.recordId}</span>
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[160px]">
                        {issue.employeeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {issue.status}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{issue.id}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">{issue.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                    <span className="font-mono">Field: <strong>{issue.field}</strong></span>
                    {issue.assignedTo && <span>Owner: <strong>{issue.assignedTo}</strong></span>}
                    {issue.canAutoFix && (
                      <span className="text-indigo-600 font-medium flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Auto-Fix Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Exception Action Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          {selectedIssue ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Exception Detail
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedIssue.recordId} — {selectedIssue.employeeName}
                  </h4>
                </div>
                {selectedRecord && (
                  <button
                    onClick={() => onSelectRecord(selectedRecord)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>Full Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status and Owner Controls */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] mb-1">Queue Status</label>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleStatusChange(selectedIssue, e.target.value as IssueStatus)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="UNDER REVIEW">UNDER REVIEW</option>
                    <option value="REMEDIATION REQUIRED">REMEDIATION REQUIRED</option>
                    <option value="ACCEPTED">ACCEPTED (Risk Signed-off)</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] mb-1">Assigned Owner</label>
                  <select
                    value={selectedIssue.assignedTo || 'Unassigned'}
                    onChange={(e) => handleAssignOwner(selectedIssue, e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="HRIS Cutover Lead">HRIS Cutover Lead</option>
                    <option value="Payroll Operations">Payroll Operations</option>
                    <option value="Data Architect">Data Architect</option>
                    <option value="QA Lead">QA Lead</option>
                    <option value="Business Analyst">Business Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] mb-1">Severity Rating</label>
                  <select
                    value={selectedIssue.severity}
                    onChange={(e) => handleSeverityChange(selectedIssue, e.target.value as IssueSeverity)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => handleStatusChange(selectedIssue, 'ACCEPTED')}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    Accept Business Risk
                  </button>
                </div>
              </div>

              {/* Remediation Action Card */}
              {selectedIssue.suggestedFix && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>Suggested Remediation</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{selectedIssue.suggestedFix}</p>
                  <button
                    onClick={() => onApplyFix(selectedIssue.id, selectedIssue.remediationValue)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Apply Fix to Staging Master</span>
                  </button>
                </div>
              )}

              {/* Discussion & Audit Comments */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Exception Audit Notes
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedIssue.comments || []).map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span>{c.user}</span>
                        <span className="text-slate-400 font-mono">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-600">{c.text}</p>
                    </div>
                  ))}
                  {(!selectedIssue.comments || selectedIssue.comments.length === 0) && (
                    <div className="text-slate-400 italic text-[11px]">No notes added yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add operational review note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select an exception to inspect resolution workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
