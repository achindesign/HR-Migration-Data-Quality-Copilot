import React, { useState } from 'react';
import { BarChart3, Search, Hash, Calendar, Mail, FileType } from 'lucide-react';
import { FieldProfile } from '../../types';

interface DataProfilingViewProps {
  profiles: FieldProfile[];
  sourceCount: number;
}

export const DataProfilingView: React.FC<DataProfilingViewProps> = ({ profiles, sourceCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<FieldProfile | null>(profiles[0] || null);

  const filtered = profiles.filter((p) =>
    p.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Automated Data Profiling</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical distribution, completeness ratios, data type inference, and distinct values across all {profiles.length} attributes.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attribute name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
          />
        </div>
      </div>

      {/* Main split: Fields table on left (7 cols), Selected attribute deep-dive on right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of fields */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Attribute Profile Summary ({filtered.length})</h3>
            <span className="text-xs text-slate-400">Total Population: {sourceCount} records</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 text-left">Field Name</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Null %</th>
                  <th className="py-2.5 px-3 text-right">Distinct %</th>
                  <th className="py-2.5 px-3 text-right">Duplicates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isSelected = selectedField?.field === p.field;
                  return (
                    <tr
                      key={p.field}
                      onClick={() => setSelectedField(p)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-900">{p.field}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                          {p.dataType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={p.nullPercent > 5 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {p.nullPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {p.distinctPercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {p.duplicateCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Field Drill-Down */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          {selectedField ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Attribute Details
                  </span>
                  <h3 className="text-base font-bold font-mono text-slate-900">{selectedField.field}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedField.dataType.toUpperCase()}
                </span>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[11px]">Completeness</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {100 - selectedField.nullPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedField.nullCount} missing</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[11px]">Uniqueness</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {selectedField.distinctCount}
                  </div>
                  <div className="text-[10px] text-slate-500">distinct values</div>
                </div>

                {selectedField.min !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-400 text-[11px]">Minimum Value</div>
                    <div className="text-xs font-bold font-mono text-slate-900 truncate mt-0.5">
                      {typeof selectedField.min === 'number'
                        ? `$${selectedField.min.toLocaleString()}`
                        : String(selectedField.min)}
                    </div>
                  </div>
                )}

                {selectedField.max !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-slate-400 text-[11px]">Maximum Value</div>
                    <div className="text-xs font-bold font-mono text-slate-900 truncate mt-0.5">
                      {typeof selectedField.max === 'number'
                        ? `$${selectedField.max.toLocaleString()}`
                        : String(selectedField.max)}
                    </div>
                  </div>
                )}

                {selectedField.avg !== undefined && (
                  <div className="col-span-2 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="text-indigo-600 text-[11px] font-semibold">Mean Average</div>
                    <div className="text-lg font-bold font-mono text-indigo-900 mt-0.5">
                      ${selectedField.avg.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Categorical Distribution / Top Values */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-800">Top Frequency Distribution:</h4>
                <div className="space-y-2">
                  {selectedField.topValues.map((tv, idx) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium truncate max-w-xs">{tv.value}</span>
                        <span className="font-mono text-slate-500 font-semibold text-[11px]">
                          {tv.count} ({tv.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${tv.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Raw Values */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">Sample Extracted Values:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedField.sampleValues.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
                    >
                      {String(s)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select an attribute from the left table to inspect statistical distribution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
