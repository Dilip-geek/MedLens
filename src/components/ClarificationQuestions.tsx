import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, MessageSquare, ArrowRight, CornerDownRight } from 'lucide-react';
import { ClarificationQuestion } from '../types';

interface ClarificationQuestionsProps {
  questions: ClarificationQuestion[];
  onAnswerQuestion: (questionId: string, answer: string) => void;
}

export const ClarificationQuestions: React.FC<ClarificationQuestionsProps> = ({
  questions,
  onAnswerQuestion
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');

  if (!questions || questions.length === 0) return null;

  const startAnswering = (q: ClarificationQuestion) => {
    setEditingId(q.id);
    setCurrentAnswer(q.userResponse || '');
  };

  const saveAnswer = (questionId: string) => {
    onAnswerQuestion(questionId, currentAnswer.trim());
    setEditingId(null);
    setCurrentAnswer('');
  };

  const answeredCount = questions.filter(q => q.isAnswered).length;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="card-title">
            <HelpCircle size={20} style={{ color: 'var(--cyan-400)' }} />
            <span>Targeted Clarification Questions</span>
            <span className="badge badge-normal" style={{ fontSize: 11 }}>
              {answeredCount} of {questions.length} Addressed
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            High-value questions identified from missing ranges, discrepancies, or clinical protocols to clarify with your healthcare provider.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: q.isAnswered ? 'var(--bg-secondary)' : 'rgba(6, 182, 212, 0.04)',
              border: q.isAnswered ? '1px solid var(--border-subtle)' : '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--cyan-400)'
                }}>
                  {idx + 1}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                  {q.category}
                </span>
                <span className={`badge ${q.urgency === 'High' ? 'badge-critical' : q.urgency === 'Medium' ? 'badge-high' : 'badge-normal'}`} style={{ fontSize: 10 }}>
                  {q.urgency} Priority
                </span>
              </div>

              {q.isAnswered ? (
                <span className="badge badge-normal" style={{ fontSize: 11 }}>
                  <CheckCircle2 size={12} /> Clarified
                </span>
              ) : (
                <button
                  onClick={() => startAnswering(q)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  <MessageSquare size={12} /> Add Patient Note
                </button>
              )}
            </div>

            {/* Question Text */}
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-highlight)', marginTop: 8 }}>
              {q.question}
            </div>

            {/* Context */}
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
              <strong>Context:</strong> {q.context}
            </div>

            {/* Editing Form */}
            {editingId === q.id && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 60, fontSize: 13 }}
                  placeholder="Record your answer or physician note here (e.g. 'Yes, fasted for 12 hours prior to lab draw')..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveAnswer(q.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {/* Saved User Response */}
            {q.isAnswered && q.userResponse && (
              <div style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderLeft: '3px solid var(--status-normal)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: 12.5,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6
              }}>
                <CornerDownRight size={14} style={{ color: 'var(--status-normal)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong>Your Clarification:</strong> {q.userResponse}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
