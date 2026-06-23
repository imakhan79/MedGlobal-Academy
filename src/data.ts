import { MedicalSpecialty, MCQ, ClinicalCase, ResearchCourse, DrugProfile, MedicalTerm, NewsArticle, SubscriptionTier, Certificate } from "./types";

export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  { id: "cardio", name: "Cardiology", category: "Medicine", description: "Diseases of the heart and blood vessels, heart failure, and rhythm disorders.", icon: "Activity" },
  { id: "endo", name: "Endocrinology", category: "Medicine", description: "Hormonal systems, thyroid function, diabetes mellitus, and adrenal disorders.", icon: "Flame" },
  { id: "gastro", name: "Gastroenterology", category: "Medicine", description: "Digestive tract, liver, pancreas, and biliary system pathology.", icon: "TrendingUp" },
  { id: "pulm", name: "Pulmonology", category: "Medicine", description: "Respiratory system, lungs, obstructive diseases, and sleep apnea.", icon: "Wind" },
  { id: "gensurg", name: "General Surgery", category: "Surgery", description: "Abdominal organs, thyroid, hernias, and emergency surgical interventions.", icon: "Scissors" },
  { id: "ortho", name: "Orthopaedics", category: "Surgery", description: "Musculoskeletal system, fracture care, joint replacement, and sports medicine.", icon: "Bone" },
  { id: "obgyn", name: "Gynaecology & Obstetrics", category: "Gynecology", description: "Female reproductive health, high-risk pregnancy, and infertility.", icon: "Sparkles" },
  { id: "pediatrics", name: "Pediatrics", category: "Pediatrics", description: "Infant, child, and adolescent healthcare, growth, and development.", icon: "Baby" },
  { id: "oncology", name: "Oncology", category: "Medicine", description: "Cancer diagnosis, chemotherapy regimens, and immunotherapies.", icon: "ShieldAlert" },
  { id: "nephro", name: "Nephrology & Dialysis", category: "Medicine", description: "Renal replacement therapy, hemodialysis, and chronic kidney disease.", icon: "Droplets" },
  { id: "derma", name: "Dermatology", category: "Diagnostics", description: "Skin disorders, melanomas, autoimmune rashes, and biopsies.", icon: "Sparkles" },
  { id: "psych", name: "Psychiatry", category: "Other", description: "Mental health disorders, pharmacotherapy, and behavioral sciences.", icon: "Brain" },
  { id: "neuro", name: "Neurology", category: "Medicine", description: "Central and peripheral nervous systems, stroke, epilepsy, and neuropathy.", icon: "Tv" },
  { id: "em", name: "Emergency Medicine", category: "Medicine", description: "Trauma resuscitation, acute cardiovascular support, and urgent triage.", icon: "Zap" }
];

export const LICENSE_EXAMS = [
  { id: "usmle1", name: "USMLE Step 1", details: "Basic medical sciences: Anatomy, Physiology, Pathology, Pharmacology, Biochemistry." },
  { id: "usmle2", name: "USMLE Step 2 CK", details: "Clinical knowledge: Internal Medicine, Surgery, OBGYN, Pediatrics, Psychiatry, Ethics." },
  { id: "usmle3", name: "USMLE Step 3", details: "Advanced clinical management, clinical case simulations (CCS), and systems-based practice." },
  { id: "fcps1", name: "FCPS Part I", details: "Specialty entry exam for the Fellowship of College of Physicians and Surgeons." },
  { id: "fcps2", name: "FCPS Part II / IMM", details: "Clinical assessments, intermediate module, and TOACS examinations." },
  { id: "frcs", name: "FRCS / MRCS", details: "Fellowship/Membership of Royal College of Surgeons clinical exams and basic sciences." },
  { id: "mrcp", name: "MRCP UK", details: "Membership of Royal College of Physicians clinical assessments (PACES) and written exams." },
  { id: "plab", name: "PLAB / UKMLA", details: "Primary licensing pathway for international medical graduates to practice in the UK." },
  { id: "amc", name: "AMC Australia", details: "Australian Medical Council MCQ and clinical stations for clinical practice registration." },
  { id: "prometric", name: "DHA / MOH / Saudi Prometric", details: "Gulf Licensing examinations for clinical excellence in UAE, Saudi Arabia, Qatar, and Oman." },
  { id: "mccqe", name: "MCCQE Canada", details: "Medical Council of Canada Qualifying Examination for licensing of physicians." },
  { id: "neetpg", name: "NEET PG / INICET", details: "Highly competitive postgraduate medical entrance examinations in India." }
];

export const PRESEEDED_MCQS: MCQ[] = [
  {
    question: "A 54-year-old female presents with progressive exertional dyspnea. She reports having a history of rheumatic fever as a child. On auscultation, a low-pitched, rumbling diastolic murmur is heard at the apex, preceded by an opening snap. What is the most likely diagnosis?",
    options: [
      "Mitral Stenosis",
      "Mitral Regurgitation",
      "Aortic Stenosis",
      "Aortic Regurgitation"
    ],
    correctAnswer: 0,
    rationale: "Mitral stenosis is classic for presenting with a low-pitched diastolic rumble heard best at the apex with the bell in the left lateral decubitus position. It is preceded by a sharp 'opening snap' which represents the tensed mitral valve leaflets snapping open under pressure. Rheumatic fever is the leading cause globally.",
    difficulty: "Medium",
    specialty: "Cardiology"
  },
  {
    question: "A 32-year-old male is brought to the emergency department after a high-impact motor vehicle accident. He is in respiratory distress. Trachea is deviated to the right, breath sounds are absent on the left, and there is hyperresonance to percussion on the left hemithorax. His BP is 80/40 mmHg. Which of the following is the immediate next step in management?",
    options: [
      "Obtain an immediate Chest X-ray",
      "Perform needle decompression in the left 2nd intercostal space",
      "Insert a left-sided chest tube (tube thoracostomy)",
      "Intubate the patient and initiate positive pressure ventilation"
    ],
    correctAnswer: 1,
    rationale: "This patient is presenting with signs of a left-sided tension pneumothorax (respiratory distress, absent breath sounds, tracheal deviation away from affected side, hypotension due to vena cava compression). It is a clinical diagnosis! Do NOT wait for a Chest X-ray. Immediate needle decompression is indicated, followed promptly by a chest tube.",
    difficulty: "Hard",
    specialty: "Emergency Medicine"
  },
  {
    question: "A 28-year-old primigravida at 34 weeks gestation presents to the triage with severe headache, blurry vision, and epigastric pain. Her blood pressure is 165/110 mmHg on two separate readings. Urinalysis shows 3+ proteinuria. Which of the following medication classes is indicated immediately to prevent seizures?",
    options: [
      "Intravenous Diazepam",
      "Intravenous Magnesium Sulfate",
      "Oral Phenytoin",
      "Intravenous Labetalol"
    ],
    correctAnswer: 1,
    rationale: "The clinical presentation is classic for preeclampsia with severe features. Seizure prophylaxis (to prevent progression to eclampsia) with intravenous Magnesium Sulfate is the first-line gold standard therapy. Antihypertensive therapy with IV Labetalol or Hydralazine is also indicated, but Magnesium Sulfate specifically targets seizure prevention.",
    difficulty: "Medium",
    specialty: "Gynaecology & Obstetrics"
  },
  {
    question: "A 4-year-old boy presents with a 3-day history of high fever, barking cough, and inspiratory stridor that is worse at night. On examination, he is mildly tachypneic but has no chest retractions. What is the most likely causative pathogen?",
    options: [
      "Respiratory Syncytial Virus (RSV)",
      "Parainfluenza Virus",
      "Haemophilus influenzae type b",
      "Streptococcus pneumoniae"
    ],
    correctAnswer: 1,
    rationale: "This presentation represents laryngotracheobronchitis (Croup), characterized by the classic triad of barking cough, stridor, and hoarseness. The most common causative agent is the Parainfluenza virus (specifically Type 1). RSV commonly causes bronchiolitis, while Haemophilus influenzae type b causes acute epiglottitis (which presents with drooling, high fever, and tripod posture, but is rare now due to vaccines).",
    difficulty: "Easy",
    specialty: "Pediatrics"
  }
];

export const VIRTUAL_PATIENTS: ClinicalCase[] = [
  {
    id: "case1",
    patientName: "Robert Miller",
    age: 58,
    gender: "Male",
    occupation: "Accountant",
    chiefComplaint: "Severe, crushing central chest pain radiating to the left arm",
    historyOfPresentIllness: "Started about 45 minutes ago while lifting a box. The pain is persistent, rated 9/10, accompanied by nausea, diaphoresis, and shortness of breath. Unrelieved by rest.",
    vitals: {
      bp: "145/92",
      hr: 98,
      rr: 22,
      temp: "37.1 °C",
      spo2: 94
    },
    physicalExam: "Diaphoretic, pale, and anxious. Lungs are clear to auscultation bilaterally. Heart rate is regular without murmurs, gallops, or rubs. Pulse volume is normal.",
    ecgOrLabSnippet: "ECG shows 3mm ST-segment elevation in leads V2, V3, and V4. Cardiac Troponin I is pending.",
    finalDiagnosis: "Acute Anterior ST-Elevation Myocardial Infarction (STEMI)",
    correctManagement: "Aspirin 325mg chewed, Clopidogrel 600mg loading dose, Heparin bolus, oxygen if SpO2 < 90%, and immediate activation of the Cardiac Catheterization Lab for Primary Percutaneous Coronary Intervention (PCI) within 90 minutes."
  },
  {
    id: "case2",
    patientName: "Sarah Jenkins",
    age: 34,
    gender: "Female",
    occupation: "School Teacher",
    chiefComplaint: "Sudden onset of sharp right-sided pleuritic chest pain and shortness of breath",
    historyOfPresentIllness: "Presents with acute dyspnea starting 2 hours ago. Pain worsens on deep inspiration. She recently returned from a 14-hour trans-atlantic flight. She takes oral contraceptive pills.",
    vitals: {
      bp: "118/76",
      hr: 112,
      rr: 26,
      temp: "37.4 °C",
      spo2: 89
    },
    physicalExam: "Tachypneic, mildly tachycardic. Mild swelling and tenderness noted on the left calf. Chest auscultation shows clear lung fields bilaterally.",
    ecgOrLabSnippet: "ECG shows Sinus Tachycardia with an S1Q3T3 pattern (prominent S wave in lead I, Q wave in lead III, inverted T wave in lead III).",
    finalDiagnosis: "Acute Pulmonary Embolism (PE)",
    correctManagement: "Immediate supplemental oxygen, IV access, CT Pulmonary Angiography (CTPA) for definitive diagnosis, and prompt initiation of therapeutic anticoagulation (e.g., Low Molecular Weight Heparin or Unfractionated Heparin) if no major contraindications."
  }
];

export const RESEARCH_COURSES: ResearchCourse[] = [
  {
    id: "res1",
    title: "Introduction to Medical Research & Ethics",
    category: "Fundamentals",
    duration: "4 weeks",
    lessonsCount: 8,
    description: "Learn how to formulate a research question, conduct systematic literature searches, apply for Institutional Review Board (IRB) approval, and understand the Helsinki Declaration.",
    outline: [
      "Defining the Research Question (PICO framework)",
      "Literature Search Strategy (PubMed, Embase, Cochrane)",
      "Research Designs: Observational vs. Experimental",
      "Ethical Conduct: Informed Consent and Clinical Registry Requirements",
      "IRB Application Writing and Common Rejections",
      "Declaration of Helsinki and ICH-GCP Guidelines",
      "Intellectual Property and Co-authorship Criteria",
      "Scientific Integrity: Avoiding Plagiarism and Fabrication"
    ],
    isPremium: false
  },
  {
    id: "res2",
    title: "Clinical Biostatistics with SPSS & R",
    category: "Biostatistics",
    duration: "6 weeks",
    lessonsCount: 12,
    description: "Master descriptive statistics, hypothesis testing, t-tests, ANOVA, Chi-Square, Cox regression, survival analysis, and plotting publication-grade Kaplan-Meier curves.",
    outline: [
      "Data Types, Distributions, and Normality Testing",
      "Parametric vs. Non-parametric Hypothesis Tests",
      "Student's T-Test and ANOVA with Post-Hoc Analysis",
      "Chi-Square and Fisher's Exact Tests for Proportions",
      "Correlation vs. Linear Regression Modeling",
      "Logistic Regression for Binary Clinical Outcomes",
      "Survival Analysis: Kaplan-Meier Curves & Log-Rank Test",
      "Cox Proportional Hazards Regression",
      "Introduction to R-Studio: Loading Data and Basic Syntax",
      "Data Visualization with ggplot2 in R",
      "Interpreting SPSS Outputs for Clinical Manuscripts",
      "Power Analysis and Sample Size Calculation using G*Power"
    ],
    isPremium: true
  },
  {
    id: "res3",
    title: "Scientific Manuscript Writing & Publishing",
    category: "Writing",
    duration: "4 weeks",
    lessonsCount: 6,
    description: "A step-by-step masterclass on writing high-impact Introductions, Methods, Results, and Discussions (IMRAD), choosing the right journal, and navigating peer review.",
    outline: [
      "The Anatomy of an Outstanding Clinical Paper",
      "Writing the Abstract and Selecting Index Keywords",
      "Drafting the Introduction: Defining the Knowledge Gap",
      "The Methods Section: Ensuring Reproducibility",
      "Presenting Results: Effective Use of Tables and Figures",
      "Writing the Discussion: Putting Findings in Global Context",
      "Selecting the Target Journal: Impact Factor vs. Open Access",
      "Responding to Peer Reviewer Comments Professionally"
    ],
    isPremium: true
  },
  {
    id: "res4",
    title: "Systematic Reviews & Meta-Analysis Masterclass",
    category: "Advanced",
    duration: "5 weeks",
    lessonsCount: 10,
    description: "Conduct systematic reviews using PRISMA guidelines, perform pool-estimate meta-analyses, construct Forest plots, assess heterogeneity, and evaluate publication bias.",
    outline: [
      "PROSPERO Registry Registration Protocols",
      "PRISMA Guidelines & Study Selection Flowcharting",
      "Data Extraction Templates & Quality Appraisal (Cochrane Risk of Bias)",
      "Fixed-Effects vs. Random-Effects Pooling Models",
      "Interpreting Forest Plots and Diamond Estimates",
      "Assessing Heterogeneity: Cochran's Q and I-squared (I²) Statistics",
      "Subgroup and Meta-regression Analyses",
      "Publication Bias: Funnel Plots, Egger's and Begg's Tests",
      "Using RevMan and Stata for Systematic Reviews",
      "Writing the Meta-analysis Manuscript"
    ],
    isPremium: true
  }
];

export const PRESEEDED_DRUGS: DrugProfile[] = [
  {
    genericName: "Metformin Hydrochloride",
    brandName: "Glucophage, Fortamet, Glumetza",
    manufacturer: "Merck, Bristol-Myers Squibb, Teva",
    drugClass: "Biguanide Oral Antidiabetic",
    indications: "First-line pharmacological agent for the treatment of Type 2 Diabetes Mellitus, particularly in overweight individuals; off-label for Polycystic Ovary Syndrome (PCOS).",
    contraindications: "Severe renal impairment (eGFR < 30 mL/min/1.73m²), acute or chronic metabolic acidosis (including diabetic ketoacidosis), and conditions predisposing to tissue hypoxia (e.g., unstable congestive heart failure).",
    sideEffects: "Gastrointestinal disturbances (nausea, diarrhea, abdominal cramps - highly common), metallic taste, Vitamin B12 deficiency (long-term use), and lactic acidosis (rare but life-threatening).",
    drugInteractions: "Iodinated contrast media (withhold Metformin before/during procedure due to acute renal injury risk), Cimetidine (increases metformin exposure).",
    dosage: "Initial: 500 mg orally twice daily or 850 mg once daily with meals. Max: 2500 mg daily in divided doses. Adjust or discontinue if eGFR drops below 45.",
    pregnancyCategory: "Category B (generally considered safe, but insulin remains preferred first-line during pregnancy).",
    lactationSafety: "Excreted in small amounts in breast milk; compatible with breastfeeding with caution.",
    fdaStatus: "Approved"
  },
  {
    genericName: "Empagliflozin",
    brandName: "Jardiance",
    manufacturer: "Boehringer Ingelheim, Eli Lilly",
    drugClass: "Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor",
    indications: "Adjunct to diet and exercise to improve glycemic control in type 2 diabetes; reduction of CV death in adults with type 2 diabetes and cardiovascular disease; treatment of chronic heart failure (with both reduced and preserved ejection fraction).",
    contraindications: "Hypersensitivity, severe renal impairment (eGFR < 20 mL/min/1.73m²), end-stage renal disease, or patients on dialysis.",
    sideEffects: "Urinary tract infections (UTIs), vulvovaginal candidiasis, increased urination (osmotic diuresis), volume depletion, acute kidney injury risk, euglycemic diabetic ketoacidosis (DKA).",
    drugInteractions: "Diuretics (increases risk of severe hypotension and dehydration), insulin/insulin secretagogues (increased hypoglycemia risk).",
    dosage: "10 mg orally once daily in the morning with or without food. Can be increased to 25 mg daily if tolerated and further glycemic control is required.",
    pregnancyCategory: "Category C (avoid during the second and third trimesters due to potential renal damage to the fetus).",
    lactationSafety: "Not recommended during breastfeeding.",
    fdaStatus: "Approved"
  },
  {
    genericName: "Atorvastatin Calcium",
    brandName: "Lipitor",
    manufacturer: "Pfizer, Viatris",
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    indications: "Hypercholesterolemia to reduce total cholesterol, LDL-C, ApoB, and triglycerides; prevention of cardiovascular disease in patients at high risk (primary and secondary prevention).",
    contraindications: "Active liver disease, unexplained persistent elevations of transaminases, hypersensitivity, pregnancy, and lactation.",
    sideEffects: "Myalgia (muscle pain), headache, mild elevation of liver transaminases, rhabdomyolysis (rare but severe muscle breakdown), and small increase in HbA1c/fasting glucose.",
    drugInteractions: "Strong CYP3A4 inhibitors (e.g., Ketoconazole, Clarithromycin, HIV protease inhibitors) significantly increase risk of myopathy; Gemfibrozil should be avoided.",
    dosage: "10 mg to 80 mg orally once daily at any time of day, with or without food.",
    pregnancyCategory: "Category X (strictly contraindicated; essential for fetal development).",
    lactationSafety: "Contraindicated during breastfeeding.",
    fdaStatus: "Approved"
  },
  {
    genericName: "Amoxicillin-Clavulanate Potassium",
    brandName: "Augmentin, Amoclan",
    manufacturer: "GlaxoSmithKline, Sandoz",
    drugClass: "Beta-lactam Antibiotic + Beta-lactamase Inhibitor",
    indications: "Lower respiratory tract infections, acute otitis media, sinusitis, skin and soft tissue infections, and urinary tract infections caused by beta-lactamase-producing bacteria.",
    contraindications: "History of cholestatic jaundice or hepatic dysfunction associated with previous Augmentin use; severe hypersensitivity to penicillin or other beta-lactams.",
    sideEffects: "Diarrhea (highly common), nausea, vomiting, skin rashes (urticaria, macular rash), oral thrush, and drug-induced cholestatic liver injury.",
    drugInteractions: "Allopurinol (increases risk of skin rash), Oral Contraceptives (may slightly decrease effectiveness), Probenecid (increases amoxicillin serum levels).",
    dosage: "Standard adult: 500 mg/125 mg three times daily or 875 mg/125 mg twice daily. Dosage adjusted based on renal function.",
    pregnancyCategory: "Category B (considered safe for use during pregnancy when indicated).",
    lactationSafety: "Excreted in low levels in breast milk; compatible with breastfeeding but monitor infant for rash or diarrhea.",
    fdaStatus: "Approved"
  }
];

export const DICTIONARY_TERMS: MedicalTerm[] = [
  {
    term: "Anaphylaxis",
    pronunciation: "an-uh-fuh-LAK-sis",
    definition: "A severe, potentially life-threatening systemic allergic reaction that occurs rapidly (seconds to minutes) after exposure to an allergen.",
    clinicalSignificance: "Requires immediate administration of intramuscular Epinephrine (Adrenaline) in the anterolateral thigh, aggressive IV airway stabilization, and volume resuscitation. Delay in epinephrine is the leading cause of death.",
    category: "Immunology"
  },
  {
    term: "Rhabdomyolysis",
    pronunciation: "rab-doe-my-AHL-eh-sis",
    definition: "The rapid breakdown of skeletal muscle tissue, leading to the release of intracellular muscle constituents (such as myoglobin, potassium, and creatine kinase) into the systemic circulation.",
    clinicalSignificance: "Myoglobin is nephrotoxic, leading to Acute Tubular Necrosis (ATN) and Acute Kidney Injury. Classic triad is muscle pain, weakness, and dark tea-colored urine. Treat with aggressive IV isotonic saline hydration to preserve urine output.",
    category: "Emergency Medicine"
  },
  {
    term: "Pneumothorax",
    pronunciation: "noo-moe-THOR-aks",
    definition: "The abnormal presence of air or gas in the pleural cavity between the lung and the chest wall, which destroys the negative intrapleural pressure and causes partial or complete lung collapse.",
    clinicalSignificance: "Can progress to a life-threatening tension pneumothorax where shifting mediastinal structures compress the vena cava, reducing venous return and causing obstructive shock. Decompress immediately.",
    category: "Pulmonology"
  },
  {
    term: "Preeclampsia",
    pronunciation: "pree-ee-KLAMP-see-uh",
    definition: "A multisystem pregnancy disorder characterized by the new onset of hypertension (systolic BP ≥ 140 mmHg or diastolic BP ≥ 90 mmHg) and either proteinuria or end-organ dysfunction after 20 weeks of gestation.",
    clinicalSignificance: "Left untreated, it can lead to maternal stroke, hepatic rupture (HELLP syndrome), placental abruption, and fatal seizures (eclampsia). Delivery of the placenta is the definitive cure.",
    category: "Gynaecology & Obstetrics"
  }
];

export const MEDICAL_NEWS: NewsArticle[] = [
  {
    id: "news1",
    title: "FDA Approves New SGLT2 Inhibitor Combination for Dual Renal and Heart Failure Protection",
    source: "FDA Newsroom",
    date: "June 15, 2026",
    category: "FDA Approval",
    snippet: "The FDA has granted accelerated approval for a new fixed-dose oral combination pill targeting diabetic kidney disease progression and severe HFpEF hospitalizations.",
    content: "The US Food and Drug Administration (FDA) has approved a landmark combined formulation of SGLT2 inhibitor and advanced aldosterone antagonist for adults with type 2 diabetes and stage 3 chronic kidney disease. Clinical trials showed a 32% reduction in the combined risk of cardiovascular death and sustained eGFR decline compared to previous monotherapy guidelines. This marks a paradigm shift in cardio-renal protection paradigms."
  },
  {
    id: "news2",
    title: "WHO Releases Updated Guidelines on Antibiotic Stewardship for Respiratory Infections in Rural Areas",
    source: "World Health Organization",
    date: "May 28, 2026",
    category: "WHO Guidelines",
    snippet: "New global guidelines focus on combatting antimicrobial resistance (AMR) in community-acquired pneumonia using diagnostic algorithms.",
    content: "The World Health Organization (WHO) has published its 2026 update on antibiotic stewardship. Key highlights include the restriction of broad-spectrum fluoroquinolones as first-line empiric therapy for mild community-acquired respiratory infections, recommending narrow-spectrum alternatives instead. The framework aims to reduce multi-drug resistant Streptococcus pneumoniae strains by 15% globally over the next three years."
  },
  {
    id: "news3",
    title: "Machine Learning Model Predicts Early Sepsis Resuscitation Failure 4 Hours Before Shock",
    source: "Nature Medicine Journal",
    date: "April 12, 2026",
    category: "Tech Update",
    snippet: "A new deep learning algorithm trained on 500,000 ICU records outperforms traditional SOFA and APACHE scores in real-time prediction.",
    content: "Researchers have published a multi-center study showcasing an AI-driven warning tool for clinical sepsis. By analyzing continuous arterial line waveforms, pulse-oximetry fluctuations, and urine output trends in real-time, the model successfully predicts resuscitation failure and oncoming refractory shock 4.2 hours before conventional clinical markers flag deterioration. Implementation decreased overall ICU mortality by 8% in pilot hospitals."
  }
];

export const SUBSCRIPTION_MODELS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free Plan",
    price: "$0",
    period: "forever",
    features: [
      "Access to basic MCQ questions (20/day)",
      "Daily Medical News Portal feed",
      "Search the Medical Dictionary",
      "Explore standard Drug Information Center"
    ],
    badgeColor: "bg-gray-100 text-gray-800"
  },
  {
    id: "student",
    name: "Student Plan",
    price: "$19",
    period: "month",
    features: [
      "Access to full Question Banks (50,000+ MCQs)",
      "USMLE, PLAB & NEET PG special modules",
      "Interactive Virtual Patients (OSCE)",
      "AI Medical Tutor standard support",
      "Verified course completion digital certificates"
    ],
    badgeColor: "bg-blue-100 text-blue-800 border border-blue-200"
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "$39",
    period: "month",
    features: [
      "Specialist preparation (FCPS, FRCS, MRCP, MRCS, MD/MS)",
      "All Research Academy courses included",
      "Unlimited AI Medical Tutor & Research Assistant calls",
      "AI Exam Coach personalized weakness feedback",
      "Digital certificates with QR & Blockchain validation badges"
    ],
    badgeColor: "bg-teal-100 text-teal-800 border border-teal-200 font-semibold"
  },
  {
    id: "institution",
    name: "Institution Plan",
    price: "$299",
    period: "month",
    features: [
      "For Medical Universities, Hospitals & Private Colleges",
      "Supervised faculty dashboards to create exams",
      "Student progress and score analytics trackers",
      "Custom brand LMS portal & enterprise-grade API",
      "Full compliance with HIPAA & GDPR security standards"
    ],
    badgeColor: "bg-purple-100 text-purple-800 border border-purple-200"
  }
];

export const PRESEEDED_CERTIFICATES: Certificate[] = [
  {
    id: "cert1",
    courseTitle: "Introduction to Medical Research & Ethics",
    issuedTo: "Dr. Imran Ahmed, MBBS",
    issueDate: "June 20, 2026",
    verificationId: "MGA-88349-XYZ",
    qrCodeValue: "https://medglobal-academy.org/verify/MGA-88349-XYZ"
  },
  {
    id: "cert2",
    courseTitle: "Clinical Biostatistics with SPSS & R",
    issuedTo: "Dr. Imran Ahmed, MBBS",
    issueDate: "June 22, 2026",
    verificationId: "MGA-99412-ABC",
    qrCodeValue: "https://medglobal-academy.org/verify/MGA-99412-ABC"
  }
];
