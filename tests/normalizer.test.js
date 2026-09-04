import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTestName, CLINICAL_PANELS } from '../server/pipeline/normalizer.js';

test('Normalizer maps abbreviations and aliases to canonical names', () => {
  // Hb / HGB -> Hemoglobin
  assert.equal(normalizeTestName('Hb').canonical, 'Hemoglobin');
  assert.equal(normalizeTestName('HGB').canonical, 'Hemoglobin');
  assert.equal(normalizeTestName('haemoglobin').canonical, 'Hemoglobin');

  // WBC -> White Blood Cell Count
  assert.equal(normalizeTestName('WBC').canonical, 'White Blood Cell Count');
  assert.equal(normalizeTestName('Leukocytes').canonical, 'White Blood Cell Count');

  // FBS / Gluc -> Fasting Blood Glucose
  assert.equal(normalizeTestName('FBS').canonical, 'Fasting Blood Glucose');
  assert.equal(normalizeTestName('Fasting Blood Sugar').canonical, 'Fasting Blood Glucose');

  // Cr -> Serum Creatinine
  assert.equal(normalizeTestName('Cr').canonical, 'Serum Creatinine');
  assert.equal(normalizeTestName('Serum Creatinine').canonical, 'Serum Creatinine');

  // eGFR -> Estimated Glomerular Filtration Rate
  assert.equal(normalizeTestName('eGFR').canonical, 'Estimated Glomerular Filtration Rate (eGFR)');

  // Panels assignment
  assert.equal(normalizeTestName('Hemoglobin').panel, CLINICAL_PANELS.HEMATOLOGY);
  assert.equal(normalizeTestName('Serum Creatinine').panel, CLINICAL_PANELS.METABOLIC_RENAL);
  assert.equal(normalizeTestName('Total Cholesterol').panel, CLINICAL_PANELS.LIPID);
});
