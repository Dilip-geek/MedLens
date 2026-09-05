// MedLens Gemini AI Enhancement Engine
// Uses Google GenAI SDK with gemini-3.6-flash for enhanced entity extraction,
// complex narrative synthesis, and natural clarification questions.

import { GoogleGenAI } from '@google/genai';

export async function enhanceWithGemini({ apiKey, intake, currentReportText, previousReportText, baseData }) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!activeKey) {
    return {
      enhanced: false,
      reason: 'No Gemini API Key provided. Using local clinical intelligence engine.'
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });

    const prompt = `You are an AI medical record intelligence assistant for MedLens.
Your task is to review the following patient intake and medical reports to provide:
1. Additional complex clinical observations or physician narrative notes not captured in tables.
2. A warm, clear, patient-centered, strictly NON-DIAGNOSTIC overview.
3. Enhanced clarification questions for the patient's next doctor visit.

CRITICAL SAFETY RULES:
- DO NOT diagnose any disease (do NOT say "You have diabetes" or "You are suffering from kidney failure").
- DO NOT prescribe, recommend, or adjust any medication or dosage.
- DO NOT claim certainty about clinical outcome.
- Clearly differentiate source document facts from conversational summary.
- If reference ranges are missing in the report, DO NOT invent them.

Patient Intake:
${JSON.stringify(intake, null, 2)}

Current Report Text:
${currentReportText}

${previousReportText ? `Previous Report Text:\n${previousReportText}` : ''}

Respond in pure valid JSON with the following schema:
{
  "narrative": "Patient-friendly summary string",
  "additionalObservations": ["observation 1", "observation 2"],
  "tailoredQuestions": [
    {
      "category": "Medication / Allergy / Test Protocol",
      "question": "Question text",
      "context": "Context rationale"
    }
  ]
}`;

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 350
      }
    });

    // 4.5 second timeout safeguard so users never experience sluggish UI hangs
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini latency safeguard triggered (exceeded 4.5s). Local clinical engine active.')), 4500)
    );

    const response = await Promise.race([apiPromise, timeoutPromise]);

    const text = response.text;
    const parsed = JSON.parse(text);

    return {
      enhanced: true,
      model: 'gemini-3.6-flash',
      geminiData: parsed
    };
  } catch (err) {
    console.warn('Gemini enhancement warning (graceful fast fallback active):', err.message);
    return {
      enhanced: false,
      reason: `Gemini API call skipped: ${err.message}`
    };
  }
}
