import { EmployeeRecord, FieldMapping, AuditLogItem, MigrationScenario, MigrationScenarioId } from '../types';

export const VALID_DEPARTMENTS: Record<string, string> = {
  'D-101': 'Engineering & Product Development',
  'D-102': 'People Operations & Talent',
  'D-103': 'Global Sales & Customer Success',
  'D-104': 'Technology & Infrastructure Operations',
  'D-201': 'Corporate Finance & Treasury',
  'D-301': 'Legal, Compliance & Risk',
  'D-302': 'Field Operations & Logistics',
  'D-401': 'Marketing & Brand Experience',
};

export const WORKDAY_SUPERVISORY_ORGS: Record<string, string> = {
  'D-101': 'Engineering & Product (SO-101)',
  'D-102': 'People Experience (SO-102)',
  'D-103': 'Commercial Sales (SO-103)',
  'D-104': 'Technology Infrastructure Ops (SO-104)',
  'D-201': 'Finance & Accounting (SO-201)',
  'D-301': 'Legal & Governance (SO-301)',
  'D-302': 'Global Logistics (SO-302)',
  'D-401': 'Global Marketing (SO-401)',
};

export const JOB_CODES: Record<string, string> = {
  'JC-1001': 'Staff Software Engineer',
  'JC-1002': 'Senior Product Manager',
  'JC-1003': 'Engineering Director',
  'JC-1004': 'DevOps Lead',
  'JC-1005': 'QA Automation Architect',
  'JC-2001': 'Senior HRBP',
  'JC-2002': 'Talent Acquisition Partner',
  'JC-3001': 'Enterprise Account Executive',
  'JC-3002': 'Customer Success Manager',
  'JC-4001': 'Security Operations Analyst',
  'JC-5001': 'Senior Financial Analyst',
  'JC-5002': 'Payroll & Tax Specialist',
  'JC-6001': 'Corporate Legal Counsel',
  'JC-7001': 'Logistics Coordinator',
};

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
  'Timothy', 'Stephanie', 'Ronald', 'Rebecca', 'Jason', 'Sharon', 'Edward', 'Laura',
  'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen', 'Jacob', 'Amy', 'Gary', 'Shirley',
  'Nicholas', 'Angela', 'Eric', 'Helen', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Nicole', 'Scott', 'Emma', 'Brandon', 'Samantha',
  'Benjamin', 'Katherine', 'Samuel', 'Christine', 'Gregory', 'Debra', 'Alexander', 'Rachel',
  'Patrick', 'Catherine', 'Frank', 'Carolyn', 'Raymond', 'Janet', 'Jack', 'Ruth',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Virginia'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster'
];

const LOCATIONS = [
  { code: 'LOC-NY', name: 'New York HQ' },
  { code: 'LOC-SF', name: 'San Francisco Tech Center' },
  { code: 'LOC-CHI', name: 'Chicago Regional Hub' },
  { code: 'LOC-LON', name: 'London EMEA Office' },
  { code: 'LOC-TOR', name: 'Toronto Americas' },
  { code: 'LOC-SGP', name: 'Singapore APAC' },
];

/**
 * Deterministic pseudo-random generator
 */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// =========================================================================
// SCENARIO 1: Baseline Staging Wave 1 (PeopleSoft -> Workday)
// Result: NOT READY (Pre-Remediation: 10 critical issues, ~82% quality score)
// =========================================================================
export function generateWave1Baseline(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const sourceRecords: EmployeeRecord[] = [];
  const targetRecords: EmployeeRecord[] = [];

  const deptKeys = Object.keys(VALID_DEPARTMENTS);
  const jobKeys = Object.keys(JOB_CODES);

  for (let i = 1; i <= 500; i++) {
    const seed = i * 1337;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);
    const r5 = pseudoRandom(seed + 4);

    const empId = `PS-${10000 + i}`;
    const empNum = `10${String(i).padStart(4, '0')}`;
    const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const prefName = r1 > 0.85 ? `${firstName.slice(0, 3)}` : firstName;
    const gender = r2 > 0.5 ? 'Female' : 'Male';

    const birthYear = 1968 + Math.floor(r3 * 34);
    const birthMonth = String(1 + Math.floor(r4 * 12)).padStart(2, '0');
    const birthDay = String(1 + Math.floor(r5 * 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const hireYear = 2012 + Math.floor(r1 * 12);
    const hireMonth = String(1 + Math.floor(r2 * 12)).padStart(2, '0');
    const hireDay = String(1 + Math.floor(r3 * 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const loc = LOCATIONS[i % LOCATIONS.length];
    const deptId = deptKeys[i % deptKeys.length];
    const deptName = VALID_DEPARTMENTS[deptId];
    const jobCode = jobKeys[i % jobKeys.length];
    const jobTitle = JOB_CODES[jobCode];

    let managerId = 'PS-10001';
    if (i <= 5) {
      managerId = '';
    } else if (i <= 30) {
      managerId = `PS-${10000 + (1 + (i % 5))}`;
    } else {
      managerId = `PS-${10000 + (6 + (i % 24))}`;
    }

    const isTerminated = i % 25 === 0;
    const termYear = hireYear + 2;
    let termDate: string | undefined = isTerminated ? `${termYear}-06-30` : undefined;

    let salary = Math.round((65000 + r4 * 95000) / 1000) * 1000;
    let currency = loc.code === 'LOC-LON' ? 'GBP' : loc.code === 'LOC-TOR' ? 'CAD' : 'USD';
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@enterprise-demo.corp`;
    let phone = `+1-555-${String(1000 + (i % 9000))}`;
    let employmentStatus: EmployeeRecord['Employment_Status'] = isTerminated ? 'Terminated' : 'Active';

    // Intentional realistic migration issues
    if (i === 22 || i === 145) email = '';
    if (i === 65) email = `${firstName.toLowerCase()}@@enterprise-demo.corp`;
    if (i === 210) email = `${firstName.toLowerCase()} ${lastName.toLowerCase()}@enterprise`;
    if (i === 80) email = sourceRecords[39]?.Email || 'john.smith@enterprise-demo.corp';
    if (i === 99 || i === 255 || i === 340 || i === 410) managerId = 'PS-99999';
    if (i === 50) {
      employmentStatus = 'Terminated';
      termDate = '2010-01-15';
    }
    if (i === 75 || i === 180) {
      employmentStatus = 'Active';
      termDate = '2023-04-12';
    }
    if (i === 120 || i === 290) {
      employmentStatus = 'Terminated';
      termDate = undefined;
    }
    if (i === 67) salary = 18500;
    if (i === 333) salary = -52000;
    if (i === 155) currency = 'USDD';

    let actualDeptId = deptId;
    let actualDeptName = deptName;
    if (i === 88 || i === 235) {
      actualDeptId = 'D-998';
      actualDeptName = 'Unassigned Global Operations Pool';
    }

    let actualFirstName = firstName;
    let actualLastName = lastName;
    let actualDob = dob;
    let actualPhone = phone;

    if (i === 488 && sourceRecords[11]) {
      actualFirstName = 'Jon';
      actualLastName = sourceRecords[11].Last_Name;
      actualDob = sourceRecords[11].Date_of_Birth;
      actualPhone = sourceRecords[11].Phone;
      email = `j.smith84@enterprise-demo.corp`;
    }

    const sourceRecord: EmployeeRecord = {
      Employee_ID: empId,
      Employee_Number: empNum,
      First_Name: actualFirstName,
      Last_Name: actualLastName,
      Preferred_Name: prefName,
      Date_of_Birth: actualDob,
      Gender: gender,
      Email: email,
      Phone: actualPhone,
      Department_ID: actualDeptId,
      Department_Name: actualDeptName,
      Job_Code: jobCode,
      Job_Title: jobTitle,
      Manager_ID: managerId,
      Location_Code: loc.code,
      Location_Name: loc.name,
      Employment_Status: employmentStatus,
      Hire_Date: hireDate,
      Termination_Date: termDate,
      Salary: salary,
      Currency: currency,
      Pay_Group: `${loc.code}_EXEC_MONTHLY`,
      Business_Unit: 'BU-GLOBAL',
      Cost_Center: `CC-${actualDeptId.replace('D-', '')}00`,
      Worker_Type: i % 18 === 0 ? 'Contractor' : 'Regular',
      Company_Code: 'CMP-100',
    };

    sourceRecords.push(sourceRecord);
  }

  for (let i = 0; i < 495; i++) {
    const src = sourceRecords[i];
    const wdDeptName = WORKDAY_SUPERVISORY_ORGS[src.Department_ID] || src.Department_Name;

    let wdJobTitle = src.Job_Title;
    if (src.Job_Code === 'JC-1004') wdJobTitle = 'Cloud Platform Lead';
    if (src.Employee_ID === 'PS-10093') wdJobTitle = 'Cloud Engineer I';

    const targetRecord: EmployeeRecord = {
      ...src,
      Department_Name: wdDeptName,
      Job_Title: wdJobTitle,
      Cost_Center: `WD-CC-${src.Cost_Center.replace('CC-', '')}`,
    };

    if (src.Employee_ID === 'PS-10115') {
      targetRecord.Pay_Group = 'US_EXEC_BIWEEKLY_ERRONEOUS';
    }

    targetRecords.push(targetRecord);
  }

  targetRecords.push({
    Employee_ID: 'WD-90001',
    Employee_Number: '900001',
    First_Name: 'Marcus',
    Last_Name: 'Vance',
    Preferred_Name: 'Marcus',
    Date_of_Birth: '1989-11-20',
    Gender: 'Male',
    Email: 'marcus.vance@enterprise-demo.corp',
    Phone: '+1-555-9011',
    Department_ID: 'D-101',
    Department_Name: 'Engineering & Product (SO-101)',
    Job_Code: 'JC-1001',
    Job_Title: 'Staff Software Engineer',
    Manager_ID: 'PS-10003',
    Location_Code: 'LOC-SF',
    Location_Name: 'San Francisco Tech Center',
    Employment_Status: 'Active',
    Hire_Date: '2026-08-01',
    Salary: 165000,
    Currency: 'USD',
    Pay_Group: 'LOC-SF_EXEC_MONTHLY',
    Business_Unit: 'BU-GLOBAL',
    Cost_Center: 'WD-CC-10100',
    Worker_Type: 'Contractor',
    Company_Code: 'CMP-100',
  });

  targetRecords.push({
    Employee_ID: 'WD-90002',
    Employee_Number: '900002',
    First_Name: 'Elena',
    Last_Name: 'Rostova',
    Preferred_Name: 'Elena',
    Date_of_Birth: '1992-03-14',
    Gender: 'Female',
    Email: 'elena.rostova@enterprise-demo.corp',
    Phone: '+1-555-9012',
    Department_ID: 'D-401',
    Department_Name: 'Global Marketing (SO-401)',
    Job_Code: 'JC-4001',
    Job_Title: 'Security Operations Analyst',
    Manager_ID: 'PS-10004',
    Location_Code: 'LOC-LON',
    Location_Name: 'London EMEA Office',
    Employment_Status: 'Active',
    Hire_Date: '2026-08-15',
    Salary: 82000,
    Currency: 'GBP',
    Pay_Group: 'LOC-LON_EXEC_MONTHLY',
    Business_Unit: 'BU-GLOBAL',
    Cost_Center: 'WD-CC-40100',
    Worker_Type: 'Regular',
    Company_Code: 'CMP-100',
  });

  return { sourceRecords, targetRecords };
}

// =========================================================================
// SCENARIO 2: Golden Cutover Sign-Off (Pre-Go-Live Clean Payload)
// Result: READY (0 critical, 0 high, 100% matched, 98-99% quality score)
// =========================================================================
export function generateGoldenCutover(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const sourceRecords: EmployeeRecord[] = [];
  const targetRecords: EmployeeRecord[] = [];

  const deptKeys = Object.keys(VALID_DEPARTMENTS);
  const jobKeys = Object.keys(JOB_CODES);

  for (let i = 1; i <= 520; i++) {
    const seed = i * 2048;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const empId = `PS-${10000 + i}`;
    const empNum = `10${String(i).padStart(4, '0')}`;
    const firstName = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 5) % LAST_NAMES.length];
    const prefName = firstName;
    const gender = r2 > 0.5 ? 'Female' : 'Male';

    const birthYear = 1970 + Math.floor(r3 * 30);
    const birthMonth = String(1 + Math.floor(r1 * 12)).padStart(2, '0');
    const birthDay = String(1 + Math.floor(r2 * 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const hireYear = 2014 + Math.floor(r1 * 10);
    const hireMonth = String(1 + Math.floor(r2 * 12)).padStart(2, '0');
    const hireDay = String(1 + Math.floor(r3 * 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const loc = LOCATIONS[i % LOCATIONS.length];
    const deptId = deptKeys[i % deptKeys.length];
    const deptName = VALID_DEPARTMENTS[deptId];
    const jobCode = jobKeys[i % jobKeys.length];
    const jobTitle = JOB_CODES[jobCode];

    // Clean hierarchical manager chain (CEO at root, no broken chains)
    let managerId = 'PS-10001';
    if (i === 1) {
      managerId = ''; // CEO
    } else if (i <= 10) {
      managerId = 'PS-10001'; // Executives report to CEO
    } else if (i <= 60) {
      managerId = `PS-${10000 + (2 + (i % 8))}`; // Directors report to Executives
    } else {
      managerId = `PS-${10000 + (11 + (i % 45))}`; // Staff report to Directors
    }

    const isTerminated = i % 30 === 0;
    const termYear = hireYear + 3;
    // Guaranteed clean termination dates (chronologically after hire date, no active with term date)
    const termDate: string | undefined = isTerminated ? `${termYear}-08-31` : undefined;
    const employmentStatus: EmployeeRecord['Employment_Status'] = isTerminated ? 'Terminated' : 'Active';

    // Guaranteed valid positive compensation within standard bands
    const salary = Math.round((72000 + r4 * 90000) / 1000) * 1000;
    const currency = loc.code === 'LOC-LON' ? 'GBP' : loc.code === 'LOC-TOR' ? 'CAD' : 'USD';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@enterprise-demo.corp`;
    const phone = `+1-555-${String(2000 + (i % 7900))}`;

    const sourceRecord: EmployeeRecord = {
      Employee_ID: empId,
      Employee_Number: empNum,
      First_Name: firstName,
      Last_Name: lastName,
      Preferred_Name: prefName,
      Date_of_Birth: dob,
      Gender: gender,
      Email: email,
      Phone: phone,
      Department_ID: deptId,
      Department_Name: deptName,
      Job_Code: jobCode,
      Job_Title: jobTitle,
      Manager_ID: managerId,
      Location_Code: loc.code,
      Location_Name: loc.name,
      Employment_Status: employmentStatus,
      Hire_Date: hireDate,
      Termination_Date: termDate,
      Salary: salary,
      Currency: currency,
      Pay_Group: `${loc.code}_EXEC_MONTHLY`,
      Business_Unit: 'BU-GLOBAL',
      Cost_Center: `CC-${deptId.replace('D-', '')}00`,
      Worker_Type: i % 20 === 0 ? 'Contractor' : 'Regular',
      Company_Code: 'CMP-100',
    };

    sourceRecords.push(sourceRecord);

    // Exact 100% matched target record with expected Workday transformations
    const wdDeptName = WORKDAY_SUPERVISORY_ORGS[deptId] || deptName;
    const wdJobTitle = jobCode === 'JC-1004' ? 'Cloud Platform Lead' : jobTitle;

    targetRecords.push({
      ...sourceRecord,
      Department_Name: wdDeptName,
      Job_Title: wdJobTitle,
      Cost_Center: `WD-CC-${deptId.replace('D-', '')}00`,
    });
  }

  return { sourceRecords, targetRecords };
}

// =========================================================================
// SCENARIO 3: M&A Subsidiary Integration (Apex BioHealth Acquired Unit)
// Result: NOT READY (Severely compromised legacy data, 40+ critical errors, 52% quality score)
// =========================================================================
export function generateLegacyMAScenario(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const sourceRecords: EmployeeRecord[] = [];
  const targetRecords: EmployeeRecord[] = [];

  const deptKeys = Object.keys(VALID_DEPARTMENTS);
  const jobKeys = Object.keys(JOB_CODES);

  // 380 Source records with heavy legacy data corruption
  for (let i = 1; i <= 380; i++) {
    const seed = i * 999;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    let empId = `APEX-${8000 + i}`;
    const empNum = `80${String(i).padStart(4, '0')}`;
    let firstName = FIRST_NAMES[(i * 9) % FIRST_NAMES.length];
    let lastName = LAST_NAMES[(i * 13) % LAST_NAMES.length];
    const gender = r2 > 0.5 ? 'Female' : 'Male';

    const birthYear = 1965 + Math.floor(r3 * 35);
    const dob = `${birthYear}-05-15`;
    const hireYear = 2011 + Math.floor(r1 * 10);
    const hireDate = `${hireYear}-03-01`;

    const loc = LOCATIONS[i % LOCATIONS.length];
    let deptId = deptKeys[i % deptKeys.length];
    let deptName = VALID_DEPARTMENTS[deptId];
    const jobCode = jobKeys[i % jobKeys.length];
    const jobTitle = JOB_CODES[jobCode];

    // Heavy orphan managers: point to external defunct consultant codes
    let managerId = `APEX-${8000 + (1 + (i % 20))}`;
    if (i % 12 === 0) {
      managerId = 'APEX-MGR-DEFUNCT'; // Orphan Manager
    } else if (i % 17 === 0) {
      managerId = 'EXT-CONSULTANT-00'; // Orphan Manager
    }

    let isTerminated = i % 14 === 0;
    let termDate: string | undefined = isTerminated ? `${hireYear + 2}-09-30` : undefined;
    let employmentStatus: EmployeeRecord['Employment_Status'] = isTerminated ? 'Terminated' : 'Active';

    let salary = Math.round((58000 + r4 * 80000) / 1000) * 1000;
    let currency = 'USD';
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@apex-legacy.org`;
    let phone = `+1-555-${String(3000 + (i % 6000))}`;

    // Corruptions:
    // Missing Employee ID (Critical)
    if (i === 15 || i === 42 || i === 118 || i === 230) {
      empId = '';
    }
    // Blank Email (Critical)
    if (i % 22 === 0) {
      email = '';
    }
    // Malformed Email (Critical)
    if (i % 31 === 0) {
      email = `${firstName.toLowerCase()}#legacy@broken`;
    }
    // Negative or Zero Salary (Critical)
    if (i === 28 || i === 150 || i === 295) {
      salary = -45000;
    }
    if (i === 77 || i === 212) {
      salary = 0;
    }
    // Term Date before Hire Date (Critical)
    if (i === 35 || i === 185) {
      employmentStatus = 'Terminated';
      termDate = '2008-01-01'; // Before 2011 hire
    }
    // Active with past termination date (High)
    if (i % 25 === 0 && !isTerminated) {
      termDate = '2022-11-15';
    }
    // Deprecated unmapped department (Critical)
    if (i % 19 === 0) {
      deptId = 'D-998';
      deptName = 'Deprecated Apex Operations';
    }

    // Duplicate candidate pairs
    if (i === 320 && sourceRecords[10]) {
      firstName = sourceRecords[10].First_Name;
      lastName = sourceRecords[10].Last_Name;
      phone = sourceRecords[10].Phone;
      email = sourceRecords[10].Email;
    }

    const rec: EmployeeRecord = {
      Employee_ID: empId,
      Employee_Number: empNum,
      First_Name: firstName,
      Last_Name: lastName,
      Preferred_Name: firstName,
      Date_of_Birth: dob,
      Gender: gender,
      Email: email,
      Phone: phone,
      Department_ID: deptId,
      Department_Name: deptName,
      Job_Code: jobCode,
      Job_Title: jobTitle,
      Manager_ID: managerId,
      Location_Code: loc.code,
      Location_Name: loc.name,
      Employment_Status: employmentStatus,
      Hire_Date: hireDate,
      Termination_Date: termDate,
      Salary: salary,
      Currency: currency,
      Pay_Group: 'APEX_LEGACY_BIWEEKLY',
      Business_Unit: 'BU-APEX-MA',
      Cost_Center: `CC-APEX-${deptId}`,
      Worker_Type: 'Regular',
      Company_Code: 'CMP-APEX',
    };

    sourceRecords.push(rec);
  }

  // Target records: ONLY 310 of 380 records loaded (70 records dropped/failed in target staging!)
  // Severe reconciliation breakdown
  for (let i = 0; i < 310; i++) {
    const src = sourceRecords[i];
    if (!src.Employee_ID) continue;

    targetRecords.push({
      ...src,
      Department_Name: WORKDAY_SUPERVISORY_ORGS[src.Department_ID] || src.Department_Name,
      Cost_Center: `WD-CC-${src.Cost_Center.replace('CC-', '')}`,
    });
  }

  return { sourceRecords, targetRecords };
}

// =========================================================================
// SCENARIO 4: Global Multi-Entity & Currency Expansion (EMEA & APAC Wave)
// Result: READY WITH WARNINGS (0 critical blockers, 18 high warnings on regional dates/policies, 85% quality score)
// =========================================================================
export function generateRegionalExpansionScenario(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const sourceRecords: EmployeeRecord[] = [];
  const targetRecords: EmployeeRecord[] = [];

  const deptKeys = Object.keys(VALID_DEPARTMENTS);
  const jobKeys = Object.keys(JOB_CODES);

  for (let i = 1; i <= 450; i++) {
    const seed = i * 4096;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const empId = `INT-${20000 + i}`;
    const empNum = `20${String(i).padStart(4, '0')}`;
    const firstName = FIRST_NAMES[(i * 4) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 8) % LAST_NAMES.length];
    const gender = r2 > 0.5 ? 'Female' : 'Male';

    const birthYear = 1972 + Math.floor(r3 * 28);
    const dob = `${birthYear}-08-22`;
    const hireYear = 2015 + Math.floor(r1 * 9);
    const hireDate = `${hireYear}-06-01`;

    // Multi-regional distribution across London, Singapore, New York, Toronto
    const loc = LOCATIONS[i % LOCATIONS.length];
    const deptId = deptKeys[i % deptKeys.length];
    const deptName = VALID_DEPARTMENTS[deptId];
    const jobCode = jobKeys[i % jobKeys.length];
    const jobTitle = JOB_CODES[jobCode];

    // Clean valid manager tree: CEO at INT-20001, no orphan managers
    let managerId = 'INT-20001';
    if (i === 1) {
      managerId = '';
    } else if (i <= 12) {
      managerId = 'INT-20001';
    } else {
      managerId = `INT-${20000 + (2 + (i % 25))}`;
    }

    const isTerminated = i % 28 === 0;
    let termDate: string | undefined = isTerminated ? `${hireYear + 3}-12-31` : undefined;
    let employmentStatus: EmployeeRecord['Employment_Status'] = isTerminated ? 'Terminated' : 'Active';

    // Multi-currency mapping
    let currency = 'USD';
    let salary = Math.round((70000 + r4 * 85000) / 1000) * 1000;

    if (loc.code === 'LOC-LON') {
      currency = 'GBP';
      salary = Math.round((55000 + r4 * 65000) / 1000) * 1000;
    } else if (loc.code === 'LOC-SGP') {
      currency = 'SGD';
      salary = Math.round((95000 + r4 * 110000) / 1000) * 1000;
    } else if (loc.code === 'LOC-TOR') {
      currency = 'CAD';
      salary = Math.round((85000 + r4 * 90000) / 1000) * 1000;
    }

    // Regional Non-standard Currencies (Medium warning)
    if (i === 115) currency = 'GBPX'; // Warning
    if (i === 290) currency = 'USDD'; // Warning

    // 18 High-severity policy warnings (no critical blockers!):
    // 8 Active employees with probation end dates stored in termination date (R-BIZ-02)
    if ([45, 90, 135, 180, 225, 270, 315, 360].includes(i)) {
      employmentStatus = 'Active';
      termDate = '2025-06-30'; // Warning: Active status with future/past date
    }
    // 10 Terminated international employees with statutory notice without standardized term date (R-BIZ-03)
    if ([30, 60, 120, 150, 210, 240, 300, 330, 390, 420].includes(i)) {
      employmentStatus = 'Terminated';
      termDate = undefined; // Warning: Terminated without fixed date
    }

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@global-enterprise.org`;
    const phone = `+44-20-${String(7000 + (i % 2900))}`;

    const rec: EmployeeRecord = {
      Employee_ID: empId,
      Employee_Number: empNum,
      First_Name: firstName,
      Last_Name: lastName,
      Preferred_Name: firstName,
      Date_of_Birth: dob,
      Gender: gender,
      Email: email,
      Phone: phone,
      Department_ID: deptId,
      Department_Name: deptName,
      Job_Code: jobCode,
      Job_Title: jobTitle,
      Manager_ID: managerId,
      Location_Code: loc.code,
      Location_Name: loc.name,
      Employment_Status: employmentStatus,
      Hire_Date: hireDate,
      Termination_Date: termDate,
      Salary: salary,
      Currency: currency,
      Pay_Group: `${loc.code}_PAYROLL_CYCLE`,
      Business_Unit: `BU-${loc.code.replace('LOC-', '')}`,
      Cost_Center: `CC-GLOBAL-${deptId}`,
      Worker_Type: i % 15 === 0 ? 'Contractor' : 'Regular',
      Company_Code: `CMP-${loc.code.replace('LOC-', '')}`,
    };

    sourceRecords.push(rec);
  }

  // 442 Target records in Workday (8 records missing, reconciliation rate = 98.2%, passes > 98.0%)
  for (let i = 0; i < 442; i++) {
    const src = sourceRecords[i];
    targetRecords.push({
      ...src,
      Department_Name: WORKDAY_SUPERVISORY_ORGS[src.Department_ID] || src.Department_Name,
      Cost_Center: `WD-CC-${src.Cost_Center.replace('CC-', '')}`,
    });
  }

  return { sourceRecords, targetRecords };
}

// =========================================================================
// SCENARIO 5: Executive & Compensation Wave (Senior Leadership Payroll)
// Result: NOT READY (Payroll Gate Failure: Critical salary anomalies & exec loops, 71% quality score)
// =========================================================================
export function generateExecPayrollScenario(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const sourceRecords: EmployeeRecord[] = [];
  const targetRecords: EmployeeRecord[] = [];

  const deptKeys = Object.keys(VALID_DEPARTMENTS);
  const jobKeys = Object.keys(JOB_CODES);

  for (let i = 1; i <= 240; i++) {
    const seed = i * 8192;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const empId = `EXEC-${50000 + i}`;
    const empNum = `50${String(i).padStart(4, '0')}`;
    const firstName = FIRST_NAMES[(i * 6) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 10) % LAST_NAMES.length];
    const gender = r2 > 0.5 ? 'Female' : 'Male';

    const birthYear = 1966 + Math.floor(r3 * 25);
    const dob = `${birthYear}-04-10`;
    const hireYear = 2010 + Math.floor(r1 * 12);
    const hireDate = `${hireYear}-01-15`;

    const loc = LOCATIONS[i % LOCATIONS.length];
    const deptId = deptKeys[i % deptKeys.length];
    const deptName = VALID_DEPARTMENTS[deptId];
    const jobCode = jobKeys[i % jobKeys.length];
    const jobTitle = JOB_CODES[jobCode];

    let managerId = 'EXEC-50001';
    if (i === 1) {
      managerId = '';
    } else if (i <= 8) {
      managerId = 'EXEC-50001';
    } else {
      managerId = `EXEC-${50000 + (2 + (i % 15))}`;
    }

    // 4 Critical executive manager reference breaks (pointing to retired Chairman EXEC-99999)
    if (i === 45 || i === 88 || i === 142 || i === 205) {
      managerId = 'EXEC-99999';
    }

    const isTerminated = i % 20 === 0;
    const termDate: string | undefined = isTerminated ? `${hireYear + 4}-05-31` : undefined;
    const employmentStatus: EmployeeRecord['Employment_Status'] = isTerminated ? 'Terminated' : 'Active';

    // Normal executive base salary: $175,000 - $380,000
    let salary = Math.round((180000 + r4 * 160000) / 5000) * 5000;
    const currency = 'USD';

    // 6 Critical compensation scale-shift anomalies (missing a zero or corrupted decimal)
    if (i === 18) salary = 19500; // Director salary $19.5k instead of $195k
    if (i === 52) salary = 24000; // VP salary $24k instead of $240k
    if (i === 110) salary = 17500; // Executive salary shift
    // 3 Critical negative bonus / clawback balances
    if (i === 74 || i === 165 || i === 220) {
      salary = -45000;
    }

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@enterprise-exec.corp`;
    const phone = `+1-555-${String(8000 + (i % 1900))}`;

    const rec: EmployeeRecord = {
      Employee_ID: empId,
      Employee_Number: empNum,
      First_Name: firstName,
      Last_Name: lastName,
      Preferred_Name: firstName,
      Date_of_Birth: dob,
      Gender: gender,
      Email: email,
      Phone: phone,
      Department_ID: deptId,
      Department_Name: deptName,
      Job_Code: jobCode,
      Job_Title: jobTitle,
      Manager_ID: managerId,
      Location_Code: loc.code,
      Location_Name: loc.name,
      Employment_Status: employmentStatus,
      Hire_Date: hireDate,
      Termination_Date: termDate,
      Salary: salary,
      Currency: currency,
      Pay_Group: 'EXEC_ANNUAL_INCENTIVE_PAY',
      Business_Unit: 'BU-LEADERSHIP',
      Cost_Center: `CC-EXEC-${deptId}`,
      Worker_Type: 'Executive',
      Company_Code: 'CMP-GLOBAL',
    };

    sourceRecords.push(rec);
  }

  // 236 target records in Workday staging (4 missing)
  for (let i = 0; i < 236; i++) {
    const src = sourceRecords[i];
    targetRecords.push({
      ...src,
      Department_Name: WORKDAY_SUPERVISORY_ORGS[src.Department_ID] || src.Department_Name,
      Cost_Center: `WD-CC-${src.Cost_Center.replace('CC-', '')}`,
    });
  }

  return { sourceRecords, targetRecords };
}

// =========================================================================
// SCENARIO METADATA REGISTRY
// =========================================================================
export const DEMO_SCENARIOS: MigrationScenario[] = [
  {
    id: 'wave1-baseline',
    name: 'Wave 1 Staging Baseline (PeopleSoft → Workday)',
    shortName: 'Wave 1 Baseline',
    tagline: 'Realistic raw staging extract with active remediation candidates',
    expectedReadiness: 'NOT READY',
    expectedQualityScore: '82%',
    sourceCount: 500,
    targetCount: 497,
    sourceSystem: 'PeopleSoft HCM 9.2',
    targetSystem: 'Workday 2026R2 Staging',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description:
      'Realistic un-remediated pre-validation extract. Contains 10 critical issues including orphan managers, email formatting errors, salary outliers, and 5 records missing in Workday.',
    keyCharacteristics: [
      '500 Source / 497 Target records',
      '10 Critical issues (4 orphan managers, malformed emails)',
      '1 Fuzzy duplicate candidate pair',
      '5 Target missing records requiring reconciliation',
    ],
    recommendedAction:
      'Run AI auto-remediation to normalize emails and fix orphan manager hierarchies before gate approval.',
    generateData: generateWave1Baseline,
  },
  {
    id: 'golden-cutover',
    name: 'Golden Cutover Payload (Pre-Go-Live Sign-Off)',
    shortName: 'Golden Cutover',
    tagline: 'Cleansed, reconciled, and audited production-ready cutover payload',
    expectedReadiness: 'READY',
    expectedQualityScore: '98%',
    sourceCount: 520,
    targetCount: 520,
    sourceSystem: 'PeopleSoft HCM Clean Staging',
    targetSystem: 'Workday Production Staging',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description:
      'Production-ready golden payload. Zero critical issues, zero high issues, 100% referential tree integrity, 100% Workday target match rate. Demonstrates full cutover sign-off.',
    keyCharacteristics: [
      '520 Source / 520 Target records (100% matched)',
      '0 Critical issues & 0 High issues',
      'Complete hierarchical manager tree rooted at CEO',
      'All 6 Cutover Decision Gates PASSED',
    ],
    recommendedAction:
      'Approved for production weekend cutover; all SOX compliance and reconciliation gates cleared.',
    generateData: generateGoldenCutover,
  },
  {
    id: 'regional-expansion',
    name: 'Global Multi-Entity Wave (EMEA & APAC Expansion)',
    shortName: 'Global Expansion',
    tagline: 'Multi-currency, international supervisory orgs, policy review required',
    expectedReadiness: 'READY WITH WARNINGS',
    expectedQualityScore: '85%',
    sourceCount: 450,
    targetCount: 442,
    sourceSystem: 'PeopleSoft International HR',
    targetSystem: 'Workday Global Multi-Org',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description:
      'Multi-currency global expansion across London, Singapore, New York, and Toronto. No critical blockers (zero orphan managers), but triggers 18 High warnings on regional status policies.',
    keyCharacteristics: [
      '450 Source / 442 Target records (98.2% recon match)',
      '0 Critical blockers (Solid referential integrity)',
      '18 High warnings on regional termination / probation policies',
      'Multi-currency distribution (USD, GBP, SGD, CAD)',
    ],
    recommendedAction:
      'Review regional policy warnings with EMEA/APAC HRBPs for conditional sign-off.',
    generateData: generateRegionalExpansionScenario,
  },
  {
    id: 'legacy-ma',
    name: 'M&A Acquired Unit (Apex BioHealth Legacy System)',
    shortName: 'M&A Legacy Unit',
    tagline: 'Severely degraded legacy data with broken hierarchies & 18% target drop-off',
    expectedReadiness: 'NOT READY',
    expectedQualityScore: '52%',
    sourceCount: 380,
    targetCount: 310,
    sourceSystem: 'Apex BioHealth Legacy HCM',
    targetSystem: 'Workday Integration Staging',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description:
      'Severely corrupted legacy acquisition extract. 42 critical issues, 36 orphan manager codes, null employee IDs, and 70 records failed to load in Workday (81.6% reconciliation failure).',
    keyCharacteristics: [
      '380 Source / 310 Target records (70 records dropped!)',
      '42 Critical issues & 36 broken orphan manager links',
      'Severe duplicate rate from temp contractor re-hires',
      '5 of 6 Cutover Decision Gates FAILED',
    ],
    recommendedAction:
      'BLOCK CUTOVER. Escalate to M&A Data Integration Lead for upstream extract reload.',
    generateData: generateLegacyMAScenario,
  },
  {
    id: 'exec-payroll',
    name: 'Executive & Compensation Wave (Senior Leadership)',
    shortName: 'Executive Payroll',
    tagline: 'High-sensitivity leadership payload blocked by critical salary anomalies',
    expectedReadiness: 'NOT READY',
    expectedQualityScore: '71%',
    sourceCount: 240,
    targetCount: 236,
    sourceSystem: 'PeopleSoft Executive Master',
    targetSystem: 'Workday Comp Grade Staging',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description:
      'Executive band cutover. Identity data is 100% complete, but fails the Payroll Gate due to 9 critical compensation scale-shift errors (e.g. $19.5k instead of $195k) and retired Board references.',
    keyCharacteristics: [
      '240 Source / 236 Target records',
      '9 Critical payroll & compensation errors (decimal shifts, negative bonuses)',
      '4 Manager links pointing to retired Chairman EXEC-99999',
      'Payroll Compliance Gate BLOCKED',
    ],
    recommendedAction:
      'Requires Compensation Committee audit and sign-off on executive salary grade tables.',
    generateData: generateExecPayrollScenario,
  },
];

export const DEFAULT_SCENARIO_ID: MigrationScenarioId = 'wave1-baseline';

export function getDemoScenario(id: MigrationScenarioId): MigrationScenario {
  return DEMO_SCENARIOS.find((s) => s.id === id) || DEMO_SCENARIOS[0];
}

export function getInitialScenarioAuditLogs(id: MigrationScenarioId): AuditLogItem[] {
  switch (id) {
    case 'golden-cutover':
      return [
        {
          id: 'AUD-GC-01',
          timestamp: 'T-72h',
          user: 'Extract Ingestion Pipeline',
          action: 'Initial Staging Extraction (PeopleSoft Clean Snapshot)',
          note: 'Extracted 520 verified records with active worker taxonomy.',
          qualityScore: 79.0,
        },
        {
          id: 'AUD-GC-02',
          timestamp: 'T-48h',
          user: 'HRIS Org Architect',
          action: 'Supervisory Org Alignment & Crosswalk Verification',
          note: 'Harmonized all supervisory org IDs into Workday format.',
          qualityScore: 88.5,
        },
        {
          id: 'AUD-GC-03',
          timestamp: 'T-24h',
          user: 'QA Automation Lead',
          action: 'Referential Integrity & CEO Root Verification',
          note: 'Valid manager reporting chain validated with 0 orphan references.',
          qualityScore: 94.0,
        },
        {
          id: 'AUD-GC-04',
          timestamp: 'T-2h',
          user: 'Cutover Governance Committee',
          action: 'Final Pre-Go-Live Cutover Audit Checkpoint',
          note: '100% referential integrity, 0 critical blockers, 100% reconciliation match.',
          qualityScore: 98.4,
        },
      ];

    case 'regional-expansion':
      return [
        {
          id: 'AUD-RE-01',
          timestamp: 'T-72h',
          user: 'International HR Data Batch',
          action: 'Multi-Entity Global Ingestion (EMEA & APAC Scope)',
          note: 'Loaded 450 records across London, Singapore, Toronto, and New York.',
          qualityScore: 71.0,
        },
        {
          id: 'AUD-RE-02',
          timestamp: 'T-48h',
          user: 'Treasury Systems Lead',
          action: 'Multi-Currency Compensation Grade Mapping',
          note: 'Mapped GBP, SGD, CAD, and USD pay groups with Workday compensation bands.',
          qualityScore: 79.2,
        },
        {
          id: 'AUD-RE-03',
          timestamp: 'T-12h',
          user: 'Global People Operations',
          action: 'Statutory Notice & Probation Period Audit',
          note: 'Cataloged 18 high warnings on regional statutory probation policies.',
          qualityScore: 84.8,
        },
      ];

    case 'legacy-ma':
      return [
        {
          id: 'AUD-MA-01',
          timestamp: 'T-48h',
          user: 'Legacy Systems Administrator',
          action: 'Apex BioHealth Acquired Database Export',
          note: 'Extracted 380 un-reconciled records from decommissioned SQL DB.',
          qualityScore: 41.0,
        },
        {
          id: 'AUD-MA-02',
          timestamp: 'T-24h',
          user: 'Workday Integration Agent',
          action: 'Target Staging Rehearsal Load',
          note: '70 records failed target staging ingestion due to missing primary keys.',
          qualityScore: 47.5,
        },
        {
          id: 'AUD-MA-03',
          timestamp: 'T-4h',
          user: 'Migration Risk Engine',
          action: 'Referential Integrity & Orphan Code Scan',
          note: 'Detected 42 critical exceptions and 36 broken external consultant manager links.',
          qualityScore: 52.0,
        },
      ];

    case 'exec-payroll':
      return [
        {
          id: 'AUD-EP-01',
          timestamp: 'T-48h',
          user: 'Executive Payroll Lead',
          action: 'Executive Band Master File Decryption',
          note: 'Extracted 240 senior leadership profiles from confidential PeopleSoft master.',
          qualityScore: 61.5,
        },
        {
          id: 'AUD-EP-02',
          timestamp: 'T-24h',
          user: 'Board HR Secretariat',
          action: 'Confidential Supervisory Org Alignment',
          note: 'Mapped leadership orgs; detected links to retired Chairman.',
          qualityScore: 66.8,
        },
        {
          id: 'AUD-EP-03',
          timestamp: 'T-6h',
          user: 'Compensation Auditor',
          action: 'Executive Compensation Scale Audit',
          note: 'Identified 9 decimal scale shift anomalies blocking Payroll Gate.',
          qualityScore: 71.0,
        },
      ];

    case 'wave1-baseline':
    default:
      return [
        {
          id: 'AUD-W1-01',
          timestamp: 'T-48h',
          user: 'Extract Integration Job',
          action: 'Initial Extract Dump (Raw PeopleSoft DB)',
          note: 'Dumped 500 employee records with legacy schemas and unmapped codes.',
          qualityScore: 68.5,
        },
        {
          id: 'AUD-W1-02',
          timestamp: 'T-32h',
          user: 'ETL Pipeline v2.4',
          action: 'Automated Staging Ingestion & Schema Alignment',
          note: 'Applied 13 primary column mappings and supervisory org transforms.',
          qualityScore: 74.0,
        },
        {
          id: 'AUD-W1-03',
          timestamp: 'T-16h',
          user: 'Quality Assurance Engine',
          action: 'Deterministic Validation Rule Scan (16 Rules)',
          note: 'Flagged 10 critical blockers including orphan managers and email syntax.',
          qualityScore: 78.2,
        },
        {
          id: 'AUD-W1-04',
          timestamp: 'T-1h',
          user: 'Migration Lead (Current User)',
          action: 'Baseline Cutover Gate Evaluation',
          note: 'Recorded pre-remediation staging baseline score.',
          qualityScore: 82.0,
        },
      ];
  }
}

export function generateScenarioDatasets(id: MigrationScenarioId): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  const scenario = getDemoScenario(id);
  return scenario.generateData();
}

/**
 * Backward-compatible helper that returns default Wave 1 Baseline
 */
export function generateDemoMigrationDatasets(): {
  sourceRecords: EmployeeRecord[];
  targetRecords: EmployeeRecord[];
} {
  return generateWave1Baseline();
}

export const DEFAULT_SOURCE_TARGET_MAPPINGS: FieldMapping[] = [
  {
    id: 'MAP-01',
    sourceField: 'Employee_ID',
    targetField: 'Worker_ID',
    mappingType: '1:1',
    confidence: 100,
    transformationRequired: false,
    risk: 'Low',
    explanation: 'Direct 1-to-1 match for primary worker identifier.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-02',
    sourceField: 'First_Name',
    targetField: 'Legal_First_Name',
    mappingType: '1:1',
    confidence: 99,
    transformationRequired: false,
    risk: 'Low',
    explanation: 'Direct mapping to Workday legal first name.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-03',
    sourceField: 'Last_Name',
    targetField: 'Legal_Last_Name',
    mappingType: '1:1',
    confidence: 99,
    transformationRequired: false,
    risk: 'Low',
    explanation: 'Direct mapping to Workday legal last name.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-04',
    sourceField: 'Department_ID',
    targetField: 'Supervisory_Org_ID',
    mappingType: 'Transformation',
    confidence: 92,
    transformationRequired: true,
    risk: 'Medium',
    explanation: 'PeopleSoft department table maps to Workday Supervisory Organization hierarchy.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-05',
    sourceField: 'Job_Code',
    targetField: 'Job_Profile_ID',
    mappingType: 'Transformation',
    confidence: 88,
    transformationRequired: true,
    risk: 'Medium',
    explanation: 'Requires lookup in Workday Job Profile cross-reference table.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-06',
    sourceField: 'Manager_ID',
    targetField: 'Manager_Worker_ID',
    mappingType: '1:1',
    confidence: 95,
    transformationRequired: false,
    risk: 'High',
    explanation: 'High migration dependency: Manager must already exist in target staging or tree breaks.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-07',
    sourceField: 'Salary',
    targetField: 'Base_Pay_Rate',
    mappingType: '1:1',
    confidence: 98,
    transformationRequired: false,
    risk: 'High',
    explanation: 'Critical payroll field; requires strict numeric validation and currency pairing.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-08',
    sourceField: 'Currency',
    targetField: 'Currency_Code',
    mappingType: '1:1',
    confidence: 99,
    transformationRequired: false,
    risk: 'Medium',
    explanation: 'ISO-4217 standard 3-character currency codes required.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-09',
    sourceField: 'Employment_Status',
    targetField: 'Worker_Status',
    mappingType: 'Transformation',
    confidence: 89,
    transformationRequired: true,
    risk: 'High',
    explanation: 'PeopleSoft status values (Active, Terminated, Leave) map to Workday life-cycle statuses.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-10',
    sourceField: 'Cost_Center',
    targetField: 'Workday_Cost_Center_Ref',
    mappingType: 'Transformation',
    confidence: 85,
    transformationRequired: true,
    risk: 'Medium',
    explanation: 'PeopleSoft cost centers (CC-XXXXX) prefix with WD-CC- in Workday FDM.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-11',
    sourceField: 'Termination_Date',
    targetField: 'End_Employment_Date',
    mappingType: '1:1',
    confidence: 94,
    transformationRequired: false,
    risk: 'High',
    explanation: 'Terminated workers must supply a valid historical date to avoid loading as active.',
    status: 'APPROVED',
  },
  {
    id: 'MAP-12',
    sourceField: 'Business_Unit',
    targetField: 'Company_Organization',
    mappingType: 'Transformation',
    confidence: 82,
    transformationRequired: true,
    risk: 'Medium',
    explanation: 'Financial enterprise dimension in Workday FDM structure.',
    status: 'PENDING',
  },
  {
    id: 'MAP-13',
    sourceField: 'Company_Code',
    targetField: '',
    mappingType: 'Unmapped',
    confidence: 60,
    transformationRequired: false,
    risk: 'Low',
    explanation: 'No direct target field mapped; absorbed into Company_Organization.',
    status: 'PENDING',
  },
];
