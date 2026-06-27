// High-Fidelity Clinical & Medication Database
// Based on WHO, FDA, NICE, AHA, GINA, GOLD, KDIGO, and ACOG standards.

import { DrugProfile, ICD10Mapping, DepartmentProfile } from "../types";

export const CLINICAL_DEPARTMENTS: Record<string, { name: string, icon: string, diagnoses: ICD10Mapping[] }> = {
  emergency: {
    name: "Emergency Medicine",
    icon: "Zap",
    diagnoses: [
      {
        diseaseName: "Acute Coronary Syndrome (STEMI)",
        icd10Code: "I21.0",
        icd11Code: "BA41.0",
        description: "ST-elevation myocardial infarction (STEMI) of anterior wall.",
        parentCategory: "Ischemic heart diseases",
        subcategory: "Acute myocardial infarction",
        chapter: "Diseases of the circulatory system (Chapter IX)",
        billableStatus: "Yes",
        clinicalDescription: "Transmural myocardial ischemia resulting from sudden occlusion of a major coronary artery, usually due to plaque rupture.",
        diagnosticCriteria: "ST-elevation >= 1mm in 2 consecutive limb leads or >= 2mm in precordial leads; elevated cardiac troponins.",
        associatedSymptoms: "Substernal pressure radiating to jaw/left arm, diaphoresis, dyspnea, impending doom.",
        complications: "Ventricular fibrillation, cardiogenic shock, papillary muscle rupture, cardiac tamponade.",
        guidelines: "AHA/ACC STEMI Guidelines, ESC Guidelines for Acute Myocardial Infarction",
        firstLineMeds: ["Aspirin 325mg chewable", "Nitroglycerin 0.4mg sublingual", "Heparin IV bolus"],
        secondLineMeds: ["Clopidogrel 600mg loading dose", "Metoprolol 5mg IV (if no heart failure)"],
        thirdLineMeds: ["Tenecteplase (if PCI unavailable within 120 mins)", "Morphine IV (refractory pain)"],
        alternativeMeds: ["Prasugrel", "Ticagrelor"],
        emergencyMeds: ["Epinephrine 1mg IV", "Amiodarone 300mg IV bolus", "Atropine 1mg IV"],
        contraindicatedMeds: ["Sildenafil (within 24 hrs)", "NSAIDs (except Aspirin)"],
        monitoringParameters: "Continuous 12-lead ECG, blood pressure, oxygen saturation, serial troponins.",
        followUpSchedule: "Inpatient coronary care unit (CCU) -> Outpatient cardiology follow-up in 1-2 weeks."
      },
      {
        diseaseName: "Anaphylactic Shock",
        icd10Code: "T78.2",
        icd11Code: "EH20",
        description: "Anaphylactic shock, unspecified",
        parentCategory: "Injury, poisoning and certain other consequences of external causes",
        subcategory: "Adverse effects, not elsewhere classified",
        chapter: "Injury, poisoning and certain other consequences of external causes (Chapter XIX)",
        billableStatus: "Yes",
        clinicalDescription: "Severe, life-threatening, generalized systemic hypersensitivity reaction causing profound vasodilation and airway edema.",
        diagnosticCriteria: "Sudden onset of airway/breathing/circulation compromise associated with skin/mucosal changes after exposure to a known allergen.",
        associatedSymptoms: "Stridor, wheezing, angioedema, hypotension, urticaria, abdominal cramps.",
        complications: "Asphyxia, cardiac arrest, hypoxic encephalopathy.",
        guidelines: "WAO Anaphylaxis Guidelines, EAACI Guidelines on Anaphylaxis",
        firstLineMeds: ["Epinephrine 0.3mg IM (1:1000) anterolateral thigh"],
        secondLineMeds: ["Diphenhydramine 50mg IV", "Methylprednisolone 125mg IV"],
        thirdLineMeds: ["Albuterol nebulized", "Famotidine 20mg IV"],
        alternativeMeds: ["Hydrocortisone IV", "Ranitidine IV"],
        emergencyMeds: ["Epinephrine infusion 0.1-2 mcg/min IV", "Normal Saline 2L bolus"],
        contraindicatedMeds: ["Beta-blockers (relative - blunts epinephrine response)"],
        monitoringParameters: "Airway patency, continuous ECG, pulse oximetry, blood pressure every 5 minutes.",
        followUpSchedule: "Observe for minimum 6-12 hours for biphasic reactions; prescribe EpiPen; immunology referral."
      }
    ]
  },
  cardiology: {
    name: "Cardiology",
    icon: "Activity",
    diagnoses: [
      {
        diseaseName: "Essential Hypertension",
        icd10Code: "I10",
        icd11Code: "BA00",
        description: "Essential (primary) hypertension",
        parentCategory: "Hypertensive diseases",
        subcategory: "Essential hypertension",
        chapter: "Diseases of the circulatory system (Chapter IX)",
        billableStatus: "Yes",
        clinicalDescription: "Chronic elevation of systemic arterial blood pressure without an identifiable secondary cause.",
        diagnosticCriteria: "Systolic BP >= 130 mmHg and/or diastolic BP >= 80 mmHg on at least 2 separate clinic occasions.",
        associatedSymptoms: "Often asymptomatic (silent killer), occipital headache, epistaxis, tinnitus.",
        complications: "Left ventricular hypertrophy, stroke, nephrosclerosis, aortic dissection, coronary artery disease.",
        guidelines: "AHA/ACC Hypertension Guidelines, NICE Hypertension Guidelines",
        firstLineMeds: ["Lisinopril 10mg daily", "Amlodipine 5mg daily", "Hydrochlorothiazide 12.5mg daily"],
        secondLineMeds: ["Losartan 50mg daily", "Spironolactone 25mg daily"],
        thirdLineMeds: ["Carvedilol 6.25mg twice daily", "Hydralazine 25mg three times daily"],
        alternativeMeds: ["Chlorthalidone 25mg", "Eplerenone 50mg"],
        emergencyMeds: ["Labetalol 20mg IV bolus", "Nicardipine infusion 5mg/hr", "Sodium Nitroprusside"],
        contraindicatedMeds: ["NSAIDs", "Pseudoephedrine (elevates BP)"],
        monitoringParameters: "Home BP monitoring, basic metabolic panel (potassium, creatinine), urinalysis.",
        followUpSchedule: "Reassess in 4 weeks after starting/adjusting meds; then every 3-6 months once stable."
      },
      {
        diseaseName: "Chronic Heart Failure (HFrEF)",
        icd10Code: "I50.22",
        icd11Code: "BD11.1",
        description: "Chronic systolic heart failure with reduced ejection fraction.",
        parentCategory: "Heart failure",
        subcategory: "Systolic heart failure",
        chapter: "Diseases of the circulatory system (Chapter IX)",
        billableStatus: "Yes",
        clinicalDescription: "Complex clinical syndrome where ventricular dysfunction reduces blood output, presenting with low left ventricular ejection fraction (LVEF <= 40%).",
        diagnosticCriteria: "Echocardiogram showing LVEF <= 40%, elevated BNP or NT-proBNP, signs of congestion on chest X-ray.",
        associatedSymptoms: "Paroxysmal nocturnal dyspnea, orthopnea, bilateral ankle edema, fatigue, S3 gallop.",
        complications: "Cardiorenal syndrome, refractory ventricular arrhythmias, pulmonary edema, thromboembolism.",
        guidelines: "AHA/ACC/HFSA Heart Failure Guidelines, ESC Guidelines for Heart Failure",
        firstLineMeds: ["Sacubitril/Valsartan 49/51mg twice daily (ARNI)", "Empagliflozin 10mg daily (SGLT2i)", "Carvedilol 12.5mg twice daily"],
        secondLineMeds: ["Spironolactone 25mg daily", "Furosemide 40mg daily (for volume congestion)"],
        thirdLineMeds: ["Digoxin 0.125mg daily", "Hydralazine + Isosorbide Dinitrate (for African American patients)"],
        alternativeMeds: ["Dapagliflozin 10mg daily", "Eplerenone 25mg"],
        emergencyMeds: ["Furosemide 40-80mg IV push", "Nitroglycerin infusion", "Dobutamine IV infusion"],
        contraindicatedMeds: ["Non-dihydropyridine calcium channel blockers (Verapamil, Diltiazem)", "NSAIDs"],
        monitoringParameters: "Daily weights (notify if +3 lbs in a day), eGFR, potassium, serum digoxin levels.",
        followUpSchedule: "Follow up in 7-14 days post-discharge, check renal function/potassium; serial echocardiograms."
      }
    ]
  },
  pulmonology: {
    name: "Pulmonology",
    icon: "Wind",
    diagnoses: [
      {
        diseaseName: "Acute Bronchial Asthma",
        icd10Code: "J45.901",
        icd11Code: "CA23",
        description: "Unspecified asthma with (acute) exacerbation.",
        parentCategory: "Chronic lower respiratory diseases",
        subcategory: "Asthma",
        chapter: "Diseases of the respiratory system (Chapter X)",
        billableStatus: "Yes",
        clinicalDescription: "Chronic inflammatory disorder of the airways resulting in hyperresponsiveness, reversible bronchoconstriction, and airway remodeling.",
        diagnosticCriteria: "Spirometry showing reversible obstructive airway defect (FEV1 increase >12% and 200mL after bronchodilator).",
        associatedSymptoms: "Expiratory wheezing, cough worse at night, chest tightness, prolonged expiratory phase.",
        complications: "Status asthmaticus, pneumothorax, respiratory failure.",
        guidelines: "GINA Global Strategy for Asthma Management, EPR-3 Guidelines",
        firstLineMeds: ["Albuterol HFA inhaler (SABA) as needed", "Budesonide-Formoterol (MART therapy)"],
        secondLineMeds: ["Fluticasone Propionate inhaler (ICS)", "Montelukast 10mg oral daily"],
        thirdLineMeds: ["Tiotropium Respimat (LAMA)", "Prednisone 40mg oral for 5 days (exacerbation)"],
        alternativeMeds: ["Zafirlukast", "Theophylline"],
        emergencyMeds: ["Albuterol + Ipratropium nebulized (Duoneb)", "Magnesium Sulfate 2g IV", "Methylprednisolone IV"],
        contraindicatedMeds: ["Non-selective Beta-blockers (e.g. Propranolol)", "Aspirin (if aspirin-exacerbated respiratory disease)"],
        monitoringParameters: "Peak expiratory flow (PEF) tracking, oxygen saturation, inhaler technique audits.",
        followUpSchedule: "Reassess in 2-4 weeks after therapy changes, then every 1-6 months depending on control."
      }
    ]
  },
  neurology: {
    name: "Neurology",
    icon: "Tv",
    diagnoses: [
      {
        diseaseName: "Acute Ischemic Stroke",
        icd10Code: "I63.9",
        icd11Code: "8B11",
        description: "Cerebral infarction, unspecified",
        parentCategory: "Cerebrovascular diseases",
        subcategory: "Cerebral infarction",
        chapter: "Diseases of the circulatory system (Chapter IX)",
        billableStatus: "Yes",
        clinicalDescription: "Sudden neurological deficit resulting from focal cerebral ischemia secondary to vessel occlusion (thrombus/embolus).",
        diagnosticCriteria: "Acute onset neurological deficit; non-contrast Head CT ruling out hemorrhage.",
        associatedSymptoms: "Facial droop, unilateral arm/leg weakness, dysarthria, aphasia, hemianopia.",
        complications: "Hemorrhagic transformation, cerebral edema, aspiration pneumonia, deep vein thrombosis.",
        guidelines: "AHA/ASA Acute Ischemic Stroke Guidelines, ESO Guidelines",
        firstLineMeds: ["Alteplase (rtPA) 0.9mg/kg IV (if within 4.5 hours and no contraindications)", "Aspirin 325mg (post-24h of tPA)"],
        secondLineMeds: ["Clopidogrel 75mg daily", "Atorvastatin 80mg daily"],
        thirdLineMeds: ["Dual antiplatelet therapy (DAPT: Aspirin + Clopidogrel for 21 days for minor stroke)"],
        alternativeMeds: ["Tenecteplase 0.25mg/kg", "Aspirin + Extended-Release Dipyridamole"],
        emergencyMeds: ["Labetalol IV (keep BP < 185/110 for tPA)", "Nicardipine IV infusion"],
        contraindicatedMeds: ["Anticoagulants (Heparin/Warfarin) in first 24 hours post-thrombolysis"],
        monitoringParameters: "Neurological exam (NIHSS score), blood pressure, hemorrhagic signs.",
        followUpSchedule: "CT head in 24 hours; stroke rehabilitation evaluation; neurology outpatient clinic in 1 month."
      }
    ]
  },
  nephrology: {
    name: "Nephrology",
    icon: "Droplets",
    diagnoses: [
      {
        diseaseName: "Chronic Kidney Disease (Stage G3b)",
        icd10Code: "N18.32",
        icd11Code: "GB61",
        description: "Chronic kidney disease, stage 3b",
        parentCategory: "Diseases of the urinary system",
        subcategory: "Chronic kidney disease",
        chapter: "Diseases of the genitourinary system (Chapter XIV)",
        billableStatus: "Yes",
        clinicalDescription: "Moderate to severe decrease in kidney function with GFR 30-44 mL/min/1.73m² persisting for >= 3 months.",
        diagnosticCriteria: "eGFR 30-44 calculated via CKD-EPI formula, persistent microalbuminuria (UACR >= 30 mg/g).",
        associatedSymptoms: "Pruritus, fatigue, mild ankle edema, nocturia, metallic taste.",
        complications: "Renal osteodystrophy, secondary hyperparathyroidism, normocytic anemia, hyperkalemia.",
        guidelines: "KDIGO Clinical Practice Guideline for CKD",
        firstLineMeds: ["Lisinopril 5mg daily (renal protective if proteinuric)", "Dapagliflozin 10mg daily"],
        secondLineMeds: ["Furosemide 20mg daily (volume management)", "Sodium Bicarbonate 650mg twice daily"],
        thirdLineMeds: ["Patiromer 8.4g daily (for hyperkalemia)", "Epoetin alfa (if hemoglobin < 10 g/dL)"],
        alternativeMeds: ["Finerenone 10mg daily", "Sevelamer Carbonate 800mg with meals"],
        emergencyMeds: ["Calcium Gluconate IV", "Insulin 10U IV + D50W (for severe uremic hyperkalemia)"],
        contraindicatedMeds: ["Metformin (relative - hold if eGFR < 30)", "NSAIDs", "Spiroconazole", "Gadolinium contrasts"],
        monitoringParameters: "Serum creatinine, potassium, bicarbonate, hemoglobin, phosphate, intact PTH.",
        followUpSchedule: "Every 3 to 6 months; nephrologist referral; vascular access planning if rapid progression."
      }
    ]
  }
};

export const MEDICINE_DATABASE: Record<string, DrugProfile> = {
  Amlodipine: {
    genericName: "Amlodipine",
    brandName: "Norvasc (US), Amlovas (IN), Amlopin (PK)",
    manufacturer: "Pfizer, Sandoz, Teva Pharmaceuticals",
    dosage: "5mg - 10mg once daily orally.",
    indications: "Essential hypertension, chronic stable angina, vasospastic (Prinzmetal) angina.",
    contraindications: "Severe hypotension, cardiogenic shock, hypersensitivity.",
    sideEffects: "Peripheral edema, headache, flushing, palpitation, dizziness.",
    drugInteractions: "Simvastatin (increases simvastatin levels; cap at 20mg), CYP3A4 inhibitors (Clarithromycin).",
    fdaStatus: "Approved",
    pregnancyCategory: "C",
    lactationSafety: "Compatible (small amounts excreted in breast milk).",
    drugClass: "Dihydropyridine Calcium Channel Blocker",
    atcCode: "C08CA01",
    rxnormCode: "17767",
    pharmacokinetics: {
      bioavailability: "64 - 90%",
      halfLife: "30 - 50 hours",
      metabolism: "Extensively hepatic via CYP3A4",
      excretion: "Urine (10% unchanged, 60% metabolites)",
      proteinBinding: "97.5%",
      onsetAction: "24 - 48 hours (therapeutic effect)",
      durationAction: "24 hours",
      peakTime: "6 - 12 hours",
      storageConditions: "Store at 20-25°C (68-77°F); protect from light and moisture.",
      shelfLife: "36 months"
    },
    pediatricElderlyRenal: {
      pediatrics: "Children 6-17 years: start 2.5mg once daily.",
      elderly: "Start at lowest dose (2.5mg) due to slower clearance.",
      renalImpairment: "No dose adjustment required. Not dialyzable.",
      liverDisease: "Titrate slowly; half-life is prolonged in hepatic failure."
    },
    overdoseManagement: {
      symptoms: "Severe peripheral vasodilation, profound hypotension, reflex tachycardia.",
      management: "Gastric lavage if early. Intravenous calcium gluconate to reverse channel blockade, vasopressors (Norepinephrine) for refractory hypotension."
    },
    pharmacyCost: {
      alternatives: "Nifedipine, Felodipine",
      costRange: "Low ($4 - $15 per 30-day supply)",
      insuranceCoverage: "98% Preferred Generic Formulary"
    }
  },
  Lisinopril: {
    genericName: "Lisinopril",
    brandName: "Prinivil (US), Zestril (US), Lipril (IN)",
    manufacturer: "Merck, AstraZeneca, Lupin",
    dosage: "10mg - 40mg once daily orally.",
    indications: "Hypertension, Heart Failure (HFrEF) adjunct, post-Myocardial Infarction stabilization.",
    contraindications: "History of angioedema (hereditary or ACEi-induced), pregnancy (2nd/3rd trimesters), concomitant Aliskiren in diabetics.",
    sideEffects: "Dry cough, hyperkalemia, acute kidney injury, dizziness, angioedema.",
    drugInteractions: "Potassium supplements, Spironolactone (increases hyperkalemia risk), NSAIDs (precipitates AKI), Lithium (increases lithium toxicity).",
    fdaStatus: "Approved",
    pregnancyCategory: "D",
    lactationSafety: "Use caution (excreted in breast milk; prefer Enalapril if breastfeeding).",
    drugClass: "ACE (Angiotensin-Converting Enzyme) Inhibitor",
    atcCode: "C09AA03",
    rxnormCode: "29046",
    pharmacokinetics: {
      bioavailability: "25%",
      halfLife: "12 hours",
      metabolism: "Not metabolized (excreted completely unchanged)",
      excretion: "Renal excretion (100% unchanged drug)",
      proteinBinding: "0%",
      onsetAction: "1 hour",
      durationAction: "24 hours",
      peakTime: "6 hours",
      storageConditions: "Store at 15-30°C (59-86°F). Protect from moisture.",
      shelfLife: "36 months"
    },
    pediatricElderlyRenal: {
      pediatrics: "Ages >= 6 years: start 0.07 mg/kg (up to 5mg) once daily.",
      elderly: "Start at lower dose due to age-related decline in GFR.",
      renalImpairment: "GFR 10-30: start 2.5mg. GFR < 10: start 1.25mg. Highly dialyzable.",
      liverDisease: "No dose adjustment required (not a prodrug, doesn't require hepatic activation)."
    },
    overdoseManagement: {
      symptoms: "Severe hypotension, electrolyte disturbances (hyperkalemia), renal failure.",
      management: "Intravenous normal saline boluses. Hemodialysis is highly effective at removing lisinopril from circulation."
    },
    pharmacyCost: {
      alternatives: "Enalapril, Ramipril, Losartan (ARB)",
      costRange: "Low ($4 - $10 per 30-day supply)",
      insuranceCoverage: "100% Covered Generic Tier 1"
    }
  },
  Epinephrine: {
    genericName: "Epinephrine",
    brandName: "Adrenalin (US), EpiPen (US), Auvi-Q (US)",
    manufacturer: "Mylan, Pfizer, Novartis",
    dosage: "Anaphylaxis: 0.3mg IM. Cardiac Arrest: 1mg IV every 3-5 mins.",
    indications: "Anaphylaxis, severe asthma exacerbation, cardiac arrest, ventricular fibrillation, symptomatic bradycardia.",
    contraindications: "No absolute contraindications in life-threatening emergency situations.",
    sideEffects: "Arrhythmias, myocardial ischemia, severe hypertension, anxiety, tremor, pulmonary edema.",
    drugInteractions: "Beta-blockers (severe vasoconstriction due to unopposed alpha-1 stimulation), TCA/MAOIs (hypertensive crisis).",
    fdaStatus: "Approved",
    pregnancyCategory: "C",
    lactationSafety: "Compatible (destroyed in GI tract of infant; doesn't reach circulation).",
    drugClass: "Alpha and Beta Adrenergic Agonist (Sympathomimetic)",
    atcCode: "C01CA24",
    rxnormCode: "3992",
    pharmacokinetics: {
      bioavailability: "100% (IV), Rapid & reliable (IM)",
      halfLife: "2 - 3 minutes",
      metabolism: "Rapidly metabolized by COMT and MAO in the liver and sympathetic terminals.",
      excretion: "Urine (mostly as metanephrine and VMA)",
      proteinBinding: "Extensively bound to plasma proteins",
      onsetAction: "Immediate (IV), 3-5 mins (IM)",
      durationAction: "5 - 10 minutes (IV), 1-2 hours (IM)",
      peakTime: "3 minutes (IM)",
      storageConditions: "Do not refrigerate. Store at 20-25°C. Protect from light. Do not use if solution is pinkish/brown.",
      shelfLife: "18 months"
    },
    pediatricElderlyRenal: {
      pediatrics: "Anaphylaxis: 0.01 mg/kg IM (max 0.3mg per dose). EpiPen Jr (0.15mg) for 15-30kg.",
      elderly: "Use with caution due to high prevalence of underlying coronary artery disease.",
      renalImpairment: "No adjustment needed. Epinephrine clearance is independent of renal function.",
      liverDisease: "No adjustments required for emergency usage."
    },
    overdoseManagement: {
      symptoms: "Severe hypertension leading to intracranial hemorrhage, pulmonary edema, tachyarrhythmias.",
      management: "Short-acting vasodilators (Nitroprusside) or alpha-blockers (Phentolamine). Beta-blockers for tachyarrhythmias (caution if combined with alpha storm)."
    },
    pharmacyCost: {
      alternatives: "None in emergency setting (Norepinephrine as alternative vasopressor infusion)",
      costRange: "Medium ($150 - $300 for EpiPen dual pack)",
      insuranceCoverage: "Standard copay; usually covered as Tier 2 or Tier 3 preventive device."
    }
  }
};

export const MED_QUESTIONS: Record<string, { questions: any[] }> = {
  Amlodipine: {
    questions: [
      {
        id: "am1",
        type: "beginner",
        question: "What is the primary clinical use of Amlodipine?",
        options: ["To lower blood pressure", "To treat bacterial infection", "To alleviate depression", "To increase heart rate"],
        correctAnswer: 0,
        explanation: "Amlodipine is a calcium channel blocker used primarily to treat hypertension (high blood pressure) and angina (chest pain).",
        pearl: "Amlodipine causes relaxation of vascular smooth muscle, reducing systemic vascular resistance.",
        mistake: "Do not mistake Amlodipine for a beta-blocker; it does not directly decrease the heart rate.",
        reference: "Harrison's Principles of Internal Medicine"
      },
      {
        id: "am2",
        type: "clinical",
        question: "A 62-year-old patient on Amlodipine 10mg presents with marked bilateral ankle edema. No other signs of heart failure are present. What is the physiological mechanism of this side effect?",
        options: ["Right-sided heart failure induction", "Pre-capillary vasodilation causing capillary fluid transudation", "Renal tubular sodium retention", "Decreased oncotic pressure"],
        correctAnswer: 1,
        explanation: "Calcium channel blockers cause selective pre-capillary arteriolar vasodilation. This increases hydrostatic pressure inside capillaries, pushing fluid into interstitial spaces.",
        pearl: "Adding an ACE inhibitor or ARB can dilate post-capillary venules and neutralize this hydrostatic gradient.",
        mistake: "Mistaking CCB-induced peripheral edema for heart failure or renal failure, leading to unnecessary diuretic therapy.",
        reference: "AHA Hypertension Journal, 2024"
      }
    ]
  },
  Lisinopril: {
    questions: [
      {
        id: "li1",
        type: "beginner",
        question: "Which of the following is a classic dry cough side effect of Lisinopril?",
        options: ["Histamine release", "Bradykinin accumulation in the respiratory tract", "Bronchial smooth muscle spasm", "Pulmonary congestion"],
        correctAnswer: 1,
        explanation: "ACE inhibitors prevent the breakdown of bradykinin, leading to its accumulation in the lungs, which sensitizes sensory fibers and triggers a dry cough.",
        pearl: "Cough occurs in 5-20% of patients and is NOT dose-dependent. Switching to an ARB solves the issue.",
        mistake: "Treating Lisinopril cough with cough suppressants, which are ineffective; the drug must be discontinued.",
        reference: "NICE Hypertension Guidelines"
      }
    ]
  }
};
