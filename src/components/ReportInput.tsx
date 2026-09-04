import React, { useState, useRef } from 'react';
import { FileUp, FileText, History, ArrowRight, Upload, X, HelpCircle } from 'lucide-react';

interface ReportInputProps {
  currentReport: string;
  previousReport: string;
  onCurrentChange: (text: string) => void;
  onPreviousChange: (text: string) => void;
  onRunPipeline: () => void;
  isLoading: boolean;
}

export const ReportInput: React.FC<ReportInputProps> = ({
  currentReport,
  previousReport,
  onCurrentChange,
  onPreviousChange,
  onRunPipeline,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');
  const [dragOver, setDragOver] = useState(false);
  const currentFileInputRef = useRef<HTMLInputElement>(null);
  const previousFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File, target: 'current' | 'previous') => {
    if (!file) return;

    // Check extension
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        if (target === 'current') onCurrentChange(text);
        else onPreviousChange(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent, target: 'current' | 'previous') => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], target);
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div className="card-title">
          <FileText size={20} style={{ color: 'var(--teal-500)' }} />
          <span>Medical & Laboratory Reports</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setActiveTab('current')}
            className={`btn btn-sm ${activeTab === 'current' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Current Report
            {currentReport.trim() && (
              <span className="badge badge-normal" style={{ fontSize: 9, padding: '1px 5px' }}>
                Loaded
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`btn btn-sm ${activeTab === 'previous' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <History size={13} />
            Previous Baseline (Optional)
            {previousReport.trim() && (
              <span className="badge badge-low" style={{ fontSize: 9, padding: '1px 5px' }}>
                Loaded
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Current Report */}
      {activeTab === 'current' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" htmlFor="current-report-text" style={{ margin: 0 }}>
              Current Laboratory / Medical Document
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="file"
                ref={currentFileInputRef}
                style={{ display: 'none' }}
                accept=".txt,.csv,.json,.log"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'current');
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => currentFileInputRef.current?.click()}
                title="Upload Text or Lab File"
              >
                <FileUp size={13} /> Upload File
              </button>
              {currentReport && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onCurrentChange('')}
                  title="Clear text"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => handleDrop(e, 'current')}
            style={{
              flex: 1,
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              border: dragOver ? '2px dashed var(--teal-500)' : 'none'
            }}
          >
            <textarea
              id="current-report-text"
              className="form-textarea"
              style={{
                width: '100%',
                height: 230,
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                lineHeight: 1.5,
                resize: 'none'
              }}
              placeholder={`Paste current laboratory results or clinical summary here...\n\nExample:\nMETROPOLITAN CLINICAL LABORATORY\nDate: 08/20/2026\nHemoglobin: 10.2 g/dL (Ref: 13.0 - 17.5)\nFasting Blood Sugar: 146 mg/dL (Ref: 70 - 99)\nSerum Creatinine: 1.15 mg/dL (Ref: 0.50 - 1.10)\nPlatelets: 240 x10^3/uL (Ref: 150 - 450)`}
              value={currentReport}
              onChange={(e) => onCurrentChange(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
            <span>Supports raw clinical notes, tabular lab assays, CBC, metabolic panels.</span>
            <span>{currentReport.length} characters</span>
          </div>
        </div>
      )}

      {/* Tab 2: Previous Report (Optional) */}
      {activeTab === 'previous' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" htmlFor="previous-report-text" style={{ margin: 0 }}>
              Previous Baseline Report (Enables Longitudinal Comparison)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="file"
                ref={previousFileInputRef}
                style={{ display: 'none' }}
                accept=".txt,.csv,.json,.log"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'previous');
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => previousFileInputRef.current?.click()}
              >
                <FileUp size={13} /> Upload File
              </button>
              {previousReport && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onPreviousChange('')}
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id="previous-report-text"
            className="form-textarea"
            style={{
              width: '100%',
              height: 230,
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              lineHeight: 1.5,
              resize: 'none'
            }}
            placeholder={`Paste historical or baseline laboratory report here...\n\nExample:\nDate: 02/15/2026\nHemoglobin: 11.1 g/dL (Ref: 13.0 - 17.5)\nFasting Blood Sugar: 122 mg/dL (Ref: 70 - 99)\nSerum Creatinine: 0.95 mg/dL (Ref: 0.50 - 1.10)`}
            value={previousReport}
            onChange={(e) => onPreviousChange(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
            <span>Enables automatic calculation of deltas, percentage changes, and trend tracking.</span>
            <span>{previousReport.length} characters</span>
          </div>
        </div>
      )}

      {/* Primary Pipeline Execute CTA */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onRunPipeline}
          disabled={isLoading || !currentReport.trim()}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
        >
          {isLoading ? (
            <>
              <span className="spin">⚙️</span>
              <span>Running MedLens Intelligence Pipeline...</span>
            </>
          ) : (
            <>
              <span>Transform & Structure Medical Information</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
