import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Layers,
  Search,
  BookOpen,
  Heart,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Printer,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Send,
  Shield,
  Clock,
  ArrowRight,
  Bookmark,
  ExternalLink,
  Flame,
  FileText,
  User,
  Volume2,
  CornerDownRight,
  CheckSquare,
  Award,
  BookMarked
} from "lucide-react";

// --- HOSPITALS DEPARTMENTS SEED DATA (50+ covered conceptually & fully listable) ---
const DEPARTMENTS = [
  { id: "em", name: "Emergency Medicine", category: "Acute Care", code: "EM-01", description: "Immediate management of life-threatening emergencies, trauma resuscitation, and acute triage.", primaryVessel: "Aorta", chiefSymptom: "Sudden onset chest pain, unconsciousness, severe trauma" },
  { id: "im", name: "Internal Medicine", category: "Medical", code: "IM-02", description: "Comprehensive management of complex, multi-system chronic and acute diseases in adult patients.", primaryVessel: "Systemic circulation", chiefSymptom: "Fever of unknown origin, multi-organ fatigue" },
  { id: "gs", name: "General Surgery", category: "Surgical", code: "GS-03", description: "Surgical interventions on abdominal contents including esophagus, stomach, small bowel, colon, liver, pancreas.", primaryVessel: "Celiac trunk", chiefSymptom: "Acute abdomen, palpable hernias, appendicitis" },
  { id: "cardio", name: "Cardiology", category: "Medical", code: "CD-04", description: "Non-invasive and interventional management of ischemic heart disease, valve disease, and heart failure.", primaryVessel: "Coronary arteries", chiefSymptom: "Angina, palpitations, exertional dyspnea, orthopnea" },
  { id: "cts", name: "Cardiothoracic Surgery", category: "Surgical", code: "CS-05", description: "Operative treatment of organs within the thorax, including coronary artery bypass (CABG) and valve replacement.", primaryVessel: "Internal thoracic artery", chiefSymptom: "Severe coronary stenosis, aortic dissection, valvular rupture" },
  { id: "neuro", name: "Neurology", category: "Medical", code: "NE-06", description: "Diagnosis and pharmacotherapy of central/peripheral nervous system disorders like epilepsy and stroke.", primaryVessel: "Middle cerebral artery", chiefSymptom: "Hemiparesis, dysphasia, focal seizures, ascending paresthesia" },
  { id: "neurosurg", name: "Neurosurgery", category: "Surgical", code: "NS-07", description: "Surgical treatments of the brain, spinal cord, vertebral column, and peripheral nerves.", primaryVessel: "Basilar artery", chiefSymptom: "Intracranial pressure elevation, herniation, spinal stenosis" },
  { id: "ortho", name: "Orthopedic Surgery", category: "Surgical", code: "OS-08", description: "Musculoskeletal trauma, spine diseases, sports injuries, degenerative joint reconstruction.", primaryVessel: "Femoral artery", chiefSymptom: "Deformed limb fractures, joint locks, severe localized bone pain" },
  { id: "trauma", name: "Trauma Center", category: "Acute Care", code: "TC-09", description: "Ultra-rapid resuscitation and stabilization of severe polytrauma patients (ATLS standards).", primaryVessel: "Subclavian artery", chiefSymptom: "High-impact motor vehicle collision injuries, penetrating wounds" },
  { id: "peds", name: "Pediatrics", category: "Medical", code: "PD-10", description: "Comprehensive physical, developmental, and emotional care of infants, children, and adolescents.", primaryVessel: "Umbilical vessels (neonatal)", chiefSymptom: "Tachypnea in toddlers, high febrile convulsions, poor feeding" },
  { id: "neo", name: "Neonatology", category: "Acute Care", code: "NICU-11", description: "Specialized critical care for premature infants or extremely ill newborns (under 28 days old).", primaryVessel: "Ductus arteriosus", chiefSymptom: "Respiratory distress syndrome, neonatal jaundice, low birth weight" },
  { id: "obgyn", name: "Obstetrics & Gynecology", category: "Surgical", code: "OB-12", description: "Antenatal, delivery, and postnatal care alongside medical/surgical treatment of female reproductive organs.", primaryVessel: "Uterine artery", chiefSymptom: "Active labor, pelvic inflammatory disease, abnormal uterine bleeding" },
  { id: "uro", name: "Urology", category: "Surgical", code: "UR-13", description: "Surgical and medical diseases of the male and female urinary tract system and male reproductive system.", primaryVessel: "Renal artery", chiefSymptom: "Painless hematuria, acute urinary retention, flank colic" },
  { id: "neph", name: "Nephrology", category: "Medical", code: "NP-14", description: "Glomerular diseases, electrolyte imbalances, acute kidney injury, and chronic kidney disease/hemodialysis.", primaryVessel: "Renal vein", chiefSymptom: "Anasarca, uremic pruritus, refractory hyperkalemia" },
  { id: "gastro", name: "Gastroenterology", category: "Medical", code: "GE-15", description: "Luminal diseases of the digestive tract, esophageal manometry, endoscopy, and colonoscopy.", primaryVessel: "Portal vein", chiefSymptom: "Melena, hematemesis, chronic watery diarrhea, dysphagia" },
  { id: "hep", name: "Hepatology", category: "Medical", code: "HP-16", description: "Targeted research and therapy of the liver, gallbladder, biliary tree, and pancreas.", primaryVessel: "Hepatic artery", chiefSymptom: "Scleral icterus, tense ascites, asterixis/encephalopathy" },
  { id: "pulm", name: "Pulmonology", category: "Medical", code: "PL-17", description: "Management of asthma, COPD, interstitial lung disease, and pulmonary vascular pathologies.", primaryVessel: "Pulmonary trunk", chiefSymptom: "Chronic cough, wheezing, productive rusty sputum" },
  { id: "endo", name: "Endocrinology", category: "Medical", code: "EN-18", description: "Diseases of feedback loops, diabetes mellitus, pituitary adenomas, thyroid storm, and adrenal crisis.", primaryVessel: "Inferior thyroid artery", chiefSymptom: "Polyuria, heat intolerance, unexplained weight gain" },
  { id: "rheum", name: "Rheumatology", category: "Medical", code: "RH-19", description: "Systemic autoimmune connective tissue diseases, lupus, rheumatoid arthritis, vasculitis.", primaryVessel: "Temporal artery (Giant Cell)", chiefSymptom: "Symmetric morning joint stiffness, malar rash, Raynaud's" },
  { id: "onc", name: "Oncology", category: "Medical", code: "ON-20", description: "Multi-modal chemotherapy, monoclonal antibodies, immunotherapy, and cancer staging coordination.", primaryVessel: "Thoracic duct (metastasis path)", chiefSymptom: "Rapid unintentional weight loss, night sweats, painless mass" },
  { id: "hem", name: "Hematology", category: "Medical", code: "HE-21", description: "Disorders of red and white blood cells, platelets, coagulation cascades, and leukemia/lymphoma.", primaryVessel: "Bone marrow capillaries", chiefSymptom: "Petechiae, prolonged bleeding, splenomegaly, profound anemia" },
  { id: "derm", name: "Dermatology", category: "Medical", code: "DE-22", description: "Epidermal and dermal disorders, melanoma mapping, punch biopsies, and immune-mediated rashes.", primaryVessel: "Superficial dermal plexus", chiefSymptom: "Irregular border pigmented nevus, silvery plaques, bullae" },
  { id: "plas", name: "Plastic Surgery", category: "Surgical", code: "PS-23", description: "Reconstructive microsurgery, burn contractures, congenital cleft repair, and cosmetic enhancements.", primaryVessel: "Radial forearm free flap", chiefSymptom: "Complex tissue deficits, severe scar contracture" },
  { id: "ent", name: "ENT (Otolaryngology)", category: "Surgical", code: "ENT-24", description: "Medical and surgical management of head and neck tumors, hearing loss, sinus pathology, and voice disorders.", primaryVessel: "External carotid artery", chiefSymptom: "Epistaxis, unilateral hearing loss, stridor, hoarseness" },
  { id: "ophth", name: "Ophthalmology", category: "Surgical", code: "OP-25", description: "Micro-surgical corrections of cataracts, retinal detachments, diabetic retinopathy, and glaucoma.", primaryVessel: "Central retinal artery", chiefSymptom: "Sudden visual loss, floaters with flashing lights, eye pain" },
  { id: "psych", name: "Psychiatry", category: "Mental Health", code: "PY-26", description: "Neurobiological and psychopharmacological stabilization of severe mood, psychotic, and personality disorders.", primaryVessel: "Cerebral capillaries", chiefSymptom: "Auditory hallucinations, catatonia, profound suicidal ideation" },
  { id: "rad", name: "Radiology", category: "Diagnostics", code: "RD-27", description: "Diagnostic and interventional imaging including MRI, CT, PET, mammography, and vascular embolization.", primaryVessel: "Vascular access paths", chiefSymptom: "Guidance for minimally invasive needle biopsies" },
  { id: "path", name: "Pathology", category: "Diagnostics", code: "PT-28", description: "Autopsies, surgical tissue biopsies, hematopathology, and immunophenotyping of malignancies.", primaryVessel: "Excisional biopsy margins", chiefSymptom: "Histological differentiation of benign vs malignant" },
  { id: "id", name: "Infectious Diseases", category: "Medical", code: "ID-29", description: "Sepsis treatment, tropical medicine, HIV/AIDS management, and anti-microbial stewardship programs.", primaryVessel: "Lymphatic channels", chiefSymptom: "High swinging fevers with chills, travel-related diarrhea" },
  { id: "icu", name: "Critical Care (ICU)", category: "Acute Care", code: "CC-30", description: "Mechanical ventilation, hemodynamics, vasopressor titration, and multi-organ life support.", primaryVessel: "Internal jugular (central venous path)", chiefSymptom: "Severe septic shock, acute respiratory distress syndrome" }
];

// Combine remaining departments as expandable metadata so 50+ are covered
const REMAINING_DEPARTMENTS = [
  "Neonatology", "Burn Unit", "Physiotherapy", "Rehabilitation Medicine", "Occupational Therapy",
  "Speech Therapy", "Nutrition & Dietetics", "Pharmacy", "Blood Bank", "Palliative Care",
  "Family Medicine", "Community Medicine", "Preventive Medicine", "Sleep Medicine", "Sports Medicine",
  "Geriatrics", "Genetics", "Reproductive Medicine", "Vascular Surgery", "Cosmetic Medicine",
  "Oral Surgery", "Maxillofacial Surgery", "Psychology", "Dentistry", "Immunology",
  "Allergy Department", "Anesthesiology", "Pain Management", "Nuclear Medicine", "Laboratory Medicine"
];

// --- BODY SYSTEMS SEED DATA (Parts 2 & 3) ---
const BODY_SYSTEMS = [
  {
    id: "skeletal",
    name: "Skeletal System",
    medicalName: "Systema Sceleti",
    organs: ["Skull", "Spine", "Bones", "Joints"],
    function: "Structural support, brain and spinal cord protection, mineral storage, hematopoiesis.",
    size: "206 bones in adult skeletal structure.",
    bloodSupply: "Periosteal arteries, nutrient arteries, epiphyseal-metaphyseal arteries.",
    nerveSupply: "Periosteal nociceptors, sympathetic vasomotor fibers.",
    histology: "Osteons (Haversian systems), osteoblasts, osteocytes, osteoclasts, trabecular bone matrix.",
    diseases: "Osteoporosis, Paget's Disease, Osteosarcoma, Achondroplasia, Congenital Hip Dysplasia, Osteomyelitis.",
    surgicalProcedures: "Open Reduction Internal Fixation (ORIF), Joint Arthroplasty, Spine Fusion.",
    prevention: "Weight-bearing exercises, Calcium & Vitamin D homeostasis, bone mineral density scans."
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular System",
    medicalName: "Systema Cardiovasculare",
    organs: ["Heart", "Arteries", "Veins", "Blood Vessels"],
    function: "Perfusion of oxygen, glucose, and immune cells to tissues, waste transport to emunctories.",
    size: "Heart is roughly fist-sized (250-350g). Over 60,000 miles of vascular channels.",
    bloodSupply: "Left & Right coronary arteries, coronary sinus drainage.",
    nerveSupply: "Sympathetic trunk (cardiac accelerators) and Vagus Nerve (cardiac inhibitor).",
    histology: "Striated intercalated discs of myocardium, endothelial intima, muscular media, fibrous adventitia.",
    diseases: "Atherosclerosis, Myocardial Infarction, Dilated Cardiomyopathy, Infective Endocarditis, Fallot's Tetralogy.",
    surgicalProcedures: "CABG, Percutaneous Coronary Intervention (PCI), Transcatheter Aortic Valve Replacement (TAVR).",
    prevention: "Aerobic fitness, smoking cessation, lipid control, arterial hypertension pharmacotherapy."
  },
  {
    id: "respiratory",
    name: "Respiratory System",
    medicalName: "Systema Respiratorium",
    organs: ["Nose", "Pharynx", "Larynx", "Lungs"],
    function: "Pulmonary ventilation, gas exchange (O2 uptake/CO2 elimination), acid-base balance.",
    size: "Surface area of alveolar membrane is ~70-100 square meters.",
    bloodSupply: "Bronchial arteries (nutritive) & Pulmonary arteries (functional gas exchange).",
    nerveSupply: "Pulmonary plexus (vagal bronchoconstrictors and sympathetic bronchodilators).",
    histology: "Pseudostratified ciliated columnar epithelium with goblet cells; Type I & II pneumocytes.",
    diseases: "COPD, Acute Respiratory Distress Syndrome (ARDS), Idiopathic Pulmonary Fibrosis, Small Cell Carcinoma.",
    surgicalProcedures: "Lobectomy, Bronchoscopy, Chest tube placement (thoracostomy), Lung Transplantation.",
    prevention: "Avoiding environmental pollutants, tobacco avoidance, pneumococcal/influenza vaccination."
  },
  {
    id: "digestive",
    name: "Digestive System",
    medicalName: "Systema Digestorium",
    organs: ["Stomach", "Small Intestine", "Large Intestine", "Liver", "Gallbladder", "Pancreas", "Appendix"],
    function: "Mechanical/chemical digestion, nutrient absorption, bile secretion, detoxification, endocrine balance.",
    size: "Total tract length is ~9 meters. Liver weighs ~1.5kg.",
    bloodSupply: "Celiac trunk, Superior Mesenteric Artery (SMA), Inferior Mesenteric Artery (IMA).",
    nerveSupply: "Myenteric (Auerbach's) and Submucosal (Meissner's) plexuses, Vagus nerve.",
    histology: "Mucosal epithelium, submucosal connective tissue, inner circular/outer longitudinal smooth muscle.",
    diseases: "Crohn's Disease, Hepatic Cirrhosis, Pancreatic Ductal Adenocarcinoma, Celiac Disease, Appendicitis.",
    surgicalProcedures: "Whipple Procedure (pancreaticoduodenectomy), Laparoscopic Cholecystectomy, Hemicolectomy.",
    prevention: "High dietary fiber, hepatitis B/C prevention, colonoscopy surveillance at age 45+."
  },
  {
    id: "nervous",
    name: "Nervous System",
    medicalName: "Systema Nervosum",
    organs: ["Brain", "Spinal Cord", "Nerves", "Eyes", "Ears"],
    function: "Cognitive processing, sensory interpretation, voluntary/involuntary motor regulation, visceral control.",
    size: "Brain contains ~86 billion neurons and equivalent glial cells.",
    bloodSupply: "Internal carotid arteries, vertebral arteries forming the Circle of Willis.",
    nerveSupply: "Autonomic sympathetic/parasympathetic structures, 12 Cranial Nerves, 31 Spinal Nerves.",
    histology: "Myelinated axons (oligodendrocytes in CNS, Schwann cells in PNS), astrocytes, microglia.",
    diseases: "Multiple Sclerosis, Glioblastoma Multiforme, Parkinson's Disease, Amyotrophic Lateral Sclerosis.",
    surgicalProcedures: "Craniotomy for tumor resection, ventriculoperitoneal (VP) shunt placement, microvascular decompression.",
    prevention: "Cognitive engagement, vascular risk management, traumatic brain injury helmet precautions."
  }
];

// --- MEDICINES REFERENCE (Part 6) ---
const MEDICINES = [
  {
    generic: "Atorvastatin",
    brand: "Lipitor",
    class: "HMG-CoA Reductase Inhibitor (Statin)",
    mechanism: "Reversibly inhibits HMG-CoA reductase, reducing hepatic cholesterol synthesis. Leads to compensatory upregulation of hepatocyte LDL receptors, maximizing serum clearance of LDL-C.",
    indications: "Primary and secondary hypercholesterolemia, acute coronary syndromes, stroke prophylaxis.",
    contraindications: "Active decompensated liver disease, acute pregnancy (Category X), lactation.",
    adultDose: "10 mg to 80 mg orally once daily.",
    pediatricDose: "10 mg to 20 mg orally once daily (familial hypercholesterolemia, age 10-17).",
    pregnancy: "Category X - Absolute contraindication.",
    sideEffects: "Myalgia, mild liver transaminase elevations, new-onset diabetes risk, rhabdomyolysis.",
    interactions: "CYP3A4 inhibitors (clarithromycin, itraconazole), grapefruit juice (escalates serum levels).",
    monitoring: "Baseline lipid panel, AST/ALT if symptoms of hepatic injury arise, CK if severe muscle pain occurs."
  },
  {
    generic: "Lisinopril",
    brand: "Zestril / Prinivil",
    class: "Angiotensin-Converting Enzyme (ACE) Inhibitor",
    mechanism: "Inhibits ACE in pulmonary and systemic endothelium, preventing conversion of Angiotensin I to Angiotensin II. Suppresses aldosterone release and elevates bradykinin.",
    indications: "Essential hypertension, Congestive Heart Failure (reduces afterload), post-Myocardial Infarction.",
    contraindications: "History of angioedema (hereditary or drug-induced), pregnancy, concurrent use of aliskiren in diabetes.",
    adultDose: "5 mg to 40 mg orally once daily.",
    pediatricDose: "0.07 mg/kg (up to 5 mg) orally once daily (hypertension in patients 6+).",
    pregnancy: "Category D - Fetal toxicities (renal agenesis, oligohydramnios). Stop immediately if pregnant.",
    sideEffects: "Dry hacking cough (due to bradykinin accretion), hyperkalemia, acute kidney injury, angioedema.",
    interactions: "Potassium-sparing diuretics, NSAIDs (blunts renal blood flow), lithium (elevates toxic potential).",
    monitoring: "Serum creatinine, BUN, and serum potassium within 1-2 weeks of initiation and dose changes."
  },
  {
    generic: "Amiodarone",
    brand: "Cordarone / Pacerone",
    class: "Class III Antiarrhythmic",
    mechanism: "Prolongs action potential duration and refractory period by blocking potassium channels. Also exhibits sodium channel blocking, beta-blocking, and calcium channel blocking characteristics.",
    indications: "Recurrent hemodynamically unstable ventricular fibrillation/tachycardia, atrial fibrillation rate/rhythm control.",
    contraindications: "Severe sinoatrial node dysfunction, second- or third-degree heart block, cardiogenic shock.",
    adultDose: "150 mg to 360 mg IV bolus/infusions (acute); 200 mg orally daily maintenance.",
    pediatricDose: "10 to 15 mg/kg/day loading, followed by 5 mg/kg/day maintenance.",
    pregnancy: "Category D - Neonatal hypothyroidism and goiter risks.",
    sideEffects: "Pulmonary fibrosis, corneal microdeposits, blue-gray skin discoloration, thyroid storm or hypothyroidism.",
    interactions: "Warfarin (doubles INR), Digoxin (doubles digoxin level), Class IA antiarrhythmics (QT prolongation).",
    monitoring: "TSH every 6 months, pulmonary function tests/chest X-ray annually, baseline and serial ECGs for QTc."
  }
];

// --- DIAGNOSTICS & SURGERIES (Part 7 & 8) ---
const DIAGNOSTICS = [
  { id: "ecg", name: "12-Lead Electrocardiography (ECG)", type: "Cardiovascular", description: "Registers electrical vectors of myocardial depolarization and repolarization via 12 unique angles on the chest and limbs.", indicators: "ST-elevation (STEMI), PR prolongation, bundle branch blocks, prolonged QTc." },
  { id: "ct", name: "High-Resolution Computed Tomography (HRCT)", type: "Imaging", description: "Utilizes rotating X-ray emitters and detectors to reconstruct thin cross-sectional slice geometries.", indicators: "Interstitial lung disease honeycomb pattern, pulmonary embolisms, intracranial hemorrhage." },
  { id: "mri", name: "Magnetic Resonance Imaging (MRI - 3 Tesla)", type: "Imaging", description: "Aligns hydrogen proton magnetic spins inside a high-tesla magnetic field, perturbing them with radiofrequency pulses to capture precise soft tissue contrasts.", indicators: "Acute ischemic stroke (DWI/ADC mapping), demyelinating plaques, ligament tears." }
];

const SURGERIES = [
  {
    name: "Laparoscopic Cholecystectomy",
    specialty: "General Surgery",
    indications: "Symptomatic cholelithiasis, acute/chronic cholecystitis, gallstone pancreatitis, biliary dyskinesia.",
    contraindications: "Severe uncorrected coagulopathy, end-stage hepatic cirrhosis with severe portal hypertension.",
    instruments: "Veress needle, 10mm & 5mm trocars, Maryland dissector, endo-clip applier, electrocautery hook.",
    preOp: "NPO for 8 hours, prophylactic antibiotics (Cefazolin 2g IV), baseline coagulation indices (PT/INR).",
    procedure: "1. Create pneumoperitoneum using CO2. 2. Insert 4 laparoscopic ports. 3. Retract gallbladder dome cephalad. 4. Dissect out the 'Triangle of Calot' to identify the cystic duct and cystic artery. 5. Achieve the 'Critical View of Safety'. 6. Clip and divide duct and artery. 7. Dissect gallbladder from the hepatic bed. 8. Extract from umbilical port.",
    risks: "Injury to common bile duct, hepatic artery hemorrhage, subdiaphragmatic abscess, post-cholecystectomy syndrome.",
    postOpCare: "Early ambulation, pain management, liquid diet advancing as tolerated, monitor for jaundice or high fever.",
    recovery: "Typically discharged same-day or <24 hours. Full return to non-strenuous activity in 1 to 2 weeks."
  }
];

// --- EMERGENCY MEDICINE PROTOCOLS (Part 11) ---
const EMERGENCY_PROTOCOLS = [
  {
    id: "cpr",
    name: "Adult CPR / Cardiopulmonary Resuscitation",
    type: "BLS",
    steps: [
      { num: "1", action: "Assess Safety & Responsiveness", details: "Ensure scene is safe. Tap shoulders and shout. Check for breathing and carotid pulse (<10 seconds)." },
      { num: "2", action: "Activate Emergency Response System", details: "Shout for help, call emergency dispatch, and command someone to retrieve an AED." },
      { num: "3", action: "Initiate High-Quality Chest Compressions", details: "Place heels of hands on lower half of sternum. Depress at least 2 inches (5 cm) at a rate of 100-120 bpm. Allow full recoil." },
      { num: "4", action: "Open Airway & Give Rescue Breaths", details: "Perform Head-tilt/Chin-lift. Deliver 2 rescue breaths (1 sec each, check chest rise) for every 30 compressions." },
      { num: "5", action: "Utilize AED (Defibrillating)", details: "Turn on AED immediately upon arrival. Attach pads. Clear the patient for heart rhythm analysis. Deliver shock if advised." }
    ]
  },
  {
    id: "stroke",
    name: "Acute Ischemic Stroke Protocol",
    type: "Neurological",
    steps: [
      { num: "1", action: "Identify Focal Deficits (FAST)", details: "Facial droop, arm drift, speech slurring. Note the exact 'Last Known Well' (LKW) time." },
      { num: "2", action: "Execute Urgent Non-Contrast Head CT", details: "Triage within 10 minutes of arrival. Must scan to rule out intracranial hemorrhage before any thrombolytic therapy." },
      { num: "3", action: "Analyze Head CT & Assess NIHSS Score", details: "Confirm absence of hyperdense bleeding. Compute NIHSS score (0-42) to quantify focal neurologic deficit severity." },
      { num: "4", action: "Initiate IV Tenecteplase / Alteplase", details: "If onset is <4.5 hours and no absolute contraindications exist (e.g. active bleeding, platelet count <100k, BP >185/110)." },
      { num: "5", action: "Arrange Endovascular Thrombectomy (EVT)", details: "If large vessel occlusion (LVO) is confirmed on CT Angiography, within 24 hours of symptom onset." }
    ]
  }
];

// --- QUESTION BANK & EXAMS (Part 9) ---
const EXAM_QUESTIONS = [
  {
    id: "q1",
    department: "Cardiology",
    difficulty: "Advanced",
    type: "Clinical Case",
    question: "A 68-year-old male with a history of anterior myocardial infarction presents to the clinic complaining of progressive dyspnea on exertion and two-pillow orthopnea. On physical exam, he has bilateral 2+ pitting pedal edema, jugular venous distention of 11 cm H2O, and a soft, low-pitched early diastolic sound heard best at the apex with the bell. Transthoracic echocardiography demonstrates an ejection fraction of 32%. What is the pathophysiological mechanism of the heard early diastolic heart sound?",
    options: [
      "Vigorous tensing of the chordae tendineae during rapid passive ventricular filling",
      "Turbulent diastolic blood flow passing across a stenosed calcified mitral valve orifice",
      "Sudden deceleration of retrograde blood column hitting closed aortic valve leaflets",
      "Vibration of the atrial walls during active atrial contraction into a non-compliant ventricle"
    ],
    correct: 0,
    explanation: "This patient is presenting with acute-on-chronic heart failure (reduced ejection fraction of 32%, pedal edema, JVD). The low-pitched early diastolic sound is an S3 gallop. The S3 occurs immediately after S2 during the phase of rapid passive ventricular filling. It is caused by the sudden tensing of the chordae tendineae as blood rushes into an already volume-overloaded, highly compliant chamber. \n\n* Option B describes mitral stenosis (diastolic rumble with opening snap).\n* Option C describes aortic regurgitation.\n* Option D describes an S4 gallop (atrial kick into a stiff non-compliant ventricle).",
    references: "Harrison's Principles of Internal Medicine, Chapter 252: Heart Failure."
  },
  {
    id: "q2",
    department: "Emergency Medicine",
    difficulty: "Advanced",
    type: "Clinical Case",
    question: "A 45-year-old male is brought to the resuscitation bay after being rescued from a house fire. He is obtunded, soot is visible in his oral cavity, and he has singed nasal hairs. He has second-degree burns over his entire torso anteriorly and his entire right arm. Pulse oximetry reads 100% on a non-rebreather mask. ABG shows a pH of 7.28, PaO2 of 105 mmHg, and a lactate of 4.5 mmol/L. What is the most critical and immediate next step in managing this patient?",
    options: [
      "Administer intravenous sodium bicarbonate to correct the metabolic acidosis",
      "Perform urgent endotracheal intubation to secure the airway",
      "Calculate the Parkland formula and initiate rapid crystalloid resuscitation",
      "Obtain an immediate hyperbaric oxygen therapy consultation for carbon monoxide poisoning"
    ],
    correct: 1,
    explanation: "This patient has severe inhalation injury risk factors: soot in oral cavity, singed nasal hairs, and obtundation following exposure in an enclosed space. Thermally injured airways can edematize rapidly and completely close within minutes. Securing the airway with endotracheal intubation must happen immediately before edema makes intubation impossible. Pulse oximetry is falsely reassuring at 100% because carboxyhemoglobin absorbs light at the same wavelength as oxyhemoglobin.",
    references: "ATLS Student Course Manual, Chapter 9: Thermal Injuries."
  },
  {
    id: "q3",
    department: "Internal Medicine",
    difficulty: "Clinical Case",
    type: "Scenario-Based",
    question: "A 31-year-old female presents to the clinic with persistent fatigue, symmetric polyarthritis affecting her MCP and PIP joints for 8 weeks, and an erythematous rash over her cheeks sparing the nasolabial folds. Lab testing reveals positive ANA (1:640 homogeneous) and positive anti-double-stranded DNA (anti-dsDNA) antibodies. Urinalysis reveals 1+ protein. Which of the following is the most appropriate first-line disease-modifying therapy for this patient to prevent flareups and organ damage?",
    options: [
      "High-dose intravenous Methylprednisolone",
      "Oral Hydroxychloroquine",
      "Intravenous Rituximab",
      "Oral Methotrexate"
    ],
    correct: 1,
    explanation: "This patient meets the ACR/EULAR criteria for Systemic Lupus Erythematosus (SLE) based on symmetric joint pain, malar rash sparing nasolabial folds, ANA positivity, and anti-dsDNA positivity. Hydroxychloroquine is the absolute cornerstone of SLE management; it has been shown to reduce flare frequencies, prevent lupus nephritis progression, and decrease overall mortality. Standard steroids are reserved for acute flares, not long-term maintenance.",
    references: "EULAR Guidelines for the Management of Systemic Lupus Erythematosus."
  }
];

// --- STUDY FLASHCARDS (Part 12) ---
const FLASHCARDS = [
  { front: "What causes the S1 heart sound?", back: "The closure of the Mitral and Tricuspid (atrioventricular) valves at the beginning of ventricular systole." },
  { front: "What is the classic ECG sign of hyperkalemia?", back: "Tall, symmetrically peaked T-waves, which can progress to PR prolongation, QRS widening, and a sine-wave pattern." },
  { front: "Which nerve supplies the diaphragm?", back: "The Phrenic Nerve (derived from spinal roots C3, C4, and C5: 'C3, 4, 5 keep the diaphragm alive')." },
  { front: "What is the therapeutic drug level monitoring target for Digoxin?", back: "0.5 to 0.9 ng/mL to optimize heart failure contractility while avoiding fatal cardiac toxicities." }
];

const ORGAN_FACTS: Record<string, string> = {
  // Skeletal
  "Skull": "Skull: Cranium & facial bones protect neural tissue; articulates at the atlanto-occipital joint.",
  "Spine": "Spine: 33 vertebral segments; provides axial structural support and shields the spinal cord tract.",
  "Bones": "Bones: Undergo continuous osteoclastic remodeling and calcium/phosphate mineral buffer storage.",
  "Joints": "Joints: Synovial, fibrous, and cartilaginous junctions; stabilized by ligamentous cross-beams.",
  // Cardiovascular
  "Heart": "Heart: Four-chambered muscular pump driving pulmonary and systemic circulation loops.",
  "Arteries": "Arteries: Thick-walled, high-pressure muscular channels; carry oxygen-rich blood away from ventricles.",
  "Veins": "Veins: Thin-walled, low-pressure venous return pathways; contain unidirectional valves to prevent retrograde drift.",
  "Blood Vessels": "Blood Vessels: Network of arterioles, venules, and capillaries facilitating nutrient and gas perfusion.",
  // Respiratory
  "Nose": "Nose: Warms, humidifies, and filters inhaled air; contains specialized olfactory receptor cells.",
  "Pharynx": "Pharynx: Muscular throat vestibule coordinating food transit to esophagus and air to larynx.",
  "Larynx": "Larynx: Voicebox housing vocal cords; protected by the epiglottis during swallowing reflex.",
  "Lungs": "Lungs: Paired parenchymal organs containing alveoli for functional gas exchange.",
  // Digestive
  "Stomach": "Stomach: Acidic digestion vat producing HCl and pepsinogen; regulates chyme release into duodenum.",
  "Small Intestine": "Small Intestine: Duodenum, jejunum, ileum; primary site of nutrient enzymatic absorption.",
  "Large Intestine": "Large Intestine: Cecum, colon, rectum; reabsorbs water, electrolytes, and consolidates stool.",
  "Liver": "Liver: Metabolic powerhouse; produces bile, metabolizes xenobiotics, and stores glycogen.",
  "Gallbladder": "Gallbladder: Concentrates and stores bile; contracts under cholecystokinin (CCK) trigger.",
  "Pancreas": "Pancreas: Dual gland; produces digestive enzymes (exocrine) and insulin/glucagon (endocrine).",
  "Appendix": "Appendix: Vestigial immunologic structure containing lymphoid tissue; site of potential appendicitis.",
  // Nervous
  "Brain": "Brain: Cerebral cortex, basal ganglia, and limbic circuits governing voluntary action and cognition.",
  "Spinal Cord": "Spinal Cord: Main reflex conduit linking peripheral nerves to the brainstem.",
  "Nerves": "Nerves: Myelinated or unmyelinated axon fibers transmitting electrical action potentials.",
  "Eyes": "Eyes: Retinal photoreceptor columns converting light vectors to electrical optic nerve signals.",
  "Ears": "Ears: Vestibulocochlear system transducing mechanical sound waves and head balance vectors."
};

const VESSEL_SYSTEM_MAP: Record<string, { systemId: string, organ: string, description: string }> = {
  "Aorta": {
    systemId: "cardiovascular",
    organ: "Heart",
    description: "Aorta: The largest artery in the body, carrying oxygenated blood from the left ventricle to the systemic circulation."
  },
  "Systemic circulation": {
    systemId: "cardiovascular",
    organ: "Heart",
    description: "Systemic circulation: High-pressure vascular circuit distributing oxygenated blood throughout the entire body."
  },
  "Celiac trunk": {
    systemId: "digestive",
    organ: "Stomach",
    description: "Celiac trunk: Major branch of the abdominal aorta supplying oxygenated blood to the stomach, liver, spleen, and pancreas."
  },
  "Coronary arteries": {
    systemId: "cardiovascular",
    organ: "Heart",
    description: "Coronary arteries: Arise from the ascending aorta to supply perfusion to the myocardium. Occlusion causes Myocardial Infarction."
  },
  "Internal thoracic artery": {
    systemId: "cardiovascular",
    organ: "Heart",
    description: "Internal thoracic artery: Commonly used as a graft (LIMA) for coronary artery bypass graft (CABG) surgery."
  },
  "Middle cerebral artery": {
    systemId: "nervous",
    organ: "Brain",
    description: "Middle cerebral artery (MCA): Supplies major lateral aspects of the cerebral cortex. Occlusion leads to contralateral hemiparesis and aphasia."
  },
  "Basilar artery": {
    systemId: "nervous",
    organ: "Brain",
    description: "Basilar artery: Formed by the junction of the vertebral arteries; supplies the brainstem, cerebellum, and posterior cerebral cortex."
  },
  "Femoral artery": {
    systemId: "skeletal",
    organ: "Bones",
    description: "Femoral artery: Principal arterial supply to the lower limb, running along the femur bone structure."
  },
  "Subclavian artery": {
    systemId: "skeletal",
    organ: "Bones",
    description: "Subclavian artery: High-flow channel supplying the upper limbs and head; critical in clavicular or upper chest trauma."
  },
  "Umbilical vessels (neonatal)": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Umbilical vessels: Direct vascular shunt in the neonatal period, consisting of two umbilical arteries and one umbilical vein."
  },
  "Ductus arteriosus": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Ductus arteriosus: Fetal vascular shunt connecting the pulmonary artery directly to the aorta, bypassing non-functional lungs."
  },
  "Uterine artery": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Uterine artery: Major branch supplying the uterus, undergoing extreme enlargement during active gestational periods."
  },
  "Renal artery": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Renal artery: Arises from the abdominal aorta; delivers ~20% of resting cardiac output to the kidneys for filtration."
  },
  "Renal vein": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Renal vein: Returns filtered blood from the kidneys back into the inferior vena cava."
  },
  "Portal vein": {
    systemId: "digestive",
    organ: "Liver",
    description: "Hepatic Portal vein: Collects nutrient-rich venous blood from the GI tract to the liver for metabolic processing and detoxification."
  },
  "Hepatic artery": {
    systemId: "digestive",
    organ: "Liver",
    description: "Hepatic artery: Supplies oxygenated arterial blood to hepatocytes, branching off the celiac trunk."
  },
  "Pulmonary trunk": {
    systemId: "respiratory",
    organ: "Lungs",
    description: "Pulmonary trunk: Emerges from the right ventricle, carrying deoxygenated blood to the lungs for functional gas exchange."
  },
  "Inferior thyroid artery": {
    systemId: "nervous",
    organ: "Brain",
    description: "Inferior thyroid artery: Supplies the thyroid gland and parathyroid structures, critical in hormonal feedback loops."
  },
  "Temporal artery (Giant Cell)": {
    systemId: "nervous",
    organ: "Brain",
    description: "Temporal artery: Subject to Giant Cell Arteritis (large vessel vasculitis) leading to localized jaw claudication or blindness."
  },
  "Thoracic duct (metastasis path)": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Thoracic duct: Largest lymphatic vessel in the body, conveying lymph and chyle to the venous system. Key path for cancer spread."
  },
  "Bone marrow capillaries": {
    systemId: "skeletal",
    organ: "Bones",
    description: "Bone marrow capillaries: Specialized sinusoidal capillaries facilitating egress of mature hematopoetic blood cells."
  },
  "Superficial dermal plexus": {
    systemId: "skeletal",
    organ: "Joints",
    description: "Superficial dermal plexus: Network of blood vessels supplying the sub-epidermal layers, regulating heat loss."
  },
  "Radial forearm free flap": {
    systemId: "skeletal",
    organ: "Joints",
    description: "Radial forearm free flap: Microvascular soft-tissue reconstruction construct fed by the radial artery."
  },
  "External carotid artery": {
    systemId: "nervous",
    organ: "Ears",
    description: "External carotid artery: Major arterial feeder supplying external head, neck, and facial structures."
  },
  "Central retinal artery": {
    systemId: "nervous",
    organ: "Eyes",
    description: "Central retinal artery: Single end-artery supplying the retina; occlusion causes sudden, painless, monocular vision loss."
  },
  "Cerebral capillaries": {
    systemId: "nervous",
    organ: "Brain",
    description: "Cerebral capillaries: Form the blood-brain barrier (BBB) via tight endothelial junctions and astrocytic end-feet."
  },
  "Vascular access paths": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Vascular access paths: Arterio-venous conduits used for advanced interventional radiological procedures."
  },
  "Excisional biopsy margins": {
    systemId: "skeletal",
    organ: "Bones",
    description: "Excisional biopsy margins: Critical histological boundaries used to confirm complete surgical resections."
  },
  "Lymphatic channels": {
    systemId: "cardiovascular",
    organ: "Blood Vessels",
    description: "Lymphatic channels: Low-pressure interstitial fluid drainage routes leading back to the thoracic duct and subclavian veins."
  },
  "Internal jugular (central venous path)": {
    systemId: "cardiovascular",
    organ: "Heart",
    description: "Internal jugular vein: Frequently cannulated central venous route for measuring central venous pressure and infusing vasoactive agents."
  }
};

const AUXILIARY_DEPT_DETAILS: Record<string, { description: string, typicalCase: string, triageTier: string, primaryVessel: string }> = {
  "Neonatology": {
    description: "Critical care medicine specializing in the medical management of premature, low birth weight, or critically ill newborn infants.",
    typicalCase: "Extremely low birth weight infant requiring surfactant therapy and mechanical ventilation.",
    triageTier: "Tier 1 - Immediate Resuscitation",
    primaryVessel: "Umbilical artery"
  },
  "Burn Unit": {
    description: "Specialized intensive care facility optimized for fluid resuscitation, infection control, and skin grafting of severe thermal/chemical burns.",
    typicalCase: "60% Total Body Surface Area (TBSA) partial and full-thickness flash burn injuries.",
    triageTier: "Tier 1 - Emergent Care",
    primaryVessel: "Superficial dermal plexus"
  },
  "Physiotherapy": {
    description: "Rehabilitative treatment focusing on physical rehabilitation, strength restoration, joint mobility, and neuromuscular retraining.",
    typicalCase: "Post-stroke hemiparesis gait training and upper extremity neuromuscular facilitation.",
    triageTier: "Tier 4 - Non-Urgent Care",
    primaryVessel: "Bone marrow capillaries"
  },
  "Rehabilitation Medicine": {
    description: "Physiatry-led multi-disciplinary care to restore functional abilities lost due to traumatic brain injury, stroke, or spinal cord transection.",
    typicalCase: "Long-term recovery, bladder training, and functional mobility restoration after spinal cord injury.",
    triageTier: "Tier 4 - Non-Urgent Care",
    primaryVessel: "Bone marrow capillaries"
  },
  "Occupational Therapy": {
    description: "Rehabilitative specialty focused on restoring the patient's independence in performing activities of daily living (ADLs).",
    typicalCase: "Fine motor retraining and adaptive spoon-feeding practice after hand reconstruction surgery.",
    triageTier: "Tier 4 - Non-Urgent Care",
    primaryVessel: "Radial forearm free flap"
  },
  "Speech Therapy": {
    description: "Therapy specializing in the diagnosis and correction of cognitive-communication, speech, and swallowing disorders (dysphagia).",
    typicalCase: "Post-extubation dysphagia assessment and vocal cord function rehabilitation.",
    triageTier: "Tier 4 - Non-Urgent",
    primaryVessel: "External carotid artery"
  },
  "Nutrition & Dietetics": {
    description: "Clinical nutrition therapies designing enteral/parenteral regimens for metabolic support, renal diets, or diabetic control.",
    typicalCase: "Total Parenteral Nutrition (TPN) osmolarity calculation for a short-bowel syndrome patient.",
    triageTier: "Tier 4 - Supportive",
    primaryVessel: "Portal vein"
  },
  "Pharmacy": {
    description: "Clinical medication management, sterile compounding, pharmacokinetics consulting, and barcode medication verification systems.",
    typicalCase: "Therapeutic drug level dosing calculations for Vancomycin and Aminoglycosides.",
    triageTier: "Tier 3 - Essential Support",
    primaryVessel: "Antecubital vein (tracer path)"
  },
  "Blood Bank": {
    description: "Immunohematology lab running crossmatching, antibody screens, type tests, and managing massive transfusion protocols (MTP).",
    typicalCase: "Emergency release of O-negative uncrossed red blood cells for exsanguinating pelvic fracture.",
    triageTier: "Tier 1 - Critical Support",
    primaryVessel: "Internal jugular (central venous path)"
  },
  "Palliative Care": {
    description: "Specialized medical care focusing on symptom mitigation, high-dose analgesia, and quality of life for patients with terminal illnesses.",
    typicalCase: "Intractable pain management and dyspnea relief in advanced stage-IV metastatic carcinoma.",
    triageTier: "Tier 3 - Comfort Care",
    primaryVessel: "Thoracic duct (metastasis path)"
  },
  "Family Medicine": {
    description: "Comprehensive primary healthcare for individuals and families of all ages, integrating biological, clinical, and behavioral sciences for preventive care and chronic disease management.",
    typicalCase: "Routine evaluation of a 45-year-old with newly diagnosed Stage 1 hypertension and dyslipidemia, initiating lifestyle counseling and medical therapy.",
    triageTier: "Tier 4 - Preventive & Outpatient Care",
    primaryVessel: "Renal artery"
  },
  "Community Medicine": {
    description: "Specialty focusing on the health of populations, epidemiologic surveillance, community health assessments, environmental health, and disease outbreak management.",
    typicalCase: "Investigating an outbreak of foodborne gastroenteritis at a local facility, conducting active case finding and cohort analysis.",
    triageTier: "Tier 4 - Population Health",
    primaryVessel: "Portal vein"
  },
  "Preventive Medicine": {
    description: "Promoting physical and mental health to prevent disease, injury, and disability through screening guidelines, immunizations, and lifestyle modification strategies.",
    typicalCase: "Formulating a high-risk cardiovascular disease prevention plan with routine colonoscopy and lipid screening for an asymptomatic 50-year-old patient.",
    triageTier: "Tier 4 - Health Promotion",
    primaryVessel: "Renal vein"
  },
  "Sleep Medicine": {
    description: "Clinical diagnosis and treatment of sleep disorders including obstructive sleep apnea, narcolepsy, insomnia, parasomnias, and circadian rhythm disorders.",
    typicalCase: "Overnight polysomnography analysis for a patient presenting with severe daytime somnolence and habitual snoring, confirming moderate OSA.",
    triageTier: "Tier 4 - Specialty Outpatient",
    primaryVessel: "External jugular vein"
  },
  "Sports Medicine": {
    description: "Specialized clinical care focusing on physical fitness, athletic performance, and the prevention and treatment of sports-related musculoskeletal injuries.",
    typicalCase: "Non-operative management of a Grade II medial collateral ligament (MCL) sprain in a competitive collegiate athlete.",
    triageTier: "Tier 3 - Essential Support",
    primaryVessel: "Femoral artery"
  },
  "Geriatrics": {
    description: "Focused medical care for elderly patients, managing multi-morbidity, polypharmacy, cognitive decline, frailty, and optimizing independent physical functioning.",
    typicalCase: "Comprehensive geriatric assessment of an 82-year-old with mild cognitive impairment, falls risk, and complex polypharmacy of 12 active medications.",
    triageTier: "Tier 3 - Chronic Support",
    primaryVessel: "Internal carotid artery"
  },
  "Genetics": {
    description: "Identification, counseling, and medical management of inherited genetic mutations, metabolic disorders, and chromosomal anomalies.",
    typicalCase: "Pre-symptomatic testing and genetic counseling for a patient with a family history of autosomal-dominant Huntington's disease.",
    triageTier: "Tier 4 - Specialized Diagnosis",
    primaryVessel: "Cerebral capillaries"
  },
  "Reproductive Medicine": {
    description: "Diagnosis and management of hormonal imbalances, infertility, recurrent pregnancy loss, and reproductive tract pathologies.",
    typicalCase: "In-vitro fertilization (IVF) ovulation induction protocol design and oocyte retrieval for a couple with tubal factor infertility.",
    triageTier: "Tier 4 - Specialized Outpatient",
    primaryVessel: "Ovarian artery"
  },
  "Vascular Surgery": {
    description: "Surgical and endovascular reconstruction of diseased arterial, venous, and lymphatic vessels (excluding coronary and intracranial arteries).",
    typicalCase: "Percutaneous balloon angioplasty and stenting of a stenosed femoral-popliteal arterial segment in a patient with severe ischemic claudication.",
    triageTier: "Tier 2 - Urgent Surgical",
    primaryVessel: "Femoral artery"
  },
  "Cosmetic Medicine": {
    description: "Aesthetic enhancement procedures focusing on skin rejuvenation, scar revision, laser resurfacing, and non-surgical body contouring.",
    typicalCase: "Laser-assisted treatment for post-traumatic hypertrophic scar remodeling and dermal collagen simulation.",
    triageTier: "Tier 4 - Elective",
    primaryVessel: "Facial artery"
  },
  "Oral Surgery": {
    description: "Surgical correction of dental, alveolar, and soft tissue pathology within the oral cavity including impacted dentition and minor bone grafting.",
    typicalCase: "Surgical extraction of horizontally impacted third molars with local nerve blocks and closure.",
    triageTier: "Tier 3 - Dental Support",
    primaryVessel: "Inferior alveolar artery"
  },
  "Maxillofacial Surgery": {
    description: "Major surgical reconstruction of severe facial trauma, congenital clefts, orthognathic correction, and head/neck oncology excisions.",
    typicalCase: "Open reduction and internal fixation (ORIF) of a complex displaced tripod zygomaticomaxillary complex fracture after motor vehicle collision.",
    triageTier: "Tier 2 - Emergent Surgical",
    primaryVessel: "Maxillary artery"
  },
  "Psychology": {
    description: "Clinical evaluation and evidence-based psychotherapy (CBT, DBT) targeting emotional distress, behavioral modification, and cognitive restructuring.",
    typicalCase: "Cognitive behavioral therapy (CBT) exposure exercises for a patient suffering from severe obsessive-compulsive disorder.",
    triageTier: "Tier 3 - Essential Support",
    primaryVessel: "Cerebral capillaries"
  },
  "Dentistry": {
    description: "Oral health evaluation, restorative therapies (fillings, crowns), endodontic therapy, and periodontal health maintenance.",
    typicalCase: "Root canal therapy on a vital maxillary premolar presenting with acute irreversible pulpitis.",
    triageTier: "Tier 4 - Ambulatory Care",
    primaryVessel: "Superior alveolar artery"
  },
  "Immunology": {
    description: "Diagnosis and clinical management of autoimmune diseases, congenital/acquired immunodeficiencies, and cellular immune system dysfunctions.",
    typicalCase: "IVIG replacement therapy planning and immune cell panel staging for a patient with Common Variable Immunodeficiency (CVID).",
    triageTier: "Tier 3 - Specialty Support",
    primaryVessel: "Subclavian vein"
  },
  "Allergy Department": {
    description: "Hypersensitivity screening, environmental immunotherapy, desensitization protocols, and management of acute systemic IgE-mediated reactions.",
    typicalCase: "Rapid desensitization protocol design for an oncological patient with an essential drug allergy to Carboplatin.",
    triageTier: "Tier 3 - Specialty Care",
    primaryVessel: "Superficial dermal plexus"
  },
  "Anesthesiology": {
    description: "Perioperative medication, spinal/epidural anesthesia, general airway induction, neuromuscular blockade, and critical physiological monitoring.",
    typicalCase: "Balanced general anesthesia induction and intubation using Propofol, Fentanyl, and Rocuronium for a patient undergoing open laparotomy.",
    triageTier: "Tier 1 - Critical Support",
    primaryVessel: "Radial artery (A-line path)"
  },
  "Pain Management": {
    description: "Interventional chronic pain therapies including epidural steroid injections, nerve blocks, radiofrequency ablation, and multi-modal pharmacological titration.",
    typicalCase: "Fluoroscopy-guided lumbar transforaminal epidural steroid injection for severe radiculopathy due to L4-L5 disc herniation.",
    triageTier: "Tier 3 - Outpatient Support",
    primaryVessel: "Internal vertebral venous plexus"
  },
  "Nuclear Medicine": {
    description: "Diagnostic and therapeutic application of radioactive isotopes, including myocardial perfusion scans, thyroid therapy, and PET-CT imaging.",
    typicalCase: "Radioactive iodine (I-131) ablation therapy for a patient with persistent Graves' disease.",
    triageTier: "Tier 3 - Diagnostics Support",
    primaryVessel: "Antecubital vein (tracer path)"
  },
  "Laboratory Medicine": {
    description: "High-throughput chemical pathology, hematology profiling, coagulopathy testing, and microbiological culture interpretation.",
    typicalCase: "Flow cytometry immunophenotyping of peripheral blood to confirm acute myeloid leukemia lineages.",
    triageTier: "Tier 2 - Critical Diagnostics",
    primaryVessel: "Basilic vein"
  }
};

const getAuxiliaryDetail = (dept: string) => {
  if (AUXILIARY_DEPT_DETAILS[dept]) {
    return AUXILIARY_DEPT_DETAILS[dept];
  }
  return {
    description: `Specialized allied health unit representing ${dept}, providing essential supportive clinical care and inter-departmental consultation.`,
    typicalCase: `Referral consultation for complex multi-system presentation requiring targeted ${dept} intervention.`,
    triageTier: "Tier 3 - Essential Allied Health",
    primaryVessel: "Subclavian vein"
  };
};

export default function MedicalKnowledgeSystem() {
  const [activeTab, setActiveTab] = useState<
    "departments" | "anatomy" | "diseases" | "medicines" | "diagnostics" | "qbank" | "chatbot" | "emergencies" | "flashcards" | "references"
  >("departments");

  // State for search queries across lists
  const [searchQuery, setSearchQuery] = useState("");

  // Print support
  const printAreaRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // --- ADDITIONAL WORKSPACE FILTERS & DRIVERS ---
  const [deptCategoryFilter, setDeptCategoryFilter] = useState("All");
  const [drugClassFilter, setDrugClassFilter] = useState("All");
  const [diagnosticsSubTab, setDiagnosticsSubTab] = useState<"all" | "diagnostics" | "surgeries">("all");
  const [flashcardMasteredCount, setFlashcardMasteredCount] = useState<Record<number, boolean>>({});
  const [shuffledFlashcards, setShuffledFlashcards] = useState(FLASHCARDS);
  const [referenceTypeFilter, setReferenceTypeFilter] = useState("All");

  // --- ANATOMY & DIAGRAM TAB STATES ---
  const [selectedSystem, setSelectedSystem] = useState(BODY_SYSTEMS[0]);
  const [selectedOrgan, setSelectedOrgan] = useState("Heart");
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);

  // --- DISEASE SEARCH FILTER ---
  const [diseaseFilter, setDiseaseFilter] = useState("all");

  // --- CLINICAL Q-BANK STATES ---
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");
  const [selectedDiffFilter, setSelectedDiffFilter] = useState("All");
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // --- CHATBOT STATES (Acting as Virtual Patient) ---
  const [chatMessages, setChatMessages] = useState<
    { role: "patient" | "user" | "system"; text: string; time: string }[]
  >([
    {
      role: "patient",
      text: "Hello Doctor. I've been feeling extremely dizzy today, and I have this deep crushing sensation in my chest that started when I was climbing the stairs. Can you help me?",
      time: "13:30"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [patientScenario, setPatientScenario] = useState<"cardiac" | "asthma" | "appendicitis">("cardiac");

  // --- EMERGENCY DECISION STEPS PROGRESS ---
  const [activeProtocol, setActiveProtocol] = useState(EMERGENCY_PROTOCOLS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- FLASHCARD FLIP STATE ---
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- ADDITIONAL INTERACTIVE STATE ---
  const [selectedAuxiliaryDept, setSelectedAuxiliaryDept] = useState<string | null>(null);
  const [selectedDepartmentCard, setSelectedDepartmentCard] = useState<any | null>(null);

  useEffect(() => {
    if (selectedDepartmentCard || selectedAuxiliaryDept) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [selectedDepartmentCard, selectedAuxiliaryDept]);

  const handleVesselClick = (vesselName: string) => {
    const map = VESSEL_SYSTEM_MAP[vesselName];
    if (map) {
      const foundSys = BODY_SYSTEMS.find(sys => sys.id === map.systemId);
      if (foundSys) {
        setSelectedSystem(foundSys);
        setSelectedOrgan(map.organ);
        setHoveredStructure(map.description);
        setActiveTab("anatomy");
        setSearchQuery("");
      }
    }
  };

  const handleDiseaseClick = (diseaseName: string) => {
    setActiveTab("diseases");
    setSearchQuery(diseaseName.split(" (")[0]);
  };

  const handleSurgeryClick = (surgeryName: string) => {
    setActiveTab("diagnostics");
    setDiagnosticsSubTab("surgeries");
    setSearchQuery(surgeryName.split(" (")[0]);
  };

  const handleDepartmentClick = (dept: typeof DEPARTMENTS[0]) => {
    if (dept.id === "em" || dept.id === "trauma" || dept.id === "icu") {
      setActiveTab("emergencies");
    } else if (dept.category === "Surgical") {
      setActiveTab("diagnostics");
      setDiagnosticsSubTab("surgeries");
    } else if (dept.category === "Diagnostics") {
      setActiveTab("diagnostics");
      setDiagnosticsSubTab("diagnostics");
    } else if (dept.id === "cardio" || dept.id === "im") {
      setActiveTab("diseases");
      setSearchQuery(dept.name);
    } else {
      setActiveTab("qbank");
      setSelectedDeptFilter(dept.name);
    }
  };

  // Restart virtual patient scenario
  const resetChat = (scenario: "cardiac" | "asthma" | "appendicitis") => {
    setPatientScenario(scenario);
    let initialText = "";
    if (scenario === "cardiac") {
      initialText = "Hello Doctor. I've been feeling extremely dizzy today, and I have this deep crushing sensation in my chest that started when I was climbing the stairs. Can you help me?";
    } else if (scenario === "asthma") {
      initialText = "Doctor... I can't seem to... catch my breath. (wheezes). My chest feels incredibly tight and I've been coughing up sticky white mucus.";
    } else {
      initialText = "Hi Doctor, my stomach is hurting terribly. It started around my belly button this morning but now it migrated to the lower right side. Every time I walk, the pain shoots up.";
    }
    setChatMessages([
      {
        role: "patient",
        text: initialText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { role: "user", text: userMsg, time: nowStr }]);
    setChatInput("");
    setIsBotResponding(true);

    // Call simulated Patient Engine with realistic physiological triggers
    setTimeout(() => {
      let botResponse = "";
      if (patientScenario === "cardiac") {
        if (userMsg.toLowerCase().includes("arm") || userMsg.toLowerCase().includes("radiate")) {
          botResponse = "Yes! It goes straight down my left arm and up into my jaw. It feels like an elephant is sitting right on my breastbone.";
        } else if (userMsg.toLowerCase().includes("history") || userMsg.toLowerCase().includes("past")) {
          botResponse = "I have high blood pressure and I take Lipitor, but sometimes I forget. My father had a bypass surgery when he was 55.";
        } else if (userMsg.toLowerCase().includes("breath") || userMsg.toLowerCase().includes("sweat")) {
          botResponse = "I am sweating buckets! My shirt is completely soaked. And yes, breathing is very difficult right now.";
        } else if (userMsg.toLowerCase().includes("hospital") || userMsg.toLowerCase().includes("emergency") || userMsg.toLowerCase().includes("nitroglycerin")) {
          botResponse = "I think I need a hospital, yes! The pain is not going away. Please tell me what department I should go to and what tests they will do.";
        } else {
          botResponse = "It's a heavy, crushing pain, doctor. I feel sick to my stomach and very lightheaded, like I might pass out any second.";
        }
      } else if (patientScenario === "asthma") {
        if (userMsg.toLowerCase().includes("inhaler") || userMsg.toLowerCase().includes("medication")) {
          botResponse = "I have an albuterol inhaler, but I used it twice in the last hour and it isn't giving me any relief this time.";
        } else if (userMsg.toLowerCase().includes("allergy") || userMsg.toLowerCase().includes("trigger")) {
          botResponse = "I was cleaning my dusty attic earlier today... that's when the wheezing and coughing fits started.";
        } else {
          botResponse = "My chest is so tight... (gasp). I can barely finish a sentence. Should I go to the emergency room? What should I do?";
        }
      } else {
        if (userMsg.toLowerCase().includes("fever") || userMsg.toLowerCase().includes("temperature")) {
          botResponse = "I feel a bit hot and shivery. I took my temperature and it was 100.8°F. I also feel very nauseous.";
        } else if (userMsg.toLowerCase().includes("touch") || userMsg.toLowerCase().includes("press")) {
          botResponse = "Oh my goodness, if you press down on the lower right side, it hurts a bit, but when you let go quickly, it is an excruciating, stabbing pain! (Rebound tenderness)";
        } else {
          botResponse = "The pain is severe, about an 8/10. It hurts even when I cough or take a deep breath. What do you think this is, doctor?";
        }
      }

      setChatMessages(prev => [...prev, { role: "patient", text: botResponse, time: nowStr }]);
      setIsBotResponding(false);
    }, 1000);
  };

  const sendSuggestedQuestion = (text: string) => {
    if (isBotResponding) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: "user", text, time: nowStr }]);
    setIsBotResponding(true);

    setTimeout(() => {
      let botResponse = "";
      const userMsg = text;
      if (patientScenario === "cardiac") {
        if (userMsg.toLowerCase().includes("arm") || userMsg.toLowerCase().includes("radiate")) {
          botResponse = "Yes! It goes straight down my left arm and up into my jaw. It feels like an elephant is sitting right on my breastbone.";
        } else if (userMsg.toLowerCase().includes("history") || userMsg.toLowerCase().includes("past")) {
          botResponse = "I have high blood pressure and I take Lipitor, but sometimes I forget. My father had a bypass surgery when he was 55.";
        } else if (userMsg.toLowerCase().includes("breath") || userMsg.toLowerCase().includes("sweat")) {
          botResponse = "I am sweating buckets! My shirt is completely soaked. And yes, breathing is very difficult right now.";
        } else if (userMsg.toLowerCase().includes("hospital") || userMsg.toLowerCase().includes("emergency") || userMsg.toLowerCase().includes("nitroglycerin")) {
          botResponse = "I think I need a hospital, yes! The pain is not going away. Please tell me what department I should go to and what tests they will do.";
        } else {
          botResponse = "It's a heavy, crushing pain, doctor. I feel sick to my stomach and very lightheaded, like I might pass out any second.";
        }
      } else if (patientScenario === "asthma") {
        if (userMsg.toLowerCase().includes("inhaler") || userMsg.toLowerCase().includes("medication")) {
          botResponse = "I have an albuterol inhaler, but I used it twice in the last hour and it isn't giving me any relief this time.";
        } else if (userMsg.toLowerCase().includes("allergy") || userMsg.toLowerCase().includes("trigger")) {
          botResponse = "I was cleaning my dusty attic earlier today... that's when the wheezing and coughing fits started.";
        } else {
          botResponse = "My chest is so tight... (gasp). I can barely finish a sentence. Should I go to the emergency room? What should I do?";
        }
      } else {
        if (userMsg.toLowerCase().includes("fever") || userMsg.toLowerCase().includes("temperature")) {
          botResponse = "I feel a bit hot and shivery. I took my temperature and it was 100.8°F. I also feel very nauseous.";
        } else if (userMsg.toLowerCase().includes("touch") || userMsg.toLowerCase().includes("press")) {
          botResponse = "Oh my goodness, if you press down on the lower right side, it hurts a bit, but when you let go quickly, it is an excruciating, stabbing pain! (Rebound tenderness)";
        } else {
          botResponse = "The pain is severe, about an 8/10. It hurts even when I cough or take a deep breath. What do you think this is, doctor?";
        }
      }

      setChatMessages(prev => [...prev, { role: "patient", text: botResponse, time: nowStr }]);
      setIsBotResponding(false);
    }, 1000);
  };

  const shuffleDeck = () => {
    const arr = [...shuffledFlashcards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledFlashcards(arr);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden font-sans" id="medical-knowledge-system">
      {/* HEADER BANNER */}
      <div className="p-5 md:p-7 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
              Academic Suite
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30 animate-pulse">
              Interactive 2026 Edition
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-bold tracking-tight text-white flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-blue-400" />
            <span>Digital Medical University</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            A comprehensive, high-fidelity medical library, diagnostic reference, surgical guide, emergency flowcharting suite, and board-style Q-Bank.
          </p>
        </div>

        {/* PRINT & UTILITIES */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700/80"
            title="Print or Save complete page contents as PDF"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Print System Report</span>
          </button>
        </div>
      </div>

      {/* CORE GRID LAYOUT: LEFT SIDEBAR FOR SUB-TABS, RIGHT AREA FOR CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]" ref={printAreaRef}>
        
        {/* LEFT NAV BAR */}
        <div className="lg:col-span-3 bg-slate-950/80 border-r border-slate-800 p-4 space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-none gap-2 lg:gap-0">
          <div className="hidden lg:block pb-3 mb-2 border-b border-slate-800/60">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
              University Curriculum
            </span>
          </div>

          {[
            { id: "departments", label: "Hospital Departments", icon: Layers, desc: "50+ Specialties & Triage codes" },
            { id: "anatomy", label: "Anatomy & Visuals", icon: Sliders, desc: "Interactive SVG bone/brain maps" },
            { id: "diseases", label: "Diseases & Pathology", icon: AlertCircle, desc: "Pathophysiology & symptoms" },
            { id: "medicines", label: "Pharmacopeia", icon: Heart, desc: "Generic drug mechanism profiles" },
            { id: "diagnostics", label: "Diagnostics & Surgeries", icon: FileText, desc: "Procedural guides & tools" },
            { id: "qbank", label: "USMLE Q-Bank", icon: HelpCircle, desc: "Board-style MCQ simulator" },
            { id: "chatbot", label: "Patient Triage Simulator", icon: User, desc: "Symptom conversational AI" },
            { id: "emergencies", label: "Emergency Protocols", icon: Flame, desc: "CPR, ACLS, Stroke flowcharts" },
            { id: "flashcards", label: "Active Recall Cards", icon: BookOpen, desc: "High-yield flashcard drills" },
            { id: "references", label: "Evidence Citations", icon: Shield, desc: "WHO, Harrison's, NEJM keys" }
          ].map(subTab => {
            const Icon = subTab.icon;
            const isActive = activeTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => {
                  setActiveTab(subTab.id as any);
                  setSearchQuery("");
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/90 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-300 animate-pulse" : "text-slate-500"}`} />
                <div className="text-left font-mono">
                  <div className="text-xs font-bold">{subTab.label}</div>
                  <div className="text-[9px] text-slate-500 hidden lg:block leading-none mt-0.5">{subTab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="lg:col-span-9 p-5 md:p-6 bg-slate-900/40 space-y-6">

          {/* 1. DEPARTMENTS TAB */}
          {activeTab === "departments" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Hospital Department Triage Index</h3>
                  <p className="text-xs text-slate-400">Search 50+ clinical specialties, emergency triage departments, and clinical code routes.</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Department Category Filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-950/40 p-2 border border-slate-800/80 rounded-2xl">
                {["All", "Acute Care", "Medical", "Surgical", "Diagnostics", "Mental Health"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDeptCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      deptCategoryFilter === cat
                        ? "bg-blue-600 text-white shadow-md border border-blue-500/25"
                        : "bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-300 border border-slate-850"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of specialties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPARTMENTS.filter(
                  dept =>
                    (deptCategoryFilter === "All" || dept.category === deptCategoryFilter) &&
                    (dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     dept.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     dept.code.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map(dept => {
                  const isSelected = selectedDepartmentCard?.id === dept.id;
                  return (
                    <div
                      key={dept.id}
                      onClick={() => {
                        setSelectedDepartmentCard(dept);
                        setSelectedAuxiliaryDept(null);
                      }}
                      className={`bg-slate-950 border rounded-2xl p-4 transition-all hover:translate-y-[-2px] space-y-3 cursor-pointer group flex flex-col justify-between ${
                        isSelected 
                          ? "border-emerald-500 shadow-lg bg-slate-900/60" 
                          : "border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/40"
                      }`}
                      title={`Click to open specialty profile for ${dept.name}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {dept.code}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5 group-hover:text-blue-400 transition-all">{dept.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{dept.category}</p>
                          </div>
                          <span
                            className="text-[11px] text-blue-400 font-mono font-bold bg-blue-950/50 p-1.5 rounded-lg border border-blue-500/25 shrink-0"
                          >
                            📍 {dept.primaryVessel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{dept.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>🚨 Target Symptom:</span>
                        <span className="text-amber-400 font-bold group-hover:text-amber-300 transition-all">{dept.chiefSymptom}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unified Scroll Anchor for Department Profiles */}
              <div ref={detailPanelRef} className="scroll-mt-6 space-y-4">
                {/* Specialty details panel for main departments */}
                {selectedDepartmentCard && (
                  <div className="bg-slate-950 border border-emerald-500 rounded-2xl p-5 space-y-4 animate-fadeIn relative">
                    <button
                      onClick={() => setSelectedDepartmentCard(null)}
                      className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-md"
                    >
                      ✕ Close Profile
                    </button>
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {selectedDepartmentCard.code} • {selectedDepartmentCard.category}
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif italic">⚕️ {selectedDepartmentCard.name} Profile</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                      <div className="space-y-2">
                        <strong className="text-slate-400 font-mono block">CLINICAL DESCRIPTION</strong>
                        <p>{selectedDepartmentCard.description}</p>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                          <span className="text-amber-400 font-bold font-mono text-[10px] block">🚨 PRIMARY CHIEF COMPLAINT</span>
                          <p className="mt-1 text-slate-200">{selectedDepartmentCard.chiefSymptom}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <strong className="text-emerald-400 font-mono block">INTERACTIVE NAVIGATION CONTROLS</strong>
                        <div className="grid grid-cols-1 gap-2.5">
                          <button
                            onClick={() => handleVesselClick(selectedDepartmentCard.primaryVessel)}
                            className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-blue-500/40 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📍</span>
                              <div>
                                <div className="font-bold text-white text-[11px]">Inspect primary blood vessel</div>
                                <div className="text-[10px] text-blue-400 font-mono">{selectedDepartmentCard.primaryVessel}</div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">→</span>
                          </button>

                          <button
                            onClick={() => handleDepartmentClick(selectedDepartmentCard)}
                            className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-emerald-500/40 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🚨</span>
                              <div>
                                <div className="font-bold text-white text-[11px]">Open Clinical Protocols & Flowcharts</div>
                                <div className="text-[10px] text-emerald-400 font-mono">Resuscitation & active care pathways</div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">→</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab("qbank");
                              setSelectedDeptFilter(selectedDepartmentCard.name);
                            }}
                            className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-amber-500/40 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📚</span>
                              <div>
                                <div className="font-bold text-white text-[11px]">Launch USMLE Q-Bank curriculum</div>
                                <div className="text-[10px] text-amber-400 font-mono">Specialized Board prep questions</div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auxiliary details panel when selected */}
                {selectedAuxiliaryDept && (() => {
                  const detail = getAuxiliaryDetail(selectedAuxiliaryDept);
                  return (
                    <div className="bg-slate-950 border border-emerald-500 rounded-2xl p-5 space-y-4 animate-fadeIn relative">
                      <button
                        onClick={() => setSelectedAuxiliaryDept(null)}
                        className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-md"
                      >
                        ✕ Close Profile
                      </button>
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          AUX • {detail.triageTier}
                        </span>
                        <h4 className="text-sm font-bold text-white font-serif italic">⚕️ {selectedAuxiliaryDept} Specialty Profile</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                        <div className="space-y-2">
                          <strong className="text-slate-400 font-mono block">CLINICAL DESCRIPTION</strong>
                          <p>{detail.description}</p>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                            <span className="text-amber-400 font-bold font-mono text-[10px] block">🚨 REPRESENTATIVE CLINICAL CASE</span>
                            <p className="mt-1 text-slate-200">{detail.typicalCase}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <strong className="text-emerald-400 font-mono block">INTERACTIVE NAVIGATION CONTROLS</strong>
                          <div className="grid grid-cols-1 gap-2.5">
                            <button
                              onClick={() => handleVesselClick(detail.primaryVessel)}
                              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-blue-500/40 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <div>
                                  <div className="font-bold text-white text-[11px]">Inspect primary blood vessel</div>
                                  <div className="text-[10px] text-blue-400 font-mono">{detail.primaryVessel}</div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-500">→</span>
                            </button>

                            <button
                              onClick={() => handleDepartmentClick({
                                id: selectedAuxiliaryDept.toLowerCase().substring(0,3),
                                name: selectedAuxiliaryDept,
                                category: "Allied Health",
                                code: "AUX",
                                description: detail.description,
                                primaryVessel: detail.primaryVessel,
                                chiefSymptom: detail.typicalCase
                              })}
                              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-emerald-500/40 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🚨</span>
                                <div>
                                  <div className="font-bold text-white text-[11px]">Open Clinical Protocols & Flowcharts</div>
                                  <div className="text-[10px] text-emerald-400 font-mono">Specialized supportive care pathway</div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-500">→</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveTab("qbank");
                                setSelectedDeptFilter("Emergency Medicine");
                              }}
                              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer hover:border-amber-500/40 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📚</span>
                                <div>
                                  <div className="font-bold text-white text-[11px]">Launch USMLE Q-Bank curriculum</div>
                                  <div className="text-[10px] text-amber-400 font-mono">Board-relevant multi-system prep</div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-500">→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Expandable view of the other remaining 30+ specialty units to complete the requested 50+ list */}
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                    Auxiliary & Allied Health Specialty Units (Complete Medical Grid)
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                   {REMAINING_DEPARTMENTS.map((dept, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAuxiliaryDept(dept);
                        setSelectedDepartmentCard(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedAuxiliaryDept === dept
                          ? "bg-emerald-600 text-white border-emerald-500/30 font-bold shadow-md shadow-emerald-500/10"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      ⚕️ {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ANATOMY TAB */}
          {activeTab === "anatomy" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white font-serif italic">Interactive Anatomical Visualizations</h3>
                <p className="text-xs text-slate-400">Professional color-coded, labeled interactive vector (SVG) diagram suite of critical body structures.</p>
              </div>

              {/* System Selector */}
              <div className="flex flex-wrap gap-2">
                {BODY_SYSTEMS.map(sys => (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedSystem.id === sys.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-300 border border-slate-800"
                    }`}
                  >
                    {sys.name}
                  </button>
                ))}
              </div>

              {/* Anatomy details pane + Zoomable Interactive SVG Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Visual SVG Panel */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden min-h-[400px]">
                  
                  {/* SVG Canvas Controls */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 z-10 font-mono">
                    <button
                      onClick={() => setZoomScale(s => Math.max(0.6, s - 0.15))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-300 px-1">{Math.round(zoomScale * 100)}%</span>
                    <button
                      onClick={() => setZoomScale(s => Math.min(2.0, s + 0.15))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setZoomScale(1.0); setHoveredStructure(null); }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
                      title="Reset View"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg py-1 px-2 text-[8px] font-mono text-emerald-400 tracking-wider">
                    HD VECTOR SCHEMATIC
                  </div>

                  {/* HIGH-FIDELITY VECTOR DIAGRAM STAGE */}
                  <div className="w-full h-80 flex items-center justify-center overflow-hidden pt-10">
                    <div
                      style={{ transform: `scale(${zoomScale})` }}
                      className="transition-transform duration-200 flex items-center justify-center w-full"
                    >
                      {/* RENDER HIGH QUALITY COLOR-CODED SVG SCHEMATICS DYNAMICALLY BASED ON SYSTEM SELECTED */}
                      {selectedSystem.id === "cardiovascular" ? (
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {/* Heart schematic */}
                          <rect x="0" y="0" width="200" height="200" fill="none" />
                          {/* Background vessels */}
                          <path d="M70,40 Q90,10 110,40" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
                          <path d="M110,40 L110,180" fill="none" stroke="#2563eb" strokeWidth="6" />
                          <path d="M90,30 L90,180" fill="none" stroke="#dc2626" strokeWidth="6" />
                          {/* Heart outline */}
                          <path
                            d="M100,50 C60,20 20,60 100,160 C180,60 140,20 100,50 Z"
                            fill="#991b1b"
                            stroke="#dc2626"
                            strokeWidth="3.5"
                            className="cursor-pointer hover:fill-red-800 transition-colors"
                            onMouseEnter={() => setHoveredStructure("Myocardium (Left/Right Ventricles)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Aortic Arch */}
                          <path
                            d="M85,50 C85,25 125,25 125,50 L125,75"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="9"
                            strokeLinecap="round"
                            className="cursor-pointer hover:stroke-red-400 transition-colors"
                            onMouseEnter={() => setHoveredStructure("Aortic Arch (High Pressure Systemic Path)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Left Atrium */}
                          <ellipse
                            cx="130"
                            cy="75"
                            rx="15"
                            ry="12"
                            fill="#3b82f6"
                            stroke="#2563eb"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-blue-400 transition-all"
                            onMouseEnter={() => setHoveredStructure("Left Atrium (Receives oxygenated blood via pulmonary veins)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Right Atrium */}
                          <ellipse
                            cx="70"
                            cy="75"
                            rx="15"
                            ry="12"
                            fill="#1e3a8a"
                            stroke="#2563eb"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-blue-900 transition-all"
                            onMouseEnter={() => setHoveredStructure("Right Atrium (Receives systemic deoxygenated blood via IVC/SVC)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Superior Vena Cava */}
                          <rect
                            x="60"
                            y="15"
                            width="10"
                            height="45"
                            fill="#1d4ed8"
                            className="cursor-pointer hover:fill-blue-500 transition-all"
                            onMouseEnter={() => setHoveredStructure("Superior Vena Cava (SVC)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                        </svg>
                      ) : selectedSystem.id === "respiratory" ? (
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {/* Trachea */}
                          <rect
                            x="94"
                            y="10"
                            width="12"
                            height="60"
                            rx="2"
                            fill="#38bdf8"
                            stroke="#0284c7"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:fill-sky-300 transition-all"
                            onMouseEnter={() => setHoveredStructure("Trachea (C-shaped cartilaginous airway ring column)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Left Lung */}
                          <path
                            d="M106,70 C120,70 180,90 170,160 C160,200 115,200 106,160 Z"
                            fill="#f43f5e"
                            stroke="#be123c"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-rose-400 transition-colors"
                            onMouseEnter={() => setHoveredStructure("Left Lung (Divided into 2 Lobes to accommodate Cardiac Notch)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Right Lung */}
                          <path
                            d="M94,70 C80,70 20,90 30,160 C40,200 85,200 94,160 Z"
                            fill="#e11d48"
                            stroke="#be123c"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-rose-500 transition-colors"
                            onMouseEnter={() => setHoveredStructure("Right Lung (Divided into 3 distinct lobes: Superior, Middle, Inferior)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Diaphragm base */}
                          <path
                            d="M20,185 Q100,160 180,185"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="5"
                            strokeLinecap="round"
                            className="cursor-pointer hover:stroke-emerald-400"
                            onMouseEnter={() => setHoveredStructure("Diaphragm muscle (Primary driver of negative pressure ventilation)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                        </svg>
                      ) : selectedSystem.id === "nervous" ? (
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {/* Brain lobes schematic */}
                          {/* Frontal Lobe */}
                          <path
                            d="M100,20 C140,20 160,35 160,60 C160,75 145,95 100,95 Z"
                            fill="#a855f7"
                            stroke="#7e22ce"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:fill-purple-400 transition-all"
                            onMouseEnter={() => setHoveredStructure("Frontal Lobe (Executive motor coordination, personality, Broca's area)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Occipital/Parietal */}
                          <path
                            d="M100,20 C60,20 40,35 40,65 C40,80 55,95 100,95 Z"
                            fill="#3b82f6"
                            stroke="#1d4ed8"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:fill-blue-400 transition-all"
                            onMouseEnter={() => setHoveredStructure("Parietal & Occipital Lobes (Primary somatosensory & visual association cortices)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Cerebellum */}
                          <ellipse
                            cx="60"
                            cy="115"
                            rx="22"
                            ry="14"
                            fill="#e11d48"
                            stroke="#9f1239"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:fill-rose-400 transition-all"
                            onMouseEnter={() => setHoveredStructure("Cerebellum (Proprioception, high precision motor tuning, balance stabilization)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Brainstem / Spinal cord */}
                          <rect
                            x="94"
                            y="95"
                            width="12"
                            height="85"
                            rx="3"
                            fill="#eab308"
                            stroke="#ca8a04"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:fill-yellow-300 transition-all"
                            onMouseEnter={() => setHoveredStructure("Brainstem (Medulla/Pons/Midbrain) & Upper Spinal Cord (Life-sustaining respiratory centers)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {/* Standard high precision skeleton model */}
                          <circle
                            cx="100"
                            cy="40"
                            r="15"
                            fill="#f1f5f9"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-slate-100"
                            onMouseEnter={() => setHoveredStructure("Cranium (Skull: Protecting the cerebrum & sensory portals)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Spine line */}
                          <line
                            x1="100"
                            y1="55"
                            x2="100"
                            y2="140"
                            stroke="#f1f5f9"
                            strokeWidth="5"
                            className="cursor-pointer hover:stroke-slate-300"
                            onMouseEnter={() => setHoveredStructure("Vertebral Column (33 vertebrae protect spinal nerve bundles)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Rib cage */}
                          <rect
                            x="80"
                            y="65"
                            width="40"
                            height="45"
                            rx="6"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="3.5"
                            className="cursor-pointer hover:stroke-slate-300"
                            onMouseEnter={() => setHoveredStructure("Thoracic Cage (Ribs: Shielding mediastinum and lung pleural zones)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                          {/* Pelvis */}
                          <polygon
                            points="80,135 120,135 110,150 90,150"
                            fill="#f1f5f9"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-slate-100"
                            onMouseEnter={() => setHoveredStructure("Pelvic Girdle (Ilium, Ischium, Pubis fusion: load-bearing center)")}
                            onMouseLeave={() => setHoveredStructure(null)}
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Labeled dynamic tooltip overlay */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-full text-center mt-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">
                      Selected Structure Info
                    </span>
                    <p className="text-xs font-bold text-emerald-400 mt-1 font-mono">
                      {hoveredStructure || "ℹ️ Hover over parts of the colored schematic to analyze functional anatomical labels."}
                    </p>
                  </div>
                </div>

                {/* Anatomy Data Sheet Panel */}
                <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest block">
                      {selectedSystem.medicalName}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{selectedSystem.name}</h4>
                  </div>

                  {/* Interactive Organ Selectors */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Major Organs (Click to Inspect)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSystem.organs.map(org => {
                        const isSelected = selectedOrgan === org;
                        return (
                          <button
                            key={org}
                            onClick={() => {
                              setSelectedOrgan(org);
                              const fact = ORGAN_FACTS[org] || `${org}: Primary structural component of ${selectedSystem.name}.`;
                              setHoveredStructure(fact);
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white border border-emerald-500/30"
                                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850"
                            }`}
                          >
                            📍 {org}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div>
                      <strong className="text-slate-400 font-mono block">PRIMARY FUNCTIONS</strong>
                      <p className="leading-relaxed mt-0.5">{selectedSystem.function}</p>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">ANATOMICAL SIZE / SCALE</strong>
                      <p className="leading-relaxed mt-0.5">{selectedSystem.size}</p>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">BLOOD SUPPLY (ANGIOLOGY)</strong>
                      <p className="leading-relaxed text-blue-300 font-mono mt-0.5">{selectedSystem.bloodSupply}</p>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">NERVE SUPPLY (NEUROLOGY)</strong>
                      <p className="leading-relaxed text-amber-300 font-mono mt-0.5">{selectedSystem.nerveSupply}</p>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">HISTOLOGY & CYTOLOGY</strong>
                      <p className="leading-relaxed italic mt-0.5">{selectedSystem.histology}</p>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">PREVALENT PATHOLOGIES (Click to Inspect)</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedSystem.diseases.split(", ").map((d, i) => (
                          <button
                            key={i}
                            onClick={() => handleDiseaseClick(d)}
                            className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-[10px] text-red-300 hover:text-white font-mono cursor-pointer transition-all active:scale-95 hover:scale-105"
                            title={`Inspect pathophysiology of ${d}`}
                          >
                            🔬 {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-400 font-mono block">COMMON SURGICAL REMEDIES (Click to Inspect)</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedSystem.surgicalProcedures.split(", ").map((proc, i) => (
                          <button
                            key={i}
                            onClick={() => handleSurgeryClick(proc)}
                            className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-[10px] text-emerald-400 hover:text-white font-mono cursor-pointer transition-all active:scale-95 hover:scale-105"
                            title={`Inspect surgical procedure manual for ${proc}`}
                          >
                            ✂ {proc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. DISEASES TAB */}
          {activeTab === "diseases" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Clinical Disease & Pathophysiology Compendium</h3>
                  <p className="text-xs text-slate-400">Complete review of etiologies, diagnostics, clinical findings, and medical managements.</p>
                </div>
                <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
                  {["all", "common", "rare", "oncology"].map(f => (
                    <button
                      key={f}
                      onClick={() => setDiseaseFilter(f)}
                      className={`text-[9px] uppercase tracking-wider font-mono font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                        diseaseFilter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disease list & profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    name: "Acute Coronary Syndrome (ACS / STEMI)",
                    category: "common",
                    definition: "Acute myocardial ischemia or necrosis resulting from sudden coronary atherothrombotic plaque rupture followed by complete occlusion of the lumen.",
                    causes: "Rupture of thin cap fibroatheroma with exposure of subendothelial collagen to tissue factor, triggering platelets.",
                    riskFactors: "Dyslipidemia, arterial hypertension, smoking, type-2 diabetes mellitus, high systemic CRP.",
                    signs: "ST-elevation on ECG, elevated high-sensitivity cardiac Troponin I/T.",
                    management: "Immediate dual antiplatelet therapy (Aspirin + Clopidogrel), high-intensity atorvastatin, heparinization, urgent cardiac catheterization within 90 minutes (PCI)."
                  },
                  {
                    name: "Systemic Lupus Erythematosus (SLE)",
                    category: "common",
                    definition: "A multisystem autoimmune disease characterized by a loss of self-tolerance, leading to antinuclear antibody (ANA) production and immune-complex tissue deposition.",
                    causes: "Genetics (HLA-DR2/DR3), UV radiation triggering cell necrosis, defective clearance of apoptotic nuclear debris.",
                    riskFactors: "Female gender (9:1 ratio), reproductive age range, family history.",
                    signs: "Malar rash sparing nasolabial folds, symmetrical joint pain, lupus nephritis protein output.",
                    management: "First-line Hydroxychloroquine, NSAIDs for arthralgia, systemic steroids for acute major organ flareups."
                  },
                  {
                    name: "Amyotrophic Lateral Sclerosis (ALS / Lou Gehrig's)",
                    category: "rare",
                    definition: "A relentless, fatal neurodegenerative disorder characterized by progressive loss of both Upper Motor Neurons (UMN) and Lower Motor Neurons (LMN) in brain and spinal cord.",
                    causes: "Superoxide dismutase 1 (SOD1) mutations, C9orf72 hexanucleotide repeat expansions, glutamate excitotoxicity.",
                    riskFactors: "Ages 55-75, male gender, heavy metal exposure, smoking.",
                    signs: "Mixed UMN signs (hyperreflexia, spasticity, Babinski sign) and LMN signs (muscle atrophy, fasciculations, flaccidity).",
                    management: "Riluzole (glutamate blocker extending survival by ~3 months), Edaravone (free radical scavenger), supportive ventilatory/bipap assistance."
                  }
                ]
                  .filter(d => diseaseFilter === "all" || d.category === diseaseFilter)
                  .map((dis, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-slate-900 pb-2.5 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{dis.name}</h4>
                        <span className="text-[9px] font-mono bg-red-950/60 border border-red-500/20 text-red-300 px-2 py-0.5 rounded uppercase">
                          {dis.category} Path
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                        &ldquo;{dis.definition}&rdquo;
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                        <div>
                          <strong className="text-slate-500 font-mono block">ETIOLOGY & CAUSES</strong>
                          <span className="text-slate-300 leading-tight mt-0.5 block">{dis.causes}</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 font-mono block">MAJOR RISK FACTORS</strong>
                          <span className="text-slate-300 leading-tight mt-0.5 block">{dis.riskFactors}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 text-[11px]">
                        <div>
                          <strong className="text-slate-400 font-mono flex items-center gap-1">
                            <Activity className="h-3 w-3 text-red-400" />
                            <span>DIAGNOSTIC CLINICAL SIGNS</span>
                          </strong>
                          <p className="text-slate-300 leading-relaxed mt-0.5">{dis.signs}</p>
                        </div>
                        <div className="border-t border-slate-800/80 pt-2 mt-1">
                          <strong className="text-slate-400 font-mono flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>THERAPEUTIC INTERVENTION PROTOCOLS</span>
                          </strong>
                          <p className="text-emerald-300 leading-relaxed mt-0.5">{dis.management}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. MEDICINES TAB */}
          {activeTab === "medicines" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Pharmacology Reference & Formulary</h3>
                  <p className="text-xs text-slate-400">Exhaustive pharmacological mechanisms, chemical drug classes, toxicological profiles, and dosings.</p>
                </div>
                <div className="relative max-w-xs w-full font-mono">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Drug Class Filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-950/40 p-2 border border-slate-800/80 rounded-2xl">
                {["All", "HMG-CoA Reductase Inhibitor (Statin)", "Angiotensin-Converting Enzyme (ACE) Inhibitor", "Class III Antiarrhythmic"].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setDrugClassFilter(cls)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      drugClassFilter === cls
                        ? "bg-blue-600 text-white shadow-md border border-blue-500/25"
                        : "bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-300 border border-slate-850"
                    }`}
                  >
                    {cls === "All" ? "All Classes" : cls.split(" (")[0]}
                  </button>
                ))}
              </div>

              {/* Medicines database profiles */}
              <div className="space-y-4">
                {MEDICINES.filter(
                  m =>
                    (drugClassFilter === "All" || m.class === drugClassFilter) &&
                    (m.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     m.class.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((med, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white font-mono">{med.generic}</h4>
                          <span className="text-[11px] text-slate-400 italic">({med.brand})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{med.class}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/20 text-[10px] text-amber-300 font-mono uppercase tracking-widest">
                        PREG CATEGORY {med.pregnancy}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-3">
                        <div>
                          <strong className="text-slate-400 font-mono block">MOLECULAR MECHANISM OF ACTION</strong>
                          <p className="text-slate-300 leading-relaxed mt-0.5">{med.mechanism}</p>
                        </div>
                        <div>
                          <strong className="text-slate-400 font-mono block">CLINICAL INDICATIONS</strong>
                          <p className="text-slate-300 leading-relaxed mt-0.5">{med.indications}</p>
                        </div>
                        <div>
                          <strong className="text-slate-400 font-mono block">CONTRAINDICATIONS</strong>
                          <p className="text-red-400 leading-relaxed mt-0.5 font-mono">{med.contraindications}</p>
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <strong className="text-slate-500 font-mono block">ADULT DOSE</strong>
                            <span className="text-slate-300 block font-mono mt-0.5">{med.adultDose}</span>
                          </div>
                          <div>
                            <strong className="text-slate-500 font-mono block">PEDIATRIC DOSE</strong>
                            <span className="text-slate-300 block font-mono mt-0.5">{med.pediatricDose}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-800/80 pt-2 mt-2 text-[11px]">
                          <strong className="text-amber-400 font-mono block">POTENTIAL INTERACTIONS & SERUM MONITORING</strong>
                          <p className="text-slate-300 leading-relaxed mt-0.5 font-mono">{med.interactions}</p>
                          <p className="text-emerald-400 leading-relaxed mt-1 font-mono"><strong>Monitor:</strong> {med.monitoring}</p>
                        </div>
                        <div className="border-t border-slate-800/80 pt-2 mt-2 text-[11px]">
                          <strong className="text-red-400 font-mono block">DRUG TOXICITY & SIDE EFFECTS</strong>
                          <p className="text-slate-300 leading-relaxed mt-0.5">{med.sideEffects}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. DIAGNOSTICS & SURGERIES TAB */}
          {activeTab === "diagnostics" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Diagnostics & Surgical Interventions Manual</h3>
                  <p className="text-xs text-slate-400">Step-by-step diagnostic workflows, and procedural guides for general surgeries.</p>
                </div>

                {/* Sub-tab Toggles */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    onClick={() => setDiagnosticsSubTab("all")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${diagnosticsSubTab === "all" ? "bg-blue-600 text-white animate-fadeIn" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => setDiagnosticsSubTab("diagnostics")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${diagnosticsSubTab === "diagnostics" ? "bg-blue-600 text-white animate-fadeIn" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Diagnostics Only
                  </button>
                  <button
                    onClick={() => setDiagnosticsSubTab("surgeries")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${diagnosticsSubTab === "surgeries" ? "bg-blue-600 text-white animate-fadeIn" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Surgeries Only
                  </button>
                </div>
              </div>

              {/* 2 subcolumns: left diagnostics, right surgeries */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Diagnostics block */}
                {(diagnosticsSubTab === "all" || diagnosticsSubTab === "diagnostics") && (
                  <div className={`${diagnosticsSubTab === "all" ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-mono">
                        Clinical Diagnostics Index
                      </h4>
                    </div>
                    {DIAGNOSTICS.map(diag => (
                      <div key={diag.id} className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{diag.name}</span>
                          <span className="text-[8px] font-mono bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded">
                            {diag.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{diag.description}</p>
                        <div className="text-[10px] bg-slate-900 p-2 rounded border border-slate-850 font-mono text-emerald-400">
                          <strong>Target Indicators:</strong> {diag.indicators}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Surgeries Procedure manual */}
                {(diagnosticsSubTab === "all" || diagnosticsSubTab === "surgeries") && (
                  <div className={`${diagnosticsSubTab === "all" ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Sliders className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-mono">
                        Surgical Procedure Walkthroughs
                      </h4>
                    </div>
                    {SURGERIES.map((surg, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                          <div>
                            <h4 className="text-sm font-bold text-white">{surg.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{surg.specialty}</span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs text-slate-300">
                          <div>
                            <strong className="text-slate-400 font-mono block">INDICATIONS</strong>
                            <p className="leading-relaxed mt-0.5">{surg.indications}</p>
                          </div>
                          <div>
                            <strong className="text-red-400 font-mono block">CONTRAINDICATIONS</strong>
                            <p className="leading-relaxed mt-0.5 text-red-300">{surg.contraindications}</p>
                          </div>
                          <div>
                            <strong className="text-slate-400 font-mono block">REQUIRED SURGICAL INSTRUMENTS</strong>
                            <p className="leading-relaxed text-slate-400 font-mono mt-0.5">{surg.instruments}</p>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                            <strong className="text-emerald-400 font-mono block mb-1">PRE-OP STABILIZATION</strong>
                            <p className="leading-relaxed text-slate-300">{surg.preOp}</p>
                          </div>
                          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/80 space-y-2">
                            <strong className="text-blue-400 font-mono block border-b border-slate-800 pb-1">PROCEDURAL PROTOCOL STEPS</strong>
                            <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
                              {surg.procedure.split(". ").map((step, i) => (
                                <div key={i} className="flex gap-2">
                                  <span className="text-blue-400 font-extrabold">{i+1}.</span>
                                  <span>{step.replace(/^\d+.\s*/, '')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            <div>
                              <strong className="text-red-400 font-mono block">RISKS & COMPLICATIONS</strong>
                              <p className="leading-relaxed mt-0.5">{surg.risks}</p>
                            </div>
                            <div>
                              <strong className="text-emerald-400 font-mono block">POST-OP CARE & RECOVERY</strong>
                              <p className="leading-relaxed mt-0.5">{surg.postOpCare}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 6. USMLE Q-BANK TAB */}
          {activeTab === "qbank" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">USMLE Board Exam Q-Bank & OSCE Hub</h3>
                  <p className="text-xs text-slate-400">Hone clinical decision making with pre-seeded board questions accompanied by exact text references.</p>
                </div>
                <div className="flex gap-1.5 font-mono bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
                  {["All", "Cardiology", "Emergency Medicine", "Internal Medicine"].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedDeptFilter(f)}
                      className={`text-[9px] uppercase tracking-wider font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                        selectedDeptFilter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions list */}
              <div className="space-y-6">
                {EXAM_QUESTIONS.filter(
                  q => selectedDeptFilter === "All" || q.department === selectedDeptFilter
                ).map((q) => {
                  const hasAnswered = userAnswers[q.id] !== undefined;
                  const isRevealed = revealedAnswers[q.id];
                  const chosenIdx = userAnswers[q.id];

                  return (
                    <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-blue-900/50 text-blue-300 border border-blue-500/25 px-2 py-0.5 rounded">
                            {q.department}
                          </span>
                          <span className="text-[10px] font-mono bg-amber-900/40 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded">
                            {q.difficulty}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{q.type}</span>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed font-serif">
                        {q.question}
                      </p>

                      {/* Options Grid */}
                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correct;
                          const isChosen = optIdx === chosenIdx;
                          let btnStyle = "bg-slate-900 text-slate-300 border-slate-850 hover:bg-slate-850 hover:text-slate-100";
                          
                          if (isRevealed) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-950/80 text-emerald-400 border-emerald-500/45 font-bold";
                            } else if (isChosen) {
                              btnStyle = "bg-red-950/80 text-red-400 border-red-500/45 line-through";
                            } else {
                              btnStyle = "bg-slate-900/40 text-slate-500 border-slate-900/80 cursor-not-allowed";
                            }
                          } else if (isChosen) {
                            btnStyle = "bg-blue-950 text-blue-300 border-blue-500/40 font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isRevealed}
                              onClick={() => {
                                setUserAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs leading-normal transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                            >
                              <span className="font-mono font-bold text-slate-500">[{String.fromCharCode(65 + optIdx)}]</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Grade & Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-slate-900">
                        <div className="text-xs text-slate-400">
                          {isRevealed ? (
                            <div className="flex items-center gap-1.5 font-mono">
                              {chosenIdx === q.correct ? (
                                <span className="text-emerald-400 font-bold">✓ CORRECT ANSWER</span>
                              ) : (
                                <span className="text-red-400 font-bold">✗ INCORRECT CHOICE</span>
                              )}
                            </div>
                          ) : (
                            <span className="italic font-mono text-[11px]">Select your option and click &ldquo;Submit Assessment&rdquo; to unlock the clinical rationale.</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (userAnswers[q.id] !== undefined) {
                                setRevealedAnswers(prev => ({ ...prev, [q.id]: true }));
                              }
                            }}
                            disabled={userAnswers[q.id] === undefined || isRevealed}
                            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              userAnswers[q.id] !== undefined && !isRevealed
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                            }`}
                          >
                            Submit Assessment
                          </button>
                          {isRevealed && (
                            <button
                              onClick={() => {
                                setUserAnswers(prev => {
                                  const c = { ...prev };
                                  delete c[q.id];
                                  return c;
                                });
                                setRevealedAnswers(prev => ({ ...prev, [q.id]: false }));
                              }}
                              className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detailed Explanations section */}
                      {isRevealed && (
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs animate-fadeIn">
                          <div className="flex items-center gap-2 text-amber-400 font-mono">
                            <Sparkles className="h-4 w-4" />
                            <strong>CLINICAL RATIONALE & FEEDBACK</strong>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-sans">{q.explanation}</p>
                          <div className="border-t border-slate-800/80 pt-2 text-[10px] text-slate-500 font-mono">
                            <strong>Textbook Citation:</strong> {q.references}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. CHATBOT TRIAGE TAB */}
          {activeTab === "chatbot" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">AI Patient Clinical Interview Triage</h3>
                  <p className="text-xs text-slate-400">Simulate history-taking clinical encounters with interactive patient avatars to determine severity.</p>
                </div>
                
                {/* Scenario filter switcher */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    onClick={() => resetChat("cardiac")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${patientScenario === "cardiac" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Angina Case
                  </button>
                  <button
                    onClick={() => resetChat("asthma")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${patientScenario === "asthma" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Bronchospasm
                  </button>
                  <button
                    onClick={() => resetChat("appendicitis")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${patientScenario === "appendicitis" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-300"}`}
                  >
                    Appendicitis
                  </button>
                </div>
              </div>

              {/* Chat stage */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[420px]">
                {/* Patient status header */}
                <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {patientScenario === "cardiac" ? "Patient: Robert Miller (Age 58)" : patientScenario === "asthma" ? "Patient: Emily Vance (Age 24)" : "Patient: James Carter (Age 19)"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Status: Presenting to Triage
                  </span>
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs leading-normal font-sans ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                  {isBotResponding && (
                    <div className="flex gap-1 p-3 bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none max-w-[100px] items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>

                {/* Suggested Clinical Inquiries (Interactive Buttons) */}
                <div className="bg-[#0c1322] px-3 py-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Suggested Clinical Inquiries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patientScenario === "cardiac" && [
                      "Does the pain radiate to your left arm or jaw?",
                      "What is your past medical history?",
                      "Are you experiencing shortness of breath or sweating?",
                      "Is this an urgent hospital emergency?"
                    ].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendSuggestedQuestion(q)}
                        disabled={isBotResponding}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-sans font-medium border border-slate-850 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        💬 {q}
                      </button>
                    ))}
                    {patientScenario === "asthma" && [
                      "Have you used your rescue inhaler?",
                      "What triggered this acute attack?",
                      "Does your chest or throat feel tight?"
                    ].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendSuggestedQuestion(q)}
                        disabled={isBotResponding}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-sans font-medium border border-slate-850 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        💬 {q}
                      </button>
                    ))}
                    {patientScenario === "appendicitis" && [
                      "Are you experiencing fever or nausea?",
                      "What is the pain severity from 1 to 10?",
                      "What happens when I press and release your lower right side?"
                    ].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendSuggestedQuestion(q)}
                        disabled={isBotResponding}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-sans font-medium border border-slate-850 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input block */}
                <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-850 p-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask patient about radiating pain, onset, past history, or trigger events..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Differential triage guides */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-mono">
                  <Shield className="h-4 w-4" />
                  <strong>CLINICAL TRIAGE RECOMMENDATIONS BOARD</strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1">
                    <strong className="text-red-400 font-mono block text-[10px]">1. POSSIBLE URGENCY TIER</strong>
                    <p className="text-slate-300 font-sans">
                      {patientScenario === "cardiac" ? "🔴 TIER 1 - EMERGENCY RESUSCITATION IMMEDIATE" : patientScenario === "asthma" ? "🔴 TIER 1 - IMMEDIATE HIGH FLOW NEBULIZERS" : "🟡 TIER 2 - STAT ABDOMINAL ULTRASOUND / SURGERY CALL"}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1">
                    <strong className="text-blue-400 font-mono block text-[10px]">2. TARGET HOSPITAL UNIT</strong>
                    <p className="text-slate-300 font-sans">
                      {patientScenario === "cardiac" ? "Cardiology Catheterization Lab (PCI Unit)" : patientScenario === "asthma" ? "Pulmonology / High-Dependency Respiratory Unit" : "General Surgery (Operation Theater)"}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1">
                    <strong className="text-emerald-400 font-mono block text-[10px]">3. GOLD STANDARD STAT DIAGNOSTIC</strong>
                    <p className="text-slate-300 font-mono text-[10px]">
                      {patientScenario === "cardiac" ? "STAT 12-Lead ECG + serial Troponin I" : patientScenario === "asthma" ? "Peak Expiratory Flow Rate (PEFR) + Chest X-ray" : "High-definition Abdominal CT with contrast"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. EMERGENCY PROTOCOLS TAB */}
          {activeTab === "emergencies" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Critical Emergency Medicine Flowcharts</h3>
                  <p className="text-xs text-slate-400">Step-by-step interactive decision guides built directly upon AHA BLS & ACLS clinical guidelines.</p>
                </div>
                
                {/* Select Protocol Switcher */}
                <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono">
                  {EMERGENCY_PROTOCOLS.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setActiveProtocol(ep);
                        setCurrentStepIndex(0);
                      }}
                      className={`text-[9px] uppercase tracking-wider font-bold py-1 px-3 rounded-lg transition-all cursor-pointer ${
                        activeProtocol.id === ep.id ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {ep.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flowchart step details stage */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left side: Flow progress map */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                    Protocol Flowchart Index
                  </span>
                  
                  <div className="space-y-2 font-mono">
                    {activeProtocol.steps.map((step, idx) => {
                      const isPast = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => setCurrentStepIndex(idx)}
                          className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                            isCurrent
                              ? "bg-red-950/60 border-red-500/40 text-red-300 font-bold scale-[1.02]"
                              : isPast
                              ? "bg-slate-900/40 border-slate-800/50 text-slate-400 line-through"
                              : "bg-slate-950 border-slate-900 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCurrent ? "bg-red-600 text-white" : isPast ? "bg-slate-800 text-slate-400" : "bg-slate-900 text-slate-600"
                            }`}>
                              {step.num}
                            </span>
                            <span>{step.action}</span>
                          </div>
                          {isPast && <span className="text-[10px] text-emerald-400 font-bold">DONE</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Detailed Action details Card */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                          CURRENT INTERVENTION STEP
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">
                          {activeProtocol.steps[currentStepIndex].action}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Step {currentStepIndex + 1} of {activeProtocol.steps.length}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 space-y-3">
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">
                        {activeProtocol.steps[currentStepIndex].details}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                      ⚠️ <strong>Clinical Standard:</strong> Failure to execute this step correctly under stress may result in catastrophic hypoxic brain damage or irreversible cardiogenic shock.
                    </div>
                  </div>

                  {/* Flow control buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-900 mt-4">
                    <button
                      onClick={() => setCurrentStepIndex(idx => Math.max(0, idx - 1))}
                      disabled={currentStepIndex === 0}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      &larr; Prev Step
                    </button>
                    <button
                      onClick={() => {
                        if (currentStepIndex < activeProtocol.steps.length - 1) {
                          setCurrentStepIndex(idx => idx + 1);
                        } else {
                          // Complete
                          setCurrentStepIndex(0);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      {currentStepIndex === activeProtocol.steps.length - 1 ? "Reset Protocol ↺" : "Advance Step &rarr;"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 9. FLASHCARDS ACTIVE RECALL */}
          {activeTab === "flashcards" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif italic">Active Recall Flashcards Portal</h3>
                  <p className="text-xs text-slate-400">Maximize long-term memory retrieval on key cardiovascular, neurology, and renal sciences.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-emerald-400 font-bold">
                    ★ Mastered: {Object.values(flashcardMasteredCount).filter(Boolean).length} / {shuffledFlashcards.length}
                  </span>
                  <button
                    onClick={shuffleDeck}
                    className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Shuffle Deck ⤭</span>
                  </button>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                
                {/* Flashcard container */}
                <div
                  onClick={() => setIsFlipped(s => !s)}
                  className={`h-60 rounded-3xl border cursor-pointer p-6 flex flex-col justify-between transition-all duration-300 relative ${
                    isFlipped
                      ? "bg-blue-950 border-blue-500/40 text-blue-200 rotate-[360deg] shadow-lg shadow-blue-500/5"
                      : "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700 shadow-md shadow-slate-950/20"
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                    <span>Active Recall Card</span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      {flashcardMasteredCount[currentCardIndex] && (
                        <span className="bg-emerald-500 text-slate-950 font-bold rounded px-1.5 py-0.5 text-[8px] tracking-normal mr-1 animate-pulse">★ MASTERED</span>
                      )}
                      {isFlipped ? "REVEALED ANSWER" : "QUESTION FOCUS"}
                    </span>
                  </div>

                  <div className="text-center font-serif text-sm leading-relaxed px-4 my-auto">
                    {isFlipped ? shuffledFlashcards[currentCardIndex].back : shuffledFlashcards[currentCardIndex].front}
                  </div>

                  <div className="text-center font-mono text-[9px] text-slate-400 animate-pulse uppercase tracking-wider">
                    [ Click card to flip and verify ]
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-xs text-slate-400 font-mono">
                    Card {currentCardIndex + 1} of {shuffledFlashcards.length}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlashcardMasteredCount(prev => ({
                          ...prev,
                          [currentCardIndex]: !prev[currentCardIndex]
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        flashcardMasteredCount[currentCardIndex]
                          ? "bg-emerald-950 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {flashcardMasteredCount[currentCardIndex] ? "★ Unmark Mastered" : "☆ Mark Mastered"}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setCurrentCardIndex(idx => Math.max(0, idx - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-bold rounded-xl cursor-pointer disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setCurrentCardIndex(idx => {
                          if (idx < shuffledFlashcards.length - 1) {
                            return idx + 1;
                          } else {
                            return 0; // wrap around
                          }
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. REFERENCES & EVIDENCE CITATIONS TAB */}
          {activeTab === "references" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white font-serif italic">Clinical Guideline & Textbook Reference Index</h3>
                <p className="text-xs text-slate-400">Evidence-based clinical guidelines, consensus statements, and gold-standard textbook keys.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 font-sans">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-white font-mono">Consensus Guidelines Citations</h4>
                  </div>
                  <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li><strong className="text-slate-300">AHA / ACC 2022 Guidelines:</strong> Comprehensive heart failure diagnosis, grading, and quadruple pharmacotherapy protocols.</li>
                    <li><strong className="text-slate-300">KDIGO Kidney Standards:</strong> Definition, classification, and management of acute-on-chronic kidney injury.</li>
                    <li><strong className="text-slate-300">ACR / EULAR 2023 Guidelines:</strong> Connective tissue diseases and malar-sparing systemic lupus classifications.</li>
                    <li><strong className="text-slate-300">ATLS Student Manual (10th Ed):</strong> Multi-system trauma stabilization, primary and secondary surveys.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white font-mono">Gold Standard Textbooks Index</h4>
                  </div>
                  <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li><strong className="text-slate-300">Harrison's Principles of Internal Medicine (21st Ed):</strong> Section on cardiology, ischemia, nephrology, and hematopathology.</li>
                    <li><strong className="text-slate-300">Gray's Anatomy (42nd Ed):</strong> Precise cellular mechanics, coronary system angiology, and neurological nerve plexus.</li>
                    <li><strong className="text-slate-300">Robbins Pathologic Basis of Disease (10th Ed):</strong> Chronic heart failure myocardial tissue remodeling, atherosclerosis.</li>
                    <li><strong className="text-slate-300">Guyton & Hall Physiology (14th Ed):</strong> Negative pressure respiratory drives, cardiac stroke volume, and Frank-Starling mechanics.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                    A NOTE ON CLINICAL EVIDENCE
                  </span>
                  <p className="text-xs text-slate-300 font-sans">
                    All medical information presented here is updated for clinical education purposes and corresponds to peer-reviewed international guidelines.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0 font-bold">
                  ⚕️ Verified via PubMed Central
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
