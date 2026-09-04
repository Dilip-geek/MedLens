import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretValueAgainstRange, parseReferenceRange, STATUS_CODES } from '../server/pipeline/rangeAnalyzer.js';

test('RangeAnalyzer correctly identifies Normal, Low, High', () => {
  // Interval
  const resLow = interpretValueAgainstRange(10.2, '13.0 - 17.5');
  assert.equal(resLow.status, STATUS_CODES.LOW);
  assert.equal(resLow.isOutOfRange, true);

  const resNormal = interpretValueAgainstRange(14.5, '13.0 - 17.5');
  assert.equal(resNormal.status, STATUS_CODES.NORMAL);
  assert.equal(resNormal.isOutOfRange, false);

  const resHigh = interpretValueAgainstRange(18.2, '13.0 - 17.5');
  assert.equal(resHigh.status, STATUS_CODES.HIGH);
  assert.equal(resHigh.isOutOfRange, true);

  // Upper bound
  const cholHigh = interpretValueAgainstRange(220, '< 200');
  assert.equal(cholHigh.status, STATUS_CODES.HIGH);
  assert.equal(cholHigh.isOutOfRange, true);

  // Lower bound
  const egfrLow = interpretValueAgainstRange(45, '> 60');
  assert.equal(egfrLow.status, STATUS_CODES.LOW);
  assert.equal(egfrLow.isOutOfRange, true);
});

test('RangeAnalyzer strictly refuses to invent reference ranges when missing from source', () => {
  const missingA = interpretValueAgainstRange(440, null);
  assert.equal(missingA.status, STATUS_CODES.NO_RANGE);
  assert.equal(missingA.referenceRange, null);
  assert.equal(missingA.statusLabel, 'No reference range in report');

  const missingB = interpretValueAgainstRange(15, '');
  assert.equal(missingB.status, STATUS_CODES.NO_RANGE);
  assert.equal(missingB.referenceRange, null);

  const missingC = interpretValueAgainstRange(7, 'Not Provided');
  assert.equal(missingC.status, STATUS_CODES.NO_RANGE);
  assert.equal(missingC.referenceRange, null);
});
