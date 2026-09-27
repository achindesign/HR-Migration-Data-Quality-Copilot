import {
  EmployeeRecord,
  ValidationIssue,
  ValidationRule,
  FieldScorecard,
  IssueSeverity,
} from '../types';
import { VALID_DEPARTMENTS } from '../data/demoData';

export const DEFAULT_RULES: ValidationRule[] = [
  {
    id: 'R-REQ-01',
    field: 'Employee_ID',
    name: 'Required Employee ID',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'Critical',
    description: 'Every employee record must have an Employee_ID.',
    message: 'Employee_ID cannot be null or empty.',
    enabled: true,
  },
  {
    id: 'R-REQ-02',
    field: 'First_Name',
    name: 'Required First Name',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'High',
    description: 'Legal first name is mandatory for payroll and tax filings.',
    message: 'First_Name cannot be null or empty.',
    enabled: true,
  },
  {
    id: 'R-REQ-03',
    field: 'Last_Name',
    name: 'Required Last Name',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'High',
    description: 'Legal last name is mandatory for payroll and compliance.',
    message: 'Last_Name cannot be null or empty.',
    enabled: true,
  },
  {
    id: 'R-REQ-04',
    field: 'Email',
    name: 'Required Email Address',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'Critical',
    description: 'Workday worker provisioning requires a primary email address for SSO account generation.',
    message: 'Email address is missing.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-FMT-01',
    field: 'Email',
    name: 'Valid Email Format',
    category: 'Validity',
    operator: 'valid_email',
    severity: 'Critical',
    description: 'Email must conform to RFC 5322 format standard.',
    message: 'Email address contains invalid format or illegal characters.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-REQ-05',
    field: 'Hire_Date',
    name: 'Required Hire Date',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'Critical',
    description: 'Hire date anchors seniority, benefits eligibility, and leave accruals.',
    message: 'Hire_Date cannot be null.',
    enabled: true,
  },
  {
    id: 'R-REQ-06',
    field: 'Employment_Status',
    name: 'Required Employment Status',
    category: 'Completeness',
    operator: 'not_null',
    severity: 'Critical',
    description: 'Employment status directs worker life-cycle provisioning in Workday.',
    message: 'Employment_Status cannot be null.',
    enabled: true,
  },
  {
    id: 'R-BIZ-01',
    field: 'Termination_Date',
    name: 'Termination After Hire Date',
    category: 'Business Rule',
    operator: 'term_after_hire',
    severity: 'Critical',
    description: 'Termination date must be chronologically after the Hire Date.',
    message: 'Termination_Date cannot be before Hire_Date.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-BIZ-02',
    field: 'Termination_Date',
    name: 'Active Status Termination Check',
    category: 'Consistency',
    operator: 'custom',
    severity: 'High',
    description: 'Active employees should not have a past termination date recorded.',
    message: 'Employee is marked as Active but possesses a historical Termination_Date.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-BIZ-03',
    field: 'Termination_Date',
    name: 'Terminated Status Requires Termination Date',
    category: 'Completeness',
    operator: 'custom',
    severity: 'High',
    description: 'Terminated employees must record a valid Termination Date for severance and COBRA tracking.',
    message: 'Employee is marked as Terminated but has no Termination_Date specified.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-BIZ-04',
    field: 'Salary',
    name: 'Positive Numeric Compensation',
    category: 'Validity',
    operator: 'positive_number',
    severity: 'Critical',
    description: 'Employee compensation must be a positive numeric value.',
    message: 'Salary must be a positive number greater than 0.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-BIZ-05',
    field: 'Currency',
    name: 'Valid ISO Currency Code',
    category: 'Validity',
    operator: 'valid_currency',
    severity: 'Medium',
    description: 'Currency must adhere to standard ISO-4217 currency identifiers (USD, CAD, GBP, EUR).',
    message: 'Currency contains unrecognized or malformed currency identifier.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-INT-01',
    field: 'Manager_ID',
    name: 'Referential Manager Hierarchy Check',
    category: 'Referential Integrity',
    operator: 'ref_manager_exists',
    severity: 'Critical',
    description: 'Manager_ID must reference an existing active employee in the roster to prevent supervisory org break.',
    message: 'Manager_ID does not exist in employee roster.',
    enabled: true,
    canAutoFix: true,
  },
  {
    id: 'R-INT-02',
    field: 'Department_ID',
    name: 'Department Reference Integrity',
    category: 'Referential Integrity',
    operator: 'ref_department_exists',
    severity: 'Critical',
    description: 'Department_ID must exist in the enterprise department reference table.',
    message: 'Department_ID is invalid or references an unmapped deprecated department code.',
    enabled: true,
    canAutoFix: true,
  },
];

const VALID_CURRENCIES = new Set(['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'SGD', 'CHF']);

export function runValidationRules(
  records: EmployeeRecord[],
  rules: ValidationRule[] = DEFAULT_RULES
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const empIdSet = new Set<string>();

  for (const r of records) {
    if (r.Employee_ID) {
      empIdSet.add(r.Employee_ID.trim());
    }
  }

  // Track emails for duplicates
  const emailCounts = new Map<string, string[]>();
  for (const r of records) {
    if (r.Email && r.Email.trim()) {
      const normalized = r.Email.trim().toLowerCase();
      if (!emailCounts.has(normalized)) {
        emailCounts.set(normalized, []);
      }
      emailCounts.get(normalized)!.push(r.Employee_ID);
    }
  }

  let issueCounter = 1;

  for (const r of records) {
    const fullName = `${r.First_Name || ''} ${r.Last_Name || ''}`.trim() || r.Employee_ID;

    // Check duplicate emails
    if (r.Email && r.Email.trim()) {
      const normalized = r.Email.trim().toLowerCase();
      const duplicateWith = emailCounts.get(normalized);
      if (duplicateWith && duplicateWith.length > 1 && duplicateWith[0] !== r.Employee_ID) {
        issues.push({
          id: `ISS-${String(issueCounter++).padStart(5, '0')}`,
          recordId: r.Employee_ID,
          employeeName: fullName,
          field: 'Email',
          category: 'Uniqueness',
          severity: 'High',
          ruleName: 'Unique Email Address',
          message: `Email '${r.Email}' is shared with another employee (${duplicateWith.filter(id => id !== r.Employee_ID).join(', ')}).`,
          rawValue: r.Email,
          suggestedFix: `Deduplicate email or append employee ID: ${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}.${r.Employee_ID.slice(-4)}@enterprise-demo.corp`,
          remediationValue: `${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}.${r.Employee_ID.slice(-4)}@enterprise-demo.corp`,
          canAutoFix: true,
          status: 'OPEN',
        });
      }
    }

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let hasViolation = false;
      let rawVal = r[rule.field];
      let suggestedFix: string | undefined;
      let remediationValue: any = undefined;

      switch (rule.operator) {
        case 'not_null': {
          if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
            hasViolation = true;
            if (rule.field === 'Email') {
              suggestedFix = `Generate corporate email from employee name: ${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}@enterprise-demo.corp`;
              remediationValue = `${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}@enterprise-demo.corp`;
            }
          }
          break;
        }

        case 'valid_email': {
          if (rawVal && String(rawVal).trim() !== '') {
            const emailStr = String(rawVal).trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailStr)) {
              hasViolation = true;
              suggestedFix = `Clean malformed email to standard format: ${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}@enterprise-demo.corp`;
              remediationValue = `${r.First_Name.toLowerCase()}.${r.Last_Name.toLowerCase()}@enterprise-demo.corp`;
            }
          }
          break;
        }

        case 'positive_number': {
          const num = Number(rawVal);
          if (rawVal !== undefined && rawVal !== null && (isNaN(num) || num <= 0)) {
            hasViolation = true;
            suggestedFix = num < 0 ? `Invert sign to positive value: $${Math.abs(num).toLocaleString()}` : `Assign default department band midpoint salary ($85,000)`;
            remediationValue = num < 0 ? Math.abs(num) : 85000;
          }
          break;
        }

        case 'valid_currency': {
          if (rawVal) {
            const currStr = String(rawVal).trim().toUpperCase();
            if (!VALID_CURRENCIES.has(currStr)) {
              hasViolation = true;
              const defaultCurr = r.Location_Code === 'LOC-LON' ? 'GBP' : r.Location_Code === 'LOC-TOR' ? 'CAD' : 'USD';
              suggestedFix = `Normalize invalid currency '${currStr}' to location default currency (${defaultCurr})`;
              remediationValue = defaultCurr;
            }
          }
          break;
        }

        case 'term_after_hire': {
          if (r.Employment_Status === 'Terminated' && r.Termination_Date && r.Hire_Date) {
            const term = new Date(r.Termination_Date).getTime();
            const hire = new Date(r.Hire_Date).getTime();
            if (term < hire) {
              hasViolation = true;
              // Set termination to hire date + 1 year
              const hireD = new Date(r.Hire_Date);
              hireD.setFullYear(hireD.getFullYear() + 2);
              const fixDate = hireD.toISOString().slice(0, 10);
              suggestedFix = `Adjust invalid termination date to post-hire timestamp (${fixDate})`;
              remediationValue = fixDate;
            }
          }
          break;
        }

        case 'ref_manager_exists': {
          if (r.Manager_ID && r.Manager_ID.trim() !== '') {
            const mgr = r.Manager_ID.trim();
            if (!empIdSet.has(mgr)) {
              hasViolation = true;
              suggestedFix = `Reassign orphan Manager_ID to Department Executive (PS-10001)`;
              remediationValue = 'PS-10001';
            }
          }
          break;
        }

        case 'ref_department_exists': {
          if (r.Department_ID) {
            const deptId = r.Department_ID.trim();
            if (!VALID_DEPARTMENTS[deptId]) {
              hasViolation = true;
              suggestedFix = `Remap deprecated code '${deptId}' to standard Supervisory Org 'Technology & Infrastructure' (D-104)`;
              remediationValue = 'D-104';
            }
          }
          break;
        }

        case 'custom': {
          if (rule.id === 'R-BIZ-02') {
            // Active with past termination date
            if (r.Employment_Status === 'Active' && r.Termination_Date) {
              const term = new Date(r.Termination_Date).getTime();
              const now = new Date('2026-09-01').getTime();
              if (term < now) {
                hasViolation = true;
                suggestedFix = `Clear erroneous Termination_Date on Active employee profile`;
                remediationValue = '';
              }
            }
          } else if (rule.id === 'R-BIZ-03') {
            // Terminated without termination date
            if (r.Employment_Status === 'Terminated' && (!r.Termination_Date || r.Termination_Date.trim() === '')) {
              hasViolation = true;
              suggestedFix = `Set standard default termination date (e.g. 2024-12-31)`;
              remediationValue = '2024-12-31';
            }
          }
          break;
        }
      }

      if (hasViolation) {
        issues.push({
          id: `ISS-${String(issueCounter++).padStart(5, '0')}`,
          recordId: r.Employee_ID,
          employeeName: fullName,
          field: rule.field,
          category: rule.category,
          severity: rule.severity,
          ruleName: rule.name,
          message: rule.message,
          rawValue: rawVal,
          suggestedFix,
          remediationValue,
          canAutoFix: rule.canAutoFix ?? !!suggestedFix,
          status: 'OPEN',
        });
      }
    }
  }

  return issues;
}

export function calculateFieldScorecards(
  records: EmployeeRecord[],
  issues: ValidationIssue[]
): FieldScorecard[] {
  if (records.length === 0) return [];

  const fieldsToCheck = [
    'Employee_ID',
    'First_Name',
    'Last_Name',
    'Email',
    'Phone',
    'Department_ID',
    'Job_Code',
    'Manager_ID',
    'Employment_Status',
    'Hire_Date',
    'Termination_Date',
    'Salary',
    'Currency',
    'Cost_Center',
  ];

  const total = records.length;

  return fieldsToCheck.map((field) => {
    let nullCount = 0;
    let duplicateCount = 0;
    const valueSet = new Set<string>();

    for (const r of records) {
      const val = r[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        nullCount++;
      } else {
        const sVal = String(val).trim().toLowerCase();
        if (valueSet.has(sVal)) {
          duplicateCount++;
        } else {
          valueSet.add(sVal);
        }
      }
    }

    const fieldIssues = issues.filter((i) => i.field === field);
    const criticalIssues = fieldIssues.filter((i) => i.severity === 'Critical').length;
    const issueCount = fieldIssues.length;

    const completeness = Math.max(0, Math.round(((total - nullCount) / total) * 1000) / 10);
    const validity = Math.max(
      0,
      Math.round(((total - fieldIssues.filter((i) => i.category === 'Validity').length) / total) * 1000) / 10
    );
    const uniqueness = Math.max(0, Math.round(((total - duplicateCount) / total) * 1000) / 10);
    const consistency = Math.max(
      0,
      Math.round(((total - fieldIssues.filter((i) => i.category === 'Consistency' || i.category === 'Referential Integrity').length) / total) * 1000) / 10
    );

    // Weighted overall score
    const overallScore = Math.round(
      (completeness * 0.3 + validity * 0.3 + uniqueness * 0.15 + consistency * 0.25) * 10
    ) / 10;

    return {
      field,
      completeness,
      validity,
      uniqueness,
      consistency,
      overallScore,
      issueCount,
      criticalIssues,
    };
  });
}
