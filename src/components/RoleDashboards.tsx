import React, { useState } from "react";
import { UserRole, MCQ, DrugProfile, ClinicalCase } from "../types";
import { PRESEEDED_MCQS, PRESEEDED_DRUGS } from "../data";
import { 
  Award, BookOpen, Brain, CheckCircle, Clock, Database, 
  Eye, FileText, Heart, Shield, TrendingUp, Users, Activity, 
  PlusCircle, Search, Sparkles, Send, Download, BarChart2, 
  HelpCircle, ChevronRight, MessageSquare, AlertTriangle, Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Legend } from "recharts";

interface RoleDashboardsProps {
  role: UserRole;
  userName: string;
  onNavigateTab: (tab: "dashboard" | "exams" | "ai" | "research" | "drugs" | "dictionary" | "credentials" | "admin") => void;
  customMCQs: MCQ[];
  customDrugs: DrugProfile[];
  onAddCustomMCQ: (mcq: MCQ) => void;
  onAddCustomDrug: (drug: DrugProfile) => void;
}

export default function RoleDashboards({ 
  role, 
  userName, 
  onNavigateTab,
  customMCQs,
  customDrugs,
  onAddCustomMCQ,
  onAddCustomDrug
}: RoleDashboardsProps) {

  // Role dashboards state
  const [studentCaseFilter, setStudentCaseFilter] = useState("all");
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // Doctor Sandbox Case State
  const [sandboxPatient, setSandboxPatient] = useState({
    name: "Patient Alpha-9",
    age: 58,
    gender: "Male",
    complaint: "Acute onset tearing chest pain radiating to back",
    bp: "195/110 mmHg",
    hr: 112,
    ecg: "Normal sinus with left ventricular hypertrophy. No acute ST changes.",
    managementChoice: ""
  });
  const [sandboxResponse, setSandboxResponse] = useState("");

  // Faculty state
  const [newCase, setNewCase] = useState({
    name: "",
    age: "",
    gender: "Female",
    chiefComplaint: "",
    hpi: "",
    bp: "120/80",
    hr: "80",
    rr: "16",
    temp: "37.0",
    spo2: "98",
    physicalExam: "",
    finalDiagnosis: "",
    correctManagement: ""
  });
  const [facultyCases, setFacultyCases] = useState<any[]>([]);
  const [facultySuccessMessage, setFacultySuccessMessage] = useState("");

  // Researcher state
  const [syntheticCohortCount, setSyntheticCohortCount] = useState(150);
  const [hypothesizedDrug, setHypothesizedDrug] = useState("β-Blocker Custom-X");
  const [hypothesizedDose, setHypothesizedDose] = useState("50mg");
  const [hypothesisResult, setHypothesisResult] = useState<any>(null);

  // Pharma state
  const [sponsorModuleTitle, setSponsorModuleTitle] = useState("");
  const [sponsorBudget, setSponsorBudget] = useState("10,000");
  const [pharmaSponsorSuccess, setPharmaSponsorSuccess] = useState("");

  // Hospital Admin state
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  // Sample medical flashcards
  const flashcards = [
    { q: "What is the initial drug of choice for pediatric anaphylaxis?", a: "Epinephrine (1:1000 intramuscularly, 0.01 mg/kg, max 0.3-0.5 mg)." },
    { q: "What ECG finding is pathognomonic for cardiac tamponade?", a: "Electrical alternans (alternating amplitude of QRS complexes due to heart swinging)." },
    { q: "How do you distinguish cardiogenic from non-cardiogenic pulmonary edema?", a: "Pulmonary capillary wedge pressure (PCWP) is >18 mmHg in cardiogenic edema." }
  ];

  const handleSandboxExecute = () => {
    if (!sandboxPatient.managementChoice) return;
    let feedback = "";
    if (sandboxPatient.managementChoice === "beta-blockers") {
      feedback = "CORRECT. Intravenous beta-blockers (e.g. Esmolol or Labetalol) are first-line to lower heart rate and shear stress (target systolic BP 100-120 mmHg, HR < 60 bpm) before surgical intervention for Acute Aortic Dissection.";
    } else if (sandboxPatient.managementChoice === "thrombolytics") {
      feedback = "CRITICAL ERROR. Thrombolytics (Alteplase) are strictly contraindicated in Acute Aortic Dissection. Standard administration would trigger catastrophic exsanguination.";
    } else {
      feedback = "PARTIAL COMPREHENSION. Fluids/Vasopressors will increase mean arterial pressure and cardiac output, which would dramatically accelerate aortic dissection tear progression. Initiate urgent vasodilators & beta-blockers.";
    }
    setSandboxResponse(feedback);
  };

  const handleFacultySubmitCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.name || !newCase.chiefComplaint || !newCase.finalDiagnosis) return;
    setFacultyCases([newCase, ...facultyCases]);
    setFacultySuccessMessage(`Successfully compiled new clinical AI simulation case for patient "${newCase.name}"!`);
    setNewCase({
      name: "",
      age: "",
      gender: "Female",
      chiefComplaint: "",
      hpi: "",
      bp: "120/80",
      hr: "80",
      rr: "16",
      temp: "37.0",
      spo2: "98",
      physicalExam: "",
      finalDiagnosis: "",
      correctManagement: ""
    });
    setTimeout(() => setFacultySuccessMessage(""), 4000);
  };

  const runHypothesisSimulation = () => {
    const successRate = hypothesizedDrug.toLowerCase().includes("block") ? 82 : 64;
    const sideEffectsRate = hypothesizedDrug.toLowerCase().includes("block") ? 12 : 24;
    setHypothesisResult({
      successRate,
      sideEffectsRate,
      samplesCount: syntheticCohortCount,
      conclusion: `Efficacy modeling of ${hypothesizedDrug} at ${hypothesizedDose} on ${syntheticCohortCount} simulated profiles demonstrates a statistically significant ${successRate}% clinical target compliance rate (p < 0.05).`
    });
  };

  const handleSponsorSucceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorModuleTitle) return;
    setPharmaSponsorSuccess(`Sponsorship of module "${sponsorModuleTitle}" registered! Approved for 3.5 Continuing Medical Education credits.`);
    setSponsorModuleTitle("");
    setTimeout(() => setPharmaSponsorSuccess(""), 4500);
  };

  // Mock charts data
  const studentPerformanceData = [
    { subject: "Diagnostics", score: 85, avg: 72 },
    { subject: "Therapeutics", score: 92, avg: 78 },
    { subject: "Anatomy", score: 78, avg: 75 },
    { subject: "Pharmacology", score: 80, avg: 70 },
    { subject: "Pathology", score: 88, avg: 80 },
    { subject: "Ethics", score: 95, avg: 88 }
  ];

  const doctorCMECreditsData = [
    { month: "Jan", credits: 4 },
    { month: "Feb", credits: 8 },
    { month: "Mar", credits: 15 },
    { month: "Apr", credits: 18 },
    { month: "May", credits: 24 },
    { month: "Jun", credits: 32 }
  ];

  const syntheticTrialData = [
    { day: "Day 0", placebo: 100, drugA: 100, drugB: 100 },
    { day: "Day 10", placebo: 95, drugA: 85, drugB: 92 },
    { day: "Day 20", placebo: 90, drugA: 60, drugB: 78 },
    { day: "Day 30", placebo: 88, drugA: 35, drugB: 54 },
    { day: "Day 40", placebo: 85, drugA: 20, drugB: 35 }
  ];

  const complianceRates = [
    { name: "Emergency Dept", rating: 94, required: 90 },
    { name: "Cardiology Unit", rating: 98, required: 90 },
    { name: "Intensive Care", rating: 88, required: 90 },
    { name: "Pediatrics Clinic", rating: 91, required: 90 },
    { name: "Obstetrics Ward", rating: 86, required: 90 }
  ];

  return (
    <div className="space-y-6" id="role-dashboard-workspace">
      
      {/* 1. COMPREHENSIVE ROLE BAR */}
      <div className="bg-gradient-to-r from-[#003B95] to-blue-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-6">
          <Brain className="w-64 h-64" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-[#003B95] font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow-sm">
              🔑 verified {role} portal
            </span>
            <h2 className="text-2xl md:text-3xl font-serif italic font-black">
              Welcome back, {userName || "Clinical Specialist"}
            </h2>
            <p className="text-xs text-slate-200 font-medium max-w-xl">
              MedGlobal Academy has custom-compiled your workspace with clinical decision trackers, real-time proctors, and specialized simulation engines.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab("exams")}
              className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest py-2.5 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="h-4 w-4 text-amber-300" />
              <span>Launch Case Q-Bank</span>
            </button>
            <button
              onClick={() => onNavigateTab("ai")}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-[10px] font-extrabold uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Consult Medical AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SPECIFIC ROLE LAYOUTS */}
      
      {/* ==================== 🧑🎓 STUDENT DASHBOARD ==================== */}
      {role === UserRole.STUDENT && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="student-role-dashboard">
          {/* Main section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Simulation Lab Cases */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#003B95]" />
                  <h3 className="font-serif italic font-bold text-slate-900 text-lg">Active Simulation Lab</h3>
                </div>
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {["all", "cardiology", "respiratory", "pediatrics"].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setStudentCaseFilter(filter)}
                      className={`text-[9px] font-extrabold uppercase tracking-wide py-1 px-2.5 rounded-md transition-all ${
                        studentCaseFilter === filter ? "bg-white text-[#003B95] shadow-xs" : "text-[#64748B] hover:text-slate-800"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "case-1", title: "Acute Coronary Occlusion", dept: "Cardiology", diff: "Hard", status: "Assigned", time: "25 min" },
                  { id: "case-2", title: "Pediatric Epiglottitis Emergency", dept: "Pediatrics", diff: "Medium", status: "Assigned", time: "15 min" },
                  { id: "case-3", title: "COPD Exacerbation & Acidosis", dept: "Respiratory", diff: "Medium", status: "Completed", score: "94%" },
                  { id: "case-4", title: "Surgical Sepsis Protocol", dept: "Surgery", diff: "Hard", status: "Assigned", time: "30 min" }
                ].filter(c => studentCaseFilter === "all" || c.dept.toLowerCase() === studentCaseFilter).map(c => (
                  <div key={c.id} className="bg-slate-50 hover:bg-slate-100/70 p-4 border border-slate-200/60 rounded-xl transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="bg-white text-slate-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-slate-200 rounded">
                          {c.dept}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          c.diff === "Hard" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {c.diff}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{c.title}</h4>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px]">
                      <span className="text-[#64748B] font-semibold">
                        {c.status === "Completed" ? `Score: ${c.score}` : `Est. Time: ${c.time}`}
                      </span>
                      <button
                        onClick={() => onNavigateTab("exams")}
                        className={`text-[9px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-lg transition-all ${
                          c.status === "Completed" 
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                            : "bg-[#003B95] text-white hover:bg-blue-950 shadow-xs"
                        }`}
                      >
                        {c.status === "Completed" ? "Review Case" : "Start Simulation"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments Desk */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Assignments Desk</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Weekly Board Review Quiz #12", due: "In 2 days", items: "50 MCQ Q-Bank", points: "100 pts" },
                  { title: "Clinical OSCE Objective Exam - Shock Management", due: "In 5 days", items: "Interactive Virtual Lab", points: "Pass/Fail" }
                ].map((asg, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-xl gap-3 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">{asg.title}</h4>
                      <p className="text-[10px] text-[#64748B] font-medium">{asg.items} • {asg.points}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded uppercase tracking-wider">
                        ⏰ Due {asg.due}
                      </span>
                      <button
                        onClick={() => onNavigateTab("exams")}
                        className="text-[9px] font-black uppercase tracking-widest bg-white border border-slate-300 hover:border-slate-400 p-2 rounded-lg transition-all"
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Performance reports & Flashcards */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Radar Charts performance */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Academic Performance Matrix</h4>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={studentPerformanceData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 8, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 8 }} />
                    <Radar name="My Score" dataKey="score" stroke="#003B95" fill="#003B95" fillOpacity={0.25} />
                    <Radar name="Class Average" dataKey="avg" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.05} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[9px] font-black uppercase tracking-wider text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#003B95] rounded"></span>
                  <span>My Performance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-300 rounded"></span>
                  <span>Class Average</span>
                </div>
              </div>
            </div>

            {/* Study Modules: AI Flashcards */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">AI Study Flashcards</h4>
                <span className="text-[9px] text-slate-400 font-bold">{activeFlashcard + 1} / {flashcards.length}</span>
              </div>

              {/* Flashcard Component */}
              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="h-36 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between items-center text-center cursor-pointer hover:bg-slate-100/70 transition-all relative perspective-1000"
              >
                <div className="text-[8px] font-extrabold text-[#003B95] uppercase tracking-widest mb-1">
                  {isCardFlipped ? "💡 ANSWER REVEALED" : "❓ CLICK TO REVEAL KEY CONCEPT"}
                </div>
                <p className={`text-xs text-slate-800 leading-relaxed max-w-sm ${isCardFlipped ? "font-serif italic font-semibold text-slate-900" : "font-bold"}`}>
                  {isCardFlipped ? flashcards[activeFlashcard].a : flashcards[activeFlashcard].q}
                </p>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase">
                  Double check with latest WHO guidelines
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveFlashcard(prev => (prev - 1 + flashcards.length) % flashcards.length);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveFlashcard(prev => (prev + 1) % flashcards.length);
                  }}
                  className="bg-[#003B95] hover:bg-blue-950 text-white text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all shadow-xs"
                >
                  Next Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==================== 🥼 DOCTOR DASHBOARD ==================== */}
      {role === UserRole.DOCTOR && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="doctor-role-dashboard">
          {/* Advanced Case Simulator */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-serif italic font-bold text-slate-900 text-lg">Advanced Sandbox Simulator</h3>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-emerald-200 rounded">
                  High-Risk Case Model
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 text-xs leading-relaxed">
                <div>
                  <strong className="text-[9px] text-[#64748B] uppercase tracking-widest block">Patient Presentation:</strong>
                  <span className="font-bold text-slate-900">{sandboxPatient.name} (Age {sandboxPatient.age}, {sandboxPatient.gender})</span>
                </div>
                <div>
                  <strong className="text-[9px] text-[#64748B] uppercase tracking-widest block">Chief Complaint:</strong>
                  <span className="font-serif italic text-slate-800 font-bold">"{sandboxPatient.complaint}"</span>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-white p-2.5 rounded-lg border border-slate-200/60 font-mono text-[10px]">
                  <div>
                    <span className="text-[#64748B] block uppercase text-[8px] font-bold">Vitals Blood Pressure</span>
                    <span className="font-bold text-red-600">{sandboxPatient.bp}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block uppercase text-[8px] font-bold">Heart Rate</span>
                    <span className="font-bold text-red-600">{sandboxPatient.hr} bpm</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block uppercase text-[8px] font-bold">Initial ECG Reading</span>
                    <span className="font-bold text-slate-700 truncate">{sandboxPatient.ecg}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Select Sandbox Medical Action:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "beta-blockers", label: "Intravenous Esmolol Infusion", desc: "Reduce pressure shear force" },
                      { id: "thrombolytics", label: "Alteplase (Thrombolytics)", desc: "Restore arterial perfusion" },
                      { id: "fluids", label: "Aggressive Crystalloid bolus", desc: "Target hypotensive response" }
                    ].map(act => (
                      <button
                        key={act.id}
                        onClick={() => setSandboxPatient(p => ({ ...p, managementChoice: act.id }))}
                        className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                          sandboxPatient.managementChoice === act.id 
                            ? "bg-emerald-500/5 border-emerald-500 ring-1 ring-emerald-500" 
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-900 block">{act.label}</span>
                        <span className="text-[8px] text-[#64748B] block mt-0.5 leading-none">{act.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSandboxExecute}
                    className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Execute Clinical Intervention
                  </button>
                </div>
              </div>

              {/* Sandbox response panel */}
              {sandboxResponse && (
                <div className={`p-4 rounded-xl border animate-slideUp text-xs leading-relaxed space-y-1 ${
                  sandboxResponse.includes("CORRECT") 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : sandboxResponse.includes("ERROR") 
                      ? "bg-red-50 border-red-200 text-red-800 font-bold"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[10px]">
                    <CheckCircle className="h-4 w-4" />
                    <span>Clinical Outcome Assessment Report</span>
                  </div>
                  <p>{sandboxResponse}</p>
                </div>
              )}
            </div>

            {/* Peer consultation portal */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Physician Consultation Portal</h3>
              </div>
              <div className="space-y-3">
                {[
                  { doctor: "Dr. Sarah Chen, MD", specialty: "Interventional Cardiology", casesCount: "4 shared", caseRef: "Aortic Dissection presentation review" },
                  { doctor: "Dr. Robert Patel, MD", specialty: "Critical Care", casesCount: "1 shared", caseRef: "Septic Shock vasopressor refractory model" }
                ].map((doc, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.doctor}</span>
                        <span className="text-[8px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">{doc.specialty}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] font-medium">Case Reference: <em>{doc.caseRef}</em></p>
                    </div>
                    <button
                      onClick={() => alert(`Consulting Board Room initialized with ${doc.doctor}. Dynamic medical chart screen is active.`)}
                      className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-extrabold text-[9px] uppercase tracking-widest py-2 px-4 rounded-lg transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Enter Board Room
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: CME tracker & Clinical insights */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CME Credits Progress */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Continuing Education (CME) Tracking</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Earned Credits</span>
                  <span>32 / 50 CME Hours</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "64%" }} />
                </div>
                <p className="text-[9px] text-[#64748B] font-medium leading-relaxed">
                  Earn 18 more CME credits by completing assigned Clinical OSCE simulations before December 31, 2026.
                </p>
              </div>

              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={doctorCMECreditsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 8 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 8 }} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="credits" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Clinical Insights Feed */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">AI Diagnostic Insights</h4>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[10px] uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Sepsis Recognition Lag</span>
                  </div>
                  <p className="text-[#64748B] text-[10px] leading-relaxed font-medium">
                    Analysis of 12,000 national simulated scenarios shows an average 45-minute delay in initiating early goal-directed septic shock fluid boluses. 
                  </p>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-[10px] uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Breakthrough Algorithm</span>
                  </div>
                  <p className="text-[#64748B] text-[10px] leading-relaxed font-medium">
                    FDA approves synthetic clinical modeling for cardiac ejection fraction measurements. Updated case templates are loaded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==================== 🏫 FACULTY DASHBOARD ==================== */}
      {role === UserRole.FACULTY && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="faculty-role-dashboard">
          
          {/* Main Case Creator Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Simulation Case Builder Form */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Clinical Simulation Scenario Builder</h3>
                <p className="text-xs text-[#64748B] font-medium mt-1">Design customized diagnostic patient profiles for your student groups.</p>
              </div>

              {facultySuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl animate-fadeIn">
                  {facultySuccessMessage}
                </div>
              )}

              <form onSubmit={handleFacultySubmitCase} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Patient Pseudonym</label>
                    <input
                      type="text"
                      required
                      value={newCase.name}
                      onChange={(e) => setNewCase(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Patient Sigma-5"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Age</label>
                    <input
                      type="number"
                      required
                      value={newCase.age}
                      onChange={(e) => setNewCase(p => ({ ...p, age: e.target.value }))}
                      placeholder="e.g. 45"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Gender</label>
                    <select
                      value={newCase.gender}
                      onChange={(e) => setNewCase(p => ({ ...p, gender: e.target.value }))}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white font-bold text-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Chief Complaint</label>
                  <input
                    type="text"
                    required
                    value={newCase.chiefComplaint}
                    onChange={(e) => setNewCase(p => ({ ...p, chiefComplaint: e.target.value }))}
                    placeholder="e.g. Sudden severe headache and stiff neck"
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Final Diagnosis</label>
                    <input
                      type="text"
                      required
                      value={newCase.finalDiagnosis}
                      onChange={(e) => setNewCase(p => ({ ...p, finalDiagnosis: e.target.value }))}
                      placeholder="e.g. Subarachnoid Hemorrhage (SAH)"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Correct Management choice</label>
                    <input
                      type="text"
                      required
                      value={newCase.correctManagement}
                      onChange={(e) => setNewCase(p => ({ ...p, correctManagement: e.target.value }))}
                      placeholder="e.g. Urgent Head CT without contrast, neurosurgical consult"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Compile AI Patient Simulation Case</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Custom Cases Roster */}
            {facultyCases.length > 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Active Classroom Simulation Queue</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  {facultyCases.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900">{c.name} ({c.age}yo {c.gender})</span>
                        <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">Dx: {c.finalDiagnosis}</p>
                      </div>
                      <span className="bg-[#003B95]/10 text-[#003B95] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Active in Classroom
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: live proctor and analytics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live exam proctor feed */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Live Proctoring Monitor</h4>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0"></span>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { student: "Student Amara O.", case: "Pediatric Sepsis", action: "Administered Epinephrine instead of fluids", status: "Critical Path Deviation", time: "Just now", alert: true },
                  { student: "Student David K.", case: "COPD Acidosis", action: "Completed Non-Invasive Ventilation setup", status: "Milestone Reached", time: "3 min ago", alert: false }
                ].map((act, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border space-y-1.5 ${
                    act.alert ? "bg-red-50/50 border-red-100 text-red-900" : "bg-slate-50 border-slate-200/60 text-slate-900"
                  }`}>
                    <div className="flex justify-between items-center text-[9px] font-extrabold">
                      <span className="text-[#003B95]">{act.student}</span>
                      <span className="text-[#94A3B8] font-medium">{act.time}</span>
                    </div>
                    <div className="font-medium text-[10px] leading-relaxed">
                      <strong>{act.case}</strong>: {act.action}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block ${
                      act.alert ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Struggle topics engine */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Topic Struggle Analytics</h4>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-800 mb-1">
                    <span>Acid-Base Interpretation</span>
                    <span>72% of Students struggling</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-800 mb-1">
                    <span>Pediatric Resuscitation</span>
                    <span>54% of Students struggling</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "54%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==================== 🔬 RESEARCHER DASHBOARD ==================== */}
      {role === UserRole.RESEARCHER && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="researcher-role-dashboard">
          {/* Main sandbox cohort simulator */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-600" />
                  <h3 className="font-serif italic font-bold text-slate-900 text-lg">Synthetic Cohort Generator & Hypothesis Sandbox</h3>
                </div>
                <span className="bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-amber-200 rounded">
                  Cohort Sandbox
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Inputs */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#003B95]">Simulate Target Patient Cohorts</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Cohorts Sample Count</label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={syntheticCohortCount}
                      onChange={(e) => setSyntheticCohortCount(Number(e.target.value))}
                      className="w-full accent-[#003B95] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-[#003B95]">
                      <span>50 Profiles</span>
                      <span className="bg-white border px-2 py-0.5 rounded shadow-2xs">{syntheticCohortCount} Virtual Profiles</span>
                      <span>1,000 Profiles</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Hypothesized Drug Compound</label>
                    <input
                      type="text"
                      value={hypothesizedDrug}
                      onChange={(e) => setHypothesizedDrug(e.target.value)}
                      placeholder="e.g. β-Blocker Custom-X"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Target Dosage</label>
                    <input
                      type="text"
                      value={hypothesizedDose}
                      onChange={(e) => setHypothesizedDose(e.target.value)}
                      placeholder="e.g. 50mg daily"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <button
                    onClick={runHypothesisSimulation}
                    className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>Run Cohort Drug Trial Efficacy Simulator</span>
                  </button>
                </div>

                {/* Cohort Output Data preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#003B95] mb-2">Simulated Study Registry Preview</h4>
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-lg font-mono text-[9px] text-slate-700 leading-normal h-32 overflow-y-auto">
                      ID, Age, Sex, Baseline BP, ComplianceStatus, sideEffects<br/>
                      #001, 62, M, 142/90, COMPLIANT, None<br/>
                      #002, 54, F, 155/92, COMPLIANT, Headache<br/>
                      #003, 71, M, 168/98, NON-COMPLIANT, Dizziness<br/>
                      #004, 48, F, 138/84, COMPLIANT, None<br/>
                      #005, 65, F, 160/95, COMPLIANT, None
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => alert(`Anonymized patient dataset compiled with SHA-256 cryptographic compliance. Successfully initiated synthetic export of ${syntheticCohortCount} patient rows to CSV/JSON format.`)}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-extrabold text-[9px] uppercase tracking-widest py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export Anonymized CSV Dataset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hypothesis Results report */}
              {hypothesisResult && (
                <div className="p-4 bg-[#E0F2FE]/40 border border-blue-100 rounded-2xl animate-fadeIn space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-[#003B95] uppercase tracking-wider text-[10px]">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Simulated Clinical Trial Assessment Report</span>
                  </div>
                  <p className="font-serif italic font-semibold text-slate-900 leading-relaxed">
                    "{hypothesisResult.conclusion}"
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center pt-1 font-mono text-[10px]">
                    <div className="bg-white p-2 border rounded-lg">
                      <span className="text-slate-500 block">Simulated Compound Efficacy</span>
                      <span className="text-emerald-600 font-black text-sm">{hypothesisResult.successRate}%</span>
                    </div>
                    <div className="bg-white p-2 border rounded-lg">
                      <span className="text-slate-500 block">Modeled Side-Effect Rate</span>
                      <span className="text-amber-600 font-black text-sm">{hypothesisResult.sideEffectsRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Publication draft Workspace */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Publication Manuscript Workspace</h3>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#003B95] bg-[#003B95]/5 border border-[#003B95]/10 px-2 py-0.5 rounded">
                    Draft Manuscript - Version 1.2
                  </span>
                  <h4 className="font-serif font-bold text-sm text-slate-900">Comparative Efficacy of Synthetic Compound Simulations on Arterial Vasodilation</h4>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    <strong>Abstract:</strong> Here we present the clinical trial modeling output of virtual cohorts (N={syntheticCohortCount}) subjected to targeted receptors modeling. Our findings indicate a profound reduction in shear parietal forces (p &lt; 0.05).
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => alert("Manuscript auto-draft has been successfully synchronized with your Google Drive / Workspace library.")}
                    className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[9px] uppercase tracking-widest py-2 px-4 rounded-lg transition-all cursor-pointer"
                  >
                    Sync with Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Active funding grants */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Grant & Active Funding Tracker</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { title: "NIH Grant - Cardiology Modeling", count: "$250,000 active", percent: 68 },
                  { title: "Mayo Network Clinical Fellowship", count: "$120,000 active", percent: 42 }
                ].map((gr, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{gr.title}</span>
                      <span className="text-emerald-700">{gr.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${gr.percent}%` }} />
                    </div>
                    <span className="text-[8px] text-[#64748B] uppercase tracking-wider font-extrabold block">
                      Fund Allocation Audit: {gr.percent}% Allocated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==================== 🧪 PHARMACEUTICAL PARTNER DASHBOARD ==================== */}
      {role === UserRole.PHARMA && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pharma-role-dashboard">
          
          {/* Compound trial simulation and side effect graphs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-600" />
                  <h3 className="font-serif italic font-bold text-slate-900 text-lg">Virtual Trial Compound Simulator</h3>
                </div>
                <span className="bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-rose-200 rounded">
                  Compound Modeler v2.4
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-slate-600 font-medium">
                  Model how a newly registered clinical compound interacts with virtual patient demographics based on active peer-reviewed research databases.
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={syntheticTrialData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} />
                      <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                      <Line type="monotone" name="Compound X-72 (Drug A)" dataKey="drugA" stroke="#E11D48" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" name="Trial Comp-90 (Drug B)" dataKey="drugB" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" name="Standard Placebo Control" dataKey="placebo" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sponsor educational modules */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Educational Sponsoring Campaign</h3>
                <p className="text-xs text-[#64748B] font-medium mt-1">Sponsor critical diagnostic education modules to train clinical students and doctors on rare syndromes.</p>
              </div>

              {pharmaSponsorSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl animate-fadeIn">
                  {pharmaSponsorSuccess}
                </div>
              )}

              <form onSubmit={handleSponsorSucceed} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Sponsorship Module Title</label>
                    <input
                      type="text"
                      required
                      value={sponsorModuleTitle}
                      onChange={(e) => setSponsorModuleTitle(e.target.value)}
                      placeholder="e.g. Early diagnosis of Amyloidosis Cardiomyopathy"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Sponsorship Budget Funding ($ USD)</label>
                    <input
                      type="text"
                      required
                      value={sponsorBudget}
                      onChange={(e) => setSponsorBudget(e.target.value)}
                      placeholder="e.g. 15,000"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Sponsor Continuing Education Module</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right column: side effect frequencies */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Efficacy & Adverse Side-Effects</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { effect: "Moderate Gastrointestinal distress", percent: 4, level: "Minimal" },
                  { effect: "Mild fatigue & lethargy index", percent: 18, level: "Monitor closely" },
                  { effect: "Severe Hepatic enzyme elevations", percent: 1, level: "Action Required" }
                ].map((eff, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{eff.effect}</span>
                      <span className={`${eff.level === "Action Required" ? "text-red-600" : "text-[#64748B]"}`}>{eff.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        eff.level === "Action Required" ? "bg-red-500" : eff.level === "Monitor closely" ? "bg-amber-500" : "bg-emerald-500"
                      }`} style={{ width: `${eff.percent}%` }} />
                    </div>
                    <span className="text-[8px] text-[#64748B] uppercase tracking-wider font-extrabold block">
                      Compliance Category: {eff.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==================== 🏥 HOSPITAL ADMINISTRATOR DASHBOARD ==================== */}
      {role === UserRole.HOSPITAL && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-role-dashboard">
          {/* Main section: staff competency heat map */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-800" />
                  <h3 className="font-serif italic font-bold text-slate-900 text-lg">Staff Competency & Safety Matrix</h3>
                </div>
                
                {/* Search bar for admin table */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search Departments..."
                    className="h-8 pl-8 pr-3 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white w-44"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <p className="text-[#64748B] font-medium">
                  Real-time tracking of active physicians, nurses, and residents safety audits compliance in mandatory clinical safety training simulations.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[9px] font-extrabold uppercase tracking-widest text-[#64748B]">
                        <th className="py-2.5">Department</th>
                        <th className="py-2.5">Safety Compliance Index</th>
                        <th className="py-2.5">Active Staff Registered</th>
                        <th className="py-2.5">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                      {[
                        { dept: "Emergency Department", rating: 94, staff: 48, status: "Compliant" },
                        { dept: "Cardiology Unit", rating: 98, staff: 24, status: "Compliant" },
                        { dept: "Intensive Care Unit", rating: 88, staff: 35, status: "Action Required" },
                        { dept: "Pediatrics Clinic", rating: 91, staff: 19, status: "Compliant" },
                        { dept: "Obstetrics Ward", rating: 86, staff: 22, status: "Action Required" }
                      ].filter(r => r.dept.toLowerCase().includes(adminSearch.toLowerCase())).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/55 transition-colors">
                          <td className="py-3 text-slate-900 font-serif font-bold">{row.dept}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className={`${row.rating >= 90 ? "text-emerald-600" : "text-amber-600"}`}>{row.rating}%</span>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block border">
                                <div className={`h-full rounded-full ${row.rating >= 90 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${row.rating}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-slate-500 font-medium">{row.staff} active MDs/RNs</td>
                          <td className="py-3">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              row.status === "Compliant" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-800 border-red-100"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Audit & verification checklist */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="font-serif italic font-bold text-slate-900 text-lg">Institutional Credential Queue</h3>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { doctor: "Dr. Amara Collins, MD", credential: "Board-Certified Pediatrics", status: "Pending Audit", hospitalId: "HOSP-9902" },
                  { doctor: "Dr. Jeremy Vance, MD", credential: "Acute Cardiac Care Certification", status: "Pending Audit", hospitalId: "HOSP-4421" }
                ].map((aud, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900">{aud.doctor}</h4>
                      <p className="text-[10px] text-[#64748B] font-medium">{aud.credential} • {aud.hospitalId}</p>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => alert(`Credential approved for ${aud.doctor} - hospital registration is now active.`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => alert(`Credential denied for ${aud.doctor}.`)}
                        className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Risk assessments */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Clinical Risk Assessment Index</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[10px] uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Obstetrics Risk Elevated</span>
                  </div>
                  <p className="text-[#64748B] text-[10px] leading-relaxed font-medium">
                    Critical safety compliance rate has dropped below safety limits (86% vs 90% required). Arrange mandatory postpartum hemorrhage simulation exam immediately.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cardiology Safe</span>
                  </div>
                  <p className="text-[#64748B] text-[10px] leading-relaxed font-medium">
                    Cardiology staff completed 100% of required acute myocardial infarction simulations. Projected audit risk decreased.
                  </p>
                </div>
              </div>
            </div>

            {/* Resource optimization charts */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Simulation Training ROI Impact</h4>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceRates}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 6, fontWeight: 700 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 8 }} />
                    <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                    <Bar name="Actual Safety Rating" dataKey="rating" fill="#0F172A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
