import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  Download,
  Layers,
  Check,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { EmployeeRecord, FieldMapping, MigrationScenarioId } from '../../types';
import {
  DEFAULT_SOURCE_TARGET_MAPPINGS,
  DEMO_SCENARIOS,
  getDemoScenario,
  generateScenarioDatasets,
} from '../../data/demoData';

interface DataUploadViewProps {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
  mappings: FieldMapping[];
  currentScenarioId: MigrationScenarioId;
  onSelectScenario: (id: MigrationScenarioId) => void;
  onUpdateSourceRecords: (records: EmployeeRecord[]) => void;
  onUpdateTargetRecords: (records: EmployeeRecord[]) => void;
  onUpdateMappings: (mappings: FieldMapping[]) => void;
  onRerunValidation: () => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  sourceRecords,
  targetRecords,
  mappings,
  currentScenarioId,
  onSelectScenario,
  onUpdateSourceRecords,
  onUpdateTargetRecords,
  onUpdateMappings,
  onRerunValidation,
}) => {
  const [activeTarget, setActiveTarget] = useState<'source' | 'target'>('source');
  const [pasteData, setPasteData] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const activeScenario = getDemoScenario(currentScenarioId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadError(`Parsing error: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as EmployeeRecord[];
        if (data.length === 0) {
          setUploadError('Uploaded file contains no rows.');
          return;
        }

        if (activeTarget === 'source') {
          onUpdateSourceRecords(data);
          setUploadSuccess(`Successfully loaded ${data.length} records into PeopleSoft Source dataset.`);
        } else {
          onUpdateTargetRecords(data);
          setUploadSuccess(`Successfully loaded ${data.length} records into Workday Target dataset.`);
        }
        onRerunValidation();
      },
      error: (err) => {
        setUploadError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleParsePaste = () => {
    if (!pasteData.trim()) {
      setUploadError('Please paste CSV or tab-separated text.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);

    Papa.parse(pasteData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadError(`Parsing error: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as EmployeeRecord[];
        if (data.length === 0) {
          setUploadError('No valid rows parsed.');
          return;
        }

        if (activeTarget === 'source') {
          onUpdateSourceRecords(data);
          setUploadSuccess(`Successfully parsed ${data.length} records into Source dataset.`);
        } else {
          onUpdateTargetRecords(data);
          setUploadSuccess(`Successfully parsed ${data.length} records into Target dataset.`);
        }
        setPasteData('');
        onRerunValidation();
      },
    });
  };

  const loadScenarioById = (id: MigrationScenarioId) => {
    onSelectScenario(id);
    const sc = getDemoScenario(id);
    setUploadSuccess(`Loaded ${sc.name} (${sc.sourceCount} Source / ${sc.targetCount} Target records). Expected readiness: ${sc.expectedReadiness}.`);
  };

  const loadDemoSource = () => {
    const { sourceRecords: src } = generateScenarioDatasets(currentScenarioId);
    onUpdateSourceRecords(src);
    setUploadSuccess(`Loaded ${src.length} Source Records for ${activeScenario.shortName}.`);
    onRerunValidation();
  };

  const loadDemoTarget = () => {
    const { targetRecords: tgt } = generateScenarioDatasets(currentScenarioId);
    onUpdateTargetRecords(tgt);
    setUploadSuccess(`Loaded ${tgt.length} Target Records for ${activeScenario.shortName}.`);
    onRerunValidation();
  };

  const loadDefaultMappings = () => {
    onUpdateMappings(DEFAULT_SOURCE_TARGET_MAPPINGS);
    setUploadSuccess(`Loaded 13 standard PeopleSoft → Workday Source-to-Target mapping definitions.`);
  };

  const downloadSampleTemplate = () => {
    const sample = [
      {
        Employee_ID: 'PS-10001',
        Employee_Number: '100001',
        First_Name: 'John',
        Last_Name: 'Doe',
        Preferred_Name: 'John',
        Date_of_Birth: '1985-05-12',
        Gender: 'Male',
        Email: 'john.doe@enterprise-demo.corp',
        Phone: '+1-555-0101',
        Department_ID: 'D-101',
        Department_Name: 'Engineering & Product Development',
        Job_Code: 'JC-1001',
        Job_Title: 'Staff Software Engineer',
        Manager_ID: 'PS-10000',
        Location_Code: 'LOC-NY',
        Location_Name: 'New York HQ',
        Employment_Status: 'Active',
        Hire_Date: '2018-04-01',
        Termination_Date: '',
        Salary: 145000,
        Currency: 'USD',
        Pay_Group: 'LOC-NY_EXEC_MONTHLY',
        Business_Unit: 'BU-GLOBAL',
        Cost_Center: 'CC-10100',
        Worker_Type: 'Regular',
        Company_Code: 'CMP-100',
      },
    ];

    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HR_Migration_Sample_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Ingestion & Migration Readiness Scenarios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest real-world enterprise datasets or switch between pre-configured migration scenarios to evaluate cutover gate responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-700 hover:text-rose-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Migration Scenario Selector Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Pre-configured Migration Sample Datasets ({DEMO_SCENARIOS.length} Cases)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a scenario below to instantly populate Source and Target staging records and observe how the AI Copilot and Cutover Gate respond.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Active: <strong className="text-indigo-600 font-semibold">{activeScenario.name}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DEMO_SCENARIOS.map((sc) => {
            const isSelected = sc.id === currentScenarioId;
            const readinessBadge =
              sc.expectedReadiness === 'READY'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : sc.expectedReadiness === 'READY WITH WARNINGS'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-rose-50 text-rose-700 border-rose-300';

            return (
              <div
                key={sc.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 leading-snug">
                      {sc.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${readinessBadge}`}
                    >
                      {sc.expectedReadiness}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sc.sourceCount} Source</span>
                    <span className="text-slate-300">/</span>
                    <span>{sc.targetCount} Target</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-indigo-700">~{sc.expectedQualityScore} Score</span>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
                    {sc.keyCharacteristics.slice(0, 2).map((c, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="truncate">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {sc.sourceSystem.split(' ')[0]} → {sc.targetSystem.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => loadScenarioById(sc.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? 'Current Active' : 'Load Scenario'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Dataset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTarget('source')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTarget === 'source'
              ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-900">1. SOURCE: {activeScenario.sourceSystem}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              {sourceRecords.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Legacy employee master snapshot for {activeScenario.shortName}.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadDemoSource();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition"
          >
            Reload {activeScenario.sourceCount} Source Records
          </button>
        </div>

        <div
          onClick={() => setActiveTarget('target')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTarget === 'target'
              ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-900">2. TARGET: {activeScenario.targetSystem}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              {targetRecords.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Target worker staging extract for {activeScenario.shortName}.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadDemoTarget();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition"
          >
            Reload {activeScenario.targetCount} Target Records
          </button>
        </div>
      </div>

      {/* Upload & Paste Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Drag and Drop */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Upload CSV File for {activeTarget === 'source' ? 'Source Dataset' : 'Target Dataset'}
            </h3>
            <span className="text-xs text-slate-400">CSV or UTF-8 text</span>
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition group">
            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition mb-2" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
              Click to browse or drop CSV file here
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Supports standard column headers (Employee_ID, First_Name, Salary, etc.)
            </span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Paste Raw Tabular Data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Paste Tabular or CSV Data</h3>
            <span className="text-xs text-slate-400">Direct clipboard ingestion</span>
          </div>

          <textarea
            rows={5}
            placeholder={`Employee_ID,First_Name,Last_Name,Email,Department_ID,Salary,Hire_Date\nPS-10001,John,Smith,john.smith@enterprise-demo.corp,D-101,120000,2019-01-15`}
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleParsePaste}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Parse and Ingest
            </button>
          </div>
        </div>
      </div>

      {/* Source-to-Target Mapping Table Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Source-to-Target Column Mapping ({mappings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Configured enterprise field mapping from PeopleSoft schema to Workday Worker schema.
            </p>
          </div>
          <button
            onClick={loadDefaultMappings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reset Default Template Mappings</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Source (PeopleSoft)</th>
                <th className="py-2.5 px-3 text-left">Target (Workday)</th>
                <th className="py-2.5 px-3 text-center">Mapping Type</th>
                <th className="py-2.5 px-3 text-center">Confidence</th>
                <th className="py-2.5 px-3 text-center">Risk Level</th>
                <th className="py-2.5 px-3 text-left">Transformation Logic</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.sourceField}</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-600 font-semibold">
                    {m.targetField || <span className="text-amber-600 italic">Unmapped</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-600">{m.mappingType}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold text-slate-800">{m.confidence}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.risk === 'Low'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.risk === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">{m.explanation}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
