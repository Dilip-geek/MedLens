// MedLens Grounded Clinical AI Chat Assistant
// Grounded conversational engine powered by Gemini 3.6 Flash.
// Answers patient inquiries about their structured medical record with strict safety guards.

import { GoogleGenAI } from '@google/genai';

export async function processChatMessage({ apiKey, message, conversationHistory = [], record = null }) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!activeKey) {
    return {
      reply: "I am MedLens Clinical Assistant. To enable live AI conversation, please configure a Gemini API key in the settings, or review the structured tabs above.",
      suggestedQuestions: []
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });

    // Build context summary from active patient record
    let recordContext = "No active record loaded. The user may ask general medical terminology questions.";
    if (record) {
      const outOfRangeList = (record.parameters || [])
        .filter(p => p.isOutOfRange)
        .map(p => `${p.canonicalName}: ${p.observedValue} ${p.unit} (${p.statusLabel}, reported range: ${p.rawRangeText || 'None in report'})`)
        .join('; ');

      const normalList = (record.parameters || [])
        .filter(p => p.status === 'NORMAL')
        .map(p => `${p.canonicalName}: ${p.observedValue} ${p.unit}`)
        .join('; ');

      const conflictsList = (record.conflicts || [])
        .map(c => `[${c.severity} Priority] ${c.title}: ${c.description}`)
        .join('; ');

      const longitudinalList = (record.longitudinal?.items || [])
        .filter(i => i.trendDirection !== 'stable')
        .map(i => `${i.canonicalName}: ${i.statusTransition} (delta: ${i.delta > 0 ? '+' : ''}${i.delta} ${i.unit})`)
        .join('; ');

      recordContext = `
ACTIVE PATIENT CONTEXT:
- Patient Demographics: ${record.intake?.name || 'N/A'}, Age: ${record.intake?.age || 'N/A'}, Sex: ${record.intake?.sex || 'N/A'}
- Reported Symptoms: ${record.intake?.symptoms || 'None'}
- Existing Conditions: ${record.intake?.conditions || 'None'}
- Known Allergies: ${record.intake?.allergies || 'None'}
- Current Medications: ${record.intake?.medications || 'None'}
- Parameters Outside Reported Reference Ranges: ${outOfRangeList || 'None'}
- Normal Parameters: ${normalList || 'None'}
- Flagged Inconsistencies / Conflicts: ${conflictsList || 'None'}
- Notable Longitudinal Shifts: ${longitudinalList || 'Single report mode / no shifts'}
`;
    }

    const systemInstruction = `You are MedLens AI, a specialized clinical information intelligence assistant.
Your purpose is to help patients and caregivers understand their structured medical records, laboratory parameters, and report trends in clear, compassionate, and transparent language.

MANDATORY SAFETY BOUNDARIES:
1. NON-DIAGNOSTIC: You are an information tool, NOT a physician. NEVER diagnose medical conditions (e.g. do not say "You have diabetes", instead say "Your Fasting Glucose is above the reported reference range, which is often discussed with a physician regarding blood sugar regulation").
2. NON-PRESCRIPTIVE: NEVER recommend starting, stopping, or altering medication dosages.
3. REFERENCE RANGE HONESTY: Only discuss reference ranges that were present in the source report. If a range was missing from the report, explicitly note that and do not invent one.
4. CITATION & TRACEABILITY: Whenever mentioning a parameter, cite the value and whether it was reported in the current or previous report.
5. APPOINTMENT PREPARATION: Frame explanations around empowering the patient to have an informed, constructive conversation with their doctor.

Format your response cleanly with markdown bolding, bullet points where helpful, and a short empathetic closing.`;

    // Format chat history
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\n${recordContext}\n\nPlease review this context and prepare to answer questions.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I am MedLens AI, ready to help you navigate and understand your medical record, laboratory findings, and trend history within strict non-diagnostic safety guidelines. How can I assist you today?" }]
      }
    ];

    // Add prior turns
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents
    });

    const reply = response.text || "I was unable to generate a response. Please try rephrasing your question.";

    // Generate 3 contextual follow-up prompt chips
    const suggestedQuestions = [];
    if (record?.summary?.outOfRangeCount > 0) {
      suggestedQuestions.push("Explain my out-of-range results");
    }
    if (record?.longitudinal?.hasComparison) {
      suggestedQuestions.push("Compare my results with the previous test");
    }
    if (record?.conflicts?.length > 0) {
      suggestedQuestions.push("Explain the allergy or medication conflict");
    }
    suggestedQuestions.push("What questions should I ask my doctor?");

    return {
      reply,
      suggestedQuestions: suggestedQuestions.slice(0, 3)
    };
  } catch (err) {
    console.error('Gemini Chat Assistant error:', err);
    return {
      reply: `MedLens Assistant encountered a temporary communication issue: ${err.message}. Please verify your network connection.`,
      suggestedQuestions: ["Explain what reference ranges mean", "What is an eGFR test?"]
    };
  }
}
