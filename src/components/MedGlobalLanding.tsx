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
  Sparkle
} from "lucide-react";

interface MedGlobalLandingProps {
  onStartSignUp: () => void;
  onInstantLogin: (role: string) => void;
  readingTheme: "light" | "sepia" | "dark";
  setReadingTheme: (theme: "light" | "sepia" | "dark") => void;
}

// Preseeded data for interactive elements
const COURSE_DATA = [
  {
    id: "usmle-1",
    title: "USMLE Step 1 Ultimate Mastery",
    category: "Medicine",
    duration: "180 Hours",
    successRate: "98.2%",
    difficulty: "Elite",
    desc: "Comprehensive integration of organ systems, pathology, pharmacology, and physiology. Features 3,500+ Board-style MCQs.",
    recommended: true,
    price: 349,
    rating: 4.9,
    reviews: 1420
  },
  {
    id: "plab-1",
    title: "PLAB 1 / UKMLA Clinical Guide",
    category: "Medicine",
    duration: "120 Hours",
    successRate: "97.5%",
    difficulty: "Advanced",
    desc: "In-depth review of GMC guidelines, clinical protocols, and situational judgment questions. Perfect for international graduates.",
    recommended: false,
    price: 249,
    rating: 4.8,
    reviews: 980
  },
  {
    id: "mrcp-1",
    title: "MRCP Part 1 Internal Medicine",
    category: "Diagnostics",
    duration: "210 Hours",
    successRate: "96.4%",
    difficulty: "Master",
    desc: "Rigorous clinical biochemistry, genetics, immunology, and therapeutics. Led by senior consultants of the Royal Colleges.",
    recommended: true,
    price: 429,
    rating: 4.9,
    reviews: 740
  },
  {
    id: "surg-boards",
    title: "Surgical Recall & OSCE Masterclass",
    category: "Surgery",
    duration: "90 Hours",
    successRate: "95.9%",
    difficulty: "Elite",
    desc: "Interactive multi-camera operative procedures, instrument guides, and live-proctored OSCE scenario breakdowns.",
    recommended: false,
    price: 299,
    rating: 4.7,
    reviews: 630
  },
  {
    id: "peds-boards",
    title: "Pediatric Sepsis & Critical Neonatal Care",
    category: "Pediatrics",
    duration: "80 Hours",
    successRate: "98.0%",
    difficulty: "Advanced",
    desc: "Critical fluid resuscitation, ventilation math, and antibiotic dosage modeling based on latest 2026 global pediatrics updates.",
    recommended: true,
    price: 199,
    rating: 4.9,
    reviews: 510
  }
];

const COMMUNITY_NODES = [
  { id: "ny", name: "Dr. Sofia Chen", x: 26, y: 32, specialty: "Cardiology Match", destination: "Cleveland Clinic, USA", origin: "Taiwan", avatar: "👩‍⚕️" },
  { id: "ldn", name: "Dr. Tariq Mahmood", x: 48, y: 26, specialty: "Internal Medicine", destination: "King's College Hosp, UK", origin: "Pakistan", avatar: "👨‍⚕️" },
  { id: "syd", name: "Dr. Elena Rostova", x: 86, y: 78, specialty: "Pediatric Resident", destination: "Westmead Hospital, AUS", origin: "Ukraine", avatar: "👩‍⚕️" },
  { id: "dxb", name: "Dr. Amara Al-Sayed", x: 59, y: 44, specialty: "Surgical Oncology", destination: "Dubai Healthcare City, UAE", origin: "Jordan", avatar: "👩‍⚕️" },
  { id: "del", name: "Dr. Rohan Malhotra", x: 67, y: 46, specialty: "Neurology Resident", destination: "Mayo Clinic, USA", origin: "India", avatar: "👨‍⚕️" }
];

const MCQ_DATABASE = [
  {
    question: "A 54-year-old male presents with sudden-onset tearing chest pain radiating to his back. Blood pressure is 185/110 mmHg in the right arm and 140/85 mmHg in the left arm. A chest X-ray reveals widening of the mediastinum. Which of the following is the most appropriate initial diagnostic or therapeutic step?",
    options: [
      "Initiate intravenous thrombolytic therapy with Alteplase",
      "Immediate administration of intravenous Esmolol to control heart rate and blood pressure",
      "Obtain an urgent computed tomography pulmonary angiography (CTPA)",
      "Administer high-dose oral aspirin and subcutaneous Low-Molecular-Weight Heparin"
    ],
    correctIdx: 1,
    explanation: "The presentation is highly suspicious for Acute Aortic Dissection (tearing back pain, blood pressure asymmetry, widened mediastinum). The primary therapeutic goal is to reduce shear stress on the aortic wall by controlling blood pressure and heart rate. Short-acting beta-blockers like Esmolol are the first-line therapy to target a heart rate of < 60 bpm and systolic BP of 100-120 mmHg."
  },
  {
    question: "A 28-year-old female primigravida at 34 weeks gestation presents with persistent severe headaches, visual scotomata, and facial swelling. Her blood pressure is 165/110 mmHg. Urinalysis demonstrates 3+ proteinuria. Which of the following agents is the drug of choice for the prevention of eclamptic seizures in this patient?",
    options: [
      "Phenytoin infusion",
      "Diazepam bolus as needed",
      "Magnesium Sulfate continuous infusion",
      "Oral Phenobarbital loading"
    ],
    correctIdx: 2,
    explanation: "This patient has preeclampsia with severe features. Magnesium sulfate is the gold-standard therapy for seizure prophylaxis in preeclampsia. It acts via neuroprotection, calcium antagonism, and cerebral vasodilation, and is far superior to phenytoin or diazepam."
  }
];

const TESTIMONIALS = [
  {
    name: "Dr. Priyesh Patel",
    exam: "USMLE Step 1 & 2 CK",
    score: "264 (99th Percentile)",
    text: "Med Global Academy's interactive sandboxes completely changed how I studied. Instead of just memorizing slides, I modeled cardiac pressures and mapped out my residency roadmap month-by-month. I matched at my dream program!",
    avatar: "👨‍⚕️",
    org: "Matched at Johns Hopkins Medicine"
  },
  {
    name: "Dr. Chloe Thompson",
    exam: "PLAB 1 & 2 / UKMLA",
    score: "91% Score First Attempt",
    text: "Coming from South Africa, the UK medical system felt daunting. The situational judgment simulators and OSCE checklists built here gave me 100% confidence. Highly recommend the AI Career Finder!",
    avatar: "👩‍⚕️",
    org: "GMC Registered • NHS Trust Resident"
  },
  {
    name: "Dr. Ahmed Mansoor",
    exam: "MRCP Part 1 & 2",
    score: "Pass on First Attempt",
    text: "The clinical diagnostics curriculum was brilliant. The level of detail on complex pharmacology and renal biochemistry rivaled the hardest board exams. The active ECG and PACs workstations are spectacular.",
    avatar: "👨‍⚕️",
    org: "Royal College Member • Consultant Path"
  }
];

export default function MedGlobalLanding({
  onStartSignUp,
  onInstantLogin,
  readingTheme,
  setReadingTheme
}: MedGlobalLandingProps) {
  // 1. AI Path Finder States
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedExam, setSelectedExam] = useState("USMLE Step 1");
  const [selectedDuration, setSelectedDuration] = useState("12 Months");
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [generatedPathData, setGeneratedPathData] = useState<any>(null);
  const [generationSteps, setGenerationSteps] = useState<string>("");

  // 2. Course Filters
  const [activeCourseFilter, setActiveCourseFilter] = useState("All");

  // 3. Interactive Dashboard Preview States
  const [selectedCritiqueTopic, setSelectedCritiqueTopic] = useState("Acid-Base");
  const [dashboardScore, setDashboardScore] = useState(78);
  const [dashboardStudyStreak, setDashboardStudyStreak] = useState(24);

  // 4. Global Map Mentorship Hotspot State
  const [selectedCommunityNode, setSelectedCommunityNode] = useState<any>(COMMUNITY_NODES[0]);

  // 5. Exam Simulation Feature States
  const [currentMCQIdx, setCurrentMCQIdx] = useState(0);
  const [selectedMCQOption, setSelectedMCQOption] = useState<number | null>(null);
  const [isMCQSubmitted, setIsMCQSubmitted] = useState(false);
  const [examTimer, setExamTimer] = useState(120); // 2 minutes countdown
  const [isTimerActive, setIsTimerActive] = useState(true);

  // 6. Testimonial Carousel Index
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // 7. Pricing States
  const [isAnnualPricing, setIsAnnualPricing] = useState(true);

  // Timers and automatic micro-interactions
  useEffect(() => {
    let timerId: any;
    if (isTimerActive && examTimer > 0) {
      timerId = setInterval(() => {
        setExamTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [examTimer, isTimerActive]);

  // Auto-slide testimonials every 8 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(slideInterval);
  }, []);

  // Format countdown timer helper
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Trigger simulated AI Path Finder Generation
  const handleGeneratePath = () => {
    setIsGeneratingPath(true);
    setGeneratedPathData(null);
    const steps = [
      "Initializing AI Agent Core...",
      "Scraping international visa requirements...",
      "Matching GMC / ECFMG curriculum matrices...",
      "Synthesizing month-by-month high-yield calendar...",
      "Finalizing study buffers & spaced-repetition schedules!"
    ];
    
    let stepIndex = 0;
    setGenerationSteps(steps[0]);

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setGenerationSteps(steps[stepIndex]);
      } else {
        clearInterval(stepInterval);
        setIsGeneratingPath(false);
        setGeneratedPathData(generateMockTimeline(selectedCountry, selectedExam, selectedDuration));
      }
    }, 900);
  };

  // Helper to construct a beautiful customized roadmap response
  const generateMockTimeline = (country: string, exam: string, duration: string) => {
    const totalMonths = duration.includes("6") ? 6 : duration.includes("12") ? 12 : 18;
    const months = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      let phase = "Fundamental Knowledge";
      let focus = "Anatomy, Biochemistry & Physiology organ-system correlation.";
      let milestone = "Baseline Q-Bank Diagnostic Test Completed (Score > 50%)";
      let status = "Not Started";
      let workload = "Moderate";

      if (i > totalMonths * 0.75) {
        phase = "Intense Board Simulation & Registration";
        focus = "Full-length mock tests, high-yield diagnostic reviews, and official board application processing.";
        milestone = "Consistent simulation scores above 85% with OSCE validation.";
        status = "Critical Capstone";
        workload = "Intense";
      } else if (i > totalMonths * 0.4) {
        phase = "Systematic Integration & Active Pathology";
        focus = "Pathology, Pharmacology, and clinical case diagnostics. High-volume daily MCQ repetitions.";
        milestone = "80% of Q-Bank reviewed with detailed concept tagging.";
        status = "In Progress";
        workload = "High";
      } else if (i === 1) {
        status = "Active Start";
      }

      months.push({
        month: `Month ${i}`,
        phase,
        focus,
        milestone,
        status,
        workload
      });
    }

    return {
      title: `Official roadmap: ${country} • ${exam} Curriculum`,
      summary: `Our AI engines have evaluated your criteria against 2026 ECFMG guidelines. This is your tailored ${duration} clinical roadmap to maximize high-yield success.`,
      timeline: months
    };
  };

  const filteredCourses = activeCourseFilter === "All"
    ? COURSE_DATA
    : COURSE_DATA.filter(c => c.category === activeCourseFilter);

  return (
    <div className={`w-full overflow-hidden transition-colors duration-300 ${
      readingTheme === "dark" ? "bg-[#0B0F19] text-slate-100" : readingTheme === "sepia" ? "bg-[#FAF6EE] text-[#433422]" : "bg-[#F9FAFB] text-slate-900"
    }`} id="medglobal-premium-landing">

      {/* Floating Animated Ambient Glow Orbs */}
      <div className="absolute top-20 left-10 w-[45vw] h-[45vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[1200px] right-5 w-[40vw] h-[40vw] rounded-full bg-violet-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse" />

      {/* STYLESHEET TO EMULATE SILICON VALLEY GRAPHICS & NEURAL NETWORKS */}
      <style>{`
        .glass-panel {
          background: ${readingTheme === "dark" ? "rgba(15, 23, 42, 0.45)" : readingTheme === "sepia" ? "rgba(244, 236, 220, 0.6)" : "rgba(255, 255, 255, 0.6)"};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${readingTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
        }
        .text-glow {
          text-shadow: ${readingTheme === "dark" ? "0 0 15px rgba(56, 189, 248, 0.4)" : "none"};
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .glow-animation {
          animation: pulseGlow 4s infinite ease-in-out;
        }
        .theme-switcher-glow {
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
        }
        .map-line {
          stroke-dasharray: 8;
          animation: mapDash 30s linear infinite;
        }
        @keyframes mapDash {
          to { stroke-dashoffset: -1000; }
        }
      `}</style>

      {/* SEAMLESS FLOATING THEME TOGGLER FOR CONVERSIONS */}
      <div className="fixed bottom-6 right-6 z-50 glass-panel py-2 px-3 rounded-full flex items-center gap-1.5 shadow-2xl theme-switcher-glow">
        <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 font-mono px-1">THEME</span>
        {(["light", "sepia", "dark"] as const).map(theme => (
          <button
            key={theme}
            onClick={() => setReadingTheme(theme)}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              readingTheme === theme 
                ? "bg-blue-600 text-white shadow-md font-bold" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {theme}
          </button>
        ))}
      </div>

      {/* ==================== 1. HERO SECTION (WOW FACTOR) ==================== */}
      <section className="relative pt-10 pb-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto" id="hero-cinematic">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Strategic copy & Emotional branding */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Super premium SaaS branding chip */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-[10px] py-2 px-4 rounded-full uppercase tracking-widest shadow-sm">
              <Sparkles className="h-4 w-4 animate-spin text-amber-500" style={{ animationDuration: '3s' }} />
              <span>Silicon Valley EdTech System • 2026 Academic Standard</span>
            </div>

            {/* Main title designed to trigger emotional drive */}
            <h1 className="text-4xl md:text-6xl font-black font-serif italic tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Become a Global Doctor with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400">AI-Powered</span> Learning
            </h1>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed font-sans">
              Don't just memorize medical boards. Master clinical instincts with Mayo-level synthetic patients, interactive EEG waveforms, and personalized AI residency paths. Formulated dynamically for USMLE, PLAB, MRCP and global licensing success.
            </p>

            {/* Dynamic visual CTAs */}
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={onStartSignUp}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 hover:scale-[1.02] active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest py-4.5 px-8 rounded-full transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2.5 cursor-pointer"
              >
                <span>Start Your AI Path</span>
                <ArrowRight className="h-4.5 w-4.5 text-cyan-300" />
              </button>

              <a
                href="#courses-catalog"
                className="bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300/40 dark:border-slate-700 font-extrabold text-xs uppercase tracking-widest py-4.5 px-8 rounded-full transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Explore Courses</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-blue-600 dark:text-blue-400 block">99.4%</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">USMLE Prep Success</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-indigo-600 dark:text-indigo-400 block">15,000+</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Global Doctors</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-serif italic font-black text-emerald-600 dark:text-emerald-400 block">12 Exams</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Fully Supported</span>
              </div>
            </div>

          </div>

          {/* Hero Right: 3D-style Floating UI Cards & Simulated Heart Rate Waveform */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Main Mock Visual Canvas */}
            <div className="w-full max-w-md aspect-square bg-gradient-to-br from-[#121B2E] to-[#0A0F1A] rounded-[2.5rem] p-6 shadow-2xl border border-blue-950/80 relative overflow-hidden flex flex-col justify-between">
              
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Header inside simulated clinical display */}
              <div className="flex justify-between items-center relative z-10 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">PHYSIO-MONITOR</span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">SYS STATUS: CALIBRATING</div>
              </div>

              {/* Beautiful physiological heart monitor */}
              <div className="h-28 my-4 flex flex-col justify-center relative">
                <svg className="w-full h-full text-emerald-400 opacity-90" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <path
                    d="M 0 40 L 30 40 L 38 36 L 46 44 L 54 40 L 70 40 L 78 40 L 82 12 L 90 72 L 98 32 L 106 40 L 122 40 L 134 40 L 174 40 L 182 36 L 190 44 L 198 40 L 214 40 L 222 40 L 226 12 L 234 72 L 242 32 L 250 40 L 266 40 L 300 40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    className="animate-ecg-pulse"
                    style={{
                      strokeDasharray: "1000",
                      animation: "ecgWave 1.3s linear infinite"
                    }}
                  />
                </svg>
                <div className="absolute bottom-1 right-2 bg-slate-900/90 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] py-1 px-2 rounded-lg font-black uppercase">
                  ACTIVE RATE: 72 BPM
                </div>
              </div>

              {/* Dynamic status stats block */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col gap-0.5">
                  <span className="text-slate-500 font-bold text-[8px] tracking-widest uppercase font-mono">SpO2 Level</span>
                  <span className="text-sky-400 font-mono font-black text-sm">99% • Physiological</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col gap-0.5">
                  <span className="text-slate-500 font-bold text-[8px] tracking-widest uppercase font-mono">Mean BP</span>
                  <span className="text-indigo-400 font-mono font-black text-sm">120/80 mmHg</span>
                </div>
              </div>

            </div>

            {/* Floating Floating Cards to simulate high-tech SaaS UI */}
            <div className="absolute -top-6 -right-4 glass-panel p-4 rounded-3xl shadow-2xl border border-blue-500/20 max-w-xs animate-bounce" style={{ animationDuration: '6s' }}>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl text-xl">🧠</span>
                <div>
                  <h4 className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-white">OSCE Case Generator</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">98.4% diagnostic accuracy verified</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 glass-panel p-4 rounded-3xl shadow-2xl border border-emerald-500/20 max-w-xs animate-bounce" style={{ animationDuration: '8s' }}>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl text-xl">🌍</span>
                <div>
                  <h4 className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-white">Matched Resident Community</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">2,500+ doctors matched in 2026</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 2. AI CAREER PATH FINDER SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="career-path-finder">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] py-1 px-3 rounded-full border border-blue-200 uppercase tracking-widest">
            <Compass className="h-3.5 w-3.5 animate-spin" />
            <span>AI ENGINE ROADMAPPING</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
            Your Clinical Career Roadmap, Automated
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Select your destination and licensing goal. Our neural framework parses global regulatory pathways to draft a custom month-by-month residency timeline.
          </p>
        </div>

        {/* Pathfinder Interface card */}
        <div className="glass-panel rounded-[2rem] p-6 md:p-10 shadow-xl border border-slate-300/40 dark:border-slate-800/60 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Country */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Target Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  // Update compatible exams
                  if (e.target.value === "United States") setSelectedExam("USMLE Step 1");
                  else if (e.target.value === "United Kingdom") setSelectedExam("PLAB / UKMLA");
                  else if (e.target.value === "Australia") setSelectedExam("AMC MCQ");
                  else if (e.target.value === "Canada") setSelectedExam("MCCQE Part 1");
                  else setSelectedExam("MRCP Part 1");
                }}
                className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs py-3 px-4 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="United States">United States (IMG)</option>
                <option value="United Kingdom">United Kingdom (GMC)</option>
                <option value="Australia">Australia (AMC)</option>
                <option value="Canada">Canada (MCC)</option>
                <option value="Middle East">Middle East (DHA/HAAD)</option>
              </select>
            </div>

            {/* Exam Goal */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Target Exam Goal</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs py-3 px-4 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500"
              >
                {selectedCountry === "United States" && (
                  <>
                    <option value="USMLE Step 1">USMLE Step 1</option>
                    <option value="USMLE Step 2 CK">USMLE Step 2 CK</option>
                  </>
                )}
                {selectedCountry === "United Kingdom" && (
                  <>
                    <option value="PLAB / UKMLA">PLAB / UKMLA</option>
                    <option value="MRCP Part 1">MRCP Part 1</option>
                  </>
                )}
                {selectedCountry === "Australia" && (
                  <option value="AMC MCQ">AMC MCQ Exam</option>
                )}
                {selectedCountry === "Canada" && (
                  <option value="MCCQE Part 1">MCCQE Part 1</option>
                )}
                {selectedCountry === "Middle East" && (
                  <option value="DHA Specialist">DHA Specialist License</option>
                )}
              </select>
            </div>

            {/* Timeline Duration */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Study Timeline Duration</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs py-3 px-4 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="6 Months">6 Months Fast-track</option>
                <option value="12 Months">12 Months (Recommended)</option>
                <option value="18 Months">18 Months Expanded Mastery</option>
              </select>
            </div>

          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGeneratePath}
              disabled={isGeneratingPath}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-full shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className={`h-4.5 w-4.5 ${isGeneratingPath ? "animate-spin text-amber-400" : "text-cyan-300"}`} />
              <span>{isGeneratingPath ? "Computing Custom Plan..." : "Generate AI Medical Path"}</span>
            </button>
          </div>

          {/* AI Generation State Box */}
          <AnimatePresence mode="wait">
            {isGeneratingPath && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-mono font-black text-blue-500 uppercase tracking-widest">CRUNCHING DATA VECTORS</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs animate-pulse font-medium">{generationSteps}</p>
              </motion.div>
            )}

            {generatedPathData && !isGeneratingPath && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 space-y-6"
              >
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-5 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif italic font-bold text-slate-800 dark:text-slate-100 text-lg">{generatedPathData.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-normal max-w-xl">{generatedPathData.summary}</p>
                  </div>
                  <button
                    onClick={onStartSignUp}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all self-start md:self-auto cursor-pointer border border-slate-700/30"
                  >
                    Lock Path & Sync Calendar
                  </button>
                </div>

                {/* Timeline visualizations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-96 overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200 dark:border-slate-800/80 pt-4">
                  {generatedPathData.timeline.map((step: any, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">{step.month}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border ${
                            step.workload === "Intense" 
                              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-500" 
                              : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 text-sky-500"
                          }`}>
                            Workload: {step.workload}
                          </span>
                        </div>
                        <h4 className="font-serif italic font-extrabold text-[#003B95] dark:text-indigo-300 text-sm leading-tight">{step.phase}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal font-sans font-medium">{step.focus}</p>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-[10px] space-y-1">
                        <span className="text-[8px] font-mono uppercase font-black text-slate-500 block">Milestone:</span>
                        <div className="flex items-start gap-1.5 font-medium text-slate-600 dark:text-slate-300 font-sans leading-normal">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{step.milestone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ==================== 3. COURSES SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="courses-catalog">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[9px] py-1 px-3 rounded-full border border-indigo-200 uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5" />
              <span>ELITE CURRICULUMS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
              Board-Certified Preparation Courses
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Explore dynamic virtual curricula packed with verified video cases, multi-system pathology models, and adaptive assessment questions.
            </p>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start md:self-auto">
            {["All", "Medicine", "Surgery", "Pediatrics", "Diagnostics"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCourseFilter(cat)}
                className={`text-[9px] uppercase tracking-wider font-black py-2 px-3.5 rounded-lg transition-all cursor-pointer ${
                  activeCourseFilter === cat 
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/30" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:scale-[1.01] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group"
            >
              {course.recommended && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#002B70] font-black text-[8px] uppercase tracking-widest py-1 px-3 rounded-full shadow border border-amber-300/40 animate-pulse flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-amber-500" />
                  <span>RECOMMENDED</span>
                </div>
              )}

              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded border border-blue-100 dark:border-blue-900/40 self-start inline-block">
                  {course.category}
                </span>

                <h3 className="font-serif italic font-black text-slate-900 dark:text-slate-100 text-lg md:text-xl leading-tight pt-1">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium line-clamp-3">
                  {course.desc}
                </p>

                {/* Rating & reviews */}
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{course.rating}</span>
                  <span>({course.reviews} reviews)</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-slate-500 block text-[7px] uppercase tracking-wider font-extrabold mb-0.5">Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{course.duration}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-slate-500 block text-[7px] uppercase tracking-wider font-extrabold mb-0.5">Success</span>
                    <span className="font-bold text-emerald-500">{course.successRate}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-slate-500 block text-[7px] uppercase tracking-wider font-extrabold mb-0.5">AI Level</span>
                    <span className="font-bold text-indigo-500">{course.difficulty}</span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <div className="font-mono">
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider">TUITION PASS</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">${course.price}</span>
                  </div>
                  <button
                    onClick={onStartSignUp}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all cursor-pointer border border-slate-700/30 shadow"
                  >
                    Enroll & Unlock
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. DASHBOARD PREVIEW SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="dashboard-preview">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Dashboard Left: Strategic copy */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] py-1 px-3 rounded-full border border-blue-200 uppercase tracking-widest">
              <Activity className="h-3.5 w-3.5" />
              <span>INTERACTIVE PLATFORM PREVIEW</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
              A High-Fidelity Student Workspace
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
              Take complete control of your preparation in an immersive workspace. Check mock exam metrics, explore interactive organ pathology, and review real-time feedback designed to locate specific cognitive gaps.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-lg">📊</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">Continuous Spaced-Repetition Tracking</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Never lose retention of critical cardiovascular or renal algorithms.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-lg">🧪</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">Proctored OSCE Checklist Feedback</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Receive precise AI diagnostics on differential diagnoses formulation.</p>
                </div>
              </div>
            </div>

            <button
              onClick={onStartSignUp}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-full transition-all shadow-lg shadow-blue-500/10 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Unlock Premium Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dashboard Right: Interactive simulated dashboard mock widget */}
          <div className="lg:col-span-7">
            <div className="bg-[#050B14] border border-blue-950/80 rounded-[2rem] p-6 shadow-2xl text-slate-200 text-left relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none animate-pulse" />

              {/* Simulated OS header */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">👨‍⚕️</div>
                  <div>
                    <h3 className="text-xs font-serif font-extrabold italic text-white">Dr. Sarah Jenkins</h3>
                    <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Candidate MRN: 940-X-72</span>
                  </div>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[8px] font-mono font-bold uppercase tracking-widest">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Active USMLE Prep</span>
                </div>
              </div>

              {/* Stats blocks inside simulated workspace */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                
                {/* Score slider */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">Q-Bank Average</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-sky-400">{dashboardScore}%</span>
                    <span className="text-[8px] text-slate-500 font-mono">Passing Threshold: 65%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={dashboardScore}
                    onChange={(e) => setDashboardScore(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-sky-500 mt-1"
                  />
                </div>

                {/* Streak clicker */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-1 cursor-pointer hover:bg-slate-900 transition-colors"
                     onClick={() => setDashboardStudyStreak(prev => prev + 1)}>
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">Daily Streak</span>
                  <div className="text-xl font-black font-mono text-amber-500 flex items-center gap-1.5 mt-1">
                    <Flame className="h-5 w-5 fill-amber-500 animate-bounce" />
                    <span>{dashboardStudyStreak} Days</span>
                  </div>
                  <span className="text-[7px] font-mono text-slate-400 mt-1">Click to Log Study hours</span>
                </div>

                {/* Next mock exam countdown */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-1">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">Days to Exam</span>
                  <div className="text-xl font-black font-mono text-rose-500 flex items-center gap-1.5 mt-1">
                    <Timer className="h-5 w-5 text-rose-500 animate-pulse" />
                    <span>14 Days Left</span>
                  </div>
                  <span className="text-[7px] font-mono text-slate-400 mt-1">USMLE Step 1 Scheduled Date</span>
                </div>

              </div>

              {/* Interactive AI Critique / Assessment preview widget */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl relative z-10 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>AI DIAGNOSTIC CLINICAL FEEDBACK</span>
                  </span>
                  <span className="text-[7px] font-mono text-emerald-400 font-black">2026 MATRICES OK</span>
                </div>

                {/* Toggle critique topics */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 font-mono text-[8px] uppercase tracking-wider font-extrabold">
                  {["Acid-Base", "Cardiology", "Renal Path", "Pharmacology"].map(top => (
                    <button
                      key={top}
                      onClick={() => setSelectedCritiqueTopic(top)}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer shrink-0 transition-colors ${
                        selectedCritiqueTopic === top 
                          ? "bg-blue-600 border-blue-500 text-white font-bold" 
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                      }`}
                    >
                      {top}
                    </button>
                  ))}
                </div>

                {/* Critique content displays based on selection */}
                <div className="bg-[#050B14] p-3 rounded-xl border border-slate-900 min-h-[75px] flex items-center">
                  <p className="text-xs text-slate-300 leading-normal font-sans">
                    {selectedCritiqueTopic === "Acid-Base" && (
                      <span><strong>Critique</strong>: Your integration of anion-gap metabolic acidosis formulas is strong, but you have a minor latency gap when resolving mixed respiratory compensations. Study the Winter's formula correlations.</span>
                    )}
                    {selectedCritiqueTopic === "Cardiology" && (
                      <span><strong>Critique</strong>: Excellent pressure-volume loop identification under valvular stenosis conditions. Focus slightly more on STEMI evolution waveforms and reciprocal leads mapping on 12-lead EKGs.</span>
                    )}
                    {selectedCritiqueTopic === "Renal Path" && (
                      <span><strong>Critique</strong>: GFR diagnostic algorithms are resolved with 95% accuracy. Focus on podocyte effacement biomarkers in minimal change disease versus focal segmental glomerulosclerosis.</span>
                    )}
                    {selectedCritiqueTopic === "Pharmacology" && (
                      <span><strong>Critique</strong>: Digoxin pharmacokinetics and toxicities analyzed flawlessly. Practice extra caution mapping CYP450 enzyme inducers and inhibitors interactions with warfarin.</span>
                    )}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==================== 5. GLOBAL COMMUNITY SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="global-community">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] py-1 px-3 rounded-full border border-emerald-200 uppercase tracking-widest">
            <Globe className="h-3.5 w-3.5" />
            <span>GLOBAL ALUMNI MAP</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
            Connect to the Global Doctor Network
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Our graduates study across 140 countries and secure highly competitive residencies in the United States, United Kingdom, and Australia.
          </p>
        </div>

        {/* Global map widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Map Left: The actual interactive vector visualizer map */}
          <div className="lg:col-span-8 bg-[#040914] rounded-[2rem] p-4 md:p-8 shadow-2xl border border-blue-950/80 relative overflow-hidden aspect-video w-full">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Minimal SVG World Outline Map with glowing node paths */}
            <svg className="w-full h-full text-slate-800" viewBox="0 0 100 50">
              {/* Landmass shapes (stylized minimal circles) */}
              <g opacity="0.35" fill="currentColor">
                {/* North America */}
                <circle cx="25" cy="18" r="8" />
                <circle cx="20" cy="22" r="5" />
                {/* South America */}
                <circle cx="34" cy="38" r="6" />
                <circle cx="31" cy="28" r="4" />
                {/* Europe */}
                <circle cx="48" cy="18" r="5" />
                <circle cx="53" cy="22" r="4" />
                {/* Asia */}
                <circle cx="68" cy="22" r="9" />
                <circle cx="74" cy="28" r="6" />
                {/* Africa */}
                <circle cx="50" cy="34" r="7" />
                {/* Australia */}
                <circle cx="84" cy="38" r="4" />
              </g>

              {/* Interconnecting dynamic curve paths mapping mentorship paths */}
              <path d="M 67 46 Q 46 39 26 32" fill="none" stroke="#3b82f6" strokeWidth="0.25" className="map-line opacity-60" />
              <path d="M 67 46 Q 57 36 48 26" fill="none" stroke="#10b981" strokeWidth="0.25" className="map-line opacity-60" />
              <path d="M 86 78 Q 56 61 26 32" fill="none" stroke="#a855f7" strokeWidth="0.25" className="map-line opacity-40" />

              {/* Glowing Interactive Hotspots on map */}
              {COMMUNITY_NODES.map((node) => {
                const isSelected = selectedCommunityNode?.id === node.id;
                return (
                  <g key={node.id} className="cursor-pointer" onClick={() => setSelectedCommunityNode(node)}>
                    <circle cx={node.x} cy={node.y} r={isSelected ? "1.8" : "0.9"} fill={isSelected ? "#10b981" : "#3b82f6"} className="animate-pulse" />
                    <circle cx={node.x} cy={node.y} r="2.8" fill="none" stroke={isSelected ? "#10b981" : "#3b82f6"} strokeWidth="0.15" className="animate-ping" style={{ animationDuration: '3s' }} />
                  </g>
                );
              })}
            </svg>

            {/* Instruction watermark */}
            <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800/80 p-2 rounded-lg text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">
              Click pulsing nodes on map to inspect active mentorships
            </div>
          </div>

          {/* Map Right: Detailed selected mentorship view */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {selectedCommunityNode ? (
                <motion.div
                  key={selectedCommunityNode.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl text-left space-y-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 shadow-inner">
                        {selectedCommunityNode.avatar}
                      </span>
                      <div>
                        <h4 className="font-serif italic font-extrabold text-slate-900 dark:text-white text-base">
                          {selectedCommunityNode.name}
                        </h4>
                        <span className="text-[9px] font-mono font-black text-blue-500 uppercase tracking-widest">
                          Origin Country: {selectedCommunityNode.origin}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="h-4.5 w-4.5 text-blue-500" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider">Matched Specialty</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCommunityNode.specialty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-4.5 w-4.5 text-emerald-500" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider">Current Institution Destination</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCommunityNode.destination}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                    Actively conducts weekly mentoring hours on Med Global Academy, resolving exam anxieties and sharing matching strategies.
                  </p>

                  <button
                    onClick={onStartSignUp}
                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Connect with {selectedCommunityNode.name.split(" ")[1]}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <div className="text-center p-8 text-slate-400 font-mono text-xs">
                  Select a candidate node on the left to review match metrics.
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ==================== 6. EXAM SIMULATION FEATURE ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80 animate-fadeIn" id="exam-simulation-teaser">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Simulation Left: The actual interactive MCQ */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
              
              {/* Simulator Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl">
                    <Timer className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-black text-slate-500 block uppercase tracking-widest">MED BOARDS MCQ LABORATORY</span>
                    <h3 className="font-serif italic font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">Live Mock Terminal Question {currentMCQIdx + 1} of 2</h3>
                  </div>
                </div>

                {/* Countdown clock */}
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/40 self-start sm:self-auto font-mono text-rose-500 text-xs font-black">
                  <span>SEC: {formatTimer(examTimer)}</span>
                </div>
              </div>

              {/* MCQ Question text */}
              <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed mb-6 font-sans">
                {MCQ_DATABASE[currentMCQIdx].question}
              </p>

              {/* Options lists with interactive click selections */}
              <div className="space-y-3">
                {MCQ_DATABASE[currentMCQIdx].options.map((opt, idx) => {
                  const isSelected = selectedMCQOption === idx;
                  const isCorrect = idx === MCQ_DATABASE[currentMCQIdx].correctIdx;
                  let cardStyle = "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-blue-500/50 text-slate-700 dark:text-slate-300";
                  
                  if (isSelected && !isMCQSubmitted) {
                    cardStyle = "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-md";
                  } else if (isMCQSubmitted) {
                    if (isCorrect) {
                      cardStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-md";
                    } else if (isSelected) {
                      cardStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-md";
                    } else {
                      cardStyle = "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isMCQSubmitted}
                      onClick={() => setSelectedMCQOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
                    >
                      <span className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold font-mono shrink-0 bg-white dark:bg-slate-900">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit / Diagnostic Explanations */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-[10px] font-mono text-slate-400">
                  {isMCQSubmitted ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Diagnostics feedback loaded</span>
                    </span>
                  ) : (
                    <span>Carefully select best clinical alternative</span>
                  )}
                </div>

                <div className="flex gap-2.5">
                  {isMCQSubmitted && (
                    <button
                      onClick={() => {
                        setCurrentMCQIdx(prev => (prev + 1) % MCQ_DATABASE.length);
                        setSelectedMCQOption(null);
                        setIsMCQSubmitted(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest py-3 px-5 rounded-xl cursor-pointer transition-all border border-slate-200/50 dark:border-slate-700/30"
                    >
                      Next Question
                    </button>
                  )}

                  <button
                    disabled={selectedMCQOption === null || isMCQSubmitted}
                    onClick={() => setIsMCQSubmitted(true)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-all"
                  >
                    Confirm Answer
                  </button>
                </div>
              </div>

              {/* Feedback explanation expansion drawer */}
              <AnimatePresence>
                {isMCQSubmitted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-6 bg-slate-100 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-850/60 text-xs font-sans leading-relaxed text-slate-600 dark:text-slate-400 space-y-2"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 uppercase tracking-wider text-[10px] font-mono">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      <span>Interactive Diagnostic Rationale:</span>
                    </div>
                    <p>{MCQ_DATABASE[currentMCQIdx].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Simulation Right: Strategic Copy */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] py-1 px-3 rounded-full border border-blue-200 uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5" />
              <span>DIAGNOSTIC SIMULATIONS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
              Try a Live Medical Q-Bank
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
              Interact directly with authentic diagnostic board-style multiple choice questions. Receive instant feedback and precise molecular explanations tailored specifically to the highest standards of international licensing exams.
            </p>

            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>100% updated to 2026 guidelines</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Anion-gap, ECG wave, and metabolic calculators integrated</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Double-blind clinical consensus explanations</span>
              </div>
            </div>

            <button
              onClick={onStartSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4.5 px-8 rounded-full shadow-lg hover:scale-[1.01] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Unlock full 8,500+ Q-Bank</span>
              <ArrowRight className="h-4.5 w-4.5 text-cyan-300" />
            </button>
          </div>

        </div>
      </section>

      {/* ==================== 7. TESTIMONIALS SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="testimonials-block">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] py-1 px-3 rounded-full border border-blue-200 uppercase tracking-widest">
            <UserCheck className="h-3.5 w-3.5 animate-bounce" />
            <span>ALUMNI ACCLAIM & STORYTELLING</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
            What Our Match Candidates Say
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Real stories of international medical graduates transforming their clinical knowledge and matching successfully into elite programs.
          </p>
        </div>

        {/* Testimonial Active Slider View */}
        <div className="max-w-4xl mx-auto relative px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonialIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-xl text-left space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Score rating header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 shadow-inner">
                      {TESTIMONIALS[activeTestimonialIdx].avatar}
                    </span>
                    <div>
                      <h4 className="font-serif italic font-extrabold text-slate-900 dark:text-white text-base">
                        {TESTIMONIALS[activeTestimonialIdx].name}
                      </h4>
                      <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Exam targets: {TESTIMONIALS[activeTestimonialIdx].exam}
                      </span>
                    </div>
                  </div>

                  {/* Star and score badges */}
                  <div className="text-right flex flex-row sm:flex-col gap-2 items-center sm:items-end justify-between self-start sm:self-auto">
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 font-mono font-black text-xs py-1 px-3.5 rounded-full border border-emerald-200">
                      Score: {TESTIMONIALS[activeTestimonialIdx].score}
                    </span>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main testimonial quote text */}
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium italic">
                  “ {TESTIMONIALS[activeTestimonialIdx].text} ”
                </p>
              </div>

              {/* Verified Badge and Org footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-400 font-extrabold uppercase">STATUS: VERIFIED MATCH SUCCESS</span>
                </div>
                <div className="font-serif italic font-extrabold text-[#003B95] dark:text-indigo-300 uppercase tracking-wider text-[11px]">
                  {TESTIMONIALS[activeTestimonialIdx].org}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Carousel arrow control buttons */}
          <div className="flex justify-center gap-2.5 mt-8">
            <button
              onClick={() => setActiveTestimonialIdx(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 transition-colors shadow cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonialIdx(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-all cursor-pointer ${activeTestimonialIdx === i ? "bg-blue-600 w-4" : "bg-slate-300 dark:bg-slate-700"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 transition-colors shadow cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 8. PRICING SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80" id="pricing-block">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] py-1 px-3 rounded-full border border-blue-200 uppercase tracking-widest">
            <Award className="h-3.5 w-3.5 text-blue-500" />
            <span>ANNUAL TUITION PASS PLANS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-serif italic text-slate-900 dark:text-white">
            Simple, Scaleable Tuition Pricing
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose your preparation roadmap. Lock down lifetime mock credentials, full diagnostic simulations and proctored OSCE workflows.
          </p>

          {/* Pricing Toggle switch */}
          <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200 dark:border-slate-850 mt-4 text-[9px] font-black uppercase tracking-wider font-mono">
            <button
              onClick={() => setIsAnnualPricing(false)}
              className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${!isAnnualPricing ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow" : "text-slate-400"}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnualPricing(true)}
              className={`px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${isAnnualPricing ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow" : "text-slate-400"}`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-100 text-emerald-800 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase">SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Candidate Basic */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between space-y-8 text-left hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-mono">Candidate Starter</span>
              <h3 className="font-serif italic font-black text-slate-900 dark:text-slate-100 text-xl">Clinical Core</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fundamental diagnostics, initial Q-Bank assessment stations, and limited ECG waves.</p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  ${isAnnualPricing ? "39" : "49"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono"> / month</span>
              </div>

              {/* Features list */}
              <ul className="space-y-3 pt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>2,500+ Board-style MCQs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Fundamental ECG Waveforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Standard AI Path Roadmaps</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartSignUp}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Get Started Free
            </button>
          </div>

          {/* Card 2: Professional Resident (MOST POPULAR) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/50 rounded-[2.5rem] p-6 shadow-2xl flex flex-col justify-between space-y-8 text-left relative overflow-hidden transform md:scale-[1.04]">
            {/* Most popular ribbon tag */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[7px] uppercase tracking-widest py-1.5 px-3 rounded-full border border-blue-400 shadow">
              MOST POPULAR PLAN
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 block font-mono">Residency Premium</span>
              <h3 className="font-serif italic font-black text-slate-900 dark:text-slate-100 text-xl">Match Mastery</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unrestricted active PACS radiology, histology databases, complete multi-system simulators, and personalized mentorship pairings.</p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  ${isAnnualPricing ? "79" : "99"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono"> / month</span>
              </div>

              {/* Features list */}
              <ul className="space-y-3 pt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Complete 8,500+ Board Q-Bank</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Interactive PACS & PACS Ultrasound</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Proctored OSCE Case Scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Direct Alum Mentorship access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartSignUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-lg hover:scale-[1.01] transition-all cursor-pointer text-center"
            >
              Unlock Match Mastery Pass
            </button>
          </div>

          {/* Card 3: Institutional Hospital */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between space-y-8 text-left hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-mono">Enterprise Suite</span>
              <h3 className="font-serif italic font-black text-slate-900 dark:text-slate-100 text-xl">Academy Proctor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">For medical schools, clinics and hospitals looking to proctor cohorts, examine struggle indexes, and issue signed CME diplomas.</p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  ${isAnnualPricing ? "249" : "299"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono"> / month</span>
              </div>

              {/* Features list */}
              <ul className="space-y-3 pt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  <span>Unlimited Student Cohorts seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  <span>Department Struggle Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  <span>Cryptographic CME Certificate issue</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onInstantLogin("Faculty")}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer text-center border border-slate-700/30"
            >
              Access Faculty Suite
            </button>
          </div>

        </div>
      </section>

      {/* ==================== 9. CTA CLOSING SECTION ==================== */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto mb-20">
        <div className="bg-gradient-to-br from-[#071630] via-[#0D2146] to-[#040E1E] text-white rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden border border-blue-950/80">
          
          {/* Decorative backwaves */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/40 border border-blue-500/30 text-blue-300 font-black text-[8px] py-1.5 px-4 rounded-full uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Admissions Cycle Open for 2026 Residency match</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif italic font-black leading-tight">
              Your Medical Career Starts Here
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans font-medium">
              Join thousands of international medical graduates and practicing doctors preparing collaboratively for licensing success. Connect instantly to secure premium academic credits.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={onStartSignUp}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 hover:scale-[1.02] text-[#002B70] font-black text-xs uppercase tracking-widest py-4 px-10 rounded-full transition-all shadow-lg shadow-amber-400/20 cursor-pointer flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => onInstantLogin("Student")}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-extrabold text-xs uppercase tracking-widest py-4 px-10 rounded-full transition-all cursor-pointer"
              >
                Instant Student Access
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Modern Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-8 px-4 text-center text-[10px] font-mono text-slate-500 space-y-2">
        <div>© 2026 Med Global Academy, Inc. Powered by Google AI Studio. All rights reserved.</div>
        <div className="flex justify-center gap-4 text-[9px] uppercase tracking-wider">
          <a href="#hero-cinematic" className="hover:underline">Home</a>
          <span>•</span>
          <a href="#courses-catalog" className="hover:underline">Curriculums</a>
          <span>•</span>
          <a href="#career-path-finder" className="hover:underline">AI Path Finder</a>
          <span>•</span>
          <a href="#exam-simulation-teaser" className="hover:underline">Simulations</a>
        </div>
      </footer>

    </div>
  );
}
