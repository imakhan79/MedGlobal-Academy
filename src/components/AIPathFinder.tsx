import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  MapPin, 
  DollarSign, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Download, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";

interface PathfinderResult {
  feasibilityCheck: {
    rating: "High" | "Medium" | "Low";
    assessment: string;
  };
  probabilityScore: number;
  probabilityReasoning: string;
  timelinePlanner: {
    durationMonths: number;
    phases: Array<{
      title: string;
      startMonth: number;
      endMonth: number;
      description: string;
      keyActionItems: string[];
    }>;
  };
  examSequence: Array<{
    name: string;
    typicalPrepMonths: number;
    costEstimate: string;
    keyTopics: string[];
    passMark: string;
  }>;
  financialBreakdown: Array<{
    category: string;
    cost: number;
    description: string;
    savingTip: string;
  }>;
  riskFactors: Array<{
    bottleneck: string;
    explanation: string;
    mitigation: string;
  }>;
  recommendedResources: Array<{
    name: string;
    type: "Free" | "Paid";
    cost: string;
    urlDescription: string;
    whyHighYield: string;
  }>;
}

export default function AIPathFinder() {
  // Input form state
  const [currentStatus, setCurrentStatus] = useState("MBBS Graduate");
  const [countryOfTraining, setCountryOfTraining] = useState("India");
  const [budget, setBudget] = useState("Medium");
  const [primaryGoal, setPrimaryGoal] = useState("USMLE (Residency in USA)");
  const [prepDurationMonths, setPrepDurationMonths] = useState(12);
  
  // App states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<PathfinderResult | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  const loadingSteps = [
    "Analyzing your current clinical status...",
    "Querying international licensing database requirements...",
    "Matching budget limits to exam registration tariffs...",
    "Calculating success probability score with historical Match data...",
    "Constructing month-by-month high-yield roadmap guidelines...",
    "Compiling mitigation checklists for risk factors..."
  ];

  const handleActionCheck = (phaseIndex: number, itemIndex: number) => {
    const key = `${phaseIndex}-${itemIndex}`;
    setCheckedActions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setResult(null);

    // Dynamic medical styled loading intervals
    const timer1 = setTimeout(() => setLoadingStep(1), 600);
    const timer2 = setTimeout(() => setLoadingStep(2), 1200);
    const timer3 = setTimeout(() => setLoadingStep(3), 1800);
    const timer4 = setTimeout(() => setLoadingStep(4), 2400);
    const timer5 = setTimeout(() => setLoadingStep(5), 3000);

    try {
      const response = await fetch("/api/pathfinder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStatus,
          countryOfTraining,
          budget,
          primaryGoal,
          prepDurationMonths
        })
      });

      const data = await response.json();
      
      // Delay just a bit for smooth visual transition
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
        // Clear timers
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      }, 3500);

    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const getFeasibilityColor = (rating: string) => {
    switch (rating) {
      case "High": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-rose-600 bg-rose-50 border-rose-200";
    }
  };

  const totalCostEstimate = result?.financialBreakdown.reduce((sum, item) => sum + item.cost, 0) || 0;

  const handleDownloadTxt = () => {
    if (!result) return;
    
    let textContent = `====================================================\n`;
    textContent += `AI DOCTOR PATH FINDER - HIGH-YIELD ROADMAP REPORT\n`;
    textContent += `====================================================\n\n`;
    textContent += `USER PROFILE:\n`;
    textContent += `- Current Status: ${currentStatus}\n`;
    textContent += `- Country of Training: ${countryOfTraining}\n`;
    textContent += `- Target Licensing Goal: ${primaryGoal}\n`;
    textContent += `- Budget Category: ${budget}\n`;
    textContent += `- Target Timeline: ${prepDurationMonths} Months\n\n`;
    
    textContent += `1. FEASIBILITY CHECK:\n`;
    textContent += `Rating: ${result.feasibilityCheck.rating}\n`;
    textContent += `Assessment: ${result.feasibilityCheck.assessment}\n\n`;
    
    textContent += `2. SUCCESS PROBABILITY SCORE: ${result.probabilityScore}%\n`;
    textContent += `Reasoning: ${result.probabilityReasoning}\n\n`;
    
    textContent += `3. EXAM SEQUENCE:\n`;
    result.examSequence.forEach((exam, idx) => {
      textContent += `  Exam ${idx + 1}: ${exam.name}\n`;
      textContent += `  - Prep Time Recommendation: ${exam.typicalPrepMonths} Months\n`;
      textContent += `  - Fees/Cost Estimate: ${exam.costEstimate}\n`;
      textContent += `  - Passing Criteria: ${exam.passMark}\n`;
      textContent += `  - High-Yield Syllabi: ${exam.keyTopics.join(", ")}\n\n`;
    });
    
    textContent += `4. MONTH-BY-MONTH MILESTONE PLANNER:\n`;
    result.timelinePlanner.phases.forEach((phase) => {
      textContent += `  ${phase.title} (Months ${phase.startMonth} - ${phase.endMonth})\n`;
      textContent += `  Description: ${phase.description}\n`;
      textContent += `  Action Items:\n`;
      phase.keyActionItems.forEach(item => {
        textContent += `    [ ] ${item}\n`;
      });
      textContent += `\n`;
    });
    
    textContent += `5. BUDGET ANALYSIS & PROJECTIONS:\n`;
    textContent += `Total Route Estimate: $${totalCostEstimate.toLocaleString()} USD\n`;
    result.financialBreakdown.forEach((item) => {
      textContent += `  - ${item.category}: $${item.cost.toLocaleString()}\n`;
      textContent += `    Details: ${item.description}\n`;
      textContent += `    Saving Tip: ${item.savingTip}\n\n`;
    });
    
    textContent += `6. RISK FACTOR MITIGATIONS:\n`;
    result.riskFactors.forEach((risk) => {
      textContent += `  Roadblock: ${risk.bottleneck}\n`;
      textContent += `  Explanation: ${risk.explanation}\n`;
      textContent += `  Mitigation strategy: ${risk.mitigation}\n\n`;
    });
    
    textContent += `7. HIGH-YIELD CURATED STUDY PLATFORMS:\n`;
    result.recommendedResources.forEach((res) => {
      textContent += `  - ${res.name} (${res.type} - Est. Cost: ${res.cost})\n`;
      textContent += `    Targeted focus: ${res.urlDescription}\n`;
      textContent += `    Why high-yield: ${res.whyHighYield}\n\n`;
    });
    
    textContent += `Report compiled on: ${new Date().toLocaleDateString()} via AI Doctor Path Finder Core.\n`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI_Doctor_Path_Finder_Roadmap_${primaryGoal.split(" ")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" id="ai-pathfinder-portal">
      {/* Upper header segment */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-blue-950">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[#003B95]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 py-1.5 px-3 rounded-full text-xs font-bold text-amber-300">
            <Compass className="h-4 w-4" />
            <span>EXPERT postgraduate CAREER ADVISORY SYSTEM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic font-extrabold tracking-tight">
            AI Doctor Path Finder
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Obtain a personalized, month-by-month navigational roadmap for international medical licensing. 
            Adjust your goals, budget, status, and prep timeline to map your licensing exam sequence, estimate financial fees, identify bottlenecks, and build confidence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <TrendingUp className="h-4 w-4 text-[#003B95]" />
            <h3 className="font-serif italic font-bold text-slate-800 text-base">Your Academic Profile</h3>
          </div>

          <div className="space-y-5">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>Current Status</span>
              </label>
              <select
                id="pf-current-status"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] transition-all cursor-pointer"
              >
                <option value="Student (Pre-clinical)">Student (Pre-clinical)</option>
                <option value="Student (Clinical Phase)">Student (Clinical Phase)</option>
                <option value="Medical Intern / House Officer">Medical Intern / House Officer</option>
                <option value="MBBS Graduate / General Practitioner">MBBS Graduate / General Practitioner</option>
                <option value="Postgraduate Trainee / Specialist">Postgraduate Trainee / Specialist</option>
                <option value="Allied Health Professional">Allied Health Professional</option>
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Country of Medical Training</span>
              </label>
              <input
                id="pf-country-training"
                type="text"
                value={countryOfTraining}
                onChange={(e) => setCountryOfTraining(e.target.value)}
                placeholder="e.g., India, Pakistan, Egypt, UK"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] transition-all"
              />
            </div>

            {/* Target Goal */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                <span>Licensing Goal Pathway</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "USMLE (Residency in USA)", flag: "🇺🇸", label: "USMLE (USA Residency)" },
                  { value: "PLAB / UKMLA (UK Foundation & General Practice)", flag: "🇬🇧", label: "PLAB / UKMLA (UK)" },
                  { value: "MRCP / MRCS (UK Specialty Membership Boards)", flag: "🇬🇧", label: "MRCP Specialty (UK)" },
                  { value: "MCCQE (Residency/Licensing in Canada)", flag: "🇨🇦", label: "MCCQE (Canada)" },
                  { value: "AMC (Licensing in Australia)", flag: "🇦🇺", label: "AMC (Australia)" }
                ].map((item) => {
                  const isSelected = primaryGoal === item.value;
                  return (
                    <button
                      key={item.value}
                      id={`pf-goal-${item.value.split(" ")[0]}`}
                      onClick={() => setPrimaryGoal(item.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-blue-50/70 border-[#003B95] text-[#003B95]" 
                          : "bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="text-lg">{item.flag}</span>
                      <span className="text-xs font-extrabold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Budget Tier limit</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: "Low", range: "< $5k" },
                  { tier: "Medium", range: "$5k - $15k" },
                  { tier: "High", range: "> $15k" }
                ].map((item) => {
                  const isSelected = budget === item.tier;
                  return (
                    <button
                      key={item.tier}
                      id={`pf-budget-${item.tier}`}
                      onClick={() => setBudget(item.tier)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-amber-50/75 border-amber-500 text-amber-700" 
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-slate-500 hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">{item.tier}</span>
                      <span className="text-[9px] font-bold text-[#64748B]">{item.range}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prep Duration Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                <label className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Preparation Timeline</span>
                </label>
                <span className="text-[#003B95] font-black bg-blue-50 py-0.5 px-2 rounded-md">{prepDurationMonths} Months</span>
              </div>
              <input
                id="pf-prep-slider"
                type="range"
                min="6"
                max="36"
                step="6"
                value={prepDurationMonths}
                onChange={(e) => setPrepDurationMonths(Number(e.target.value))}
                className="w-full accent-[#003B95] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#64748B] font-bold">
                <span>6m (Crash)</span>
                <span>12m (Std)</span>
                <span>18m</span>
                <span>24m</span>
                <span>36m (Long)</span>
              </div>
            </div>

            {/* Generate Action */}
            <button
              id="pf-btn-generate"
              onClick={handleGenerate}
              disabled={isLoading || !countryOfTraining}
              className={`w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[11px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || !countryOfTraining ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Constructing Roadmap...</span>
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4 text-amber-300" />
                  <span>Map Licensing Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Results Dashboard */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-[#E2E8F0] rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-6 h-full min-h-[450px]"
                id="pathfinder-loader"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003B95] rounded-full animate-spin"></div>
                  <Compass className="h-6 w-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h4 className="font-serif italic font-bold text-[#0F172A] text-lg">AI Advising Core Active</h4>
                  <p className="text-[#64748B] text-xs font-semibold tracking-wide uppercase animate-pulse">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
                
                <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#003B95] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            )}

            {!isLoading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#F8FAFC]/50 border-2 border-dashed border-[#E2E8F0] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[450px]"
                id="pathfinder-empty"
              >
                <div className="p-4 bg-white rounded-full border border-[#E2E8F0] shadow-sm text-slate-400">
                  <Compass className="h-8 w-8 text-[#64748B]" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="font-serif italic font-bold text-slate-800 text-lg">No Active Licensing Roadmap</h4>
                  <p className="text-[#64748B] text-xs leading-relaxed font-medium">
                    Please submit your academic training status, budget parameters, and licensing targets on the left form to formulate an expert step-by-step preparation timeline.
                  </p>
                </div>
                <button
                  id="pf-empty-generate"
                  onClick={handleGenerate}
                  className="bg-white hover:bg-slate-50 border border-[#E2E8F0] py-2.5 px-6 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Build Standard Route</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </motion.div>
            )}

            {!isLoading && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
                id="pathfinder-results-board"
              >
                {/* 1. KEY SCORES (FEASIBILITY & PROBABILITY) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Probability widget */}
                  <div className="md:col-span-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-slate-100">
                      <TrendingUp className="h-16 w-16 -mr-4 -mt-4" />
                    </div>
                    
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-2">PROBABILITY SCORE OF SUCCESS</span>
                    
                    <div className="relative flex items-center justify-center mb-3">
                      {/* SVG Circle Progress */}
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke={result.probabilityScore >= 75 ? "#10B981" : result.probabilityScore >= 60 ? "#F59E0B" : "#EF4444"} 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - result.probabilityScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-800">{result.probabilityScore}%</span>
                    </div>

                    <p className="text-[11px] text-[#475569] leading-relaxed font-semibold max-w-[200px]">
                      {result.probabilityReasoning}
                    </p>
                  </div>

                  {/* Feasibility Assessment */}
                  <div className="md:col-span-8 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">FEASIBILITY CHECK</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full border ${getFeasibilityColor(result.feasibilityCheck.rating)}`}>
                          {result.feasibilityCheck.rating} Feasibility
                        </span>
                      </div>
                      
                      <h4 className="font-serif italic font-bold text-slate-800 text-lg">AI Evaluator Appraisal</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {result.feasibilityCheck.assessment}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#003B95] bg-blue-50 py-1.5 px-3 rounded-xl border border-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Duration Planner: {prepDurationMonths} Months</span>
                      </div>
                      
                      <button 
                        id="pf-btn-export"
                        onClick={handleDownloadTxt}
                        className="text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Roadmap</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. SEQUENTIAL EXAMS MAP */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <Award className="h-5 w-5 text-[#003B95]" />
                    <h3 className="font-serif italic font-bold text-slate-800 text-base">Required Examination Sequence</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.examSequence.map((exam, idx) => (
                      <div key={idx} className="bg-[#F8FAFC]/75 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#003B95] bg-blue-50 py-0.5 px-2 rounded-md">EXAM {idx + 1}</span>
                            <span className="text-[10px] font-bold text-slate-500">{exam.typicalPrepMonths}m prep</span>
                          </div>
                          
                          <h5 className="font-bold text-slate-800 text-sm leading-tight">{exam.name}</h5>
                          
                          {/* Key Topics List */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">Syllabus Hotspots:</span>
                            <div className="flex flex-wrap gap-1">
                              {exam.keyTopics.map((topic, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-semibold text-[#475569] bg-white border border-slate-200 py-0.5 px-1.5 rounded">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/70 text-[10px] space-y-1">
                          <div className="flex justify-between text-slate-500 font-semibold">
                            <span>Cost Estimate:</span>
                            <span className="text-slate-700 font-extrabold">{exam.costEstimate}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 font-semibold">
                            <span>Target passing mark:</span>
                            <span className="text-[#003B95] font-extrabold">{exam.passMark}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DYNAMIC MILESTONE PLANNER */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#003B95]" />
                      <h3 className="font-serif italic font-bold text-slate-800 text-base">Timeline Milestone Planner</h3>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Month-by-Month Action Items</span>
                  </div>

                  <div className="space-y-6 relative pl-4 md:pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {result.timelinePlanner.phases.map((phase, pIdx) => (
                      <div key={pIdx} className="relative space-y-3">
                        {/* Timeline point indicator */}
                        <div className="absolute -left-[25px] md:-left-[33px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-[#003B95] shadow-sm"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                          <h4 className="font-bold text-slate-800 text-sm md:text-base">{phase.title}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#003B95] bg-blue-50 py-0.5 px-2.5 rounded-lg w-fit">
                            Months {phase.startMonth} - {phase.endMonth}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {phase.description}
                        </p>

                        {/* Checklist items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          {phase.keyActionItems.map((item, iIdx) => {
                            const isChecked = !!checkedActions[`${pIdx}-${iIdx}`];
                            return (
                              <div 
                                key={iIdx} 
                                className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                                  isChecked 
                                    ? "bg-slate-50 border-slate-200 opacity-70" 
                                    : "bg-white border-[#E2E8F0] hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={`chk-${pIdx}-${iIdx}`}
                                  checked={isChecked}
                                  onChange={() => handleActionCheck(pIdx, iIdx)}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#003B95] focus:ring-[#003B95] cursor-pointer"
                                />
                                <label 
                                  htmlFor={`chk-${pIdx}-${iIdx}`}
                                  className={`text-xs text-slate-700 leading-tight font-semibold cursor-pointer select-none ${isChecked ? "line-through text-slate-400" : ""}`}
                                >
                                  {item}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. FINANCIAL BREAKDOWN */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-500" />
                      <h3 className="font-serif italic font-bold text-slate-800 text-base">Estimated Pathway Financial Projections</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">TOTAL ROUTE ESTIMATE</span>
                      <span className="text-lg font-black text-[#003B95]">${totalCostEstimate.toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Tailwind Progress Bar Chart */}
                  <div className="space-y-2">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                      {result.financialBreakdown.map((item, idx) => {
                        const pct = (item.cost / totalCostEstimate) * 100;
                        const bgColors = ["bg-blue-600", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"];
                        return (
                          <div 
                            key={idx} 
                            style={{ width: `${pct}%` }} 
                            className={`${bgColors[idx % bgColors.length]} transition-all duration-500`}
                            title={`${item.category}: $${item.cost.toLocaleString()}`}
                          />
                        );
                      })}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-[9px] text-[#64748B] font-bold">
                      {result.financialBreakdown.map((item, idx) => {
                        const bgDots = ["bg-blue-600", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"];
                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${bgDots[idx % bgDots.length]}`}></span>
                            <span className="truncate">{item.category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Items List */}
                  <div className="space-y-3 pt-3">
                    {result.financialBreakdown.map((item, idx) => (
                      <div key={idx} className="bg-[#F8FAFC]/50 border border-[#E2E8F0] p-4 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5 max-w-xl">
                          <h5 className="font-bold text-slate-800 text-xs">{item.category}</h5>
                          <p className="text-[11px] text-[#475569] leading-relaxed font-semibold">{item.description}</p>
                          <div className="flex items-start gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200/50 p-2 rounded-lg mt-1">
                            <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span><strong className="text-amber-800">Saving Tip:</strong> {item.savingTip}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-700 bg-white border border-slate-200 py-1 px-3 rounded-xl h-fit w-fit shrink-0">
                          ${item.cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. RISK FACTORS & MITIGATION */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
                    <h3 className="font-serif italic font-bold text-slate-800 text-base">Critical Obstacles & Roadblock Mitigations</h3>
                  </div>

                  <div className="space-y-4">
                    {result.riskFactors.map((risk, idx) => (
                      <div key={idx} className="border border-rose-100 bg-rose-50/20 p-4.5 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 block">ROADBLOCK {idx + 1}</span>
                          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                            {risk.bottleneck}
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                            {risk.explanation}
                          </p>
                        </div>
                        
                        <div className="md:col-span-7 bg-white/70 border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">ACTIONABLE AI ROAD ROADBLOCK MITIGATION</span>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                            {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. RECOMMENDED RESOURCES */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <BookOpen className="h-5 w-5 text-[#003B95]" />
                    <h3 className="font-serif italic font-bold text-slate-800 text-base">Curated High-Yield Study Materials</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-[#64748B] bg-slate-50/50">
                          <th className="py-2.5 px-3">Resource Platform</th>
                          <th className="py-2.5 px-3">Model Type</th>
                          <th className="py-2.5 px-3">Estimated Pricing</th>
                          <th className="py-2.5 px-3">Syllabus Utility</th>
                          <th className="py-2.5 px-3">Why High-Yield Essential</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.recommendedResources.map((res, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all font-semibold text-[11px]">
                            <td className="py-3 px-3 text-slate-800 font-extrabold">{res.name}</td>
                            <td className="py-3 px-3">
                              <span className={`py-0.5 px-2 rounded-md font-bold text-[9px] ${
                                res.type === "Free" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}>
                                {res.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{res.cost}</td>
                            <td className="py-3 px-3 text-slate-600">{res.urlDescription}</td>
                            <td className="py-3 px-3 text-slate-700 italic font-normal">{res.whyHighYield}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
