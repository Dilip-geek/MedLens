import React from 'react';
import { Activity, Sparkles, Moon, Sun, Printer, Shield, FolderOpen } from 'lucide-react';
import { ClinicalPreset } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  presets: ClinicalPreset[];
  onSelectPreset: (presetId: string) => void;
  onOpenSettings: () => void;
  onPrint: () => void;
  hasRecord: boolean;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  presets,
  onSelectPreset,
  onOpenSettings,
  onPrint,
  hasRecord,
  geminiActive
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-card-glass)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Logo & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--teal-600), var(--cyan-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 30%, var(--teal-500))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MedLens
              </span>
              <span className="badge badge-normal" style={{ fontSize: 10, padding: '2px 6px' }}>
                Intelligence
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
              Traceable Medical Record Structuring & Analysis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Preset Clinical Cases */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderOpen size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: 13, width: 'auto', minWidth: 220 }}
              onChange={(e) => {
                if (e.target.value) onSelectPreset(e.target.value);
              }}
              defaultValue=""
              aria-label="Select Clinical Case Preset"
            >
              <option value="" disabled>Load Sample Clinical Case...</option>
              {presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Status Badge / Settings */}
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary btn-sm"
            title="Configure AI & Processing Engine"
            aria-label="Engine Settings"
          >
            {geminiActive ? (
              <>
                <Sparkles size={14} style={{ color: 'var(--teal-500)' }} />
                <span>Gemini Flash Active</span>
              </>
            ) : (
              <>
                <Shield size={14} style={{ color: 'var(--status-normal)' }} />
                <span>Deterministic Engine</span>
              </>
            )}
          </button>

          {/* Print / Export Report */}
          {hasRecord && (
            <button
              onClick={onPrint}
              className="btn btn-secondary btn-sm"
              title="Print or Export Patient Record Summary"
              aria-label="Export or Print Summary"
            >
              <Printer size={14} />
              <span>Export Summary</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px' }}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
