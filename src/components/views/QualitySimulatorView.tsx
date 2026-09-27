import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ValidationIssue } from '../../types';

interface QualitySimulatorViewProps {
  issues: ValidationIssue[];
  currentScore: number;
  onApplyAllRemediations: () => void;
  appliedFixesCount: number;
}

export const QualitySimulatorView: React.FC<QualitySimulatorViewProps> = ({
  issues,
  currentScore,
  onApplyAllRemediations,
  appliedFixesCount,
}) => {
  const autoFixCandidates = issues.filter((i) => i.canAutoFix);

  // Simulation toggles
  const [selectedFixIds, setSelectedFixIds] = useState<Set<string>>(
    new Set(autoFixCandidates.map((i) => i.id))
  );

  const toggleFix = (id: string) => {
    const updated = new Set(selectedFixIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedFixIds(updated);
  };

  const toggleAll = (select: boolean) => {
    if (select) {
      setSelectedFixIds(new Set(autoFixCandidates.map((i) => i.id)));
    } else {
      setSelectedFixIds(new Set());
    }
  };

  // Calculate simulated metrics
  const activeFixesCount = selectedFixIds.size;
  const simulatedScore = Math.min(
    99.2,
    Math.round((currentScore + (activeFixesCount / Math.max(1, autoFixCandidates.length)) * 14.5) * 10) / 10
  );

  // Specific simulation dimensions
  const beforeCompleteness = 91.2;
  const afterCompleteness = Math.min(99.6, Math.round((beforeCompleteness + activeFixesCount * 0.4) * 10) / 10);

  const beforeValidity = 86.8;
  const afterValidity = Math.min(98.4, Math.round((beforeValidity + activeFixesCount * 0.5) * 10) / 10);

  const beforeDuplicateRate = 2.8;
  const afterDuplicateRate = Math.max(0.4, Math.round((beforeDuplicateRate - activeFixesCount * 0.1) * 10) / 10);

  const beforeReconciliation = 95.2;
  const afterReconciliation = Math.min(99.8, Math.round((beforeReconciliation + activeFixesCount * 0.2) * 10) / 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quality Improvement Simulator
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate the projected governance uplift across data dimensions before committing changes to the staging database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onApplyAllRemediations()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Apply All {autoFixCandidates.length} Approved Remediations</span>
          </button>
        </div>
      </div>

      {/* Simulator Warning Callout */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulation Mode Active:</strong> Toggling checkboxes below projects outcomes in real-time. Click "Apply All Approved Remediations" to execute and commit to master dataset with audit trail.
          </span>
        </div>
        <div className="text-[11px] font-mono text-amber-700">
          {activeFixesCount} of {autoFixCandidates.length} Selected
        </div>
      </div>

      {/* Before vs After Visual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-semibold text-slate-500">Overall Quality Index</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-400">{currentScore}%</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-3xl font-black font-mono text-emerald-600">{simulatedScore}%</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-center">
            +{Math.round((simulatedScore - currentScore) * 10) / 10}% Projected Uplift
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-semibold text-slate-500">Data Completeness</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-400">{beforeCompleteness}%</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-3xl font-black font-mono text-indigo-600">{afterCompleteness}%</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-center">
            +{Math.round((afterCompleteness - beforeCompleteness) * 10) / 10}% Resolved Blanks
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-semibold text-slate-500">Data Validity & Syntax</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-400">{beforeValidity}%</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-3xl font-black font-mono text-indigo-600">{afterValidity}%</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-center">
            +{Math.round((afterValidity - beforeValidity) * 10) / 10}% Syntax Sanitized
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-semibold text-slate-500">Reconciliation Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-400">{beforeReconciliation}%</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-3xl font-black font-mono text-emerald-600">{afterReconciliation}%</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-center">
            +{Math.round((afterReconciliation - beforeReconciliation) * 10) / 10}% Near-Zero Variance
          </div>
        </div>
      </div>

      {/* Selectable Remediation Candidates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Auto-Remediation Candidate Proposals ({autoFixCandidates.length})
            </h3>
            <span className="text-xs text-slate-400">• Select to simulate projected impact</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {autoFixCandidates.map((issue) => {
            const isChecked = selectedFixIds.has(issue.id);
            return (
              <div
                key={issue.id}
                onClick={() => toggleFix(issue.id)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                  isChecked ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by parent div
                    className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{issue.recordId}</span>
                      <span className="text-xs font-semibold text-slate-700">{issue.employeeName}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{issue.field}]</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          issue.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{issue.message}</p>
                    <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Proposed: {issue.suggestedFix}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {issue.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
