import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Check,
  Plus,
} from 'lucide-react';
import { FieldMapping } from '../../types';

interface AIMappingViewProps {
  mappings: FieldMapping[];
  onUpdateMappings: (mappings: FieldMapping[]) => void;
}

export const AIMappingView: React.FC<AIMappingViewProps> = ({
  mappings,
  onUpdateMappings,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const updateMappingStatus = (id: string, newStatus: FieldMapping['status']) => {
    const updated = mappings.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
    onUpdateMappings(updated);
  };

  const filtered = filterRisk === 'ALL' ? mappings : mappings.filter((m) => m.risk === filterRisk);

  const approvedCount = mappings.filter((m) => m.status === 'APPROVED').length;
  const highRiskCount = mappings.filter((m) => m.risk === 'High').length;
  const unmappedCount = mappings.filter((m) => m.mappingType === 'Unmapped').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Source-to-Target Mapping Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated schema mapping recommendations, taxonomy transformation rules, and cardinality risk analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allApproved = mappings.map((m) => ({ ...m, status: 'APPROVED' as const }));
              onUpdateMappings(allApproved);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve All Recommended Mappings</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs">Total Schema Fields</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{mappings.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mapped dimensions</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-emerald-700 text-xs font-medium">Approved by Governance</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Production sign-off</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-rose-700 text-xs font-medium">High Transformation Risk</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{highRiskCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Complex lookup rules</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-amber-700 text-xs font-medium">Unmapped Source Fields</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{unmappedCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Target gaps</div>
        </div>
      </div>

      {/* Risk Filter Buttons */}
      <div className="flex gap-2 text-xs">
        {['ALL', 'High', 'Medium', 'Low'].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRisk(r)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterRisk === r
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r === 'ALL' ? 'All Risks' : `${r} Risk`}
          </button>
        ))}
      </div>

      {/* Mapping Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-slate-400 font-semibold">{m.id}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700">
                  {m.confidence}% AI Confidence
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    m.risk === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : m.risk === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {m.risk} Risk
                </span>
              </div>
            </div>

            {/* Field Flow Pill */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="text-left font-mono font-bold text-slate-900 truncate">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">PeopleSoft Source</span>
                {m.sourceField}
              </div>

              <div className="flex flex-col items-center shrink-0">
                <span className="text-[10px] font-bold text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                  {m.mappingType}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-1" />
              </div>

              <div className="text-right font-mono font-bold text-indigo-700 truncate">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Workday Target</span>
                {m.targetField || <span className="text-slate-400 italic">Unmapped</span>}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                <Sparkles className="w-3 h-3" />
                <span>AI Governance Rationale:</span>
              </div>
              <p className="leading-relaxed text-slate-600 text-[11px]">{m.explanation}</p>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  m.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Status: {m.status}
              </span>

              <div className="flex items-center gap-2">
                {m.status !== 'APPROVED' ? (
                  <button
                    onClick={() => updateMappingStatus(m.id, 'APPROVED')}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateMappingStatus(m.id, 'REJECTED')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
