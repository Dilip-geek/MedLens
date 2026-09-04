import React from 'react';
import { Sparkles, Shield, AlertTriangle, CheckCircle2, MessageSquare, HeartHandshake } from 'lucide-react';
import { PatientSummaryData } from '../types';

interface PatientSummaryProps {
  summary: PatientSummaryData;
  isGeminiEnhanced?: boolean;
}

export const PatientSummary: React.FC<PatientSummaryProps> = ({
  summary,
  isGeminiEnhanced = false
}) => {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <div className="card-title">
          <HeartHandshake size={20} style={{ color: 'var(--teal-500)' }} />
          <span>Patient-Centered Summary & Discussion Topics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isGeminiEnhanced ? (
            <span className="prov-tag prov-ai" title="Enhanced using Gemini 2.5 Flash model">
              ✨ Gemini Flash AI Synthesis
            </span>
          ) : (
            <span className="prov-tag prov-current" title="Synthesized by MedLens Clinical Intelligence Rules">
              ⚡ MedLens Intelligence Engine
            </span>
          )}
        </div>
      </div>

      {/* Overview Narrative */}
      <div style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: 'var(--text-main)',
        background: 'var(--bg-secondary)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 20
      }}>
        {summary.narrative}
      </div>

      {/* Key Finding Callouts */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-highlight)', marginBottom: 10 }}>
          Key Extracted Findings & Reference Range Observations:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {summary.keyFindings.map((finding, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--status-high)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12.5 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>
                  {finding.parameter}: <strong>{finding.value}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  {finding.statement}
                </div>
              </div>
            </div>
          ))}
          {summary.keyFindings.length === 0 && (
            <div style={{ gridColumn: 'span 2', padding: 14, background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: 13, color: 'var(--status-normal)' }}>
              All analyzed clinical parameters with reported reference ranges fall within expected normal laboratory intervals.
            </div>
          )}
        </div>
      </div>

      {/* Narrative Observations from source document */}
      {summary.observations && summary.observations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-highlight)', marginBottom: 8 }}>
            Extracted Physician & Laboratory Impressions:
          </div>
          <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {summary.observations.map((obs, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Discussion Points for Doctor Visit */}
      {summary.recommendedDiscussionPoints && summary.recommendedDiscussionPoints.length > 0 && (
        <div style={{
          background: 'rgba(13, 148, 136, 0.06)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--teal-500)', marginBottom: 8 }}>
            <MessageSquare size={16} />
            <span>Recommended Checklist for Your Next Appointment:</span>
          </div>
          <ul style={{ paddingLeft: 20, fontSize: 12.5, color: 'var(--text-main)', lineHeight: 1.6 }}>
            {summary.recommendedDiscussionPoints.map((point, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Non-Diagnostic Medical Disclaimer */}
      <div className="disclaimer-banner">
        <Shield size={20} style={{ color: 'var(--teal-500)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Non-Diagnostic Medical Intelligence Notice:</strong> {summary.disclaimer}
        </div>
      </div>
    </div>
  );
};
