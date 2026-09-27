import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { ReconciliationSummary } from '../../services/reconciliationEngine';
import { ReconciliationRecord, ReconStatus, EmployeeRecord } from '../../types';

interface ReconciliationViewProps {
  reconSummary: ReconciliationSummary | null;
  onSelectRecord: (record: EmployeeRecord) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  reconSummary,
  onSelectRecord,
}) => {
  const [statusFilter, setStatusFilter] = useState<ReconStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ReconciliationRecord | null>(null);

  if (!reconSummary) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        No reconciliation data available. Please load or upload datasets.
      </div>
    );
  }

  const filteredRecords = reconSummary.records.filter((rec) => {
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    const matchesSearch =
      rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Source → Target Reconciliation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full record-level and field-level variance comparison between PeopleSoft Source and Workday Staging.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search worker ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'ALL'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-slate-500">Total Population</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {reconSummary.totalSource}
          </div>
          <div className="text-[10px] text-slate-400">Source extracts</div>
        </button>

        <button
          onClick={() => setStatusFilter('MATCHED')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'MATCHED'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-emerald-700 font-medium">Exact Matched</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {reconSummary.matchedCount}
          </div>
          <div className="text-[10px] text-emerald-600">100% field parity</div>
        </button>

        <button
          onClick={() => setStatusFilter('EXPECTED TRANSFORMATION')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'EXPECTED TRANSFORMATION'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-blue-700 font-medium">Transformations</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">
            {reconSummary.expectedTransformationCount}
          </div>
          <div className="text-[10px] text-blue-600">Approved mappings</div>
        </button>

        <button
          onClick={() => setStatusFilter('MISMATCH')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'MISMATCH'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-amber-700 font-medium">Mismatches</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {reconSummary.mismatchCount}
          </div>
          <div className="text-[10px] text-amber-600">Unplanned delta</div>
        </button>

        <button
          onClick={() => setStatusFilter('MISSING IN TARGET')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'MISSING IN TARGET'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-rose-700 font-medium">Missing Target</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {reconSummary.missingInTargetCount}
          </div>
          <div className="text-[10px] text-rose-600">Omitted workers</div>
        </button>

        <button
          onClick={() => setStatusFilter('EXTRA IN TARGET')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'EXTRA IN TARGET'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] text-purple-700 font-medium">Extra Target</div>
          <div className="text-xl font-bold font-mono text-purple-600 mt-0.5">
            {reconSummary.extraInTargetCount}
          </div>
          <div className="text-[10px] text-purple-600">Directly created</div>
        </button>
      </div>

      {/* Main Grid: Reconciliation Records List + Deep Diff Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Records Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Reconciled Population ({filteredRecords.length})
            </h3>
            <span className="text-xs text-slate-500">
              Match Rate: <strong>{reconSummary.reconciliationRate}%</strong>
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 text-left">Worker ID</th>
                  <th className="py-2.5 px-3 text-left">Employee Name</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Variance Count</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isSelected = selectedItem?.employeeId === rec.employeeId;
                  const statusStyle =
                    rec.status === 'MATCHED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : rec.status === 'EXPECTED TRANSFORMATION'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : rec.status === 'MISMATCH'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : rec.status === 'MISSING IN TARGET'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  return (
                    <tr
                      key={rec.employeeId}
                      onClick={() => setSelectedItem(rec)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {rec.employeeId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{rec.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {rec.diffs.length}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {rec.sourceRecord && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecord(rec.sourceRecord!);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Inspect full record details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Record Field Diffs Drilldown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Field Reconciliation Matrix
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedItem.employeeId} — {selectedItem.name}
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedItem.status}
                </span>
              </div>

              {selectedItem.diffs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-800">100% Identical Parity</p>
                  <p className="text-emerald-700 mt-0.5">
                    All demographic, compensation, organization, and supervisory attributes match exactly between PeopleSoft and Workday.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 font-semibold">
                    Detected Field Variations ({selectedItem.diffs.length}):
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {selectedItem.diffs.map((d, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          d.isExpectedTransformation
                            ? 'bg-blue-50/50 border-blue-200'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono">{d.field}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              d.isExpectedTransformation
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.isExpectedTransformation ? 'Expected Transformation' : 'Variance Mismatch'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Source (PeopleSoft):</span>
                            <span className="font-mono text-slate-800 font-semibold">{String(d.sourceValue)}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Target (Workday):</span>
                            <span className="font-mono text-slate-800 font-semibold">{String(d.targetValue)}</span>
                          </div>
                        </div>

                        {d.notes && <p className="text-[11px] text-slate-500 italic mt-1">{d.notes}</p>}
                      </div>
                    ))}
                  </div>

                  {selectedItem.sourceRecord && (
                    <button
                      onClick={() => onSelectRecord(selectedItem.sourceRecord!)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Open in Full Exception Workbench
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a worker record from the left table to inspect field-level transformations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
