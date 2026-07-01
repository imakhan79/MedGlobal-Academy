import React, { useState, useEffect, useRef } from "react";
import { CLINICAL_TWIN_PRESETS, ClinicalTwinPreset, TwinAction, TwinInvestigation } from "../data/clinicalTwinCases";
import { Activity, Award, ShieldAlert, Sparkles, RefreshCw, Send, ChevronRight, CheckCircle2, XCircle, Heart, Info, BookOpen, Layers, Lightbulb, Check, AlertTriangle, Play, Settings, Gauge, TrendingUp, Sliders, Eye, ZoomIn, Maximize2, Tv } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BioTwinSimulatorProps {
  customCase?: ClinicalTwinPreset | null;
  onClearCustomCase?: () => void;
}

export default function BioTwinSimulator({ customCase, onClearCustomCase }: BioTwinSimulatorProps) {
  // Setup Parameters state
  const [selectedBoard, setSelectedBoard] = useState<"USMLE" | "FCPS" | "PLAB">("USMLE");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  // Simulation running state
  const [activePreset, setActivePreset] = useState<ClinicalTwinPreset | null>(null);
  const [currentVitals, setCurrentVitals] = useState<{ bp: string; hr: number; rr: number; temp: string; spo2: number } | null>(null);
  const [clinicalScore, setClinicalScore] = useState<number>(70);
  const [actionsTaken, setActionsTaken] = useState<TwinAction[]>([]);
  const [orderedInvestigations, setOrderedInvestigations] = useState<string[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<{
    correctness: "Correct" | "Partially Correct" | "Incorrect" | "Dangerous";
    feedback: string;
    reasoning: string;
    pathophysiology: string;
    pearl: string;
    scoreChange: number;
  } | null>(null);
  
  // Complications active state
  const [complicationActive, setComplicationActive] = useState<boolean>(false);
  const [complicationText, setComplicationText] = useState<string>("");

  // Loading/AI Thinking states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Confidence meter states
  const [diagnosticConfidence, setDiagnosticConfidence] = useState<number>(50);
  const [confidenceHistory, setConfidenceHistory] = useState<{ step: number; value: number; actionText: string }[]>([]);

  // High-Fidelity PACS Workstation States
  const [selectedImagingId, setSelectedImagingId] = useState<string | null>(null);
  const [pacsBrightness, setPacsBrightness] = useState<number>(100);
  const [pacsContrast, setPacsContrast] = useState<number>(100);
  const [pacsZoom, setPacsZoom] = useState<number>(100);
  const [pacsCaliperActive, setPacsCaliperActive] = useState<boolean>(false);
  const [pacsCaliperStart, setPacsCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [pacsCaliperEnd, setPacsCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const pacsImgRef = useRef<HTMLDivElement | null>(null);

  // Diagnostic Images Mapping Helper
  const getImagingForInvestigation = (caseId: string, invId: string) => {
    if (invId === "ecg" || invId === "ekg_stroke") {
      return {
        title: "12-Lead Electrocardiogram (ECG)",
        url: "/src/assets/images/cardio_simulation_1782492064510.jpg",
        modality: "radiology" as const,
        description: "Analyze ST-segment morphology, rhythm intervals, and reciprocal Lead vector relationships."
      };
    }
    if (invId === "cxr" || (caseId === "tension_pneumothorax" && invId === "cxr")) {
      return {
        title: "Chest Radiography (CXR)",
        url: "/src/assets/images/pulmo_simulation_1782492084090.jpg",
        modality: "radiology" as const,
        description: "Inspect lung volume inflation levels, pleural lining separation, flattened diaphragms, or pneumothorax lines."
      };
    }
    if (invId === "ct_head") {
      return {
        title: "Non-contrast Head CT Scan",
        url: "/src/assets/images/neuro_simulation_1782492104992.jpg",
        modality: "radiology" as const,
        description: "Critically evaluate for early ischemic signs or blood collections in the cortical valleys."
      };
    }
    if (caseId === "aki" && invId === "chemistry") {
      return {
        title: "Renal Sonogram / Nephro Scan",
        url: "/src/assets/images/nephro_simulation_1782492139486.jpg",
        modality: "ultrasound" as const,
        description: "Assess echogenicity, parenchymal thickness, and check for any post-renal mechanical hydronephrosis."
      };
    }
    if (caseId === "dka" && invId === "ketones") {
      return {
        title: "Endocrine Metabolic Diagnostic Plot",
        url: "/src/assets/images/endo_simulation_1782492213629.jpg",
        modality: "schema" as const,
        description: "Graphing metabolic anion gap acidosis, severe ketonemic progression, and respiratory compensation."
      };
    }
    if (caseId === "varices" && invId === "endoscopy") {
      return {
        title: "Emergency Upper Gastrointestinal Endoscopy",
        url: "/src/assets/images/gastro_simulation_1782492160980.jpg",
        modality: "endoscopy" as const,
        description: "Visualize distal esophageal columns under active, severe variceal pulsatile hemorrhage or active oozing."
      };
    }
    if (caseId === "preeclampsia" && invId === "ultrasound") {
      return {
        title: "Obstetric Fetal Assessment Sonography",
        url: "/src/assets/images/obgyn_simulation_1782492123527.jpg",
        modality: "ultrasound" as const,
        description: "Evaluate fetal heartbeat patency, gestational sizing parameters, placenta placement, and surrounding amniotic pocket values."
      };
    }
    if (caseId === "tension_pneumothorax" && invId === "ultrasound") {
      return {
        title: "eFAST Pleural Ultrasound (Lung Sliding)",
        url: "/src/assets/images/ortho_simulation_1782492184456.jpg",
        modality: "ultrasound" as const,
        description: "Point-of-Care Ultrasound showing absence of lung-sliding and lack of pleural beach patterns on M-mode."
      };
    }
    return null;
  };

  // If a custom case is injected from an MCQ, immediately start it!
  useEffect(() => {
    if (customCase) {
      startSimulation(customCase);
    }
  }, [customCase]);

  const departments = [
    "All",
    "Internal Medicine",
    "Emergency Medicine",
    "Cardiology",
    "Pulmonology",
    "Endocrinology",
    "Nephrology",
    "Gastroenterology",
    "Neurology",
    "Infectious Disease"
  ];

  // Filter cases based on choices
  const filteredPresets = CLINICAL_TWIN_PRESETS.filter(p => {
    const matchesBoard = p.examBoard === selectedBoard;
    const matchesDiff = p.difficulty === selectedDifficulty;
    const matchesDept = selectedDept === "All" || p.department === selectedDept;
    return matchesBoard && matchesDiff && matchesDept;
  });

  const startSimulation = (preset: ClinicalTwinPreset) => {
    setActivePreset(preset);
    setCurrentVitals(preset.initialVitals);
    setClinicalScore(70);
    setActionsTaken([]);
    setOrderedInvestigations([]);
    setLatestFeedback(null);
    setComplicationActive(false);
    setComplicationText("");
    setShowSummary(false);
    setDiagnosticConfidence(50);
    setConfidenceHistory([]);
    setSelectedImagingId(null);
    setPacsBrightness(100);
    setPacsContrast(100);
    setPacsZoom(100);
    setPacsCaliperActive(false);
    setPacsCaliperStart(null);
    setPacsCaliperEnd(null);
  };

  const handleActionSelect = async (action: TwinAction) => {
    if (isEvaluating || showSummary) return;
    setIsEvaluating(true);

    // Record confidence level at the moment of decision
    setConfidenceHistory(prev => [...prev, {
      step: actionsTaken.length + 1,
      value: diagnosticConfidence,
      actionText: action.text
    }]);

    try {
      // Prepare call to server API for dynamic evaluation
      const response = await fetch("/api/clinical-twin-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetCase: activePreset,
          chosenAction: action.text,
          previousActions: actionsTaken.map(a => a.text),
          currentVitals,
          currentScore: clinicalScore,
          investigationsOrdered: orderedInvestigations
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.correctness) {
          // Dynamic evaluation from Gemini
          const change = Number(data.scoreImpact || 0);
          const nextScore = Math.max(0, Math.min(100, clinicalScore + change));
          
          setClinicalScore(nextScore);
          setActionsTaken(prev => [...prev, action]);
          
          if (data.nextVitals) {
            setCurrentVitals(data.nextVitals);
          }
          
          setLatestFeedback({
            correctness: data.correctness,
            feedback: data.feedback,
            reasoning: data.reasoning,
            pathophysiology: data.pathophysiology,
            pearl: data.pearl,
            scoreChange: change
          });

          if (data.complicationTriggered) {
            setComplicationActive(true);
            setComplicationText(data.complicationDescription || "Acute patient deterioration!");
          }

          setIsEvaluating(false);
          return;
        }
      }
      throw new Error("API Offline or parse failed");
    } catch (err) {
      // Local fallback simulator logic
      const change = action.scoreImpact;
      const nextScore = Math.max(0, Math.min(100, clinicalScore + change));
      
      setClinicalScore(nextScore);
      setActionsTaken(prev => [...prev, action]);

      if (action.nextVitals) {
        setCurrentVitals(action.nextVitals);
      }

      setLatestFeedback({
        correctness: action.correctness,
        feedback: action.feedback,
        reasoning: action.reasoning,
        pathophysiology: action.pathophysiology,
        pearl: action.pearl,
        scoreChange: change
      });

      if (action.complicationTrigger) {
        setComplicationActive(true);
        if (activePreset?.complications) {
          setComplicationText(activePreset.complications.description);
          setCurrentVitals(activePreset.complications.vitals);
        } else {
          setComplicationText("The patient's clinical status is deteriorating rapidly due to this intervention!");
        }
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOrderInvestigation = (invId: string) => {
    if (orderedInvestigations.includes(invId)) return;
    setOrderedInvestigations(prev => [...prev, invId]);
    
    // Auto-select in PACS workstation if it has visual imaging
    if (activePreset) {
      const imgData = getImagingForInvestigation(activePreset.id, invId);
      if (imgData) {
        setSelectedImagingId(invId);
      }
    }

    // Small score penalty for excessive unordered tests (optional realism), but here we praise appropriate diagnostic actions
    setClinicalScore(prev => Math.min(100, prev + 2));
  };

  const handlePacsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pacsCaliperActive || !pacsImgRef.current) return;
    const rect = pacsImgRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (!pacsCaliperStart || (pacsCaliperStart && pacsCaliperEnd)) {
      setPacsCaliperStart({ x, y });
      setPacsCaliperEnd(null);
    } else {
      setPacsCaliperEnd({ x, y });
    }
  };

  const getCaliperDistance = () => {
    if (!pacsCaliperStart || !pacsCaliperEnd) return "0.00";
    const dx = pacsCaliperEnd.x - pacsCaliperStart.x;
    const dy = pacsCaliperEnd.y - pacsCaliperStart.y;
    const pctDist = Math.sqrt(dx * dx + dy * dy);
    // Say 100% of the viewport width is roughly 25.0 cm/mm or other medical scale
    return (pctDist * 0.18).toFixed(2);
  };

  const endCaseSimulation = () => {
    setShowSummary(true);
  };

  const exitSimulation = () => {
    setActivePreset(null);
    setCurrentVitals(null);
    setLatestFeedback(null);
    if (onClearCustomCase) onClearCustomCase();
  };

  // Vital Status Helpers
  const getBPSeverity = (bp: string) => {
    const sys = parseInt(bp.split("/")[0]);
    if (sys > 160 || sys < 90) return "text-rose-600 font-bold animate-pulse";
    if (sys > 140 || sys < 100) return "text-amber-600 font-bold";
    return "text-emerald-600 font-bold";
  };

  const getHRSeverity = (hr: number) => {
    if (hr > 110 || hr < 50) return "text-rose-600 font-bold animate-pulse";
    if (hr > 95 || hr < 60) return "text-amber-600 font-bold";
    return "text-emerald-600 font-bold";
  };

  const getRRSeverity = (rr: number) => {
    if (rr > 24 || rr < 10) return "text-rose-600 font-bold animate-pulse";
    if (rr > 20 || rr < 12) return "text-amber-600 font-bold";
    return "text-emerald-600 font-bold";
  };

  const getSpO2Severity = (spo2: number) => {
    if (spo2 < 90) return "text-rose-600 font-bold animate-pulse";
    if (spo2 < 94) return "text-amber-600 font-bold";
    return "text-emerald-600 font-bold";
  };

  const getClinicalStatus = () => {
    if (complicationActive) return "UNSTABLE - ACUTE DETERIORATION";
    if (!currentVitals) return "UNKNOWN";
    
    const bpSys = parseInt(currentVitals.bp.split("/")[0]) || 120;
    
    if (currentVitals.hr > 115 || currentVitals.hr < 50) return "UNSTABLE - CARDIORESPIRATORY DISTRESS";
    if (currentVitals.spo2 < 92) return "UNSTABLE - HYPOXEMIA";
    if (bpSys < 90 || bpSys > 180) return "UNSTABLE - HEMODYNAMIC COMPROMISE";
    if (currentVitals.rr > 25 || currentVitals.rr < 10) return "UNSTABLE - VENTILATORY FAILURE";
    
    return "STABLE - PHYSIOLOGICALLY COMPENSATED";
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden" id="biotwin-os-container">
      {/* OS Bar */}
      <div className="bg-[#0A192F] text-[#64FEDA] px-4 py-2 flex items-center justify-between border-b border-[#112240] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-widest uppercase">BIOTWIN MEDICAL OS v1.2</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span>HOST: SECURE CLOUD RUN</span>
          <span>MODE: ACTIVE TWIN SIMULATION</span>
        </div>
      </div>

      {!activePreset ? (
        /* Configuration & Case Select Panel */
        <div className="p-6 md:p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex p-2 bg-[#E0F2FE] rounded-2xl text-[#003B95]">
              <Activity className="h-8 w-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-[#0F172A]">
              Clinical Patient Twin Simulation
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Replace static multiple-choice questions with dynamic, evolving synthetic patients. 
              Configure your exam specifications below to synthesize a clinical twin case.
            </p>
          </div>

          {/* Parameters Panel */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exam Board */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider block">1. Exam Board Selection</label>
              <div className="grid grid-cols-3 gap-2">
                {(["USMLE", "FCPS", "PLAB"] as const).map(board => (
                  <button
                    key={board}
                    onClick={() => setSelectedBoard(board)}
                    className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold transition-all ${selectedBoard === board ? "bg-[#003B95] text-white border-[#003B95]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50"}`}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider block">2. Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold transition-all ${selectedDifficulty === diff ? "bg-[#003B95] text-white border-[#003B95]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50"}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2 col-span-1">
              <label className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider block">3. Department Filtering</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border text-xs font-semibold bg-white text-[#0F172A] border-[#E2E8F0] outline-none focus:border-[#003B95]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Preset Cases List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h3 className="font-serif italic font-bold text-[#0F172A] text-lg">
                Available Cases ({filteredPresets.length})
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Phase 1 Library Matching</span>
            </div>

            {filteredPresets.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-[#E2E8F0] rounded-xl text-slate-500 text-xs">
                No preseeded disease models match these exact settings. Try changing Board or Difficulty!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#003B95] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-[#003B95] uppercase tracking-wider">
                          {preset.department}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {preset.difficulty}
                        </span>
                      </div>
                      <h4 className="font-serif italic font-bold text-[#0F172A] text-base leading-snug">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 italic">
                        "{preset.chiefComplaint}"
                      </p>
                    </div>

                    <button
                      onClick={() => startSimulation(preset)}
                      className="w-full mt-4 bg-[#003B95] hover:bg-blue-950 text-white font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg transition-all"
                    >
                      Synthesize Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Patient Twin Simulation Workspace */
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="sim-active-workspace">
          {/* LEFT 5 COLS: Patient Vitals Monitor, History, Investigations */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Health Monitor Dashboard */}
            <div className="bg-[#0B1528] rounded-2xl border border-[#1E293B] overflow-hidden p-4 text-slate-100 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5 mb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400">LIVE PHYSIOLOGICAL TWIN FEED</span>
                <div className="flex items-center gap-1.5 text-red-500 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>CRITICAL PATHWAY</span>
                </div>
              </div>

              {currentVitals && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#121E36] border border-[#1E293B] p-2.5 rounded-xl text-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Blood Pressure</span>
                    <div className={`text-lg font-bold mt-1 ${getBPSeverity(currentVitals.bp)}`}>
                      {currentVitals.bp} <span className="text-[10px] font-mono text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div className="bg-[#121E36] border border-[#1E293B] p-2.5 rounded-xl text-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Heart Rate</span>
                    <div className={`text-lg font-bold mt-1 flex items-center justify-center gap-1 ${getHRSeverity(currentVitals.hr)}`}>
                      <Heart className="h-3.5 w-3.5 fill-red-500 stroke-none animate-pulse shrink-0" />
                      <span>{currentVitals.hr} <span className="text-[10px] font-mono text-slate-400">bpm</span></span>
                    </div>
                  </div>

                  <div className="bg-[#121E36] border border-[#1E293B] p-2.5 rounded-xl text-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Respiration Rate</span>
                    <div className={`text-lg font-bold mt-1 ${getRRSeverity(currentVitals.rr)}`}>
                      {currentVitals.rr} <span className="text-[10px] font-mono text-slate-400">/min</span>
                    </div>
                  </div>

                  <div className="bg-[#121E36] border border-[#1E293B] p-2.5 rounded-xl text-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Oxygen Saturation</span>
                    <div className={`text-lg font-bold mt-1 ${getSpO2Severity(currentVitals.spo2)}`}>
                      {currentVitals.spo2}%
                    </div>
                  </div>

                  <div className="col-span-2 bg-[#121E36] border border-[#1E293B] p-2 rounded-xl text-center">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Body Temp</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">{currentVitals.temp}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Score Tracker HUD */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">
                <span>Clinical Competence Rating</span>
                <span className={clinicalScore >= 75 ? "text-emerald-600" : clinicalScore >= 50 ? "text-amber-600" : "text-rose-600"}>
                  {clinicalScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${clinicalScore >= 75 ? "bg-emerald-500" : clinicalScore >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${clinicalScore}%` }}
                />
              </div>
            </div>

            {/* DIAGNOSTIC CONFIDENCE METER */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs relative overflow-hidden" id="diagnostic-confidence-meter">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-[#003B95]" /> Diagnostic Certainty Meter
                </span>
                <span className="text-xs font-mono font-bold text-[#003B95] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {diagnosticConfidence}%
                </span>
              </div>
              
              <div className="space-y-2.5">
                {/* Visual Gauge Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      diagnosticConfidence <= 30
                        ? "bg-rose-500"
                        : diagnosticConfidence <= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${diagnosticConfidence}%` }}
                  />
                </div>

                {/* Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={diagnosticConfidence}
                    onChange={(e) => setDiagnosticConfidence(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#003B95] active:accent-[#002B70]"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono tracking-wider">
                    <span>0% GUESSING</span>
                    <span>50% DIFFERENTIAL</span>
                    <span>100% CERTAIN</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Assessment */}
              <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed transition-all ${
                diagnosticConfidence >= 75 && clinicalScore < 50
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : diagnosticConfidence <= 35 && clinicalScore >= 75
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : diagnosticConfidence >= 75 && clinicalScore >= 75
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-slate-50 border-slate-100 text-slate-600"
              }`}>
                <div className="font-extrabold uppercase tracking-wider text-[8px] mb-1 flex items-center gap-1.5">
                  <span className="bg-[#003B95] text-white text-[7px] px-1 py-0.5 rounded-xs font-mono">SELF-AWARENESS</span>
                  <span className="text-[#003B95]">
                    {diagnosticConfidence <= 20
                      ? "Uncertain Exploration"
                      : diagnosticConfidence <= 40
                      ? "Formulating Differentials"
                      : diagnosticConfidence <= 60
                      ? "Hypothesis Grounding"
                      : diagnosticConfidence <= 80
                      ? "Active Management"
                      : "Definitive Conviction"}
                  </span>
                </div>
                <p className="font-medium text-[10px] leading-relaxed">
                  {diagnosticConfidence >= 75 && clinicalScore < 50 ? (
                    "⚠️ Dunning-Kruger Warning: Diagnostic certainty is extremely high, but the patient's twin is unstable. Re-verify pathophysiology before ordering further negative inotropes."
                  ) : diagnosticConfidence <= 35 && clinicalScore >= 75 ? (
                    "💡 Imposter Syndrome: Your case management is highly precise, yet you report low certainty. Trust your board preparation instincts!"
                  ) : diagnosticConfidence >= 75 && clinicalScore >= 75 ? (
                    "🌟 Optimal Calibration: Exceptional performance! Your high certainty is backed by correct, high-yield, life-saving clinical decisions."
                  ) : diagnosticConfidence <= 35 && clinicalScore < 50 ? (
                    "🔍 Novice Exploration: Safe and expected early on. Use the diagnostic panel to gather objective clues and refine differentials."
                  ) : (
                    "📈 Refining Differential: Monitor vitals, review ordered labs, and keep adjusting therapeutic options to solidify your diagnostic thesis."
                  )}
                </p>
              </div>

              {/* Quick toggle buttons */}
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {[0, 25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDiagnosticConfidence(val)}
                    className={`py-1 rounded-md text-[9px] font-mono font-bold transition-all ${
                      diagnosticConfidence === val
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* PATIENT PRESENTATION */}
            <div className="border border-[#E2E8F0] rounded-2xl p-4.5 bg-white space-y-3.5" id="patient-presentation-section">
              <h4 className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest pb-1 border-b border-slate-100">
                ==================================<br />
                PATIENT PRESENTATION<br />
                ==================================
              </h4>
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Age & Gender:</strong>
                  {activePreset.age} y/o {activePreset.gender}
                </div>
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Occupation:</strong>
                  {activePreset.occupation}
                </div>
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Chief Complaint:</strong>
                  "{activePreset.chiefComplaint}"
                </div>
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Past Medical History & Family History:</strong>
                  {activePreset.medicalHistory} {activePreset.familyHistory && `• Family History: ${activePreset.familyHistory}`}
                </div>
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Risk Factors:</strong>
                  {activePreset.riskFactors}
                </div>
                <div>
                  <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Physical Exam:</strong>
                  {activePreset.physicalExam}
                </div>
              </div>
            </div>

            {/* CURRENT CLINICAL STATUS */}
            <div className="border border-[#E2E8F0] rounded-2xl p-4.5 bg-white space-y-3" id="current-clinical-status-section">
              <h4 className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest pb-1 border-b border-slate-100">
                ==================================<br />
                CURRENT CLINICAL STATUS<br />
                ==================================
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-3 h-3 rounded-full animate-pulse ${getClinicalStatus().includes("UNSTABLE") ? "bg-red-500" : "bg-emerald-500"}`} />
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${getClinicalStatus().includes("UNSTABLE") ? "text-rose-600" : "text-emerald-600"}`}>
                  * {getClinicalStatus()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-sans">
                {getClinicalStatus().includes("UNSTABLE") 
                  ? "Alert: Critical metabolic, ventilatory, or hemodynamic instability detected. Formulate active correction protocol immediately."
                  : "The patient is currently physiologically compensated. Continue monitoring and implement definitive workup/therapy."}
              </p>
            </div>

            {/* Investigation Lab ordering */}
            <div className="border border-[#E2E8F0] rounded-2xl p-4 bg-white space-y-3">
              <h4 className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest pb-1 border-b border-slate-100">
                🔬 Order Diagnostics & Investigations
              </h4>
              <div className="flex flex-wrap gap-2">
                {activePreset.investigations.map(inv => {
                  const isOrdered = orderedInvestigations.includes(inv.id);
                  return (
                    <button
                      key={inv.id}
                      onClick={() => handleOrderInvestigation(inv.id)}
                      className={`text-xs py-1.5 px-3 rounded-lg border font-semibold transition-all ${isOrdered ? "bg-emerald-50 border-emerald-300 text-emerald-800 cursor-default" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"}`}
                    >
                      {isOrdered ? `✓ ${inv.name}` : `+ ${inv.name}`}
                    </button>
                  );
                })}
              </div>

              {/* Investigation Terminal Log */}
              {orderedInvestigations.length > 0 && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2.5 font-mono text-[11px] text-slate-700 max-h-56 overflow-y-auto" id="investigation-results-pacs-log">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Investigation Results Log:</div>
                  {orderedInvestigations.map(invId => {
                    const inv = activePreset.investigations.find(i => i.id === invId);
                    const hasImaging = !!getImagingForInvestigation(activePreset.id, invId);
                    return (
                      <div key={invId} className="border-b border-slate-100 pb-2.5 mb-2.5 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className="text-[#003B95] font-extrabold text-[10px] uppercase tracking-wide">[{inv?.name}]:</span>
                          {hasImaging && (
                            <button
                              type="button"
                              onClick={() => setSelectedImagingId(invId)}
                              className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${selectedImagingId === invId ? "bg-sky-600 text-white shadow-xs" : "bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100"}`}
                            >
                              👁️ PACS View
                            </button>
                          )}
                        </div>
                        <div className="text-slate-600 leading-relaxed font-sans">{inv?.result}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PACS IMAGING & ECG WORKSTATION */}
            {selectedImagingId && activePreset && (() => {
              const imgData = getImagingForInvestigation(activePreset.id, selectedImagingId);
              if (!imgData) return null;
              
              const filterStyles = {
                filter: `brightness(${pacsBrightness}%) contrast(${pacsContrast}%) grayscale(100%)`
              };
              
              return (
                <div className="bg-[#090D16] border border-[#1E293B] rounded-2xl overflow-hidden text-slate-100 shadow-xl" id="pacs-workstation-viewport">
                  {/* Top Bar Status */}
                  <div className="bg-[#111827] border-b border-[#1E293B] px-3.5 py-2 flex items-center justify-between text-[9px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold tracking-widest text-cyan-400 uppercase">PACS DIAGNOSTICS WORKSTATION v2.0</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedImagingId(null)}
                      className="text-slate-400 hover:text-white font-black text-xs px-1 hover:bg-slate-800 rounded transition-all"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold font-serif italic text-slate-200 tracking-wide">{imgData.title}</span>
                      <span className="font-mono text-[8px] bg-sky-950/80 text-sky-400 px-2 py-0.5 rounded border border-sky-900 uppercase font-black">
                        {imgData.modality}
                      </span>
                    </div>

                    {/* Image Viewport */}
                    <div 
                      ref={pacsImgRef}
                      onClick={handlePacsClick}
                      className="relative border border-slate-800 rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center cursor-crosshair group shadow-inner"
                    >
                      {/* Grid Lines Overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

                      <img 
                        src={imgData.url} 
                        alt={imgData.title}
                        referrerPolicy="no-referrer"
                        style={{
                          ...filterStyles,
                          transform: `scale(${pacsZoom / 100})`,
                          transition: "transform 0.1s ease-out"
                        }}
                        className="object-contain max-h-full max-w-full select-none pointer-events-none"
                      />

                      {/* Caliper Markers & Lines */}
                      {pacsCaliperActive && pacsCaliperStart && (
                        <div 
                          className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full border border-black shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 animate-ping"
                          style={{ left: `${pacsCaliperStart.x}%`, top: `${pacsCaliperStart.y}%` }}
                        />
                      )}
                      {pacsCaliperActive && pacsCaliperStart && (
                        <div 
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-black shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                          style={{ left: `${pacsCaliperStart.x}%`, top: `${pacsCaliperStart.y}%` }}
                        />
                      )}
                      {pacsCaliperActive && pacsCaliperEnd && (
                        <div 
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-black shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                          style={{ left: `${pacsCaliperEnd.x}%`, top: `${pacsCaliperEnd.y}%` }}
                        />
                      )}
                      {pacsCaliperActive && pacsCaliperStart && pacsCaliperEnd && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                          <line 
                            x1={`${pacsCaliperStart.x}%`} 
                            y1={`${pacsCaliperStart.y}%`} 
                            x2={`${pacsCaliperEnd.x}%`} 
                            y2={`${pacsCaliperEnd.y}%`} 
                            stroke="#FACC15"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          <text 
                            x={`${(pacsCaliperStart.x + pacsCaliperEnd.x) / 2}%`} 
                            y={`${(pacsCaliperStart.y + pacsCaliperEnd.y) / 2 - 4}%`}
                            fill="#FACC15"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="monospace"
                            className="text-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                          >
                            {getCaliperDistance()} units
                          </text>
                        </svg>
                      )}

                      {/* Diagnostic Overlay Info */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/85 px-3 py-2 rounded-lg text-[10px] leading-relaxed text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none font-sans border border-slate-800 shadow-md">
                        <strong className="text-cyan-400 uppercase tracking-widest text-[8px] font-mono block mb-1">📟 Clinical Guidance</strong>
                        {imgData.description}
                      </div>
                    </div>

                    {/* Caliper Controls */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setPacsCaliperActive(!pacsCaliperActive);
                          setPacsCaliperStart(null);
                          setPacsCaliperEnd(null);
                        }}
                        className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${pacsCaliperActive ? "bg-yellow-500/20 text-yellow-400 border-yellow-500" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"}`}
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        {pacsCaliperActive ? "CALIPER: ACTIVE" : "CALIPER: STANDBY"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPacsCaliperStart(null);
                          setPacsCaliperEnd(null);
                        }}
                        disabled={!pacsCaliperStart}
                        className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        RESET CALIPERS
                      </button>
                    </div>

                    {/* Image Adjustment Sliders */}
                    <div className="space-y-3 pt-2.5 border-t border-slate-800/80">
                      {/* Brightness */}
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="w-16 text-slate-400 font-extrabold tracking-wider">BRIGHTNESS:</span>
                        <input 
                          type="range" 
                          min="50" 
                          max="150" 
                          value={pacsBrightness} 
                          onChange={(e) => setPacsBrightness(Number(e.target.value))}
                          className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                        />
                        <span className="w-8 text-right text-slate-400">{pacsBrightness}%</span>
                      </div>

                      {/* Contrast */}
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="w-16 text-slate-400 font-extrabold tracking-wider">CONTRAST:</span>
                        <input 
                          type="range" 
                          min="50" 
                          max="150" 
                          value={pacsContrast} 
                          onChange={(e) => setPacsContrast(Number(e.target.value))}
                          className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                        />
                        <span className="w-8 text-right text-slate-400">{pacsContrast}%</span>
                      </div>

                      {/* Zoom */}
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="w-16 text-slate-400 font-extrabold tracking-wider">ZOOM:</span>
                        <input 
                          type="range" 
                          min="100" 
                          max="180" 
                          value={pacsZoom} 
                          onChange={(e) => setPacsZoom(Number(e.target.value))}
                          className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                        />
                        <span className="w-8 text-right text-slate-400">{pacsZoom}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* RIGHT 7 COLS: Main Action Panel and Feedback Terminal */}
          <div className="lg:col-span-7 space-y-6">
            {!showSummary ? (
              <div className="space-y-6">
                {/* Complications Banner */}
                <AnimatePresence>
                  {complicationActive && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4.5 flex gap-3 shadow-sm"
                    >
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          🚨 COMPLICATION ACTIVE
                        </span>
                        <p className="text-xs font-semibold leading-relaxed mt-2 text-rose-800">
                          {complicationText}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Patient Status / Current state */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[#003B95] font-bold text-xs uppercase tracking-wider">
                    <Activity className="h-4 w-4" />
                    <span>Current Presentation & Evolution</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-serif italic">
                    The patient's clinical state is actively evolving. Review vitals monitor and determine appropriate clinical directives.
                  </p>
                </div>

                {/* Available Decision Choices */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest pb-1 border-b border-slate-100">
                    ==================================<br />
                    AVAILABLE ACTIONS<br />
                    ==================================
                  </h4>
                  <div className="space-y-2.5">
                    {/* Render active actions. If complication is active, show complication actions */}
                    {(complicationActive && activePreset.complications
                      ? activePreset.complications.actions
                      : activePreset.actions
                    ).map(action => {
                      const wasTaken = actionsTaken.some(a => a.id === action.id);
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionSelect(action)}
                          disabled={wasTaken || isEvaluating}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${wasTaken ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white hover:bg-slate-50 border-[#E2E8F0] hover:border-slate-300 text-slate-800"}`}
                        >
                          <span className="leading-relaxed">{action.text}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Feedback & Tutor Explanation Panel */}
                <AnimatePresence>
                  {latestFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Alert banner with correctness feedback */}
                      <div className={`p-4.5 rounded-2xl border flex gap-3 shadow-sm ${latestFeedback.correctness === "Correct" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : latestFeedback.correctness === "Partially Correct" ? "bg-sky-50 border-sky-200 text-sky-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
                        {latestFeedback.correctness === "Correct" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${latestFeedback.correctness === "Correct" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                              {latestFeedback.correctness} Decision
                            </span>
                            <span className="font-mono text-[10px] font-bold">
                              {latestFeedback.scoreChange > 0 ? `+${latestFeedback.scoreChange}` : latestFeedback.scoreChange} pts
                            </span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed mt-2 text-slate-800">
                            {latestFeedback.feedback}
                          </p>
                        </div>
                      </div>

                      {/* Tutor Mode Breakdown */}
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#003B95] uppercase tracking-wider border-b border-slate-100 pb-2">
                          <BookOpen className="h-4 w-4 text-[#003B95]" />
                          <span>Tutor Explanations & Board-Syllabus Analysis</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Clinical Reasoning:</strong>
                            <p className="leading-relaxed">{latestFeedback.reasoning}</p>
                          </div>
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Pathophysiology:</strong>
                            <p className="leading-relaxed">{latestFeedback.pathophysiology}</p>
                          </div>
                        </div>

                        <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-lg text-xs leading-relaxed text-[#78350F] flex gap-2.5">
                          <Lightbulb className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold block uppercase tracking-wider text-[9px] mb-1">High-Yield Exam Pearl:</strong>
                            {latestFeedback.pearl}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Conclusion Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={exitSimulation}
                    className="text-slate-500 hover:text-slate-800 text-[10px] font-extrabold uppercase tracking-widest transition-all"
                  >
                    ← Exit Station
                  </button>
                  <button
                    onClick={endCaseSimulation}
                    className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all"
                  >
                    Conclude Twin Case
                  </button>
                </div>
              </div>
            ) : (
              /* Performance Appraisal Scorecard */
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-md"
              >
                <div className="text-center space-y-2">
                  <Award className="h-14 w-14 text-[#003B95] mx-auto" />
                  <h3 className="text-xl font-serif italic font-bold text-[#0F172A]">Clinical Competency Appraisal Report</h3>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Digital Twin OS Concluded</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-[#F1F5F9] py-5">
                  <div className="text-center p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-[9px] text-[#64748B] font-extrabold uppercase tracking-widest">Global Case Score</span>
                    <div className="text-3xl font-black text-slate-800 mt-1">{clinicalScore}%</div>
                  </div>
                  <div className="text-center p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-[9px] text-[#64748B] font-extrabold uppercase tracking-widest">Simulation Result</span>
                    <div className={`text-sm font-bold uppercase tracking-wider mt-3 ${clinicalScore >= 75 ? "text-emerald-600" : clinicalScore >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                      {clinicalScore >= 75 ? "Superior PASS" : clinicalScore >= 50 ? "BORDERLINE PASS" : "UNSATISFACTORY (FAIL)"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                  <div>
                    <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Case Diagnoses Checked:</strong>
                    {activePreset.disease}
                  </div>
                  <div>
                    <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">Direct Interventions Implemented:</strong>
                    {actionsTaken.length === 0 ? "None" : (
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {actionsTaken.map((a, i) => (
                          <li key={i}>{a.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <strong className="text-slate-800 font-bold block uppercase tracking-wider text-[9px]">OS Feedback & Final Pearl:</strong>
                    {clinicalScore >= 75 ? (
                      "Outstanding clinical diagnostic formulation and prompt therapeutic intervention. You successfully navigated the patient's acute pathology while avoiding complications."
                    ) : (
                      "Please review the tutor rationales. Ensure that you establish definitive stabilizing guidelines first, check vitals and appropriate diagnostic logs before prescribing negative inotropes or executing hazardous outpatient discharge."
                    )}
                  </div>

                  {/* Confidence Evolution Timeline */}
                  {confidenceHistory.length > 0 && (
                    <div className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#003B95] uppercase tracking-wider">
                        <TrendingUp className="h-4 w-4" />
                        <span>Diagnostic Certainty Evolution</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Here is how your diagnostic confidence tracked alongside your clinical interventions throughout this simulation:
                      </p>
                      <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                        {confidenceHistory.map((historyItem, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                            <div className="flex flex-col items-center justify-center bg-blue-50 text-[#003B95] rounded-md px-2 py-1 border border-blue-100 font-mono text-center shrink-0 min-w-[55px]">
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none mb-1">Step {historyItem.step}</span>
                              <span className="text-xs font-black leading-none">{historyItem.value}%</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-700 leading-snug block">
                                {historyItem.actionText}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  historyItem.value <= 30
                                    ? "bg-rose-500"
                                    : historyItem.value <= 60
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`} />
                                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">
                                  {historyItem.value <= 20
                                    ? "Uncertain Exploration"
                                    : historyItem.value <= 40
                                    ? "Formulating Differentials"
                                    : historyItem.value <= 60
                                    ? "Hypothesis Grounding"
                                    : historyItem.value <= 80
                                    ? "Active Management"
                                    : "Definitive Conviction"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => startSimulation(activePreset)}
                    className="flex-1 bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-lg shadow-sm transition-all text-center cursor-pointer"
                  >
                    Reset Active Case
                  </button>
                  <button
                    onClick={exitSimulation}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-lg transition-all text-center cursor-pointer"
                  >
                    Exit to Case Library
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
