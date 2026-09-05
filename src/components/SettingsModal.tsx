import React, { useState } from 'react';
import { Key, Shield, Sparkles, X, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  geminiActive: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  geminiActive
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync inputKey with apiKey prop
  React.useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      style={{
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
      }}
    >
      <div className="card" style={{ maxWidth: 500, width: '100%', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)' }}>
        <div className="card-header">
          <div className="card-title" id="settings-modal-title">
            <Shield size={18} style={{ color: 'var(--teal-500)' }} />
            <span>AI Engine & Security Configuration</span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '6px 8px' }}
            aria-label="Close configuration modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Security & Privacy Notice */}
        <div style={{
          background: 'rgba(13, 148, 136, 0.08)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          fontSize: 12.5,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--teal-500)', marginBottom: 4 }}>
            <Lock size={14} />
            <span>Zero-Trust Credential Handling:</span>
          </div>
          API keys and patient records are processed entirely in server-side memory. Credentials are never written to public bundles, persistent client logs, or browser storage.
        </div>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 16
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-highlight)' }}>
              Active Intelligence Mode:
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {geminiActive ? 'Enhanced with Gemini 2.5 Flash LLM' : 'High-Performance Deterministic NLP & Clinical Rule Engine'}
            </div>
          </div>
          <span className={`badge ${geminiActive ? 'badge-normal' : 'badge-neutral'}`}>
            {geminiActive ? '✨ Gemini Active' : '⚡ Local Pipeline'}
          </span>
        </div>

        {/* API Key Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="gemini-key">
            Google Gemini API Key (Optional)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="gemini-key"
              type="password"
              className="form-input"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            Leave blank to run the full, complete deterministic medical intelligence engine without external API calls.
          </div>
        </div>

        {savedSuccess && (
          <div style={{ color: 'var(--status-normal)', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> Key configured successfully!
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Engine Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
