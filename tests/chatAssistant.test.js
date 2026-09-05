import test from 'node:test';
import assert from 'node:assert/strict';
import { processChatMessage } from '../server/pipeline/chatAssistant.js';

test('ChatAssistant: offline mode returns deterministic record-grounded answer with parameter details', async () => {
  const mockRecord = {
    intake: {
      name: 'John Smith',
      age: 52,
      sex: 'Male',
      symptoms: 'Fatigue, increased thirst'
    },
    parameters: [
      {
        id: 'p1',
        canonicalName: 'Fasting Blood Glucose',
        observedValue: 168,
        unit: 'mg/dL',
        status: 'HIGH',
        statusLabel: 'Above reported range',
        rawRangeText: '70 - 99',
        isOutOfRange: true
      },
      {
        id: 'p2',
        canonicalName: 'Hemoglobin A1c',
        observedValue: 7.8,
        unit: '%',
        status: 'HIGH',
        statusLabel: 'Above reported range',
        rawRangeText: '4.0 - 5.6',
        isOutOfRange: true
      }
    ],
    conflicts: [],
    clarificationQuestions: []
  };

  const response = await processChatMessage({
    apiKey: null, // Force offline deterministic mode
    message: 'What are my abnormal lab results?',
    record: mockRecord
  });

  assert.ok(response);
  assert.ok(response.reply);
  assert.ok(response.reply.includes('Fasting Blood Glucose') || response.reply.includes('Glucose'));
  assert.ok(response.reply.includes('168'));
  assert.ok(!response.reply.toLowerCase().includes('i diagnose you with'));
});

test('ChatAssistant: maintains non-prescriptive safety boundary when asked about medication', async () => {
  const mockRecord = {
    intake: { name: 'Alice' },
    parameters: [],
    conflicts: []
  };

  const response = await processChatMessage({
    apiKey: null,
    message: 'What medicine should I take for high glucose?',
    record: mockRecord
  });

  assert.ok(response.reply);
  // Must advise consulting a doctor or healthcare provider, not prescribe
  assert.ok(
    response.reply.toLowerCase().includes('doctor') ||
    response.reply.toLowerCase().includes('physician') ||
    response.reply.toLowerCase().includes('healthcare') ||
    response.reply.toLowerCase().includes('prescribe') ||
    response.reply.toLowerCase().includes('clinician')
  );
});

test('ChatAssistant: handles empty or missing record gracefully', async () => {
  const response = await processChatMessage({
    apiKey: null,
    message: 'Hello, what does MedLens do?',
    record: null
  });

  assert.ok(response.reply);
  assert.ok(response.reply.length > 20);
});
