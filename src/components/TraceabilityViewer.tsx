import React from 'react';
import { ShieldCheck, Eye, Hash, FileText, CheckCircle2, X } from 'lucide-react';
import { ExtractedParameter } from '../types';

interface TraceabilityViewerProps {
  selectedParam: ExtractedParameter | null;
  rawReportText: string;
  onClose: () => void;
}

export const TraceabilityViewer: React.FC<TraceabilityViewerProps> = ({
  selectedParam,
  rawReportText,
  onClose
}) => {
  if (!selectedParam) return null;

  // Split raw report text by lines to highlight the matching line
  const lines = rawReportText.split(/\r?\n/);

  return (
    <div className="card" style={{
      marginBottom: 24,
      borderColor: 'var(--teal-600)',
      boxShadow: '0 0 25px rgba(13, 148, 136, 0.18)'
    }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div className="card-title">
          <Eye size={18} style={{ color: 'var(--teal-500)' }} />
          <span>Source Provenance & Traceability Inspection</span>
          <span className="badge badge-normal" style={{ fontSize: 11 }}>
            {selectedParam.canonicalName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 8px' }}
          title="Close Traceability Inspector"
        >
          <X size={14} /> Close
        </button>
      </div>

      {/* Metadata Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Canonical Parameter</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-highlight)' }}>{selectedParam.canonicalName}</div>
          <div style={{ fontSize: 11, color: 'var(--teal-500)', fontFamily: 'var(--font-mono)' }}>LOINC: {selectedParam.loinc}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Extracted Value & Unit</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-highlight)' }}>
            {selectedParam.observedValue} {selectedParam.unit}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status: {selectedParam.statusLabel}</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Source Document</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-500)' }}>📄 {selectedParam.sourceLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Char Offset: [{selectedParam.sourceOffset.start} – {selectedParam.sourceOffset.end}]
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Extraction Confidence</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--status-normal)' }}>
            {(selectedParam.confidence * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Verified Regex Anchor</div>
        </div>
      </div>

      {/* Verbatim Source Quote Callout */}
      <div style={{
        background: 'rgba(13, 148, 136, 0.1)',
        borderLeft: '4px solid var(--teal-500)',
        padding: '12px 16px',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        marginBottom: 16
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-500)', textTransform: 'uppercase', marginBottom: 4 }}>
          Exact Verbatim Line Quote From Source Report
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: '#ffffff', fontWeight: 600 }}>
          "{selectedParam.sourceQuote}"
        </div>
      </div>

      {/* Document Snippet View with Highlight */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          Contextual Document View:
        </div>
        <div style={{
          maxHeight: 180,
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.6
        }}>
          {lines.map((line, idx) => {
            const isMatch = line.trim() && selectedParam.sourceQuote && line.trim().includes(selectedParam.sourceQuote.trim());
            return (
              <div
                key={idx}
                style={{
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: isMatch ? 'rgba(13, 148, 136, 0.3)' : 'transparent',
                  borderLeft: isMatch ? '3px solid var(--teal-500)' : '3px solid transparent',
                  color: isMatch ? '#ffffff' : 'var(--text-dim)',
                  fontWeight: isMatch ? 700 : 400
                }}
              >
                <span style={{ color: 'var(--text-dim)', marginRight: 12, userSelect: 'none', fontSize: 10 }}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
