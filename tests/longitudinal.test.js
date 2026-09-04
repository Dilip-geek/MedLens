import test from 'node:test';
import assert from 'node:assert/strict';
import { compareReports } from '../server/pipeline/longitudinalComparator.js';

test('LongitudinalComparator computes deltas, percentages, and trends', () => {
  const currentParams = [
    {
      id: 'p1',
      canonicalName: 'Hemoglobin',
      panel: 'Hematology & CBC',
      observedValue: 10.2,
      unit: 'g/dL',
      status: 'LOW',
      statusLabel: 'Below reported range',
      rawRangeText: '13.0 - 17.5',
      isOutOfRange: true
    },
    {
      id: 'p2',
      canonicalName: 'Serum Creatinine',
      panel: 'Metabolic & Renal Profile',
      observedValue: 1.4,
      unit: 'mg/dL',
      status: 'HIGH',
      statusLabel: 'Above reported range',
      rawRangeText: '0.6 - 1.2',
      isOutOfRange: true
    },
    {
      id: 'p3',
      canonicalName: 'Platelet Count',
      panel: 'Hematology & CBC',
      observedValue: 240,
      unit: 'x10^3/uL',
      status: 'NORMAL',
      statusLabel: 'Within reported range',
      rawRangeText: '150 - 450',
      isOutOfRange: false
    }
  ];

  const previousParams = [
    {
      id: 'prev1',
      canonicalName: 'Hemoglobin',
      panel: 'Hematology & CBC',
      observedValue: 11.1,
      unit: 'g/dL',
      status: 'LOW',
      statusLabel: 'Below reported range',
      rawRangeText: '13.0 - 17.5',
      isOutOfRange: true
    },
    {
      id: 'prev2',
      canonicalName: 'Serum Creatinine',
      panel: 'Metabolic & Renal Profile',
      observedValue: 0.9,
      unit: 'mg/dL',
      status: 'NORMAL',
      statusLabel: 'Within reported range',
      rawRangeText: '0.6 - 1.2',
      isOutOfRange: false
    },
    {
      id: 'prev4',
      canonicalName: 'Total Cholesterol',
      panel: 'Lipid Profile',
      observedValue: 190,
      unit: 'mg/dL',
      status: 'NORMAL',
      statusLabel: 'Within reported range',
      rawRangeText: '< 200',
      isOutOfRange: false
    }
  ];

  const result = compareReports(currentParams, previousParams);
  assert.equal(result.hasComparison, true);

  // Hemoglobin: 11.1 -> 10.2 => delta -0.9, decreased
  const hbComp = result.items.find(i => i.canonicalName === 'Hemoglobin');
  assert.ok(hbComp);
  assert.equal(hbComp.delta, -0.9);
  assert.equal(hbComp.trendDirection, 'decreased');

  // Serum Creatinine: 0.9 -> 1.4 => delta +0.5, increased
  const crComp = result.items.find(i => i.canonicalName === 'Serum Creatinine');
  assert.ok(crComp);
  assert.equal(crComp.delta, 0.5);
  assert.equal(crComp.trendDirection, 'increased');

  // Platelet Count: newly appearing (not in previous)
  const pltComp = result.items.find(i => i.canonicalName === 'Platelet Count');
  assert.ok(pltComp);
  assert.equal(pltComp.category, 'newly_appearing');

  // Total Cholesterol: discontinued/omitted (in previous but not current)
  const cholComp = result.items.find(i => i.canonicalName === 'Total Cholesterol');
  assert.ok(cholComp);
  assert.equal(cholComp.category, 'discontinued_or_omitted');
});
