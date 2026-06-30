import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Globe,
  Compass,
  BookOpen,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  Heart,
  Target,
  TrendingUp,
  MapPin,
  UserCheck,
  Timer,
  Check,
  Play,
  Volume2,
  Lock,
  MessageSquare,
  Flame,
  Zap,
  BookMarked,
  Sliders,
  Sparkle,
  AlertTriangle,
  Database,
  Search,
  Stethoscope,
  Users,
  ChevronDown,
  Plus,
  X,
  Filter,
  BarChart3,
  Layers,
  Calendar,
  Send,
  HelpCircle,
  FileText,
  TrendingDown,
  Info,
  Award as Trophy
} from "lucide-react";

interface MedGlobalLandingProps {
  onStartSignUp: () => void;
  onInstantLogin: (role: string) => void;
  readingTheme: "light" | "sepia" | "dark";
  setReadingTheme: (theme: "light" | "sepia" | "dark") => void;
}

// SIMULATION PATIENT CASES (High-Fidelity Medical Vignettes)
interface PatientCase {
  id: string;
  title: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  history: string;
  specialty: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    temp: string;
    spo2: number;
  };
  ecgType: "Normal" | "Bradycardia" | "Tachycardia" | "Arrythmia";
  availableTests: { id: string; name: string; cost: string; time: string; result: string; isCorrect: boolean }[];
  treatments: { id: string; name: string; description: string; isCorrect: boolean; feedback: string }[];
  diagnosisOptions: string[];
  correctDiagnosis: string;
  boardTakeaway: string;
  pathophysiology: string;
}

const CLINICAL_CASES: PatientCase[] = [
  {
    id: "case-1",
    title: "Saddled Crises: Acute Onset Tearing Chest Pain",
    name: "Harold Vance",
    age: 54,
    gender: "Male",
    chiefComplaint: "Sudden-onset, tearing chest pain radiating intensely to his shoulder blades.",
    history: "Longstanding uncontrolled hypertension. History of heavy smoking. Patient describes the pain as the 'worst pain of his life'. Blood pressure is markedly different between limbs.",
    specialty: "Cardiothoracic Emergencies",
    vitals: { hr: 104, bp: "185/110", rr: 24, temp: "37.1 °C", spo2: 97 },
    ecgType: "Tachycardia",
    availableTests: [
      { id: "test-ecg", name: "12-Lead ECG", cost: "$150", time: "2 mins", result: "Sinus tachycardia at 104 bpm. No ST-segment elevations or Q waves.", isCorrect: true },
      { id: "test-trop", name: "Cardiac Troponin I", cost: "$220", time: "15 mins", result: "Troponin I is within normal physiological limits (0.02 ng/mL).", isCorrect: true },
      { id: "test-cxr", name: "Portable Chest X-Ray", cost: "$300", time: "10 mins", result: "Marked widening of the superior mediastinum and displacement of aortic calcification.", isCorrect: true },
      { id: "test-ctpa", name: "Aortic CT Angiography", cost: "$1200", time: "30 mins", result: "Intimal flap starting in ascending aorta extending distally. Confirms Stanford Type A Aortic Dissection.", isCorrect: true }
    ],
    treatments: [
      { id: "tx-alteplase", name: "Thrombolytic Therapy (Alteplase)", description: "Administer fibrinolytic agent to dissolve potential clots.", isCorrect: false, feedback: "🚨 CATASTROPHIC CHOICE: Thrombolysis in an acute aortic dissection triggers massive uncontrollable hemorrhage. The patient goes into acute hypovolemic cardiac arrest!" },
      { id: "tx-esmolol", name: "IV Beta-Blocker (Esmolol)", description: "Reduce shear stress by rapidly lowering heart rate and blood pressure.", isCorrect: true, feedback: "✅ CLINICAL GOLD STANDARD: Intravenous Esmolol rapidly controls dP/dt, lowering HR to <60 bpm and systolic BP to 110 mmHg, protecting the aorta from catastrophic rupture prior to surgery." },
      { id: "tx-aspirin", name: "High-Dose Aspirin & Heparin", description: "Standard acute coronary syndrome protocol.", isCorrect: false, feedback: "❌ CONTRAINDICATED: Anticoagulating a patient with an active dissection worsens internal dissection progression. Avoid antiplatelets/anticoagulants immediately." },
      { id: "tx-nitro", name: "IV Nitroprusside Alone", description: "Administer vasodilator directly to lower extreme blood pressure.", isCorrect: false, feedback: "⚠️ WARNING: Vasodilators alone cause reflex sympathetic tachycardia, increasing shear stress on the aortic wall. Always administer beta-blockers *before* vasodilators!" }
    ],
    diagnosisOptions: [
      "Stanford Type A Aortic Dissection",
      "Acute ST-Elevation Myocardial Infarction",
      "Massive Saddle Pulmonary Embolism",
      "Acute Pericarditis with Tamponade"
    ],
    correctDiagnosis: "Stanford Type A Aortic Dissection",
    boardTakeaway: "In patients with acute chest pain and a widened mediastinum, think Aortic Dissection. ALWAYS control dP/dt (shear stress) using short-acting IV beta-blockers (Esmolol) BEFORE descending into vasodilator therapies to prevent reflex tachycardia.",
    pathophysiology: "An intimal tear allows systemic blood under high pressure to enter and peel apart the media of the aortic wall, creating a false lumen. Standard Type A involves the ascending aorta and requires emergency surgical intervention."
  },
  {
    id: "case-2",
    title: "Infectious Cascade: Hypotension & Altered Mentation",
    name: "Clara Jenkins",
    age: 68,
    gender: "Female",
    chiefComplaint: "Severe shivering, extreme flank pain, dysuria, and worsening confusion.",
    history: "History of recurrent UTIs. Presents to triage febrile, with dry mucous membranes, cool extremities, and a weak, thready pulse. Severe costovertebral angle tenderness is noted on exam.",
    specialty: "Infectious Diseases / ICU",
    vitals: { hr: 118, bp: "84/48", rr: 28, temp: "39.4 °C", spo2: 91 },
    ecgType: "Tachycardia",
    availableTests: [
      { id: "test-ua", name: "Urinalysis & Urine Micro", cost: "$80", time: "5 mins", result: "Turbid urine, positive leukocyte esterase, 4+ nitrites, 50+ WBCs, and loaded Gram-negative rods.", isCorrect: true },
      { id: "test-bc", name: "Blood Cultures x2", cost: "$180", time: "12 hours", result: "Pending (later confirms Gram-negative bacteremia, E. coli).", isCorrect: true },
      { id: "test-lct", name: "Serum Lactate Level", cost: "$120", time: "10 mins", result: "Elevated lactate at 4.2 mmol/L, indicative of severe tissue hypoperfusion.", isCorrect: true },
      { id: "test-luc", name: "Renal Ultrasound", cost: "$400", time: "20 mins", result: "Perinephric fat stranding consistent with acute pyelonephritis, no hydronephrosis.", isCorrect: false }
    ],
    treatments: [
      { id: "tx-ns", name: "Aggressive IV Fluid Resuscitation", description: "Deliver 30 mL/kg IV crystalloids (Normal Saline or Lactated Ringer's) immediately.", isCorrect: true, feedback: "✅ CRITICAL STEP: Restoring intravascular volume is paramount to reverse tissue hypoperfusion. High-volume fluid resuscitation is the cornerstone of surviving sepsis guidelines." },
      { id: "tx-ceftriaxone", name: "Broad-Spectrum IV Antibiotics", description: "Administer intravenous Ceftriaxone or Piperacillin-Tazobactam within 1 hour.", isCorrect: true, feedback: "✅ EMPOWERING STEP: Every hour delay in administering appropriate antibiotics in septic shock increases mortality by ~8%. Early empiric target coverage saves lives." },
      { id: "tx-nsaid", name: "Oral Ibuprofen & Wait", description: "Control the high fever with standard antipyretics and monitor.", isCorrect: false, feedback: "🚨 FATAL ERROR: This is Septic Shock (hypotension refractory to volume or high lactate). Delaying critical resuscitation and antibiotic bundles is fatal. The patient spirals into multi-organ failure." },
      { id: "tx-norepi", name: "Early Norepinephrine Vasopressor", description: "Initiate vasopressor if MAP remains <65 mmHg despite adequate fluid load.", isCorrect: true, feedback: "✅ ADVANCED STEP: Norepinephrine is the first-choice vasopressor to restore perfusion pressure after initial crystalloid fluid challenges fail." }
    ],
    diagnosisOptions: [
      "Septic Shock Secondary to Pyelonephritis",
      "Acute Adrenal Crisis",
      "Hypovolemic Shock from Dehydration",
      "Nephrolithiasis with Obstructive Uropathy"
    ],
    correctDiagnosis: "Septic Shock Secondary to Pyelonephritis",
    boardTakeaway: "Sepsis guidelines require measuring lactate, obtaining blood cultures prior to broad-spectrum antibiotic coverage, administering 30 mL/kg of IV crystalloid, and initiating Norepinephrine to maintain mean arterial pressure (MAP) >= 65 mmHg.",
    pathophysiology: "Gram-negative endotoxins (LPS) activate immune cascades resulting in massive systemic vasodilation, endothelial damage, fluid extravasation, and microvascular thrombosis, culminating in cellular hypoxia and elevated anaerobic lactate."
  },
  {
    id: "case-3",
    title: "Post-Flight Dyspnea: Tachycardia in a Young Traveler",
    name: "Aria Sterling",
    age: 29,
    gender: "Female",
    chiefComplaint: "Acute onset shortness of breath and pleuritic right-sided chest pain.",
    history: "Returned 2 days ago from a 14-hour transpacific flight. Currently taking oral contraceptive pills. On examination, she is tachypneic, has mild swelling in her left calf, and clear lungs on auscultation.",
    specialty: "Pulmonology & Vascular",
    vitals: { hr: 112, bp: "118/76", rr: 26, temp: "37.2 °C", spo2: 89 },
    ecgType: "Tachycardia",
    availableTests: [
      { id: "test-d-dimer", name: "Quantitative D-Dimer", cost: "$110", time: "15 mins", result: "Elevated D-Dimer at 2,450 ng/mL. (High sensitivity, low specificity).", isCorrect: true },
      { id: "test-ctpa-3", name: "CT Pulmonary Angiography", cost: "$1100", time: "25 mins", result: "Filling defect in the right main lobar pulmonary artery consistent with acute pulmonary embolism.", isCorrect: true },
      { id: "test-ecg-3", name: "ECG Standard", cost: "$150", time: "5 mins", result: "Sinus tachycardia with classic S1Q3T3 pattern (prominent S-wave in lead I, Q-wave in III, inverted T-wave in III).", isCorrect: true },
      { id: "test-cxr-3", name: "Chest X-Ray", cost: "$300", time: "10 mins", result: "Normal lung fields. Lack of parenchymal disease rules out pneumonia and pneumothorax.", isCorrect: true }
    ],
    treatments: [
      { id: "tx-lmwh", name: "Low-Molecular-Weight Heparin (LMWH)", description: "Initiate therapeutic anticoagulation with subcutaneous Enoxaparin.", isCorrect: true, feedback: "✅ CLINICAL GOLD STANDARD: Therapeutic anticoagulation halts thrombus propagation, allowing the body's natural fibrinolytic mechanisms to gradually dissolve the embolus safely." },
      { id: "tx-tpa-3", name: "Systemic Alteplase (tPA)", description: "Administer systemic clot-busting thrombolysis.", isCorrect: false, feedback: "❌ OVER-TREATMENT: Thrombolysis is reserved for hemodynamically *unstable* massive PE (systolic BP < 90). In this stable patient, thrombolysis exposes them to unnecessary major intracranial hemorrhage risks." },
      { id: "tx-albuterol", name: "Nebulized Albuterol & Steroids", description: "Standard asthma or COPD bronchospasm treatment.", isCorrect: false, feedback: "❌ INEFFECTIVE: This is a perfusion deficit, not airway obstruction. Bronchodilators will not resolve the profound hypoxia caused by a ventilation-perfusion mismatch clot." }
    ],
    diagnosisOptions: [
      "Acute Pulmonary Embolism",
      "Atypical Community-Acquired Pneumonia",
      "Spontaneous Pneumothorax",
      "Acute Bronchospasm (Asthma Exacerbation)"
    ],
    correctDiagnosis: "Acute Pulmonary Embolism",
    boardTakeaway: "The S1Q3T3 sign on ECG is high-yield but rare; sinus tachycardia is the most common ECG finding in Pulmonary Embolism. Anticoagulate early with Heparin when clinical suspicion is high (using Wells Criteria), and only thrombolyse in hemodynamically unstable shock.",
    pathophysiology: "A deep vein thrombosis (DVT) embolizes from lower extremity deep veins to the pulmonary arterial bed, creating a sudden increase in pulmonary vascular resistance and alveolar dead space."
  }
];

const COMMUNITY_NODES = [
  { id: "ny", name: "Dr. Sofia Chen", x: 26, y: 32, specialty: "Cardiology", location: "Cleveland Clinic, Cleveland", origin: "Taiwan", activeSims: "1,240 completed" },
  { id: "ldn", name: "Dr. Tariq Mahmood", x: 48, y: 26, specialty: "Emergency Medicine", location: "King's College, London", origin: "Pakistan", activeSims: "3,110 completed" },
  { id: "syd", name: "Dr. Elena Rostova", x: 86, y: 78, specialty: "Pediatric Critical Care", location: "Westmead Hospital, Sydney", origin: "Ukraine", activeSims: "940 completed" },
  { id: "dxb", name: "Dr. Amara Al-Sayed", x: 59, y: 44, specialty: "Vascular Surgery", location: "Hospital Group, Dubai", origin: "Jordan", activeSims: "2,050 completed" },
  { id: "del", name: "Dr. Rohan Malhotra", x: 67, y: 46, specialty: "Neurology", location: "Johns Hopkins, Baltimore", origin: "India", activeSims: "1,880 completed" }
];

export default function MedGlobalLanding({
  onStartSignUp,
  onInstantLogin,
  readingTheme,
  setReadingTheme
}: MedGlobalLandingProps) {
  // Theme styling helpers based on active selection
  const isDark = readingTheme === "dark";
  const isSepia = readingTheme === "sepia";

  // --- INTERACTIVE SIMULATOR STATES ---
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const currentCase = CLINICAL_CASES[activeCaseIdx];

  // Simulator gameplay phases: "presentation" | "workup" | "treatment" | "final-diagnosis" | "debrief"
  const [simPhase, setSimPhase] = useState<"presentation" | "workup" | "treatment" | "final-diagnosis" | "debrief">("presentation");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [revealedTestResults, setRevealedTestResults] = useState<{ [key: string]: string }>({});
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

  // Scoring results
  const [userScore, setUserScore] = useState<{
    accuracy: number;
    speed: number;
    logic: number;
    total: number;
    feedbackSummary: string;
  } | null>(null);

  const [simTimer, setSimTimer] = useState(0);
  const [isSimTimerRunning, setIsSimTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Restart case
  const resetSimulatorState = (caseIdx: number) => {
    setActiveCaseIdx(caseIdx);
    setSimPhase("presentation");
    setSelectedTests([]);
    setRevealedTestResults({});
    setSelectedTxId(null);
    setSelectedDiagnosis(null);
    setUserScore(null);
    setSimTimer(0);
    setIsSimTimerRunning(true);
  };

  // Start timer on case selection
  useEffect(() => {
    if (isSimTimerRunning) {
      timerRef.current = setInterval(() => {
        setSimTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimTimerRunning]);

  useEffect(() => {
    setIsSimTimerRunning(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatSimTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Select test
  const handleToggleTest = (testId: string) => {
    const test = currentCase.availableTests.find(t => t.id === testId);
    if (!test) return;

    if (selectedTests.includes(testId)) {
      setSelectedTests(prev => prev.filter(id => id !== testId));
      const updatedResults = { ...revealedTestResults };
      delete updatedResults[testId];
      setRevealedTestResults(updatedResults);
    } else {
      setSelectedTests(prev => [...prev, testId]);
      // Trigger instant reveal with soft glow effect
      setRevealedTestResults(prev => ({
        ...prev,
        [testId]: test.result
      }));
    }
  };

  // Submit diagnosis & treatment
  const handleCalculateScore = () => {
    setIsSimTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Score calculations
    // 1. Accuracy of Tests: Were correct tests ordered?
    const totalCorrectTests = currentCase.availableTests.filter(t => t.isCorrect).length;
    const correctlyOrderedCount = currentCase.availableTests.filter(t => t.isCorrect && selectedTests.includes(t.id)).length;
    const incorrectlyOrderedCount = currentCase.availableTests.filter(t => !t.isCorrect && selectedTests.includes(t.id)).length;
    
    let testScore = totalCorrectTests > 0 ? (correctlyOrderedCount / totalCorrectTests) * 100 : 100;
    testScore = Math.max(0, testScore - (incorrectlyOrderedCount * 15)); // Penalize for unnecessary diagnostic costs

    // 2. Treatment Selection
    const activeTx = currentCase.treatments.find(t => t.id === selectedTxId);
    const txScore = activeTx?.isCorrect ? 100 : 20;

    // 3. Diagnosis Selection
    const isDiagnosisCorrect = selectedDiagnosis === currentCase.correctDiagnosis;
    const dxScore = isDiagnosisCorrect ? 100 : 0;

    // 4. Time penalty: USMLE Board cases expect speedy recognition. Ideal is under 45 seconds.
    const speedScore = Math.max(40, 100 - Math.max(0, simTimer - 45) * 0.8);

    // Calculate final components
    const accuracy = Math.round((dxScore * 0.5) + (txScore * 0.3) + (testScore * 0.2));
    const logicScore = Math.round((txScore * 0.6) + (testScore * 0.4));
    const finalTotal = Math.round((accuracy * 0.5) + (logicScore * 0.3) + (speedScore * 0.2));

    let summaryText = "";
    if (finalTotal >= 90) {
      summaryText = "EXCEPTIONAL CLINICAL INSTINCTS: You matched gold-standard guidelines flawlessly. Mayo Clinic diagnostic telemetry indicates top-tier clinical reasoning.";
    } else if (finalTotal >= 70) {
      summaryText = "STABILIZED WITH MINOR ISSUES: The patient survived, but you ordered unnecessary tests or encountered delays. Review the pathophysiology breakdown below.";
    } else {
      summaryText = "CRITICAL COGNITIVE DISSONANCE: Your treatment choices or incorrect diagnosis resulted in patient deterioration. Review the high-yield Board takeaway.";
    }

    setUserScore({
      accuracy,
      speed: Math.round(speedScore),
      logic: logicScore,
      total: finalTotal,
      feedbackSummary: summaryText
    });

    setSimPhase("debrief");
  };

  // --- TELEMETRY DASHBOARD CONTROLS ---
  const [dashboardRole, setDashboardRole] = useState<"Student" | "Doctor" | "Faculty">("Student");
  const [telemetryMetric, setTelemetryMetric] = useState("diagnosticAccuracy");

  // --- MAP INTERACTION STATE ---
  const [selectedMapNode, setSelectedMapNode] = useState<any>(COMMUNITY_NODES[0]);

  // --- PRICING CONTROLS ---
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className={`w-full overflow-hidden transition-colors duration-500 font-sans ${
      isDark ? "bg-[#090D1A] text-slate-100" : isSepia ? "bg-[#FAF5EA] text-[#3E2E1C]" : "bg-[#F8FAFC] text-slate-900"
    }`} id="medglobal-clinical-os">

      {/* Embedded Modern Cyberpunk Grid & Soft Ambient Blurs */}
      <style>{`
        .os-glow-panel {
          background: ${isDark ? "rgba(10, 18, 36, 0.45)" : isSepia ? "rgba(242, 233, 215, 0.75)" : "rgba(255, 255, 255, 0.75)"};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(99, 102, 241, 0.12)" : isSepia ? "rgba(120, 100, 70, 0.15)" : "rgba(148, 163, 184, 0.18)"};
        }
        .text-neon {
          text-shadow: ${isDark ? "0 0 12px rgba(56, 189, 248, 0.35)" : "none"};
        }
        .os-card-hover {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .os-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark ? "0 20px 40px -15px rgba(99, 102, 241, 0.15)" : "0 20px 40px -15px rgba(0, 59, 149, 0.1)"};
          border-color: ${isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(0, 59, 149, 0.25)"};
        }
        @keyframes flowGrid {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }
        .cyber-grid {
          background-image: linear-gradient(to right, ${isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"} 1px, transparent 1px),
                            linear-gradient(to bottom, ${isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"} 1px, transparent 1px);
          background-size: 32px 32px;
          animation: flowGrid 16s linear infinite;
        }
        @keyframes ecgHeartLine {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .ecg-animate {
          stroke-dasharray: 1000;
          animation: ecgHeartLine 1.4s linear infinite;
        }
        .pulse-accent-glow {
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
        }
        .custom-vitals-scroller::-webkit-scrollbar {
          width: 4px;
        }
        .custom-vitals-scroller::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 4px;
        }
        .dot-matrix {
          background-image: radial-gradient(${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)"} 1px, transparent 0);
          background-size: 8px 8px;
        }
      `}</style>

      {/* Floating Interactive Background Ambient Orbs */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/8 to-violet-500/8 blur-[130px]" />
      </div>

      {/* ==================== UPPER LEVEL BRANDING / HERO HEADER ==================== */}
      <header className="relative w-full border-b border-slate-200/40 dark:border-slate-800/40 py-5 px-6 md:px-12 flex justify-between items-center z-40 bg-opacity-70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400">
              MED GLOBAL ACADEMY
            </h1>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-bold block">
              CLINICAL DECISION PLATFORM • v9.4
            </span>
          </div>
        </div>

        {/* Dynamic theme select button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/60 dark:bg-slate-900/40 rounded-full border border-slate-200/50 dark:border-slate-800/50">
            {(["light", "sepia", "dark"] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setReadingTheme(theme)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  readingTheme === theme
                    ? "bg-[#003B95] dark:bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          <button
            onClick={onStartSignUp}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest py-2 px-5 rounded-full shadow-sm transition-all"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ==================== CLINICAL OS CINEMATIC HERO SECTION ==================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 md:px-8 max-w-7xl mx-auto z-10" id="epic-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Linear-style precision typography & Emotional pitch */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Elegant premium chip */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-400/20 text-indigo-600 dark:text-indigo-300 font-extrabold text-[9px] py-1.5 px-3.5 rounded-full uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Ditching Static LMS for High-Fidelity Simulation</span>
            </div>

            {/* Apple-style bold display heading */}
            <h2 className="text-4xl md:text-6xl font-black font-serif italic tracking-tight leading-[1.05]">
              Practice Medicine. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 font-sans not-italic font-black">
                Not Just Flashcards.
              </span>
            </h2>

            {/* Explanatory subtitle */}
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl font-sans">
              Enter the modern hospital simulator. Stop listening to clinical lectures. Experience the high-stress triage, order diagnostic panels, prescribe critical interventions, and refine your diagnostic instincts using Mayo-level medical logic.
            </p>

            {/* High fidelity Action buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#case-engine"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-full transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2.5 cursor-pointer"
              >
                <span>Try Instant Simulation Case</span>
                <ArrowRight className="h-4.5 w-4.5 text-cyan-300" />
              </a>

              <a
                href="#saas-dashboard"
                className="bg-slate-200/80 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300/40 dark:border-slate-800 font-extrabold text-xs uppercase tracking-widest py-4 px-8 rounded-full transition-all flex items-center gap-2 cursor-pointer"
              >
                <Database className="h-4 w-4 text-indigo-400" />
                <span>Explore Live Telemetry</span>
              </a>
            </div>

            {/* Mini Trust Badges */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-3 gap-6">
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-blue-600 dark:text-indigo-400 block">12,400+</span>
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Completed Simulations</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-indigo-600 dark:text-cyan-400 block">99.4%</span>
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">USMLE Prep Success</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-emerald-600 dark:text-emerald-400 block">180+ Countries</span>
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Doctor Enrollment</span>
              </div>
            </div>

          </div>

          {/* Hero Right: Highly Polished SaaS Floating Clinical UI Elements */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Outer Decorative Glowing Frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />

            <div className="w-full max-w-lg os-glow-panel rounded-[2rem] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-blue-500/20 dot-matrix">
              
              {/* Card Title Bar */}
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/60 font-mono text-xs text-indigo-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold tracking-widest">LIVE CLINICAL ENVIRONMENT</span>
                </div>
                <div className="text-[10px] text-slate-500">SYS: ACTIVE</div>
              </div>

              {/* Floating Element 1: Mini Vitals monitor */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Heart Rate", val: "104", unit: "bpm", status: "Elevated", color: "text-rose-500" },
                  { label: "Blood Pres.", val: "185/110", unit: "mmHg", status: "Critical", color: "text-red-500" },
                  { label: "O2 Sat", val: "97%", unit: "SpO2", status: "Normal", color: "text-emerald-500" },
                  { label: "Respiration", val: "24", unit: "rpm", status: "Tachypneic", color: "text-amber-500" }
                ].map((vit, idx) => (
                  <div key={idx} className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 p-2.5 rounded-xl text-center space-y-0.5 shadow-sm">
                    <span className="text-[8px] text-slate-400 uppercase font-bold block">{vit.label}</span>
                    <span className={`text-sm md:text-base font-black font-mono tracking-tight ${vit.color}`}>{vit.val}</span>
                    <span className="text-[8px] text-slate-500 block">{vit.unit} • {vit.status}</span>
                  </div>
                ))}
              </div>

              {/* Simulated ECG Live Line Graphic */}
              <div className="bg-[#050A14] border border-blue-950 rounded-xl p-3 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                <div className="flex justify-between items-center pb-1 border-b border-emerald-950/30 text-[9px] font-mono text-emerald-400">
                  <span>LEAD II • CONTINUOUS MONITOR</span>
                  <span className="animate-pulse">● SWEEP SPEED: 25mm/s</span>
                </div>
                
                <div className="h-16 flex items-center justify-center">
                  <svg className="w-full h-full text-emerald-400" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <path
                      d="M 0 40 L 40 40 L 48 35 L 56 45 L 64 40 L 80 40 L 88 40 L 92 10 L 100 75 L 108 30 L 116 40 L 132 40 L 144 40 L 184 40 L 192 35 L 200 45 L 208 40 L 224 40 L 232 40 L 236 10 L 244 75 L 252 30 L 260 40 L 276 40 L 300 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ecg-animate"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Case Card Detail */}
              <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-indigo-500/20 rounded-xl p-3.5 space-y-2 text-left shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] uppercase tracking-widest font-black rounded-full">
                    ACTIVE CASE #10842
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">USMLE CORE MATCH</span>
                </div>
                <h4 className="font-serif italic font-bold text-sm">Harold Vance (54M) • Chest Crises</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans line-clamp-2">
                  Sudden onset tearing pain radiating to the back. Patient has 20-year history of heavy tobacco use and untreated hypertension...
                </p>
                
                <div className="flex justify-between items-center pt-1 text-[10px] text-indigo-400 font-extrabold">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Time-to-Treat: 01:24s
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" /> Target Accuracy: &gt;90%
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==================== 🧠 CORE CLINICAL SIMULATOR ENGINE (INTERACTIVE GAME) ==================== */}
      <section className="relative py-20 px-4 md:px-8 border-t border-slate-200/50 dark:border-slate-800/40" id="case-engine">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-blue-500 dark:text-cyan-400 text-xs font-black uppercase tracking-widest block font-mono">
              ★ MAIN PRODUCT CORE SYSTEM
            </span>
            <h3 className="text-3xl md:text-5xl font-black font-serif italic tracking-tight">
              Test Your Clinical Instincts Live
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-sans font-medium">
              Don't just believe us. Interact with our live patient simulator block. Choose your diagnostic pipeline, order labs, execute treatment, and see the patient's immediate prognosis.
            </p>
          </div>

          {/* Quick case switch selector */}
          <div className="flex flex-wrap justify-center gap-2">
            {CLINICAL_CASES.map((patientCase, idx) => (
              <button
                key={patientCase.id}
                onClick={() => resetSimulatorState(idx)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  activeCaseIdx === idx
                    ? "bg-[#003B95] dark:bg-blue-600 text-white border-blue-500/40 shadow-md shadow-blue-500/10 font-bold"
                    : "bg-white dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Case {idx + 1}: {patientCase.name} ({patientCase.age}{patientCase.gender[0]})</span>
              </button>
            ))}
          </div>

          {/* SIMULATOR WINDOW (APPLE METAPHOR) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDE: PATIENT DATA & DIAGNOSTICS SCREEN (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between os-glow-panel rounded-3xl p-5 md:p-6 border border-slate-200/60 dark:border-indigo-500/10 min-h-[500px] relative">
              
              {/* Inner clinical grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              <div className="space-y-5 relative z-10 w-full">
                
                {/* Simulator Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200/50 dark:border-slate-800/60">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase font-extrabold">
                      ACTIVE ADMISSION: STAGE {simPhase.toUpperCase()}
                    </span>
                    <h4 className="text-xl font-serif italic font-black">
                      {currentCase.title}
                    </h4>
                  </div>
                  
                  {/* Timer & Patient Health Tracker */}
                  <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-300 font-mono text-xs">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{formatSimTime(simTimer)}</span>
                    </div>
                    <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                      Stable • Live
                    </span>
                  </div>
                </div>

                {/* PATIENT PROFILE CARD */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-left">
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Demographics</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{currentCase.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{currentCase.age}-year-old {currentCase.gender}</p>
                    <span className="inline-block py-0.5 px-2 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-wider rounded">
                      {currentCase.specialty}
                    </span>
                  </div>
                  
                  <div className="md:col-span-9 space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Chief Complaint</span>
                      <p className="text-xs text-red-500 dark:text-rose-400 font-bold leading-relaxed">{currentCase.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">History of Present Illness</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{currentCase.history}</p>
                    </div>
                  </div>
                </div>

                {/* REVEALED TEST RESULTS AND LABS CONTAINER */}
                {selectedTests.length > 0 && (
                  <div className="space-y-2.5 text-left">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Diagnostic Laboratory & Imaging Reports</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto custom-vitals-scroller pr-1">
                      {selectedTests.map(testId => {
                        const testObj = currentCase.availableTests.find(t => t.id === testId);
                        if (!testObj) return null;
                        return (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={testId}
                            className="bg-white dark:bg-slate-900/60 border border-indigo-500/20 p-3 rounded-xl space-y-1 shadow-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{testObj.name}</span>
                              <span className="text-[8px] font-mono text-slate-400">{testObj.time}</span>
                            </div>
                            <p className="text-[10px] font-medium text-indigo-600 dark:text-cyan-300 font-mono leading-tight">
                              Result: {testObj.result}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* ACTION TOGGLE PHASE SYSTEM */}
              <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 w-full flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Left indicators */}
                <div className="flex gap-2 text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                  <span className={`px-2 py-1 rounded-md border ${simPhase === "presentation" || simPhase === "workup" ? "border-indigo-500 text-indigo-400 font-black" : "border-slate-200 dark:border-slate-800"}`}>1. WORKUP</span>
                  <span className={`px-2 py-1 rounded-md border ${simPhase === "treatment" ? "border-indigo-500 text-indigo-400 font-black" : "border-slate-200 dark:border-slate-800"}`}>2. TREATMENT</span>
                  <span className={`px-2 py-1 rounded-md border ${simPhase === "final-diagnosis" ? "border-indigo-500 text-indigo-400 font-black" : "border-slate-200 dark:border-slate-800"}`}>3. DIAGNOSIS</span>
                </div>

                {/* Right CTA button */}
                <div className="flex gap-2 w-full md:w-auto">
                  {simPhase === "presentation" && (
                    <button
                      onClick={() => setSimPhase("workup")}
                      className="w-full md:w-auto bg-[#003B95] dark:bg-blue-600 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Clinical Workup</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {simPhase === "workup" && (
                    <button
                      onClick={() => setSimPhase("treatment")}
                      className="w-full md:w-auto bg-[#003B95] dark:bg-blue-600 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Treatment Bundle</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {simPhase === "treatment" && (
                    <button
                      disabled={!selectedTxId}
                      onClick={() => setSimPhase("final-diagnosis")}
                      className={`w-full md:w-auto font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedTxId 
                          ? "bg-[#003B95] dark:bg-blue-600 text-white hover:opacity-95" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span>Formulate Final Diagnosis</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {simPhase === "final-diagnosis" && (
                    <button
                      disabled={!selectedDiagnosis}
                      onClick={handleCalculateScore}
                      className={`w-full md:w-auto font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedDiagnosis 
                          ? "bg-emerald-600 text-white hover:opacity-95 shadow-md shadow-emerald-500/15" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span>Submit Clinical Report</span>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
                    </button>
                  )}

                  {simPhase === "debrief" && (
                    <button
                      onClick={() => resetSimulatorState(activeCaseIdx)}
                      className="w-full md:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all cursor-pointer"
                    >
                      Restart Simulation
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* RIGHT SIDE: CONTROLS / INTERACTIVE WORK AREA (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between os-glow-panel rounded-3xl p-5 md:p-6 border border-slate-200/60 dark:border-indigo-500/10 min-h-[500px]">
              
              <div className="space-y-4 w-full h-full flex flex-col justify-between">
                
                {/* Header title */}
                <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800/60 text-left">
                  <h5 className="font-serif italic font-bold text-sm text-indigo-400 uppercase tracking-wider">
                    {simPhase === "presentation" && "Case Briefing Room"}
                    {simPhase === "workup" && "Diagnostic Lab Diagnostics"}
                    {simPhase === "treatment" && "Immediate ICU Therapeutics"}
                    {simPhase === "final-diagnosis" && "Licensure Differential Diagnoses"}
                    {simPhase === "debrief" && "AI Clinical Performance Score"}
                  </h5>
                  <p className="text-[11px] text-slate-400 font-sans">
                    {simPhase === "presentation" && "Read the patient's presentation and medical history carefully before workup."}
                    {simPhase === "workup" && "Select medical trials, labs, or imaging below to explore clinical values."}
                    {simPhase === "treatment" && "Select the definitive gold standard medical therapy for this patient."}
                    {simPhase === "final-diagnosis" && "Commit to a single diagnostic conclusion for your medical record."}
                    {simPhase === "debrief" && "Comprehensive metric telemetry and high-yield Board explanations."}
                  </p>
                </div>

                {/* GAMEPLAY STATES INTERACTIVE PANEL */}
                <div className="flex-1 py-4 flex flex-col justify-start overflow-y-auto custom-vitals-scroller text-left">
                  
                  {/* PHASE 1: PRESENTATION (Brief details + proceed) */}
                  {simPhase === "presentation" && (
                    <div className="space-y-4 my-auto text-center py-6">
                      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 inline-block">
                        <Stethoscope className="h-10 w-10 text-indigo-500 animate-bounce" />
                      </div>
                      <h4 className="font-serif italic font-extrabold text-base text-slate-800 dark:text-slate-200">
                        Awaiting Patient Workup
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                        This patient requires immediate medical telemetry. Let's initiate the clinical workup stage to explore diagnostic panels and lab parameters.
                      </p>
                      
                      <button
                        onClick={() => setSimPhase("workup")}
                        className="bg-[#003B95] dark:bg-blue-600 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <span>Start Workup Mode</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* PHASE 2: WORKUP (Interactive checkbox list) */}
                  {simPhase === "workup" && (
                    <div className="space-y-3">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Available Laboratory & Imaging Options</span>
                      <div className="space-y-2">
                        {currentCase.availableTests.map(test => (
                          <button
                            key={test.id}
                            onClick={() => handleToggleTest(test.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                              selectedTests.includes(test.id)
                                ? "bg-indigo-500/5 border-indigo-500/55 dark:bg-indigo-500/10"
                                : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{test.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">Time-to-result: {test.time}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 py-1 px-2 rounded">
                                {test.cost}
                              </span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                selectedTests.includes(test.id) ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {selectedTests.includes(test.id) && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-2 mt-4">
                        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-300 leading-relaxed font-sans">
                          <strong>Note:</strong> Select the tests you deem clinically necessary. Unnecessary testing increases diagnostic expenditure and penalizes your final score.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PHASE 3: TREATMENT (Definitive treatment lists) */}
                  {simPhase === "treatment" && (
                    <div className="space-y-3">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Definitive Acute Treatment Bundle</span>
                      <div className="space-y-2">
                        {currentCase.treatments.map(tx => (
                          <button
                            key={tx.id}
                            onClick={() => setSelectedTxId(tx.id)}
                            className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex gap-3 ${
                              selectedTxId === tx.id
                                ? "bg-indigo-500/5 border-indigo-500/60 dark:bg-indigo-500/10"
                                : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <div className={`h-4.5 w-4.5 rounded-full border shrink-0 mt-1 flex items-center justify-center ${
                              selectedTxId === tx.id ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300"
                            }`}>
                              {selectedTxId === tx.id && <span className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{tx.name}</span>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">{tx.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PHASE 4: DIAGNOSIS (Licensure Diagnostic selector) */}
                  {simPhase === "final-diagnosis" && (
                    <div className="space-y-3">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block font-mono">Differential Diagnostic Conclusions</span>
                      <div className="space-y-2">
                        {currentCase.diagnosisOptions.map(option => (
                          <button
                            key={option}
                            onClick={() => setSelectedDiagnosis(option)}
                            className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                              selectedDiagnosis === option
                                ? "bg-indigo-500/5 border-indigo-500/60 dark:bg-indigo-500/10"
                                : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                              selectedDiagnosis === option ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-300"
                            }`}>
                              {selectedDiagnosis === option && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PHASE 5: DEBRIEF (Beautiful score analytics and explanations) */}
                  {simPhase === "debrief" && userScore && (
                    <div className="space-y-4">
                      
                      {/* Interactive circular dial for total competence score */}
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                        <div className="relative h-20 w-20 flex items-center justify-center">
                          {/* Circle trail */}
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="34" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="6" fill="transparent" />
                            <circle cx="40" cy="40" r="34" stroke={userScore.total >= 85 ? "#10B981" : userScore.total >= 60 ? "#F59E0B" : "#EF4444"} strokeWidth="6" fill="transparent" strokeDasharray="213" strokeDashoffset={213 - (213 * userScore.total) / 100} />
                          </svg>
                          <span className="text-xl font-black font-mono text-slate-800 dark:text-slate-100">
                            {userScore.total}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Clinical Competency Rating</span>
                          <h4 className="font-serif italic font-bold text-base">
                            {userScore.total >= 85 ? "Excellent Diagnosis" : userScore.total >= 65 ? "Proficient Care" : "Sub-Optimal Management"}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-sans">Time to Stabilize: {formatSimTime(simTimer)}</span>
                        </div>
                      </div>

                      {/* Diagnostic Breakdown telemetries */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-2 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl text-center border border-slate-200/40">
                          <span className="text-[8px] text-slate-400 uppercase font-bold block">Accuracy</span>
                          <span className="text-base font-bold font-mono text-indigo-500">{userScore.accuracy}%</span>
                        </div>
                        <div className="p-2 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl text-center border border-slate-200/40">
                          <span className="text-[8px] text-slate-400 uppercase font-bold block">Logic Ratio</span>
                          <span className="text-base font-bold font-mono text-emerald-500">{userScore.logic}%</span>
                        </div>
                        <div className="p-2 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl text-center border border-slate-200/40">
                          <span className="text-[8px] text-slate-400 uppercase font-bold block">Speed Index</span>
                          <span className="text-base font-bold font-mono text-amber-500">{userScore.speed}%</span>
                        </div>
                      </div>

                      {/* AI Clinical telemetry summary feedback */}
                      <div className="bg-indigo-500/5 border border-indigo-500/25 p-3.5 rounded-xl space-y-1">
                        <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block font-black">
                          ⚡ AI DECISION CRITIQUE
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-200 font-sans leading-relaxed">
                          {userScore.feedbackSummary}
                        </p>
                      </div>

                      {/* Treatment feedback detail */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-1 text-left">
                        <span className="text-[8px] text-slate-400 uppercase font-bold block">Selected Therapeutic Outcome</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
                          {currentCase.treatments.find(t => t.id === selectedTxId)?.feedback}
                        </p>
                      </div>

                    </div>
                  )}

                </div>

                {/* BOARD EXAM CAPSTONE (Only shows on debrief stage) */}
                {simPhase === "debrief" && (
                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 text-left space-y-2">
                    <span className="text-[9px] text-emerald-500 font-mono tracking-widest block uppercase font-black">
                      ★ HIGH-YIELD CLINICAL PATHOPHYSIOLOGY
                    </span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Mechanism:</strong> {currentCase.pathophysiology}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-100/60 dark:bg-slate-900/50 p-2.5 rounded border border-slate-200/40">
                      <strong>USMLE Pearl:</strong> {currentCase.boardTakeaway}
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== 📊 THE SAAS CLINICAL OS DASHBOARD PREVIEW ==================== */}
      <section className="relative py-20 px-4 md:px-8 bg-slate-50/60 dark:bg-[#060A14] border-t border-slate-200/40 dark:border-slate-800/40" id="saas-dashboard">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-indigo-500 dark:text-cyan-400 text-xs font-black uppercase tracking-widest block font-mono">
              ★ ADVANCED SAAS COGNITIVE SUITE
            </span>
            <h3 className="text-3xl md:text-5xl font-black font-serif italic tracking-tight">
              A Complete Hospital Operating System
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Track student cohorts, measure diagnostic error statistics, claim verifyable Continuing Medical Education (CME) credits, and examine molecular drug profiles.
            </p>
          </div>

          {/* Interactive Role Customizer for Telemetry preview */}
          <div className="flex justify-center gap-2 pb-4">
            {(["Student", "Doctor", "Faculty"] as const).map(role => (
              <button
                key={role}
                onClick={() => setDashboardRole(role)}
                className={`py-1.5 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  dashboardRole === role
                    ? "bg-[#003B95] dark:bg-blue-600 text-white border-blue-500/30 shadow-md"
                    : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                {role} Preview
              </button>
            ))}
          </div>

          {/* DASHBOARD PREVIEW BOARD (BENTO GRID DESIGN) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch text-left">
            
            {/* Box 1: Core Performance Score card (Takes 4 columns) */}
            <div className="md:col-span-4 os-glow-panel rounded-3xl p-5 border border-slate-200/50 dark:border-indigo-500/10 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Clinical IQ Status</span>
                  <Trophy className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
                </div>
                
                <h4 className="text-4xl font-serif italic font-black text-slate-800 dark:text-white">
                  {dashboardRole === "Student" ? "Level 14" : dashboardRole === "Doctor" ? "CME Active" : "Curator Core"}
                </h4>
                
                <div className="p-3 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl space-y-1 border border-slate-200/40">
                  <span className="text-[8px] text-slate-400 uppercase block">Active Diagnostic Accuracy</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black font-mono text-indigo-500">
                      {dashboardRole === "Student" ? "92.4%" : dashboardRole === "Doctor" ? "98.1%" : "99.2%"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +1.4%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                <span className="text-[9px] text-slate-400 uppercase block font-mono font-bold">Residency Preparatory Streaks</span>
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-amber-500 animate-pulse" />
                  <div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                      {dashboardRole === "Student" ? "42-Day Case Streak" : dashboardRole === "Doctor" ? "124-Day Active Diagnostic" : "25 Published Templates"}
                    </span>
                    <span className="text-[9px] text-slate-400 block">Top 2.5% of Harvard Medical School users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Central Analytics & Diagnostics Chart (Takes 5 columns) */}
            <div className="md:col-span-5 os-glow-panel rounded-3xl p-5 border border-slate-200/50 dark:border-indigo-500/10 flex flex-col justify-between relative">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Case Diagnostic Telemetries</span>
                  <span className="text-[9px] text-indigo-500 font-mono font-bold bg-indigo-500/10 py-0.5 px-2 rounded">
                    REAL-TIME STREAMING
                  </span>
                </div>
                <h4 className="font-serif italic font-bold text-base">Accuracy Optimization Profile</h4>
              </div>

              {/* Simulated Stats Chart Graphics */}
              <div className="h-32 my-3 flex items-end justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-1 font-mono text-[9px] text-slate-400">
                {[
                  { month: "Jan", val: 78 },
                  { month: "Feb", val: 82 },
                  { month: "Mar", val: 80 },
                  { month: "Apr", val: 89 },
                  { month: "May", val: 94 },
                  { month: "Jun", val: 92 }
                ].map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] bg-slate-900 text-white dark:bg-slate-800 px-1 rounded transition-opacity font-bold">
                      {pt.val}%
                    </span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-blue-600 to-indigo-500/80 group-hover:from-indigo-500 group-hover:to-cyan-400 transition-all duration-300"
                      style={{ height: `${pt.val}%` }}
                    />
                    <span>{pt.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Gold Standard Target Completed
                </span>
                <span className="font-mono font-bold text-slate-500">Goal: &gt;90% Accuracy</span>
              </div>
            </div>

            {/* Box 3: Live Active Patient Queue Widget (Takes 3 columns) */}
            <div className="md:col-span-3 os-glow-panel rounded-3xl p-5 border border-slate-200/50 dark:border-indigo-500/10 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Live Training Queue</span>
                <div className="space-y-2">
                  {[
                    { title: "Sepsis Shock Crises", status: "Active", time: "12m remaining", color: "border-l-rose-500" },
                    { title: "Diabetic Ketoacidosis", status: "Awaiting", time: "No timer limit", color: "border-l-indigo-500" },
                    { title: "Stanford Aortic Rupture", status: "Stable", time: "Completed (92%)", color: "border-l-emerald-500" }
                  ].map((item, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 border-l-3 ${item.color} space-y-0.5 shadow-xs`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{item.title}</span>
                        <span className="text-[8px] text-slate-400 font-mono">{item.status}</span>
                      </div>
                      <span className="text-[8px] text-slate-500 block">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onStartSignUp}
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Enter Live OS Triage</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 🌍 GLOBAL IMPACT & ANIMATED USER HOTSPOTS ==================== */}
      <section className="relative py-20 px-4 md:px-8 border-t border-slate-200/40 dark:border-slate-800/40" id="global-impact">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Map Column: High End Minimalist SVG World Map with Live Node Selections (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between os-glow-panel rounded-[2rem] p-5 md:p-6 border border-indigo-500/10 relative min-h-[380px]">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800/60 text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-bold">
                    ACTIVE TELEMETRY GLOBE MATCH
                  </span>
                  <h4 className="font-serif italic font-black text-lg">
                    Simulated Doctor Placements
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 animate-pulse">
                  ● CONNECTED HOTSPOTS
                </div>
              </div>

              {/* Minimal SVG World Map Grid Layout */}
              <div className="h-56 my-4 relative flex items-center justify-center bg-slate-50 dark:bg-[#03060C] rounded-2xl border border-slate-200/40 dark:border-blue-950/20 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#4F46E5" strokeWidth="0.25" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#4F46E5" strokeWidth="0.25" />
                </svg>

                {/* Simulated World Map Outline Details (Represented as elegant nodes/connections) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[85%] h-[80%] relative">
                    {/* Simulated Connection Lines (Map lines) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {COMMUNITY_NODES.map((node, i) => (
                        <line
                          key={i}
                          x1="50"
                          y1="50"
                          x2={node.x}
                          y2={node.y}
                          stroke="rgba(99, 102, 241, 0.25)"
                          strokeWidth="0.5"
                          className="map-line"
                        />
                      ))}
                    </svg>

                    {/* Central Hub Triage point */}
                    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center pulse-accent-glow">
                      <span className="absolute h-6 w-6 rounded-full bg-indigo-500/40 animate-ping" />
                      <Activity className="h-2.5 w-2.5 text-white animate-pulse" />
                    </div>

                    {/* Location Hotspots */}
                    {COMMUNITY_NODES.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedMapNode(node)}
                        className="absolute h-5.5 w-5.5 rounded-full transition-all flex items-center justify-center cursor-pointer group hover:scale-125 focus:outline-none"
                        style={{ top: `${node.y}%`, left: `${node.x}%` }}
                      >
                        <span className={`absolute h-3.5 w-3.5 rounded-full animate-ping ${
                          selectedMapNode?.id === node.id ? "bg-cyan-400" : "bg-indigo-400/40"
                        }`} />
                        <div className={`h-2.5 w-2.5 rounded-full border border-white ${
                          selectedMapNode?.id === node.id ? "bg-cyan-500 shadow-md shadow-cyan-400/50" : "bg-indigo-500"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/90 py-1 px-2.5 rounded border border-slate-200/50 dark:border-slate-800 text-[9px] font-mono text-slate-500">
                  Currently Tracking: 1,842 Live Active Sims
                </div>
              </div>

            </div>

            {/* Content Column (5 Columns) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-blue-500 dark:text-cyan-400 text-xs font-black uppercase tracking-widest block font-mono">
                ★ COHORT GLOBAL SCALE
              </span>
              <h3 className="text-2xl md:text-4xl font-black font-serif italic tracking-tight leading-snug">
                Placing Verified Doctors Globally
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Our clinical decision modules are utilized by international graduates from leading institutions to matching residencies across the world.
              </p>

              {/* Active hot spot card detail card */}
              <AnimatePresence mode="wait">
                {selectedMapNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key={selectedMapNode.id}
                    className="bg-indigo-500/5 border border-indigo-400/20 p-5 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-indigo-500 uppercase font-black tracking-widest font-mono">
                        Active Hotspot Match File
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-900 py-1 px-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono">
                        Origin: {selectedMapNode.origin}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-serif italic font-bold">{selectedMapNode.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{selectedMapNode.specialty} Specialist</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-500/10 font-mono text-[10px] text-slate-400">
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Residency Placement</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedMapNode.location}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Cognitive Exercises</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedMapNode.activeSims}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Institutional passport login trigger CTA */}
              <div className="pt-3">
                <button
                  onClick={() => onInstantLogin("Doctor")}
                  className="bg-[#003B95] dark:bg-blue-600 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Instantly Log In as Resident (Dr. Vance)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== 💰 PRECISE PRICING INDEX SECTION ==================== */}
      <section className="relative py-20 px-4 md:px-8 bg-slate-50/40 dark:bg-[#070A15] border-t border-slate-200/40 dark:border-slate-800/40" id="saas-pricing">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-indigo-500 dark:text-cyan-400 text-xs font-black uppercase tracking-widest block font-mono">
              ★ INVESTMENT IN CLINICAL INSTINCTS
            </span>
            <h3 className="text-3xl md:text-5xl font-black font-serif italic tracking-tight">
              Calibrate Your Skills With Precision
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Select an academic deployment model tailored for your individual preparation trajectory, institutional proctoring audit, or continuous medical licensure requirements.
            </p>

            {/* Monthly / Yearly Toggle Switch with Framer Motion pill */}
            <div className="inline-flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-full border border-slate-300/40 dark:border-slate-800 relative z-10">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer relative ${
                  !isAnnual ? "text-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {!isAnnual && (
                  <motion.div
                    layoutId="pricing-toggle-pill"
                    className="absolute inset-0 bg-[#003B95] dark:bg-blue-600 rounded-full"
                    style={{ zIndex: -1 }}
                  />
                )}
                Monthly Billing
              </button>
              
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer relative flex items-center gap-1 ${
                  isAnnual ? "text-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isAnnual && (
                  <motion.div
                    layoutId="pricing-toggle-pill"
                    className="absolute inset-0 bg-[#003B95] dark:bg-blue-600 rounded-full"
                    style={{ zIndex: -1 }}
                  />
                )}
                <span>Yearly Plan</span>
                <span className="bg-emerald-500 text-white text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto text-left">
            
            {/* Card 1: Basic Student */}
            <div className="os-glow-panel rounded-3xl p-6 border border-slate-200/50 dark:border-indigo-500/10 flex flex-col justify-between os-card-hover bg-white/40">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-[8px] uppercase tracking-widest font-black rounded-full">
                    BASIC LICENSE
                  </span>
                  <span className="text-2xl">👩‍🎓</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif italic font-bold text-lg text-slate-800 dark:text-white">Individual Student</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Essential Board-style simulated cases, perfect for USMLE Step 1 and PLAB 1 foundational preparation.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-white">
                    ${isAnnual ? "29" : "39"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono"> / month billed {isAnnual ? "annually" : "monthly"}</span>
                </div>

                <ul className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    250 AI-Simulated Patient Cases
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Comprehensive Diagnostic Lab Workups
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Standard AI Logic Critiques
                  </li>
                  <li className="flex items-center gap-2 font-medium text-slate-400 dark:text-slate-600 line-through">
                    Continuous Vitals Sandbox Controls
                  </li>
                  <li className="flex items-center gap-2 font-medium text-slate-400 dark:text-slate-600 line-through">
                    CME Claims & Institutional Gradebooks
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartSignUp}
                className="w-full mt-6 bg-[#003B95] dark:bg-blue-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all text-center cursor-pointer shadow-sm"
              >
                Launch Student Triage
              </button>
            </div>

            {/* Card 2: Professional Resident (POPULAR FEATURING PREMIUM GLOW) */}
            <div className="os-glow-panel rounded-3xl p-6 border-2 border-indigo-500 dark:border-indigo-400 flex flex-col justify-between os-card-hover bg-slate-50 dark:bg-slate-900/50 relative">
              
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black text-[8px] uppercase tracking-widest py-1 px-3 rounded-full shadow-md">
                RECOMMENDED RESIDENCY SUITE
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[8px] uppercase tracking-widest font-black rounded-full border border-indigo-500/10">
                    PROFESSIONAL LICENSE
                  </span>
                  <span className="text-2xl">🥼</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif italic font-bold text-lg text-slate-800 dark:text-white">Resident Physician</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Complete, limitless high-fidelity simulation engine built for Step 2 CK, PLAB 2 clinical OSCEs and CME.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-white">
                    ${isAnnual ? "59" : "79"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono"> / month billed {isAnnual ? "annually" : "monthly"}</span>
                </div>

                <ul className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    <strong>Unlimited</strong> Diagnostic Cases
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Continuous Real-Time ECG & Vitals Sandboxes
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Elite AI Pathfinders & Specialty Mapping
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Standard CME Tracker Verification
                  </li>
                  <li className="flex items-center gap-2 font-medium text-slate-400 dark:text-slate-600 line-through">
                    Institutional Cohort Telemetry Gradebooks
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartSignUp}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all text-center cursor-pointer shadow-md"
              >
                Initialize Clinical OS
              </button>
            </div>

            {/* Card 3: Institutional Colleges */}
            <div className="os-glow-panel rounded-3xl p-6 border border-slate-200/50 dark:border-indigo-500/10 flex flex-col justify-between os-card-hover bg-white/40">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 text-[8px] uppercase tracking-widest font-black rounded-full">
                    ENTERPRISE / INSTITUTIONAL
                  </span>
                  <span className="text-2xl">🏫</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif italic font-bold text-lg text-slate-800 dark:text-white">Medical Colleges</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Custom authoring, student telemetry tracking, and integrated proctoring proctor logs for university cohorts.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-white">
                    Custom
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono"> Contract Pricing Options</span>
                </div>

                <ul className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Custom Clinical Simulation Case Authoring
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Admin Proctoring Audits & Cohort telemetry
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    SAML SSO / LMS Standard Integrations
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Cryptographically Signed Digital Credentials
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                    Full-scale HIPAA / GDPR Compliance Security
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onInstantLogin("Faculty")}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all text-center cursor-pointer"
              >
                Demo Faculty Dashboard
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== UPPER LEVEL BRAND FOOTER ==================== */}
      <footer className="relative py-12 px-6 md:px-12 border-t border-slate-200/40 dark:border-slate-800/40 bg-slate-100/50 dark:bg-[#04070F] text-slate-500 text-left z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h5 className="text-sm font-black text-slate-800 dark:text-slate-300">MED GLOBAL ACADEMY</h5>
            <p className="text-xs text-slate-400 max-w-sm">
              Sensing and simulating diagnostic workflows globally. Providing world-class clinical intelligence resources for licensed graduates and residency matches.
            </p>
          </div>
          
          <div className="flex gap-4 text-xs font-mono font-bold text-slate-400">
            <a href="#case-engine" className="hover:text-indigo-500 transition-colors">Cases</a>
            <span>•</span>
            <a href="#saas-dashboard" className="hover:text-indigo-500 transition-colors">Telemetry</a>
            <span>•</span>
            <a href="#global-impact" className="hover:text-indigo-500 transition-colors">Hotspots</a>
            <span>•</span>
            <a href="#saas-pricing" className="hover:text-indigo-500 transition-colors">Pricing Pricing</a>
          </div>
          
          <div className="text-[10px] font-mono text-slate-400">
            © 2026 Med Global Systems, Inc. All rights reserved. Registered ECFMG Partner.
          </div>
        </div>
      </footer>

    </div>
  );
}
