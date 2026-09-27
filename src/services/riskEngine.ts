import {
  ValidationIssue,
  RiskRadarMetric,
  MigrationGateSettings,
  FieldScorecard,
  FieldMapping,
  DuplicateCandidate,
} from '../types';
import { ReconciliationSummary } from './reconciliationEngine';

export const DEFAULT_GATE_SETTINGS: MigrationGateSettings = {
  maxCriticalIssues: 0, // Zero critical issues allowed for clean gate
  maxHighIssues: 15,
  minCompleteness: 95.0,
  minValidity: 90.0,
  minReconciliationRate: 98.0,
  maxDuplicateRate: 1.5,
};

export interface RiskAnalysisResult {
  radarMetrics: RiskRadarMetric[];
  overallQualityScore: number;
  readinessStatus: 'READY' | 'READY WITH WARNINGS' | 'NOT READY';
  readinessScore: number;
  gateEvaluations: {
    rule: string;
    target: string;
    actual: string;
    passed: boolean;
  }[];
}

// Overall Data Quality Score (0 - 100)
export function calculateOverallQualityScore(issues: ValidationIssue[], totalRecords: number): number {
  if (totalRecords === 0) return 100;
  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;
  const lowCount = issues.filter((i) => i.severity === 'Low').length;

  const penalty = (criticalCount * 2.5 + highCount * 1.0 + mediumCount * 0.4 + lowCount * 0.1);
  return Math.max(35, Math.min(100, Math.round((100 - (penalty / totalRecords) * 100) * 10) / 10));
}

export function calculateMigrationRisk(
  issues: ValidationIssue[],
  fieldScorecards: FieldScorecard[],
  mappings: FieldMapping[],
  reconSummary: ReconciliationSummary | null,
  duplicates: DuplicateCandidate[],
  totalRecords: number,
  gateSettings: MigrationGateSettings = DEFAULT_GATE_SETTINGS
): RiskAnalysisResult {
  if (totalRecords === 0) {
    return {
      radarMetrics: [],
      overallQualityScore: 0,
      readinessStatus: 'NOT READY',
      readinessScore: 0,
      gateEvaluations: [],
    };
  }

  // 1. Data Completeness: Average completeness of fields
  const avgCompleteness =
    fieldScorecards.length > 0
      ? Math.round(
          (fieldScorecards.reduce((sum, f) => sum + f.completeness, 0) / fieldScorecards.length) * 10
        ) / 10
      : 90;

  // 2. Data Validity: Average validity of fields
  const avgValidity =
    fieldScorecards.length > 0
      ? Math.round(
          (fieldScorecards.reduce((sum, f) => sum + f.validity, 0) / fieldScorecards.length) * 10
        ) / 10
      : 88;

  // 3. Duplicate Risk: Invert duplicate rate (100 - (dupCount / total * 100))
  const dupRate = Math.min(100, Math.round(((duplicates.length * 2) / totalRecords) * 1000) / 10);
  const duplicateScore = Math.max(0, Math.round((100 - dupRate * 5) * 10) / 10);

  // 4. Mapping Risk: Percentage of approved mappings
  const totalMappings = mappings.length;
  const approvedMappings = mappings.filter((m) => m.status === 'APPROVED').length;
  const highRiskMappings = mappings.filter((m) => m.risk === 'High').length;
  const mappingScore =
    totalMappings > 0
      ? Math.max(0, Math.round(((approvedMappings / totalMappings) * 100 - highRiskMappings * 4) * 10) / 10)
      : 75;

  // 5. Transformation Risk: Evaluates reconciliation expected transformations vs unexpected mismatches
  const reconMismatches = reconSummary?.mismatchCount || 0;
  const reconMissing = reconSummary?.missingInTargetCount || 0;
  const transRiskPenalty = (reconMismatches * 3 + reconMissing * 4);
  const transformationScore = Math.max(40, Math.min(100, Math.round((100 - (transRiskPenalty / totalRecords) * 100) * 10) / 10));

  // 6. Referential Integrity: Manager & Department checks
  const refIssues = issues.filter((i) => i.category === 'Referential Integrity');
  const refScore = Math.max(
    0,
    Math.round((100 - (refIssues.length / totalRecords) * 200) * 10) / 10
  );

  // 7. Business Rule Violations
  const bizIssues = issues.filter((i) => i.category === 'Business Rule');
  const bizScore = Math.max(
    0,
    Math.round((100 - (bizIssues.length / totalRecords) * 150) * 10) / 10
  );

  // Radar metrics structure
  const radarMetrics: RiskRadarMetric[] = [
    {
      name: 'Data Completeness',
      key: 'completeness',
      score: avgCompleteness,
      riskLabel: avgCompleteness >= 95 ? 'Low' : avgCompleteness >= 85 ? 'Moderate' : 'High',
      affectedCount: issues.filter((i) => i.category === 'Completeness').length,
      description: 'Presence of all mandatory employee demographic, payroll, and organization values.',
    },
    {
      name: 'Data Validity',
      key: 'validity',
      score: avgValidity,
      riskLabel: avgValidity >= 92 ? 'Low' : avgValidity >= 82 ? 'Moderate' : 'High',
      affectedCount: issues.filter((i) => i.category === 'Validity').length,
      description: 'Syntactic adherence to email RFC standards, ISO currencies, numeric ranges, and dates.',
    },
    {
      name: 'Duplicate Risk',
      key: 'duplicateRisk',
      score: duplicateScore,
      riskLabel: duplicateScore >= 90 ? 'Low' : duplicateScore >= 75 ? 'Moderate' : 'High',
      affectedCount: duplicates.length,
      description: 'Identical emails, mobile phones, or fuzzy name + DOB overlaps across worker records.',
    },
    {
      name: 'Mapping Risk',
      key: 'mappingRisk',
      score: mappingScore,
      riskLabel: mappingScore >= 85 ? 'Low' : mappingScore >= 70 ? 'Moderate' : 'High',
      affectedCount: mappings.filter((m) => m.status !== 'APPROVED' || m.risk === 'High').length,
      description: 'Unmapped source legacy attributes and high-complexity Supervisory Org lookups.',
    },
    {
      name: 'Transformation Risk',
      key: 'transformationRisk',
      score: transformationScore,
      riskLabel: transformationScore >= 90 ? 'Low' : transformationScore >= 75 ? 'Moderate' : 'High',
      affectedCount: (reconSummary?.mismatchCount || 0) + (reconSummary?.missingInTargetCount || 0),
      description: 'Discrepancies occurring between PeopleSoft extract and Workday staged worker objects.',
    },
    {
      name: 'Referential Integrity',
      key: 'referentialIntegrity',
      score: refScore,
      riskLabel: refScore >= 95 ? 'Low' : refScore >= 80 ? 'Moderate' : 'Critical',
      affectedCount: refIssues.length,
      description: 'Orphan Manager IDs and deprecated Department / Supervisory Org reference links.',
    },
  ];

  // Overall Data Quality Score (0 - 100)
  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;
  const lowCount = issues.filter((i) => i.severity === 'Low').length;

  const overallQualityScore = calculateOverallQualityScore(issues, totalRecords);

  // Migration Gate Evaluation against configurable settings
  const actualReconRate = reconSummary?.reconciliationRate ?? 95.0;

  const gateEvaluations = [
    {
      rule: 'Critical Severity Issues',
      target: `<= ${gateSettings.maxCriticalIssues}`,
      actual: `${criticalCount}`,
      passed: criticalCount <= gateSettings.maxCriticalIssues,
    },
    {
      rule: 'High Severity Issues',
      target: `<= ${gateSettings.maxHighIssues}`,
      actual: `${highCount}`,
      passed: highCount <= gateSettings.maxHighIssues,
    },
    {
      rule: 'Data Completeness Threshold',
      target: `>= ${gateSettings.minCompleteness}%`,
      actual: `${avgCompleteness}%`,
      passed: avgCompleteness >= gateSettings.minCompleteness,
    },
    {
      rule: 'Data Validity Threshold',
      target: `>= ${gateSettings.minValidity}%`,
      actual: `${avgValidity}%`,
      passed: avgValidity >= gateSettings.minValidity,
    },
    {
      rule: 'Reconciliation Match Rate',
      target: `>= ${gateSettings.minReconciliationRate}%`,
      actual: `${actualReconRate}%`,
      passed: actualReconRate >= gateSettings.minReconciliationRate,
    },
    {
      rule: 'Duplicate Candidate Rate',
      target: `<= ${gateSettings.maxDuplicateRate}%`,
      actual: `${dupRate}%`,
      passed: dupRate <= gateSettings.maxDuplicateRate,
    },
  ];

  const failedGates = gateEvaluations.filter((g) => !g.passed);

  let readinessStatus: 'READY' | 'READY WITH WARNINGS' | 'NOT READY' = 'READY';
  if (criticalCount > gateSettings.maxCriticalIssues || failedGates.length >= 3) {
    readinessStatus = 'NOT READY';
  } else if (failedGates.length > 0 || highCount > gateSettings.maxHighIssues) {
    readinessStatus = 'READY WITH WARNINGS';
  }

  const passedGatesCount = gateEvaluations.filter((g) => g.passed).length;
  const readinessScore = Math.round((passedGatesCount / gateEvaluations.length) * 100);

  return {
    radarMetrics,
    overallQualityScore,
    readinessStatus,
    readinessScore,
    gateEvaluations,
  };
}
