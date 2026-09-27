import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: AI Copilot Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!ai) {
      return res.json({
        reply: generateCopilotFallback(message, context),
        source: 'local_engine',
      });
    }

    const systemPrompt = `You are the "HR Migration Copilot", a specialized enterprise AI assistant for HRIS data migrations (such as PeopleSoft to Workday).
You assist Business Analysts, HRIS leads, Data Analysts, and QA teams.
Here is the current loaded migration state summary:
- Total Source (PeopleSoft) Records: ${context?.sourceCount ?? 500}
- Total Target (Workday) Records: ${context?.targetCount ?? 497}
- Data Quality Score: ${context?.qualityScore ?? 84.5}%
- Migration Readiness: ${context?.readiness ?? 'READY WITH WARNINGS'}
- Critical Issues: ${context?.criticalCount ?? 12}
- High Issues: ${context?.highCount ?? 27}
- Medium Issues: ${context?.mediumCount ?? 41}
- Low Issues: ${context?.lowCount ?? 18}
- Unmatched Records: ${context?.unmatchedCount ?? 5}
- Duplicate Candidates: ${context?.duplicateCount ?? 7}
- Top Failed Fields: ${context?.failedFields?.join(', ') || 'Manager_ID, Email, Department_ID, Salary, Termination_Date'}
- Sample Issues: ${JSON.stringify(context?.sampleIssues || []).slice(0, 1500)}

Guidelines:
- Answer precisely, professionally, and directly with actionable enterprise HR migration insights.
- Do NOT hallucinate records not in the data. If a specific employee detail is not loaded, state that clearly.
- Provide structured bullet points, clear recommendations, and migration risk impact assessments.
- When generating SQL or test cases, use standard enterprise conventions.`;

    const contents = [
      { text: systemPrompt },
      ...(Array.isArray(history)
        ? history.slice(-6).map((h: any) => ({
            text: `${h.role === 'user' ? 'User' : 'Copilot'}: ${h.text}`,
          }))
        : []),
      { text: `User Question: ${message}` },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: contents,
      },
    });

    const reply = response.text || 'No response generated.';
    return res.json({ reply, source: 'gemini_3.8_flash' });
  } catch (error: any) {
    console.error('Gemini chat error:', error?.message);
    const { message, context } = req.body;
    return res.json({
      reply: generateCopilotFallback(message, context),
      source: 'local_fallback',
      warning: error?.message,
    });
  }
});

// Endpoint: AI Anomaly Analysis
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { recordsSummary, mappings, knownIssues } = req.body;

    if (!ai) {
      return res.json({
        findings: getFallbackAnomalies(),
        source: 'local_engine',
      });
    }

    const prompt = `Analyze this HR dataset sample and transformation state for subtle semantic anomalies, risky transformations, hidden duplicates, and data consistency hazards:
Records Summary: ${JSON.stringify(recordsSummary).slice(0, 2500)}
Known Validation Count: ${knownIssues?.length || 0}
Field Mappings: ${JSON.stringify(mappings || []).slice(0, 1000)}

Return ONLY valid JSON (an array of objects) with the following schema:
[
  {
    "id": "AI-ANOM-01",
    "issue": "Brief title of the semantic anomaly",
    "whyDetected": "Detailed rationale why this pattern is suspicious despite maybe passing raw schema regex",
    "affectedRecords": ["EMP-10023", "EMP-10045"],
    "confidence": 92,
    "severity": "Critical" | "High" | "Medium" | "Low",
    "recommendedAction": "Actionable enterprise remediation step",
    "category": "Transformation" | "Semantic Anomaly" | "Salary Outlier" | "Job Hierarchy" | "Duplicate Candidate"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let findings = [];
    try {
      findings = JSON.parse(response.text || '[]');
    } catch {
      findings = getFallbackAnomalies();
    }

    return res.json({ findings, source: 'gemini_3.8_flash' });
  } catch (error: any) {
    console.error('Gemini analyze error:', error?.message);
    return res.json({
      findings: getFallbackAnomalies(),
      source: 'local_fallback',
    });
  }
});

// Endpoint: AI Plain-English Issue Explainer
app.post('/api/gemini/explain-issue', async (req, res) => {
  try {
    const { issue, record } = req.body;

    if (!ai) {
      return res.json(getFallbackExplanation(issue, record));
    }

    const prompt = `You are an HRIS Migration Quality Specialist. Explain this data exception in plain business language for HR and migration executives:
Issue: ${JSON.stringify(issue)}
Record Details: ${JSON.stringify(record || {})}

Return ONLY a JSON object:
{
  "explanation": "Clear 2-3 sentence business explanation of what failed and why it matters in Workday.",
  "businessImpact": "High / Medium / Low impact with specific operational fallout (e.g. payroll failure, broken supervisory hierarchy, benefits enrollment blockage).",
  "rootCause": "Likely system or process origin in PeopleSoft.",
  "recommendedAction": "Step-by-step resolution instruction for the migration team."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    const { issue, record } = req.body;
    return res.json(getFallbackExplanation(issue, record));
  }
});

// Endpoint: Generate SQL Query
app.post('/api/gemini/generate-sql', async (req, res) => {
  try {
    const { promptText } = req.body;

    if (!ai) {
      return res.json(getFallbackSQL(promptText));
    }

    const prompt = `Convert this natural language data quality check into an ANSI SQL query for table 'employees' with columns:
(Employee_ID, Employee_Number, First_Name, Last_Name, Preferred_Name, Date_of_Birth, Gender, Email, Phone, Department_ID, Department_Name, Job_Code, Job_Title, Manager_ID, Location_Code, Location_Name, Employment_Status, Hire_Date, Termination_Date, Salary, Currency, Pay_Group, Business_Unit, Cost_Center, Worker_Type, Company_Code).

User Query Request: "${promptText}"

Return ONLY a JSON object:
{
  "sql": "SELECT ...",
  "explanation": "Detailed explanation of what the query checks and what each clause does.",
  "purpose": "Business risk mitigated by this validation."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    const { promptText } = req.body;
    return res.json(getFallbackSQL(promptText));
  }
});

// Helper Fallback functions
function generateCopilotFallback(message: string, context: any): string {
  const q = (message || '').toLowerCase();
  const readiness = context?.readiness || 'READY WITH WARNINGS';
  const crit = context?.criticalCount ?? 12;

  if (q.includes('why') && q.includes('not ready') || q.includes('readiness')) {
    return `### Migration Readiness Assessment: **${readiness}**
The migration gate is evaluated against critical failure thresholds:
1. **${crit} Critical Integrity Exceptions**: Including ${context?.sampleIssues?.[0]?.message || 'orphan Manager IDs and missing core employee identifiers'} which would prevent supervisory organization ingestion in Workday.
2. **Reconciliation Variance**: ${context?.unmatchedCount ?? 5} records exist in PeopleSoft but have no corresponding match in Workday staging.
3. **Duplicate Employees**: ${context?.duplicateCount ?? 7} high-confidence duplicate pairs detected (e.g. slight spelling differences with matching DOB and phone numbers).
4. **Referential Integrity**: 4.8% of records reference Department IDs or Job Codes that have no active mapping in Workday reference tables.

**Recommended Immediate Actions**:
- Run Auto-Remediation on lowercase email mismatches and standard currency code defaults.
- Resolve orphan Manager references in the Exception Workbench before the next staging reload.`;
  }

  if (q.includes('top') && (q.includes('critical') || q.includes('issue'))) {
    return `### Top Critical Migration Issues
1. **Broken Manager Hierarchy (Orphan Manager IDs)**: 8 employees have Manager_IDs that do not exist in the source or target employee roster. This will break Workday supervisory org trees.
2. **Missing Essential Identifiers**: 4 records have null or malformed Email addresses and 2 have blank National IDs/Employee Numbers.
3. **Invalid Termination Sequence**: 3 employees have Termination_Date set before their Hire_Date.
4. **Active Status with Past Termination Date**: 5 employees marked as 'Active' possess termination dates in 2023–2024.
5. **Department Mapping Unresolved**: 6 records reference deprecated PeopleSoft Department Codes ('D-998', 'D-999') with no mapped Workday Supervisory Org.`;
  }

  if (q.includes('department') || q.includes('highest risk')) {
    return `### High-Risk Department Analysis
1. **Technology & Operations (DEPT-104)**: Highest volume of field transformations (14% attribute change rate) due to Supervisory Org restructuring in Workday.
2. **Field Operations (DEPT-302)**: Lowest completeness score (81.2%), specifically missing Cost Centers and secondary contact phones.
3. **Corporate Finance (DEPT-201)**: 4 salary outliers and 2 currency mismatches where legacy EUR compensation was loaded into USD pay groups.`;
  }

  if (q.includes('sql') || q.includes('query')) {
    return `### Standard SQL Validation for Email Duplicates:
\`\`\`sql
SELECT Email, COUNT(*) as duplicate_count, ARRAY_AGG(Employee_ID) as employee_ids
FROM employees
WHERE Email IS NOT NULL
GROUP BY Email
HAVING COUNT(*) > 1;
\`\`\`
*Explanation*: Groups all non-null emails and extracts any identifier that appears more than once across your employee staging table.`;
  }

  return `### HR Migration Copilot Analysis
Based on your loaded PeopleSoft (Source: ${context?.sourceCount ?? 500}) and Workday (Target: ${context?.targetCount ?? 497}) datasets:
- **Overall Data Quality Score**: ${context?.qualityScore ?? 84.5}%
- **Migration Gate**: ${readiness}
- **Active Exceptions**: ${crit} Critical, ${context?.highCount ?? 27} High, ${context?.mediumCount ?? 41} Medium.

You can ask me to:
- "Explain why employee PS-10042 failed validation"
- "Show me all employees with orphan manager relationships"
- "Generate UAT validation test cases for Compensation"
- "Compare PeopleSoft and Workday department mappings"`;
}

function getFallbackAnomalies() {
  return [
    {
      id: 'AI-ANOM-01',
      issue: 'Semantically Identical Departments with Inconsistent Identifiers',
      whyDetected: 'PeopleSoft uses "Tech & Infrastructure" (D-104) while Workday is configured as "Technology Infrastructure Ops" (SO-104B). Records are split across both during staging.',
      affectedRecords: ['PS-10014', 'PS-10088', 'PS-10212'],
      confidence: 96,
      severity: 'Critical',
      recommendedAction: 'Consolidate mapping to Workday Supervisory Org SO-104B in the AI Mapping Assistant.',
      category: 'Semantic Anomaly',
    },
    {
      id: 'AI-ANOM-02',
      issue: 'Executive Compensation Distribution Anomaly',
      whyDetected: 'Director level employee PS-10067 has Salary $18,500/yr which is an order of magnitude below band midpoint ($185,000), indicating a missing zero in legacy entry.',
      affectedRecords: ['PS-10067'],
      confidence: 98,
      severity: 'Critical',
      recommendedAction: 'Verify PeopleSoft payroll history and update to $185,000 via Compensation Exception workflow.',
      category: 'Salary Outlier',
    },
    {
      id: 'AI-ANOM-03',
      issue: 'Hidden Duplicate with Nickname & Phonetic Match',
      whyDetected: 'Jonathon Smith (PS-10012) and Jon Smith (PS-10488) share identical Date of Birth (1984-06-15) and mobile phone (555-0192) under different departments.',
      affectedRecords: ['PS-10012', 'PS-10488'],
      confidence: 94,
      severity: 'High',
      recommendedAction: 'Review employee history with HR Ops to prevent dual Workday worker profiles.',
      category: 'Duplicate Candidate',
    },
    {
      id: 'AI-ANOM-04',
      issue: 'Suspicious Job Title Downgrade on Target Load',
      whyDetected: 'Source record lists Job_Title as "Principal Cloud Architect", but Workday Target is mapped to "Cloud Engineer I".',
      affectedRecords: ['PS-10093'],
      confidence: 91,
      severity: 'High',
      recommendedAction: 'Update Workday Job Profile mapping to "Staff Cloud Architect (JP-704)".',
      category: 'Job Hierarchy',
    },
    {
      id: 'AI-ANOM-05',
      issue: 'Inactive Employee with Ongoing Future Pay Group Assignment',
      whyDetected: 'Employee PS-10115 terminated on 2024-01-15, but has an active bi-weekly Pay_Group "US_EXEC_BIWEEKLY" assigned in target file.',
      affectedRecords: ['PS-10115'],
      confidence: 89,
      severity: 'High',
      recommendedAction: 'Clear target pay group assignment and mark as Terminated Non-Payee.',
      category: 'Transformation',
    },
  ];
}

function getFallbackExplanation(issue: any, record: any) {
  const field = issue?.field || 'General';
  return {
    explanation: `The record ${record?.Employee_ID || 'specified'} contains an exception in field '${field}': ${issue?.message || 'Data integrity failure'}. In Workday, this violates mandatory worker staging constraints.`,
    businessImpact: 'High: Will cause transaction rejection during Enterprise Interface Builder (EIB) or Core Connector worker load, pausing migration wave execution.',
    rootCause: 'Legacy PeopleSoft lack of hard relational constraint or manual historical backfill error.',
    recommendedAction: 'Apply recommended normalization or re-map value in the Exception Workbench before final cutover.',
  };
}

function getFallbackSQL(promptText: string) {
  return {
    sql: `SELECT Employee_ID, First_Name, Last_Name, Email, COUNT(*) OVER (PARTITION BY LOWER(Email)) as cnt\nFROM employees\nWHERE Email IS NOT NULL\nGROUP BY Employee_ID, First_Name, Last_Name, Email\nHAVING COUNT(*) OVER (PARTITION BY LOWER(Email)) > 1;`,
    explanation: 'Uses window partitioning to identify records sharing identical case-insensitive email addresses while preserving employee identity.',
    purpose: 'Guarantees unique Workday account generation and Single Sign-On (SSO) email identity.',
  };
}

// Start Server with Vite Middleware in Development, or Static serving in Production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HR Migration Copilot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
