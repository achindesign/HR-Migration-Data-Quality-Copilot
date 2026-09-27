import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  History,
  ShieldCheck,
  Search,
  Database,
  ArrowRightLeft,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react';
import { MigrationScenarioId } from '../types';
import { DEMO_SCENARIOS, getDemoScenario } from '../data/demoData';

interface HeaderProps {
  onLoadDemo: () => void;
  currentScenarioId: MigrationScenarioId;
  onSelectScenario: (id: MigrationScenarioId) => void;
  onRerunValidation: () => void;
  onResetDemo: () => void;
  onOpenAuditLog: () => void;
  onExportReport: () => void;
  sourceCount: number;
  targetCount: number;
  qualityScore: number;
  readiness: 'READY' | 'READY WITH WARNINGS' | 'NOT READY';
  lastValidated: string;
  isValidating: boolean;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadDemo,
  currentScenarioId,
  onSelectScenario,
  onRerunValidation,
  onResetDemo,
  onOpenAuditLog,
  onExportReport,
  sourceCount,
  targetCount,
  qualityScore,
  readiness,
  lastValidated,
  isValidating,
  globalSearch,
  onGlobalSearchChange,
}) => {
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentScenario = getDemoScenario(currentScenarioId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const readinessBg =
    readiness === 'READY'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
      : readiness === 'READY WITH WARNINGS'
      ? 'bg-amber-50 text-amber-700 border-amber-300'
      : 'bg-rose-50 text-rose-700 border-rose-300';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Product Identity and Quick Status */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                HR Migration Data Quality Copilot
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                PeopleSoft → Workday
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                v2.4 Migration Staging
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              AI-powered validation, reconciliation and migration readiness for HR data.
            </p>
          </div>
        </div>

        {/* Global Search and Control Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Global Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee, ID, dept..."
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white w-48 lg:w-56 transition"
            />
          </div>

          {/* Quick Metrics Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">
              Source: <strong className="text-slate-900 font-semibold">{sourceCount}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Target: <strong className="text-slate-900 font-semibold">{targetCount}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Score: <strong className="text-indigo-600 font-semibold">{qualityScore}%</strong>
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${readinessBg}`}>
              {readiness}
            </span>
          </div>

          {/* Scenario Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsScenarioDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-md shadow-2xs transition"
              title="Switch demo migration dataset to simulate different readiness cases"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[150px] truncate">{currentScenario.shortName}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  currentScenario.expectedReadiness === 'READY'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : currentScenario.expectedReadiness === 'READY WITH WARNINGS'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {currentScenario.expectedReadiness === 'READY'
                  ? 'READY'
                  : currentScenario.expectedReadiness === 'READY WITH WARNINGS'
                  ? 'WARNINGS'
                  : 'NOT READY'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isScenarioDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-84 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Migration Test Scenario
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Simulate different data hygiene, risk factors, and readiness gates
                  </div>
                </div>

                <div className="py-1">
                  {DEMO_SCENARIOS.map((sc) => {
                    const isSelected = sc.id === currentScenarioId;
                    const badgeClass =
                      sc.expectedReadiness === 'READY'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : sc.expectedReadiness === 'READY WITH WARNINGS'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          onSelectScenario(sc.id);
                          setIsScenarioDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition ${
                          isSelected ? 'bg-indigo-50/80 text-indigo-950 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {sc.shortName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeClass}`}
                            >
                              {sc.expectedReadiness}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {sc.tagline}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                            <span>{sc.sourceCount} Source</span>
                            <span>•</span>
                            <span>{sc.targetCount} Target</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-600">~{sc.expectedQualityScore} Score</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="px-3.5 py-2 bg-slate-50 text-[10px] text-slate-500">
                  Tip: Switch between <strong>READY</strong> (Golden Cutover) and <strong>NOT READY</strong> (M&A / Baseline) to see gate reactions.
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-md shadow-xs transition"
            title="Reload dataset for current scenario"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Reload Dataset</span>
          </button>

          <button
            onClick={onRerunValidation}
            disabled={isValidating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-2xs transition disabled:opacity-50"
            title="Re-run all validation rules, SQL checks, and reconciliation"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isValidating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Re-run Validation</span>
          </button>

          <button
            onClick={onOpenAuditLog}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-2xs transition"
            title="View change history and remediation audit trail"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">Audit Trail</span>
          </button>

          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-2xs transition"
            title="Generate executive migration quality report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">Export</span>
          </button>

          <button
            onClick={onResetDemo}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition"
            title="Reset dataset to fresh demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-bar with validation timestamp and active scenario indicator */}
      <div className="px-6 py-1 bg-slate-50 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Scenario: <strong>{currentScenario.name}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Validated: {lastValidated}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Deterministic Rules + SQL Engine + Gemini 3.8 Flash</span>
        </div>
        <div className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Synthetic Demo Data • No Real Employee PII • Migration Staging Sandbox
        </div>
      </div>
    </header>
  );
};
