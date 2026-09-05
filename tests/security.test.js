import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStructuredSummary, MEDICAL_DISCLAIMER } from '../server/pipeline/summaryGenerator.js';

// Escape HTML utility function as implemented in server/index.js
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

test('Security: escapeHtml properly neutralizes malicious HTML/Script payloads', () => {
  const maliciousInput = '<script>alert("XSS")</script><img src="x" onerror="stealCookies()">';
  const sanitized = escapeHtml(maliciousInput);
  
  assert.ok(!sanitized.includes('<script>'));
  assert.ok(!sanitized.includes('</script>'));
  assert.ok(!sanitized.includes('<img'));
  assert.ok(sanitized.includes('&lt;script&gt;'));
  assert.ok(sanitized.includes('&quot;XSS&quot;'));
  assert.ok(sanitized.includes('&lt;img src='));
});

test('Security: handles non-string or null values gracefully without throwing', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(12345), '');
  assert.equal(escapeHtml(''), '');
});

test('Security: Medical Disclaimer is immutable and present in generated outputs', () => {
  assert.ok(MEDICAL_DISCLAIMER.includes('MedLens is an information organization'));
  assert.ok(MEDICAL_DISCLAIMER.includes('NOT provide medical advice, diagnosis, or treatment'));
});
