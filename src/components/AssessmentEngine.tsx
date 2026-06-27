import React, { useState, useEffect, useRef } from "react";
import { PRESEEDED_MCQS, VIRTUAL_PATIENTS, LICENSE_EXAMS, MEDICAL_SPECIALTIES } from "../data";
import { CARDIOLOGY_USMLE1_Q_BANK } from "../data/clinicalQBank";
import { MCQ, ClinicalCase } from "../types";
import { CheckCircle2, XCircle, Award, RefreshCw, Send, ChevronRight, User, ShieldAlert, Activity, BookOpen, Clock, Heart, Sparkles, Layers, Lightbulb, Check, HelpCircle, Timer, Play, Pause, RotateCcw, AlertTriangle, Volume2, VolumeX, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import InteractiveCaseStudy from "./InteractiveCaseStudy";
import BioTwinSimulator from "./BioTwinSimulator";
import AnatomicalSimulator from "./AnatomicalSimulator";

const difficulties: Array<"Easy" | "Intermediate" | "Board-Level"> = ["Easy", "Intermediate", "Board-Level"];

const mapDifficultyToSeed = (diff: "Easy" | "Intermediate" | "Board-Level"): "Easy" | "Medium" | "Hard" => {
  if (diff === "Easy") return "Easy";
  if (diff === "Intermediate") return "Medium";
  return "Hard";
};

interface AssessmentEngineProps {
  initialSpecialtyId?: string | null;
}

export default function AssessmentEngine({ initialSpecialtyId }: AssessmentEngineProps = {}) {
  const [activeTab, setActiveTab] = useState<"mcq" | "osce" | "cases" | "analytics">("mcq");

  // MCQ State
  const [selectedExam, setSelectedExam] = useState("usmle1");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Cardiology");

  useEffect(() => {
    if (initialSpecialtyId) {
      const match = MEDICAL_SPECIALTIES.find(sp => sp.id === initialSpecialtyId);
      if (match) {
        setSelectedSpecialty(match.name);
      }
    }
  }, [initialSpecialtyId]);
  const [difficulty, setDifficulty] = useState<"Easy" | "Intermediate" | "Board-Level">("Intermediate");
  const [currentMCQ, setCurrentMCQ] = useState<MCQ>(PRESEEDED_MCQS[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ correct: 1, total: 2 });

  // BioTwin Simulation States
  const [customTwinCase, setCustomTwinCase] = useState<any>(null);
  const [isGeneratingTwin, setIsGeneratingTwin] = useState<boolean>(false);

  const handleSimulateClinicalTwin = async () => {
    setIsGeneratingTwin(true);
    try {
      const response = await fetch("/api/clinical-twin-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "generate",
          mcqQuestion: currentMCQ.question,
          mcqRationale: currentMCQ.rationale,
          examBoard: selectedExam === "usmle1" ? "USMLE" : selectedExam === "fcps1" ? "FCPS" : "PLAB",
          difficulty: difficulty === "Easy" ? "Easy" : difficulty === "Intermediate" ? "Medium" : "Hard",
          department: currentMCQ.specialty || selectedSpecialty
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.case) {
          setCustomTwinCase(data.case);
          setActiveTab("osce");
          return;
        }
      }
      throw new Error();
    } catch (err) {
      const { CLINICAL_TWIN_PRESETS } = await import("../data/clinicalTwinCases");
      const matched = CLINICAL_TWIN_PRESETS.find(
        p => p.department.toLowerCase() === (currentMCQ.specialty || selectedSpecialty).toLowerCase()
      ) || CLINICAL_TWIN_PRESETS[0];
      setCustomTwinCase(matched);
      setActiveTab("osce");
    } finally {
      setIsGeneratingTwin(false);
    }
  };

  // Flashcards & Spaced Repetition State
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState<MCQ[]>(() => {
    // Seed deck with initial preseeded MCQs so users have content to study immediately
    return [...PRESEEDED_MCQS];
  });
  const [missedQuestions, setMissedQuestions] = useState<MCQ[]>([]);
  const [masteredCards, setMasteredCards] = useState<MCQ[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState<"all" | "missed">("all");

  // Flashcard AI Explain States
  const [showFlashcardAIExplain, setShowFlashcardAIExplain] = useState(false);
  const [isFlashcardAIExplaining, setIsFlashcardAIExplaining] = useState(false);
  const [flashcardAIExplanation, setFlashcardAIExplanation] = useState("");
  const [flashcardAIExplainError, setFlashcardAIExplainError] = useState("");

  const handleFlashcardAIExplain = async (card: MCQ) => {
    if (flashcardAIExplanation) {
      setShowFlashcardAIExplain(!showFlashcardAIExplain);
      return;
    }

    setIsFlashcardAIExplaining(true);
    setFlashcardAIExplainError("");
    setShowFlashcardAIExplain(true);

    try {
      const response = await fetch("/api/explain-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: card.question,
          options: card.options,
          selectedAnswer: card.correctAnswer, // Treat user choice as matching correct answer for complete review
          correctAnswer: card.correctAnswer,
          rationale: card.rationale
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setFlashcardAIExplanation(data.response);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setFlashcardAIExplainError("Failed to fetch personalized AI explanation. Please check your connection or try again.");
    } finally {
      setIsFlashcardAIExplaining(false);
    }
  };

  const getFilteredFlashcards = () => {
    if (flashcardFilter === "missed") {
      return missedQuestions.filter(q => !masteredCards.some(m => m.question === q.question));
    }
    return flashcardDeck.filter(q => !masteredCards.some(m => m.question === q.question));
  };

  const handleSpacedRepetitionResponse = (confidence: "again" | "hard" | "mastered") => {
    const activeDeck = getFilteredFlashcards();
    const card = activeDeck[currentFlashcardIndex];
    if (!card) return;

    // Reset AI explain states for the next card
    setShowFlashcardAIExplain(false);
    setFlashcardAIExplanation("");
    setFlashcardAIExplainError("");

    if (confidence === "mastered") {
      setMasteredCards(prev => [...prev, card]);
      setIsFlipped(false);
      if (currentFlashcardIndex >= activeDeck.length - 1) {
        setCurrentFlashcardIndex(0);
      }
    } else if (confidence === "again") {
      setFlashcardDeck(prev => {
        const nextDeck = [...prev];
        const idxInDeck = nextDeck.findIndex(q => q.question === card.question);
        if (idxInDeck !== -1) {
          const [moved] = nextDeck.splice(idxInDeck, 1);
          return [...nextDeck, moved];
        }
        return nextDeck;
      });
      setIsFlipped(false);
      if (currentFlashcardIndex >= activeDeck.length - 1) {
        setCurrentFlashcardIndex(0);
      }
    } else {
      setFlashcardDeck(prev => {
        const nextDeck = [...prev];
        const idxInDeck = nextDeck.findIndex(q => q.question === card.question);
        if (idxInDeck !== -1) {
          const [moved] = nextDeck.splice(idxInDeck, 1);
          const targetPos = Math.min(nextDeck.length, 3);
          nextDeck.splice(targetPos, 0, moved);
        }
        return nextDeck;
      });
      setIsFlipped(false);
      if (currentFlashcardIndex >= activeDeck.length - 1) {
        setCurrentFlashcardIndex(0);
      }
    }
  };

  // Exam Countdown & High-Stakes Simulation State
  const [isExamModeEnabled, setIsExamModeEnabled] = useState(false);
  const [examPreset, setExamPreset] = useState<"usmle" | "comlex" | "sprint" | "custom">("usmle");
  const [customMinutes, setCustomMinutes] = useState(45);
  const [examTimeRemaining, setExamTimeRemaining] = useState(3600); // 60 mins default
  const [examDuration, setExamDuration] = useState(3600);
  const [isExamTimerRunning, setIsExamTimerRunning] = useState(false);
  const [showTimesUpModal, setShowTimesUpModal] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [timedStats, setTimedStats] = useState({ correct: 0, total: 0 });

  // Reset timer helper
  const handleResetTimer = (presetType = examPreset, durationMins = customMinutes) => {
    let seconds = 3600;
    if (presetType === "usmle") seconds = 3600; // 60 mins
    else if (presetType === "comlex") seconds = 3000; // 50 mins
    else if (presetType === "sprint") seconds = 900; // 15 mins
    else if (presetType === "custom") seconds = durationMins * 60;

    setExamTimeRemaining(seconds);
    setExamDuration(seconds);
    setIsExamTimerRunning(false);
    setShowTimesUpModal(false);
    setTimedStats({ correct: 0, total: 0 });
  };

  // Run the countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isExamModeEnabled && isExamTimerRunning && examTimeRemaining > 0) {
      interval = setInterval(() => {
        setExamTimeRemaining(prev => {
          if (prev <= 1) {
            setIsExamTimerRunning(false);
            setShowTimesUpModal(true);
            if (interval) clearInterval(interval);
            
            // Audio alerting (Web Audio API)
            if (!isSoundMuted) {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Standard A4 tuning
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1.5);
              } catch (e) {
                console.error("Audio trigger failed:", e);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExamModeEnabled, isExamTimerRunning, isSoundMuted]);

  // Adjust preset handler
  const handlePresetChange = (presetType: "usmle" | "comlex" | "sprint" | "custom", customMins: number = customMinutes) => {
    setExamPreset(presetType);
    handleResetTimer(presetType, customMins);
  };

  // OSCE State
  const [selectedCase, setSelectedCase] = useState<ClinicalCase>(VIRTUAL_PATIENTS[0]);
  const [chatInput, setChatInput] = useState("");
  const [patientChat, setPatientChat] = useState<Array<{ role: "doctor" | "patient", text: string }>>([
    { role: "patient", text: `Hello Doctor, ${VIRTUAL_PATIENTS[0].chiefComplaint}. I feel terrible.` }
  ]);
  const [isPatientThinking, setIsPatientThinking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showOSCEResults, setShowOSCEResults] = useState(false);

  // Explain MCQ with AI States
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [isExplainingAI, setIsExplainingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiExplainError, setAiExplainError] = useState("");

  const handleExplainWithAI = async () => {
    if (aiExplanation) {
      setShowAIExplanation(!showAIExplanation);
      return;
    }
    
    setIsExplainingAI(true);
    setAiExplainError("");
    setShowAIExplanation(true);
    
    try {
      const response = await fetch("/api/explain-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentMCQ.question,
          options: currentMCQ.options,
          selectedAnswer: selectedAnswer,
          correctAnswer: currentMCQ.correctAnswer,
          rationale: currentMCQ.rationale
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setAiExplanation(data.response);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setAiExplainError("Failed to fetch personalized AI explanation. Please check your connection or try again.");
    } finally {
      setIsExplainingAI(false);
    }
  };

  // Generate dynamic MCQ using Gemini API
  const generateNewMCQ = async () => {
    setIsGenerating(true);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setAiExplanation("");
    setShowAIExplanation(false);
    setAiExplainError("");
    try {
      const response = await fetch("/api/generate-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: selectedSpecialty,
          difficulty: difficulty,
          currentQuestionText: currentMCQ?.question
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.question && Array.isArray(data.options)) {
          setCurrentMCQ(data);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      // Fallback: pick a matching pre-seeded MCQ with matching difficulty & specialty
      const mappedDiff = mapDifficultyToSeed(difficulty);
      const combinedPool = [...PRESEEDED_MCQS, ...CARDIOLOGY_USMLE1_Q_BANK];
      const matches = combinedPool.filter(
        q => q.specialty.toLowerCase() === selectedSpecialty.toLowerCase() && q.difficulty === mappedDiff
      );
      const fallbackMatches = matches.length > 0 ? matches : combinedPool.filter(q => q.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
      const finalPool = fallbackMatches.length > 0 ? fallbackMatches : combinedPool;

      // Filter out the current question to prevent repetition if possible
      const novelPool = finalPool.filter(q => q.question !== currentMCQ?.question);
      const chosenPool = novelPool.length > 0 ? novelPool : finalPool;

      const fallback = chosenPool[Math.floor(Math.random() * chosenPool.length)] || PRESEEDED_MCQS[0];
      setCurrentMCQ(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically fetch/update question when specialty or difficulty changes
  useEffect(() => {
    generateNewMCQ();
  }, [selectedSpecialty, difficulty]);

  const submitMCQAnswer = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === currentMCQ.correctAnswer;
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Update specialty-based performance in localStorage
    try {
      const storedPerfStr = localStorage.getItem("medglobal-mcq-performance");
      let storedPerf: Record<string, { correct: number; total: number }> = {};
      try {
        if (storedPerfStr && storedPerfStr !== "undefined" && storedPerfStr !== "null") {
          const temp = JSON.parse(storedPerfStr);
          if (temp && typeof temp === "object" && !Array.isArray(temp)) {
            storedPerf = temp;
          }
        }
      } catch (jsonErr) {
        console.error("Failed to parse stored performance in submitMCQAnswer", jsonErr);
      }
      const spec = currentMCQ.specialty || "General Medicine";
      if (!storedPerf[spec]) {
        storedPerf[spec] = { correct: 0, total: 0 };
      }
      storedPerf[spec].correct += isCorrect ? 1 : 0;
      storedPerf[spec].total += 1;
      localStorage.setItem("medglobal-mcq-performance", JSON.stringify(storedPerf));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error updating specialty performance history:", e);
    }

    if (isExamModeEnabled && isExamTimerRunning) {
      setTimedStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }

    if (!isCorrect) {
      setMissedQuestions(prev => {
        if (prev.some(q => q.question === currentMCQ.question)) return prev;
        return [...prev, currentMCQ];
      });
      setFlashcardDeck(prev => {
        if (prev.some(q => q.question === currentMCQ.question)) return prev;
        return [currentMCQ, ...prev];
      });
    }
  };

  // Chat with simulated virtual patient
  const handlePatientChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isPatientThinking) return;

    const userText = chatInput;
    setChatInput("");
    setPatientChat(prev => [...prev, { role: "doctor", text: userText }]);
    setIsPatientThinking(true);

    // Dynamic Step Identification
    const textLower = userText.toLowerCase();
    const newSteps = [...completedSteps];
    if (textLower.includes("pain") || textLower.includes("hurt") || textLower.includes("ache")) {
      if (!newSteps.includes("pain_assess")) newSteps.push("pain_assess");
    }
    if (textLower.includes("history") || textLower.includes("past") || textLower.includes("chronic") || textLower.includes("medication")) {
      if (!newSteps.includes("history")) newSteps.push("history");
    }
    if (textLower.includes("breath") || textLower.includes("lung") || textLower.includes("choke")) {
      if (!newSteps.includes("dyspnea")) newSteps.push("dyspnea");
    }
    if (textLower.includes("vitals") || textLower.includes("blood pressure") || textLower.includes("pulse")) {
      if (!newSteps.includes("vitals")) newSteps.push("vitals");
    }
    setCompletedSteps(newSteps);

    try {
      const response = await fetch("/api/clinical-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          currentHistory: patientChat.map(c => `${c.role}: ${c.text}`).join("\n"),
          userInput: userText,
          patientInfo: selectedCase
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPatientChat(prev => [...prev, { role: "patient", text: data.response }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Offline fallback simulation
      setTimeout(() => {
        let reply = "I am not quite sure about that, doctor. I just want this pressure in my chest to stop.";
        if (textLower.includes("pain")) {
          reply = `The pain is persistent, doctor. It is right in the center of my chest and travels down my left shoulder. It started about an hour ago.`;
        } else if (textLower.includes("history") || textLower.includes("medication")) {
          reply = `I have high blood pressure, and my doctor prescribed me some pills but I sometimes forget to take them regularly. No other surgeries or major illnesses.`;
        } else if (textLower.includes("family")) {
          reply = `My father had a bypass surgery when he was 52 years old, so I am quite scared.`;
        }
        setPatientChat(prev => [...prev, { role: "patient", text: reply }]);
      }, 800);
    } finally {
      setIsPatientThinking(false);
    }
  };

  const handleCaseChange = (c: ClinicalCase) => {
    setSelectedCase(c);
    setPatientChat([
      { role: "patient", text: `Hello Doctor, I am experiencing: "${c.chiefComplaint}". I am quite anxious.` }
    ]);
    setCompletedSteps([]);
    setShowOSCEResults(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden" id="assessment-engine">
      {/* Top High-Stakes Exam Simulation Banner */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800" id="exam-simulation-top-bar">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#003B95] rounded-lg">
            <Timer className={`h-4 w-4 text-white ${isExamTimerRunning ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                Exam Simulation Environment
              </h3>
              {isExamModeEnabled && (
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse tracking-widest">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Simulate high-stakes, time-pressured licensing environments (USMLE / COMLEX-USA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isExamModeEnabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsExamModeEnabled(checked);
                if (checked) {
                  handleResetTimer("usmle");
                } else {
                  setIsExamTimerRunning(false);
                }
              }}
              className="sr-only peer"
              id="toggle-exam-mode"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003B95]"></div>
            <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-300 peer-checked:text-white">
              {isExamModeEnabled ? "ON" : "OFF"}
            </span>
          </label>
        </div>
      </div>

      <AnimatePresence>
        {isExamModeEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-slate-950 border-b border-slate-800"
            id="exam-countdown-dashboard"
          >
            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Presets Column */}
              <div className="md:col-span-4 space-y-2">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Licensing Simulation Preset
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handlePresetChange("usmle")}
                    className={`text-[9px] font-bold uppercase tracking-widest py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${examPreset === "usmle" ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
                  >
                    USMLE Block (60m)
                  </button>
                  <button
                    onClick={() => handlePresetChange("comlex")}
                    className={`text-[9px] font-bold uppercase tracking-widest py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${examPreset === "comlex" ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
                  >
                    COMLEX Block (50m)
                  </button>
                  <button
                    onClick={() => handlePresetChange("sprint")}
                    className={`text-[9px] font-bold uppercase tracking-widest py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${examPreset === "sprint" ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
                  >
                    Quick Sprint (15m)
                  </button>
                  <button
                    onClick={() => handlePresetChange("custom")}
                    className={`text-[9px] font-bold uppercase tracking-widest py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${examPreset === "custom" ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
                  >
                    Custom Limit
                  </button>
                </div>

                {examPreset === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 bg-slate-900 p-2 rounded-lg border border-slate-800"
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Mins:</span>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={customMinutes}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomMinutes(val);
                        handleResetTimer("custom", val);
                      }}
                      className="w-16 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs font-bold text-white outline-none focus:border-[#003B95]"
                    />
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">({customMinutes * 60}s)</span>
                  </motion.div>
                )}
              </div>

              {/* Monospace Countdown Clock Column */}
              <div className="md:col-span-4 flex flex-col items-center justify-center py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                  Time Remaining
                </span>
                
                {/* Formatted Clock Display */}
                <div className={`font-mono text-3xl font-black tracking-widest select-none transition-all ${
                  examTimeRemaining <= 120 
                    ? "text-rose-500 animate-pulse scale-105" 
                    : examTimeRemaining <= 600 
                      ? "text-amber-500" 
                      : "text-emerald-400"
                }`}>
                  {(() => {
                    const h = Math.floor(examTimeRemaining / 3600);
                    const m = Math.floor((examTimeRemaining % 3600) / 60);
                    const s = examTimeRemaining % 60;
                    const pad = (n: number) => n.toString().padStart(2, "0");
                    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
                  })()}
                </div>

                {/* Progress bar inside clock panel */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      examTimeRemaining <= 120
                        ? "bg-rose-500"
                        : examTimeRemaining <= 600
                          ? "bg-amber-500"
                          : "bg-[#003B95]"
                    }`}
                    style={{ width: `${(examTimeRemaining / examDuration) * 100}%` }}
                  />
                </div>

                {/* Speed Pressure Indicator */}
                {examTimeRemaining <= 120 && examTimeRemaining > 0 && (
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 mt-1.5 animate-bounce flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5 text-rose-500 animate-pulse" />
                    <span>CRITICAL WINDOW - ANSWER PROMPTLY!</span>
                  </span>
                )}
              </div>

              {/* Controls Column */}
              <div className="md:col-span-4 flex flex-col justify-between h-full space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExamTimerRunning(!isExamTimerRunning)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg border cursor-pointer transition-all ${isExamTimerRunning ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md" : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md"}`}
                    id="btn-play-pause-timer"
                  >
                    {isExamTimerRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-white stroke-[3]" />
                        <span>Pause Block</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-white stroke-[3]" />
                        <span>Start Block</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleResetTimer()}
                    className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer transition-all"
                    id="btn-reset-timer"
                    title="Reset timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={() => setIsSoundMuted(!isSoundMuted)}
                    className="flex items-center justify-center p-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer transition-all"
                    id="btn-toggle-sound"
                    title={isSoundMuted ? "Unmute audio notifications" : "Mute audio notifications"}
                  >
                    {isSoundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Real-time Timed Block Performance Indicator */}
                <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Current Block score:</span>
                  <span className={`px-2 py-0.5 rounded font-black ${timedStats.total > 0 ? "bg-slate-800 text-[#0369A1]" : "bg-slate-950 text-slate-500"}`}>
                    {timedStats.correct} / {timedStats.total} answered 
                    {timedStats.total > 0 && ` (${Math.round((timedStats.correct / timedStats.total) * 100)}%)`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portals Tabs */}
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-wrap gap-2" id="assessment-tabs-container">
        <button
          onClick={() => setActiveTab("mcq")}
          className={`px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "mcq" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"}`}
          id="btn-mcq-bank"
        >
          Licensing MCQ Q-Bank
        </button>
        <button
          onClick={() => setActiveTab("osce")}
          className={`px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "osce" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"}`}
          id="btn-osce-simulator"
        >
          BioTwin Patient Twin OS
        </button>
        <button
          onClick={() => setActiveTab("cases")}
          className={`px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "cases" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"}`}
          id="btn-interactive-cases"
        >
          Interactive Case Studies
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "analytics" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"}`}
          id="btn-exam-analytics"
        >
          Preparation Analytics
        </button>
      </div>

      {/* Portal 1: MCQ Bank */}
      {activeTab === "mcq" && (
        <div className="p-4 md:p-6 space-y-6" id="mcq-portal-content">
          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-[#E2E8F0] pb-2 gap-4">
            <button
              onClick={() => setIsFlashcardMode(false)}
              className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer ${!isFlashcardMode ? "border-[#003B95] text-[#003B95]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              id="subtab-qbank-practice"
            >
              Q-Bank MCQ Practice
            </button>
            <button
              onClick={() => {
                setIsFlashcardMode(true);
                setIsFlipped(false);
              }}
              className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${isFlashcardMode ? "border-[#003B95] text-[#003B95]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              id="subtab-flashcards-mode"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Missed Concepts Flashcards ({getFilteredFlashcards().length})</span>
            </button>
          </div>

          {!isFlashcardMode ? (
            <div className="space-y-6">
              {/* Top Bar Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">Target Examination</label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] text-xs py-2 px-3 rounded-lg text-slate-800 font-bold outline-none focus:border-[#003B95]"
                  >
                    {LICENSE_EXAMS.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest mb-1.5">Specialty/Subject</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] text-xs py-2 px-3 rounded-lg text-slate-800 font-bold outline-none focus:border-[#003B95]"
                  >
                    {MEDICAL_SPECIALTIES.map(sp => (
                      <option key={sp.id} value={sp.name}>{sp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest flex items-center gap-1">
                      <SlidersHorizontal className="h-3 w-3 text-[#003B95]" />
                      <span>Adjust Difficulty</span>
                    </label>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      difficulty === "Intermediate" ? "bg-blue-50 text-[#003B95] border border-blue-100" :
                      "bg-purple-50 text-purple-700 border border-purple-100"
                    }`}>
                      {difficulty}
                    </span>
                  </div>

                  <div className="relative pt-1 px-1">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={difficulties.indexOf(difficulty)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) as 0 | 1 | 2;
                        setDifficulty(difficulties[val]);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003B95] focus:outline-none focus:ring-2 focus:ring-[#003B95]/20"
                      id="mcq-difficulty-slider"
                      style={{
                        background: `linear-gradient(to right, #003B95 0%, #003B95 ${difficulties.indexOf(difficulty) * 50}%, #E2E8F0 ${difficulties.indexOf(difficulty) * 50}%, #E2E8F0 100%)`
                      }}
                    />
                    <div className="flex justify-between text-[8px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5 mt-1">
                      <span className={difficulty === "Easy" ? "text-emerald-600 font-black" : ""}>Easy</span>
                      <span className={difficulty === "Intermediate" ? "text-[#003B95] font-black" : ""}>Intermediate</span>
                      <span className={difficulty === "Board-Level" ? "text-purple-600 font-black" : ""}>Board-Level</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-2.5 bg-slate-50 p-2 border border-slate-150 rounded-lg">
                    {difficulty === "Easy" && (
                      <span>🎯 <strong>Foundations:</strong> Essential definitions & core mechanisms.</span>
                    )}
                    {difficulty === "Intermediate" && (
                      <span>🎯 <strong>Diagnostics:</strong> Clinical scenarios & therapy selection.</span>
                    )}
                    {difficulty === "Board-Level" && (
                      <span>🎯 <strong>Board Exam:</strong> High-stakes vignettes & next-best-step decisions.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Question and Interactive Anatomical Simulation Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Question Presentation Card */}
                <div className="lg:col-span-7 bg-[#F8FAFC]/50 border border-[#E2E8F0] rounded-xl p-5 md:p-6 space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                    Question Item
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Accuracy: <strong className="text-[#003B95] font-extrabold">{stats.correct}/{stats.total}</strong> ({stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}%)</span>
                    <button
                      onClick={generateNewMCQ}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#003B95] hover:text-blue-900 font-extrabold bg-white border border-[#E2E8F0] shadow-sm py-1.5 px-3 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
                      id="btn-ai-generate-mcq"
                    >
                      <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
                      {isGenerating ? "Generating..." : "AI Generate New"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[#0F172A] text-base md:text-lg font-serif italic leading-relaxed">
                    {currentMCQ.question}
                  </p>

                  {/* MCQ Choices */}
                  <div className="space-y-2">
                    {currentMCQ.options.map((option, idx) => {
                      const isCorrectAnswer = idx === currentMCQ.correctAnswer;
                      const isSelected = idx === selectedAnswer;
                      
                      let choiceClass = "border-[#E2E8F0] bg-white text-slate-700 hover:border-slate-300";
                      if (isSelected && !isSubmitted) {
                        choiceClass = "border-[#003B95] bg-blue-50/40 text-[#003B95] ring-1 ring-[#003B95]/30";
                      } else if (isSubmitted) {
                        if (isCorrectAnswer) {
                          choiceClass = "border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500 font-bold";
                        } else if (isSelected) {
                          choiceClass = "border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-500";
                        } else {
                          choiceClass = "border-[#F1F5F9] bg-[#F8FAFC] text-slate-400 cursor-not-allowed";
                        }
                      }

                      let indexBadgeClass = "bg-slate-100 text-slate-700";
                      if (isSelected && !isSubmitted) {
                        indexBadgeClass = "bg-[#003B95] text-white";
                      } else if (isSubmitted) {
                        if (isCorrectAnswer) {
                          indexBadgeClass = "bg-emerald-600 text-white";
                        } else if (isSelected) {
                          indexBadgeClass = "bg-rose-600 text-white";
                        } else {
                          indexBadgeClass = "bg-slate-200 text-slate-400";
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          whileHover={!isSubmitted ? { x: 3, scale: 1.005 } : {}}
                          whileTap={!isSubmitted ? { scale: 0.995 } : {}}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          onClick={() => !isSubmitted && setSelectedAnswer(idx)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between cursor-pointer ${choiceClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${indexBadgeClass}`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium text-slate-800">{option}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSubmitted && isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                            {isSubmitted && isSelected && !isCorrectAnswer && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Submit / Action Button */}
                  <div className="flex justify-end pt-2">
                    {!isSubmitted ? (
                      <button
                        onClick={submitMCQAnswer}
                        disabled={selectedAnswer === null}
                        className="bg-[#003B95] hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all shadow-sm cursor-pointer"
                        id="btn-mcq-submit"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={generateNewMCQ}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all flex items-center gap-2 cursor-pointer"
                        id="btn-mcq-next"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Rational / Explanation Panel */}
                  {isSubmitted && (
                    <div className="space-y-4">
                      <div className="p-4 bg-sky-50/70 border border-[#BAE6FD] rounded-xl space-y-2.5 mt-4 animate-fadeIn">
                        <div className="flex items-center gap-1.5 text-[#0369A1] font-bold text-xs uppercase tracking-wider">
                          <Award className="h-4 w-4 text-[#0369A1]" />
                          <span>Pathophysiology & Clinical Rationale</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                          {currentMCQ.rationale}
                        </p>

                        {/* Explain with AI & Simulate Twin Trigger */}
                        <div className="pt-3 border-t border-[#BAE6FD]/60 mt-3 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-[#003B95] animate-pulse" />
                            <span>Want to practice this clinical scenario?</span>
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSimulateClinicalTwin}
                              disabled={isGeneratingTwin}
                              className="text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border bg-gradient-to-r from-[#003B95] to-blue-900 text-white border-[#003B95] hover:opacity-90 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              {isGeneratingTwin ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Synthesizing Twin...</span>
                                </>
                              ) : (
                                <>
                                  <Activity className="h-3.5 w-3.5 animate-pulse" />
                                  <span>🔬 Simulate Patient Twin</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleExplainWithAI}
                              className={`text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                showAIExplanation
                                  ? "bg-[#003B95] text-white border-[#003B95]"
                                  : "bg-white hover:bg-slate-50 text-[#003B95] border-[#E2E8F0]"
                              }`}
                              id="btn-mcq-explain-ai"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              <span>{showAIExplanation ? "Hide Breakdown" : "Detailed Breakdown"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Explanation Content Box */}
                      <AnimatePresence>
                        {showAIExplanation && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl space-y-4 shadow-sm">
                              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                                <div className="flex items-center gap-2">
                                  <span className="p-1.5 bg-[#E0F2FE] rounded-lg text-[#0369A1]">
                                    <Lightbulb className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h4 className="font-serif italic font-bold text-sm text-[#0F172A]">Personalized Tutor Analysis</h4>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Custom analysis targeting your selected choice</p>
                                  </div>
                                </div>
                                {isExplainingAI && (
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#003B95]">
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Analyzing response...</span>
                                  </span>
                                )}
                              </div>

                              {isExplainingAI ? (
                                <div className="space-y-3 py-2">
                                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                                  <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                                </div>
                              ) : aiExplainError ? (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs font-semibold">
                                  {aiExplainError}
                                </div>
                              ) : (
                                <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-2.5">
                                  {aiExplanation.split("\n").map((line, idx) => {
                                    let lineHtml: React.ReactNode = line;
                                    if (line.startsWith("### ")) {
                                      lineHtml = <h5 className="font-serif italic font-bold text-sm mt-3 mb-1 text-[#003B95]">{line.replace("### ", "")}</h5>;
                                    } else if (line.startsWith("## ")) {
                                      lineHtml = <h4 className="font-serif italic font-bold text-base mt-4 mb-1 text-[#0F172A] border-b border-[#F1F5F9] pb-1">{line.replace("## ", "")}</h4>;
                                    } else if (line.startsWith("* ")) {
                                      lineHtml = <div className="pl-3 py-0.5 flex items-start gap-1.5 font-medium text-slate-700"><span>•</span><span>{line.replace("* ", "")}</span></div>;
                                    } else if (line.startsWith("- ")) {
                                      lineHtml = <div className="pl-3 py-0.5 flex items-start gap-1.5 font-medium text-slate-700"><span>•</span><span>{line.replace("- ", "")}</span></div>;
                                    }
                                    
                                    if (typeof lineHtml === "string" && lineHtml.includes("**")) {
                                      const parts = lineHtml.split("**");
                                      return (
                                        <p key={idx} className="mb-1 font-medium text-slate-750">
                                          {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-[#003B95]">{p}</strong> : p)}
                                        </p>
                                      );
                                    }
                                    
                                    return <div key={idx} className="font-medium text-slate-750">{lineHtml}</div>;
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Live Anatomical Simulation Panel */}
              <div className="lg:col-span-5">
                <AnatomicalSimulator
                  questionText={currentMCQ.question}
                  specialty={currentMCQ.specialty || selectedSpecialty}
                  selectedAnswerIndex={selectedAnswer}
                  isSubmitted={isSubmitted}
                  correctAnswerIndex={currentMCQ.correctAnswer}
                />
              </div>
            </div>
          </div>
          ) : (
            /* Spaced-Repetition Flashcard Mode */
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <h3 className="font-serif italic font-bold text-[#003B95] text-lg">Spaced-Repetition Review Deck</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold mt-0.5">
                    Reinforce frequently missed concepts with active retrieval
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-extrabold">Pool:</span>
                  <div className="flex bg-white border border-[#E2E8F0] p-0.5 rounded-lg shadow-sm">
                    <button
                      onClick={() => { setFlashcardFilter("all"); setCurrentFlashcardIndex(0); setIsFlipped(false); }}
                      className={`text-[9px] uppercase tracking-wider font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer ${flashcardFilter === "all" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
                    >
                      All Board Concepts ({flashcardDeck.filter(q => !masteredCards.some(m => m.question === q.question)).length})
                    </button>
                    <button
                      onClick={() => { setFlashcardFilter("missed"); setCurrentFlashcardIndex(0); setIsFlipped(false); }}
                      className={`text-[9px] uppercase tracking-wider font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer ${flashcardFilter === "missed" ? "bg-[#003B95] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
                    >
                      Missed Only ({missedQuestions.filter(q => !masteredCards.some(m => m.question === q.question)).length})
                    </button>
                  </div>
                </div>
              </div>

              {getFilteredFlashcards().length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 px-6 bg-[#F8FAFC]/50 border border-dashed border-[#E2E8F0] rounded-2xl max-w-lg mx-auto space-y-4"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                    <Check className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif italic font-bold text-lg text-[#0F172A]">All Concepts Cleared!</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto font-medium">
                      {flashcardFilter === "missed"
                        ? "Terrific! You don't have any pending missed questions left to review in this session."
                        : "Amazing! You have successfully mastered every single flashcard concept in the deck."}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        if (flashcardFilter === "missed") {
                          setFlashcardFilter("all");
                        } else {
                          setMasteredCards([]);
                        }
                        setCurrentFlashcardIndex(0);
                        setIsFlipped(false);
                      }}
                      className="bg-[#003B95] hover:bg-blue-950 text-white font-bold text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-full transition-all shadow-sm cursor-pointer"
                    >
                      {flashcardFilter === "missed" ? "Study All Board Cards" : "Reset & Study Again"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Card {Math.min(currentFlashcardIndex + 1, getFilteredFlashcards().length)} of {getFilteredFlashcards().length}</span>
                      <span className="text-[#0369A1] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Mastered: {masteredCards.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#003B95] h-full transition-all duration-300"
                        style={{ width: `${((Math.min(currentFlashcardIndex + 1, getFilteredFlashcards().length)) / getFilteredFlashcards().length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 3D Flip Card */}
                  <div
                    className="perspective-1000 w-full min-h-[350px] relative"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <motion.div
                      className={`w-full min-h-[350px] relative transform-style-3d transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Card FRONT */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden bg-white border border-[#E2E8F0] hover:border-[#003B95]/50 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6 cursor-pointer"
                        style={{ transform: "rotateY(0deg)" }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1.5 items-center">
                              <span className="bg-sky-50 text-[#0369A1] border border-sky-100 text-[9px] px-2.5 py-1 rounded font-extrabold uppercase tracking-widest">
                                {getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.specialty}
                              </span>
                              <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[9px] px-2.5 py-1 rounded font-extrabold uppercase tracking-widest">
                                {getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.difficulty}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">Active Recall Mode</span>
                          </div>

                          <div className="pt-2">
                            <h4 className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Lightbulb className="h-3.5 w-3.5 text-[#D97706]" />
                              <span>Clinical Case Vignette</span>
                            </h4>
                            <p className="text-slate-800 text-base md:text-lg font-serif italic leading-relaxed">
                              {getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.question}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Click card or button to reveal diagnostic answer</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                            className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Reveal Answer</span>
                          </button>
                        </div>
                      </div>

                      {/* Card BACK */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6 overflow-y-auto cursor-default"
                        style={{ transform: "rotateY(180deg)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Diagnosis & Rationale</span>
                            </span>
                            <button
                              onClick={() => setIsFlipped(false)}
                              className="text-[10px] uppercase tracking-widest font-extrabold text-[#003B95] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>View Question</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Correct Option & Concept:</h5>
                              <div className="mt-1 p-3 bg-emerald-50/40 border border-emerald-100 text-emerald-950 text-base font-serif font-black italic rounded-xl flex items-center justify-between">
                                <span>{getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.options[getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.correctAnswer]}</span>
                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ml-3">
                                  {String.fromCharCode(65 + (getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.correctAnswer || 0))}
                                </span>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-1">Pathophysiology & Clues:</h5>
                              <p className="text-xs md:text-sm text-slate-750 font-semibold leading-relaxed">
                                {getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)]?.rationale}
                              </p>
                            </div>

                            {/* Flashcard Explain with AI integration */}
                            <div className="pt-3 border-t border-[#F1F5F9] mt-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                  <Lightbulb className="h-3.5 w-3.5 text-[#003B95]" />
                                  <span>Need personalized tutor breakdown?</span>
                                </span>
                                <button
                                  onClick={() => handleFlashcardAIExplain(getFilteredFlashcards()[Math.min(currentFlashcardIndex, getFilteredFlashcards().length - 1)])}
                                  className={`text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1.5 rounded-lg border transition-all duration-205 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                    showFlashcardAIExplain
                                      ? "bg-[#003B95] text-white border-[#003B95]"
                                      : "bg-white hover:bg-slate-50 text-[#003B95] border-[#E2E8F0]"
                                  }`}
                                  id="btn-flashcard-explain-ai"
                                >
                                  <Lightbulb className="h-3.5 w-3.5" />
                                  <span>{showFlashcardAIExplain ? "Hide Breakdown" : "Tutor Breakdown"}</span>
                                </button>
                              </div>

                              <AnimatePresence>
                                {showFlashcardAIExplain && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 overflow-hidden text-left"
                                  >
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5">
                                      {isFlashcardAIExplaining ? (
                                        <div className="space-y-2 py-1">
                                          <div className="h-3 bg-slate-200 rounded w-4/5 animate-pulse" />
                                          <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse" />
                                          <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
                                        </div>
                                      ) : flashcardAIExplainError ? (
                                        <div className="text-rose-600 font-bold">{flashcardAIExplainError}</div>
                                      ) : (
                                        <div className="text-slate-700 leading-relaxed font-semibold space-y-2 whitespace-pre-line">
                                          {flashcardAIExplanation}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Spaced-Repetition Feedback */}
                        <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
                          <div className="text-center text-[10px] text-[#64748B] font-extrabold uppercase tracking-widest">
                            Evaluate memory retrieval confidence:
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleSpacedRepetitionResponse("again")}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center shadow-sm"
                            >
                              🔴 Review Again
                            </button>
                            <button
                              onClick={() => handleSpacedRepetitionResponse("hard")}
                              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center shadow-sm"
                            >
                              🟡 Keep in Pool
                            </button>
                            <button
                              onClick={() => handleSpacedRepetitionResponse("mastered")}
                              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center shadow-sm"
                            >
                              🟢 Mastered Card
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Previous / Next Manual Navigation */}
                  <div className="flex justify-between items-center px-2 pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentFlashcardIndex(prev => prev > 0 ? prev - 1 : getFilteredFlashcards().length - 1);
                      }}
                      className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>← Previous Card</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentFlashcardIndex(prev => (prev + 1) % getFilteredFlashcards().length);
                      }}
                      className="text-[10px] uppercase tracking-widest font-extrabold text-[#003B95] hover:underline flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Skip / Next Card →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Portal 2: OSCE Virtual Patient / BioTwin Simulator */}
      {activeTab === "osce" && (
        <div className="p-4 md:p-6" id="osce-portal-content">
          <BioTwinSimulator customCase={customTwinCase} onClearCustomCase={() => setCustomTwinCase(null)} />
        </div>
      )}

      {/* Portal 2.5: Interactive Case Studies */}
      {activeTab === "cases" && (
        <div className="p-4 md:p-6" id="interactive-cases-portal-content">
          <InteractiveCaseStudy />
        </div>
      )}

      {/* Portal 3: Performance Analytics */}
      {activeTab === "analytics" && (
        <div className="p-6 space-y-6" id="analytics-portal-content">
          <div className="text-center max-w-md mx-auto space-y-2">
            <Award className="h-10 w-10 text-[#003B95] mx-auto" />
            <h3 className="text-xl font-serif italic font-bold text-[#0F172A]">Exam Readiness Assessment</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Clinical competence analytics suite</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4.5 rounded-xl">
              <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Global MCQ Accuracy</div>
              <div className="text-3xl font-bold text-[#0F172A] mt-1.5">76.4%</div>
              <p className="text-[10px] text-emerald-600 mt-1.5 font-bold uppercase tracking-wider">▲ +4.2% since last week</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4.5 rounded-xl">
              <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">OSCE Stations Checked</div>
              <div className="text-3xl font-bold text-[#0F172A] mt-1.5">8 / 12</div>
              <p className="text-[10px] text-[#003B95] mt-1.5 font-bold uppercase tracking-wider">Next: Robert Miller</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4.5 rounded-xl">
              <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">AI Practice Priority Recommendation</div>
              <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 py-1.5 px-3 rounded-lg mt-2.5 inline-block uppercase tracking-wider">
                Cardiology: Valve Pathology
              </div>
            </div>
          </div>

          {/* SVG Custom Interactive Chart */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-[#003B95] uppercase tracking-widest">Weekly MCQ Practice Activity</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase">June 2026</span>
            </div>
            {/* Inline SVG Chart */}
            <div className="w-full h-48 bg-white rounded-xl border border-[#E2E8F0] flex items-end justify-between px-8 pb-3 pt-6">
              <div className="flex flex-col items-center h-full justify-end flex-1">
                <div className="bg-[#003B95]/80 w-12 rounded-t-sm hover:bg-[#003B95] transition-all duration-300" style={{ height: "45%" }}></div>
                <span className="text-[9px] font-extrabold text-[#94A3B8] mt-2 uppercase tracking-wider">Wk 1</span>
              </div>
              <div className="flex flex-col items-center h-full justify-end flex-1">
                <div className="bg-[#003B95]/80 w-12 rounded-t-sm hover:bg-[#003B95] transition-all duration-300" style={{ height: "65%" }}></div>
                <span className="text-[9px] font-extrabold text-[#94A3B8] mt-2 uppercase tracking-wider">Wk 2</span>
              </div>
              <div className="flex flex-col items-center h-full justify-end flex-1">
                <div className="bg-[#003B95]/80 w-12 rounded-t-sm hover:bg-[#003B95] transition-all duration-300" style={{ height: "80%" }}></div>
                <span className="text-[9px] font-extrabold text-[#94A3B8] mt-2 uppercase tracking-wider">Wk 3</span>
              </div>
              <div className="flex flex-col items-center h-full justify-end flex-1 animate-pulse">
                <div className="bg-[#003B95] w-12 rounded-t-sm hover:opacity-90 transition-all duration-300" style={{ height: "92%" }}></div>
                <span className="text-[9px] font-extrabold text-[#003B95] mt-2 uppercase tracking-wider font-bold">Wk 4</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Times Up Modal */}
      <AnimatePresence>
        {showTimesUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="times-up-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 animate-bounce">
                  <AlertTriangle className="h-8 w-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                    Simulation Time Expired
                  </span>
                  <h3 className="font-serif italic font-bold text-2xl text-[#0F172A] pt-1">
                    Licensing Block Concluded!
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Your simulated time-pressured exam environment has completed.
                  </p>
                </div>
              </div>

              {/* Block Statistics HUD */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold pb-1.5 border-b border-[#E2E8F0] text-center">
                  Block Performance Scorecard
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="text-center p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Questions Attempted</span>
                    <span className="text-2xl font-black text-slate-800">{timedStats.total}</span>
                  </div>
                  <div className="text-center p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Accuracy</span>
                    <span className={`text-2xl font-black ${timedStats.total > 0 && (timedStats.correct / timedStats.total >= 0.7) ? "text-emerald-600" : "text-rose-500"}`}>
                      {timedStats.total > 0 ? `${Math.round((timedStats.correct / timedStats.total) * 100)}%` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100/70 rounded-lg text-xs text-slate-700 font-semibold leading-relaxed">
                  <span className="text-[#0369A1] font-bold uppercase block text-[9px] tracking-wider mb-0.5">Tutor Diagnostic Feedback:</span>
                  {timedStats.total === 0 ? (
                    "No questions were attempted during this timed block. Try selecting key specialties to build familiarity under quick constraints!"
                  ) : (timedStats.correct / timedStats.total) >= 0.8 ? (
                    "Exceptional speed and diagnostic precision. You are performing at a highly competitive level for top-tier board performance!"
                  ) : (timedStats.correct / timedStats.total) >= 0.6 ? (
                    "Solid block pace. To break into superior tier percentiles, review your AI rationales to isolate minor differential diagnosis errors."
                  ) : (
                    "Time pressure can lead to diagnostic premature closure. Focus on reviewing missed concepts in flashcard mode to solidfy core topics."
                  )}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    handleResetTimer();
                    setIsExamTimerRunning(true);
                  }}
                  className="flex-1 bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-lg shadow-sm transition-all text-center cursor-pointer"
                >
                  Start New Simulated Block
                </button>
                <button
                  onClick={() => setShowTimesUpModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-lg transition-all text-center cursor-pointer"
                >
                  Dismiss & Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
