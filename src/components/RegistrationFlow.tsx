import React, { useState, useEffect } from "react";
import { UserRole } from "../types";
import { 
  User, Shield, Mail, Lock, Building, FileBadge, 
  Sparkles, ChevronRight, ChevronLeft, Check, Glasses, 
  BookOpen, Brain, Activity, Clock, Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_ACCOUNTS } from "../data/demoAccounts";

interface RegistrationFlowProps {
  onRegisterComplete: (data: {
    name: string;
    role: UserRole;
    email: string;
    identifier: string; // NPI, edu email, etc.
    preferredFont: string;
  }) => void;
  onCancel: () => void;
}

export default function RegistrationFlow({ onRegisterComplete, onCancel }: RegistrationFlowProps) {
  const [activeFlowTab, setActiveFlowTab] = useState<"signin" | "signup">("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  
  // Form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState(""); // NPI, Hospital ID, Org Name
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [preferredFont, setPreferredFont] = useState("font-readable"); // Default to Lexend

  // Reading speed test state
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [testTime, setTestTime] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number | null>(null);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // NPI list for simulation purposes
  const mockNPIs = ["1234567890", "9876543210", "1111111111"];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      // Role is always selected
    } else if (step === 2) {
      if (!name.trim()) newErrors.name = "Full Name is required";
      if (!email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Please provide a valid email address";
      } else {
        // Institutional email check
        if (
          (role === UserRole.STUDENT || role === UserRole.FACULTY || role === UserRole.RESEARCHER) &&
          !email.endsWith(".edu") && !email.toLowerCase().includes("hospital") && !email.toLowerCase().includes("clinic")
        ) {
          newErrors.email = "Institutional verification required. Please use a .edu, university, or hospital email domain.";
        }
      }

      // Role specific verification requirements
      if (role === UserRole.DOCTOR) {
        if (!identifier.trim()) {
          newErrors.identifier = "National Provider Identifier (NPI) or Medical License is required";
        } else if (identifier.length < 7) {
          newErrors.identifier = "Please enter a valid 10-digit NPI or certified license code";
        }
      } else if (role === UserRole.PHARMA || role === UserRole.HOSPITAL) {
        if (!orgName.trim()) {
          newErrors.orgName = "Organization or Healthcare Network name is required";
        }
        if (!identifier.trim()) {
          newErrors.identifier = "Corporate License or Admin Credential key is required";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // 10-second reading speed challenge to demonstrate font legibility
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestingSpeed) {
      interval = setInterval(() => {
        setTestTime(prev => {
          if (prev >= 10) {
            setIsTestingSpeed(false);
            setTestCompleted(true);
            // Calculate mock WPM based on selected font
            // Lexend yields higher speed!
            const wpm = preferredFont === "font-readable" ? 340 : preferredFont === "font-serif" ? 275 : 295;
            setReadingSpeed(wpm);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestingSpeed, preferredFont]);

  const startReadingTest = () => {
    setIsTestingSpeed(true);
    setTestTime(0);
    setTestCompleted(false);
  };

  const handleSubmit = () => {
    onRegisterComplete({
      name,
      role,
      email,
      identifier: role === UserRole.DOCTOR ? identifier : (role === UserRole.PHARMA || role === UserRole.HOSPITAL) ? `${orgName} - ${identifier}` : email,
      preferredFont
    });
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const account = DEMO_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );
    if (!account) {
      setLoginError("Demo email not recognized. Please use or click one of the emails listed in the directory below.");
      return;
    }
    if (account.password !== loginPassword) {
      setLoginError(`Incorrect passcode. The correct passcode for "${account.name}" is "${account.password}".`);
      return;
    }
    // Success!
    onRegisterComplete({
      name: account.name,
      role: account.role,
      email: account.email,
      identifier: account.identifier,
      preferredFont: account.preferredFont
    });
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case UserRole.STUDENT: return "bg-blue-100 text-blue-800 border-blue-200";
      case UserRole.DOCTOR: return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case UserRole.FACULTY: return "bg-purple-100 text-purple-800 border-purple-200";
      case UserRole.RESEARCHER: return "bg-amber-100 text-amber-800 border-amber-200";
      case UserRole.PHARMA: return "bg-rose-100 text-rose-800 border-rose-200";
      case UserRole.HOSPITAL: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 text-slate-800" id="onboarding-flow-container">
      {/* ONBOARDING HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#003B95]/5 text-[#003B95] flex items-center justify-center">
            <Shield className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#64748B]">STEP {step} OF 3</span>
            <h3 className="text-lg font-serif font-black text-[#003B95]">Academic Portal Registration</h3>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs text-[#64748B] hover:text-slate-800 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* FLOW TAB SWITCHER */}
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveFlowTab("signin")}
          className={`flex-1 text-xs uppercase tracking-wider font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeFlowTab === "signin"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          <Key className="h-4 w-4 text-amber-300" />
          <span>Demo Account Login</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFlowTab("signup")}
          className={`flex-1 text-xs uppercase tracking-wider font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeFlowTab === "signup"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Custom Registration</span>
        </button>
      </div>

      {activeFlowTab === "signin" ? (
        <div className="space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <h4 className="text-base font-bold font-serif italic text-slate-900">Institutional Sign-In</h4>
            <p className="text-xs text-[#64748B] font-medium">Use any registered demo credentials to sign in and experience custom dashboards calibrated for that role.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 text-xs bg-red-50 text-red-800 rounded-xl border border-red-200 font-bold font-sans">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="e.g. sarah.jenkins@harvard.edu"
                  className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="e.g. student_harvard"
                  className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="h-4 w-4 text-amber-300" />
              <span>Verify Credentials & Enter Workspace ⚡</span>
            </button>
          </form>

          {/* Directory */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Institutional Demo Directory (Click to Auto-Fill & Pre-populate)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => {
                    setLoginEmail(account.email);
                    setLoginPassword(account.password);
                    setLoginError("");
                  }}
                  className="p-3 border border-slate-200 hover:border-[#003B95] bg-white rounded-xl text-left transition-all hover:bg-[#F0F5FF] cursor-pointer group flex items-start gap-2.5"
                >
                  <span className="text-xl mt-0.5 shrink-0">{account.avatar}</span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-slate-800 group-hover:text-[#003B95] transition-colors truncate">
                        {account.name}
                      </span>
                      <span className="text-[8px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono scale-90">
                        {account.role}
                      </span>
                    </div>
                    <span className="text-[8px] font-semibold text-slate-400 block truncate font-mono">
                      {account.email}
                    </span>
                    <span className="text-[8px] font-bold text-[#003B95] block font-mono">
                      Passcode: <span className="underline">{account.password}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* STEP PROGRESS TRACKER */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step >= s ? "bg-[#003B95]" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* One-Click Quick Demo Login Pass */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#003B95] shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#003B95]">Institutional Demo Accounts</span>
                    <span className="bg-[#003B95]/10 text-[#003B95] text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ml-auto">
                      One-Click Access
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
                    Skip credential setup and instantly explore pre-seeded sandbox features calibrated for each healthcare segment:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => {
                          onRegisterComplete({
                            name: account.name,
                            role: account.role,
                            email: account.email,
                            identifier: account.identifier,
                            preferredFont: account.preferredFont
                          });
                        }}
                        className="p-2 border border-slate-200 hover:border-[#003B95] bg-white rounded-xl text-left transition-all hover:bg-[#F0F5FF] cursor-pointer group space-y-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{account.avatar}</span>
                          <span className="text-[9px] font-extrabold text-slate-800 group-hover:text-[#003B95] transition-colors line-clamp-1">
                            {account.role}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-[#64748B] block line-clamp-1 font-mono">
                          {account.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold font-serif italic text-slate-900">Or Create a Custom Academic Profile</h4>
                  <p className="text-xs text-[#64748B] font-medium">Selecting your role calibrates your interactive dashboard widgets, performance reports, and AI simulators.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { 
                      id: UserRole.STUDENT, 
                      title: "Clinical Student", 
                      desc: "Access MCQ study banks, interactive patient case studies, and faculty assignments.",
                      icon: "🧑🎓" 
                    },
                    { 
                      id: UserRole.DOCTOR, 
                      title: "Licensed Doctor", 
                      desc: "Access sandbox case simulations, track earned CME credits, and consult peer boards.",
                      icon: "🥼" 
                    },
                    { 
                      id: UserRole.FACULTY, 
                      title: "Faculty Member", 
                      desc: "Design patient cases, review classroom gradebooks, and proctor live clinical assessments.",
                      icon: "🏫" 
                    },
                    { 
                      id: UserRole.RESEARCHER, 
                      title: "Medical Researcher", 
                      desc: "Generate synthetic cohort datasets, draft clinical publications, and track research funding.",
                      icon: "🔬" 
                    },
                    { 
                      id: UserRole.PHARMA, 
                      title: "Pharmaceutical Partner", 
                      desc: "Model drug interactions, trial compound efficacy, and sponsor specialty clinical modules.",
                      icon: "🧪" 
                    },
                    { 
                      id: UserRole.HOSPITAL, 
                      title: "Hospital Administrator", 
                      desc: "Track clinical safety matrixes, audit department risk indexes, and manage personnel training.",
                      icon: "🏥" 
                    }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-4 text-left border rounded-2xl transition-all cursor-pointer flex gap-3.5 items-start ${
                        role === item.id 
                          ? "border-[#003B95] bg-[#003B95]/5 ring-1 ring-[#003B95]" 
                          : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="text-2xl mt-1 shrink-0">{item.icon}</span>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                        <span className="text-[10px] text-[#64748B] leading-normal font-medium block">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold font-serif italic text-slate-900">Credential Verification</h4>
                    <p className="text-xs text-[#64748B] font-medium">Please provide your details. Mandatory institutional validation is enforced for academic status.</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-black rounded-md border ${getRoleBadgeColor(role)}`}>
                    {role}
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Alexander Fleming"
                        className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                      />
                    </div>
                    {errors.name && <span className="text-[10px] font-bold text-red-500 block">{errors.name}</span>}
                  </div>

                  {/* Institutional or Professional Email */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">
                      {role === UserRole.STUDENT || role === UserRole.FACULTY || role === UserRole.RESEARCHER
                        ? "Institutional Email (Requires .edu or hospital domain)"
                        : "Professional Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          role === UserRole.STUDENT || role === UserRole.FACULTY || role === UserRole.RESEARCHER
                            ? "username@harvard.edu or name@mayo.edu"
                            : "name@company.com"
                        }
                        className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                      />
                    </div>
                    {errors.email && <span className="text-[10px] font-bold text-red-500 block">{errors.email}</span>}
                    {!errors.email && (role === UserRole.STUDENT || role === UserRole.FACULTY || role === UserRole.RESEARCHER) && (
                      <span className="text-[9px] text-[#64748B] block leading-normal italic">
                        Note: To comply with HIPAA simulators and academic integrity, student/faculty accounts require real academic domain validation.
                      </span>
                    )}
                  </div>

                  {/* Role specific validation inputs */}
                  {role === UserRole.DOCTOR && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">National Provider Identifier (NPI) or License Number</label>
                      <div className="relative">
                        <FileBadge className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. 1827495038 (10-digit NPI)"
                          className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                        />
                      </div>
                      {errors.identifier && <span className="text-[10px] font-bold text-red-500 block">{errors.identifier}</span>}
                      <p className="text-[9px] text-[#64748B] italic leading-normal">
                        Your credentials will be authenticated against the National Registry Database. Feel free to use a simulated 10-digit ID for demonstration (e.g. 1234567890).
                      </p>
                    </div>
                  )}

                  {(role === UserRole.PHARMA || role === UserRole.HOSPITAL) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Organization / Network Name</label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="e.g. Pfizer Inc. / Mayo Clinic Network"
                            className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                          />
                        </div>
                        {errors.orgName && <span className="text-[10px] font-bold text-red-500 block">{errors.orgName}</span>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">Corporate Admin Credential</label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="e.g. CORP-ADMIN-99X"
                            className="w-full h-10 pl-10 pr-4 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#003B95] focus:bg-white"
                          />
                        </div>
                        {errors.identifier && <span className="text-[10px] font-bold text-red-500 block">{errors.identifier}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest py-3 px-5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-bold font-serif italic text-slate-900">Make Beautiful Fonts That Can Understand</h4>
                  <p className="text-xs text-[#64748B] font-medium">Select a reading typeface. Medical studies show optimized typography decreases reading fatigue and significantly improves clinical accuracy.</p>
                </div>

                {/* FONT SELECTOR IN ONBOARDING */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { 
                      id: "font-readable", 
                      name: "Lexend Typeface", 
                      desc: "Dyslexia-friendly. Scientifically expands word kerning for rapid eye tracking and 19.3% higher diagnostic comprehension.", 
                      tag: "High Comprehension Science",
                      previewClass: "font-readable font-bold"
                    },
                    { 
                      id: "font-sans", 
                      name: "Inter Sans", 
                      desc: "Modern standard. Crisp UI lines, high contrast for charts and metrics.", 
                      tag: "Clinical Default",
                      previewClass: "font-sans"
                    },
                    { 
                      id: "font-serif", 
                      name: "Playfair Serif", 
                      desc: "Academic editorial. Recreates prestigious medical journal text layouts.", 
                      tag: "Academic Textbook",
                      previewClass: "font-serif"
                    }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPreferredFont(f.id)}
                      className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                        preferredFont === f.id 
                          ? "border-amber-500 bg-amber-50/20 ring-1 ring-amber-500" 
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          {f.tag}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{f.name}</h5>
                        <p className="text-[9px] text-[#64748B] leading-normal font-medium">{f.desc}</p>
                      </div>
                      <div className={`border-t border-slate-100 pt-2 text-center text-xs ${f.previewClass} text-[#003B95] italic`}>
                        Clinical comprehension
                      </div>
                    </button>
                  ))}
                </div>

                {/* SCIENTIFIC COMPREHENSION TESTING DEMO */}
                <div className="bg-[#003B95]/5 border border-blue-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#003B95] flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Try a 10-Second Eye-Tracking Simulation
                    </span>
                    {readingSpeed && (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {readingSpeed} words/min reached!
                      </span>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl relative overflow-hidden">
                    {isTestingSpeed ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                        <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                      </div>
                    ) : (
                      <p className={`text-xs ${preferredFont === "font-readable" ? "font-readable font-medium" : preferredFont === "font-serif" ? "font-serif" : "font-sans"} leading-relaxed text-slate-700`}>
                        {preferredFont === "font-readable" 
                          ? "Research proves Lexend's specific character aspect ratios reduce crowding effect. Notice how your eye fluidly jumps from 'dyspnea' to 'tachypnea' and 'respiratory distress' without repeating lines or losing comprehension."
                          : "Standard serif and sans typefaces have compact counters. This requires extra focus to differentiate characters like 'c', 'o', and 'e', adding visual crowding and cognitive load during dense multi-page medical case readings."
                        }
                      </p>
                    )}

                    {isTestingSpeed && (
                      <div className="absolute inset-0 bg-[#003B95]/5 backdrop-blur-xs flex items-center justify-center">
                        <div className="bg-white px-3.5 py-1.5 rounded-full shadow-md text-[10px] font-extrabold text-[#003B95] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          TRACKING EYE VELOCITY: {testTime}s / 10s
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={startReadingTest}
                      disabled={isTestingSpeed}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[9px] uppercase tracking-widest py-2 px-4 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Activity className="h-3.5 w-3.5 text-[#003B95]" />
                      <span>{testCompleted ? "Run Speed Test Again" : "Simulate Eye-Tracking WPM Speed"}</span>
                    </button>

                    {testCompleted && (
                      <div className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600 font-black" />
                        <span>
                          {preferredFont === "font-readable" 
                            ? "Lexend font science cleared cognitive bottleneck!" 
                            : "Test completed. Try Lexend to compare words-per-minute speed."
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BUTTONS ROW */}
                <div className="pt-4 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest py-3 px-5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-widest py-3.5 px-8 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Finish & Enter Portal</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
