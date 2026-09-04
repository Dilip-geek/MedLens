import React, { useState, useEffect } from 'react';
import { Edit3, CheckCircle2, ShieldCheck, History, X, Save, Plus } from 'lucide-react';
import { ExtractedParameter, AuditLogItem } from '../types';

interface HumanReviewModalProps {
  param: ExtractedParameter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ExtractedParameter, auditDescription: string) => void;
  onAddParameter?: (newParam: ExtractedParameter) => void;
  auditLog: AuditLogItem[];
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  param,
  isOpen,
  onClose,
  onSave,
  onAddParameter,
  auditLog
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'audit'>('edit');
  const [editedName, setEditedName] = useState('');
  const [editedValue, setEditedValue] = useState<number | string>('');
  const [editedUnit, setEditedUnit] = useState('');
  const [editedRange, setEditedRange] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  useEffect(() => {
    if (param) {
      setEditedName(param.canonicalName);
      setEditedValue(param.observedValue);
      setEditedUnit(param.unit);
      setEditedRange(param.rawRangeText || '');
      setIsVerified(param.isVerified);
      setUserNotes(param.userNotes || '');
    }
  }, [param]);

  if (!isOpen || !param) return null;

  const handleSave = () => {
    const originalValue = param.observedValue;
    const numericValue = typeof editedValue === 'number' ? editedValue : parseFloat(String(editedValue));
    const finalValue = !isNaN(numericValue) ? numericValue : editedValue;

    const changes = [];
    if (param.canonicalName !== editedName) changes.push(`Name: "${param.canonicalName}" → "${editedName}"`);
    if (String(originalValue) !== String(finalValue)) changes.push(`Value: ${originalValue} → ${finalValue}`);
    if (param.unit !== editedUnit) changes.push(`Unit: "${param.unit}" → "${editedUnit}"`);
    if ((param.rawRangeText || '') !== editedRange) changes.push(`Range: "${param.rawRangeText || 'None'}" → "${editedRange}"`);
    if (isVerified !== param.isVerified) changes.push(isVerified ? 'Marked as Human Verified' : 'Unmarked verification');

    const updated: ExtractedParameter = {
      ...param,
      canonicalName: editedName,
      observedValue: finalValue,
      rawValueString: String(finalValue),
      unit: editedUnit,
      rawRangeText: editedRange || null,
      isVerified,
      userNotes,
      sourceType: isVerified ? 'human_verified' : param.sourceType,
      sourceLabel: isVerified ? 'Human Verified' : param.sourceLabel,
      lastModified: new Date().toISOString()
    };

    const description = changes.length > 0
      ? `Human correction applied: ${changes.join(', ')}`
      : 'Parameter verified by user without modifications.';

    onSave(updated, description);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }}>
      <div className="card" style={{
        maxWidth: 580,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        <div className="card-header">
          <div className="card-title">
            <Edit3 size={18} style={{ color: 'var(--teal-500)' }} />
            <span>Human Review & Clinical Audit</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setActiveTab('edit')}
              className={`btn btn-sm ${activeTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Edit Parameter
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <History size={13} /> Audit History ({auditLog.length})
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 8px' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <div>
            <div style={{
              background: 'rgba(13, 148, 136, 0.08)',
              borderLeft: '3px solid var(--teal-500)',
              padding: '10px 14px',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 16
            }}>
              <strong>Human Verification Protocol:</strong> AI-extracted medical values are provisional. You can correct names, units, values, or reference ranges and log them to the clinical audit trail.
            </div>

            {/* Test Name */}
            <div className="form-group">
              <label className="form-label">Parameter Name</label>
              <input
                type="text"
                className="form-input"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Value */}
              <div className="form-group">
                <label className="form-label">Observed Value</label>
                <input
                  type="text"
                  className="form-input"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                />
              </div>

              {/* Unit */}
              <div className="form-group">
                <label className="form-label">Unit of Measurement</label>
                <input
                  type="text"
                  className="form-input"
                  value={editedUnit}
                  onChange={(e) => setEditedUnit(e.target.value)}
                />
              </div>
            </div>

            {/* Reference Range */}
            <div className="form-group">
              <label className="form-label">Reported Reference Range (from Source Document)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 13.0 - 17.5"
                value={editedRange}
                onChange={(e) => setEditedRange(e.target.value)}
              />
            </div>

            {/* User Notes */}
            <div className="form-group">
              <label className="form-label">Clinical / Verification Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Verified with printed hospital lab sheet"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />
            </div>

            {/* Verification Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-secondary)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 20
            }}>
              <input
                id="verify-checkbox"
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--teal-500)', cursor: 'pointer' }}
              />
              <label htmlFor="verify-checkbox" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-highlight)', cursor: 'pointer' }}>
                Mark parameter as verified by user / clinician
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={15} /> Save & Update Record
              </button>
            </div>
          </div>
        ) : (
          /* Audit History Tab */
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-highlight)', marginBottom: 12 }}>
              Traceable Modification Audit Trail:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {auditLog.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    fontSize: 12.5
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--teal-500)' }}>{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)' }}>{log.description}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 4 }}>
                    Actor: {log.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
