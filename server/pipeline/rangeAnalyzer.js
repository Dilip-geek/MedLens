// MedLens Reference Range Awareness Engine
// Strictly uses reported reference ranges from the source document.
// CRITICAL RULE: Never invents or hallucinates reference ranges when absent from the source.

export const STATUS_CODES = {
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  HIGH: 'HIGH',
  CRITICAL_LOW: 'CRITICAL_LOW',
  CRITICAL_HIGH: 'CRITICAL_HIGH',
  NO_RANGE: 'NO_RANGE_REPORTED',
  INCONCLUSIVE: 'INCONCLUSIVE'
};

// Parse a raw reference range string
export function parseReferenceRange(rawRangeStr) {
  if (!rawRangeStr || typeof rawRangeStr !== 'string') {
    return null;
  }

  const str = rawRangeStr.trim();
  if (!str || str.toLowerCase() === 'not provided' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'none' || str === '-') {
    return null;
  }

  // Case 1: Standard Range e.g. "13.0 - 17.5", "13 - 17", "70.0 to 99.0", "[0.6 - 1.2]"
  const rangeMatch = str.match(/(?:\[|\()?([0-9]+(?:\.[0-9]+)?)\s*(?:-|–|—|to)\s*([0-9]+(?:\.[0-9]+)?)(?:\]|\))?/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (!isNaN(low) && !isNaN(high)) {
      return {
        type: 'interval',
        low,
        high,
        raw: str,
        display: `${low} – ${high}`
      };
    }
  }

  // Case 2: Upper bound only e.g. "< 200", "<= 100", "<200", "Up to 150"
  const upperMatch = str.match(/(?:<|<=|up\s+to|less\s+than)\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (upperMatch) {
    const high = parseFloat(upperMatch[1]);
    if (!isNaN(high)) {
      return {
        type: 'upper_bound',
        low: 0,
        high,
        raw: str,
        display: `< ${high}`
      };
    }
  }

  // Case 3: Lower bound only e.g. "> 60", ">= 60", "greater than 60"
  const lowerMatch = str.match(/(?:>|>=|greater\s+than)\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (lowerMatch) {
    const low = parseFloat(lowerMatch[1]);
    if (!isNaN(low)) {
      return {
        type: 'lower_bound',
        low,
        high: Infinity,
        raw: str,
        display: `> ${low}`
      };
    }
  }

  // Case 4: Qualitative ranges e.g. "Negative", "Non-reactive", "Normal"
  if (/\b(negative|non-reactive|normal|nil|absent)\b/i.test(str)) {
    return {
      type: 'qualitative',
      expected: 'negative',
      raw: str,
      display: str
    };
  }

  return {
    type: 'unparsed',
    raw: str,
    display: str
  };
}

// Interpret a measured value against its reported reference range
export function interpretValueAgainstRange(value, rawRangeStr) {
  const parsedRange = parseReferenceRange(rawRangeStr);

  // If no reference range in source, DO NOT INVENT ONE
  if (!parsedRange) {
    return {
      status: STATUS_CODES.NO_RANGE,
      statusLabel: 'No reference range in report',
      interpretation: 'No reference range provided in the source report. Consult healthcare provider for context.',
      referenceRange: null,
      rawRangeText: rawRangeStr || null,
      isOutOfRange: false,
      isCritical: false
    };
  }

  // If value is numeric
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));

  if (isNaN(numericVal)) {
    // Non-numeric value (e.g. "Positive", "Negative", "Trace")
    const strVal = String(value).trim().toLowerCase();
    if (parsedRange.type === 'qualitative') {
      const isNormal = strVal.includes('negative') || strVal.includes('non-reactive') || strVal.includes('normal') || strVal.includes('nil');
      return {
        status: isNormal ? STATUS_CODES.NORMAL : STATUS_CODES.HIGH,
        statusLabel: isNormal ? 'Normal' : 'Abnormal / Reactive',
        interpretation: isNormal ? 'Matches reported normal qualitative range' : 'Differs from reported reference expected state',
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: !isNormal,
        isCritical: false
      };
    }

    return {
      status: STATUS_CODES.INCONCLUSIVE,
      statusLabel: 'Qualitative Finding',
      interpretation: `Reported qualitative observation: "${value}". Reported range: "${parsedRange.raw}"`,
      referenceRange: parsedRange,
      rawRangeText: parsedRange.raw,
      isOutOfRange: false,
      isCritical: false
    };
  }

  // Numeric evaluation
  if (parsedRange.type === 'interval') {
    if (numericVal < parsedRange.low) {
      // Check if critical low (e.g., > 30% below lower bound)
      const isCritical = numericVal < parsedRange.low * 0.7;
      return {
        status: isCritical ? STATUS_CODES.CRITICAL_LOW : STATUS_CODES.LOW,
        statusLabel: isCritical ? 'Critical Low' : 'Below reported range',
        interpretation: `Observed ${numericVal} is below reported reference range (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: true,
        isCritical
      };
    } else if (numericVal > parsedRange.high) {
      const isCritical = numericVal > parsedRange.high * 1.4;
      return {
        status: isCritical ? STATUS_CODES.CRITICAL_HIGH : STATUS_CODES.HIGH,
        statusLabel: isCritical ? 'Critical High' : 'Above reported range',
        interpretation: `Observed ${numericVal} is above reported reference range (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: true,
        isCritical
      };
    } else {
      return {
        status: STATUS_CODES.NORMAL,
        statusLabel: 'Within reported range',
        interpretation: `Observed ${numericVal} is within reported reference range (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: false,
        isCritical: false
      };
    }
  }

  if (parsedRange.type === 'upper_bound') {
    if (numericVal > parsedRange.high) {
      return {
        status: STATUS_CODES.HIGH,
        statusLabel: 'Above reported range',
        interpretation: `Observed ${numericVal} exceeds upper reported threshold (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: true,
        isCritical: numericVal > parsedRange.high * 1.5
      };
    } else {
      return {
        status: STATUS_CODES.NORMAL,
        statusLabel: 'Within reported range',
        interpretation: `Observed ${numericVal} meets upper reported threshold (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: false,
        isCritical: false
      };
    }
  }

  if (parsedRange.type === 'lower_bound') {
    if (numericVal < parsedRange.low) {
      return {
        status: STATUS_CODES.LOW,
        statusLabel: 'Below reported range',
        interpretation: `Observed ${numericVal} is below minimum reported threshold (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: true,
        isCritical: numericVal < parsedRange.low * 0.7
      };
    } else {
      return {
        status: STATUS_CODES.NORMAL,
        statusLabel: 'Within reported range',
        interpretation: `Observed ${numericVal} meets minimum reported threshold (${parsedRange.display})`,
        referenceRange: parsedRange,
        rawRangeText: parsedRange.raw,
        isOutOfRange: false,
        isCritical: false
      };
    }
  }

  return {
    status: STATUS_CODES.NORMAL,
    statusLabel: 'Reported',
    interpretation: `Reported value: ${numericVal}. Reported reference note: "${parsedRange.raw}"`,
    referenceRange: parsedRange,
    rawRangeText: parsedRange.raw,
    isOutOfRange: false,
    isCritical: false
  };
}
