import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Code,
  FileCode,
} from 'lucide-react';
import { SQLCheckItem, EmployeeRecord } from '../../types';
import { generateSQLValidation } from '../../services/geminiService';

interface SQLChecksViewProps {
  sqlChecks: SQLCheckItem[];
  sourceRecords: EmployeeRecord[];
  onSelectRecord: (record: EmployeeRecord) => void;
}

export const SQLChecksView: React.FC<SQLChecksViewProps> = ({
  sqlChecks,
  sourceRecords,
  onSelectRecord,
}) => {
  const [selectedCheck, setSelectedCheck] = useState<SQLCheckItem | null>(sqlChecks[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI SQL Generator state
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    sql: string;
    explanation: string;
    purpose: string;
  } | null>(null);

  const handleCopy = (sqlText: string, id: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setIsGenerating(true);
    try {
      const res = await generateSQLValidation(naturalQuery);
      setGeneratedResult(res);
    } finally {
      setIsGenerating(false);
    }
  };

  const failedChecks = sqlChecks.filter((c) => c.status === 'FAIL');
  const passedChecks = sqlChecks.filter((c) => c.status === 'PASS');

  // Find affected employee records for the selected check
  const affectedEmployees = selectedCheck
    ? sourceRecords.filter((r) => selectedCheck.affectedIds.includes(r.Employee_ID))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SQL-Style Validation Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relational query checks executed in-memory against staging dataset with instant affected-records isolation.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <XCircle className="w-4 h-4" />
            <span>{failedChecks.length} Failed Queries</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{passedChecks.length} Passed</span>
          </span>
        </div>
      </div>

      {/* AI SQL Query Generator Assistant */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-indigo-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold tracking-tight">AI SQL Query Generator (Powered by Gemini 3.8 Flash)</h3>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Ask in plain English for custom validation logic (e.g. "Find active employees with missing cost centers" or "Detect salary outliers by department").
        </p>

        <form onSubmit={handleGenerateSQL} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Find all employees who share duplicate mobile phone numbers across different locations"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            {isGenerating ? 'Generating...' : 'Generate SQL'}
          </button>
        </form>

        {generatedResult && (
          <div className="bg-black/40 rounded-xl p-4 border border-white/10 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Generated ANSI SQL Query
              </span>
              <button
                onClick={() => handleCopy(generatedResult.sql, 'gen_sql')}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-white/10 transition"
              >
                {copiedId === 'gen_sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'gen_sql' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-3 bg-black/60 rounded-lg">
              {generatedResult.sql}
            </pre>
            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Explanation:</strong> {generatedResult.explanation}</div>
              <div><strong>Governance Purpose:</strong> {generatedResult.purpose}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: SQL Checks List (7 cols) + Selected Check Drill-Down (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Checks Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Predefined SQL Validation Checks ({sqlChecks.length})</h3>
            <span className="text-xs text-slate-500">Live In-Memory Evaluation</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {sqlChecks.map((check) => {
              const isSelected = selectedCheck?.id === check.id;
              return (
                <div
                  key={check.id}
                  onClick={() => setSelectedCheck(check)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {check.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-slate-900">{check.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">[{check.id}]</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          check.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {check.severity}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          check.recordsAffected > 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {check.recordsAffected} records
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">{check.explanation}</p>

                  <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto flex items-center justify-between">
                    <code className="truncate mr-2">{check.sql}</code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(check.sql, check.id);
                      }}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="Copy SQL"
                    >
                      {copiedId === check.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Check Affected Records Table */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          {selectedCheck ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Query Execution Drill-Down
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedCheck.name}</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedCheck.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedCheck.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-500 font-medium">Executable SQL:</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                  {selectedCheck.sql}
                </pre>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Affected Employee Records ({affectedEmployees.length}):
                  </span>
                  <span className="text-slate-400 text-[11px]">Click to inspect</span>
                </div>

                {affectedEmployees.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                    Zero records violate this query expression. Query passed!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                    {affectedEmployees.map((emp) => (
                      <div
                        key={emp.Employee_ID}
                        onClick={() => onSelectRecord(emp)}
                        className="p-3 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-700">{emp.Employee_ID}</span>
                            <span className="font-semibold text-slate-800">
                              {emp.First_Name} {emp.Last_Name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {emp.Department_Name} • {emp.Job_Title}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a validation check from the left table to inspect affected records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
