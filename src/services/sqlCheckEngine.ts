import { EmployeeRecord, SQLCheckItem } from '../types';
import { VALID_DEPARTMENTS } from '../data/demoData';

export function runSQLChecks(records: EmployeeRecord[]): SQLCheckItem[] {
  const empIds = new Set(records.map((r) => r.Employee_ID).filter(Boolean));
  const validDeptCodes = new Set(Object.keys(VALID_DEPARTMENTS));

  // 1. Employee_ID is null
  const nullEmpIds = records.filter(
    (r) => !r.Employee_ID || String(r.Employee_ID).trim() === ''
  );

  // 2. Duplicate emails
  const emailMap = new Map<string, string[]>();
  for (const r of records) {
    if (r.Email && r.Email.trim()) {
      const emailNorm = r.Email.trim().toLowerCase();
      if (!emailMap.has(emailNorm)) {
        emailMap.set(emailNorm, []);
      }
      emailMap.get(emailNorm)!.push(r.Employee_ID);
    }
  }
  const duplicateEmailEmpIds: string[] = [];
  for (const [_email, ids] of emailMap.entries()) {
    if (ids.length > 1) {
      duplicateEmailEmpIds.push(...ids);
    }
  }

  // 3. Hire_Date > Termination_Date
  const invalidDateSequence = records.filter((r) => {
    if (r.Hire_Date && r.Termination_Date) {
      return new Date(r.Hire_Date).getTime() > new Date(r.Termination_Date).getTime();
    }
    return false;
  });

  // 4. Manager_ID not in employees
  const orphanManagers = records.filter((r) => {
    if (!r.Manager_ID || r.Manager_ID.trim() === '') return false;
    return !empIds.has(r.Manager_ID.trim());
  });

  // 5. Department_ID not in departments reference
  const invalidDepartments = records.filter((r) => {
    if (!r.Department_ID) return true;
    return !validDeptCodes.has(r.Department_ID.trim());
  });

  // 6. Salary <= 0 OR Salary IS NULL
  const invalidSalaries = records.filter((r) => {
    const s = Number(r.Salary);
    return isNaN(s) || s <= 0;
  });

  // 7. Terminated employees with no Termination_Date
  const missingTermDate = records.filter(
    (r) => r.Employment_Status === 'Terminated' && (!r.Termination_Date || r.Termination_Date.trim() === '')
  );

  // 8. Malformed Email (Regex / LIKE '%@%.%')
  const malformedEmails = records.filter((r) => {
    if (!r.Email || r.Email.trim() === '') return false; // Handled by completeness
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.Email.trim());
  });

  // 9. Invalid Currencies
  const validCurrencies = new Set(['USD', 'CAD', 'GBP', 'EUR']);
  const invalidCurrencies = records.filter((r) => {
    if (!r.Currency) return true;
    return !validCurrencies.has(r.Currency.trim().toUpperCase());
  });

  // 10. Active status with historical termination date
  const activeWithTermDate = records.filter((r) => {
    if (r.Employment_Status === 'Active' && r.Termination_Date) {
      return new Date(r.Termination_Date).getTime() < new Date('2026-09-01').getTime();
    }
    return false;
  });

  return [
    {
      id: 'SQL-01',
      name: 'Mandatory Primary Key Check',
      sql: `SELECT Employee_ID FROM employees WHERE Employee_ID IS NULL;`,
      category: 'Completeness',
      severity: 'Critical',
      recordsAffected: nullEmpIds.length,
      affectedIds: nullEmpIds.map((r) => r.Employee_ID || 'UNNAMED'),
      status: nullEmpIds.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Verifies no worker records are missing their mandatory unique primary key in the migration payload.',
    },
    {
      id: 'SQL-02',
      name: 'Duplicate Email Address Grouping',
      sql: `SELECT Email, COUNT(*) FROM employees GROUP BY Email HAVING COUNT(*) > 1;`,
      category: 'Uniqueness',
      severity: 'High',
      recordsAffected: duplicateEmailEmpIds.length,
      affectedIds: Array.from(new Set(duplicateEmailEmpIds)),
      status: duplicateEmailEmpIds.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Groups workers by Email to flag collisions that would break Single Sign-On (SSO) account creation.',
    },
    {
      id: 'SQL-03',
      name: 'Employment Timeline Chronology',
      sql: `SELECT * FROM employees WHERE Hire_Date > Termination_Date;`,
      category: 'Business Rule',
      severity: 'Critical',
      recordsAffected: invalidDateSequence.length,
      affectedIds: invalidDateSequence.map((r) => r.Employee_ID),
      status: invalidDateSequence.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Enforces business logic that worker separation cannot occur prior to initial hire.',
    },
    {
      id: 'SQL-04',
      name: 'Supervisory Org Referential Integrity',
      sql: `SELECT Employee_ID FROM employees WHERE Manager_ID NOT IN (SELECT Employee_ID FROM employees);`,
      category: 'Referential Integrity',
      severity: 'Critical',
      recordsAffected: orphanManagers.length,
      affectedIds: orphanManagers.map((r) => r.Employee_ID),
      status: orphanManagers.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Identifies workers whose direct manager is not present in the master dataset, which will break Workday supervisory org trees.',
    },
    {
      id: 'SQL-05',
      name: 'Department Cross-Reference Lookup',
      sql: `SELECT Department_ID FROM employees WHERE Department_ID NOT IN (SELECT Department_ID FROM departments);`,
      category: 'Referential Integrity',
      severity: 'Critical',
      recordsAffected: invalidDepartments.length,
      affectedIds: invalidDepartments.map((r) => r.Employee_ID),
      status: invalidDepartments.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Finds employees assigned to deprecated or non-existent legacy department codes missing from Workday supervisory org mapping.',
    },
    {
      id: 'SQL-06',
      name: 'Non-Positive Compensation Validation',
      sql: `SELECT Employee_ID, Salary FROM employees WHERE Salary <= 0 OR Salary IS NULL;`,
      category: 'Validity',
      severity: 'Critical',
      recordsAffected: invalidSalaries.length,
      affectedIds: invalidSalaries.map((r) => r.Employee_ID),
      status: invalidSalaries.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Detects zero, negative, or blank salaries which would halt Workday Compensation Step Ingestion.',
    },
    {
      id: 'SQL-07',
      name: 'Terminated Worker Separation Completeness',
      sql: `SELECT Employee_ID FROM employees WHERE Employment_Status = 'Terminated' AND Termination_Date IS NULL;`,
      category: 'Completeness',
      severity: 'High',
      recordsAffected: missingTermDate.length,
      affectedIds: missingTermDate.map((r) => r.Employee_ID),
      status: missingTermDate.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Ensures all terminated employees possess an official separation date for compliance and severance auditing.',
    },
    {
      id: 'SQL-08',
      name: 'RFC 5322 Email Syntax Pattern',
      sql: `SELECT Employee_ID, Email FROM employees WHERE Email NOT LIKE '%@%.%';`,
      category: 'Validity',
      severity: 'Critical',
      recordsAffected: malformedEmails.length,
      affectedIds: malformedEmails.map((r) => r.Employee_ID),
      status: malformedEmails.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Matches email addresses against standard domain pattern to prevent delivery and authentication failures.',
    },
    {
      id: 'SQL-09',
      name: 'ISO Currency Code Validation',
      sql: `SELECT Employee_ID, Currency FROM employees WHERE Currency NOT IN ('USD', 'CAD', 'GBP', 'EUR');`,
      category: 'Validity',
      severity: 'Medium',
      recordsAffected: invalidCurrencies.length,
      affectedIds: invalidCurrencies.map((r) => r.Employee_ID),
      status: invalidCurrencies.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Restricts currencies to sanctioned operational currencies for North America and EMEA payroll groups.',
    },
    {
      id: 'SQL-10',
      name: 'Active Status Historical Termination Anomaly',
      sql: `SELECT Employee_ID FROM employees WHERE Employment_Status = 'Active' AND Termination_Date IS NOT NULL;`,
      category: 'Consistency',
      severity: 'High',
      recordsAffected: activeWithTermDate.length,
      affectedIds: activeWithTermDate.map((r) => r.Employee_ID),
      status: activeWithTermDate.length === 0 ? 'PASS' : 'FAIL',
      explanation: 'Flags employees who are flagged active but retain an expired separation date from earlier contract stints.',
    },
  ];
}
