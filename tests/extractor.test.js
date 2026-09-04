import test from 'node:test';
import assert from 'node:assert/strict';
import { extractParameters, extractReportMetadata } from '../server/pipeline/extractor.js';

test('Extractor parses metadata correctly', () => {
  const text = `
    Patient Name: Eleanor Vance
    Age: 62
    Sex: Female
    Date of Report: 2026-08-12
    Laboratory: Quest Diagnostic Services
  `;

  const meta = extractReportMetadata(text);
  assert.equal(meta.patientName, 'Eleanor Vance');
  assert.equal(meta.age, 62);
  assert.equal(meta.sex, 'Female');
  assert.equal(meta.reportDate, '2026-08-12');
});

test('Extractor parses lab parameters with units and reference ranges', () => {
  const sampleReport = `
    Hemoglobin: 10.2 g/dL (Ref: 13.0 - 17.5)
    WBC: 12.4 x10^3/uL (Ref: 4.5 - 11.0)
    Fasting Blood Sugar: 142 mg/dL (Ref: 70 - 99)
    Serum Creatinine: 1.4 mg/dL (0.6 - 1.2)
    Total Cholesterol: 215 mg/dL (< 200)
    Estimated GFR: 48 mL/min/1.73m2 (> 60)
  `;

  const params = extractParameters(sampleReport);
  assert.ok(params.length >= 6, `Expected at least 6 parameters, got ${params.length}`);

  const hb = params.find(p => p.canonicalName === 'Hemoglobin');
  assert.ok(hb, 'Hemoglobin should be extracted');
  assert.equal(hb.observedValue, 10.2);
  assert.equal(hb.unit, 'g/dL');
  assert.equal(hb.status, 'LOW');
  assert.ok(hb.sourceQuote.includes('10.2'), 'Source quote must contain observed value');

  const wbc = params.find(p => p.canonicalName === 'White Blood Cell Count');
  assert.ok(wbc, 'WBC should be extracted');
  assert.equal(wbc.observedValue, 12.4);
  assert.equal(wbc.status, 'HIGH');

  const chol = params.find(p => p.canonicalName === 'Total Cholesterol');
  assert.ok(chol, 'Total Cholesterol should be extracted');
  assert.equal(chol.observedValue, 215);
  assert.equal(chol.status, 'HIGH');
});
