import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Building,
  Target,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import {
  ValidationIssue,
  RiskRadarMetric,
  FieldScorecard,
  EmployeeRecord,
  MigrationScenarioId,
  AuditLogItem,
} from '../../types';
import { ReconciliationSummary } from '../../services/reconciliationEngine';
import { NavigationTab } from '../Sidebar';
import { DEMO_SCENARIOS, getDemoScenario } from '../../data/demoData';
import { QualityTrendChart } from '../QualityTrendChart';

interface DashboardViewProps {
  qualityScore: number;
  readinessStatus: 'READY' | 'READY WITH WARNINGS' | 'NOT READY';
  readinessScore: number;
  sourceCount: number;
  targetCount: number;
  reconSummary: ReconciliationSummary | null;
  issues: ValidationIssue[];
  radarMetrics: RiskRadarMetric[];
  fieldScorecards: FieldScorecard[];
  duplicateCount: number;
  onSelectTab: (tab: NavigationTab) => void;
  onSelectRecord: (record: EmployeeRecord) => void;
  sourceRecords: EmployeeRecord[];
  currentScenarioId?: MigrationScenarioId;
  onSelectScenario?: (id: MigrationScenarioId) => void;
  auditLogs?: AuditLogItem[];
  onOpenAuditLog?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  qualityScore,
  readinessStatus,
  readinessScore,
  sourceCount,
  targetCount,
  reconSummary,
  issues,
  radarMetrics,
  fieldScorecards,
  duplicateCount,
  onSelectTab,
  onSelectRecord,
  sourceRecords,
  currentScenarioId = 'wave1-baseline',
  onSelectScenario,
  auditLogs = [],
  onOpenAuditLog,
}) => {
  const activeScenario = getDemoScenario(currentScenarioId);
  const criticalIssues = issues.filter((i) => i.severity === 'Critical');
  const highIssues = issues.filter((i) => i.severity === 'High');
  const mediumIssues = issues.filter((i) => i.severity === 'Medium');
  const lowIssues = issues.filter((i) => i.severity === 'Low');
  const autoFixCount = issues.filter((i) => i.canAutoFix).length;

  const categoryBreakdown: Record<string, number> = {};
  for (const i of issues) {
    categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1;
  }

  // Department risk profile
  const deptRiskMap: Record<string, { total: number; issues: number }> = {};
  for (const r of sourceRecords) {
    const dept = r.Department_Name || 'Unassigned';
    if (!deptRiskMap[dept]) deptRiskMap[dept] = { total: 0, issues: 0 };
    deptRiskMap[dept].total++;
  }
  for (const i of issues) {
    const r = sourceRecords.find((rec) => rec.Employee_ID === i.recordId);
    if (r) {
      const dept = r.Department_Name || 'Unassigned';
      if (deptRiskMap[dept]) deptRiskMap[dept].issues++;
    }
  }

  const deptList = Object.entries(deptRiskMap).map(([name, data]) => {
    const rate = data.total > 0 ? Math.round((data.issues / data.total) * 100) : 0;
    return { name, total: data.total, issues: data.issues, errorRate: rate };
  }).sort((a, b) => b.issues - a.issues);

  return (
    <div className="space-y-6">
      {/* Scenario Quick Switcher Bar */}
      {onSelectScenario && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">Migration Scenario:</span>
            <span className="text-xs text-slate-500 hidden sm:inline">Compare cutover readiness cases</span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
            {DEMO_SCENARIOS.map((sc) => {
              const isSelected = sc.id === currentScenarioId;
              const readinessDot =
                sc.expectedReadiness === 'READY'
                  ? 'bg-emerald-500'
                  : sc.expectedReadiness === 'READY WITH WARNINGS'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={`${sc.name}: Expected ${sc.expectedReadiness} (~${sc.expectedQualityScore})`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${readinessDot} shrink-0`} />
                  <span>{sc.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Migration Executive Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Executive Cutover Gate
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-300 text-xs font-medium">{activeScenario.name}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              Migration Readiness:
              <span
                className={`px-3 py-1 rounded-lg text-sm font-bold tracking-normal inline-flex items-center gap-1.5 ${
                  readinessStatus === 'READY'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : readinessStatus === 'READY WITH WARNINGS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {readinessStatus === 'READY' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                {readinessStatus}
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeScenario.description}
            </p>
          </div>

          {/* Quick Score Circle & Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-center min-w-[90px]">
              <div className="text-4xl font-black text-indigo-400 font-mono tracking-tight">
                {qualityScore}%
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Quality Index
              </div>
            </div>

            {/* Mini Trend Sparkline in banner */}
            <div className="hidden xl:flex flex-col items-center w-28 px-2 border-l border-white/10">
              <div className="text-[10px] text-slate-400 font-medium mb-1">Score Trajectory</div>
              <div className="w-28 h-8">
                <QualityTrendChart
                  auditLogs={auditLogs}
                  currentQualityScore={qualityScore}
                  readinessStatus={readinessStatus}
                  compact={true}
                />
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />
            <div className="space-y-1.5 w-full sm:w-auto">
              <div className="text-xs text-slate-300">
                Gate Confidence: <strong>{readinessScore}%</strong>
              </div>
              <button
                onClick={() => onSelectTab('exceptions')}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-xs"
              >
                <span>Fix Exceptions ({criticalIssues.length + highIssues.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Quality Score Progression (Audit Trail Trend Line) */}
      <QualityTrendChart
        auditLogs={auditLogs}
        currentQualityScore={qualityScore}
        readinessStatus={readinessStatus}
        onOpenAuditLog={onOpenAuditLog}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Source Records</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{sourceCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">PeopleSoft Master</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Target Records</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">{targetCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Workday Staged</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Critical Issues</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">{criticalIssues.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Halt Migration Gate</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>High Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{highIssues.length}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Review Required</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Unmatched Records</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {reconSummary ? reconSummary.missingInTargetCount + reconSummary.extraInTargetCount : 7}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Variance Discrepancies</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Auto-Remediate</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{autoFixCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Fix Candidates</div>
        </div>
      </div>

      {/* Main Grid: AI Migration Risk Radar & Issue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Radar / Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Migration Risk Radar</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Weighted Risk Dimensions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-factor risk assessment combining completeness, referential integrity, and business logic.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('gate_settings')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Configure Gates
            </button>
          </div>

          {/* Radar Metric Bars with Drill-down */}
          <div className="space-y-4 pt-1">
            {radarMetrics.map((m) => {
              const barColor =
                m.score >= 90
                  ? 'bg-emerald-500'
                  : m.score >= 80
                  ? 'bg-indigo-500'
                  : m.score >= 70
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              const badgeColor =
                m.riskLabel === 'Low'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : m.riskLabel === 'Moderate'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : m.riskLabel === 'High'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <div
                  key={m.key}
                  onClick={() => onSelectTab('exceptions')}
                  className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition">
                        {m.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${badgeColor}`}>
                        {m.riskLabel} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-[11px]">
                        {m.affectedCount} impacted records
                      </span>
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {m.score}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1.5">{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & Category Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Severity Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Issue Severity Breakdown</h3>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => onSelectTab('exceptions')}
                className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 cursor-pointer hover:bg-rose-50 transition"
              >
                <div className="text-[11px] font-semibold text-rose-700">Critical Severity</div>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  {criticalIssues.length}
                </div>
                <div className="text-[10px] text-rose-500 mt-0.5">Blocking Workday cutover</div>
              </div>

              <div
                onClick={() => onSelectTab('exceptions')}
                className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-50 transition"
              >
                <div className="text-[11px] font-semibold text-amber-700">High Severity</div>
                <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                  {highIssues.length}
                </div>
                <div className="text-[10px] text-amber-500 mt-0.5">Supervisory & Pay hazards</div>
              </div>

              <div
                onClick={() => onSelectTab('exceptions')}
                className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 cursor-pointer hover:bg-blue-50 transition"
              >
                <div className="text-[11px] font-semibold text-blue-700">Medium Severity</div>
                <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                  {mediumIssues.length}
                </div>
                <div className="text-[10px] text-blue-500 mt-0.5">Formatting & Minor lookup</div>
              </div>

              <div
                onClick={() => onSelectTab('exceptions')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="text-[11px] font-semibold text-slate-600">Low Severity</div>
                <div className="text-2xl font-bold font-mono text-slate-700 mt-1">
                  {lowIssues.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Taxonomy & cosmetic notes</div>
              </div>
            </div>

            {/* Category Stack */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">Category Distribution:</div>
              <div className="space-y-1.5">
                {Object.entries(categoryBreakdown).map(([cat, cnt]) => {
                  const pct = Math.round((cnt / issues.length) * 100) || 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{cat}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-slate-800 font-semibold w-8 text-right">{cnt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reconciliation Snapshot */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reconciliation Match Rate</h3>
              <span className="text-xs font-bold text-indigo-600">
                {reconSummary?.reconciliationRate ?? 98.6}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600">Approved Transformations: </span>
                <strong className="text-indigo-700">{reconSummary?.expectedTransformationCount ?? 28}</strong>
              </div>
              <div>
                <span className="text-slate-600">Unresolved Mismatches: </span>
                <strong className="text-rose-600">{reconSummary?.mismatchCount ?? 2}</strong>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('reconciliation')}
              className="w-full py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition"
            >
              View Full Source vs Target Diff Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Department Quality Table & Top Critical Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* High Risk Departments */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Department Quality Risk</h3>
            <span className="text-xs text-slate-500">Sorted by exception frequency</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {deptList.slice(0, 6).map((d) => (
              <div key={d.name} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{d.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {d.total} workers in legacy scope
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      d.issues > 10
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : d.issues > 5
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {d.issues} exceptions
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.errorRate}% error rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Critical Staging Exceptions */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Top Priority Exceptions</h3>
            <button
              onClick={() => onSelectTab('exceptions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all ({issues.length})
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {criticalIssues.slice(0, 5).map((issue) => {
              const rec = sourceRecords.find((r) => r.Employee_ID === issue.recordId);
              return (
                <div
                  key={issue.id}
                  onClick={() => rec && onSelectRecord(rec)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{issue.recordId}</span>
                      <span className="text-slate-600 font-medium">{issue.employeeName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{issue.message}</p>
                  {issue.suggestedFix && (
                    <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <span>{issue.suggestedFix}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
