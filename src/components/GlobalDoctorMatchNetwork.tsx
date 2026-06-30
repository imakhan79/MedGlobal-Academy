import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MapPin, 
  Award, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  CheckCircle, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Star, 
  Send, 
  ArrowLeft, 
  ArrowUpRight, 
  BookOpen,
  PlusCircle,
  Clock,
  Briefcase
} from "lucide-react";

interface Mentor {
  name: string;
  specialty: string;
  location: string;
  targetExam: string;
  credentials: string;
  rate: string;
  bio: string;
  availability: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GlobalDoctorMatchNetwork() {
  // Initialization & Role State
  const [role, setRole] = useState<"Trainee" | "Doctor" | null>(null);
  
  // Trainee Filter State
  const [specialty, setSpecialty] = useState("Cardiology");
  const [location, setLocation] = useState("Egypt");
  const [targetExam, setTargetExam] = useState("USMLE Step 1");
  const [timeline, setTimeline] = useState("6 Months");

  // Mentors state
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  // Verification & Booking States
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"Unverified" | "Pending" | "Verified">("Unverified");
  const [studentIdToken, setStudentIdToken] = useState("");
  const [sessionAgenda, setSessionAgenda] = useState("");
  const [bookingStep, setBookingStep] = useState<"verify" | "agenda" | "payment" | "success">("verify");
  
  // Payment states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Global Doctor Match Network initialized. I am ready to facilitate connections. Are you here as a Trainee seeking guidance, or a Doctor offering mentorship?"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Doubts Session State
  const [doubts, setDoubts] = useState([
    {
      id: 1,
      author: "Dr. Hassan A. (Cairo, Egypt)",
      title: "USMLE Step 1 Renal Clearance Formula Mastery",
      question: "Struggling with the distinction between glomerular filtration rate and renal blood flow formulas under high-pressure scenarios.",
      replies: 2,
      mentorRecommended: "Dr. Kenji Tanaka, MD (Harvard)"
    },
    {
      id: 2,
      author: "Dr. Fatima B. (Karachi, Pakistan)",
      title: "PLAB 1 NHS Guidelines on Chest Pain Pathways",
      question: "Are there localized differences between NICE guidelines and standard USMLE algorithms for acute coronary syndromes?",
      replies: 4,
      mentorRecommended: "Dr. Amit Patel, MRCP (King's College)"
    }
  ]);
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtContent, setNewDoubtContent] = useState("");
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);

  // Doctor Mentor Application State
  const [gmcOrUsmleToken, setGmcOrUsmleToken] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("Cardiology");
  const [doctorBio, setDoctorBio] = useState("");
  const [isDoctorSubmitted, setIsDoctorSubmitted] = useState(false);

  // Trigger Matchmaking load
  useEffect(() => {
    if (role === "Trainee") {
      fetchMentors();
    }
  }, [role, specialty, targetExam]);

  const fetchMentors = async () => {
    setIsLoadingMentors(true);
    try {
      const res = await fetch("/api/gdma/suggest-mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, targetExam })
      });
      const data = await res.json();
      setMentors(data.mentors || []);
    } catch (err) {
      console.error("Error fetching recommended mentors:", err);
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMsg: Message = { role: "user", content: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/gdma/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile: { specialty, location, targetExam, timeline }
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error("GDMA chat session failed:", err);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I am having trouble connecting to the dynamic mentor brokerage. Please retry in a few moments." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickCTA = (mentorName: string) => {
    const matched = mentors.find(m => m.name.includes(mentorName)) || mentors[0];
    if (matched) {
      setSelectedMentor(matched);
      setBookingStep("verify");
      setIsBookingOpen(true);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdToken) return;
    setVerificationStatus("Pending");
    // Simulate instant verification success for demo fluidity
    setTimeout(() => {
      setVerificationStatus("Verified");
      setBookingStep("agenda");
    }, 1200);
  };

  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionAgenda) return;
    setBookingStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) return;
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setBookingStep("success");
    }, 1800);
  };

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle || !newDoubtContent) return;
    setIsSubmittingDoubt(true);
    setTimeout(() => {
      setDoubts(prev => [
        {
          id: Date.now(),
          author: "Dr. You (Active Session)",
          title: newDoubtTitle,
          question: newDoubtContent,
          replies: 0,
          mentorRecommended: mentors[0]?.name || "Dr. Sarah Jenkins, MD"
        },
        ...prev
      ]);
      setNewDoubtTitle("");
      setNewDoubtContent("");
      setIsSubmittingDoubt(false);
    }, 800);
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmcOrUsmleToken || !doctorBio) return;
    setIsDoctorSubmitted(true);
  };

  return (
    <div className="space-y-8" id="gdma-portal-wrapper">
      {/* Visual Hub Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0B1528] to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-blue-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 py-1.5 px-3 rounded-full text-xs font-bold text-blue-300">
            <Users className="h-4 w-4 text-blue-400" />
            <span>GDMA GLOBAL DOCTOR MATCH NETWORK</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic font-extrabold tracking-tight">
            Global Doctor Match Architect
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Bridge your medical transition from international graduate to licensed resident. Match with active NHS and USMLE board-certified advisors, secure structured 1-on-1 agendas, and resolve complex clinical doubts instantly.
          </p>
        </div>
      </div>

      {!role ? (
        /* Initialization Screen */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E2E8F0] p-8 rounded-3xl shadow-sm max-w-2xl mx-auto space-y-6 text-center"
          id="gdma-role-selection"
        >
          <div className="p-4 bg-blue-50 text-[#003B95] rounded-full w-fit mx-auto border border-blue-100">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic font-extrabold text-slate-800">
              Global Doctor Match Network Initialized
            </h3>
            <p className="text-slate-500 text-xs md:text-sm">
              I am ready to facilitate high-yield clinical connections. Please select your active portal state to proceed:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => setRole("Trainee")}
              className="p-6 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#003B95] text-center transition-all bg-white hover:bg-slate-50/50 group cursor-pointer"
            >
              <Award className="h-8 w-8 text-[#003B95] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-extrabold text-slate-800">Trainee seeking Guidance</div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">Match with mentors, book sessions, resolve medical doubts</div>
            </button>

            <button
              onClick={() => setRole("Doctor")}
              className="p-6 rounded-2xl border-2 border-[#E2E8F0] hover:border-purple-600 text-center transition-all bg-white hover:bg-purple-50/10 group cursor-pointer"
            >
              <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-extrabold text-slate-800">Doctor offering Mentorship</div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">Verify credentials, join the global network, support future peers</div>
            </button>
          </div>
        </motion.div>
      ) : role === "Doctor" ? (
        /* DOCTOR PORTAL & NETWORK GROWTH */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="gdma-doctor-portal">
          <div className="lg:col-span-4 space-y-6">
            <button
              onClick={() => setRole(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B95] hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Role Selection</span>
            </button>

            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="text-base font-serif italic font-bold text-slate-800">Why Join as a Mentor?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                By verifying your USMLE score report or UK GMC registration, you reinforce a continuous network effect that guides incoming international graduates.
              </p>
              <ul className="space-y-2 text-[11px] font-semibold text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Transparent session hourly rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Select availability that matches your shifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Build your global professional footprint</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E2E8F0] p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-serif italic font-bold text-slate-800">Become an Accredited Medical Mentor</h3>
                <p className="text-xs text-slate-400 mt-1">Submit your credentials for verified licensing match-ups.</p>
              </div>

              {!isDoctorSubmitted ? (
                <form onSubmit={handleDoctorSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">GMC/NPI Reference or USMLE token</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GMC-7491238 or USMLE-CK-881"
                        value={gmcOrUsmleToken}
                        onChange={(e) => setGmcOrUsmleToken(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">Specialty Mastery</label>
                      <select
                        value={doctorSpecialty}
                        onChange={(e) => setDoctorSpecialty(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Gastroenterology">Gastroenterology</option>
                        <option value="Nephrology">Nephrology</option>
                        <option value="Neurology">Neurology</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">Professional Bio & Board Credentials</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Briefly describe your medical education, scoring, current residency/registrar tier, and teaching specialty..."
                      value={doctorBio}
                      onChange={(e) => setDoctorBio(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Submit Mentor Verification Application
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto border border-emerald-100">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Verification Pending</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                      Our credential brokers are cross-referencing your licensing reference with national databases. You will be notified of activation within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TRAINEE PORTAL */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="gdma-trainee-portal">
          {/* Left Column: Matchmaking Settings & Interactive Assistant */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setRole(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B95] hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Change Portal State</span>
              </button>
            </div>

            {/* Matchmaker Panel */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Search className="h-4.5 w-4.5 text-[#003B95]" />
                <h3 className="font-serif italic font-bold text-slate-800 text-base">Matchmaking Core Filter</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Specialty Interest</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Current Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                  >
                    <option value="Egypt">Egypt</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Sudan">Sudan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Target Board</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                  >
                    <option value="USMLE Step 1">USMLE Step 1</option>
                    <option value="USMLE Step 2">USMLE Step 2 CK</option>
                    <option value="PLAB 1/UKMLA">PLAB 1 / UKMLA</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Timeline</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                  >
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recommended Mentors Cards Row */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] block">VERIFIED MATCHED MENTORS (GMC / USMLE VALIDATED)</span>
              
              {isLoadingMentors ? (
                <div className="bg-white border border-slate-100 p-8 rounded-2xl text-center">
                  <Clock className="h-6 w-6 text-[#003B95] animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-400 font-semibold">Running database matching criteria...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mentors.map((mentor, index) => (
                    <div 
                      key={index}
                      className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100" title="Accredited Mentor">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-bold text-[#003B95] bg-blue-50 py-0.5 px-2 rounded">
                            {mentor.rate} / hr
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate">{mentor.name}</h4>
                          <span className="text-[9px] text-[#64748B] font-bold block mt-0.5">{mentor.credentials}</span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">
                          {mentor.bio}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 mt-3">
                        <div className="flex items-center gap-1 text-[9px] text-[#64748B] font-semibold">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{mentor.location}</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setBookingStep("verify");
                            setIsBookingOpen(true);
                          }}
                          className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Book 1-on-1 Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Live Doubt Sessions (Knowledge Bridge) */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BookOpen className="h-4.5 w-4.5 text-[#003B95]" />
                <h3 className="font-serif italic font-bold text-slate-800 text-base">Knowledge Bridge: Live Doubt Stream</h3>
              </div>

              <div className="space-y-3">
                {doubts.map((doubt) => (
                  <div key={doubt.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] text-[#64748B] font-black tracking-wider uppercase">{doubt.author}</span>
                      <span className="text-[9px] font-black bg-purple-50 text-purple-700 py-0.5 px-2 rounded">
                        Mentor Link: {doubt.mentorRecommended}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs md:text-sm">{doubt.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{doubt.question}</p>
                    
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">{doubt.replies} peer responses</span>
                      <button
                        onClick={() => handleQuickCTA(doubt.mentorRecommended)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003B95] hover:underline cursor-pointer"
                      >
                        <span>Connect for deep-dive session</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Doubt form */}
              <form onSubmit={handlePostDoubt} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">SUBMIT ACTIVE CLINICAL DOUBT</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Short query topic (e.g. Diastolic murmur pathophysiology)"
                    value={newDoubtTitle}
                    onChange={(e) => setNewDoubtTitle(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="Elaborate on the clinical vignette details or question options that caused confusion..."
                    value={newDoubtContent}
                    onChange={(e) => setNewDoubtContent(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingDoubt}
                  className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[9px] uppercase tracking-wider py-2 px-4 rounded-lg transition-all cursor-pointer"
                >
                  {isSubmittingDoubt ? "Publishing query..." : "Publish to Doubt Stream"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic AI Architect Advisor Chat (Core Logic & Structure) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm h-[580px] flex flex-col justify-between">
              {/* Header */}
              <div className="bg-[#003B95] text-white p-4 border-b border-blue-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-blue-300" />
                  <div>
                    <h4 className="font-serif italic font-bold text-xs md:text-sm">GDMA Architect Session</h4>
                    <span className="text-[8px] font-bold text-blue-200 uppercase tracking-widest block">AI Mentor Brokerage</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 block" title="Architect Online"></span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" id="gdma-chat-feed">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-[#003B95] text-white rounded-br-none" 
                        : "bg-white border border-[#E2E8F0] text-slate-700 rounded-bl-none shadow-xs"
                    }`}>
                      <div className="whitespace-pre-line">
                        {msg.content}
                      </div>

                      {/* Render simulated clickable CTAs from the Architect output */}
                      {msg.role === "assistant" && (msg.content.includes("Sarah Jenkins") || msg.content.includes("Amit Patel")) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                          {msg.content.includes("Sarah Jenkins") && (
                            <button
                              onClick={() => handleQuickCTA("Sarah Jenkins")}
                              className="bg-blue-50 text-[#003B95] hover:bg-blue-100/80 font-extrabold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                            >
                              Open Jenkins Proposal
                            </button>
                          )}
                          {msg.content.includes("Amit Patel") && (
                            <button
                              onClick={() => handleQuickCTA("Amit Patel")}
                              className="bg-blue-50 text-[#003B95] hover:bg-blue-100/80 font-extrabold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                            >
                              Open Patel Proposal
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#003B95] animate-spin" />
                      <span className="text-[10px] text-slate-400 font-semibold">Architect analyzing roadmaps...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Input Bar */}
              <div className="p-3 bg-white border-t border-[#E2E8F0] flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for transition roadmaps or clinical doubts..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-[#003B95] hover:bg-blue-950 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structured Booking Wizard Modal */}
      <AnimatePresence>
        {isBookingOpen && selectedMentor && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E2E8F0] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-[#003B95] to-blue-950 text-white p-5">
                <h4 className="font-serif italic font-extrabold text-base">Accredited Consultation Setup</h4>
                <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-widest font-bold">Mentor: {selectedMentor.name}</p>
              </div>

              {/* Progress Stepper indicators */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-2.5 flex justify-between text-[9px] font-black uppercase tracking-wider text-[#64748B]">
                <span className={bookingStep === "verify" ? "text-[#003B95]" : ""}>1. Verification</span>
                <span className={bookingStep === "agenda" ? "text-[#003B95]" : ""}>2. Agenda Matrix</span>
                <span className={bookingStep === "payment" ? "text-[#003B95]" : ""}>3. Broker Fee</span>
              </div>

              {/* Step Contents */}
              <div className="p-6 space-y-5">
                {bookingStep === "verify" && (
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start bg-blue-50/70 border border-blue-100 p-4 rounded-xl">
                      <ShieldCheck className="h-5 w-5 text-[#003B95] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Accredited Platform Safeguard</h5>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1">
                          To maintain high academic standards, bookings require trainee status validation (Score report, college ID token, or clinical diploma).
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Student ID or ECFMG Candidate ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ECFMG-0-942-811 or KCL-2026-MED"
                          value={studentIdToken}
                          onChange={(e) => setStudentIdToken(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setIsBookingOpen(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                        <button
                          type="submit"
                          disabled={verificationStatus === "Pending"}
                          className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-lg transition-all cursor-pointer"
                        >
                          {verificationStatus === "Pending" ? "Validating Status..." : "Verify & Proceed"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {bookingStep === "agenda" && (
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <FileText className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Pre-Session Agenda Structuring</h5>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1">
                          Accredited mentors require a clear roadmap of clinical focus areas before accepting booking events.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAgendaSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Detailed Session Objectives</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="e.g. I want to review the exact differences between S3/S4 cardiac gallops and configure my 6-week study schedule."
                          value={sessionAgenda}
                          onChange={(e) => setSessionAgenda(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setBookingStep("verify")}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-lg transition-all cursor-pointer"
                        >
                          Configure Objectives
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {bookingStep === "payment" && (
                  <div className="space-y-4">
                    {/* Transparent Monetization Flow */}
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">Verified Mentor Fee ({selectedMentor.rate}/hr)</span>
                        <span className="text-sm font-black text-emerald-800">{selectedMentor.rate}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        <strong>Value Proposition:</strong> Direct 1-on-1 focus targets exact USMLE/PLAB question pitfalls, reducing preparation overhead by over 18 hours. Fully refundable if canceled 24h prior.
                      </p>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">Credit Card Number</label>
                          <input
                            type="text"
                            required
                            maxLength={16}
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">Expiry Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B] block">Security Code (CVC)</label>
                            <input
                              type="password"
                              required
                              maxLength={3}
                              placeholder="***"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setBookingStep("agenda")}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={paymentLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          {paymentLoading ? "Executing Gateway..." : `Secure session for ${selectedMentor.rate}`}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {bookingStep === "success" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto border border-emerald-100">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Mentor Call Secured!</h4>
                      <p className="text-slate-500 text-xs mt-1">
                        Your agenda has been synced to **{selectedMentor.name}**'s board schedule. Access details in your email or active calendar stream.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsBookingOpen(false)}
                      className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all cursor-pointer"
                    >
                      Return to Matching Hub
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
