import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  FileCheck2,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import { TestCaseItem, UATItem } from '../../types';
import { DEFAULT_TEST_CASES, DEFAULT_UAT_CHECKLIST } from '../../data/testCases';

interface TestCasesViewProps {
  // Test cases and UAT
}

export const TestCasesView: React.FC<TestCasesViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'test_cases' | 'uat_checklist'>('test_cases');
  const [testCases, setTestCases] = useState<TestCaseItem[]>(DEFAULT_TEST_CASES);
  const [uatItems, setUatItems] = useState<UATItem[]>(DEFAULT_UAT_CHECKLIST);

  const toggleUatStatus = (id: string) => {
    setUatItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === 'Pending'
              ? 'In Progress'
              : item.status === 'In Progress'
              ? 'Passed'
              : item.status === 'Passed'
              ? 'Failed'
              : 'Pending';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const exportTestCasesCSV = () => {
    const csv = Papa.unparse(testCases);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Migration_Validation_Test_Cases.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportUatCSV = () => {
    const csv = Papa.unparse(uatItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HR_Migration_UAT_Signoff_Checklist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const passedUat = uatItems.filter((u) => u.status === 'Passed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Migration Test Cases & UAT Sign-Off Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-synthesized QA test scenarios and business user acceptance criteria derived from active migration scope and exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'test_cases' ? (
            <button
              onClick={exportTestCasesCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Test Cases (CSV)</span>
            </button>
          ) : (
            <button
              onClick={exportUatCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export UAT Checklist (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('test_cases')}
          className={`py-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'test_cases'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Migration QA Test Cases ({testCases.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('uat_checklist')}
          className={`py-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'uat_checklist'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Business UAT Checklist ({passedUat}/{uatItems.length} Signed-Off)</span>
        </button>
      </div>

      {activeTab === 'test_cases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-center w-20">ID</th>
                  <th className="py-3 px-4 text-center w-16">Priority</th>
                  <th className="py-3 px-4 text-left w-72">Scenario & Objectives</th>
                  <th className="py-3 px-4 text-left">Precondition & Test Data</th>
                  <th className="py-3 px-4 text-left">Expected Result</th>
                  <th className="py-3 px-4 text-left w-64">Validation Query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testCases.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600">
                      {tc.id}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tc.priority === 'P1'
                            ? 'bg-rose-100 text-rose-800'
                            : tc.priority === 'P2'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tc.scenario}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 space-y-1">
                      <div><strong className="text-slate-700">Pre:</strong> {tc.precondition}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Data: {tc.testData}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {tc.expectedResult}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-800 bg-slate-50/50">
                      <code>{tc.validationQuery}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'uat_checklist' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              User Acceptance Testing Sign-Off Checklist
            </h3>
            <span className="text-xs text-slate-500">
              Click status pill to cycle: Pending → In Progress → Passed → Failed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {uatItems.map((uat) => {
              const statusBadge =
                uat.status === 'Passed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : uat.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : uat.status === 'Failed'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <div
                  key={uat.id}
                  className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500">{uat.id}</span>
                      <span className="font-bold text-slate-900">{uat.testScenario}</span>
                    </div>
                    <p className="text-slate-600">{uat.expectedResult}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                      <span>Owner: <strong className="text-slate-700">{uat.businessOwner}</strong></span>
                      <span>Priority: <strong className="text-slate-700">{uat.priority}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleUatStatus(uat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${statusBadge}`}
                  >
                    {uat.status}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
