import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  FileText, 
  History, 
  AlertTriangle, 
  AlertCircle,
  HelpCircle, 
  Table, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Printer
} from 'lucide-react';
import { Header } from './components/Header';
import { PipelineProgress } from './components/PipelineProgress';
import { IntakeForm } from './components/IntakeForm';
import { ReportInput } from './components/ReportInput';
import { StructuredRecordView } from './components/StructuredRecordView';
import { TraceabilityViewer } from './components/TraceabilityViewer';
import { LongitudinalComparison } from './components/LongitudinalComparison';
import { ConflictAlerts } from './components/ConflictAlerts';
import { ClarificationQuestions } from './components/ClarificationQuestions';
import { PatientSummary } from './components/PatientSummary';
import { HumanReviewModal } from './components/HumanReviewModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintableReport } from './components/PrintableReport';
import { AIChatDrawer } from './components/AIChatDrawer';
import { 
  PatientIntake, 
  ProcessedRecord, 
  PipelineStage, 
  ExtractedParameter, 
  ClinicalPreset 
} from './types';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Input states
  const [intake, setIntake] = useState<PatientIntake>({
    name: '',
    age: '',
    sex: '',
    symptoms: '',
    conditions: '',
    allergies: '',
    medications: '',
    notes: ''
  });
  const [currentReport, setCurrentReport] = useState<string>('');
  const [previousReport, setPreviousReport] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  // Processing & Pipeline states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(0);
  const [record, setRecord] = useState<ProcessedRecord | null>(null);
  const [presets, setPresets] = useState<ClinicalPreset[]>([]);

  // Navigation & Interactive Tabs
  const [activeTab, setActiveTab] = useState<'record' | 'longitudinal' | 'conflicts' | 'summary' | 'questions'>('record');

  // Modals & Panels
  const [selectedParamForTrace, setSelectedParamForTrace] = useState<ExtractedParameter | null>(null);
  const [editingParam, setEditingParam] = useState<ExtractedParameter | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadPreset = useCallback((preset: ClinicalPreset) => {
    setIntake(preset.intake);
    setCurrentReport(preset.currentReport);
    setPreviousReport(preset.previousReport);
    setRecord(null);
    setPipelineStages([]);
    setPipelineError(null);
  }, []);

  // Load presets on mount
  useEffect(() => {
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        if (data.presets && data.presets.length > 0) {
          setPresets(data.presets);
          loadPreset(data.presets[0]);
        }
      })
      .catch(err => console.warn('Could not load presets:', err));
  }, [loadPreset]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleSelectPreset = useCallback((presetId: string) => {
    const found = presets.find(p => p.id === presetId);
    if (found) {
      loadPreset(found);
    }
  }, [presets, loadPreset]);

  // Run MedLens Pipeline
  const handleRunPipeline = useCallback(async () => {
    if (!currentReport.trim()) return;

    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setPipelineError(null);
    setPipelineStages([]);
    setSelectedParamForTrace(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: abortController.signal,
        body: JSON.stringify({
          intake,
          currentReport,
          previousReport,
          apiKey
        })
      });

      const data = await response.json();

      if (data.success) {
        setRecord(data.record);
        setPipelineStages(data.stages || []);
        setTotalDurationMs(data.executionTimeMs || 0);
        setActiveTab('record');
        setPipelineError(null);
      } else {
        setPipelineError(data.error || 'Failed to process report');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Pipeline error:', err);
      setPipelineError('Error communicating with backend API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [intake, currentReport, previousReport, apiKey]);

  // Human Review: Update Parameter
  const handleSaveParameterEdit = useCallback((updatedParam: ExtractedParameter, description: string) => {
    setRecord(prev => {
      if (!prev) return null;
      const newParameters = prev.parameters.map(p => 
        p.id === updatedParam.id ? updatedParam : p
      );
      const newPanelGroups: Record<string, ExtractedParameter[]> = {};
      for (const p of newParameters) {
        if (!newPanelGroups[p.panel]) newPanelGroups[p.panel] = [];
        newPanelGroups[p.panel].push(p);
      }
      const auditItem = {
        timestamp: new Date().toISOString(),
        action: 'HUMAN_REVIEW_CORRECTION',
        description,
        actor: 'User / Clinician',
        targetId: updatedParam.id
      };
      return {
        ...prev,
        parameters: newParameters,
        panelGroups: newPanelGroups,
        auditLog: [auditItem, ...prev.auditLog]
      };
    });
  }, []);

  // Mark Parameter Verified
  const handleVerifyParameter = useCallback((paramId: string) => {
    setRecord(prev => {
      if (!prev) return null;
      const newParameters = prev.parameters.map(p => {
        if (p.id === paramId) {
          return {
            ...p,
            isVerified: !p.isVerified,
            sourceType: (!p.isVerified ? 'human_verified' : 'current_report') as any,
            sourceLabel: !p.isVerified ? 'Human Verified' : 'Current Report'
          };
        }
        return p;
      });
      const targetParam = newParameters.find(p => p.id === paramId);
      const auditItem = {
        timestamp: new Date().toISOString(),
        action: 'VERIFICATION_TOGGLE',
        description: `${targetParam?.canonicalName} marked as ${targetParam?.isVerified ? 'Human Verified' : 'AI Extracted'}.`,
        actor: 'User / Clinician'
      };
      return {
        ...prev,
        parameters: newParameters,
        auditLog: [auditItem, ...prev.auditLog]
      };
    });
  }, []);

  // Resolve Inconsistency
  const handleResolveConflict = useCallback((conflictId: string, resolutionNotes: string, resolvedBy: string) => {
    setRecord(prev => {
      if (!prev) return null;
      const newConflicts = prev.conflicts.map(c => {
        if (c.id === conflictId) {
          return {
            ...c,
            resolved: true,
            resolutionNotes,
            resolvedBy,
            resolvedAt: new Date().toISOString()
          };
        }
        return c;
      });
      const targetConflict = prev.conflicts.find(c => c.id === conflictId);
      const auditItem = {
        timestamp: new Date().toISOString(),
        action: 'CONFLICT_RESOLVED',
        description: `Conflict "${targetConflict?.title}" resolved: ${resolutionNotes}`,
        actor: resolvedBy
      };
      return {
        ...prev,
        conflicts: newConflicts,
        auditLog: [auditItem, ...prev.auditLog]
      };
    });
  }, []);

  // Answer Clarification Question
  const handleAnswerQuestion = useCallback((questionId: string, answer: string) => {
    setRecord(prev => {
      if (!prev) return null;
      const newQuestions = prev.clarificationQuestions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            userResponse: answer,
            isAnswered: !!answer.trim()
          };
        }
        return q;
      });
      return {
        ...prev,
        clarificationQuestions: newQuestions
      };
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrint={() => setIsPrintOpen(true)}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        isChatOpen={isChatOpen}
        hasRecord={!!record}
        geminiActive={!!(apiKey || (record?.geminiEnhancement?.enhanced))}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Pipeline Error Banner */}
        {pipelineError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid var(--danger)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: 'var(--danger)',
              fontSize: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} />
              <span>{pipelineError}</span>
            </div>
            <button
              onClick={() => setPipelineError(null)}
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 10px', fontSize: 12 }}
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pipeline Stepper Animation */}
        <PipelineProgress
          stages={pipelineStages}
          isRunning={isLoading}
          totalDurationMs={totalDurationMs}
        />

        {/* Top Input Section: Patient Intake (Left) + Report Ingestion (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 24,
          marginBottom: 28
        }}>
          {/* 1. Patient Intake Form */}
          <IntakeForm
            intake={intake}
            onChange={setIntake}
          />

          {/* 2. Medical Report Ingestion */}
          <ReportInput
            currentReport={currentReport}
            previousReport={previousReport}
            onCurrentChange={setCurrentReport}
            onPreviousChange={setPreviousReport}
            onRunPipeline={handleRunPipeline}
            isLoading={isLoading}
          />
        </div>

        {/* Traceability Inspection Panel (Displays if a parameter is selected) */}
        {selectedParamForTrace && record && (
          <TraceabilityViewer
            selectedParam={selectedParamForTrace}
            rawReportText={record.rawSources.currentReport}
            onClose={() => setSelectedParamForTrace(null)}
          />
        )}

        {/* Processed Results Section (Tabbed Navigation) */}
        {record && (
          <div>
            {/* View Selection Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: 20,
              overflowX: 'auto',
              paddingBottom: 4
            }}>
              <button
                onClick={() => setActiveTab('record')}
                className={`btn btn-sm ${activeTab === 'record' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Table size={15} />
                <span>Structured Parameters ({record.parameters.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('longitudinal')}
                className={`btn btn-sm ${activeTab === 'longitudinal' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <History size={15} />
                <span>Longitudinal Trends ({record.longitudinal.stats.totalCompared})</span>
                {record.longitudinal.hasComparison && (
                  <span className="badge badge-low" style={{ fontSize: 9, padding: '1px 5px' }}>
                    Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('conflicts')}
                className={`btn btn-sm ${activeTab === 'conflicts' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <AlertTriangle size={15} />
                <span>Inconsistencies & Conflicts ({record.conflicts.length})</span>
                {record.conflicts.some(c => !c.resolved && c.severity === 'HIGH') && (
                  <span className="badge badge-critical" style={{ fontSize: 9, padding: '1px 5px' }}>
                    Urgent
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <HeartHandshake size={15} />
                <span>Patient Summary & Topics</span>
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`btn btn-sm ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <HelpCircle size={15} />
                <span>Doctor Questions ({record.clarificationQuestions.length})</span>
              </button>
            </div>

            {/* Tab 1: Structured Lab Parameters Table */}
            {activeTab === 'record' && (
              <StructuredRecordView
                record={record}
                onSelectParameterForTrace={(param) => setSelectedParamForTrace(param)}
                onEditParameter={(param) => setEditingParam(param)}
                onVerifyParameter={handleVerifyParameter}
              />
            )}

            {/* Tab 2: Longitudinal Comparison */}
            {activeTab === 'longitudinal' && (
              <LongitudinalComparison
                comparison={record.longitudinal}
              />
            )}

            {/* Tab 3: Conflicts & Inconsistencies */}
            {activeTab === 'conflicts' && (
              <ConflictAlerts
                conflicts={record.conflicts}
                onResolveConflict={handleResolveConflict}
              />
            )}

            {/* Tab 4: Patient-Friendly Summary */}
            {activeTab === 'summary' && (
              <PatientSummary
                summary={record.summary}
                isGeminiEnhanced={record.geminiEnhancement?.enhanced}
              />
            )}

            {/* Tab 5: Clarification Questions */}
            {activeTab === 'questions' && (
              <ClarificationQuestions
                questions={record.clarificationQuestions}
                onAnswerQuestion={handleAnswerQuestion}
              />
            )}
          </div>
        )}

        {/* Empty State before running pipeline */}
        {!record && !isLoading && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <Activity size={48} style={{ color: 'var(--teal-500)', opacity: 0.8, marginBottom: 14 }} />
            <h2 style={{ fontSize: 18, color: 'var(--text-highlight)', marginBottom: 6 }}>
              Ready to Structure Medical Records
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 540, margin: '0 auto 18px auto' }}>
              Review the patient intake form on the left, inspect the current laboratory report on the right, or choose one of the sample clinical cases from the top navigation bar.
            </p>
            <button
              onClick={handleRunPipeline}
              disabled={!currentReport.trim()}
              className="btn btn-primary"
            >
              <span>Process Loaded Medical Report</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Human Review Modal */}
      <HumanReviewModal
        param={editingParam}
        isOpen={!!editingParam}
        onClose={() => setEditingParam(null)}
        onSave={handleSaveParameterEdit}
        auditLog={record?.auditLog || []}
      />

      {/* Engine & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
        geminiActive={!!(apiKey || record?.geminiEnhancement?.enhanced)}
      />

      {/* Printable / Downloadable Report Modal */}
      <PrintableReport
        record={record}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />

      {/* Grounded MedLens AI Clinical Assistant Drawer */}
      <AIChatDrawer
        record={record}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        apiKey={apiKey}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-dim)',
        background: 'var(--bg-primary)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>MedLens Medical Information Intelligence System</strong> • Strict Non-Diagnostic Architecture • Designed for Information Organization & Transparency
        </p>
      </footer>
    </div>
  );
};

export default App;
