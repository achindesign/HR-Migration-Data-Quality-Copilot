import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Eye,
  GitMerge,
} from 'lucide-react';
import { DuplicateCandidate, EmployeeRecord } from '../../types';

interface DuplicateIntelligenceViewProps {
  duplicates: DuplicateCandidate[];
  onSelectRecord: (record: EmployeeRecord) => void;
  onUpdateDuplicateStatus: (id: string, status: DuplicateCandidate['status']) => void;
}

export const DuplicateIntelligenceView: React.FC<DuplicateIntelligenceViewProps> = ({
  duplicates,
  onSelectRecord,
  onUpdateDuplicateStatus,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filtered = filterLevel === 'ALL' ? duplicates : duplicates.filter((d) => d.riskLevel === filterLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Duplicate Intelligence Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phonetic name matching, exact identifier deduplication, and DOB similarity clustering to prevent dual worker identities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {duplicates.length} Potential Collisions Detected
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        {['ALL', 'High', 'Medium'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterLevel === lvl
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {lvl === 'ALL' ? 'All Candidates' : `${lvl} Confidence`}
          </button>
        ))}
      </div>

      {/* Duplicate Pairs Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No duplicate collisions found in this tier.</p>
          </div>
        ) : (
          filtered.map((dup) => {
            const recA = dup.primaryRecord;
            const recB = dup.matchedRecord;

            const badgeBg =
              dup.confidence >= 90
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : dup.confidence >= 80
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-blue-100 text-blue-800 border-blue-300';

            return (
              <div
                key={dup.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500">{dup.id}</span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                      {dup.confidence}% Collision Confidence ({dup.riskLevel})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dup.status === 'MERGE_PLANNED'
                          ? 'bg-indigo-100 text-indigo-700'
                          : dup.status === 'DISMISSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      Status: {dup.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateDuplicateStatus(dup.id, 'MERGE_PLANNED')}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Plan Merge</span>
                    </button>
                    <button
                      onClick={() => onUpdateDuplicateStatus(dup.id, 'DISMISSED')}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                    >
                      Dismiss (Distinct Workers)
                    </button>
                  </div>
                </div>

                {/* Match Factors */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Identified Overlaps:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dup.matchFactors.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Record A */}
                  <div
                    onClick={() => onSelectRecord(recA)}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-700">{recA.Employee_ID}</span>
                        <span className="font-bold text-slate-900">
                          {recA.First_Name} {recA.Last_Name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Record A</span>
                    </div>

                    <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <div>Email: <strong className="text-slate-800 font-normal">{recA.Email || '(blank)'}</strong></div>
                      <div>DOB: <strong className="text-slate-800 font-normal">{recA.Date_of_Birth}</strong></div>
                      <div>Phone: <strong className="text-slate-800 font-normal">{recA.Phone}</strong></div>
                      <div>Dept: <strong className="text-slate-800 font-normal">{recA.Department_Name}</strong></div>
                      <div>Status: <strong className="text-slate-800 font-normal">{recA.Employment_Status}</strong></div>
                    </div>
                  </div>

                  {/* Record B */}
                  <div
                    onClick={() => onSelectRecord(recB)}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-700">{recB.Employee_ID}</span>
                        <span className="font-bold text-slate-900">
                          {recB.First_Name} {recB.Last_Name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Record B</span>
                    </div>

                    <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <div>Email: <strong className="text-slate-800 font-normal">{recB.Email || '(blank)'}</strong></div>
                      <div>DOB: <strong className="text-slate-800 font-normal">{recB.Date_of_Birth}</strong></div>
                      <div>Phone: <strong className="text-slate-800 font-normal">{recB.Phone}</strong></div>
                      <div>Dept: <strong className="text-slate-800 font-normal">{recB.Department_Name}</strong></div>
                      <div>Status: <strong className="text-slate-800 font-normal">{recB.Employment_Status}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
