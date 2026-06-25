import { MCQ } from "../types";

export interface ExtendedMCQ extends MCQ {
  id: string;
  examName: string;
  subject: string;
  topic: string;
  questionType: string;
  clinicalPearl: string;
  learningObjective: string;
  references: string;
  keywords: string[];
  clinicalCaseDetails?: {
    history: string;
    physicalExam: string;
    labs: string;
    radiology: string;
    differentialDiagnosis: string;
    finalDiagnosis: string;
    managementPlan: string;
  };
  imageGuidance?: {
    type: string;
    description: string;
  };
}

export const CARDIOLOGY_USMLE1_Q_BANK: ExtendedMCQ[] = [
  {
    id: "Q-CARD-001",
    examName: "USMLE Step 1",
    specialty: "Cardiology",
    subject: "Internal Medicine / Pathophysiology",
    topic: "Aortic Stenosis",
    difficulty: "Medium",
    questionType: "Clinical Case",
    question: "A 68-year-old male presents with progressive exertional dyspnea, lightheadedness, and occasional chest pressure over the last six months. Physical examination reveals a harsh, crescendo-decrescendo systolic murmur heard best at the right second intercostal space, radiating to the carotid arteries. His carotid pulse is noted to be weak and delayed (pulsus parvus et tardus). Which of the following pathophysiological adaptations is most likely occurring in this patient's myocardium to maintain stroke volume?",
    options: [
      "Eccentric left ventricular hypertrophy",
      "Concentric left ventricular hypertrophy",
      "Concentric right ventricular hypertrophy",
      "Eccentric right ventricular hypertrophy"
    ],
    correctAnswer: 1,
    rationale: "Concentric left ventricular hypertrophy (LVH) is the classic compensatory adaptation to chronic pressure overload, such as that caused by aortic stenosis (AS). In concentric hypertrophy, sarcomeres are added in parallel, increasing ventricular wall thickness without dilating the chamber volume. This adaptation reduces wall stress according to Laplace's Law (Wall Stress = Pressure × Radius / (2 × Thickness)) to maintain ejection fraction. Eccentric hypertrophy occurs in volume overload states (e.g., aortic/mitral regurgitation) where sarcomeres are added in series, leading to chamber dilation.",
    clinicalPearl: "The classic clinical triad of symptomatic severe aortic stenosis is Sad: Syncope, Angina, and Dyspnea. Auscultation reveals a crescendo-decrescendo systolic murmur with radiation to the carotids and an opening click or soft S2.",
    learningObjective: "Describe the cardiac pathophysiological remodeling (concentric vs. eccentric hypertrophy) associated with pressure-overload versus volume-overload states.",
    references: "AHA/ACC Guidelines for the Management of Patients with Valvular Heart Disease; Robbins and Cotran Pathologic Basis of Disease.",
    keywords: ["Aortic Stenosis", "Concentric Hypertrophy", "Pulsus Parvus et Tardus", "Laplace Law", "Pressure Overload"],
    clinicalCaseDetails: {
      history: "68-year-old retired accountant presents with 6 months of air hunger when walking up stairs, intermittent dull chest pain on exertion, and near-syncopal episodes when standing up rapidly.",
      physicalExam: "BP 112/88 mmHg, HR 78 bpm. Harsh grade 3/6 systolic ejection murmur best heard at the base with radiation to carotids bilaterally. Delayed upstroke in carotid pulses (pulsus parvus et tardus).",
      labs: "Normal serum electrolytes, Troponin I negative (< 0.01 ng/mL), BNP mildly elevated at 145 pg/mL.",
      radiology: "Transthoracic echocardiogram reveals calcified trileaflet aortic valve with a mean gradient of 48 mmHg, peak velocity of 4.2 m/s, aortic valve area of 0.7 cm², and concentric left ventricular hypertrophy (LV wall thickness 1.4 cm) with preserved EF (55%).",
      differentialDiagnosis: "Aortic Stenosis, Hypertrophic Obstructive Cardiomyopathy (HOCM), Mitral Regurgitation, Coronary Artery Disease.",
      finalDiagnosis: "Severe Calcific Degenerative Aortic Stenosis",
      managementPlan: "Referral for surgical aortic valve replacement (SAVR) or transcatheter aortic valve replacement (TAVR) given symptomatic status. Avoid high-dose vasodilators or diuretics as cardiac output is preload-dependent."
    },
    imageGuidance: {
      type: "Echocardiogram / Chest X-ray",
      description: "Transthoracic echocardiogram (parasternal long axis view) showing severe calcification of the aortic valve cusps with significant restriction of motion and prominent concentric thickening of the interventricular septum and left ventricular posterior wall."
    }
  },
  {
    id: "Q-CARD-002",
    examName: "USMLE Step 1",
    specialty: "Cardiology",
    subject: "Internal Medicine / Pharmacology",
    topic: "Digoxin Toxicity",
    difficulty: "Hard",
    questionType: "Single Best Answer",
    question: "A 72-year-old female with a history of chronic heart failure and atrial fibrillation is brought to the emergency department complaining of generalized fatigue, nausea, abdominal discomfort, and 'yellow-green halos' in her vision. Her current medications include digoxin, furosemide, lisinopril, and metoprolol. An ECG shows sinus bradycardia with a prolonged PR interval, frequent premature ventricular contractions (PVCs), and scooped ST segments. Which of the following electrolyte disturbances most significantly predisposes this patient to her current condition?",
    options: [
      "Hyperkalemia",
      "Hypokalemia",
      "Hypernatremia",
      "Hyponatremia"
    ],
    correctAnswer: 1,
    rationale: "Hypokalemia (often induced by loop diuretics like furosemide) significantly enhances digoxin binding to the Na+/K+-ATPase pump, dramatically increasing the risk of digoxin toxicity even at borderline therapeutic serum levels. Digoxin works by reversibly inhibiting the Na+/K+-ATPase, which increases intracellular sodium, thereby slowing the Na+/Ca2+ exchanger and accumulating intracellular calcium to enhance inotropy. Since potassium competes with digoxin for the Na+/K+-ATPase binding site, low extracellular potassium concentrations increase digoxin's inhibitory potency.",
    clinicalPearl: "Furosemide is potassium-wasting. Always monitor serum potassium levels closely in patients co-prescribed loop diuretics and digoxin to prevent life-threatening ventricular arrhythmias, which are heralded by visual changes (xanthopsia) and gastrointestinal upset.",
    learningObjective: "Understand the biochemical mechanism of Na+/K+-ATPase inhibition by cardiac glycosides and the competitive interaction with potassium ions.",
    references: "Katzung Basic & Clinical Pharmacology; ACCF/AHA Guidelines for the Diagnosis and Management of Heart Failure.",
    keywords: ["Digoxin Toxicity", "Na+/K+-ATPase", "Hypokalemia", "Furosemide", "Xanthopsia", "PVCs"],
    clinicalCaseDetails: {
      history: "72-year-old female presents with severe loss of appetite, nausea, vomiting, confusion, and seeing yellow rings around light bulbs for the past 48 hours. Has been taking her heart medications regularly.",
      physicalExam: "BP 102/60 mmHg, HR 46 bpm (irregularly irregular rhythm with bradycardic rate). Confused but cooperative. No peripheral edema.",
      labs: "Serum potassium 2.9 mEq/L (low), Creatinine 1.8 mg/dL (baseline 0.9), Digoxin level 2.8 ng/mL (toxic range > 2.0).",
      radiology: "ECG confirms atrial fibrillation with slow ventricular response, frequent multi-focal PVCs, and diffuse downsloping ST-segment depression resembling a 'reverse tick' or 'Salvador Dali mustache'.",
      differentialDiagnosis: "Digoxin Toxicity, Furosemide-induced severe hypokalemia, Beta-blocker overdose, Uremic encephalopathy.",
      finalDiagnosis: "Acute-on-Chronic Digoxin Toxicity precipitated by Furosemide-induced Hypokalemia and Renal Insufficiency",
      managementPlan: "Discontinue digoxin and loop diuretics immediately. Infuse intravenous potassium to restore levels to high-normal (4.5-5.0 mEq/L) if renal function permits. In cases of hemodynamic instability or malignant ventricular tachyarrhythmias, administer Digoxin-specific antibody fragments (Digibind/Digifab)."
    },
    imageGuidance: {
      type: "ECG Strip",
      description: "ECG tracing showing sinus bradycardia with characteristic downsloping, scooped ST-segment depressions ('reverse tick' mark) in the lateral leads, and frequent premature ventricular contractions in a bigeminal pattern."
    }
  },
  {
    id: "Q-CARD-003",
    examName: "USMLE Step 1",
    specialty: "Cardiology",
    subject: "Internal Medicine / Embryology",
    topic: "Tetralogy of Fallot",
    difficulty: "Hard",
    questionType: "Clinical Case",
    question: "A 6-month-old infant is brought to the pediatrician by his mother, who reports that the child turns blue around the lips and fingertips during feeding and crying episodes. During these episodes, the infant instinctively flexes his knees toward his chest, which seems to improve his breathing and color. On cardiac auscultation, a harsh, single S2 and a grade 3/6 crescendo-decrescendo systolic ejection murmur are heard at the left mid-to-upper sternal border. Which of the following embryological anomalies is the primary cause of this condition?",
    options: [
      "Failure of the septum primum and septum secundum to fuse",
      "Abnormal neural crest migration resulting in anterior-superior deviation of the infundibular septum",
      "Incomplete closure of the interventricular foramen",
      "Persistent truncus arteriosus with lack of aorticopulmonary partitioning"
    ],
    correctAnswer: 1,
    rationale: "The infant is presenting with Tetralogy of Fallot (TOF) experiencing a hypercyanotic 'tet spell.' TOF is caused embryologically by abnormal neural crest cell migration leading to anterior-superior division and displacement of the infundibular (conotruncal) septum. This single developmental defect results in the classic tetrad: (1) Pulmonary stenosis / infundibular obstruction, (2) Right ventricular hypertrophy (RVH) resulting from pressure overload, (3) Overriding aorta, and (4) Large membranous Ventricular Septal Defect (VSD). Squatting or bringing knees to the chest increases systemic vascular resistance (SVR), which elevates left ventricular pressure and reverses the right-to-left shunt, forcing more blood through the stenotic pulmonary artery to improve oxygenation.",
    clinicalPearl: "The boot-shaped heart (coeur en sabot) on chest X-ray represents right ventricular hypertrophy with an upturned cardiac apex, coupled with a small main pulmonary artery segment.",
    learningObjective: "Correlate conotruncal septal displacement with the clinical and physical examination findings of Tetralogy of Fallot, and explain the hemodynamics of tet spells.",
    references: "Langman's Medical Embryology; First Aid for the USMLE Step 1.",
    keywords: ["Tetralogy of Fallot", "Infundibular Septum", "Neural Crest Migration", "Tet Spell", "Right-to-Left Shunt", "Squatting"],
    clinicalCaseDetails: {
      history: "6-month-old male infant presents with episodes of circumoral cyanosis, rapid breathing, and irritability during feeding. Mother notices that pulling the baby's legs up toward his chest resolves the episodes.",
      physicalExam: "SpO2 84% on room air during quiet state, dropping to 65% during crying episode. Weight is in the 15th percentile. Prominent parasternal heave. Harsh 3/6 ejection murmur at left upper sternal border. Single S2.",
      labs: "Hemoglobin 16.5 g/dL, Hematocrit 51% (secondary erythrocytosis due to chronic hypoxemia).",
      radiology: "Chest radiograph demonstrates normal lung fields with diminished vascular markings, a narrow mediastinal pedicle, and a boot-shaped heart contour with a concave pulmonary segment.",
      differentialDiagnosis: "Tetralogy of Fallot, Transposition of the Great Arteries, Tricuspid Atresia, Total Anomalous Pulmonary Venous Return.",
      finalDiagnosis: "Tetralogy of Fallot (Classic)",
      managementPlan: "Management of acute tet spell includes high-flow supplemental oxygen, knee-chest positioning to increase SVR, intravenous morphine to relax infundibular spasm, and IV fluids to expand volume. Plan for surgical correction (VSD closure and patch relief of right ventricular outflow tract obstruction) between 4 to 6 months of age."
    },
    imageGuidance: {
      type: "Chest X-ray",
      description: "Anteroposterior chest radiograph of an infant showcasing a classic 'boot-shaped' heart silhouette characterized by an upturned, rounded apex secondary to right ventricular hypertrophy, alongside a prominent pulmonary notch and clear, under-perfused lung fields."
    }
  },
  {
    id: "Q-CARD-004",
    examName: "USMLE Step 1",
    specialty: "Cardiology",
    subject: "Internal Medicine / Pathology",
    topic: "Hypertrophic Obstructive Cardiomyopathy",
    difficulty: "Hard",
    questionType: "Clinical Case",
    question: "An 18-year-old high school basketball player suddenly collapses during a game. CPR is initiated immediately, but the patient is pronounced dead in the emergency department. Family history reveals that his father also died suddenly at the age of 32. Autopsy of the heart is most likely to show which of the following histological features?",
    options: [
      "Myocardial infiltration by eosinophils and Charcot-Leyden crystals",
      "Myocyte hypertrophy with marked disarray and interstitial fibrosis",
      "Diffuse amyloid plaques staining apple-green under polarized light",
      "Dilated chambers with replacement of myocardium by fibrofatty tissue"
    ],
    correctAnswer: 1,
    rationale: "This presentation is highly characteristic of Hypertrophic Obstructive Cardiomyopathy (HOCM), which is the most common cause of sudden cardiac death (SCD) in young athletes. HOCM is an autosomal dominant genetic disorder caused by mutations in genes encoding sarcomeric proteins, most commonly the beta-myosin heavy chain or myosin-binding protein C. Histologically, it is defined by marked myocyte hypertrophy, myofibrillar disarray (myocytes running in chaotic, non-parallel patterns), and extensive interstitial collagen deposition/fibrosis.",
    clinicalPearl: "The murmur of HOCM is a harsh systolic ejection murmur that *increases* in intensity with maneuvers that decrease preload (like standing or Valsalva) because a smaller LV chamber worsens the dynamic left ventricular outflow tract (LVOT) obstruction.",
    learningObjective: "Identify the inheritance pattern, molecular genetic etiology, histological hallmarks, and hemodynamic characteristics of hypertrophic obstructive cardiomyopathy.",
    references: "Robbins & Cotran Pathologic Basis of Disease; Maron BJ et al. ACC/AHA Guidelines for Hypertrophic Cardiomyopathy.",
    keywords: ["HOCM", "Beta-Myosin Heavy Chain", "Myofibrillar Disarray", "Sudden Cardiac Death", "Valsalva Murmur"],
    clinicalCaseDetails: {
      history: "18-year-old elite high school athlete collapses during high-intensity training. No prodromal chest pain, palpitations, or lightheadedness were reported. Father died suddenly while jogging at a young age.",
      physicalExam: "Post-mortem evaluation. Prior clinical exam records noted a grade 2/6 systolic ejection murmur at the left lower sternal border that increased with standing and decreased with handgrip.",
      labs: "Toxicology screen negative. Genetic testing (post-mortem) reveals a heterozygous missense mutation in the MYH7 gene.",
      radiology: "Autopsy reveals asymmetric septal hypertrophy (septum-to-lateral wall ratio of 1.7) with a thickened anterior mitral leaflet showing a 'contact plaque' where it meets the hypertrophied septum.",
      differentialDiagnosis: "Hypertrophic Cardiomyopathy, Arrhythmogenic Right Ventricular Cardiomyopathy (ARVC), Myocarditis, Anomalous Coronary Artery Origin.",
      finalDiagnosis: "Hypertrophic Obstructive Cardiomyopathy (HOCM) leading to Lethal Ventricular Fibrillation",
      managementPlan: "Post-mortem family counseling. First-degree relatives must undergo clinical screening with annual echocardiograms and ECGs, as well as targeted genetic testing. Symptomatic individuals are managed with beta-blockers or non-dihydropyridine calcium channel blockers to prolong diastole and decrease contractility."
    },
    imageGuidance: {
      type: "Histopathology Slide",
      description: "H&E stained slide of the interventricular septal myocardium showing prominent cardiac myocytes with enlarged, hyperchromatic, bizarrely shaped nuclei, marked cellular enlargement, disorganized branching networks (disarray), and increased pink collagen fibers in the interstitial spaces."
    }
  }
];
