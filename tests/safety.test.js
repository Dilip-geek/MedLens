import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStructuredSummary, MEDICAL_DISCLAIMER } from '../server/pipeline/summaryGenerator.js';

test('Summary strictly maintains non-diagnostic boundaries and includes disclaimer', () => {
  const intake = {
    name: 'Jane Doe',
    age: 40,
    sex: 'Female'
  };

  const currentParams = [
    {
      canonicalName: 'Fasting Blood Glucose',
      observedValue: 156,
      unit: 'mg/dL',
      status: 'HIGH',
      statusLabel: 'Above reported range',
      rawRangeText: '70 - 99',
      isOutOfRange: true
    }
  ];

  const summary = generateStructuredSummary({
    intake,
    currentParameters: currentParams,
    previousParameters: [],
    conflicts: [],
    questions: [],
    observations: []
  });

  // Must include explicit medical disclaimer
  assert.equal(summary.disclaimer, MEDICAL_DISCLAIMER);
  assert.ok(summary.narrative);

  // Must NOT state diagnosis
  assert.ok(!summary.narrative.toLowerCase().includes('you have diabetes'));
  assert.ok(!summary.narrative.toLowerCase().includes('we diagnose'));
  assert.ok(!summary.narrative.toLowerCase().includes('prescribe'));
});
