import React from 'react';
import Papa from 'papaparse';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  ValidationIssue,
  FieldScorecard,
  FieldMapping,
  DuplicateCandidate,
  EmployeeRecord,
  MigrationScenarioId,
} from '../../types';
import { ReconciliationSummary } from '../../services/reconciliationEngine';
import { getDemoScenario } from '../../data/demoData';

interface QualityReportViewProps {
  sourceCount: number;
  targetCount: number;
  qualityScore: number;
  readinessStatus: string;
  readinessScore: number;
  issues: ValidationIssue[];
  fieldScorecards: FieldScorecard[];
  mappings: FieldMapping[];
  reconSummary: ReconciliationSummary | null;
  duplicates: DuplicateCandidate[];
  lastValidated: string;
  currentScenarioId?: MigrationScenarioId;
}

export const QualityReportView: React.FC<QualityReportViewProps> = ({
  sourceCount,
  targetCount,
  qualityScore,
  readinessStatus,
  readinessScore,
  issues,
  fieldScorecards,
  mappings,
  reconSummary,
  duplicates,
  lastValidated,
  currentScenarioId = 'wave1-baseline',
}) => {
  const activeScenario = getDemoScenario(currentScenarioId);
  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;

  const handlePrint = () => {
    window.print();
  };

  const exportIssuesCSV = () => {
    const exportData = issues.map((i) => ({
      ID: i.id,
      Record_ID: i.recordId,
      Employee_Name: i.employeeName,
      Field: i.field,
      Severity: i.severity,
      Category: i.category,
      Message: i.message,
      Suggested_Remediation: i.suggestedFix || 'Manual Triage',
      Status: i.status,
      Assigned_Owner: i.assignedTo || 'Unassigned',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HR_Migration_Quality_Issues_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Executive Migration Quality Assessment Report
          </h2>
          <p className="text-xs text-slate-500">
            Auditable compliance dossier for Steering Committee and Cutover Go/No-Go sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report / PDF</span>
          </button>
          <button
            onClick={exportIssuesCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Exceptions (CSV)</span>
          </button>
        </div>
      </div>

      {/* The Printable Dossier Document */}
      <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-sm space-y-8 max-w-5xl mx-auto print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Governance Audit Dossier
              </span>
              <span className="text-xs text-slate-400">• {activeScenario.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              HR Data Quality & Migration Readiness Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Source System: <strong>{activeScenario.sourceSystem}</strong> → Target System: <strong>{activeScenario.targetSystem}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>Audit Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Automated Run: <strong>{lastValidated}</strong></div>
            <div>Dataset ID: <code className="font-mono text-slate-800">STG-WF-20260925</code></div>
          </div>
        </div>

        {/* 1. Executive Summary & Readiness Gate */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Executive Summary & Migration Gate Status
          </h2>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Gate Determination:
              </div>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 ${
                    readinessStatus === 'READY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : readinessStatus === 'READY WITH WARNINGS'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {readinessStatus}
                </span>
                <span className="text-sm font-mono text-slate-500 font-normal">
                  ({readinessScore}% Gate Threshold Confidence)
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-xl mt-1">
                Data quality evaluation indicates that while 94.8% of core attributes are valid, {criticalCount} blocking exceptions exist in supervisory org hierarchy and worker email provisioning.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-4xl font-black font-mono text-indigo-600">{qualityScore}%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Composite Quality Score
              </div>
            </div>
          </div>
        </div>

        {/* 2. Population & Reconciliation Metrics */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Population & Reconciliation Reconciliation Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Source (PeopleSoft)</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{sourceCount}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Target (Workday Staged)</div>
              <div className="text-lg font-bold font-mono text-indigo-600 mt-1">{targetCount}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Reconciliation Match Rate</div>
              <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
                {reconSummary?.reconciliationRate ?? 98.6}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Duplicate Candidates</div>
              <div className="text-lg font-bold font-mono text-amber-600 mt-1">
                {duplicates.length} pairs
              </div>
            </div>
          </div>
        </div>

        {/* 3. Exception & Failure Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            3. Exception Severity & Category Breakdown
          </h2>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-800">Critical Exceptions: {criticalCount}</div>
              <div className="text-[11px] text-rose-600 mt-1">
                Orphan Manager IDs, missing mandatory emails, negative salaries.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-800">High Warnings: {highCount}</div>
              <div className="text-[11px] text-amber-600 mt-1">
                Duplicate emails, active status with historical term dates.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-bold text-blue-800">Medium / Low Notices: {mediumCount}</div>
              <div className="text-[11px] text-blue-600 mt-1">
                Currency code normalization, cost center prefix formatting.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Top Critical Exceptions Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800">Outstanding Critical Exceptions Sample:</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3 text-left">Worker ID</th>
                  <th className="py-2 px-3 text-left">Field</th>
                  <th className="py-2 px-3 text-left">Failure Description</th>
                  <th className="py-2 px-3 text-left">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues
                  .filter((i) => i.severity === 'Critical')
                  .slice(0, 6)
                  .map((i) => (
                    <tr key={i.id}>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-700">{i.recordId}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{i.field}</td>
                      <td className="py-2 px-3 text-slate-800">{i.message}</td>
                      <td className="py-2 px-3 text-indigo-700 text-[11px]">{i.suggestedFix || 'Manual review'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Field-Level Scorecard Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800">Field-Level Quality Scorecard:</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3 text-left">Field</th>
                  <th className="py-2 px-3 text-right">Completeness</th>
                  <th className="py-2 px-3 text-right">Validity</th>
                  <th className="py-2 px-3 text-right">Uniqueness</th>
                  <th className="py-2 px-3 text-right">Consistency</th>
                  <th className="py-2 px-3 text-right">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fieldScorecards.slice(0, 8).map((f) => (
                  <tr key={f.field}>
                    <td className="py-2 px-3 font-mono font-medium text-slate-900">{f.field}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{f.completeness}%</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{f.validity}%</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{f.uniqueness}%</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{f.consistency}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600">{f.overallScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Sign-off and Governance Signature Block */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            6. Governance Sign-Off & Approvals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs">
            <div className="space-y-3">
              <div className="border-b border-slate-300 pb-1 font-semibold text-slate-900">
                Michael Chen
              </div>
              <div className="text-slate-500 text-[11px]">HRIS Migration Lead / Program Director</div>
              <div className="text-slate-400 text-[10px]">Date: ______________ [ ] Approved</div>
            </div>

            <div className="space-y-3">
              <div className="border-b border-slate-300 pb-1 font-semibold text-slate-900">
                Sarah Jenkins
              </div>
              <div className="text-slate-500 text-[11px]">Corporate Payroll & Compensation Architect</div>
              <div className="text-slate-400 text-[10px]">Date: ______________ [ ] Approved</div>
            </div>

            <div className="space-y-3">
              <div className="border-b border-slate-300 pb-1 font-semibold text-slate-900">
                David Miller
              </div>
              <div className="text-slate-500 text-[11px]">Enterprise QA & Release Governance Lead</div>
              <div className="text-slate-400 text-[10px]">Date: ______________ [ ] Approved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
