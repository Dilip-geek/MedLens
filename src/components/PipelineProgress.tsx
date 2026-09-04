import React from 'react';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { PipelineStage } from '../types';

interface PipelineProgressProps {
  stages: PipelineStage[];
  isRunning: boolean;
  totalDurationMs?: number;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  stages,
  isRunning,
  totalDurationMs
}) => {
  const defaultStages: Array<{ key: string; label: string }> = [
    { key: 'INPUT', label: 'Input' },
    { key: 'EXTRACTION', label: 'Extraction' },
    { key: 'VALIDATION', label: 'Validation' },
    { key: 'NORMALIZATION', label: 'Normalization' },
    { key: 'ANALYSIS', label: 'Analysis' },
    { key: 'INSIGHT', label: 'Insight' },
    { key: 'HUMAN_REVIEW', label: 'Human Review' },
  ];

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--teal-500)', textTransform: 'uppercase' }}>
            MedLens Intelligence Pipeline
          </span>
          {isRunning && (
            <span className="badge badge-high spin-slow" style={{ fontSize: 11 }}>
              <Clock size={12} className="spin" /> Processing...
            </span>
          )}
          {!isRunning && stages.length > 0 && (
            <span className="badge badge-normal" style={{ fontSize: 11 }}>
              <CheckCircle2 size={12} /> Executed in {totalDurationMs || 0}ms
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          INPUT → EXTRACTION → VALIDATION → NORMALIZATION → ANALYSIS → INSIGHT → HUMAN REVIEW
        </span>
      </div>

      {/* Stepper Timeline Track */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {defaultStages.map((s, idx) => {
          const executed = stages.find(st => st.stage === s.key || (s.key === 'HUMAN_REVIEW' && stages.length > 0));
          const isDone = !!executed && !isRunning;
          const isActive = isRunning && (idx === 0 || stages.some(st => st.stage === s.key));

          return (
            <React.Fragment key={s.key}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minWidth: 85,
                zIndex: 2
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  background: isDone
                    ? 'var(--teal-600)'
                    : isActive
                    ? 'var(--bg-card-hover)'
                    : 'var(--bg-secondary)',
                  border: isDone
                    ? '2px solid var(--teal-500)'
                    : isActive
                    ? '2px solid var(--teal-500)'
                    : '2px solid var(--border-subtle)',
                  color: isDone ? '#ffffff' : isActive ? 'var(--teal-500)' : 'var(--text-dim)',
                  boxShadow: isDone ? '0 0 10px rgba(13, 148, 136, 0.4)' : 'none'
                }}>
                  {isDone ? <CheckCircle2 size={14} /> : isActive ? <PlayCircle size={14} className="spin" /> : idx + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDone ? 'var(--text-main)' : isActive ? 'var(--teal-500)' : 'var(--text-dim)',
                  textAlign: 'center'
                }}>
                  {s.label}
                </span>
                {executed && executed.durationMs !== undefined && (
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {executed.durationMs}ms
                  </span>
                )}
              </div>
              {idx < defaultStages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: isDone ? 'var(--teal-600)' : 'var(--border-subtle)',
                  minWidth: 20,
                  margin: '0 4px',
                  marginBottom: 26,
                  transition: 'background 0.3s ease'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
