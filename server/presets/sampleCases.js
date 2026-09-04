// MedLens Pre-Configured Clinical Scenarios
// Real-world cases demonstrating extraction, normalization, range awareness,
// conflict detection, clarification generation, longitudinal shifts, and human review.

export const SAMPLE_CASES = [
  {
    id: 'case_diabetes',
    name: 'Case 1: Glycemic & Metabolic Follow-Up (Type 2 Diabetes)',
    badge: 'Longitudinal Trends & Out-of-Range',
    description: 'Demonstrates glycemic escalation, lipid shifts, and longitudinal delta tracking.',
    intake: {
      name: 'Sarah Jenkins',
      age: 56,
      sex: 'Female',
      symptoms: 'Mild afternoon fatigue, increased thirst over past 3 weeks',
      conditions: 'Type 2 Diabetes Mellitus, Essential Hypertension',
      allergies: 'NKDA (No Known Drug Allergies)',
      medications: 'Metformin 1000 mg twice daily, Amlodipine 5 mg daily',
      notes: 'Routine 6-month laboratory checkup. Patient reports attempting low-carb diet.'
    },
    currentReport: `METROPOLITAN CLINICAL LABORATORY
Patient: Sarah Jenkins    Age: 56    Sex: Female    DOB: 12/04/1969
Date Collected: 08/20/2026 08:30 AM    Physician: Dr. Mark Vance
Facility: Metro Central Diagnostics

COMPREHENSIVE METABOLIC & GLYCEMIC PANEL:
Fasting Blood Glucose: 146 mg/dL (Ref: 70 - 99)
Hemoglobin A1c: 8.2 % (Ref: 4.0 - 5.6)
Serum Creatinine: 1.15 mg/dL (Ref: 0.50 - 1.10)
Blood Urea Nitrogen: 22 mg/dL (Ref: 7 - 20)
Estimated GFR: 64 mL/min/1.73m2 (Ref: > 60)
Serum Sodium: 139 mEq/L (Ref: 135 - 145)
Serum Potassium: 4.6 mEq/L (Ref: 3.5 - 5.0)

LIPID PANEL:
Total Cholesterol: 218 mg/dL (Ref: < 200)
HDL Cholesterol: 44 mg/dL (Ref: > 50)
LDL Cholesterol: 138 mg/dL (Ref: < 100)
Triglycerides: 180 mg/dL (Ref: < 150)

Notes: Specimen was drawn after documented 10-hour fast. Patient advised to review glycemic control with primary physician.`,
    previousReport: `METROPOLITAN CLINICAL LABORATORY
Patient: Sarah Jenkins    Age: 55    Sex: Female
Date Collected: 02/15/2026 09:00 AM    Physician: Dr. Mark Vance

COMPREHENSIVE METABOLIC & GLYCEMIC PANEL:
Fasting Blood Glucose: 122 mg/dL (Ref: 70 - 99)
Hemoglobin A1c: 7.2 % (Ref: 4.0 - 5.6)
Serum Creatinine: 0.95 mg/dL (Ref: 0.50 - 1.10)
Blood Urea Nitrogen: 16 mg/dL (Ref: 7 - 20)
Estimated GFR: 78 mL/min/1.73m2 (Ref: > 60)
Serum Sodium: 140 mEq/L (Ref: 135 - 145)
Serum Potassium: 4.4 mEq/L (Ref: 3.5 - 5.0)

LIPID PANEL:
Total Cholesterol: 195 mg/dL (Ref: < 200)
HDL Cholesterol: 48 mg/dL (Ref: > 50)
LDL Cholesterol: 115 mg/dL (Ref: < 100)
Triglycerides: 160 mg/dL (Ref: < 150)`
  },
  {
    id: 'case_conflict',
    name: 'Case 2: Allergy & Medication Conflict Demo',
    badge: 'Contradiction & Conflict Detection',
    description: 'Surfaces hidden penicillin allergy and medication dosage discrepancies across records.',
    intake: {
      name: 'Robert Chen',
      age: 48,
      sex: 'Male',
      symptoms: 'Mild headaches, occasional shortness of breath with heavy exertion',
      conditions: 'Hypertension',
      allergies: 'None',
      medications: 'Lisinopril 10 mg daily',
      notes: 'Transferred from previous clinic in Chicago.'
    },
    currentReport: `VALLEY HEALTH DIAGNOSTICS
Patient Name: Robert Chen    Age: 48    Gender: Male
Date of Report: 08/18/2026    Dr. Jennifer Hayes, MD

HEMATOLOGY & BIOCHEMISTRY:
Hb: 14.8 g/dL (Reference Range: 13.5 - 17.5)
WBC: 6.8 x10^3/uL (Reference Range: 4.5 - 11.0)
Platelets: 240 x10^3/uL (Reference Range: 150 - 450)
Serum Creatinine: 1.0 mg/dL (Reference Range: 0.7 - 1.3)
Serum Potassium: 4.2 mEq/L (Reference Range: 3.5 - 5.1)
Total Cholesterol: 188 mg/dL (Reference Range: < 200)

Clinical Notes: Patient reports good compliance with Lisinopril 20 mg daily. Previous adverse reaction to Amoxicillin noted in transfer chart.`,
    previousReport: `MIDWEST MEDICAL CENTER - TRANSFER SUMMARY
Patient: Robert Chen    Age: 47    Sex: Male
Report Date: 09/10/2025

Allergies: Penicillin (severe maculopapular rash and facial urticaria in 2021)
Active Medications: Lisinopril 20 mg daily, Hydrochlorothiazide 12.5 mg daily
Past Medical History: Essential Hypertension, Hyperlipidemia

LABORATORY VALUES:
Hemoglobin: 15.2 g/dL (Ref: 13.5 - 17.5)
Serum Potassium: 4.4 mEq/L (Ref: 3.5 - 5.1)
Serum Creatinine: 0.9 mg/dL (Ref: 0.7 - 1.3)`
  },
  {
    id: 'case_anemia',
    name: 'Case 3: Microcytic Anemia & Iron Studies',
    badge: 'Reference Range Absence & Iron Trends',
    description: 'Highlights strict refusal to invent missing reference ranges and hematologic deltas.',
    intake: {
      name: 'Maria Garcia',
      age: 34,
      sex: 'Female',
      symptoms: 'Progressive fatigue, lightheadedness when standing quickly, pale complexion',
      conditions: 'Menorrhagia',
      allergies: 'Sulfa drugs (hives)',
      medications: 'Daily multivitamin, Ibuprofen 400 mg PRN for cramps',
      notes: 'Symptoms worsening over the last 2 months. Primary care physician ordered full anemia workup.'
    },
    currentReport: `EVERGREEN COMMUNITY CLINIC
Patient: Maria Garcia    Age: 34    Sex: Female
Collected: 08/25/2026    Ordering Provider: Dr. Alan Ross

COMPLETE BLOOD COUNT (CBC):
Hemoglobin: 9.6 g/dL (Reference: 12.0 - 15.5)
Hematocrit: 29.8 % (Reference: 36.0 - 46.0)
RBC: 3.8 x10^6/uL (Reference: 4.0 - 5.2)
Mean Corpuscular Volume: 72 fL (Reference: 80 - 100)
MCH: 23 pg (Reference: 27 - 33)
Platelet Count: 410 x10^3/uL (Reference: 150 - 450)
WBC: 6.2 x10^3/uL (Reference: 4.0 - 11.0)

IRON STUDIES:
Serum Ferritin: 8 ng/mL (Reference: 15 - 150)
Serum Iron: 32 ug/dL (Reference: 50 - 170)
Total Iron Binding Capacity: 440 ug/dL
Transferrin Saturation: 7 %

Impression: Microcytic hypochromic red cell indices consistent with iron depletion. Note that TIBC and Transferrin Saturation reference values were not established on this assay run.`,
    previousReport: `EVERGREEN COMMUNITY CLINIC
Patient: Maria Garcia    Age: 33    Sex: Female
Collected: 10/12/2025

COMPLETE BLOOD COUNT:
Hemoglobin: 12.1 g/dL (Reference: 12.0 - 15.5)
Hematocrit: 37.2 % (Reference: 36.0 - 46.0)
RBC: 4.3 x10^6/uL (Reference: 4.0 - 5.2)
Mean Corpuscular Volume: 86 fL (Reference: 80 - 100)
Platelet Count: 280 x10^3/uL (Reference: 150 - 450)`
  },
  {
    id: 'case_renal',
    name: 'Case 4: Renal Function & Electrolyte Shift',
    badge: 'Clinical Swings & Urgent Discussion Topics',
    description: 'Demonstrates rapid creatinine divergence, hyperkalemia warning, and clinical clarification generation.',
    intake: {
      name: 'Arthur Pendelton',
      age: 69,
      sex: 'Male',
      symptoms: 'Mild pedal edema, decreased appetite, feeling easily winded',
      conditions: 'Chronic Kidney Disease Stage 3a, Congestive Heart Failure',
      allergies: 'Codeine (nausea/vomiting)',
      medications: 'Furosemide 40 mg daily, Spironolactone 25 mg daily, Metoprolol Succinate 50 mg daily',
      notes: 'Recent mild viral gastroenteritis 1 week ago with limited oral fluid intake.'
    },
    currentReport: `ST. JUDE MEMORIAL HOSPITAL
Patient: Arthur Pendelton    Age: 69    Sex: Male
Report Date: 08/28/2026    Attending: Dr. Priya Nair

RENAL & ELECTROLYTE PANEL:
Serum Creatinine: 2.2 mg/dL (Ref: 0.7 - 1.3)
Blood Urea Nitrogen: 48 mg/dL (Ref: 8 - 24)
Estimated Glomerular Filtration Rate: 29 mL/min/1.73m2 (Ref: > 60)
Serum Potassium: 5.6 mEq/L (Ref: 3.5 - 5.1)
Serum Sodium: 133 mEq/L (Ref: 136 - 145)
Serum Bicarbonate: 19 mEq/L (Ref: 22 - 29)
Serum Calcium: 8.9 mg/dL (Ref: 8.5 - 10.2)

Notes: Marked elevation in BUN and Creatinine compared to baseline. Recommend urgent physician review of volume status and potassium-sparing medications.`,
    previousReport: `ST. JUDE MEMORIAL HOSPITAL
Patient: Arthur Pendelton    Age: 68    Sex: Male
Report Date: 03/14/2026

RENAL & ELECTROLYTE PANEL:
Serum Creatinine: 1.35 mg/dL (Ref: 0.7 - 1.3)
Blood Urea Nitrogen: 22 mg/dL (Ref: 8 - 24)
Estimated Glomerular Filtration Rate: 54 mL/min/1.73m2 (Ref: > 60)
Serum Potassium: 4.4 mEq/L (Ref: 3.5 - 5.1)
Serum Sodium: 138 mEq/L (Ref: 136 - 145)`
  }
];
