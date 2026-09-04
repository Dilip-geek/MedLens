import test from 'node:test';
import assert from 'node:assert/strict';
import { detectConflicts } from '../server/pipeline/conflictDetector.js';

test('ConflictDetector detects allergy contradictions', () => {
  const intake = {
    name: 'Robert Chen',
    age: 48,
    allergies: 'None',
    medications: 'Lisinopril 10mg'
  };

  const reportText = `
    Patient: Robert Chen
    Allergies: Penicillin (severe hives and facial swelling)
    Hb: 14.2 g/dL
  `;

  const conflicts = detectConflicts({
    intake,
    currentReportData: { metadata: { age: 48 }, parameters: [] },
    previousReportData: null,
    currentReportText: reportText,
    previousReportText: ''
  });

  const allergyConflict = conflicts.find(c => c.category === 'ALLERGY_CONFLICT');
  assert.ok(allergyConflict, 'Must detect penicillin allergy conflict');
  assert.equal(allergyConflict.severity, 'HIGH');
  assert.ok(allergyConflict.description.includes('Penicillin'));
});

test('ConflictDetector detects age mismatch', () => {
  const intake = { name: 'John Doe', age: 45, allergies: 'None' };
  const conflicts = detectConflicts({
    intake,
    currentReportData: { metadata: { age: 54 }, parameters: [] },
    previousReportData: null,
    currentReportText: 'Age: 54',
    previousReportText: ''
  });

  const ageConflict = conflicts.find(c => c.category === 'DEMOGRAPHIC_MISMATCH');
  assert.ok(ageConflict, 'Must detect age discrepancy between 45 and 54');
});
