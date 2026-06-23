/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MEDICAL_SPECIALTIES, LICENSE_EXAMS, MEDICAL_NEWS, PRESEEDED_MCQS, PRESEEDED_DRUGS } from "./data";
import { UserRole, MCQ, DrugProfile } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_ACCOUNTS } from "./data/demoAccounts";

// Import custom sub-components
import AIDialogs from "./components/AIDialogs";
import AssessmentEngine from "./components/AssessmentEngine";
import ResearchPortal from "./components/ResearchPortal";
import DrugDirectory from "./components/DrugDirectory";
import MedicalDictionary from "./components/MedicalDictionary";
import CertificatesPortal from "./components/CertificatesPortal";
import AdminFacultyPanel from "./components/AdminFacultyPanel";
import StudyConsistencyGraph from "./components/StudyConsistencyGraph";
import VirtualStudyPortal from "./components/VirtualStudyPortal";
import KnowledgeSnapshot from "./components/KnowledgeSnapshot";
import TypographyController from "./components/TypographyController";
import RegistrationFlow from "./components/RegistrationFlow";
import RoleDashboards from "./components/RoleDashboards";

// Lucide Icons
import {
  Activity,
  Shield,
  Users,
  BookOpen,
  Search,
  Bell,
  Menu,
  Sparkles,
  Star,
  Calendar,
  ArrowRight,
  Layers,
  FileText,
  Heart,
  Globe,
  PlusCircle,
  HelpCircle,
  Award,
  Crown,
  Key
} from "lucide-react";

export default function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "exams" | "ai" | "research" | "drugs" | "dictionary" | "credentials" | "admin"
  >("dashboard");

  // User Profile configuration
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Student");

  // Registration and Demo states
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    role: UserRole;
    email: string;
    identifier: string;
    preferredFont: string;
  } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoOption, setDemoOption] = useState<string>("");

  // Live collections (allowing dynamic Faculty additions)
  const [customMCQs, setCustomMCQs] = useState<MCQ[]>(PRESEEDED_MCQS);
  const [customDrugs, setCustomDrugs] = useState<DrugProfile[]>(PRESEEDED_DRUGS);

  // Quick State helpers
  const [showNotification, setShowNotification] = useState(true);
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState("All");

  // Typographical Preferences States
  const [fontFamily, setFontFamily] = useState<"font-sans" | "font-serif" | "font-readable" | "font-mono">("font-sans");
  const [fontSize, setFontSize] = useState<"text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl">("text-sm");
  const [lineHeight, setLineHeight] = useState<"leading-normal" | "leading-relaxed" | "leading-loose">("leading-normal");
  const [letterSpacing, setLetterSpacing] = useState<"tracking-normal" | "tracking-wide" | "tracking-widest">("tracking-normal");
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">("light");
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [rulerY, setRulerY] = useState<number>(300);

  // Mouse move listener for Focus Ruler
  useEffect(() => {
    if (!showRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showRuler]);

  // Load custom MCQs and drugs from database on mount
  useEffect(() => {
    fetch("/api/custom-mcqs")
      .then(res => res.json())
      .then((data: MCQ[]) => {
        if (data && data.length > 0) {
          setCustomMCQs(prev => {
            const unique = data.filter(d => !prev.some(p => p.question === d.question));
            return [...unique, ...prev];
          });
        }
      })
      .catch(err => console.error("Failed to load custom MCQs from DB:", err));

    fetch("/api/custom-drugs")
      .then(res => res.json())
      .then((data: DrugProfile[]) => {
        if (data && data.length > 0) {
          setCustomDrugs(prev => {
            const unique = data.filter(d => !prev.some(p => p.genericName === d.genericName));
            return [...unique, ...prev];
          });
        }
      })
      .catch(err => console.error("Failed to load custom drugs from DB:", err));
  }, []);

  // Sync user performance stats with Supabase
  const syncUserPerformance = (email: string) => {
    fetch(`/api/user-performance?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.performanceData) {
          localStorage.setItem("medglobal-mcq-performance", JSON.stringify(data.performanceData));
          window.dispatchEvent(new Event("storage"));
        } else {
          const localPerf = localStorage.getItem("medglobal-mcq-performance");
          if (localPerf) {
            fetch("/api/user-performance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                performanceData: JSON.parse(localPerf)
              })
            }).catch(err => console.error("Failed to push initial performance data:", err));
          }
        }
      })
      .catch(err => console.error("Failed to sync user performance:", err));
  };

  useEffect(() => {
    if (isRegistered && registeredUser?.email) {
      syncUserPerformance(registeredUser.email);
    }
  }, [isRegistered, registeredUser]);

  // Append customized Qs/Drugs dynamically to catalog and save to database
  const handleAddCustomMCQ = (newMCQ: MCQ) => {
    setCustomMCQs(prev => [newMCQ, ...prev]);
    fetch("/api/custom-mcqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMCQ)
    }).catch(err => console.error("Failed to save custom MCQ to DB:", err));
  };

  // Persist user session to localStorage for cross-component DB sync
  useEffect(() => {
    if (isRegistered && registeredUser) {
      localStorage.setItem("medglobal-user", JSON.stringify({
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role,
        identifier: registeredUser.identifier
      }));
      localStorage.setItem("medglobal-subscription-tier", subscriptionTier);
    }
  }, [isRegistered, registeredUser, subscriptionTier]);

  const handleAddCustomDrug = (newDrug: DrugProfile) => {
    setCustomDrugs(prev => [newDrug, ...prev]);
    fetch("/api/custom-drugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDrug)
    }).catch(err => console.error("Failed to save custom drug to DB:", err));
  };

  // Filter specialties based on category select
  const filteredSpecialties = selectedSpecialtyFilter === "All"
    ? MEDICAL_SPECIALTIES
    : MEDICAL_SPECIALTIES.filter(sp => sp.category === selectedSpecialtyFilter);

  const getThemeClasses = () => {
    if (readingTheme === "sepia") {
      return "sepia bg-[#FAF6EE] text-[#433422] border-[#EFE1CC]";
    } else if (readingTheme === "dark") {
      return "dark bg-[#0F172A] text-slate-100 border-slate-900";
    }
    return "bg-[#FCFCFD] text-[#0F172A] border-white";
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased border-8 box-border shadow-inner transition-colors duration-300 ${getThemeClasses()} ${fontFamily} ${fontSize} ${lineHeight} ${letterSpacing}`}>
      
      {/* 1. NOTIFICATION TICKER */}
      {showNotification && (
        <div className="bg-[#003B95] text-white text-[11px] sm:text-xs py-2.5 px-4 flex justify-between items-center border-b border-[#E2E8F0] animate-slideDown">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-white text-[#003B95] font-bold text-[9px] px-2 py-0.5 rounded uppercase">NEW UPDATE</span>
            <span className="truncate font-medium">World Health Organization (WHO) releases 2026 guidelines on pediatric sepsis algorithms.</span>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-white/80 hover:text-white font-bold ml-4 focus:outline-none text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. PREMIUM BRAND HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Vision Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003B95] shadow-sm border border-[#E2E8F0]">
              <Activity className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl md:text-2xl font-serif italic tracking-tight font-black text-[#003B95] leading-none">
                  MedGlobal Academy
                </h1>
                <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#64748B] font-bold block mt-0.5">Clinical Learning & Research Ecosystem</span>
            </div>
          </div>

          {/* Center search / timezone indicator */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-gray-400 bg-[#F8FAFC] py-1.5 px-3 rounded-lg border border-[#E2E8F0]">
            <Globe className="h-3.5 w-3.5 text-[#003B95]" />
            <span className="font-semibold text-[#64748B]">Active Portal</span>
            <span className="h-3 w-px bg-[#E2E8F0]"></span>
            <span className="text-slate-600 font-bold">2026 UTC CLINICAL STANDARDS</span>
          </div>

          {/* Right Header Controls (Role and Profile Upgrade selectors) */}
          <div className="flex items-center gap-2.5">
            {isRegistered ? (
              <>
                {/* Role quick switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline text-xs text-[#64748B] font-bold">Active Role:</span>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-xs py-1.5 px-2.5 rounded-lg text-slate-800 font-bold outline-none cursor-pointer focus:border-[#003B95]"
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-32">{registeredUser?.name}</span>
                  <span className="text-[9px] uppercase font-black text-[#003B95]">{subscriptionTier} Tier</span>
                </div>

                <button
                  onClick={() => {
                    setIsRegistered(false);
                    setRegisteredUser(null);
                    localStorage.removeItem("medglobal-user");
                    localStorage.removeItem("medglobal-subscription-tier");
                  }}
                  className="text-[9px] font-extrabold uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsRegistering(true)}
                className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="h-4 w-4 text-amber-300" />
                <span>Academic Login / Sign Up</span>
              </button>
            )}

            {/* Notification Badge */}
            <div className="relative p-2 text-[#64748B] hover:text-[#003B95] bg-[#F8FAFC] rounded-xl cursor-pointer border border-[#E2E8F0]">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* 3. SCROLLABLE GLOBAL NAVIGATION BAR */}
        {isRegistered && (
          <div className="bg-white border-t border-[#E2E8F0]">
            <div className="max-w-7xl mx-auto px-4 md:px-6 overflow-x-auto flex gap-6 scrollbar-none py-1">
              {[
                { id: "dashboard", label: "Learning Portals", icon: Layers },
                { id: "exams", label: "Q-Bank & OSCE Stations", icon: HelpCircle },
                { id: "ai", label: "AI Clinical Assistants", icon: Sparkles },
                { id: "research", label: "Research Academy", icon: FileText },
                { id: "drugs", label: "Pharma Center", icon: Heart },
                { id: "dictionary", label: "Medical Dictionary", icon: BookOpen },
                { id: "credentials", label: "Credentials & Plans", icon: Award },
                { id: "admin", label: "Faculty Hub", icon: Users }
              ].map(tab => {
                const IconComp = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-1 text-xs uppercase tracking-widest font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${isSelected ? "border-[#003B95] text-[#003B95]" : "border-transparent text-[#64748B] hover:text-[#0F172A]"}`}
                    id={`nav-tab-${tab.id}`}
                  >
                    <IconComp className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 4. MAIN CONTENT AREA */}
      {!isRegistered ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex items-center justify-center">
          {isRegistering ? (
            <div className="w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xl">
              <RegistrationFlow
                onRegisterComplete={(data) => {
                  setRegisteredUser(data);
                  setUserRole(data.role);
                  setFontFamily(data.preferredFont as any);
                  setIsRegistered(true);
                  setIsRegistering(false);
                }}
                onCancel={() => setIsRegistering(false)}
              />
            </div>
          ) : (
            <div className="w-full space-y-12 py-6 md:py-12 animate-fadeIn" id="homepage-landing-layout">
              {/* BEAUTIFUL COMPACT HERO SECTION */}
              <div className="bg-gradient-to-br from-[#003B95] to-blue-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-blue-900/50">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
                  <Activity className="w-96 h-96" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Hero Content */}
                  <div className="lg:col-span-7 space-y-6">
                    <span className="bg-amber-400 text-slate-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow-md">
                      ⚡ Now with Gemini AI Clinical Insights
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif italic font-black leading-tight">
                      AI-Driven Clinical Simulations, Medical Training, & Research
                    </h2>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-xl font-medium">
                      Calibrate your clinical instincts with high-fidelity, peer-reviewed patient sandbox simulators. Seamlessly tailored for students, practitioners, faculty, and academic healthcare networks.
                    </p>

                    {/* Dual CTAs */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setIsRegistering(true)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <span>Get Started / Create Account</span>
                        <ArrowRight className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setShowDemo(true)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Watch Simulation Demo</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Hero: DYNAMIC ROLE SELECTOR PANEL */}
                  <div className="lg:col-span-5 bg-white text-slate-800 p-6 md:p-8 rounded-3xl border border-blue-100 shadow-xl space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block">Select Your Medical Role:</label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as UserRole)}
                        className="w-full bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-sm py-2.5 px-3.5 rounded-xl text-slate-800 font-bold outline-none cursor-pointer focus:border-[#003B95] transition-colors"
                      >
                        {Object.values(UserRole).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic Adaptive Value Proposition content based on selected role */}
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl min-h-[140px] flex flex-col justify-between space-y-3">
                      <div>
                        <span className="bg-[#003B95]/10 text-[#003B95] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          Tailored Workspace benefits
                        </span>
                        
                        {userRole === UserRole.STUDENT && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Accelerate licensing board preparations</strong>. Access custom MCQ Q-banks with immediate diagnostic feedback, clinical OSCE interactive cases, and real-time faculty-assigned workloads.
                          </p>
                        )}
                        {userRole === UserRole.DOCTOR && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Elevate clinical competency</strong>. Simulate high-risk diagnostic scenarios in a risk-free sandbox, earn official Continuing Medical Education (CME) hours, and consult specialized board peers.
                          </p>
                        )}
                        {userRole === UserRole.FACULTY && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Calibrate academic curriculums</strong>. Build customized clinical case templates, proctor live class simulations, track topic struggles, and issue cryptographically verifiable credentials.
                          </p>
                        )}
                        {userRole === UserRole.RESEARCHER && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Synthesize healthcare research</strong>. Generate anonymized synthetic cohorts data, simulate compound interaction profiles, and sync drafts with academic writing workspaces.
                          </p>
                        )}
                        {userRole === UserRole.PHARMA && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Accelerate pharmaceutical trials</strong>. Model clinical compound interactions with virtual demographics, analyze efficacy indexes, and sponsor certified specialist modules.
                          </p>
                        )}
                        {userRole === UserRole.HOSPITAL && (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 font-sans">
                            <strong>Secure institutional safety standards</strong>. Review department competency matrixes, audit high-risk sectors, and verify medical credentials compliance.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50">
                        <button
                          onClick={() => {
                            const matchingAccount = DEMO_ACCOUNTS.find(acc => acc.role === userRole);
                            if (matchingAccount) {
                              setRegisteredUser({
                                name: matchingAccount.name,
                                role: matchingAccount.role,
                                email: matchingAccount.email,
                                identifier: matchingAccount.identifier,
                                preferredFont: matchingAccount.preferredFont
                              });
                              setFontFamily(matchingAccount.preferredFont as any);
                              setIsRegistered(true);
                            }
                          }}
                          className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full"
                        >
                          <Key className="h-3.5 w-3.5 text-amber-300" />
                          <span>Instant Log In as {userRole}</span>
                        </button>
                        
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="text-[9px] font-bold uppercase tracking-widest text-[#64748B] hover:text-[#003B95] transition-colors py-1 text-center cursor-pointer"
                        >
                          Or create custom credentials
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT FEATURES OVERVIEW GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Simulated Clinical Sandboxes", desc: "Test complex patient symptoms and vital signs in a risk-free academic playground.", icon: "🩺" },
                  { title: "CME Hours & Trackers", desc: "Earn official Continuing Medical Education credentials backed by Mayo Clinic Network validations.", icon: "🏆" },
                  { title: "Advanced Cohort Synthetics", desc: "Export high-fidelity, cryptographically compliant patient profiles for medical research.", icon: "📊" },
                  { title: "Academic Proctoring Audits", desc: "Proctor live simulation assessments and track diagnostic gaps across classroom levels.", icon: "🏫" }
                ].map((feat, idx) => (
                  <div key={idx} className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-2.5">
                    <span className="text-3xl">{feat.icon}</span>
                    <h4 className="font-serif italic font-bold text-base text-slate-900">{feat.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                ))}
              </div>

              {/* INSTITUTIONAL DEMO PASSPORTS */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-extrabold text-[9px] py-1 px-2.5 rounded-full border border-amber-200 uppercase tracking-wider">
                    <Key className="h-3 w-3" />
                    <span>Institutional Demo Pass</span>
                  </div>
                  <h3 className="font-serif italic font-bold text-slate-900 text-2xl md:text-3xl">One-Click Academic Access</h3>
                  <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                    Instantly log into fully populated, high-fidelity dashboards tailored to different segments of the academic medical ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DEMO_ACCOUNTS.map((account) => (
                    <div
                      key={account.role}
                      className="bg-white border border-[#E2E8F0] hover:border-[#003B95] p-5 rounded-3xl shadow-xs transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Header info */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 text-[8px] uppercase tracking-widest font-black rounded-md border ${account.badgeColor}`}>
                            {account.role}
                          </span>
                          <span className="text-2xl">{account.avatar}</span>
                        </div>

                        {/* Profile Info */}
                        <div className="space-y-1">
                          <h4 className="font-serif font-black text-slate-900 text-base">{account.name}</h4>
                          <p className="text-[10px] text-[#003B95] font-extrabold uppercase tracking-wider">{account.org}</p>
                          <span className="text-[9px] text-slate-400 font-mono block truncate">{account.email}</span>
                        </div>

                        {/* Capabilities/Seeded Content details */}
                        <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                          {account.desc}
                        </p>
                      </div>

                      {/* Login Button */}
                      <button
                        onClick={() => {
                          setRegisteredUser({
                            name: account.name,
                            role: account.role,
                            email: account.email,
                            identifier: account.identifier,
                            preferredFont: account.preferredFont
                          });
                          setFontFamily(account.preferredFont as any);
                          setIsRegistered(true);
                        }}
                        className="w-full bg-[#F8FAFC] hover:bg-[#003B95] hover:text-white border border-[#E2E8F0] hover:border-[#003B95] text-[#0F172A] font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-2xl text-center transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Key className="h-3.5 w-3.5 group-hover:text-amber-300" />
                        <span>Log In Instantly ⚡</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN / CORE CONTENT PORTALS (Takes 9 Columns in dashboard, 12 in full simulators) */}
          <div className={`space-y-6 ${activeTab === "dashboard" ? "lg:col-span-9" : "lg:col-span-12"}`}>
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Dynamic Role-Based Custom Dashboard Suite */}
                  <RoleDashboards
                    role={userRole}
                    userName={registeredUser?.name || "Dr. Guest"}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    customMCQs={customMCQs}
                    customDrugs={customDrugs}
                    onAddCustomMCQ={handleAddCustomMCQ}
                    onAddCustomDrug={handleAddCustomDrug}
                  />

                  {/* Classical Resources placed underneath for full workspace enrichment */}
                  {userRole === UserRole.STUDENT && (
                    <>
                      {/* AI-Generated 'Knowledge Snapshot' Feature */}
                      <KnowledgeSnapshot />

                      {/* Study Consistency Heat Map Contribution Graph */}
                      <StudyConsistencyGraph />

                      {/* Virtual Study Room (Real-Time MCQ Collaboration) */}
                      <VirtualStudyPortal />
                    </>
                  )}

                  {/* Browse Medical Departments / Specialties */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E2E8F0] pb-3 gap-3">
                      <div>
                        <h3 className="font-serif italic font-bold text-[#003B95] text-xl md:text-2xl">Specialist Portals</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold mt-1">Dedicated curriculum & guidelines for residency training</p>
                      </div>

                      {/* Specialty Category Filter Switch */}
                      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] shrink-0 self-start sm:self-auto">
                        {["All", "Medicine", "Surgery", "Gynecology", "Pediatrics"].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedSpecialtyFilter(cat)}
                            className={`text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-md transition-all ${selectedSpecialtyFilter === cat ? "bg-white text-[#003B95] shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#0F172A]"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredSpecialties.map(sp => (
                        <motion.div
                          key={sp.id}
                          whileHover={{ y: -4, scale: 1.01, borderColor: "#003B95" }}
                          transition={{ duration: 0.18 }}
                          className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <span className="bg-white text-[#003B95] font-bold text-[9px] px-2.5 py-1 rounded border border-[#E2E8F0] uppercase tracking-widest">
                              {sp.category}
                            </span>
                            <h4 className="font-serif italic font-bold text-lg text-[#0F172A] pt-1">{sp.name}</h4>
                            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 font-medium">{sp.description}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab("exams")}
                            className="text-[10px] uppercase tracking-widest font-extrabold text-[#003B95] flex items-center gap-1.5 hover:underline transition-all"
                          >
                            <span>Study Curriculum</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Global Licensing Exams Catalog list */}
                  <div className="space-y-4">
                    <h3 className="font-serif italic font-bold text-[#003B95] text-xl md:text-2xl border-b border-[#E2E8F0] pb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#003B95]" />
                      <span>Licensed Exam Preparations (USMLE, FCPS, FRCS, MRCP)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {LICENSE_EXAMS.slice(0, 8).map(ex => (
                        <motion.div
                          key={ex.id}
                          whileHover={{ y: -3, scale: 1.01, borderColor: "#003B95" }}
                          transition={{ duration: 0.18 }}
                          className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex flex-col justify-between space-y-3 transition-colors"
                        >
                          <div>
                            <h4 className="font-serif italic font-bold text-sm text-[#0F172A]">{ex.name}</h4>
                            <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mt-1 leading-relaxed">{ex.details}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab("exams")}
                            className="bg-transparent hover:bg-[#003B95] hover:text-white border-2 border-[#003B95] text-[#003B95] font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg text-center transition-all cursor-pointer"
                          >
                            Launch Q-Bank
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "exams" && (
                <motion.div
                  key="exams"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <AssessmentEngine />
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <AIDialogs />
                </motion.div>
              )}

              {activeTab === "research" && (
                <motion.div
                  key="research"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <ResearchPortal />
                </motion.div>
              )}

              {activeTab === "drugs" && (
                <motion.div
                  key="drugs"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <DrugDirectory />
                </motion.div>
              )}

              {activeTab === "dictionary" && (
                <motion.div
                  key="dictionary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <MedicalDictionary onNavigateTab={(tab) => setActiveTab(tab)} />
                </motion.div>
              )}

              {activeTab === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <CertificatesPortal
                    currentTier={subscriptionTier}
                    onTierChange={(tierId) => {
                      setSubscriptionTier(tierId);
                      alert(`Success: subscription updated to ${tierId}! Clinical simulators and certificates are now accessible.`);
                    }}
                  />
                </motion.div>
              )}

              {activeTab === "admin" && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  <AdminFacultyPanel
                    onAddCustomMCQ={handleAddCustomMCQ}
                    onAddCustomDrug={handleAddCustomDrug}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: SIDEBAR PORTLET / LIVE NEWS & CME CHANNELS (Only visible on dashboard tab) */}
          {activeTab === "dashboard" && (
            <aside className="lg:col-span-3 space-y-6 animate-fadeIn">
              {/* Live CME Webinar Channels list */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Live CME Webinars</span>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white border border-[#E2E8F0] hover:border-[#003B95] p-3.5 rounded-xl transition-all cursor-pointer">
                    <div className="flex justify-between items-center text-[8px] text-[#003B95] font-bold mb-1 tracking-wider uppercase">
                      <span>WEBINAR WORKSHOP</span>
                      <span>TODAY 16:00 UTC</span>
                    </div>
                    <h4 className="text-xs font-bold leading-tight text-[#0F172A]">Advanced Meta-Analysis with R-Studio</h4>
                    <p className="text-[10px] text-[#64748B] mt-1 font-medium">Prof. Amanda Vance • 2.5 CME Hours</p>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] hover:border-[#003B95] p-3.5 rounded-xl transition-all cursor-pointer">
                    <div className="flex justify-between items-center text-[8px] text-[#003B95] font-bold mb-1 tracking-wider uppercase">
                      <span>CONFERENCE PANEL</span>
                      <span>TOMORROW</span>
                    </div>
                    <h4 className="text-xs font-bold leading-tight text-[#0F172A]">Artificial Intelligence in Diagnostics</h4>
                    <p className="text-[10px] text-[#64748B] mt-1 font-medium">International Panel • 4 CME Hours</p>
                  </div>
                </div>
              </div>

              {/* Medical News Portal */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="border-b border-[#E2E8F0] pb-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#64748B] font-extrabold">Clinical News Desk</h4>
                </div>
                <div className="space-y-4">
                  {MEDICAL_NEWS.map(news => (
                    <div key={news.id} className="space-y-1.5 group cursor-pointer border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                      <span className="text-[8px] font-bold text-[#003B95] bg-[#E0F2FE] px-2 py-0.5 rounded uppercase tracking-wider">
                        {news.category}
                      </span>
                      <h5 className="text-xs font-bold text-[#0F172A] group-hover:text-[#003B95] transition-all leading-snug">
                        {news.title}
                      </h5>
                      <p className="text-[9px] text-[#94A3B8] font-semibold italic">{news.source} • {news.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification Verification Widget */}
              <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-5 text-center space-y-4">
                <Shield className="h-8 w-8 text-[#003B95] mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Secure Blockchain Registry</h4>
                  <p className="text-[10px] text-[#64748B] leading-relaxed font-medium">Our certificates feature real-time cryptographic hashing and QR signatures compliant with HIPAA privacy and academic integrity.</p>
                </div>
                <button
                  onClick={() => setActiveTab("credentials")}
                  className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all shadow-sm"
                >
                  Verify Certification
                </button>
              </div>
            </aside>
          )}
        </main>
      )}

      {/* 5. BRAND FOOTER */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">
        <div className="flex flex-wrap justify-center gap-6">
          <span>Global Active Users: 142,508</span>
          <span>Exam Pass Rate: 91.4%</span>
          <span>HIPAA & GDPR COMPLIANT</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <span className="text-[#003B95] font-extrabold font-serif italic">Institutional License: Mayo Clinic Network</span>
          <span>© 2026 MedGlobal Academy • V 4.2.0-Alpha</span>
        </div>
      </footer>

      {/* Typography Preference Panel & Eye-Care Controls */}
      <TypographyController
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        letterSpacing={letterSpacing}
        setLetterSpacing={setLetterSpacing}
        readingTheme={readingTheme}
        setReadingTheme={setReadingTheme}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
      />

      {/* Spotlight Reading Focus Ruler overlay */}
      {showRuler && (
        <div 
          className="fixed left-0 right-0 h-8 bg-amber-400/15 border-y border-amber-400/30 pointer-events-none z-50 transition-all duration-75 shadow-[0_0_12px_rgba(251,191,36,0.1)]"
          style={{ top: `${rulerY - 16}px` }}
        />
      )}

      {/* Interactive Watch Demo modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl p-6 md:p-8 max-w-xl w-full text-slate-800 space-y-6 relative animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-[#003B95]">
                <Activity className="h-5 w-5 animate-pulse text-red-500 animate-duration-1000" />
                <h4 className="font-serif italic font-bold text-lg">Active Clinical Simulation Demo</h4>
              </div>
              <button 
                onClick={() => {
                  setShowDemo(false);
                  setDemoOption("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-extrabold uppercase tracking-widest cursor-pointer"
              >
                Close Demo
              </button>
            </div>

            {/* Virtual Monitor */}
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 text-[10px] text-slate-500">
                <span>VITAL SIGNS MONITOR</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> LIVE SIMULATOR</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[8px] text-slate-500 block">HR bpm</span>
                  <span className="text-lg font-bold text-emerald-400">82 bpm</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">NIBP mmHg</span>
                  <span className="text-lg font-bold text-emerald-400">135/88</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">SPO2 %</span>
                  <span className="text-lg font-bold text-emerald-400">97%</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">RR /min</span>
                  <span className="text-lg font-bold text-emerald-400">18 /min</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 italic">
                Case presentation: "A 62-year-old female presents with progressive dyspnea, orthopnea, and bilateral ankle edema."
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Select Your Treatment Choice:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDemoOption("furosemide")}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    demoOption === "furosemide" ? "border-emerald-500 bg-emerald-50/30" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block font-sans">IV Furosemide 40mg</span>
                  <span className="text-[9px] text-[#64748B] leading-none">Initiate loop diuresis</span>
                </button>
                <button
                  onClick={() => setDemoOption("hydration")}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    demoOption === "hydration" ? "border-red-500 bg-red-50/20" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block font-sans">IV Normal Saline 1L</span>
                  <span className="text-[9px] text-[#64748B] leading-none">Aggressive volume expansion</span>
                </button>
              </div>
            </div>

            {demoOption && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                demoOption === "furosemide" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800 font-bold"
              }`}>
                {demoOption === "furosemide" ? (
                  <p>✅ <strong>OUTCOME: SUCCESS</strong>. Loop diuresis successfully reduces pulmonary venous pressure. Patient's dyspnea resolves, oxygen saturation rises to 99%. Well done!</p>
                ) : (
                  <p>❌ <strong>OUTCOME: CRITICAL FAILURE</strong>. Fluid expansion triggers acute fluid back-up, worsening pulmonary edema. Patient undergoes severe respiratory distress. Correct immediately!</p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setShowDemo(false);
                setIsRegistering(true);
                setDemoOption("");
              }}
              className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Ready to learn? Create Academic Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
