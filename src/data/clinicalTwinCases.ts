import { UserRole } from "../types";

export interface TwinAction {
  id: string;
  text: string;
  category: "management" | "stabilization" | "monitoring" | "discharge" | "dangerous";
  feedback: string;
  correctness: "Correct" | "Partially Correct" | "Incorrect" | "Dangerous";
  scoreImpact: number;
  nextVitals?: {
    bp: string;
    hr: number;
    rr: number;
    temp: string;
    spo2: number;
  };
  reasoning: string;
  pathophysiology: string;
  pearl: string;
  complicationTrigger?: boolean;
}

export interface TwinInvestigation {
  id: string;
  name: string;
  result: string;
}

export interface ClinicalTwinPreset {
  id: string;
  title: string;
  examBoard: "USMLE" | "FCPS" | "PLAB";
  difficulty: "Easy" | "Medium" | "Hard";
  department: "Internal Medicine" | "Emergency Medicine" | "Cardiology" | "Pulmonology" | "Endocrinology" | "Nephrology" | "Gastroenterology" | "Neurology" | "Infectious Disease";
  disease: string;
  patientName: string;
  age: number;
  gender: string;
  occupation: string;
  medicalHistory: string;
  familyHistory: string;
  riskFactors: string;
  chiefComplaint: string;
  physicalExam: string;
  initialVitals: {
    bp: string;
    hr: number;
    rr: number;
    temp: string;
    spo2: number;
  };
  investigations: TwinInvestigation[];
  actions: TwinAction[];
  complications?: {
    description: string;
    vitals: {
      bp: string;
      hr: number;
      rr: number;
      temp: string;
      spo2: number;
    };
    actions: TwinAction[];
  };
}

export const CLINICAL_TWIN_PRESETS: ClinicalTwinPreset[] = [
  {
    id: "stemi",
    title: "Acute Retrosternal Pressure",
    examBoard: "USMLE",
    difficulty: "Hard",
    department: "Cardiology",
    disease: "Acute STEMI (Anterior Wall)",
    patientName: "William Chen",
    age: 62,
    gender: "Male",
    occupation: "Construction Manager",
    medicalHistory: "Hypertension (poorly controlled), Type 2 Diabetes Mellitus, Hyperlipidemia.",
    familyHistory: "Father died of premature sudden cardiac death at age 49.",
    riskFactors: "Active smoking history (40 pack-years), sedentary lifestyle, obesity.",
    chiefComplaint: "Crushing retrosternal chest pressure for 50 minutes, radiating to the left arm and jaw.",
    physicalExam: "Appears anxious, diaphoretic, and pale. Levine's sign is positive. Heart sounds show an S4 gallop, lungs with trace bibasilar rales.",
    initialVitals: { bp: "158/94", hr: 98, rr: 22, temp: "36.8 °C", spo2: 93 },
    investigations: [
      { id: "ecg", name: "12-Lead ECG", result: "3.5 mm ST-segment elevation in leads V1 to V4 with reciprocal ST-segment depression in II, III, and aVF." },
      { id: "cbc", name: "Complete Blood Count", result: "WBC: 11.2k/µL, Hb: 14.5 g/dL, Plt: 220k/µL." },
      { id: "trop", name: "Cardiac Troponin I", result: "Initially elevated at 1.4 ng/mL (Reference < 0.04)." },
      { id: "cxr", name: "Chest X-ray", result: "Mild pulmonary venous congestion, normal mediastinal width, no pneumothorax." }
    ],
    actions: [
      {
        id: "dapt_pci",
        text: "Administer chewable Aspirin 325mg, Clopidogrel 600mg loading dose, and activate the Cath Lab for emergent PCI.",
        category: "management",
        feedback: "Gold standard intervention initiated immediately! The catheterization lab was activated within 10 minutes of arrival.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "135/82", hr: 84, rr: 18, temp: "36.8 °C", spo2: 96 },
        reasoning: "Prompt dual antiplatelet therapy reduces thrombus propagation, and urgent percutaneous coronary intervention restores coronary blood flow, dramatically reducing mortality in anterior wall STEMI.",
        pathophysiology: "Rupture of an unstable atherosclerotic plaque triggers platelet aggregation, leading to acute thrombotic occlusion of the Left Anterior Descending (LAD) coronary artery.",
        pearl: "Door-to-balloon time should always be less than 90 minutes. Remember: 'Time is Muscle'!"
      },
      {
        // Triggers complication
        id: "beta_block",
        text: "Administer immediate IV Metoprolol 5mg to reduce heart rate and blood pressure.",
        category: "stabilization",
        feedback: "Premature administration of IV beta-blockers when trace rales are present triggers acute cardiogenic shock!",
        correctness: "Dangerous",
        scoreImpact: -25,
        nextVitals: { bp: "82/48", hr: 55, rr: 26, temp: "36.5 °C", spo2: 89 },
        reasoning: "Beta-blockers reduce cardiac output and are strictly contraindicated in the acute phase of MI if there are signs of decompensated heart failure, bradycardia, or hypotension.",
        pathophysiology: "Negative inotropic and chronotropic effects exacerbate ventricular dysfunction, causing cardiac index to drop below critical organ perfusion thresholds.",
        pearl: "Never administer beta-blockers in patients exhibiting signs of acute heart failure (e.g., bibasilar rales, cold extremities).",
        complicationTrigger: true
      },
      {
        id: "thrombolysis",
        text: "Administer IV Tenecteplase (thrombolysis) immediately in the Emergency Department.",
        category: "management",
        feedback: "Thrombolysis is a secondary choice since this facility has active PCI capability within 90 minutes.",
        correctness: "Partially Correct",
        scoreImpact: 15,
        nextVitals: { bp: "128/78", hr: 90, rr: 19, temp: "36.8 °C", spo2: 95 },
        reasoning: "Fibrinolytics are indicated only when primary PCI cannot be performed within 120 minutes of first medical contact.",
        pathophysiology: "Plasminogen activators convert plasminogen to active plasmin to dissolve fibrin clot, but pose a significant risk of systemic and intracranial hemorrhage.",
        pearl: "If transfer-to-PCI delay exceeds 120 minutes, administer fibrinolytics within 30 minutes of arrival."
      },
      {
        id: "nitroglycerin",
        text: "Administer sublingual Nitroglycerin 0.4mg x 3 and monitor chest pain resolution.",
        category: "stabilization",
        feedback: "Successfully relieved severe anginal symptoms, though non-definitive.",
        correctness: "Partially Correct",
        scoreImpact: 10,
        nextVitals: { bp: "138/86", hr: 94, rr: 20, temp: "36.8 °C", spo2: 95 },
        reasoning: "Nitrates cause venous vasodilation, reducing preload and myocardial oxygen demand, but do not provide definitive reperfusion.",
        pathophysiology: "Nitroglycerin releases nitric oxide, activating guanylyl cyclase to increase cGMP, resulting in smooth muscle relaxation.",
        pearl: "Always rule out right ventricular infarction (ST elevation in V4R) before giving nitrates to avoid severe refractory hypotension."
      }
    ],
    complications: {
      description: "CARDIOGENIC SHOCK: The patient develops cold extremities, altered mental status, and a profound blood pressure drop to 82/48 mmHg.",
      vitals: { bp: "82/48", hr: 55, rr: 26, temp: "36.5 °C", spo2: 89 },
      actions: [
        {
          id: "dobutamine",
          text: "Initiate IV Dobutamine infusion and prepare for emergent intra-aortic balloon pump (IABP) insertion.",
          category: "management",
          feedback: "Inotropic support and mechanical circulatory support successfully stabilize cardiogenic shock!",
          correctness: "Correct",
          scoreImpact: 30,
          nextVitals: { bp: "105/68", hr: 82, rr: 18, temp: "36.7 °C", spo2: 94 },
          reasoning: "Dobutamine provides beta-1 adrenergic stimulation to enhance myocardial contractility and stroke volume, raising cardiac output.",
          pathophysiology: "Increases intracellular cyclic AMP in cardiac myocytes, enhancing calcium influx during systole.",
          pearl: "Cardiogenic shock is defined as SBP < 90 mmHg, cardiac index < 2.2, and elevated pulmonary capillary wedge pressure (PCWP > 15)."
        },
        {
          id: "more_beta",
          text: "Give another dose of IV Metoprolol to control tachy-arrhythmia.",
          category: "dangerous",
          feedback: "The patient goes into complete asystolic arrest due to absolute severe bradycardic shock!",
          correctness: "Dangerous",
          scoreImpact: -40,
          nextVitals: { bp: "0/0", hr: 0, rr: 0, temp: "36.0 °C", spo2: 0 },
          reasoning: "Further beta-blockade is highly lethal in active cardiogenic shock.",
          pathophysiology: "Complete suppression of sinus node and ventricular contraction.",
          pearl: "Do not give negative inotropes in acute circulatory failure."
        }
      ]
    }
  },
  {
    id: "copd",
    title: "Acute Breathlessness and Wheezing",
    examBoard: "FCPS",
    difficulty: "Medium",
    department: "Pulmonology",
    disease: "Severe COPD Exacerbation",
    patientName: "Robert Miller",
    age: 71,
    gender: "Male",
    occupation: "Retired Shipyard Worker",
    medicalHistory: "COPD (GOLD Stage III), chronic productive cough, coronary artery disease.",
    familyHistory: "Mother had severe emphysema, suspected alpha-1 antitrypsin deficiency.",
    riskFactors: "Heavy smoking history (55 pack-years), occupational asbestos exposure.",
    chiefComplaint: "Worsening shortness of breath, severe wheezing, and increased sputum purulence for 3 days.",
    physicalExam: "Alert but in moderate respiratory distress, using accessory neck muscles. Chest has a barrel shape, with diffuse expiratory wheezes and prolonged expiratory phase. Puffed lips breathing.",
    initialVitals: { bp: "142/88", hr: 104, rr: 26, temp: "37.5 °C", spo2: 86 },
    investigations: [
      { id: "abg", name: "Arterial Blood Gas (ABG)", result: "pH: 7.28, pCO2: 64 mmHg, pO2: 52 mmHg, HCO3-: 29 mEq/L (Respiratory Acidosis)." },
      { id: "cxr", name: "Chest X-ray", result: "Hyperinflated lung fields, flattened diaphragms, no acute consolidation or pneumothorax." },
      { id: "cbc", name: "Complete Blood Count", result: "WBC: 12.8k/µL, Hb: 16.2 g/dL (compensatory polycythemia), Plt: 198k/µL." }
    ],
    actions: [
      {
        id: "bipap",
        text: "Initiate non-invasive positive pressure ventilation (NIPPV/BiPAP), inhaled Albuterol/Ipratropium nebulizations, and oral Prednisone 40mg.",
        category: "management",
        feedback: "Perfect therapeutic bundle! NIPPV is the first-line intervention for respiratory acidosis in COPD.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "130/82", hr: 88, rr: 18, temp: "37.3 °C", spo2: 91 },
        reasoning: "NIPPV reduces the work of breathing, decreases carbon dioxide retention, and improves oxygenation without the risks of endotracheal intubation.",
        pathophysiology: "Severe broncho-constriction and mucus plugging lead to alveolar hypoventilation, severe ventilation-perfusion mismatch, and acute hypercapnic respiratory failure.",
        pearl: "Target oxygen saturation in acute COPD exacerbations is strictly 88% to 92% to avoid suppressing the hypoxic respiratory drive."
      },
      {
        id: "high_flow_o2",
        text: "Apply high-flow 100% Oxygen via Non-Rebreather Mask to correct severe hypoxia.",
        category: "dangerous",
        feedback: "Severe oxygen-induced hypercapnia! The patient becomes somnolent and carbon dioxide levels spike.",
        correctness: "Dangerous",
        scoreImpact: -20,
        nextVitals: { bp: "148/90", hr: 110, rr: 12, temp: "37.5 °C", spo2: 99 },
        reasoning: "Over-oxygenating COPD patients suppresses their hypoxic ventilatory drive, worsens V/Q mismatch by reversing hypoxic pulmonary vasoconstriction, and increases dead space (Haldane effect).",
        pathophysiology: "High pO2 decreases hypercapnic ventilatory response, causing progressive hypoventilation and fatal respiratory acidosis.",
        pearl: "Never run oxygen wide open in an acute COPD exacerbation. Keep oxygen target restricted to 88-92%."
      },
      {
        id: "antibiotics",
        text: "Administer IV Azithromycin 500mg daily and monitor sputum production.",
        category: "management",
        feedback: "Appropriate adjunctive action as the patient meets all three Anthonisen criteria (dyspnea, sputum volume, sputum purulence).",
        correctness: "Partially Correct",
        scoreImpact: 15,
        nextVitals: { bp: "138/85", hr: 102, rr: 24, temp: "37.1 °C", spo2: 87 },
        reasoning: "Antibiotics reduce duration of exacerbations and risk of treatment failure when sputum is highly purulent.",
        pathophysiology: "Targets typical and atypical pathogens (Haemophilus influenzae, Moraxella catarrhalis, Streptococcus pneumoniae) causing bacterial bronchial infection.",
        pearl: "Macrolides like azithromycin also have anti-inflammatory properties that benefit chronic airway inflammation."
      }
    ]
  },
  {
    id: "dka",
    title: "Altered Mentation and Abdominal Pain",
    examBoard: "PLAB",
    difficulty: "Hard",
    department: "Endocrinology",
    disease: "Diabetic Ketoacidosis (DKA)",
    patientName: "Marcus Brody",
    age: 24,
    gender: "Male",
    occupation: "Software Engineer",
    medicalHistory: "Type 1 Diabetes Mellitus (diagnosed age 12), poor compliance.",
    familyHistory: "Maternal aunt has Hashimoto's thyroiditis (autoimmune clustering).",
    riskFactors: "Recent viral gastroenteritis, missing insulin doses for 48 hours.",
    chiefComplaint: "Severe abdominal pain, constant vomiting, heavy rapid breathing, and progressive confusion.",
    physicalExam: "Lethargic, responds slowly to commands. Mucous membranes are extremely dry, skin turgor is poor, breath has a distinct fruity odor. Tachypnea with deep, sighing respirations (Kussmaul breathing).",
    initialVitals: { bp: "94/56", hr: 118, rr: 28, temp: "37.2 °C", spo2: 98 },
    investigations: [
      { id: "bmp", name: "Basic Metabolic Panel (BMP)", result: "Glucose: 520 mg/dL, Creatinine: 1.8 mg/dL, Na+: 132 mEq/L, K+: 5.6 mEq/L, HCO3-: 8 mEq/L, Anion Gap: 26." },
      { id: "abg", name: "Arterial Blood Gas (ABG)", result: "pH: 7.12, pCO2: 20 mmHg, HCO3-: 8 mEq/L (Severe Metabolic Acidosis with respiratory compensation)." },
      { id: "ketones", name: "Serum Ketones", result: "Beta-hydroxybutyrate critically elevated at 6.8 mmol/L." }
    ],
    actions: [
      {
        id: "saline_insulin",
        text: "Initiate aggressive IV fluid resuscitation (1-1.5L of 0.9% Normal Saline in the first hour), followed by a continuous infusion of Regular Insulin at 0.1 units/kg/hr.",
        category: "management",
        feedback: "Gold standard protocol initiated! Aggressive hydration is the crucial first step to restore vascular volume and glomerular filtration.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "115/72", hr: 94, rr: 22, temp: "37.0 °C", spo2: 98 },
        reasoning: "Hydration lowers counter-regulatory hormones and blood glucose. Continuous low-dose insulin shuts down hepatic ketogenesis and promotes peripheral glucose utilization.",
        pathophysiology: "Absolute insulin deficiency causes unchecked lipolysis, releasing free fatty acids which undergo beta-oxidation in the liver to form acetoacetate and beta-hydroxybutyrate.",
        pearl: "Do not administer insulin if the serum potassium is < 3.3 mEq/L, as insulin will shift potassium intracellularly and cause fatal arrhythmias."
      },
      {
        id: "bolus_only",
        text: "Administer a massive IV bolus of 50 units of Rapid-Acting Insulin (Lispro) and monitor fingersticks.",
        category: "dangerous",
        feedback: "Severe hypokalemic crash and cerebral edema risk! Fast glucose drops are highly hazardous.",
        correctness: "Dangerous",
        scoreImpact: -25,
        nextVitals: { bp: "88/50", hr: 130, rr: 24, temp: "37.2 °C", spo2: 98 },
        reasoning: "Subcutaneous or large rapid IV boluses cause rapid fluid and electrolyte shifts, increasing the risk of acute hypokalemia and cerebral edema, especially in young patients.",
        pathophysiology: "Rapid insulin action causes potassium to rush into cells via the Na+/K+ ATPase pump, causing serum levels to plummet.",
        pearl: "Always use Regular Insulin infusions, not rapid-acting subcutaneous insulin, for managing moderate-to-severe DKA."
      },
      {
        id: "bicarb",
        text: "Administer 2 ampules of IV Sodium Bicarbonate immediately to correct the pH of 7.12.",
        category: "stabilization",
        feedback: "Bicarbonate administration is not indicated for pH > 6.9 and may cause paradoxical CNS acidosis.",
        correctness: "Incorrect",
        scoreImpact: -10,
        nextVitals: { bp: "96/58", hr: 114, rr: 26, temp: "37.1 °C", spo2: 98 },
        reasoning: "Bicarbonate therapy does not improve outcomes in DKA patients with pH > 6.9 and is associated with increased risk of cerebral edema and delayed correction of ketosis.",
        pathophysiology: "Bicarbonate shifts the oxyhemoglobin dissociation curve to the left, worsening tissue hypoxia, and can lead to paradoxical intracellular acidosis.",
        pearl: "ADA guidelines reserve sodium bicarbonate only for severe acidemia with a pH < 6.9."
      }
    ]
  },
  {
    id: "aki",
    title: "Oliguria and Severe Myalgia",
    examBoard: "USMLE",
    difficulty: "Medium",
    department: "Nephrology",
    disease: "Acute Kidney Injury (Rhabdomyolysis-induced)",
    patientName: "David Stone",
    age: 35,
    gender: "Male",
    occupation: "CrossFit Athlete",
    medicalHistory: "Asthma, exercise-induced bronchospasm.",
    familyHistory: "Unremarkable.",
    riskFactors: "Extremely strenuous eccentric muscle training, dehydration in hot weather.",
    chiefComplaint: "Severe pain and swelling in both thighs, passing very dark 'tea-colored' urine, and complete lack of urination for 18 hours.",
    physicalExam: "Appears exhausted, diaphoretic. Thigh muscles are severely swollen, firm, and intensely tender to light palpation. Skin turgor is decreased.",
    initialVitals: { bp: "108/62", hr: 112, rr: 20, temp: "37.8 °C", spo2: 96 },
    investigations: [
      { id: "chemistry", name: "Serum Creatinine & CK", result: "Creatinine: 3.4 mg/dL (Baseline 0.8), Creatine Kinase (CK): 85,000 U/L (Reference < 200)." },
      { id: "urine", name: "Urinalysis", result: "3+ blood on dipstick, but microscopic exam reveals 0-1 RBCs per high power field (suggestive of myoglobinuria)." },
      { id: "electrolytes", name: "Electrolyte Panel", result: "Potassium: 6.2 mEq/L, Calcium: 7.8 mg/dL (hypocalcemia), Phosphorus: 5.8 mg/dL." }
    ],
    actions: [
      {
        id: "aki_hydration",
        text: "Initiate high-volume IV fluid resuscitation with Normal Saline or Sodium Bicarbonate-infused fluid (200-300 mL/hr) to target a urine output of 200-300 mL/hr, and treat hyperkalemia with Calcium Gluconate.",
        category: "management",
        feedback: "Outstanding clinical management! Vigorous hydration prevents myoglobin precipitation in renal tubules.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "118/74", hr: 88, rr: 16, temp: "37.4 °C", spo2: 97 },
        reasoning: "Aggressive isotonic volume expansion maintains high renal tubular flow, dilutes cast-forming myoglobin, and treats severe hyperkalemia.",
        pathophysiology: "Myoglobin released from damaged myocytes precipitates in proximal tubules, causing direct tubular cytotoxicity, cast obstruction, and intrarenal vasoconstriction (ATN).",
        pearl: "In rhabdomyolysis, a urinalysis positive for 'blood' but negative for RBCs under microscopy is a classic sign of free myoglobin."
      },
      {
        id: "diuretics_only",
        text: "Give high-dose IV Furosemide (Lasix) 80mg to force the kidneys to produce urine.",
        category: "dangerous",
        feedback: "Severe volume depletion! Giving loop diuretics to an under-hydrated patient with active myoglobin cast obstruction accelerates acute tubular necrosis.",
        correctness: "Dangerous",
        scoreImpact: -20,
        nextVitals: { bp: "88/50", hr: 124, rr: 22, temp: "37.8 °C", spo2: 96 },
        reasoning: "Diuretics are contraindicated unless volume overload is present, as they worsen renal hypoperfusion and acidic urine promotes myoglobin cast precipitation.",
        pathophysiology: "Loop diuretics inhibit the Na-K-2Cl cotransporter, increasing urinary excretion of electrolytes and fluid, exacerbating intravascular hypovolemia.",
        pearl: "Hydrate first! Never give diuretics to an oliguric patient before correcting intravascular volume deficits."
      }
    ]
  },
  {
    id: "sepsis",
    title: "Altered Mental Status and Hypotension",
    examBoard: "USMLE",
    difficulty: "Hard",
    department: "Infectious Disease",
    disease: "Septic Shock (Sepsis)",
    patientName: "Evelyn Thorne",
    age: 78,
    gender: "Female",
    occupation: "Retired Schoolteacher",
    medicalHistory: "Dementia, Type 2 Diabetes, recurrent Urinary Tract Infections.",
    familyHistory: "Unremarkable.",
    riskFactors: "Indwelling urinary catheter (Foley) in place, advanced age.",
    chiefComplaint: "Acute onset of high fever, shivering, severe confusion, lethargy, and cold clammy skin.",
    physicalExam: "Obtunded, only groans to noxious stimuli. Skin is mottled, cool, and clammy. Abdomen is soft, but suprapubic fullness is noted. Foley catheter shows dark, highly turbid urine.",
    initialVitals: { bp: "74/42", hr: 122, rr: 28, temp: "39.1 °C", spo2: 88 },
    investigations: [
      { id: "cbc_sepsis", name: "Complete Blood Count", result: "WBC: 24.5k/µL with 20% bands (left shift), Platelets: 95k/µL." },
      { id: "lactate", name: "Serum Lactate", result: "Critically elevated at 4.6 mmol/L (indicates profound tissue hypoperfusion)." },
      { id: "blood_cx", name: "Blood and Urine Cultures", result: "Pending (ordered immediately)." }
    ],
    actions: [
      {
        id: "sepsis_bundle",
        text: "Administer a rapid 30 mL/kg IV crystalloid fluid bolus, obtain blood cultures, and administer IV Piperacillin/Tazobactam within the first hour.",
        category: "management",
        feedback: "Perfect compliance with the Surviving Sepsis Campaign bundle! Broad spectrum coverage initiated promptly.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "98/58", hr: 98, rr: 20, temp: "38.2 °C", spo2: 94 },
        reasoning: "Early fluid resuscitation restores stroke volume, and empirical broad-spectrum antibiotic administration reduces mortality from septicemia.",
        pathophysiology: "Endotoxin release triggers massive cytokine cascade (IL-1, TNF-alpha), causing profound systemic vasodilation, endothelial damage, capillary leak, and microvascular hypoperfusion.",
        pearl: "Antibiotics must be administered within 1 hour of recognizing septic shock. Every hour of delay increases mortality by 7-10%!"
      },
      {
        id: "pressors_first",
        text: "Initiate high-dose Norepinephrine infusion immediately via peripheral line without giving any fluid.",
        category: "dangerous",
        feedback: "Profound organ ischemia! Constricting a completely empty vascular bed severely worsens tissue hypoxia.",
        correctness: "Dangerous",
        scoreImpact: -20,
        nextVitals: { bp: "80/46", hr: 135, rr: 26, temp: "39.1 °C", spo2: 88 },
        reasoning: "Vasopressors are contraindicated as the initial management of septic shock unless the patient remains hypotensive after adequate fluid resuscitation (30 mL/kg).",
        pathophysiology: "Alpha-1 adrenergic stimulation causes vasoconstriction, which in a severely hypovolemic state deprives vital organs of oxygenated blood.",
        pearl: "Always fill the tank first! Norepinephrine is secondary to adequate volume resuscitation."
      }
    ]
  },
  {
    id: "stroke",
    title: "Acute Hemiparesis and Aphasia",
    examBoard: "USMLE",
    difficulty: "Hard",
    department: "Neurology",
    disease: "Acute Ischemic Stroke",
    patientName: "George Kowalski",
    age: 69,
    gender: "Male",
    occupation: "Retired Machinist",
    medicalHistory: "Atrial Fibrillation (non-anticoagulated due to compliance), Coronary Artery Disease.",
    familyHistory: "Brother had a stroke at 65.",
    riskFactors: "Uncontrolled hypertension, persistent atrial fibrillation, chronic smoking.",
    chiefComplaint: "Sudden onset of right-sided weakness, facial droop, and complete inability to speak (aphasia) starting 45 minutes ago.",
    physicalExam: "Right-sided facial droop, complete motor weakness (0/5) in right upper and lower extremities. Severe expressive and receptive aphasia.",
    initialVitals: { bp: "185/105", hr: 110, rr: 18, temp: "36.7 °C", spo2: 96 },
    investigations: [
      { id: "ct_head", name: "Non-contrast Head CT", result: "No evidence of intracranial hemorrhage or acute infarction. Subtle loss of insular ribbon on the left." },
      { id: "ekg_stroke", name: "ECG", result: "Atrial fibrillation with rapid ventricular response at 110 bpm, no acute ST changes." },
      { id: "glucose", name: "Point-of-Care Glucose", result: "108 mg/dL (rules out hypoglycemia mimic)." }
    ],
    actions: [
      {
        id: "tpa_admin",
        text: "Administer IV Alteplase (tPA) 0.9 mg/kg (10% bolus, remainder over 60 mins) since the onset is within the 3-4.5 hour window and CT has ruled out hemorrhage.",
        category: "management",
        feedback: "Exceptional speed! Thrombolytic therapy administered successfully within 1.5 hours of symptom onset.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "155/90", hr: 88, rr: 16, temp: "36.6 °C", spo2: 97 },
        reasoning: "Thrombolysis with tissue plasminogen activator (tPA) dissolves the occluding clot, restoring cerebral blood flow and salvageable ischemic penumbra.",
        pathophysiology: "Embolus originating from the left atrium (secondary to AFib) occludes the left Middle Cerebral Artery (MCA), causing focal tissue ischemia.",
        pearl: "Always check blood glucose first to rule out hypoglycemia, which can perfectly mimic focal stroke deficits."
      },
      {
        id: "lower_bp_rapidly",
        text: "Administer aggressive IV Hydralazine to lower blood pressure rapidly to 110/70 mmHg.",
        category: "dangerous",
        feedback: "The patient's hemiparesis worsens significantly due to catastrophic cerebral hypoperfusion!",
        correctness: "Dangerous",
        scoreImpact: -25,
        nextVitals: { bp: "110/70", hr: 95, rr: 18, temp: "36.7 °C", spo2: 96 },
        reasoning: "Rapid blood pressure reduction impairs collateral blood flow through the cerebral penumbra, expanding the infarct size.",
        pathophysiology: "Loss of cerebral autoregulation makes brain perfusion directly dependent on mean arterial pressure (MAP).",
        pearl: "Keep blood pressure below 185/110 mmHg if giving tPA, but do not lower it by more than 15% in the first 24 hours."
      }
    ]
  },
  {
    id: "varices",
    title: "Severe Hematemesis and Shock",
    examBoard: "PLAB",
    difficulty: "Hard",
    department: "Gastroenterology",
    disease: "Acute Esophageal Variceal Hemorrhage",
    patientName: "Arthur Pendelton",
    age: 54,
    gender: "Male",
    occupation: "Retired Musician",
    medicalHistory: "Chronic Hepatitis C infection, liver cirrhosis (Child-Pugh Class B), portal hypertension.",
    familyHistory: "Father died of liver failure secondary to alcohol-related cirrhosis.",
    riskFactors: "Prior heavy alcohol consumption, chronic thrombocytopenia, esophageal varices.",
    chiefComplaint: "Sudden onset of massive, dark-red blood vomiting (hematemesis) of approximately 800 mL, associated with cold sweats and lightheadedness.",
    physicalExam: "Extremely pale, lethargic, cold clammy extremities. Abdomen is moderately distended with visible caput medusae, shifting dullness (ascites), and a palpable spleen tip. Scleral icterus present.",
    initialVitals: { bp: "86/44", hr: 124, rr: 24, temp: "36.4 °C", spo2: 92 },
    investigations: [
      { id: "cbc_gastro", name: "Complete Blood Count", result: "WBC: 4.8k/µL, Hb: 6.8 g/dL (critically low), Platelets: 55k/µL." },
      { id: "coags", name: "Coagulation Profile & LFT", result: "Total Bilirubin: 3.2 mg/dL, Albumin: 2.4 g/dL, INR: 2.1 (severe coagulopathy), Ammonia: 58 µmol/L." },
      { id: "endoscopy", name: "Urgent Upper Endoscopy (PACS)", result: "Active pulsatile bleeding noted from three large columns of esophageal varices in the lower third of the esophagus." }
    ],
    actions: [
      {
        id: "varices_correct",
        text: "Initiate restrictive blood transfusion (target Hb 7-8 g/dL), start IV Octreotide (50mcg bolus, then 50mcg/hr), prophylactic IV Ceftriaxone 1g, and arrange immediate Endoscopic Variceal Ligation (EVL).",
        category: "management",
        feedback: "Gold-standard intervention initiated! Resuscitation with octreotide and antibiotic prophylaxis decreases rebleeding and mortality significantly.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "102/58", hr: 94, rr: 18, temp: "36.7 °C", spo2: 96 },
        reasoning: "Octreotide causes splanchnic vasoconstriction, reducing portal pressures. Antibiotics prevent spontaneous bacterial peritonitis. Restrictive transfusion avoids raising portal pressures further.",
        pathophysiology: "Cirrhosis leads to severe parenchymal fibrosis and increased hepatic vascular resistance, driving blood back into systemic collateral channels (esophageal veins).",
        pearl: "A restrictive transfusion strategy (transfusing only when Hb < 7 g/dL) is associated with better survival in acute upper GI bleeds than liberal strategies."
      },
      {
        id: "varices_fluid_overload",
        text: "Infuse 4 liters of Normal Saline rapidly and administer IV Metoprolol to lower his heart rate of 124 bpm.",
        category: "dangerous",
        feedback: "Catastrophic rebleeding! Massive fluid overload increases portal pressure, dislodging early clots, while beta-blockers trigger cardiogenic collapse.",
        correctness: "Dangerous",
        scoreImpact: -25,
        nextVitals: { bp: "72/38", hr: 50, rr: 28, temp: "36.2 °C", spo2: 88 },
        reasoning: "Rapid saline boluses raise hydrostatic portal pressures, causing immediate variceal rupture. Beta-blockers are contraindicated in acute hemorrhagic shock.",
        pathophysiology: "Abrupt volume expansion raises venous congestion. Heart rate reduction blunts the compensatory mechanisms of acute blood loss.",
        pearl: "Never administer beta-blockers during an active variceal bleed. They are strictly reserved for primary or secondary prophylaxis after stabilization."
      }
    ],
    complications: {
      description: "ENCEPHALOPATHY & COMPLICATED COAGULOPATHY: The patient becomes highly confused, agitated, and develops a coarse flapping tremor (asterixis) with further oozing.",
      vitals: { bp: "84/40", hr: 118, rr: 22, temp: "36.5 °C", spo2: 93 },
      actions: [
        {
          id: "lactulose_rifaximin",
          text: "Administer Lactulose 30mL orally/via NG tube and transfuse Fresh Frozen Plasma (FFP) to address the INR of 2.1.",
          category: "management",
          feedback: "Outstanding stabilization! Lactulose successfully traps ammonia, and FFP addresses severe coagulopathic bleeding.",
          correctness: "Correct",
          scoreImpact: 30,
          nextVitals: { bp: "98/55", hr: 90, rr: 17, temp: "36.8 °C", spo2: 95 },
          reasoning: "Lactulose is metabolized by colonic bacteria into lactic acid, converting diffusible NH3 to non-diffusible NH4+, promoting its excretion.",
          pathophysiology: "Blood breakdown products in the GI tract act as a massive nitrogen load, overloading hepatic urea cycle capacity and elevating blood ammonia levels.",
          pearl: "Asterixis is a classic clinical indicator of metabolic or hepatic encephalopathy."
        }
      ]
    }
  },
  {
    id: "tension_pneumothorax",
    title: "Acute MVA Chest Trauma",
    examBoard: "USMLE",
    difficulty: "Hard",
    department: "Emergency Medicine",
    disease: "Tension Pneumothorax",
    patientName: "Zachary Vance",
    age: 28,
    gender: "Male",
    occupation: "Courier Rider",
    medicalHistory: "No prior medical conditions.",
    familyHistory: "Unremarkable.",
    riskFactors: "High-impact deceleration blunt chest trauma (motorcycle accident).",
    chiefComplaint: "Severe, sharp, right-sided chest pain and rapidly progressive, suffocating shortness of breath following a motorcycle accident 15 minutes ago.",
    physicalExam: "Highly agitated, gasping for breath, cyanotic lips and face. Trachea is clinically deviated to the left side. Jugular veins are markedly distended. Right chest is hyper-resonant with completely absent breath sounds.",
    initialVitals: { bp: "78/40", hr: 132, rr: 32, temp: "36.9 °C", spo2: 81 },
    investigations: [
      { id: "ultrasound", name: "eFAST Pleural Ultrasound (PACS)", result: "Absence of lung sliding and pleural waves on the right hemithorax, confirming a severe air pocket." },
      { id: "cxr", name: "Chest Radiography (PACS)", result: "Massive right-sided radiolucency with complete lung collapse, depression of the right diaphragm, and deviation of the trachea to the left." }
    ],
    actions: [
      {
        id: "needle_thoracostomy",
        text: "Perform immediate needle decompression in the 2nd intercostal space at the midclavicular line (or 5th space at anterior axillary line) on the right side, followed by a chest tube.",
        category: "management",
        feedback: "Life-saving decision! Air immediately rushes out with a hissing sound, and the blood pressure elevates instantly as venous return is restored.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "115/72", hr: 95, rr: 20, temp: "36.9 °C", spo2: 97 },
        reasoning: "Needle decompression converts a life-threatening tension pneumothorax into a simple pneumothorax by relieving elevated intrathoracic pressure.",
        pathophysiology: "A one-way valve effect in the pleura allows air to enter the pleural space during inspiration but prevents it from escaping during expiration, compressing the heart and vena cava.",
        pearl: "Never delay needle decompression in a clinically diagnosed tension pneumothorax to wait for a chest X-ray or CT scan. It is a clinical emergency!"
      },
      {
        id: "trauma_intubate",
        text: "Intubate immediately and start mechanical ventilation with high PEEP (Positive End-Expiratory Pressure) to correct the severe hypoxia.",
        category: "dangerous",
        feedback: "Severe cardiac arrest! Positive pressure ventilation increases pleural pressure rapidly, causing complete vena cava collapse and pulseless electrical activity (PEA).",
        correctness: "Dangerous",
        scoreImpact: -30,
        nextVitals: { bp: "0/0", hr: 0, rr: 0, temp: "36.5 °C", spo2: 0 },
        reasoning: "Positive pressure ventilation in an untreated tension pneumothorax further elevates intrapleural pressure, completely cutting off venous blood return to the heart.",
        pathophysiology: "Mechanical breaths pump more air into the trapped pleural space, creating a massive obstructive cardiac tamponade-like effect.",
        pearl: "Always decompress the chest BEFORE initiating positive pressure ventilation in trauma patients with suspected chest injury."
      }
    ]
  },
  {
    id: "preeclampsia",
    title: "Severe Right Upper Quadrant Pain in Pregnancy",
    examBoard: "FCPS",
    difficulty: "Hard",
    department: "Internal Medicine",
    disease: "Severe Preeclampsia with HELLP Syndrome",
    patientName: "Sarah Jenkins",
    age: 32,
    gender: "Female",
    occupation: "Primary School Teacher",
    medicalHistory: "G1P0 at 34 weeks gestation. Chronic hypertension managed with Methyldopa prior to pregnancy.",
    familyHistory: "Mother had preeclampsia at 32 weeks.",
    riskFactors: "Primigravida, chronic hypertension, obesity, maternal age over 30.",
    chiefComplaint: "Severe, throbbing frontal headache, blurred vision, flashing spots in the eyes (scotomata), and persistent right upper quadrant abdominal pain for 24 hours.",
    physicalExam: "Hyperreflexic (4+ patellar reflexes with clonus). Diffuse facial and hand edema, marked bilateral pitting pedal edema extending up to the mid-shins. Epigastric and right upper quadrant tenderness is prominent on light palpation.",
    initialVitals: { bp: "172/114", hr: 96, rr: 20, temp: "37.0 °C", spo2: 95 },
    investigations: [
      { id: "cbc_internal", name: "Complete Blood Count", result: "Hb: 9.8 g/dL, Platelets: 62k/µL (thrombocytopenia), Schistocytes present on blood smear." },
      { id: "ldh_lfts", name: "Comprehensive LFT & LDH", result: "AST: 280 U/L (highly elevated), ALT: 245 U/L, LDH: 820 U/L (hemolysis indicator), Uric Acid: 8.4 mg/dL." },
      { id: "ultrasound", name: "Fetal Doppler Ultrasound (PACS)", result: "Single live fetus, cephalic, estimated weight 2100g, normal amniotic fluid index. Normal hepatic contour without subcapsular hematoma." }
    ],
    actions: [
      {
        id: "hellp_management",
        text: "Initiate IV Magnesium Sulfate (4g loading dose, then 2g/hr infusion), control blood pressure with IV Labetalol 20mg slow push, and prepare for prompt delivery.",
        category: "management",
        feedback: "Outstanding medical decision! Magnesium sulfate prevents eclamptic seizures, labetalol controls stroke risk, and delivery is the definitive cure.",
        correctness: "Correct",
        scoreImpact: 35,
        nextVitals: { bp: "142/88", hr: 82, rr: 16, temp: "37.0 °C", spo2: 97 },
        reasoning: "HELLP syndrome is a severe form of preeclampsia. Anticonvulsant therapy with Magnesium Sulfate is critical to stabilize the motor cortex, and blood pressure must be controlled to prevent intracranial bleeding.",
        pathophysiology: "Systemic endothelial dysfunction leads to microangiopathic hemolytic anemia, platelet consumption, and hepatic sinusoidal fibrin deposition causing liver injury.",
        pearl: "Definitive management for HELLP syndrome at or beyond 34 weeks is prompt delivery, regardless of severity score, to halt the maternal endothelial cascade."
      },
      {
        id: "hellp_overhydrate",
        text: "Infuse 3 liters of Lactated Ringer's rapidly to address her low urine output, and defer delivery until 37 weeks to let the fetus mature.",
        category: "dangerous",
        feedback: "Severe pulmonary edema and eclamptic seizure! Overhydrating an endothelial-leaky patient triggers alveolar flooding, while delaying delivery risks maternal demise.",
        correctness: "Dangerous",
        scoreImpact: -25,
        nextVitals: { bp: "188/120", hr: 115, rr: 28, temp: "37.2 °C", spo2: 84 },
        reasoning: "Capillary leak in preeclampsia makes these patients highly susceptible to fluid overload, leading to flash pulmonary edema. Delivery cannot be safely delayed in active HELLP syndrome.",
        pathophysiology: "Increased vascular hydrostatic pressure combined with reduced oncotic pressure causes fluid to pour into the pulmonary alveoli.",
        pearl: "Urine output in severe preeclampsia can be low due to renal vasospasm; do not chase oliguria with fluid boluses as it leads to pulmonary edema."
      }
    ]
  }
];

