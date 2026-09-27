export interface EmployeeRecord {
  Employee_ID: string;
  Employee_Number: string;
  First_Name: string;
  Last_Name: string;
  Preferred_Name: string;
  Date_of_Birth: string;
  Gender: string;
  Email: string;
  Phone: string;
  Department_ID: string;
  Department_Name: string;
  Job_Code: string;
  Job_Title: string;
  Manager_ID: string;
  Location_Code: string;
  Location_Name: string;
  Employment_Status: 'Active' | 'Terminated' | 'Leave' | 'Suspended';
  Hire_Date: string;
  Termination_Date?: string;
  Salary: number;
  Currency: string;
  Pay_Group: string;
  Business_Unit: string;
  Cost_Center: string;
  Worker_Type: 'Regular' | 'Contractor' | 'Temporary' | 'Executive';
  Company_Code: string;
  [key: string]: any;
}

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueStatus = 'OPEN' | 'UNDER REVIEW' | 'REMEDIATION REQUIRED' | 'ACCEPTED' | 'RESOLVED';
export type RuleCategory =
  | 'Completeness'
  | 'Validity'
  | 'Uniqueness'
  | 'Consistency'
  | 'Referential Integrity'
  | 'Business Rule'
  | 'Transformation'
  | 'Security'
  | 'AI Anomaly';

export interface ValidationIssue {
  id: string;
  recordId: string;
  employeeName?: string;
  field: string;
  category: RuleCategory;
  severity: IssueSeverity;
  ruleName: string;
  message: string;
  rawValue?: any;
  suggestedFix?: string;
  remediationValue?: any;
  canAutoFix?: boolean;
  status: IssueStatus;
  assignedTo?: string;
  comments?: { user: string; text: string; timestamp: string }[];
  aiExplanation?: string;
  confidence?: number;
}

export interface FieldProfile {
  field: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'email';
  totalCount: number;
  nullCount: number;
  nullPercent: number;
  distinctCount: number;
  distinctPercent: number;
  duplicateCount: number;
  min?: string | number;
  max?: string | number;
  avg?: number;
  sampleValues: any[];
  topValues: { value: string; count: number; percentage: number }[];
}

export interface FieldScorecard {
  field: string;
  completeness: number;
  validity: number;
  uniqueness: number;
  consistency: number;
  overallScore: number;
  issueCount: number;
  criticalIssues: number;
}

export type ReconStatus =
  | 'MATCHED'
  | 'EXPECTED TRANSFORMATION'
  | 'MISMATCH'
  | 'MISSING IN TARGET'
  | 'EXTRA IN TARGET'
  | 'REQUIRES REVIEW';

export interface ReconDiff {
  field: string;
  sourceValue: any;
  targetValue: any;
  isExpectedTransformation?: boolean;
  notes?: string;
}

export interface ReconciliationRecord {
  employeeId: string;
  name: string;
  status: ReconStatus;
  sourceRecord?: EmployeeRecord;
  targetRecord?: EmployeeRecord;
  diffs: ReconDiff[];
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  mappingType: '1:1' | '1:N' | 'N:1' | 'Transformation' | 'Unmapped' | 'Target Only';
  confidence: number;
  transformationRequired: boolean;
  risk: 'Low' | 'Medium' | 'High';
  explanation: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface DuplicateCandidate {
  id: string;
  primaryRecord: EmployeeRecord;
  matchedRecord: EmployeeRecord;
  confidence: number;
  matchFactors: string[];
  status: 'PENDING' | 'MERGE_PLANNED' | 'DISMISSED';
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface ValidationRule {
  id: string;
  field: string;
  name: string;
  category: RuleCategory;
  operator:
    | 'not_null'
    | 'valid_email'
    | 'valid_phone'
    | 'numeric'
    | 'positive_number'
    | 'valid_date'
    | 'date_not_future'
    | 'term_after_hire'
    | 'valid_currency'
    | 'ref_manager_exists'
    | 'ref_department_exists'
    | 'regex'
    | 'custom';
  value?: string;
  severity: IssueSeverity;
  description: string;
  message: string;
  enabled: boolean;
  canAutoFix?: boolean;
}

export interface SQLCheckItem {
  id: string;
  name: string;
  sql: string;
  category: string;
  severity: IssueSeverity;
  recordsAffected: number;
  affectedIds: string[];
  status: 'PASS' | 'FAIL';
  explanation: string;
}

export interface AIAnomalyItem {
  id: string;
  issue: string;
  whyDetected: string;
  affectedRecords: string[];
  confidence: number;
  severity: IssueSeverity;
  recommendedAction: string;
  category: string;
}

export interface RiskRadarMetric {
  name: string;
  key: string;
  score: number; // 0 to 100 where 100 is best quality / lowest risk
  riskLabel: 'Low' | 'Moderate' | 'High' | 'Critical';
  affectedCount: number;
  description: string;
}

export interface MigrationGateSettings {
  maxCriticalIssues: number;
  maxHighIssues: number;
  minCompleteness: number;
  minValidity: number;
  minReconciliationRate: number;
  maxDuplicateRate: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  recordId?: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  note?: string;
  qualityScore?: number;
}

export interface TestCaseItem {
  id: string;
  scenario: string;
  precondition: string;
  testData: string;
  expectedResult: string;
  validationQuery: string;
  priority: 'P1' | 'P2' | 'P3';
}

export interface UATItem {
  id: string;
  testScenario: string;
  expectedResult: string;
  businessOwner: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Passed' | 'Failed' | 'In Progress';
}

export type MigrationScenarioId =
  | 'wave1-baseline'
  | 'golden-cutover'
  | 'legacy-ma'
  | 'regional-expansion'
  | 'exec-payroll';

export interface MigrationScenario {
  id: MigrationScenarioId;
  name: string;
  shortName: string;
  tagline: string;
  expectedReadiness: 'READY' | 'READY WITH WARNINGS' | 'NOT READY';
  expectedQualityScore: string;
  sourceCount: number;
  targetCount: number;
  sourceSystem: string;
  targetSystem: string;
  description: string;
  badgeColor: string;
  keyCharacteristics: string[];
  recommendedAction: string;
  generateData: () => {
    sourceRecords: EmployeeRecord[];
    targetRecords: EmployeeRecord[];
    mappings?: FieldMapping[];
    auditLogs?: AuditLogItem[];
  };
}
