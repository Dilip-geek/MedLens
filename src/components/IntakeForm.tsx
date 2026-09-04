import React from 'react';
import { User, AlertCircle, Pill, ShieldAlert, HeartPulse, FileText, Sparkles } from 'lucide-react';
import { PatientIntake } from '../types';

interface IntakeFormProps {
  intake: PatientIntake;
  onChange: (updated: PatientIntake) => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ intake, onChange }) => {
  const updateField = (field: keyof PatientIntake, value: any) => {
    onChange({
      ...intake,
      [field]: value
    });
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <User size={20} style={{ color: 'var(--prov-user)' }} />
          <span>Patient Intake Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="prov-tag prov-user" title="Direct Patient-Entered Data">
            👤 User-Provided Intake
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {/* Name */}
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label" htmlFor="intake-name">
            Patient Name / Identifier
          </label>
          <input
            id="intake-name"
            type="text"
            className="form-input"
            placeholder="e.g. Sarah Jenkins"
            value={intake.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label" htmlFor="intake-age">
            Age
          </label>
          <input
            id="intake-age"
            type="number"
            className="form-input"
            placeholder="e.g. 56"
            value={intake.age}
            onChange={(e) => updateField('age', e.target.value)}
          />
        </div>

        {/* Sex */}
        <div className="form-group">
          <label className="form-label" htmlFor="intake-sex">
            Sex
          </label>
          <select
            id="intake-sex"
            className="form-select"
            value={intake.sex}
            onChange={(e) => updateField('sex', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other / Intersex</option>
          </select>
        </div>
      </div>

      {/* Symptoms */}
      <div className="form-group">
        <label className="form-label" htmlFor="intake-symptoms" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <HeartPulse size={14} style={{ color: 'var(--status-critical)' }} />
          Reported Symptoms & Duration
        </label>
        <textarea
          id="intake-symptoms"
          className="form-textarea"
          style={{ minHeight: 65 }}
          placeholder="e.g. Progressive afternoon fatigue, increased thirst, occasional dizziness..."
          value={intake.symptoms}
          onChange={(e) => updateField('symptoms', e.target.value)}
        />
      </div>

      {/* Conditions */}
      <div className="form-group">
        <label className="form-label" htmlFor="intake-conditions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} style={{ color: 'var(--teal-500)' }} />
          Existing Medical Conditions
        </label>
        <input
          id="intake-conditions"
          type="text"
          className="form-input"
          placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension"
          value={intake.conditions}
          onChange={(e) => updateField('conditions', e.target.value)}
        />
      </div>

      {/* Allergies */}
      <div className="form-group">
        <label className="form-label" htmlFor="intake-allergies" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={14} style={{ color: 'var(--status-high)' }} />
          Known Allergies & Sensitivities
        </label>
        <input
          id="intake-allergies"
          type="text"
          className="form-input"
          placeholder="e.g. NKDA (No Known Drug Allergies) or Penicillin (rash)"
          value={intake.allergies}
          onChange={(e) => updateField('allergies', e.target.value)}
        />
      </div>

      {/* Current Medications */}
      <div className="form-group">
        <label className="form-label" htmlFor="intake-meds" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Pill size={14} style={{ color: 'var(--indigo-500)' }} />
          Current Medications & Dosages
        </label>
        <textarea
          id="intake-meds"
          className="form-textarea"
          style={{ minHeight: 65 }}
          placeholder="e.g. Metformin 1000 mg twice daily, Amlodipine 5 mg daily..."
          value={intake.medications}
          onChange={(e) => updateField('medications', e.target.value)}
        />
      </div>

      {/* Additional Clinical Notes */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="intake-notes">
          Additional Notes / Lifestyle / Diet
        </label>
        <input
          id="intake-notes"
          type="text"
          className="form-input"
          placeholder="e.g. Follow-up consultation, attempting low-carb diet..."
          value={intake.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );
};
