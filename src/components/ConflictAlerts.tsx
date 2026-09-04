import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { MedicalConflict } from '../types';

interface ConflictAlertsProps {
  conflicts: MedicalConflict[];
  onResolveConflict: (conflictId: string, resolutionNotes: string, resolvedBy: string) => void;
}

export const ConflictAlerts: React.FC<ConflictAlertsProps> = ({
  conflicts,
  onResolveConflict
}) => {
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [selectedSourceChoice, setSelectedSourceChoice] = useState<string>('');

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <CheckCircle2 size={20} style={{ color: 'var(--status-normal)' }} />
            <span>Cross-Source Inconsistency & Conflict Audit</span>
          </div>
        </div>
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={32} style={{ color: 'var(--status-normal)', marginBottom: 8 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-highlight)', margin: 0 }}>
            No Clinical Inconsistencies Detected
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            Patient intake demographics, allergies, medications, and laboratory values align across the provided records.
          </p>
        </div>
      </div>
    );
  }

  const unresolved = conflicts.filter(c => !c.resolved);
  const resolved = conflicts.filter(c => c.resolved);

  const startResolving = (conflict: MedicalConflict) => {
    setActiveResolvingId(conflict.id);
    setSelectedSourceChoice(conflict.sources[0]?.sourceName || '');
    setResolutionText(`Verified with patient: ${conflict.sources[0]?.statement || ''}`);
  };

  const handleSaveResolution = (conflictId: string) => {
    if (!resolutionText.trim()) return;
    onResolveConflict(conflictId, resolutionText.trim(), 'Patient / User Review');
    setActiveResolvingId(null);
    setResolutionText('');
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="card-title">
            <AlertTriangle size={20} style={{ color: 'var(--status-high)' }} />
            <span>Cross-Source Inconsistency & Conflict Audit</span>
            <span className="badge badge-high" style={{ fontSize: 12 }}>
              {unresolved.length} Unresolved
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            MedLens flags contradictory statements across intake, current, and historical records without assuming medical authority.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {conflicts.map(conflict => (
          <div
            key={conflict.id}
            style={{
              background: conflict.resolved ? 'var(--bg-secondary)' : 'rgba(245, 158, 11, 0.04)',
              border: conflict.resolved ? '1px solid var(--border-subtle)' : '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${
                  conflict.severity === 'HIGH' ? 'badge-critical' :
                  conflict.severity === 'MODERATE' ? 'badge-high' : 'badge-neutral'
                }`}>
                  {conflict.severity} Priority
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-highlight)' }}>
                  {conflict.title}
                </span>
              </div>

              {conflict.resolved ? (
                <span className="badge badge-normal" style={{ fontSize: 11 }}>
                  <CheckCircle size={12} /> Resolved
                </span>
              ) : (
                <button
                  onClick={() => startResolving(conflict)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  Resolve / Clarify Conflict
                </button>
              )}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 8, marginBottom: 12 }}>
              {conflict.description}
            </p>

            {/* Conflicting Source Statements Side-by-Side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 10,
              background: 'rgba(15, 23, 42, 0.6)',
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 10
            }}>
              {conflict.sources.map((src, idx) => (
                <div key={idx} style={{ fontSize: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>
                    Source {idx + 1}: {src.sourceName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 4 }}>
                    "{src.statement}"
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Clinician Action */}
            <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--teal-500)' }}>Suggested Action:</span>
              <span>{conflict.suggestedAction}</span>
            </div>

            {/* Resolution Form if active */}
            {activeResolvingId === conflict.id && (
              <div style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(13, 148, 136, 0.06)',
                padding: 14,
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-500)', marginBottom: 8 }}>
                  Document Conflict Resolution:
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11 }}>
                    Clarification / Verified Resolution Note:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="e.g. Confirmed with patient: Penicillin reaction was mild rash 10 years ago. Updated allergy profile."
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveResolvingId(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveResolution(conflict.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Save Verified Resolution
                  </button>
                </div>
              </div>
            )}

            {/* Resolved Note Display */}
            {conflict.resolved && conflict.resolutionNotes && (
              <div style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderLeft: '3px solid var(--status-normal)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: 12,
                color: 'var(--text-main)'
              }}>
                <strong>Resolution Log:</strong> {conflict.resolutionNotes}
                <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 8 }}>
                  ({conflict.resolvedBy} • {conflict.resolvedAt ? new Date(conflict.resolvedAt).toLocaleTimeString() : 'Just now'})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
