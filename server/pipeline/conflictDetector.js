// MedLens Inconsistency & Conflict Detection Engine
// Flags contradictions across patient intake, current laboratory report, and historical records.
// The system flags potential conflicts rather than deciding which information is medically correct.

export function detectConflicts({ intake, currentReportData, previousReportData, currentReportText, previousReportText }) {
  const conflicts = [];

  // Helper to add conflict
  const addConflict = ({ category, severity, title, description, sources, suggestedAction }) => {
    conflicts.push({
      id: `conflict_${Math.random().toString(36).substring(2, 9)}`,
      category,
      severity, // 'HIGH' | 'MODERATE' | 'LOW'
      title,
      description,
      sources,
      suggestedAction,
      resolved: false,
      resolutionNotes: '',
      resolvedBy: null,
      resolvedAt: null
    });
  };

  // 1. ALLERGY CONFLICTS
  // Check if intake says "None" or "NKDA" but reports mention allergies (Penicillin, Sulfa, Aspirin, etc.)
  const intakeAllergies = (intake?.allergies || '').trim().toLowerCase();
  const rawCombinedReports = `${currentReportText || ''} ${previousReportText || ''}`.toLowerCase();

  const commonAllergens = [
    { name: 'Penicillin', aliases: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin'] },
    { name: 'Sulfa / Sulfonamides', aliases: ['sulfa', 'sulfonamide', 'bactrim', 'septra'] },
    { name: 'Aspirin / NSAIDs', aliases: ['aspirin', 'ibuprofen', 'nsaid', 'naproxen'] },
    { name: 'Codeine / Opioids', aliases: ['codeine', 'morphine', 'oxycodone'] },
    { name: 'Latex', aliases: ['latex'] },
    { name: 'Iodine / Contrast Media', aliases: ['iodine', 'contrast dye', 'radiocontrast'] }
  ];

  const intakeClaimsNoAllergies = intakeAllergies === 'none' || intakeAllergies === 'nkda' || intakeAllergies === 'no known allergies' || intakeAllergies === 'nil' || intakeAllergies === '';

  for (const allergen of commonAllergens) {
    for (const alias of allergen.aliases) {
      // Look for explicit allergy statements in reports e.g. "Allergies: Penicillin" or "Allergic to Penicillin"
      const reportAllergyRegex = new RegExp(`(?:allergy|allergies|allergic\\s+to)[\\s:]*[^.\\r\\n]*?\\b${alias}\\b`, 'i');
      const match = rawCombinedReports.match(reportAllergyRegex);

      if (match) {
        if (intakeClaimsNoAllergies) {
          addConflict({
            category: 'ALLERGY_CONFLICT',
            severity: 'HIGH',
            title: `Unreported Potential Allergy: ${allergen.name}`,
            description: `Patient intake indicates "No known allergies", but medical records explicitly mention an allergy or adverse reaction to ${allergen.name}.`,
            sources: [
              { sourceName: 'Patient Intake', statement: intake.allergies || 'No known allergies reported', type: 'user_intake' },
              { sourceName: 'Medical Document', statement: match[0].trim(), type: 'report_record' }
            ],
            suggestedAction: `Clarify with patient or allergist whether they have an active hypersensitivity reaction to ${allergen.name}.`
          });
          break;
        } else if (!intakeAllergies.includes(alias)) {
          // Intake has allergies, but omitted this one
          addConflict({
            category: 'ALLERGY_CONFLICT',
            severity: 'MODERATE',
            title: `Discrepancy in Reported Allergies: ${allergen.name}`,
            description: `Patient listed "${intake.allergies}", but medical records additionally note ${allergen.name}.`,
            sources: [
              { sourceName: 'Patient Intake', statement: intake.allergies, type: 'user_intake' },
              { sourceName: 'Medical Document', statement: match[0].trim(), type: 'report_record' }
            ],
            suggestedAction: `Confirm if the allergy list should be updated to include ${allergen.name}.`
          });
          break;
        }
      }
    }
  }

  // 2. DEMOGRAPHIC CONFLICTS (Age Mismatch)
  if (intake?.age && currentReportData?.metadata?.age) {
    const intakeAge = parseInt(intake.age, 10);
    const reportAge = parseInt(currentReportData.metadata.age, 10);
    if (!isNaN(intakeAge) && !isNaN(reportAge) && Math.abs(intakeAge - reportAge) >= 1) {
      addConflict({
        category: 'DEMOGRAPHIC_MISMATCH',
        severity: 'MODERATE',
        title: 'Patient Age Discrepancy',
        description: `Intake form reports age as ${intakeAge}, while the current laboratory report indicates age ${reportAge}.`,
        sources: [
          { sourceName: 'Patient Intake', statement: `Age: ${intakeAge}`, type: 'user_intake' },
          { sourceName: 'Current Laboratory Report', statement: `Age: ${reportAge}`, type: 'current_report' }
        ],
        suggestedAction: 'Verify the patient date of birth to ensure the records correspond to the same individual.'
      });
    }
  }

  // 3. MEDICATION CONFLICTS & DISCREPANCIES
  const intakeMeds = (intake?.medications || '').toLowerCase();
  const rawReports = `${currentReportText || ''} ${previousReportText || ''}`;

  // Common chronic medications to cross-check
  const medPatterns = [
    { name: 'Metformin', pattern: /metformin(?:\s+(?:hcl|er|xr))?(?:\s+([0-9]+\s*(?:mg|g)))?/i },
    { name: 'Lisinopril', pattern: /lisinopril(?:\s+([0-9]+\s*mg))?/i },
    { name: 'Atorvastatin', pattern: /atorvastatin(?:\s+([0-9]+\s*mg))?/i },
    { name: 'Levothyroxine', pattern: /levothyroxine(?:\s+([0-9]+\s*(?:mcg|ug)))?/i },
    { name: 'Amlodipine', pattern: /amlodipine(?:\s+([0-9]+\s*mg))?/i },
    { name: 'Omeprazole', pattern: /omeprazole(?:\s+([0-9]+\s*mg))?/i },
    { name: 'Losartan', pattern: /losartan(?:\s+([0-9]+\s*mg))?/i }
  ];

  for (const med of medPatterns) {
    const reportMatch = rawReports.match(med.pattern);
    if (reportMatch) {
      const isMentionedInIntake = intakeMeds.includes(med.name.toLowerCase());
      if (!isMentionedInIntake && intakeMeds && intakeMeds !== 'none' && intakeMeds !== 'nil') {
        addConflict({
          category: 'MEDICATION_CONFLICT',
          severity: 'MODERATE',
          title: `Omitted Active Medication: ${med.name}`,
          description: `Medical records mention ${reportMatch[0]}, but it is not listed in the patient's current intake medication list.`,
          sources: [
            { sourceName: 'Patient Intake Medications', statement: intake.medications || 'None reported', type: 'user_intake' },
            { sourceName: 'Medical Document', statement: reportMatch[0], type: 'report_record' }
          ],
          suggestedAction: `Confirm whether the patient is currently actively taking ${med.name} or if it was recently discontinued.`
        });
      }
    }
  }

  // 4. MEDICAL CONDITION / DIAGNOSIS DISCREPANCY
  const intakeConditions = (intake?.conditions || '').toLowerCase();
  const conditionChecks = [
    { condition: 'Diabetes Mellitus', triggers: ['diabetes', 'dm2', 't2dm', 'type 2 diabetes'], labKey: 'Hemoglobin A1c (HbA1c)', labThreshold: 6.5 },
    { condition: 'Chronic Kidney Disease', triggers: ['ckd', 'kidney disease', 'renal insufficiency'], labKey: 'Estimated Glomerular Filtration Rate (eGFR)', labThreshold: 60, isBelow: true },
    { condition: 'Thyroid Disorder', triggers: ['hypothyroidism', 'hyperthyroidism', 'thyroid disease'], labKey: 'Thyroid Stimulating Hormone (TSH)', labThreshold: 5.0 }
  ];

  for (const check of conditionChecks) {
    const hasIntakeMention = check.triggers.some(t => intakeConditions.includes(t));
    if (!hasIntakeMention) {
      // Check if report text explicitly mentions the condition
      for (const t of check.triggers) {
        const regex = new RegExp(`\\b${t}\\b`, 'i');
        if (regex.test(rawCombinedReports)) {
          addConflict({
            category: 'CONDITION_DISCREPANCY',
            severity: 'LOW',
            title: `Medical History Discrepancy: ${check.condition}`,
            description: `Prior records or laboratory notes reference history of ${check.condition}, but this is not recorded under existing medical conditions in the intake form.`,
            sources: [
              { sourceName: 'Patient Intake Conditions', statement: intake.conditions || 'None stated', type: 'user_intake' },
              { sourceName: 'Medical Document Note', statement: `Mention of "${t}" found in records`, type: 'report_record' }
            ],
            suggestedAction: `Clarify with patient if ${check.condition} is an established active diagnosis.`
          });
          break;
        }
      }
    }
  }

  // 5. RAPID PHYSIOLOGICAL SWINGS (Longitudinal acute divergence)
  if (currentReportData?.parameters && previousReportData?.parameters) {
    const prevMap = new Map();
    previousReportData.parameters.forEach(p => prevMap.set(p.canonicalName, p));

    for (const curr of currentReportData.parameters) {
      const prev = prevMap.get(curr.canonicalName);
      if (prev && typeof curr.observedValue === 'number' && typeof prev.observedValue === 'number') {
        const diff = curr.observedValue - prev.observedValue;
        const pctChange = prev.observedValue !== 0 ? Math.abs((diff / prev.observedValue) * 100) : 0;

        // Creatinine swing > 40%
        if (curr.canonicalName === 'Serum Creatinine' && pctChange >= 40) {
          addConflict({
            category: 'CLINICAL_SWING',
            severity: 'HIGH',
            title: 'Significant Creatinine Divergence',
            description: `Serum Creatinine shifted from ${prev.observedValue} to ${curr.observedValue} ${curr.unit} (${pctChange.toFixed(1)}% change) between reports.`,
            sources: [
              { sourceName: 'Previous Report', statement: `${prev.observedValue} ${prev.unit}`, type: 'previous_report' },
              { sourceName: 'Current Report', statement: `${curr.observedValue} ${curr.unit}`, type: 'current_report' }
            ],
            suggestedAction: 'Surface this significant acute change to the treating clinician for renal function correlation.'
          });
        }

        // Hemoglobin drop > 2.0 g/dL
        if (curr.canonicalName === 'Hemoglobin' && diff <= -2.0) {
          addConflict({
            category: 'CLINICAL_SWING',
            severity: 'HIGH',
            title: 'Marked Hemoglobin Reduction',
            description: `Hemoglobin decreased by ${Math.abs(diff).toFixed(1)} g/dL (from ${prev.observedValue} to ${curr.observedValue} g/dL).`,
            sources: [
              { sourceName: 'Previous Report', statement: `${prev.observedValue} g/dL`, type: 'previous_report' },
              { sourceName: 'Current Report', statement: `${curr.observedValue} g/dL`, type: 'current_report' }
            ],
            suggestedAction: 'Recommend clinical evaluation for potential blood loss or worsening anemia etiology.'
          });
        }

        // Potassium out of range swing
        if (curr.canonicalName === 'Serum Potassium' && (curr.status === 'LOW' || curr.status === 'HIGH') && prev.status === 'NORMAL') {
          addConflict({
            category: 'CLINICAL_SWING',
            severity: 'MODERATE',
            title: 'Electrolyte Shift: Serum Potassium',
            description: `Potassium shifted from a normal level (${prev.observedValue} mEq/L) to an out-of-range level (${curr.observedValue} mEq/L, status: ${curr.statusLabel}).`,
            sources: [
              { sourceName: 'Previous Report', statement: `${prev.observedValue} mEq/L`, type: 'previous_report' },
              { sourceName: 'Current Report', statement: `${curr.observedValue} mEq/L`, type: 'current_report' }
            ],
            suggestedAction: 'Review current diuretic or antihypertensive medications with physician.'
          });
        }
      }
    }
  }

  return conflicts;
}
