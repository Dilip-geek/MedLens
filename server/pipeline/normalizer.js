// MedLens Clinical Normalization Engine
// Maps clinical terms, synonyms, abbreviations to canonical definitions, standard panels, and LOINC codes

export const CLINICAL_PANELS = {
  HEMATOLOGY: 'Hematology & CBC',
  METABOLIC_RENAL: 'Metabolic & Renal Profile',
  LIPID: 'Lipid Profile',
  LIVER: 'Hepatic / Liver Function',
  ENDOCRINE: 'Endocrine & Glycemic',
  ELECTROLYTES: 'Electrolytes & Minerals',
  INFLAMMATORY_CARDIAC: 'Cardiac & Inflammatory Markers',
  VITAMINS_MINERALS: 'Vitamins & Iron Studies',
  URINALYSIS: 'Urinalysis',
  GENERAL: 'General Chemistry',
};

export const NORMALIZATION_DICTIONARY = [
  // Hematology
  {
    canonical: 'Hemoglobin',
    aliases: ['hb', 'hgb', 'haemoglobin', 'hemoglobin', 'hgb blood', 'blood hb'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '718-7',
    standardUnit: 'g/dL',
    description: 'Oxygen-carrying protein in red blood cells'
  },
  {
    canonical: 'White Blood Cell Count',
    aliases: ['wbc', 'wbc count', 'white blood cells', 'leukocytes', 'leukocyte count', 'total wbc', 'wbc blood'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '6690-2',
    standardUnit: 'x10^3/uL',
    description: 'Total number of immune white blood cells'
  },
  {
    canonical: 'Red Blood Cell Count',
    aliases: ['rbc', 'rbc count', 'red blood cells', 'erythrocytes', 'erythrocyte count'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '789-8',
    standardUnit: 'x10^6/uL',
    description: 'Total number of red blood cells'
  },
  {
    canonical: 'Platelet Count',
    aliases: ['plt', 'platelets', 'platelet count', 'thrombocytes', 'plt count'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '777-3',
    standardUnit: 'x10^3/uL',
    description: 'Cells that help blood clot'
  },
  {
    canonical: 'Hematocrit',
    aliases: ['hct', 'hematocrit', 'haematocrit', 'pcv', 'packed cell volume'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '4544-3',
    standardUnit: '%',
    description: 'Percentage of blood volume composed of red blood cells'
  },
  {
    canonical: 'Mean Corpuscular Volume (MCV)',
    aliases: ['mcv', 'mean corpuscular volume', 'mean cell volume'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '787-2',
    standardUnit: 'fL',
    description: 'Average size of red blood cells'
  },
  {
    canonical: 'Mean Corpuscular Hemoglobin (MCH)',
    aliases: ['mch', 'mean corpuscular hemoglobin', 'mean cell hemoglobin'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '785-6',
    standardUnit: 'pg',
    description: 'Average amount of hemoglobin per red blood cell'
  },
  {
    canonical: 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
    aliases: ['mchc', 'mean corpuscular hemoglobin concentration'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '786-4',
    standardUnit: 'g/dL',
    description: 'Concentration of hemoglobin in a given volume of red blood cells'
  },
  {
    canonical: 'Red Cell Distribution Width (RDW)',
    aliases: ['rdw', 'rdw-cv', 'rdw-sd', 'red cell distribution width'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '788-0',
    standardUnit: '%',
    description: 'Variation in red blood cell volume and size'
  },
  {
    canonical: 'Neutrophils',
    aliases: ['neutrophils', 'neut', 'neutrophil %', 'neut%', 'segmented neutrophils', 'polys'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '761-7',
    standardUnit: '%',
    description: 'First responder white blood cells'
  },
  {
    canonical: 'Lymphocytes',
    aliases: ['lymphocytes', 'lymph', 'lymphocyte %', 'lymph%'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '731-0',
    standardUnit: '%',
    description: 'Immune cells involved in antibody and cell-mediated immunity'
  },
  {
    canonical: 'Monocytes',
    aliases: ['monocytes', 'mono', 'monocyte %', 'mono%'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '742-7',
    standardUnit: '%',
    description: 'Phagocytic immune cells'
  },
  {
    canonical: 'Eosinophils',
    aliases: ['eosinophils', 'eos', 'eosinophil %', 'eos%'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '711-2',
    standardUnit: '%',
    description: 'White blood cells responding to parasites and allergens'
  },
  {
    canonical: 'Basophils',
    aliases: ['basophils', 'baso', 'basophil %', 'baso%'],
    panel: CLINICAL_PANELS.HEMATOLOGY,
    loinc: '704-7',
    standardUnit: '%',
    description: 'White blood cells involved in inflammatory and allergic response'
  },

  // Metabolic & Renal
  {
    canonical: 'Serum Creatinine',
    aliases: ['creatinine', 'cr', 'creat', 'serum creatinine', 's. creatinine', 'creatinine serum'],
    panel: CLINICAL_PANELS.METABOLIC_RENAL,
    loinc: '2160-0',
    standardUnit: 'mg/dL',
    description: 'Waste product filtered by kidneys; indicator of renal clearance'
  },
  {
    canonical: 'Blood Urea Nitrogen (BUN)',
    aliases: ['bun', 'blood urea nitrogen', 'urea nitrogen', 'serum urea', 'urea'],
    panel: CLINICAL_PANELS.METABOLIC_RENAL,
    loinc: '3094-0',
    standardUnit: 'mg/dL',
    description: 'Waste product from protein breakdown cleared by kidneys'
  },
  {
    canonical: 'Estimated Glomerular Filtration Rate (eGFR)',
    aliases: ['egfr', 'estimated gfr', 'gfr', 'egfr ckd-epi', 'egfr non-african', 'egfr african american'],
    panel: CLINICAL_PANELS.METABOLIC_RENAL,
    loinc: '33914-3',
    standardUnit: 'mL/min/1.73m2',
    description: 'Calculated rate of kidney filtration function'
  },
  {
    canonical: 'BUN / Creatinine Ratio',
    aliases: ['bun/creatinine ratio', 'bun:cr ratio', 'bun / cr ratio', 'urea/creatinine ratio'],
    panel: CLINICAL_PANELS.METABOLIC_RENAL,
    loinc: '3097-3',
    standardUnit: 'ratio',
    description: 'Ratio helping differentiate pre-renal from intrinsic renal causes'
  },
  {
    canonical: 'Serum Uric Acid',
    aliases: ['uric acid', 'serum uric acid', 'urate', 'serum urate'],
    panel: CLINICAL_PANELS.METABOLIC_RENAL,
    loinc: '3084-1',
    standardUnit: 'mg/dL',
    description: 'End product of purine metabolism; elevated in gout or renal impairment'
  },

  // Electrolytes
  {
    canonical: 'Serum Sodium',
    aliases: ['sodium', 'na', 'na+', 'serum sodium', 's. sodium'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '2951-2',
    standardUnit: 'mEq/L',
    description: 'Major extracellular electrolyte governing fluid balance'
  },
  {
    canonical: 'Serum Potassium',
    aliases: ['potassium', 'k', 'k+', 'serum potassium', 's. potassium'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '2823-3',
    standardUnit: 'mEq/L',
    description: 'Critical electrolyte for cardiac rhythm and neuromuscular function'
  },
  {
    canonical: 'Serum Chloride',
    aliases: ['chloride', 'cl', 'cl-', 'serum chloride', 's. chloride'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '2075-0',
    standardUnit: 'mEq/L',
    description: 'Major extracellular anion maintaining electrical neutrality and acid-base status'
  },
  {
    canonical: 'Serum Bicarbonate (CO2)',
    aliases: ['carbon dioxide', 'co2', 'bicarbonate', 'hco3', 'total co2', 'co2 content'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '2028-9',
    standardUnit: 'mEq/L',
    description: 'Buffer system reflecting systemic acid-base balance'
  },
  {
    canonical: 'Serum Calcium',
    aliases: ['calcium', 'ca', 'ca++', 'total calcium', 'serum calcium'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '17861-6',
    standardUnit: 'mg/dL',
    description: 'Mineral essential for bones, cardiac contractility, and clotting'
  },
  {
    canonical: 'Serum Magnesium',
    aliases: ['magnesium', 'mg', 'mg++', 'serum magnesium'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '19123-9',
    standardUnit: 'mg/dL',
    description: 'Cofactor for over 300 enzymatic reactions and cardiac conduction'
  },
  {
    canonical: 'Serum Phosphorus / Phosphate',
    aliases: ['phosphorus', 'phosphate', 'po4', 'serum phosphate'],
    panel: CLINICAL_PANELS.ELECTROLYTES,
    loinc: '2777-1',
    standardUnit: 'mg/dL',
    description: 'Mineral paired with calcium in bone and cellular energetics'
  },

  // Endocrine & Glycemic
  {
    canonical: 'Fasting Blood Glucose',
    aliases: ['fasting glucose', 'fbs', 'fpg', 'fasting blood sugar', 'glucose fasting', 'blood sugar (fasting)', 'glucose, fasting'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '1558-6',
    standardUnit: 'mg/dL',
    description: 'Blood sugar measured after an overnight fast'
  },
  {
    canonical: 'Blood Glucose (Random)',
    aliases: ['glucose', 'blood glucose', 'rbs', 'random blood sugar', 'serum glucose'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '2345-7',
    standardUnit: 'mg/dL',
    description: 'Non-fasting blood sugar measurement'
  },
  {
    canonical: 'Hemoglobin A1c (HbA1c)',
    aliases: ['hba1c', 'a1c', 'glycated hemoglobin', 'glycohemoglobin', 'glycosylated hemoglobin'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '4548-4',
    standardUnit: '%',
    description: '3-month average measure of blood sugar control'
  },
  {
    canonical: 'Thyroid Stimulating Hormone (TSH)',
    aliases: ['tsh', 'thyroid stimulating hormone', 'thyrotropin', 's-tsh', 'serum tsh'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '3016-3',
    standardUnit: 'uIU/mL',
    description: 'Pituitary hormone regulating thyroid hormone output'
  },
  {
    canonical: 'Free Thyroxine (FT4)',
    aliases: ['free t4', 'ft4', 'free thyroxine', 'thyroxine, free'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '2262-6',
    standardUnit: 'ng/dL',
    description: 'Active circulating unbound thyroid hormone'
  },
  {
    canonical: 'Free Triiodothyronine (FT3)',
    aliases: ['free t3', 'ft3', 'free triiodothyronine'],
    panel: CLINICAL_PANELS.ENDOCRINE,
    loinc: '2258-4',
    standardUnit: 'pg/mL',
    description: 'Most biologically potent unbound thyroid hormone'
  },

  // Lipid Profile
  {
    canonical: 'Total Cholesterol',
    aliases: ['total cholesterol', 'cholesterol, total', 'tc', 'chol', 'serum cholesterol'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '2093-3',
    standardUnit: 'mg/dL',
    description: 'Total amount of cholesterol in blood across all lipoproteins'
  },
  {
    canonical: 'HDL Cholesterol',
    aliases: ['hdl', 'hdl-c', 'hdl cholesterol', 'high-density lipoprotein'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '2085-9',
    standardUnit: 'mg/dL',
    description: 'Cardioprotective high-density lipoprotein cholesterol'
  },
  {
    canonical: 'LDL Cholesterol',
    aliases: ['ldl', 'ldl-c', 'ldl cholesterol', 'ldl cholesterol (calc)', 'low-density lipoprotein'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '13457-7',
    standardUnit: 'mg/dL',
    description: 'Atherogenic low-density lipoprotein cholesterol'
  },
  {
    canonical: 'Triglycerides',
    aliases: ['triglycerides', 'tg', 'trigs', 'serum triglycerides'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '2571-8',
    standardUnit: 'mg/dL',
    description: 'Main form of fat stored in the body and transported in blood'
  },
  {
    canonical: 'VLDL Cholesterol',
    aliases: ['vldl', 'vldl-c', 'vldl cholesterol'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '13458-5',
    standardUnit: 'mg/dL',
    description: 'Very low-density lipoprotein cholesterol'
  },
  {
    canonical: 'Non-HDL Cholesterol',
    aliases: ['non-hdl', 'non-hdl cholesterol', 'non-hdl-c'],
    panel: CLINICAL_PANELS.LIPID,
    loinc: '43396-1',
    standardUnit: 'mg/dL',
    description: 'Total cholesterol minus HDL; includes all atherogenic particles'
  },

  // Hepatic / Liver Function
  {
    canonical: 'Alanine Aminotransferase (ALT)',
    aliases: ['alt', 'sgpt', 'alanine aminotransferase', 'alanine transaminase', 's-alt'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '1742-6',
    standardUnit: 'U/L',
    description: 'Liver-specific enzyme released upon hepatocellular stress or injury'
  },
  {
    canonical: 'Aspartate Aminotransferase (AST)',
    aliases: ['ast', 'sgot', 'aspartate aminotransferase', 'aspartate transaminase', 's-ast'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '1920-8',
    standardUnit: 'U/L',
    description: 'Enzyme found in liver, heart, and muscle tissue'
  },
  {
    canonical: 'Alkaline Phosphatase (ALP)',
    aliases: ['alp', 'alk phos', 'alkaline phosphatase'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '6768-6',
    standardUnit: 'U/L',
    description: 'Enzyme elevated in biliary obstruction or bone remodeling'
  },
  {
    canonical: 'Total Bilirubin',
    aliases: ['total bilirubin', 't. bili', 't-bili', 'bilirubin, total', 'bilirubin total'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '1975-2',
    standardUnit: 'mg/dL',
    description: 'Breakdown pigment of hemoglobin cleared through the liver and bile'
  },
  {
    canonical: 'Direct Bilirubin',
    aliases: ['direct bilirubin', 'd. bili', 'd-bili', 'conjugated bilirubin'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '1968-7',
    standardUnit: 'mg/dL',
    description: 'Conjugated bilirubin fraction processed by hepatocytes'
  },
  {
    canonical: 'Total Protein',
    aliases: ['total protein', 'protein, total', 'serum total protein', 'tp'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '2885-2',
    standardUnit: 'g/dL',
    description: 'Sum of albumin and globulin in serum'
  },
  {
    canonical: 'Serum Albumin',
    aliases: ['albumin', 'alb', 'serum albumin', 's. albumin'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '1751-7',
    standardUnit: 'g/dL',
    description: 'Major liver-synthesized protein maintaining oncotic pressure'
  },
  {
    canonical: 'Serum Globulin',
    aliases: ['globulin', 'serum globulin'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '2336-6',
    standardUnit: 'g/dL',
    description: 'Group of proteins including antibodies and transport factors'
  },
  {
    canonical: 'Gamma-Glutamyl Transferase (GGT)',
    aliases: ['ggt', 'ggtp', 'gamma-glutamyl transferase'],
    panel: CLINICAL_PANELS.LIVER,
    loinc: '2324-2',
    standardUnit: 'U/L',
    description: 'Biliary enzyme sensitive to alcohol use and cholestasis'
  },

  // Cardiac & Inflammatory
  {
    canonical: 'C-Reactive Protein (CRP)',
    aliases: ['crp', 'c-reactive protein', 'high sensitivity crp', 'hs-crp', 'hscrp'],
    panel: CLINICAL_PANELS.INFLAMMATORY_CARDIAC,
    loinc: '1988-5',
    standardUnit: 'mg/L',
    description: 'Acute phase reactant synthesized by liver during inflammation'
  },
  {
    canonical: 'Erythrocyte Sedimentation Rate (ESR)',
    aliases: ['esr', 'sed rate', 'erythrocyte sedimentation rate'],
    panel: CLINICAL_PANELS.INFLAMMATORY_CARDIAC,
    loinc: '4537-7',
    standardUnit: 'mm/hr',
    description: 'Non-specific marker of chronic or acute inflammation'
  },
  {
    canonical: 'Troponin I',
    aliases: ['troponin', 'troponin i', 'ctni', 'high sensitivity troponin', 'hs-ctni'],
    panel: CLINICAL_PANELS.INFLAMMATORY_CARDIAC,
    loinc: '10839-9',
    standardUnit: 'ng/mL',
    description: 'Specific biomarker for myocardial injury'
  },

  // Vitamins & Iron
  {
    canonical: 'Serum Ferritin',
    aliases: ['ferritin', 'serum ferritin'],
    panel: CLINICAL_PANELS.VITAMINS_MINERALS,
    loinc: '2276-4',
    standardUnit: 'ng/mL',
    description: 'Intracellular protein that stores iron; reflects total iron stores'
  },
  {
    canonical: 'Serum Iron',
    aliases: ['iron', 'serum iron', 'fe'],
    panel: CLINICAL_PANELS.VITAMINS_MINERALS,
    loinc: '2498-4',
    standardUnit: 'ug/dL',
    description: 'Circulating iron bound to transferrin'
  },
  {
    canonical: 'Total Iron Binding Capacity (TIBC)',
    aliases: ['tibc', 'total iron binding capacity'],
    panel: CLINICAL_PANELS.VITAMINS_MINERALS,
    loinc: '2500-7',
    standardUnit: 'ug/dL',
    description: 'Capacity of transferrin to carry iron'
  },
  {
    canonical: '25-Hydroxy Vitamin D',
    aliases: ['vitamin d', 'vit d', '25-oh vitamin d', '25-hydroxyvitamin d', 'vitamin d total'],
    panel: CLINICAL_PANELS.VITAMINS_MINERALS,
    loinc: '1798-8',
    standardUnit: 'ng/mL',
    description: 'Circulating form of vitamin D indicating adequacy of stores'
  },
  {
    canonical: 'Vitamin B12',
    aliases: ['vitamin b12', 'vit b12', 'b12', 'cobalamin'],
    panel: CLINICAL_PANELS.VITAMINS_MINERALS,
    loinc: '2132-9',
    standardUnit: 'pg/mL',
    description: 'Essential cofactor for hematopoiesis and neurological integrity'
  }
];

// Helper to normalize any test name to canonical standard
export function normalizeTestName(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  const clean = rawName.trim().toLowerCase()
    .replace(/[^\w\s\-\+\/\(\)\%\:]/g, '')
    .replace(/\s+/g, ' ');

  for (const entry of NORMALIZATION_DICTIONARY) {
    if (entry.canonical.toLowerCase() === clean) {
      return entry;
    }
    for (const alias of entry.aliases) {
      if (clean === alias || clean.startsWith(alias + ' ') || clean.endsWith(' ' + alias)) {
        return entry;
      }
    }
  }

  // Substring matching as fallback
  for (const entry of NORMALIZATION_DICTIONARY) {
    for (const alias of entry.aliases) {
      if (alias.length >= 3 && clean.includes(alias)) {
        return entry;
      }
    }
  }

  // Not in dictionary - return title-cased raw name
  const formattedRaw = rawName.trim().replace(/\b\w/g, c => c.toUpperCase());
  return {
    canonical: formattedRaw,
    aliases: [clean],
    panel: CLINICAL_PANELS.GENERAL,
    loinc: 'UNKNOWN',
    standardUnit: '',
    description: 'Clinical parameter'
  };
}
