import { EmployeeRecord, ReconciliationRecord, ReconDiff, ReconStatus } from '../types';

export interface ReconciliationSummary {
  totalSource: number;
  totalTarget: number;
  matchedCount: number;
  expectedTransformationCount: number;
  mismatchCount: number;
  missingInTargetCount: number;
  extraInTargetCount: number;
  requiresReviewCount: number;
  reconciliationRate: number; // percentage
  records: ReconciliationRecord[];
}

export function performReconciliation(
  sourceRecords: EmployeeRecord[],
  targetRecords: EmployeeRecord[]
): ReconciliationSummary {
  const sourceMap = new Map<string, EmployeeRecord>();
  const targetMap = new Map<string, EmployeeRecord>();

  for (const s of sourceRecords) {
    sourceMap.set(s.Employee_ID, s);
  }
  for (const t of targetRecords) {
    targetMap.set(t.Employee_ID, t);
  }

  const records: ReconciliationRecord[] = [];

  // Fields to compare
  const compareFields = [
    'First_Name',
    'Last_Name',
    'Email',
    'Department_Name',
    'Job_Title',
    'Employment_Status',
    'Salary',
    'Currency',
    'Pay_Group',
    'Cost_Center',
  ];

  let matchedCount = 0;
  let expectedTransformationCount = 0;
  let mismatchCount = 0;
  let missingInTargetCount = 0;
  let extraInTargetCount = 0;
  let requiresReviewCount = 0;

  // Process all Source Records
  for (const source of sourceRecords) {
    const target = targetMap.get(source.Employee_ID);

    if (!target) {
      missingInTargetCount++;
      records.push({
        employeeId: source.Employee_ID,
        name: `${source.First_Name} ${source.Last_Name}`,
        status: 'MISSING IN TARGET',
        sourceRecord: source,
        diffs: [
          {
            field: 'Record',
            sourceValue: 'Present in PeopleSoft Source',
            targetValue: 'Missing in Workday Target EIB payload',
            notes: 'Worker profile was omitted during extraction or filtered by legacy sync rules.',
          },
        ],
      });
      continue;
    }

    const diffs: ReconDiff[] = [];
    let hasMismatch = false;
    let hasExpectedTransformation = false;

    for (const field of compareFields) {
      const sVal = source[field];
      const tVal = target[field];

      if (sVal !== tVal) {
        // Check if expected transformation
        const isExpected = checkIfExpectedTransformation(field, sVal, tVal);
        if (isExpected) {
          hasExpectedTransformation = true;
          diffs.push({
            field,
            sourceValue: sVal,
            targetValue: tVal,
            isExpectedTransformation: true,
            notes: 'Approved Workday enterprise taxonomy transformation.',
          });
        } else {
          hasMismatch = true;
          diffs.push({
            field,
            sourceValue: sVal,
            targetValue: tVal,
            isExpectedTransformation: false,
            notes: 'Unplanned variance between source extract and target staging value.',
          });
        }
      }
    }

    let status: ReconStatus = 'MATCHED';
    if (hasMismatch) {
      status = 'MISMATCH';
      mismatchCount++;
    } else if (hasExpectedTransformation) {
      status = 'EXPECTED TRANSFORMATION';
      expectedTransformationCount++;
    } else {
      matchedCount++;
    }

    records.push({
      employeeId: source.Employee_ID,
      name: `${source.First_Name} ${source.Last_Name}`,
      status,
      sourceRecord: source,
      targetRecord: target,
      diffs,
    });
  }

  // Process Extra records in Target
  for (const target of targetRecords) {
    if (!sourceMap.has(target.Employee_ID)) {
      extraInTargetCount++;
      records.push({
        employeeId: target.Employee_ID,
        name: `${target.First_Name} ${target.Last_Name}`,
        status: 'EXTRA IN TARGET',
        targetRecord: target,
        diffs: [
          {
            field: 'Record',
            sourceValue: 'Not present in PeopleSoft extract',
            targetValue: 'Created directly in Workday staging environment',
            notes: 'New direct hire or contractor created outside official legacy ETL freeze.',
          },
        ],
      });
    }
  }

  const totalSource = sourceRecords.length;
  const totalTarget = targetRecords.length;
  const validReconciled = matchedCount + expectedTransformationCount;
  const reconciliationRate = totalSource > 0 ? Math.round((validReconciled / totalSource) * 1000) / 10 : 0;

  return {
    totalSource,
    totalTarget,
    matchedCount,
    expectedTransformationCount,
    mismatchCount,
    missingInTargetCount,
    extraInTargetCount,
    requiresReviewCount,
    reconciliationRate,
    records,
  };
}

function checkIfExpectedTransformation(field: string, sourceVal: any, targetVal: any): boolean {
  if (field === 'Department_Name') {
    // Check if target has supervisory org syntax
    if (String(targetVal).includes('(SO-')) {
      return true;
    }
    if (
      String(sourceVal).includes('Technology & Infrastructure') &&
      String(targetVal).includes('Technology Infrastructure Ops')
    ) {
      return true;
    }
  }

  if (field === 'Cost_Center') {
    // e.g. CC-10100 -> WD-CC-10100
    if (String(targetVal) === `WD-${sourceVal}`) {
      return true;
    }
  }

  if (field === 'Job_Title') {
    // Approved title mappings
    if (sourceVal === 'DevOps Lead' && targetVal === 'Cloud Platform Lead') {
      return true;
    }
  }

  return false;
}
