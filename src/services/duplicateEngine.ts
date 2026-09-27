import { EmployeeRecord, DuplicateCandidate } from '../types';

function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b[j - 1] === a[i - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return 1 - dist / maxLen;
}

export function detectDuplicates(records: EmployeeRecord[]): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];
  const processedPairs = new Set<string>();

  // Pre-index by email and phone
  const emailMap = new Map<string, EmployeeRecord[]>();
  const phoneMap = new Map<string, EmployeeRecord[]>();
  const dobMap = new Map<string, EmployeeRecord[]>();

  for (const r of records) {
    if (r.Email && r.Email.trim()) {
      const email = r.Email.trim().toLowerCase();
      if (!emailMap.has(email)) emailMap.set(email, []);
      emailMap.get(email)!.push(r);
    }
    if (r.Phone && r.Phone.trim()) {
      const phoneDigits = r.Phone.replace(/\D/g, '');
      if (phoneDigits.length >= 7) {
        if (!phoneMap.has(phoneDigits)) phoneMap.set(phoneDigits, []);
        phoneMap.get(phoneDigits)!.push(r);
      }
    }
    if (r.Date_of_Birth && r.Date_of_Birth.trim()) {
      const dob = r.Date_of_Birth.trim();
      if (!dobMap.has(dob)) dobMap.set(dob, []);
      dobMap.get(dob)!.push(r);
    }
  }

  // 1. Exact Email Duplicates
  for (const [_email, list] of emailMap.entries()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const recA = list[i];
          const recB = list[j];
          const key = [recA.Employee_ID, recB.Employee_ID].sort().join('::');
          if (processedPairs.has(key)) continue;
          processedPairs.add(key);

          candidates.push({
            id: `DUP-${candidates.length + 1}`,
            primaryRecord: recA,
            matchedRecord: recB,
            confidence: 98,
            matchFactors: ['Exact Email Match', 'Shared Corporate Domain'],
            status: 'PENDING',
            riskLevel: 'High',
          });
        }
      }
    }
  }

  // 2. Exact Phone Duplicates with similar Name
  for (const [_phone, list] of phoneMap.entries()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const recA = list[i];
          const recB = list[j];
          const key = [recA.Employee_ID, recB.Employee_ID].sort().join('::');
          if (processedPairs.has(key)) continue;

          const lastSim = stringSimilarity(recA.Last_Name, recB.Last_Name);
          const firstSim = stringSimilarity(recA.First_Name, recB.First_Name);

          if (lastSim >= 0.8 && firstSim >= 0.6) {
            processedPairs.add(key);
            candidates.push({
              id: `DUP-${candidates.length + 1}`,
              primaryRecord: recA,
              matchedRecord: recB,
              confidence: 94,
              matchFactors: ['Exact Mobile Phone Match', 'High Name Phonetic Similarity'],
              status: 'PENDING',
              riskLevel: 'High',
            });
          }
        }
      }
    }
  }

  // 3. Fuzzy Name Match with Identical Date of Birth
  for (const [_dob, list] of dobMap.entries()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const recA = list[i];
          const recB = list[j];
          const key = [recA.Employee_ID, recB.Employee_ID].sort().join('::');
          if (processedPairs.has(key)) continue;

          const lastSim = stringSimilarity(recA.Last_Name, recB.Last_Name);
          const firstSim = stringSimilarity(recA.First_Name, recB.First_Name);

          if (lastSim >= 0.85 && firstSim >= 0.5) {
            processedPairs.add(key);
            const conf = Math.round((lastSim * 0.5 + firstSim * 0.3 + 0.2) * 100);
            candidates.push({
              id: `DUP-${candidates.length + 1}`,
              primaryRecord: recA,
              matchedRecord: recB,
              confidence: Math.min(96, Math.max(75, conf)),
              matchFactors: [
                'Identical Date of Birth',
                `Fuzzy Name Match (${recA.First_Name} ${recA.Last_Name} vs ${recB.First_Name} ${recB.Last_Name})`,
              ],
              status: 'PENDING',
              riskLevel: conf > 85 ? 'High' : 'Medium',
            });
          }
        }
      }
    }
  }

  // 4. Check for similar emails (e.g., prefix nickname variations)
  // Check sample window across dataset
  const step = Math.max(1, Math.floor(records.length / 100));
  for (let i = 0; i < records.length; i += step) {
    const recA = records[i];
    for (let j = i + 1; j < Math.min(records.length, i + 30); j++) {
      const recB = records[j];
      const key = [recA.Employee_ID, recB.Employee_ID].sort().join('::');
      if (processedPairs.has(key)) continue;

      const lastSim = stringSimilarity(recA.Last_Name, recB.Last_Name);
      const firstSim = stringSimilarity(recA.First_Name, recB.First_Name);

      if (lastSim > 0.9 && firstSim > 0.8 && recA.Department_ID === recB.Department_ID) {
        processedPairs.add(key);
        candidates.push({
          id: `DUP-${candidates.length + 1}`,
          primaryRecord: recA,
          matchedRecord: recB,
          confidence: 88,
          matchFactors: ['Shared Department Assignment', 'High Full Name Proximity'],
          status: 'PENDING',
          riskLevel: 'Medium',
        });
      }
    }
  }

  return candidates;
}
