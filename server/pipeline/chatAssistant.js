// MedLens Grounded Clinical AI Chat Assistant
// Conversational engine powered by Google Gemini with a deterministic clinical fallback.
// Answers patient inquiries about their structured medical record with strict safety guards.

import { GoogleGenAI } from '@google/genai';

export async function processChatMessage({ apiKey, message, conversationHistory = [], record = null }) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // If no Gemini key is provided, use deterministic record-grounded answering engine
  if (!activeKey) {
    return generateDeterministicReply(message, record);
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

    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        maxOutputTokens: 600
      }
    });

    const reply = response.text || "I was unable to generate a response. Please try rephrasing your question.";

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
    console.warn('Gemini chat assistant notice (switching to local intelligence):', err.message);
    const fallback = generateDeterministicReply(message, record);
    return {
      reply: `*(MedLens Clinical Intelligence Assistant)*\n\n${fallback.reply}`,
      suggestedQuestions: fallback.suggestedQuestions
    };
  }
}

/**
 * Deterministic Record-Grounded Answering Engine (Runs 100% offline without API key)
 */
function generateDeterministicReply(message, record) {
  const lower = (message || '').toLowerCase();

  // Knowledge Base: Reference Ranges
  if (lower.includes('reference range') || lower.includes('normal range') || lower.includes('reference interval') || lower.includes('how do reference ranges work')) {
    return {
      reply: `### 🧪 How Laboratory Reference Ranges Work

A **reference range** (or reference interval) is a set of values that 95% of a healthy population falls into for a specific laboratory test.

Here is how to understand them:

1. **Laboratory-Specific Calibrations**: Different laboratories use different analytical instruments, testing reagents, and methodologies. A "normal" range printed on Lab A's report may slightly differ from Lab B.
2. **Demographic Factors**: Reference ranges often account for age, biological sex, and physiological states (e.g., fasting status or pregnancy).
3. **Outside the Range $\neq$ Automatic Diagnosis**: Having a value slightly above or below a printed reference interval does **not** automatically mean an illness is present; it simply alerts your clinician to review the parameter in your overall clinical context.
4. **Missing Reference Ranges**: Some tests (such as observational smears, cultures, or qualitative assays) do not include numerical reference intervals. **MedLens strictly refuses to assume or invent missing ranges** to preserve medical integrity.

---
💡 *Always discuss out-of-range results with your physician, who will interpret them alongside your symptoms, physical exam, and health history.*`,
      suggestedQuestions: [
        "What is Fasting Blood Sugar?",
        "What is a Complete Blood Count (CBC)?",
        "What is a Lipid Profile?"
      ]
    };
  }

  // Knowledge Base: Glucose & HbA1c
  if (lower.includes('glucose') || lower.includes('blood sugar') || lower.includes('hba1c') || lower.includes('a1c')) {
    return {
      reply: `### 🩸 Understanding Blood Glucose & HbA1c

* **Fasting Blood Glucose**: Measures the amount of glucose (sugar) in your bloodstream after an overnight fast (typically 8–12 hours without food or caloric drinks).
  * *Standard reported fasting range:* Usually \`70 – 99 mg/dL\`.
* **Hemoglobin A1c (HbA1c)**: Measures the average percentage of your red blood cells coated with sugar over the past 2 to 3 months (the lifespan of a red blood cell).
  * *Standard reported reference range:* Usually \`4.0 – 5.6%\`.

---
💡 *If your report shows elevated glucose or A1c, your clinician can help assess factors like dietary intake, family history, and medication history.*`,
      suggestedQuestions: [
        "How do reference ranges work?",
        "What questions should I ask my doctor?",
        "What is a Lipid Profile?"
      ]
    };
  }

  // Knowledge Base: Complete Blood Count (CBC)
  if (lower.includes('cbc') || lower.includes('complete blood count') || lower.includes('hemoglobin') || lower.includes('platelet') || lower.includes('white blood')) {
    return {
      reply: `### 🩸 Understanding a Complete Blood Count (CBC)

A **Complete Blood Count** evaluates the cells circulating in your bloodstream:

* **Hemoglobin (Hb / Hgb) & Hematocrit (Hct)**: Oxygen-carrying proteins inside red blood cells.
* **White Blood Cell Count (WBC)**: Immune cells that fight infections and inflammation.
* **Platelets (PLT)**: Cell fragments responsible for forming blood clots to stop bleeding.
* **RBC Indices (MCV, MCH, MCHC)**: Describe the size and hemoglobin concentration of individual red blood cells.

---
💡 *CBC values can temporarily shift due to hydration status, altitude, viral infections, or intense exercise.*`,
      suggestedQuestions: [
        "How do reference ranges work?",
        "What is a Lipid Profile?",
        "What questions should I ask my doctor?"
      ]
    };
  }

  // Knowledge Base: Lipid Profile / Cholesterol
  if (lower.includes('lipid') || lower.includes('cholesterol') || lower.includes('triglyceride') || lower.includes('hdl') || lower.includes('ldl')) {
    return {
      reply: `### 🫀 Understanding a Lipid Profile

A **Lipid Profile** measures fats (lipids) in your blood to help evaluate cardiovascular health:

* **Total Cholesterol**: The overall amount of cholesterol in your blood (typically target $< 200\text{ mg/dL}$).
* **HDL Cholesterol ("Good")**: Helps remove excess cholesterol from your bloodstream back to the liver for disposal (typically $> 40\text{ mg/dL}$ in men, $> 50\text{ mg/dL}$ in women).
* **LDL Cholesterol ("Bad")**: Can build up in the walls of your arteries over time (typically target $< 100\text{ mg/dL}$).
* **Triglycerides**: A type of fat stored from unused calories (typically $< 150\text{ mg/dL}$).

---
💡 *Fasting for 9–12 hours before a lipid draw ensures the most accurate triglyceride measurement.*`,
      suggestedQuestions: [
        "How do reference ranges work?",
        "What is Fasting Blood Sugar?",
        "What questions should I ask my doctor?"
      ]
    };
  }

  if (!record) {
    return {
      reply: `### 🏥 MedLens Clinical Information Intelligence Assistant

I am ready to help you navigate and understand your medical records and laboratory tests.

**To explore personalized findings from your medical documents:**
1. Fill in the **Patient Intake Form** or select a sample case from the top bar.
2. Click **"Transform & Structure Medical Information"** to process the record.
3. Re-open this chat to inspect parameters, longitudinal trends, and doctor discussion points.

**General Clinical Topics You Can Ask About Anytime:**
* *"How do reference ranges work?"*
* *"What is Fasting Glucose and HbA1c?"*
* *"What is a Complete Blood Count (CBC)?"*
* *"What is a Lipid Profile?"*`,
      suggestedQuestions: [
        "How do reference ranges work?",
        "What is Fasting Blood Sugar?",
        "What is a Complete Blood Count (CBC)?"
      ]
    };
  }

  const outOfRange = (record.parameters || []).filter(p => p.isOutOfRange);
  const conflicts = record.conflicts || [];
  const questions = record.clarificationQuestions || [];
  const longitudinal = record.longitudinal;

  // 1. Inquiries about abnormal / out of range results
  if (lower.includes('abnormal') || lower.includes('out-of-range') || lower.includes('high') || lower.includes('low') || lower.includes('out of range')) {
    if (outOfRange.length === 0) {
      return {
        reply: `### 📊 Laboratory Results Review for **${record.intake?.name || 'Patient'}**

All **${record.parameters.length}** extracted laboratory parameters with reported reference ranges are currently within their expected normal intervals.

> **Important Note:** Reference ranges reflect the specific laboratory's calibration and should be reviewed in the context of your overall clinical picture with your doctor.`,
        suggestedQuestions: ["What questions should I ask my doctor?", "Compare with previous test"]
      };
    }

    const items = outOfRange.map(p => 
      `- **${p.canonicalName}**: **${p.observedValue} ${p.unit}** (${p.statusLabel})\n  *Reported Reference Range:* \`${p.rawRangeText || 'None reported'}\`\n  *Observation:* ${p.interpretation}`
    ).join('\n\n');

    return {
      reply: `### ⚠️ Findings Outside Reported Reference Ranges

Here are the parameters from your report that differ from the laboratory's printed reference intervals:

${items}

---
💡 **Clinical Discussion Advice:** These values do not constitute a diagnosis on their own. We recommend noting these specific parameters down for discussion with your healthcare provider.`,
      suggestedQuestions: [
        "What questions should I ask my doctor?",
        "Explain any conflicts in my record",
        "Compare with previous test"
      ]
    };
  }

  // 2. Doctor consultation questions
  if (lower.includes('ask') || lower.includes('doctor') || lower.includes('physician') || lower.includes('appointment') || lower.includes('consultation')) {
    const qList = questions.length > 0 
      ? questions.map((q, idx) => `${idx + 1}. **${q.question}**\n   *Reason:* ${q.reason}`).join('\n\n')
      : "1. How do my current laboratory results relate to my reported symptoms?\n2. Are there any follow-up tests or lifestyle recommendations you suggest?";

    return {
      reply: `### 📋 Topics & Questions for Your Doctor's Appointment

Based on your intake profile and extracted laboratory findings, here are targeted questions you can ask during your consultation:

${qList}

---
*MedLens is an information intelligence tool. Bring your original laboratory report to your appointment.*`,
      suggestedQuestions: [
        "Explain my out-of-range results",
        "Explain any conflicts in my record"
      ]
    };
  }

  // 3. Inconsistency / Conflict inquiries
  if (lower.includes('conflict') || lower.includes('inconsistenc') || lower.includes('allergy') || lower.includes('mismatch')) {
    if (conflicts.length === 0) {
      return {
        reply: `### ✅ Inconsistency Audit

No cross-source contradictions were detected across your intake profile, current report, and prior baseline. All demographic, allergy, and medication data align.`,
        suggestedQuestions: ["Explain my out-of-range results", "What questions should I ask my doctor?"]
      };
    }

    const cList = conflicts.map(c => 
      `- **[${c.severity} Priority] ${c.title}**\n  ${c.description}\n  *Status:* ${c.resolved ? '✅ Resolved' : '⚠️ Unresolved — Requires clarification'}`
    ).join('\n\n');

    return {
      reply: `### ⚠️ Detected Cross-Source Inconsistencies

MedLens flagged the following discrepancies between your intake and laboratory documents:

${cList}

You can resolve or verify these using the **Human Review** modal in the main dashboard.`,
      suggestedQuestions: ["What questions should I ask my doctor?", "Explain my out-of-range results"]
    };
  }

  // 4. Longitudinal / Historical comparison inquiries
  if (lower.includes('compare') || lower.includes('previous') || lower.includes('trend') || lower.includes('delta') || lower.includes('history')) {
    if (!longitudinal || !longitudinal.hasComparison) {
      return {
        reply: `### 📈 Longitudinal Trend Analysis

Only a **single report** is currently loaded. To view comparative trends, deltas, and percentage shifts over time, upload or paste a **Previous Baseline Report** in the *Medical & Laboratory Reports* section and re-run the pipeline.`,
        suggestedQuestions: ["Explain my out-of-range results", "What questions should I ask my doctor?"]
      };
    }

    const shifts = (longitudinal.items || []).filter(i => i.trendDirection !== 'stable');
    const shiftList = shifts.length > 0
      ? shifts.map(s => `- **${s.canonicalName}**: ${s.previousValue} ${s.unit} ➔ **${s.currentValue} ${s.unit}** (${s.delta > 0 ? '+' : ''}${s.delta} ${s.unit}, ${s.percentChange > 0 ? '+' : ''}${s.percentChange}%) — *${s.trendLabel}*`).join('\n')
      : "All tracked parameters remained stable relative to baseline.";

    return {
      reply: `### 📈 Longitudinal Comparison Summary

**Tracked Parameters:** ${longitudinal.stats.totalCompared} total (${longitudinal.stats.increased} increased, ${longitudinal.stats.decreased} decreased, ${longitudinal.stats.stable} stable).

**Key Shifts:**
${shiftList}

*Review the "Longitudinal Trends" tab for visual trend bars.*`,
      suggestedQuestions: ["Explain my out-of-range results", "What questions should I ask my doctor?"]
    };
  }

  // Default record overview
  return {
    reply: `### 🩺 MedLens Clinical Overview for **${record.intake?.name || 'Patient'}**

- **Total Extracted Parameters:** ${record.parameters.length}
- **Out of Reference Range:** ${outOfRange.length} parameter(s)
- **Cross-Source Inconsistencies:** ${conflicts.length} flagged
- **Targeted Doctor Questions:** ${questions.length} generated

**Patient-Friendly Summary:**
${record.summary?.narrative || 'Structured record processed successfully.'}

---
*Ask any follow-up question below, or configure a Gemini API key in **⚙️ Settings** for free-form AI conversation.*`,
    suggestedQuestions: [
      "Explain my out-of-range results",
      "What questions should I ask my doctor?",
      "Compare with previous test"
    ]
  };
}
