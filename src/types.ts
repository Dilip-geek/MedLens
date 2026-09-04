// MedLens TypeScript Definitions

export interface PatientIntake {
  name: string;
  age: number | string;
  sex: string;
  symptoms: string;
  conditions: string;
  allergies: string;
  medications: string;
  notes: string;
  sourceType?: string;
  sourceLabel?: string;
}

export interface ReferenceRange {
  type: 'interval' | 'upper_bound' | 'lower_bound' | 'qualitative' | 'unparsed';
  low?: number;
  high?: number;
  raw: string;
  display: string;
}

export interface ExtractedParameter {
  id: string;
  rawName: string;
  canonicalName: string;
  panel: string;
  loinc: string;
  description: string;
  observedValue: number | string;
  rawValueString: string;
  unit: string;
  referenceRange: ReferenceRange | null;
  rawRangeText: string | null;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'NO_RANGE_REPORTED' | 'INCONCLUSIVE';
  statusLabel: string;
  interpretation: string;
  isOutOfRange: boolean;
  isCritical: boolean;
  sourceQuote: string;
  sourceOffset: {
    start: number;
    end: number;
  };
  sourceType: 'current_report' | 'previous_report' | 'user_intake' | 'human_verified';
  sourceLabel: string;
  confidence: number;
  isVerified: boolean;
  userNotes?: string;
  lastModified?: string;
}

export interface ConflictSource {
  sourceName: string;
  statement: string;
  type: string;
}

export interface MedicalConflict {
  id: string;
  category: 'ALLERGY_CONFLICT' | 'MEDICATION_CONFLICT' | 'DEMOGRAPHIC_MISMATCH' | 'CONDITION_DISCREPANCY' | 'CLINICAL_SWING';
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  description: string;
  sources: ConflictSource[];
  suggestedAction: string;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
}

export interface ClarificationQuestion {
  id: string;
  category: string;
  urgency: 'High' | 'Medium' | 'Routine';
  question: string;
  context: string;
  fieldTarget: string;
  userResponse: string;
  isAnswered: boolean;
}

export interface LongitudinalItem {
  id: string;
  canonicalName: string;
  panel: string;
  unit: string;
  current: {
    value: number | string;
    status: string;
    statusLabel: string;
    rangeText: string;
    isOutOfRange: boolean;
  } | null;
  previous: {
    value: number | string;
    status: string;
    statusLabel: string;
    rangeText: string;
    isOutOfRange: boolean;
  } | null;
  delta: number | null;
  percentChange: number | null;
  trendDirection: 'increased' | 'decreased' | 'stable' | 'new' | 'omitted' | 'qualitative';
  statusTransition: string;
  isRangeShifted: boolean;
  rangeShiftDetails: string | null;
  category: 'matched' | 'newly_appearing' | 'discontinued_or_omitted';
}

export interface LongitudinalComparisonData {
  hasComparison: boolean;
  items: LongitudinalItem[];
  stats: {
    totalCompared: number;
    matched: number;
    increased: number;
    decreased: number;
    stable: number;
    newParameters: number;
    discontinued: number;
    rangeShifts: number;
  };
}

export interface PipelineStage {
  stage: string;
  label: string;
  durationMs: number;
  status: 'completed' | 'in_progress' | 'pending';
  details: string;
}

export interface PatientSummaryData {
  patientOverview: string;
  totalParametersAnalyzed: number;
  outOfRangeCount: number;
  normalCount: number;
  missingRangeCount: number;
  conflictCount: number;
  highlights: string[];
  keyFindings: Array<{
    parameter: string;
    value: string;
    status: string;
    range: string | null;
    statement: string;
  }>;
  narrative: string;
  observations: string[];
  recommendedDiscussionPoints: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface AuditLogItem {
  timestamp: string;
  action: string;
  description: string;
  actor: string;
  targetId?: string;
  previousValue?: string | number;
  newValue?: string | number;
}

export interface ProcessedRecord {
  intake: PatientIntake;
  metadata: {
    current: {
      patientName: string | null;
      age: number | null;
      sex: string | null;
      reportDate: string | null;
      facility: string | null;
    } | null;
    previous: {
      patientName: string | null;
      age: number | null;
      sex: string | null;
      reportDate: string | null;
      facility: string | null;
    } | null;
  };
  rawSources: {
    currentReport: string;
    previousReport: string;
  };
  parameters: ExtractedParameter[];
  previousParameters: ExtractedParameter[];
  panelGroups: Record<string, ExtractedParameter[]>;
  longitudinal: LongitudinalComparisonData;
  conflicts: MedicalConflict[];
  clarificationQuestions: ClarificationQuestion[];
  summary: PatientSummaryData;
  disclaimer: string;
  geminiEnhancement?: {
    enhanced: boolean;
    reason?: string;
    model?: string;
  };
  auditLog: AuditLogItem[];
}

export interface ClinicalPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  intake: PatientIntake;
  currentReport: string;
  previousReport: string;
}
