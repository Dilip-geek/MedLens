// MedLens Non-Diagnostic Patient Summary Generator
// Generates concise, structured, empathetic, and strictly non-diagnostic summaries.
// Adheres strictly to safety constraints: NO diagnosis, NO prescriptions, NO clinical certainty claims.

export const MEDICAL_DISCLAIMER =
  'MedLens is an information organization and intelligence system designed to help patients and caregivers understand their records. It is NOT a diagnostic tool and does NOT provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional regarding any medical condition or laboratory results.';

export function generateStructuredSummary({ intake, currentParameters = [], previousParameters = [], conflicts = [], questions = [], observations = [] }) {
  const patientName = intake?.name || 'Patient';
  const age = intake?.age ? `${intake.age} years old` : null;
  const sex = intake?.sex || null;
  const demoString = [age, sex].filter(Boolean).join(', ');

  // Identify out of range parameters
  const outOfRange = currentParameters.filter(p => p.isOutOfRange);
  const normalParams = currentParameters.filter(p => p.status === 'NORMAL');
  const missingRangeParams = currentParameters.filter(p => p.status === 'NO_RANGE_REPORTED');

  // Key findings section
  const keyFindings = [];
  for (const p of outOfRange) {
    const direction = p.status.includes('HIGH') ? 'above' : 'below';
    keyFindings.push({
      parameter: p.canonicalName,
      value: `${p.observedValue} ${p.unit}`.trim(),
      status: p.statusLabel,
      range: p.rawRangeText,
      statement: `${p.canonicalName} is reported as ${p.observedValue} ${p.unit}, which is ${direction} the reported laboratory reference range of ${p.rawRangeText}.`
    });
  }

  // Summary bullets
  const highlights = [];
  if (outOfRange.length > 0) {
    highlights.push(`${outOfRange.length} laboratory parameter(s) are outside their reported reference ranges: ${outOfRange.map(p => p.canonicalName).join(', ')}.`);
  } else if (normalParams.length > 0) {
    highlights.push(`All ${normalParams.length} analyzed parameters with reported reference ranges fall within their respective standard laboratory intervals.`);
  }

  if (missingRangeParams.length > 0) {
    highlights.push(`${missingRangeParams.length} parameter(s) (${missingRangeParams.map(p => p.canonicalName).join(', ')}) did not include reference ranges in the source report; ranges were not assumed or invented.`);
  }

  if (conflicts.length > 0) {
    const highConflicts = conflicts.filter(c => c.severity === 'HIGH');
    if (highConflicts.length > 0) {
      highlights.push(`Flagged ${highConflicts.length} high-priority clinical conflict(s) across records requiring clarification (including ${highConflicts[0].title}).`);
    } else {
      highlights.push(`Identified ${conflicts.length} potential record discrepancy/discrepancies between intake and reports.`);
    }
  }

  // Patient narrative
  let narrative = `This record review for ${patientName}${demoString ? ` (${demoString})` : ''} organizes information across the provided clinical documents. `;

  if (outOfRange.length > 0) {
    narrative += `Based on the current laboratory report, the primary findings outside the reported reference ranges are ${outOfRange.slice(0, 3).map(p => `${p.canonicalName} (${p.observedValue} ${p.unit}, reported range: ${p.rawRangeText})`).join(', ')}. `;
  } else {
    narrative += `The current laboratory results show parameters within their reported reference intervals. `;
  }

  if (conflicts.length > 0) {
    narrative += `We noted potential discrepancies across sources—such as ${conflicts[0].title.toLowerCase()}—which should be verified during your consultation. `;
  }

  if (questions.length > 0) {
    narrative += `A set of targeted clarification questions has been prepared to help focus your upcoming discussion with your physician.`;
  }

  return {
    patientOverview: `${patientName}${demoString ? ` (${demoString})` : ''}`,
    totalParametersAnalyzed: currentParameters.length,
    outOfRangeCount: outOfRange.length,
    normalCount: normalParams.length,
    missingRangeCount: missingRangeParams.length,
    conflictCount: conflicts.length,
    highlights,
    keyFindings,
    narrative,
    observations: observations.slice(0, 3),
    recommendedDiscussionPoints: questions.map(q => q.question),
    disclaimer: MEDICAL_DISCLAIMER,
    generatedAt: new Date().toISOString()
  };
}
