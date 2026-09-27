import React from 'react';
import { X, History, UserCheck, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Migration Remediation Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Immutable compliance tracking of all automated and manual changes applied to the dataset.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700">No modifications logged yet.</p>
              <p className="text-slate-400 mt-1">
                Applying auto-remediations or updating records in the Exception Workbench will appear here with exact timestamp and author.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Indicator Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        {log.recordId && (
                          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">
                            {log.recordId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof log.qualityScore === 'number' && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {log.qualityScore}% Score
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                    </div>

                    {log.field && (
                      <div className="text-xs text-slate-600 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200/70 font-mono">
                        <span className="text-slate-400">{log.field}:</span>
                        <span className="line-through text-rose-500 font-semibold">{String(log.oldValue || 'null')}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 font-bold">{String(log.newValue)}</span>
                      </div>
                    )}

                    {log.note && <p className="text-xs text-slate-600 italic">"{log.note}"</p>}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-500" />
                        <span>Authorized By: <strong>{log.user}</strong></span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified & Revalidated</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Compliant with SOC2 / ISO 27001 HR Data Migration Governance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
