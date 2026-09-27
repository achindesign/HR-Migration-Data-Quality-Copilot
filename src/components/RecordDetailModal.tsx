import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  AlertOctagon,
  Sparkles,
  Wrench,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { EmployeeRecord, ValidationIssue } from '../types';
import { explainIssueAI } from '../services/geminiService';

interface RecordDetailModalProps {
  record: EmployeeRecord | null;
  targetRecord?: EmployeeRecord | null;
  issues: ValidationIssue[];
  onClose: () => void;
  onApplyFix: (issueId: string, fixValue: any) => void;
  onOpenAuditLog: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  targetRecord,
  issues,
  onClose,
  onApplyFix,
  onOpenAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'comparison' | 'ai_analysis'>('issues');
  const [aiExplanation, setAiExplanation] = useState<{
    explanation: string;
    businessImpact: string;
    rootCause: string;
    recommendedAction: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (record && issues.length > 0) {
      setLoadingAi(true);
      explainIssueAI(issues[0], record)
        .then((res) => {
          setAiExplanation(res);
        })
        .finally(() => {
          setLoadingAi(false);
        });
    } else {
      setAiExplanation(null);
    }
  }, [record, issues]);

  if (!record) return null;

  const recordIssues = issues.filter((i) => i.recordId === record.Employee_ID);
  const criticalCount = recordIssues.filter((i) => i.severity === 'Critical').length;
  const highCount = recordIssues.filter((i) => i.severity === 'High').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {record.First_Name?.[0] || 'E'}
              {record.Last_Name?.[0] || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {record.First_Name} {record.Last_Name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  {record.Employee_ID}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    record.Employment_Status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {record.Employment_Status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {record.Job_Title} • {record.Department_Name} ({record.Department_ID})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Detected Issues ({recordIssues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Source vs Target Record</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_analysis')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ai_analysis'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Business Impact</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Exception Status:{' '}
                  <strong className="text-slate-800">
                    {criticalCount > 0 ? 'Action Required' : highCount > 0 ? 'Warning' : 'Clean'}
                  </strong>
                </span>
                <span className="text-slate-500">
                  Rule Violations: <strong className="text-slate-800">{recordIssues.length}</strong>
                </span>
              </div>

              {recordIssues.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No Validation Exceptions</p>
                  <p className="text-xs text-slate-500 mt-1">
                    This worker record successfully passes all schema, format, business, and referential rules.
                  </p>
                </div>
              ) : (
                recordIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              issue.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-700'
                                : issue.severity === 'High'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{issue.ruleName}</span>
                          <span className="text-[11px] font-mono text-slate-500">[{issue.field}]</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-1.5">{issue.message}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{issue.id}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 font-medium mr-2">Current Value:</span>
                        <code className="font-mono text-rose-600 font-semibold">
                          {issue.rawValue === undefined || issue.rawValue === ''
                            ? '(null / empty)'
                            : String(issue.rawValue)}
                        </code>
                      </div>
                      {issue.suggestedFix && (
                        <div className="text-[11px] text-slate-500">Auto-Remediation Available</div>
                      )}
                    </div>

                    {issue.suggestedFix && (
                      <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                          <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                          <span>AI Suggested Remediation</span>
                        </div>
                        <p className="text-slate-700 text-xs">{issue.suggestedFix}</p>

                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Updates record & logs entry in audit trail.
                          </span>
                          <button
                            onClick={() => onApplyFix(issue.id, issue.remediationValue)}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Apply Fix</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Comparing PeopleSoft Source extract with staged Workday Target object:
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 text-left w-36">Field</th>
                      <th className="py-2.5 px-3 text-left">PeopleSoft (Source)</th>
                      <th className="py-2.5 px-3 text-left">Workday (Target)</th>
                      <th className="py-2.5 px-3 text-center w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'Employee_ID', label: 'Employee ID' },
                      { key: 'First_Name', label: 'First Name' },
                      { key: 'Last_Name', label: 'Last Name' },
                      { key: 'Email', label: 'Email' },
                      { key: 'Department_Name', label: 'Department / Supervisory Org' },
                      { key: 'Job_Title', label: 'Job Title' },
                      { key: 'Manager_ID', label: 'Manager ID' },
                      { key: 'Employment_Status', label: 'Status' },
                      { key: 'Salary', label: 'Base Salary' },
                      { key: 'Currency', label: 'Currency' },
                      { key: 'Pay_Group', label: 'Pay Group' },
                      { key: 'Cost_Center', label: 'Cost Center' },
                    ].map((f) => {
                      const srcVal = record[f.key];
                      const tgtVal = targetRecord ? targetRecord[f.key] : undefined;
                      const isMatch = targetRecord ? srcVal === tgtVal : false;
                      const isExpectedDiff =
                        (f.key === 'Department_Name' && String(tgtVal).includes('(SO-')) ||
                        (f.key === 'Cost_Center' && String(tgtVal) === `WD-${srcVal}`) ||
                        (f.key === 'Job_Title' && srcVal === 'DevOps Lead' && tgtVal === 'Cloud Platform Lead');

                      return (
                        <tr key={f.key} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-medium text-slate-700">{f.label}</td>
                          <td className="py-2 px-3 font-mono text-slate-900">
                            {srcVal !== undefined && srcVal !== null ? String(srcVal) : <span className="text-slate-400 italic">null</span>}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-900">
                            {tgtVal !== undefined && tgtVal !== null ? (
                              String(tgtVal)
                            ) : (
                              <span className="text-rose-500 italic font-semibold">Missing in target</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isMatch ? (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Exact
                              </span>
                            ) : isExpectedDiff ? (
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                Transformed
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Diff
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ai_analysis' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Migration Copilot Plain-Language Assessment</span>
                </div>

                {loadingAi ? (
                  <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                    Evaluating Workday staging risk and business fallout...
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Executive Summary:</h4>
                      <p className="text-slate-600 leading-relaxed">{aiExplanation.explanation}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
                      <h4 className="font-semibold text-rose-900 mb-0.5">Workday Operational Impact:</h4>
                      <p className="text-rose-700">{aiExplanation.businessImpact}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-0.5">Identified Root Cause:</h4>
                      <p className="text-slate-600">{aiExplanation.rootCause}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <h4 className="font-semibold text-emerald-900 mb-0.5">Recommended Migration Lead Action:</h4>
                      <p className="text-emerald-800">{aiExplanation.recommendedAction}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No active critical issues detected for this record.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
          <button
            onClick={onOpenAuditLog}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View Full Audit History</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
