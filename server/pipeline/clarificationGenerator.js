// MedLens Clarification Questions Generator
// Generates 3-5 targeted, patient-actionable clarification questions based on
// missing, incomplete, or conflicting information.
// Strict rule: These are questions to organize information, NOT medical advice or diagnosis.

export function generateClarificationQuestions({ intake, parameters, conflicts, longitudinalData }) {
  const questions = [];

  // Helper to add question
  const addQuestion = ({ category, urgency, question, context, fieldTarget }) => {
    // Avoid duplicate questions
    if (!questions.some(q => q.question === question)) {
      questions.push({
        id: `cq_${Math.random().toString(36).substring(2, 9)}`,
        category, // 'Allergy Confirmation' | 'Medication Reconciliation' | 'Test Protocol' | 'Clinical History' | 'Reference Interval'
        urgency,  // 'High' | 'Medium' | 'Routine'
        question,
        context,
        fieldTarget,
        userResponse: '',
        isAnswered: false
      });
    }
  };

  // 1. Questions from High-Priority Conflicts (Allergies)
  const allergyConflicts = conflicts.filter(c => c.category === 'ALLERGY_CONFLICT');
  for (const ac of allergyConflicts) {
    addQuestion({
      category: 'Allergy Confirmation',
      urgency: 'High',
      question: `Our records found a past reference to a reaction to ${ac.title.replace('Unreported Potential Allergy: ', '')}. Have you ever experienced an allergic reaction or side effect to this medication?`,
      context: 'Ensuring your allergy profile is completely up to date protects against accidental adverse exposures during care.',
      fieldTarget: 'allergies'
    });
  }

  // 2. Questions from Medication Conflicts
  const medConflicts = conflicts.filter(c => c.category === 'MEDICATION_CONFLICT');
  for (const mc of medConflicts) {
    const medName = mc.title.replace('Omitted Active Medication: ', '');
    addQuestion({
      category: 'Medication Reconciliation',
      urgency: 'Medium',
      question: `Are you currently taking ${medName}, or was this medication previously paused or stopped by your doctor?`,
      context: 'Medical records mention this medication, but it was not listed in your current intake form.',
      fieldTarget: 'medications'
    });
  }

  // 3. Fasting Status Question (if Glucose or Lipid panel is present and out of range)
  const fastingGlucose = parameters.find(p => p.canonicalName === 'Fasting Blood Glucose');
  const lipidParams = parameters.filter(p => p.panel === 'Lipid Profile' && p.isOutOfRange);

  if (fastingGlucose && fastingGlucose.isOutOfRange) {
    addQuestion({
      category: 'Test Protocol Verification',
      urgency: 'Medium',
      question: `Was this blood test completed after fasting (no food or drinks other than water for 8 to 12 hours prior)?`,
      context: `Fasting status significantly influences blood glucose (${fastingGlucose.observedValue} ${fastingGlucose.unit}) and triglyceride values.`,
      fieldTarget: 'parameters'
    });
  } else if (lipidParams.length > 0) {
    addQuestion({
      category: 'Test Protocol Verification',
      urgency: 'Routine',
      question: 'Were you instructed to fast before this lipid blood draw, and did you have any high-fat meals the evening prior?',
      context: 'Triglycerides and calculated LDL cholesterol can vary markedly depending on recent caloric intake.',
      fieldTarget: 'parameters'
    });
  }

  // 4. Missing Reference Range Questions
  const missingRangeParams = parameters.filter(p => p.status === 'NO_RANGE_REPORTED');
  if (missingRangeParams.length > 0) {
    const sampleNames = missingRangeParams.slice(0, 2).map(p => p.canonicalName).join(' and ');
    addQuestion({
      category: 'Reference Interval Context',
      urgency: 'Routine',
      question: `Does your laboratory copy list the specific reference range or lab normal interval for ${sampleNames}?`,
      context: 'Different diagnostic laboratories use distinct analyzer calibrations; knowing the exact laboratory range ensures accurate interpretation.',
      fieldTarget: 'referenceRange'
    });
  }

  // 5. Significant Longitudinal Swing Question
  const swingConflicts = conflicts.filter(c => c.category === 'CLINICAL_SWING');
  for (const sc of swingConflicts) {
    addQuestion({
      category: 'Clinical Trend Follow-up',
      urgency: 'High',
      question: `Have you recently changed any prescription dosages, experienced dehydration, or had acute illness between this report and your prior visit?`,
      context: `Your results show a notable change (${sc.description}). Contextual details will help your physician evaluate this shift.`,
      fieldTarget: 'clinicalNotes'
    });
  }

  // 6. Incomplete Intake Check (Fallback if fewer than 3 questions)
  if (questions.length < 3) {
    if (!intake?.symptoms || intake.symptoms.trim().length === 0) {
      addQuestion({
        category: 'Clinical History',
        urgency: 'Routine',
        question: 'Are there any specific symptoms, fatigue, or changes in how you feel that prompted these lab tests?',
        context: 'Connecting current symptoms to laboratory parameters helps provide a coherent overview for your doctor visit.',
        fieldTarget: 'symptoms'
      });
    }
  }

  if (questions.length < 3) {
    addQuestion({
      category: 'Medication Reconciliation',
      urgency: 'Routine',
      question: 'Are you currently taking any over-the-counter vitamins, herbal supplements, or pain relievers?',
      context: 'Supplements such as Biotin, Iron, or NSAIDs can sometimes interact with laboratory assays.',
      fieldTarget: 'medications'
    });
  }

  // Return top 3 - 5 questions
  return questions.slice(0, 5);
}
