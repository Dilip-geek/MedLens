// MedLens Medical Entity Extractor
// Extracts clinical parameters, metadata, observations, and exact source offsets

import { normalizeTestName } from './normalizer.js';
import { interpretValueAgainstRange } from './rangeAnalyzer.js';

// Clean text and extract report metadata (patient name, age, date, lab name)
export function extractReportMetadata(rawText) {
  const metadata = {
    patientName: null,
    age: null,
    sex: null,
    reportDate: null,
    facility: null
  };

  if (!rawText) return metadata;

  // Patient Name
  const nameMatch = rawText.match(/(?:patient(?:\s+name)?|name|pt\.?\s*name)[\s:]+([A-Z][A-Za-z\s,.-]{2,35})/i);
  if (nameMatch) {
    metadata.patientName = nameMatch[1].trim().replace(/[\r\n].*/, '');
  }

  // Age
  const ageMatch = rawText.match(/(?:age|years\s+old|yo)[\s:]+([0-9]{1,3})(?:\s*y(?:\/o|ears)?)?/i);
  if (ageMatch) {
    metadata.age = parseInt(ageMatch[1], 10);
  }

  // Sex / Gender
  const sexMatch = rawText.match(/(?:sex|gender)[\s:]+([MF]|Male|Female|Other)/i);
  if (sexMatch) {
    metadata.sex = sexMatch[1].trim().toLowerCase().startsWith('m') ? 'Male' :
                   sexMatch[1].trim().toLowerCase().startsWith('f') ? 'Female' : 'Other';
  }

  // Report Date
  const dateMatch = rawText.match(/(?:date(?:\s+of\s+report|\s+collected|\s+reported)?|collection\s+date)[\s:]+([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i);
  if (dateMatch) {
    metadata.reportDate = dateMatch[1].trim();
  }

  // Facility / Lab Name
  const labMatch = rawText.match(/(?:laboratory|lab|facility|hospital|diagnostics)[\s:]+([A-Z0-9\s&,.-]{3,40})/i);
  if (labMatch) {
    metadata.facility = labMatch[1].trim().replace(/[\r\n].*/, '');
  }

  return metadata;
}

// Extract medical parameters line by line with robust pattern matching
export function extractParameters(rawText, sourceTag = 'current_report') {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/);
  const parameters = [];
  const seenCanonical = new Set();

  let runningOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineStart = runningOffset;
    const lineEnd = runningOffset + line.length;
    runningOffset += line.length + 1; // +1 for newline

    if (!trimmedLine || trimmedLine.length < 3) continue;

    // Skip headers and irrelevant lines
    if (/^(page|report|date|patient|doctor|physician|specimen|collected|received|verified|confidential|signed|disclaimer)/i.test(trimmedLine) && !/:[0-9]/.test(trimmedLine)) {
      continue;
    }

    // Attempt parameter matching
    const param = parseLineForParameter(line, lineStart, lineEnd, sourceTag);
    if (param) {
      const canonicalKey = param.canonicalName.toLowerCase();
      // Keep most specific or first occurrence
      if (!seenCanonical.has(canonicalKey)) {
        seenCanonical.add(canonicalKey);
        parameters.push(param);
      }
    }
  }

  return parameters;
}

// Parser for an individual line
function parseLineForParameter(line, startOffset, endOffset, sourceTag) {
  // Common units pattern
  const unitPattern = '(?:g\\/dL|mg\\/dL|x10\\^3\\/uL|x10\\^6\\/uL|10\\^3\\/uL|10\\^6\\/uL|\\%|fL|pg|mEq\\/L|mmol\\/L|uIU\\/mL|uU\\/mL|mIU\\/L|ng\\/dL|pg\\/mL|ng\\/mL|ug\\/dL|U\\/L|IU\\/L|mm\\/hr|mL\\/min\\/1\\.73m2|ratio)';

  // Pattern A: Delimited by Colon or Tab or Pipe or Multi-Space
  // e.g., "Hemoglobin: 10.2 g/dL (Ref: 13.0 - 17.5)" or "Hb | 10.2 | g/dL | 13-17"
  const regexColon = new RegExp(
    `^([A-Za-z0-9\\s\\-\\+\\/\\(\\)\\%]{2,40})` +                   // 1: Name
    `[:|\\t]\\s*` +                                               // Separator
    `([<>]?\\s*[0-9]+(?:\\.[0-9]+)?|Positive|Negative|Normal)` + // 2: Value
    `(?:\\s*(${unitPattern}))?` +                                 // 3: Unit (optional)
    `(?:[\\s,;|(]*(?:ref(?:erence)?(?:\\s*range)?[\\s:]*)?` +
    `([<>]?\\s*[0-9]+(?:\\.[0-9]+)?(?:\\s*(?:-|–|to)\\s*[0-9]+(?:\\.[0-9]+)?)?|Negative|Normal|Non-reactive|Up\\s+to\\s+[0-9]+)` + // 4: Range
    `[)\\]]?)?`,
    'i'
  );

  // Pattern B: Tabular space/pipe separated without colons
  // e.g., "Hemoglobin    10.2    g/dL    13.0 - 17.5    LOW"
  const regexTabular = new RegExp(
    `^([A-Za-z0-9\\s\\-\\+\\/\\(\\)\\%]{2,35})\\s{2,}` +          // 1: Name
    `([<>]?\\s*[0-9]+(?:\\.[0-9]+)?)\\s*` +                       // 2: Value
    `(${unitPattern})?\\s*` +                                     // 3: Unit
    `(?:([0-9]+(?:\\.[0-9]+)?\\s*(?:-|–|to)\\s*[0-9]+(?:\\.[0-9]+)?|<\\s*[0-9]+|>\\s*[0-9]+|Up\\s+to\\s+[0-9]+))?`, // 4: Range
    'i'
  );

  let match = line.match(regexColon);
  if (!match) {
    match = line.match(regexTabular);
  }

  // Pattern C: Parenthetical reference range e.g. "Serum Creatinine: 1.4 mg/dL (0.6 - 1.2)"
  if (!match) {
    const regexParen = new RegExp(
      `^([A-Za-z0-9\\s\\-\\+\\/\\(\\)\\%]{2,35})[\\s:]+([0-9]+(?:\\.[0-9]+)?)\\s*(${unitPattern})?\\s*\\(([^)]+)\\)`,
      'i'
    );
    match = line.match(regexParen);
  }

  if (match) {
    const rawName = match[1].trim();
    // Validate that rawName looks like a clinical test
    if (rawName.length < 2 || /^(the|and|or|for|with|note|impression|recommendation|specimen|method)/i.test(rawName)) {
      return null;
    }

    const rawValue = match[2].trim();
    const unit = match[3] ? match[3].trim() : '';
    const rawRange = match[4] ? match[4].trim() : null;

    const norm = normalizeTestName(rawName);
    const numericValue = parseFloat(rawValue.replace(/[^\d.-]/g, ''));
    const isNumeric = !isNaN(numericValue);

    const rangeEval = interpretValueAgainstRange(isNumeric ? numericValue : rawValue, rawRange);

    return {
      id: `param_${Math.random().toString(36).substring(2, 9)}`,
      rawName,
      canonicalName: norm.canonical,
      panel: norm.panel,
      loinc: norm.loinc,
      description: norm.description,
      observedValue: isNumeric ? numericValue : rawValue,
      rawValueString: rawValue,
      unit: unit || norm.standardUnit,
      referenceRange: rangeEval.referenceRange,
      rawRangeText: rangeEval.rawRangeText,
      status: rangeEval.status,
      statusLabel: rangeEval.statusLabel,
      interpretation: rangeEval.interpretation,
      isOutOfRange: rangeEval.isOutOfRange,
      isCritical: rangeEval.isCritical,
      sourceQuote: line.trim(),
      sourceOffset: {
        start: startOffset,
        end: endOffset
      },
      sourceType: sourceTag, // 'current_report' | 'previous_report' | 'user_intake'
      sourceLabel: sourceTag === 'previous_report' ? 'Previous Report' : 'Current Report',
      confidence: 0.96,
      isVerified: false,
      userNotes: ''
    };
  }

  return null;
}

// Extract narrative clinical observations / notes
export function extractObservations(rawText) {
  if (!rawText) return [];
  const observations = [];
  const lines = rawText.split(/\r?\n/);

  let inObservationSection = false;
  let buffer = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^(impression|interpretation|clinical notes|findings|comments|recommendations?)[\s:]/i.test(trimmed)) {
      if (buffer.length > 0) {
        observations.push(buffer.join(' '));
        buffer = [];
      }
      inObservationSection = true;
      const content = trimmed.replace(/^(impression|interpretation|clinical notes|findings|comments|recommendations?)[\s:]+/i, '');
      if (content) buffer.push(content);
      continue;
    }

    if (inObservationSection) {
      if (/^[A-Z\s]{4,30}:/.test(trimmed) && !/^(note|comment)/i.test(trimmed)) {
        inObservationSection = false;
        if (buffer.length > 0) {
          observations.push(buffer.join(' '));
          buffer = [];
        }
      } else {
        buffer.push(trimmed);
      }
    }
  }

  if (buffer.length > 0) {
    observations.push(buffer.join(' '));
  }

  return observations;
}
