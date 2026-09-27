import { EmployeeRecord, FieldProfile } from '../types';

export function profileDataset(records: EmployeeRecord[]): FieldProfile[] {
  if (!records || records.length === 0) return [];

  const total = records.length;
  const sample = records[0];
  const fields = Object.keys(sample);

  return fields.map((field) => {
    let nullCount = 0;
    const valueMap = new Map<string, number>();
    const numericValues: number[] = [];
    const dateValues: number[] = [];

    let inferredType: FieldProfile['dataType'] = 'string';

    for (const r of records) {
      const val = r[field];

      if (val === undefined || val === null || String(val).trim() === '') {
        nullCount++;
      } else {
        const strVal = String(val).trim();
        valueMap.set(strVal, (valueMap.get(strVal) || 0) + 1);

        // Check if numeric
        if (typeof val === 'number' || (!isNaN(Number(strVal)) && !strVal.startsWith('0') && !strVal.startsWith('+'))) {
          numericValues.push(Number(val));
        }

        // Check if date format YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
          const t = new Date(strVal).getTime();
          if (!isNaN(t)) {
            dateValues.push(t);
          }
        }
      }
    }

    const nonNullCount = total - nullCount;
    if (numericValues.length > nonNullCount * 0.7 && field.toLowerCase().includes('salary')) {
      inferredType = 'number';
    } else if (dateValues.length > nonNullCount * 0.7 || field.toLowerCase().includes('date')) {
      inferredType = 'date';
    } else if (field.toLowerCase().includes('email')) {
      inferredType = 'email';
    }

    const distinctCount = valueMap.size;
    const distinctPercent = total > 0 ? Math.round((distinctCount / total) * 1000) / 10 : 0;
    const nullPercent = total > 0 ? Math.round((nullCount / total) * 1000) / 10 : 0;
    const duplicateCount = Math.max(0, nonNullCount - distinctCount);

    let min: string | number | undefined;
    let max: string | number | undefined;
    let avg: number | undefined;

    if (inferredType === 'number' && numericValues.length > 0) {
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      avg = Math.round(sum / numericValues.length);
    } else if (inferredType === 'date' && dateValues.length > 0) {
      const minD = new Date(Math.min(...dateValues));
      const maxD = new Date(Math.max(...dateValues));
      min = minD.toISOString().slice(0, 10);
      max = maxD.toISOString().slice(0, 10);
    }

    // Top categories / distributions
    const sortedEntries = Array.from(valueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topValues = sortedEntries.map(([value, count]) => ({
      value: value.length > 32 ? `${value.slice(0, 30)}...` : value,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }));

    const sampleValues = Array.from(valueMap.keys()).slice(0, 4);

    return {
      field,
      dataType: inferredType,
      totalCount: total,
      nullCount,
      nullPercent,
      distinctCount,
      distinctPercent,
      duplicateCount,
      min,
      max,
      avg,
      sampleValues,
      topValues,
    };
  });
}
