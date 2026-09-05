import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testSpeed() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const t0 = Date.now();
  const prompt = `You are MedLens AI. Write a concise 2-sentence patient-friendly non-diagnostic summary.
Patient: John Doe, Age 45.
Lab Findings: Fasting Glucose 142 mg/dL (HIGH), Total Cholesterol 235 mg/dL (HIGH).
Respond in pure JSON:
{
  "narrative": "concise patient overview",
  "additionalObservations": ["observation 1"]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: 300
    }
  });

  const duration = Date.now() - t0;
  console.log(`Finished in ${duration}ms!`);
  console.log('Result:', response.text);
}

testSpeed();
