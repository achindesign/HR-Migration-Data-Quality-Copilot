import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { MigrationGateSettings } from '../../types';
import { DEFAULT_GATE_SETTINGS } from '../../services/riskEngine';

interface GateSettingsViewProps {
  settings: MigrationGateSettings;
  onUpdateSettings: (newSettings: MigrationGateSettings) => void;
  gateEvaluations: {
    rule: string;
    target: string;
    actual: string;
    passed: boolean;
  }[];
  readinessStatus: string;
  readinessScore: number;
}

export const GateSettingsView: React.FC<GateSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  gateEvaluations,
  readinessStatus,
  readinessScore,
}) => {
  const [form, setForm] = useState<MigrationGateSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_GATE_SETTINGS });
    onUpdateSettings({ ...DEFAULT_GATE_SETTINGS });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Migration Gate Threshold Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise Go/No-Go cutover criteria. The system calculates readiness dynamically against these thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Standard Defaults</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Gate thresholds updated and evaluated against active dataset!</span>
        </div>
      )}

      {/* Main Grid: Threshold Form (6 cols) + Evaluation Scorecard (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Custom Cutover Gate Parameters</h3>
            <span className="text-xs text-indigo-600 font-semibold">Live Recalculation</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Allowed Critical Severity Issues (Hard Cutover Blocker)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.maxCriticalIssues}
                onChange={(e) => setForm({ ...form, maxCriticalIssues: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Standard governance requires 0 critical issues for a clean 'READY' gate.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Allowed High Severity Issues
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.maxHighIssues}
                onChange={(e) => setForm({ ...form, maxHighIssues: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Overall Completeness Threshold (%)
              </label>
              <input
                type="number"
                step="0.5"
                min={50}
                max={100}
                value={form.minCompleteness}
                onChange={(e) => setForm({ ...form, minCompleteness: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Overall Validity Threshold (%)
              </label>
              <input
                type="number"
                step="0.5"
                min={50}
                max={100}
                value={form.minValidity}
                onChange={(e) => setForm({ ...form, minValidity: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Reconciliation Parity Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                min={70}
                max={100}
                value={form.minReconciliationRate}
                onChange={(e) =>
                  setForm({ ...form, minReconciliationRate: Number(e.target.value) })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum Duplicate Candidate Ratio (%)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={20}
                value={form.maxDuplicateRate}
                onChange={(e) => setForm({ ...form, maxDuplicateRate: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              Save & Re-evaluate Gate
            </button>
          </div>
        </form>

        {/* Current Evaluation Scorecard */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Outcome
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Calculated Readiness: {readinessStatus}
              </h3>
            </div>
            <span className="text-xl font-bold font-mono text-indigo-600">
              {readinessScore}% Pass
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Evaluation Rules Breakdown:
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {gateEvaluations.map((ge, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{ge.rule}</div>
                    <div className="text-[11px] text-slate-400">
                      Target Criterion: <strong className="text-slate-600">{ge.target}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-700 font-semibold">{ge.actual}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ge.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ge.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
