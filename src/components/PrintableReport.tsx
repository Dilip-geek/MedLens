import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { ProcessedRecord } from '../types';

interface PrintableReportProps {
  record: ProcessedRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  record,
  isOpen,
  onClose
}) => {
  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const { intake, parameters, conflicts, clarificationQuestions, summary, disclaimer } = record;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="printable-report-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16
      }}
    >
      <div className="card" style={{
        maxWidth: 820,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#ffffff',
        color: '#0f172a',
        padding: 36
      }}>
        {/* Header Action Controls (Hidden when printing) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 14,
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
            Document Export Preview
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-secondary btn-sm"
              aria-label="Close export preview"
            >
              <X size={14} /> Close
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="print-area">
          {/* Clinic / Document Title */}
          <div style={{ borderBottom: '3px solid #0f766e', paddingBottom: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 id="printable-report-title" style={{ fontSize: 24, color: '#0f766e', margin: 0, fontWeight: 800 }}>
                  MedLens Patient Clinical Record Summary
                </h1>
                <p style={{ margin: '3px 0 0 0', fontSize: 12, color: '#64748b' }}>
                  Structured Laboratory Intelligence & Traceable Clinical Findings
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                <div>Generated: {new Date().toLocaleDateString()}</div>
                <div>Status: Human Reviewable</div>
              </div>
            </div>
          </div>

          {/* Patient Profile Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            fontSize: 13
          }}>
            <h2 style={{ fontSize: 14, margin: '0 0 8px 0', color: '#0f172a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Patient Profile (User Intake)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
              <div><strong>Name:</strong> {intake.name || 'N/A'}</div>
              <div><strong>Age:</strong> {intake.age || 'N/A'}</div>
              <div><strong>Sex:</strong> {intake.sex || 'N/A'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div><strong>Allergies:</strong> {intake.allergies || 'None reported'}</div>
              <div><strong>Medications:</strong> {intake.medications || 'None reported'}</div>
            </div>
            {intake.conditions && (
              <div style={{ marginTop: 6 }}>
                <strong>Existing Conditions:</strong> {intake.conditions}
              </div>
            )}
            {intake.symptoms && (
              <div style={{ marginTop: 4 }}>
                <strong>Reported Symptoms:</strong> {intake.symptoms}
              </div>
            )}
          </div>

          {/* Summary Narrative */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, fontWeight: 700 }}>
              Clinical Summary & Findings Overview
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
              {summary.narrative}
            </p>
          </div>

          {/* Laboratory Parameters Table */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, fontWeight: 700 }}>
              Extracted Laboratory Findings
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }} aria-label="Extracted Laboratory Findings Table">
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Test / Parameter</th>
                  <th scope="col" style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Observed Value</th>
                  <th scope="col" style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Reported Range</th>
                  <th scope="col" style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Status</th>
                  <th scope="col" style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((p) => (
                  <tr key={p.id} style={{ background: p.isOutOfRange ? '#fff1f2' : '#ffffff' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                      <strong>{p.canonicalName}</strong>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{p.panel}</div>
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>
                      {p.observedValue} {p.unit}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                      {p.rawRangeText || 'None in report'}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600, color: p.isOutOfRange ? '#b91c1c' : '#15803d' }}>
                      {p.statusLabel}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontSize: 11 }}>
                      {p.isVerified ? '✓ Verified' : 'AI Extracted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Potential Inconsistencies */}
          {conflicts.length > 0 && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20
            }}>
              <h3 style={{ fontSize: 13, color: '#b45309', margin: '0 0 6px 0', fontWeight: 700 }}>
                ⚠️ Noted Cross-Record Discrepancies
              </h3>
              <ul style={{ paddingLeft: 18, fontSize: 12, color: '#78350f', margin: 0 }}>
                {conflicts.map((c) => (
                  <li key={c.id} style={{ marginBottom: 4 }}>
                    <strong>{c.title}:</strong> {c.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Discussion Topics for Physician */}
          {clarificationQuestions.length > 0 && (
            <div style={{
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20
            }}>
              <h3 style={{ fontSize: 13, color: '#0f766e', margin: '0 0 6px 0', fontWeight: 700 }}>
                📋 Topics to Discuss with Your Doctor
              </h3>
              <ul style={{ paddingLeft: 18, fontSize: 12, color: '#134e4a', margin: 0 }}>
                {clarificationQuestions.map((q) => (
                  <li key={q.id} style={{ marginBottom: 4 }}>
                    <strong>{q.question}</strong>
                    {q.userResponse && (
                      <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                        <em>Your Note:</em> "{q.userResponse}"
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: 12,
            marginTop: 20,
            fontSize: 10.5,
            color: '#64748b',
            lineHeight: 1.4
          }}>
            <strong>Important Medical Disclaimer:</strong> {disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
