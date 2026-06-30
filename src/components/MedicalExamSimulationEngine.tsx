import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Timer, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  TrendingUp, 
  ChevronRight, 
  RefreshCw, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  Info,
  Sliders,
  HelpCircle,
  Clock,
  BookMarked
} from "lucide-react";

interface Question {
  id: string;
  difficulty: "Recall" | "Clinical Reasoning" | "Board-Level";
  specialty: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  rationale: string;
}

interface SessionStats {
  scorePercent: number;
  percentile: number;
  weakAreas: string[];
  remediationSpecialty: string | null;
  isRemediationActive: boolean;
}

interface HistoryItem {
  id: string;
  specialty: string;
  difficulty: string;
  isCorrect: boolean;
}

export default function MedicalExamSimulationEngine() {
  // Config & Initialization State
  const [examType, setExamType] = useState<"USMLE Step 1" | "USMLE Step 2" | "PLAB 1/UKMLA">("USMLE Step 1");
  const [focusArea, setFocusArea] = useState("Cardiology");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Simulation Active State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [sessionHistory, setSessionHistory] = useState<HistoryItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isInitialized && isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isInitialized, isTimerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSimulation = async () => {
    setIsLoadingQuestion(true);
    setAiExplanation(null);
    setSessionHistory([]);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setTimeRemaining(3600);
    setIsTimerActive(true);

    try {
      const res = await fetch("/api/mese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          focusArea,
          sessionHistory: [],
          currentDifficulty: "Clinical Reasoning",
          currentSpecialty: focusArea === "All/General" ? "Cardiology" : focusArea
        })
      });

      const data = await res.json();
      setCurrentQuestion(data.question);
      setSessionStats(data.sessionStats);
      setIsInitialized(true);
    } catch (err) {
      console.error("MESE initialization failed:", err);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setIsSubmitted(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;
    const newHistoryItem: HistoryItem = {
      id: currentQuestion.id,
      specialty: currentQuestion.specialty,
      difficulty: currentQuestion.difficulty,
      isCorrect
    };

    setSessionHistory(prev => [...prev, newHistoryItem]);
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion) return;
    setIsLoadingQuestion(true);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setAiExplanation(null);

    try {
      const res = await fetch("/api/mese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          focusArea,
          sessionHistory,
          currentDifficulty: currentQuestion.difficulty,
          currentSpecialty: currentQuestion.specialty
        })
      });

      const data = await res.json();
      setCurrentQuestion(data.question);
      setSessionStats(data.sessionStats);
    } catch (err) {
      console.error("Failed to load next MESE question:", err);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleFetchAiExplain = async () => {
    if (!currentQuestion || selectedAnswer === null) return;
    setAiExplainLoading(true);
    setAiExplanation(null);

    try {
      const res = await fetch("/api/explain-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          selectedAnswer,
          correctAnswer: currentQuestion.correctAnswerIndex,
          rationale: currentQuestion.rationale
        })
      });

      const data = await res.json();
      setAiExplanation(data.response);
    } catch (err) {
      console.error("AI Explanation failed:", err);
      setAiExplanation(`**Error fetching dynamic review.** Here is the standard rationale:\n\n${currentQuestion.rationale}`);
    } finally {
      setAiExplainLoading(false);
    }
  };

  const handleReset = () => {
    setIsInitialized(false);
    setCurrentQuestion(null);
    setSessionStats(null);
    setSessionHistory([]);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setAiExplanation(null);
  };

  const correctCount = sessionHistory.filter(h => h.isCorrect).length;
  const totalCount = sessionHistory.length;

  return (
    <div className="space-y-8" id="mese-simulation-portal">
      {/* Upper header segment */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a1e3d] to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-blue-950">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#003B95]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 py-1.5 px-3 rounded-full text-xs font-bold text-rose-300">
            <Activity className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>MESE HIGH-STAKES EXAM BOARD PORTAL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic font-extrabold tracking-tight">
            Medical Exam Simulation Engine
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Shift from passive study to active performance testing. MESE evaluates clinical multi-step logic in real-time, adapting question parameters to verify mastery, and diagnosing weak areas dynamically.
          </p>
        </div>
      </div>

      {!isInitialized ? (
        /* Initialization / Configuration Panel */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E2E8F0] p-6 md:p-8 rounded-3xl shadow-sm max-w-2xl mx-auto space-y-6"
          id="mese-setup-panel"
        >
          <div className="text-center space-y-2">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto border border-red-100">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-serif italic font-bold text-slate-800">Initiate Medical Board Simulation</h3>
            <p className="text-slate-500 text-xs">
              Welcome to the Medical Exam Simulation Engine. To begin, please select your exam type and current area of focus.
            </p>
          </div>

          <div className="space-y-5">
            {/* Exam Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#003B95]" />
                <span>Select Examination Target</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "USMLE Step 1", label: "USMLE Step 1", desc: "Basic Sciences focus" },
                  { id: "USMLE Step 2", label: "USMLE Step 2", desc: "Clinical Sciences focus" },
                  { id: "PLAB 1/UKMLA", label: "PLAB 1 / UKMLA", desc: "UK Medical Council standard" }
                ].map(item => {
                  const isSelected = examType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setExamType(item.id as any)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-blue-50/70 border-[#003B95] text-[#003B95]" 
                          : "bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus Area Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-[#003B95]" />
                <span>Specialty Area of Focus</span>
              </label>
              <select
                id="mese-focus-area"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] transition-all cursor-pointer"
              >
                <option value="Cardiology">Cardiology (Valvular, Ischemic, Dysrhythmias)</option>
                <option value="Pulmonology">Pulmonology (COPD, Interstitial, Neoplasms)</option>
                <option value="Gastroenterology">Gastroenterology (Hepatobiliary, Intestinal)</option>
                <option value="Nephrology">Nephrology (Acid-Base, Acute Kidney Injury)</option>
                <option value="Neurology">Neurology (Stroke, Demyelinating, Neuropathies)</option>
                <option value="Infectious Diseases">Infectious Diseases (Bacterial, Viral, Parasitic)</option>
                <option value="Endocrinology">Endocrinology (Adrenal, Thyroid, Diabetes)</option>
                <option value="All/General">All Specialties (Adaptive General Block Exam)</option>
              </select>
            </div>

            {/* Guidelines box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-[11px] text-[#475569] leading-relaxed">
              <h5 className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-[#003B95]" />
                <span>ACTIVE TESTING PARAMETERS</span>
              </h5>
              <ul className="list-disc pl-4 space-y-1 font-medium">
                <li><strong>Adaptive Challenge:</strong> Success increases complexity; struggling pivots to core recall scaffolding.</li>
                <li><strong>Remediation Phase:</strong> Dropping below 60% in any specialty locks the portal into targeted repair.</li>
                <li><strong>Diagnostics Summary:</strong> Weak areas are flagged and benchmarking calculated in real-time.</li>
              </ul>
            </div>

            <button
              id="mese-btn-start"
              onClick={handleStartSimulation}
              className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="h-4 w-4 text-rose-300" />
              <span>Initiate MESE Exam Portal</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* Active Simulation Dashboard & Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Board Question & Rationale Panel (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {isLoadingQuestion ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-[#E2E8F0] rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]"
                >
                  <RefreshCw className="h-8 w-8 text-[#003B95] animate-spin" />
                  <div className="space-y-1">
                    <h4 className="font-serif italic font-bold text-slate-800 text-base">Formulating Next Board Scenario...</h4>
                    <p className="text-slate-400 text-xs">Applying adaptive difficulty weights based on active accuracy indices.</p>
                  </div>
                </motion.div>
              ) : currentQuestion ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm"
                >
                  {/* Top clinical status rib */}
                  <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 py-1 px-3 rounded-full">
                        Q# {totalCount + 1}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 py-1 px-3 rounded-full">
                        {currentQuestion.difficulty} Level
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Live countdown timer */}
                      <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-800/80 px-3 py-1 rounded-lg text-slate-300">
                        <Timer className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                      
                      {/* Pause/Resume buttons */}
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isTimerActive ? "Pause exam timer" : "Resume exam timer"}
                      >
                        {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Specialty alert block */}
                  <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#003B95]" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">Topic: {currentQuestion.specialty}</span>
                    </div>

                    {sessionStats?.isRemediationActive && (
                      <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 py-0.5 px-2.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>REMEDIATION ACTIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Vignette body */}
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="text-sm md:text-base text-slate-800 leading-relaxed font-serif" id="mese-vignette-text">
                      {currentQuestion.question}
                    </div>

                    {/* Options list A-E */}
                    <div className="space-y-3 pt-2">
                      {currentQuestion.options.map((option, idx) => {
                        const optionChar = String.fromCharCode(65 + idx);
                        const isSelected = selectedAnswer === idx;
                        
                        // Style states
                        let btnStyle = "bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50/50";
                        if (isSelected && !isSubmitted) {
                          btnStyle = "bg-blue-50/70 border-[#003B95] text-[#003B95]";
                        } else if (isSubmitted) {
                          if (idx === currentQuestion.correctAnswerIndex) {
                            btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-50 border-rose-500 text-rose-800";
                          } else {
                            btnStyle = "bg-white border-slate-100 text-slate-400 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            id={`option-${optionChar}`}
                            onClick={() => !isSubmitted && setSelectedAnswer(idx)}
                            disabled={isSubmitted}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 font-semibold text-xs md:text-sm cursor-pointer ${btnStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-extrabold text-xs transition-colors ${
                              isSelected 
                                ? "bg-[#003B95] text-white" 
                                : isSubmitted && idx === currentQuestion.correctAnswerIndex
                                  ? "bg-emerald-600 text-white"
                                  : isSubmitted && isSelected
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                            }`}>
                              {optionChar}
                            </span>
                            <span className="leading-tight mt-0.5">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer Submit & Action Panel */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {isSubmitted && (
                          <button
                            id="btn-ai-explain"
                            onClick={handleFetchAiExplain}
                            disabled={aiExplainLoading}
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100/70 border border-purple-200/50 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {aiExplainLoading ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Generating Explanation...</span>
                              </>
                            ) : (
                              <>
                                <HelpCircle className="h-3.5 w-3.5" />
                                <span>Request Dynamic AI Review</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isSubmitted ? (
                          <button
                            id="btn-submit-answer"
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className={`bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-sm ${
                              selectedAnswer === null ? "opacity-55 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <button
                            id="btn-next-question"
                            onClick={handleNextQuestion}
                            className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* AI Explanation / Detailed Pathophysiology Panel */}
            <AnimatePresence>
              {isSubmitted && currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <BookMarked className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-serif italic font-bold text-slate-800 text-lg">Official Board Explanation</h4>
                  </div>

                  <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">PATHOPHYSIOLOGICAL CORRELATION</span>
                      <p className="font-medium text-slate-700">{currentQuestion.rationale}</p>
                    </div>

                    {/* AI Explanation Display */}
                    {aiExplanation && (
                      <div className="bg-purple-50/30 border border-purple-100 p-5 rounded-2xl text-slate-700 leading-relaxed space-y-3 prose max-w-none prose-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">DYNAMIC LECTURE REVIEW</span>
                        <div className="whitespace-pre-line text-xs font-medium text-[#475569]">
                          {aiExplanation}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Performance Dashboard & Diagnostics (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. SESSION PERFORMANCE STATUS */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <TrendingUp className="h-4 w-4 text-[#003B95]" />
                <h3 className="font-serif italic font-bold text-slate-800 text-base">Active Performance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC]/60 border border-[#E2E8F0] p-3 rounded-xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">ACCURACY RATE</span>
                  <span className="text-xl font-black text-[#003B95] mt-1 block">
                    {totalCount > 0 ? `${Math.round((correctCount / totalCount) * 100)}%` : "N/A"}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-bold">({correctCount} of {totalCount})</span>
                </div>

                <div className="bg-[#F8FAFC]/60 border border-[#E2E8F0] p-3 rounded-xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">BOARD PERCENTILE</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    {sessionStats ? `${sessionStats.percentile}th` : "50th"}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-bold">vs Global IMGs</span>
                </div>
              </div>

              {/* Progress gauge visual */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                  <span>Completed Block</span>
                  <span>{totalCount} Questions</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#003B95] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalCount / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  id="btn-quit-simulation"
                  onClick={handleReset}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Terminate Block
                </button>

                <button
                  id="btn-reset-timer"
                  onClick={() => setTimeRemaining(3600)}
                  className="text-[10px] font-black uppercase tracking-widest text-[#003B95] hover:text-blue-950 transition-colors cursor-pointer"
                >
                  Reset Block Timer
                </button>
              </div>
            </div>

            {/* 2. WEAK AREA DIAGNOSTICS */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="font-serif italic font-bold text-slate-800 text-base">Weak Area Diagnostics</h3>
              </div>

              <div className="space-y-3">
                {sessionStats && sessionStats.weakAreas.length > 0 ? (
                  sessionStats.weakAreas.map((area, idx) => (
                    <div key={idx} className="bg-amber-50/40 border border-amber-200/50 p-3 rounded-xl flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-semibold text-amber-900 leading-normal">{area}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs font-medium italic text-center py-4">
                    Submit answers to map complete physiological diagnoses.
                  </div>
                )}
              </div>
            </div>

            {/* 3. SESSION HISTORY LIST */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] block">SESSION TRACKING LIST</span>
              
              {sessionHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sessionHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        {item.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[120px]">{item.specialty}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{item.difficulty}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs font-medium italic text-center py-4">
                  No questions attempted in this session.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
