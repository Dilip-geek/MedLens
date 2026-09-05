import test from 'node:test';
import assert from 'node:assert/strict';
import { extractParameters, extractReportMetadata } from '../server/pipeline/extractor.js';
import { detectConflicts } from '../server/pipeline/conflictDetector.js';
import { compareReports } from '../server/pipeline/longitudinalComparator.js';
import { generateClarificationQuestions } from '../server/pipeline/clarificationGenerator.js';
import { generateStructuredSummary, MEDICAL_DISCLAIMER } from '../server/pipeline/summaryGenerator.js';

test('Pipeline Integration: processes full raw medical report end-to-end', () => {
  const currentReportText = `
PATIENT: Johnathan Doe
DOB: 10/12/1980 (Age: 44)
COLLECTION DATE: 2024-05-15

METABOLIC PANEL:
Fasting Glucose: 142 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
HbA1c: 7.4 % (Reference: 4.0 - 5.6 %) [HIGH]
Serum Creatinine: 1.1 mg/dL (Reference: 0.7 - 1.3 mg/dL)
Blood Urea Nitrogen (BUN): 18 mg/dL (Reference: 7 - 20 mg/dL)

LIPID PANEL:
Total Cholesterol: 235 mg/dL (Reference: 125 - 200 mg/dL) [HIGH]
Triglycerides: 210 mg/dL (Reference: < 150 mg/dL) [HIGH]
HDL Cholesterol: 38 mg/dL (Reference: > 40 mg/dL) [LOW]
LDL Cholesterol: 155 mg/dL (Reference: < 100 mg/dL) [HIGH]
  `;

  const previousReportText = `
PATIENT: Johnathan Doe
DOB: 10/12/1980 (Age: 44)
COLLECTION DATE: 2023-11-10

METABOLIC PANEL:
Fasting Glucose: 118 mg/dL (Reference: 70 - 99 mg/dL)
HbA1c: 6.2 % (Reference: 4.0 - 5.6 %)
Serum Creatinine: 1.0 mg/dL (Reference: 0.7 - 1.3 mg/dL)
Total Cholesterol: 210 mg/dL (Reference: 125 - 200 mg/dL)
  `;

  const intake = {
    name: 'Johnathan Doe',
    age: 44,
    sex: 'Male',
    symptoms: 'Increased fatigue and frequent urination',
    conditions: 'Pre-diabetes, Hypertension',
    medications: 'Lisinopril 10mg daily',
    allergies: 'Penicillin (Rash)'
  };

  // Stage 1 & 2: Extraction & Metadata
  const metadata = extractReportMetadata(currentReportText);
  const currentParams = extractParameters(currentReportText, 'current_report');
  const prevParams = extractParameters(previousReportText, 'previous_report');

  assert.ok(currentParams.length >= 7, 'Should extract at least 7 lab parameters');
  assert.ok(prevParams.length >= 4, 'Should extract previous parameters');

  // Stage 3 & 4: Range analysis
  const glucose = currentParams.find(p => p.canonicalName.toLowerCase().includes('glucose'));
  assert.ok(glucose, 'Glucose should be identified');
  assert.equal(glucose.observedValue, 142);
  assert.ok(['HIGH', 'CRITICAL_HIGH'].includes(glucose.status));
  assert.equal(glucose.isOutOfRange, true);

  // Stage 5: Longitudinal comparison
  const comparison = compareReports(currentParams, prevParams);
  assert.equal(comparison.hasComparison, true);
  assert.ok(comparison.items.length >= 4);

  const glucoseComp = comparison.items.find(i => i.canonicalName.toLowerCase().includes('glucose'));
  assert.ok(glucoseComp);
  assert.equal(glucoseComp.delta, 24); // 142 - 118 = +24
  assert.equal(glucoseComp.trendDirection, 'increased');

  // Stage 6: Conflict detection
  const conflicts = detectConflicts({
    intake,
    currentReportText,
    previousReportText,
    currentParameters: currentParams,
    previousParameters: prevParams
  });
  assert.ok(Array.isArray(conflicts));

  // Stage 7: Doctor clarification questions
  const questions = generateClarificationQuestions({
    intake,
    parameters: currentParams,
    previousParameters: prevParams,
    conflicts
  });
  assert.ok(questions.length > 0, 'Should generate relevant discussion questions for the doctor');

  // Stage 8: Structured Summary
  const summary = generateStructuredSummary({
    intake,
    currentParameters: currentParams,
    previousParameters: prevParams,
    conflicts,
    questions,
    observations: []
  });

  assert.ok(summary.narrative);
  assert.equal(summary.disclaimer, MEDICAL_DISCLAIMER);
  assert.ok(summary.recommendedDiscussionPoints.length > 0);
  assert.ok(summary.keyFindings.length > 0);
});
