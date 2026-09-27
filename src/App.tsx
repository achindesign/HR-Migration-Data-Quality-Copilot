import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AuditLogModal } from './components/AuditLogModal';

import { DashboardView } from './components/views/DashboardView';
import { DataUploadView } from './components/views/DataUploadView';
import { DataProfilingView } from './components/views/DataProfilingView';
import { ValidationRulesView } from './components/views/ValidationRulesView';
import { SQLChecksView } from './components/views/SQLChecksView';
import { ReconciliationView } from './components/views/ReconciliationView';
import { AIMappingView } from './components/views/AIMappingView';
import { DuplicateIntelligenceView } from './components/views/DuplicateIntelligenceView';
import { ExceptionWorkbenchView } from './components/views/ExceptionWorkbenchView';
import { QualitySimulatorView } from './components/views/QualitySimulatorView';
import { MigrationCopilotView } from './components/views/MigrationCopilotView';
import { TestCasesView } from './components/views/TestCasesView';
import { QualityReportView } from './components/views/QualityReportView';
import { GateSettingsView } from './components/views/GateSettingsView';

import {
  EmployeeRecord,
  ValidationIssue,
  ValidationRule,
  FieldMapping,
  AuditLogItem,
  DuplicateCandidate,
  MigrationGateSettings,
  MigrationScenarioId,
} from './types';

import {
  generateDemoMigrationDatasets,
  generateScenarioDatasets,
  getDemoScenario,
  getInitialScenarioAuditLogs,
  DEFAULT_SCENARIO_ID,
  DEFAULT_SOURCE_TARGET_MAPPINGS,
} from './data/demoData';

import {
  DEFAULT_RULES,
  runValidationRules,
  calculateFieldScorecards,
} from './services/validationEngine';

import { runSQLChecks } from './services/sqlCheckEngine';
import { performReconciliation } from './services/reconciliationEngine';
import { detectDuplicates } from './services/duplicateEngine';
import { profileDataset } from './services/profilerEngine';
import {
  calculateMigrationRisk,
  calculateOverallQualityScore,
  DEFAULT_GATE_SETTINGS,
} from './services/riskEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentScenarioId, setCurrentScenarioId] = useState<MigrationScenarioId>(DEFAULT_SCENARIO_ID);

  // Master datasets
  const [sourceRecords, setSourceRecords] = useState<EmployeeRecord[]>([]);
  const [targetRecords, setTargetRecords] = useState<EmployeeRecord[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>(DEFAULT_SOURCE_TARGET_MAPPINGS);
  const [rules, setRules] = useState<ValidationRule[]>(DEFAULT_RULES);
  const [gateSettings, setGateSettings] = useState<MigrationGateSettings>(DEFAULT_GATE_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Validation & Engine Results State
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [lastValidated, setLastValidated] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Inspector & Modal State
  const [selectedRecord, setSelectedRecord] = useState<EmployeeRecord | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [appliedFixesCount, setAppliedFixesCount] = useState<number>(0);

  // Helper to re-evaluate validation and all engines over current sourceRecords
  const executeEngines = useCallback(
    (currentSource: EmployeeRecord[], currentRules: ValidationRule[]) => {
      const generatedIssues = runValidationRules(currentSource, currentRules);
      setIssues(generatedIssues);
      setLastValidated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    },
    []
  );

  // Initialize with realistic demo dataset on mount
  useEffect(() => {
    const { sourceRecords: initialSource, targetRecords: initialTarget } =
      generateDemoMigrationDatasets();
    setSourceRecords(initialSource);
    setTargetRecords(initialTarget);
    setMappings(DEFAULT_SOURCE_TARGET_MAPPINGS);
    setRules(DEFAULT_RULES);

    executeEngines(initialSource, DEFAULT_RULES);

    // Initial audit log with realistic scenario progression
    const initialLogs = getInitialScenarioAuditLogs(DEFAULT_SCENARIO_ID);
    setAuditLogs(initialLogs);
  }, [executeEngines]);

  // Derived Engines Calculations
  const fieldScorecards = useMemo(() => {
    return calculateFieldScorecards(sourceRecords, issues);
  }, [sourceRecords, issues]);

  const sqlChecks = useMemo(() => {
    return runSQLChecks(sourceRecords);
  }, [sourceRecords]);

  const reconSummary = useMemo(() => {
    if (sourceRecords.length === 0 || targetRecords.length === 0) return null;
    return performReconciliation(sourceRecords, targetRecords);
  }, [sourceRecords, targetRecords]);

  const duplicates = useMemo(() => {
    return detectDuplicates(sourceRecords);
  }, [sourceRecords]);

  const fieldProfiles = useMemo(() => {
    return profileDataset(sourceRecords);
  }, [sourceRecords]);

  const riskAnalysis = useMemo(() => {
    return calculateMigrationRisk(
      issues,
      fieldScorecards,
      mappings,
      reconSummary,
      duplicates,
      sourceRecords.length,
      gateSettings
    );
  }, [issues, fieldScorecards, mappings, reconSummary, duplicates, sourceRecords.length, gateSettings]);

  // Control Actions
  const handleLoadScenario = useCallback((scenarioId: MigrationScenarioId) => {
    setCurrentScenarioId(scenarioId);
    const { sourceRecords: newSrc, targetRecords: newTgt } = generateScenarioDatasets(scenarioId);
    const scenario = getDemoScenario(scenarioId);
    setSourceRecords(newSrc);
    setTargetRecords(newTgt);
    setMappings(DEFAULT_SOURCE_TARGET_MAPPINGS);
    setRules(DEFAULT_RULES);
    executeEngines(newSrc, DEFAULT_RULES);
    setAppliedFixesCount(0);

    // Load initial scenario audit trail
    const scenarioLogs = getInitialScenarioAuditLogs(scenarioId);
    setAuditLogs(scenarioLogs);
  }, [executeEngines]);

  const handleLoadDemo = () => {
    handleLoadScenario(currentScenarioId);
  };

  const handleRerunValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      executeEngines(sourceRecords, rules);
      setIsValidating(false);
    }, 400);
  };

  const handleResetDemo = () => {
    handleLoadScenario(currentScenarioId);
  };

  // Apply single remediation fix
  const handleApplyFix = (issueId: string, fixValue: any) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    const oldRecord = sourceRecords.find((r) => r.Employee_ID === issue.recordId);
    const oldValue = oldRecord ? oldRecord[issue.field] : undefined;

    // Mutate source records immutably
    const updatedRecords = sourceRecords.map((r) => {
      if (r.Employee_ID === issue.recordId) {
        return {
          ...r,
          [issue.field]: fixValue,
        };
      }
      return r;
    });

    setSourceRecords(updatedRecords);
    setAppliedFixesCount((prev) => prev + 1);

    // Calculate updated score for historical audit progression
    const newIssues = runValidationRules(updatedRecords, rules);
    const newScore = calculateOverallQualityScore(newIssues, updatedRecords.length);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Quality Assurance Lead',
        action: `Remediated ${issue.ruleName}`,
        recordId: issue.recordId,
        field: issue.field,
        oldValue: oldValue ?? 'null',
        newValue: fixValue,
        note: `Applied suggested fix: ${issue.suggestedFix || 'Standardized attribute'}`,
        qualityScore: newScore,
      },
      ...prev,
    ]);

    // Re-execute engines over updated records
    executeEngines(updatedRecords, rules);

    // If modal is open, update selectedRecord
    if (selectedRecord && selectedRecord.Employee_ID === issue.recordId) {
      setSelectedRecord({
        ...selectedRecord,
        [issue.field]: fixValue,
      });
    }
  };

  // Bulk Apply all remediations
  const handleApplyAllRemediations = () => {
    const fixable = issues.filter((i) => i.canAutoFix && i.remediationValue !== undefined);
    if (fixable.length === 0) return;

    let updatedRecords = [...sourceRecords];
    const newLogs: AuditLogItem[] = [];

    for (const issue of fixable) {
      const idx = updatedRecords.findIndex((r) => r.Employee_ID === issue.recordId);
      if (idx !== -1) {
        const oldVal = updatedRecords[idx][issue.field];
        updatedRecords[idx] = {
          ...updatedRecords[idx],
          [issue.field]: issue.remediationValue,
        };

        newLogs.push({
          id: `AUD-${Date.now().toString().slice(-4)}-${newLogs.length}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: 'Auto-Remediation Batch Process',
          action: `Bulk Normalized ${issue.field}`,
          recordId: issue.recordId,
          field: issue.field,
          oldValue: oldVal ?? 'null',
          newValue: issue.remediationValue,
          note: issue.suggestedFix,
        });
      }
    }

    setSourceRecords(updatedRecords);
    setAppliedFixesCount((prev) => prev + fixable.length);

    // Compute updated score after bulk remediation
    const bulkIssues = runValidationRules(updatedRecords, rules);
    const bulkScore = calculateOverallQualityScore(bulkIssues, updatedRecords.length);
    newLogs.forEach((l) => (l.qualityScore = bulkScore));

    setAuditLogs((prev) => [...newLogs.slice(0, 10), ...prev]);

    executeEngines(updatedRecords, rules);
  };

  const handleUpdateIssue = (updatedIssue: ValidationIssue) => {
    const updated = issues.map((i) => (i.id === updatedIssue.id ? updatedIssue : i));
    setIssues(updated);

    // Add comment or status audit
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: updatedIssue.assignedTo || 'Migration Lead',
        action: `Updated Exception ${updatedIssue.id} status to ${updatedIssue.status}`,
        recordId: updatedIssue.recordId,
        field: updatedIssue.field,
        note: `Severity: ${updatedIssue.severity}. Owner: ${updatedIssue.assignedTo || 'Unassigned'}`,
      },
      ...prev,
    ]);
  };

  const handleUpdateRules = (updatedRules: ValidationRule[]) => {
    setRules(updatedRules);
    executeEngines(sourceRecords, updatedRules);
  };

  const handleUpdateDuplicateStatus = (id: string, status: DuplicateCandidate['status']) => {
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Data Governance Lead',
        action: `Marked Duplicate Pair ${id} as ${status}`,
        note: `Updated duplicate review queue status to ${status}.`,
      },
      ...prev,
    ]);
  };

  // Find corresponding target record if any for inspector modal
  const targetRecordForSelected = selectedRecord
    ? targetRecords.find((r) => r.Employee_ID === selectedRecord.Employee_ID)
    : null;

  // Active open exceptions count
  const openExceptionsCount = issues.filter(
    (i) => i.status === 'OPEN' || i.status === 'REMEDIATION REQUIRED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Header */}
      <Header
        onLoadDemo={handleLoadDemo}
        currentScenarioId={currentScenarioId}
        onSelectScenario={handleLoadScenario}
        onRerunValidation={handleRerunValidation}
        onResetDemo={handleResetDemo}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        onExportReport={() => setActiveTab('reports')}
        sourceCount={sourceRecords.length}
        targetCount={targetRecords.length}
        qualityScore={riskAnalysis.overallQualityScore}
        readiness={riskAnalysis.readinessStatus}
        lastValidated={lastValidated}
        isValidating={isValidating}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
      />

      {/* Main Body Layout: Sidebar + View Container */}
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          criticalCount={issues.filter((i) => i.severity === 'Critical').length}
          unmatchedCount={
            reconSummary ? reconSummary.missingInTargetCount + reconSummary.extraInTargetCount : 7
          }
          duplicateCount={duplicates.length}
          openExceptionsCount={openExceptionsCount}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              qualityScore={riskAnalysis.overallQualityScore}
              readinessStatus={riskAnalysis.readinessStatus}
              readinessScore={riskAnalysis.readinessScore}
              sourceCount={sourceRecords.length}
              targetCount={targetRecords.length}
              reconSummary={reconSummary}
              issues={issues}
              radarMetrics={riskAnalysis.radarMetrics}
              fieldScorecards={fieldScorecards}
              duplicateCount={duplicates.length}
              onSelectTab={setActiveTab}
              onSelectRecord={setSelectedRecord}
              sourceRecords={sourceRecords}
              currentScenarioId={currentScenarioId}
              onSelectScenario={handleLoadScenario}
              auditLogs={auditLogs}
              onOpenAuditLog={() => setIsAuditModalOpen(true)}
            />
          )}

          {activeTab === 'upload' && (
            <DataUploadView
              sourceRecords={sourceRecords}
              targetRecords={targetRecords}
              mappings={mappings}
              currentScenarioId={currentScenarioId}
              onSelectScenario={handleLoadScenario}
              onUpdateSourceRecords={(recs) => {
                setSourceRecords(recs);
                executeEngines(recs, rules);
              }}
              onUpdateTargetRecords={setTargetRecords}
              onUpdateMappings={setMappings}
              onRerunValidation={handleRerunValidation}
            />
          )}

          {activeTab === 'profiling' && (
            <DataProfilingView
              profiles={fieldProfiles}
              sourceCount={sourceRecords.length}
            />
          )}

          {activeTab === 'rules' && (
            <ValidationRulesView
              rules={rules}
              onUpdateRules={handleUpdateRules}
              onRerunValidation={handleRerunValidation}
            />
          )}

          {activeTab === 'sql_checks' && (
            <SQLChecksView
              sqlChecks={sqlChecks}
              sourceRecords={sourceRecords}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              reconSummary={reconSummary}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'mapping' && (
            <AIMappingView
              mappings={mappings}
              onUpdateMappings={setMappings}
            />
          )}

          {activeTab === 'duplicates' && (
            <DuplicateIntelligenceView
              duplicates={duplicates}
              onSelectRecord={setSelectedRecord}
              onUpdateDuplicateStatus={handleUpdateDuplicateStatus}
            />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionWorkbenchView
              issues={issues}
              sourceRecords={sourceRecords}
              onUpdateIssue={handleUpdateIssue}
              onApplyFix={handleApplyFix}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'simulator' && (
            <QualitySimulatorView
              issues={issues}
              currentScore={riskAnalysis.overallQualityScore}
              onApplyAllRemediations={handleApplyAllRemediations}
              appliedFixesCount={appliedFixesCount}
            />
          )}

          {activeTab === 'copilot' && (
            <MigrationCopilotView
              sourceCount={sourceRecords.length}
              targetCount={targetRecords.length}
              qualityScore={riskAnalysis.overallQualityScore}
              readiness={riskAnalysis.readinessStatus}
              issues={issues}
            />
          )}

          {activeTab === 'test_cases' && <TestCasesView />}

          {activeTab === 'reports' && (
            <QualityReportView
              sourceCount={sourceRecords.length}
              targetCount={targetRecords.length}
              qualityScore={riskAnalysis.overallQualityScore}
              readinessStatus={riskAnalysis.readinessStatus}
              readinessScore={riskAnalysis.readinessScore}
              issues={issues}
              fieldScorecards={fieldScorecards}
              mappings={mappings}
              reconSummary={reconSummary}
              duplicates={duplicates}
              lastValidated={lastValidated}
              currentScenarioId={currentScenarioId}
            />
          )}

          {activeTab === 'gate_settings' && (
            <GateSettingsView
              settings={gateSettings}
              onUpdateSettings={setGateSettings}
              gateEvaluations={riskAnalysis.gateEvaluations}
              readinessStatus={riskAnalysis.readinessStatus}
              readinessScore={riskAnalysis.readinessScore}
            />
          )}
        </main>
      </div>

      {/* Record Detail Inspector Slide-Over */}
      <RecordDetailModal
        record={selectedRecord}
        targetRecord={targetRecordForSelected}
        issues={issues}
        onClose={() => setSelectedRecord(null)}
        onApplyFix={handleApplyFix}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="font-medium text-slate-700">
          HR Migration Data Quality Copilot — Prototype
        </div>
        <div className="text-[11px] text-slate-400">
          Demo data only | AI-assisted analysis | Human review required | PeopleSoft HCM to Workday 2026R2
        </div>
      </footer>
    </div>
  );
}
