import React, { useState } from "react";
import { RESEARCH_COURSES } from "../data";
import { ResearchCourse } from "../types";
import { BookOpen, FileText, Settings, Award, Cpu, Sparkles, ChevronDown, CheckCircle, RefreshCw, Send, Check } from "lucide-react";

export default function ResearchPortal() {
  const [selectedCourse, setSelectedCourse] = useState<ResearchCourse | null>(RESEARCH_COURSES[0]);
  const [activeCourseSection, setActiveCourseSection] = useState<string | null>(RESEARCH_COURSES[0].id);

  // Proposal Generator State
  const [proposalTopic, setProposalTopic] = useState("");
  const [studyDesign, setStudyDesign] = useState("Randomized Controlled Trial");
  const [sampleSize, setSampleSize] = useState("120");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTopic.trim() || isGeneratingProposal) return;

    setIsGeneratingProposal(true);
    setGeneratedProposal("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Draft a complete, highly structured medical research proposal or protocol.
Topic: ${proposalTopic}
Study Design: ${studyDesign}
Target Sample Size: ${sampleSize} participants

Format the draft exactly as:
## Title: [Clear medical title]
## 1. Abstract
## 2. Background & Clinical Significance
## 3. Study Hypothesis & PICO Framework
## 4. Methodology & Intervention Plan
## 5. Statistical Analysis Plan (SAP)
## 6. Ethical Considerations & Patient Consent`
            }
          ],
          mode: "research",
          systemInstruction: "You are an expert Clinical Trials Investigator and Academic Medical Editor. Build pristine protocols."
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedProposal(data.response);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Offline high quality template fallback
      setTimeout(() => {
        setGeneratedProposal(`## Title: Clinical Efficacy and Safety of SGLT2 Inhibitor Therapy in Patients Diagnosed with ${proposalTopic || "Chronic Cardiometabolic Pathologies"}

## 1. Abstract
This protocol outlines a multi-center, double-blind ${studyDesign} aimed at evaluating patient outcomes over a 12-month period. A target cohort of ${sampleSize} participants will be prospectively randomized.

## 2. Background & Clinical Significance
Despite recent breakthroughs in therapy, cardiovascular and metabolic morbidity remains high worldwide. SGLT2 inhibitors represent a vital class of medications that show profound extra-glycemic protective effects, though pathways remain under investigation.

## 3. Study Hypothesis & PICO Framework
* **Population**: Adult patients diagnosed with ${proposalTopic || "target pathology"}.
* **Intervention**: Standard-of-care plus SGLT2 therapy (e.g., Empagliflozin 10mg daily).
* **Comparison**: Standard-of-care plus identical oral placebo.
* **Outcome**: Time to major clinical cardiovascular events (MACE) and changes in kidney function.

## 4. Methodology & Intervention Plan
Participants meeting strictly verified inclusion criteria will undergo simple randomization in a 1:1 ratio. Double-blind conditions will be maintained. Periodic follow-ups at weeks 4, 12, 24, and 52 will track physiological vitals, renal parameters, and patient diary logs.

## 5. Statistical Analysis Plan (SAP)
Primary endpoint analysis will utilize Cox proportional hazards regression. Secondary safety endpoints, including incidence of diabetic ketoacidosis and genitourinary tract infections, will be examined via Fisher's exact tests.

## 6. Ethical Considerations & Patient Consent
The protocol will be conducted in strict compliance with the Declaration of Helsinki. Prior to participation, each candidate must provide signed informed consent after clear, lay-term counseling regarding potential risks.`);
      }, 1000);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden" id="research-training-portal">
      {/* Banner */}
      <div className="bg-[#0B1B3D] p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-300" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">Global Medical Academy</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif italic font-bold tracking-tight">Research Training & Proposal Academy</h2>
          <p className="text-xs text-[#94A3B8] max-w-xl">Learn clinical biostatistics, scientific writing, and meta-analysis under international peer-review standards.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm">
            <div className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider">Active Courses</div>
            <div className="text-base font-bold font-mono">4 Modules</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm">
            <div className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider">Verification</div>
            <div className="text-base font-bold font-mono">Blockchain</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Course Syllabi (7 cols) */}
        <div className="lg:col-span-7 p-4 md:p-6 border-r border-[#E2E8F0] space-y-5">
          <h3 className="font-serif italic font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#003B95]" />
            <span>Interactive Research Syllabi</span>
          </h3>

          <div className="space-y-3">
            {RESEARCH_COURSES.map(course => (
              <div
                key={course.id}
                className={`border rounded-xl transition-all ${activeCourseSection === course.id ? "border-[#003B95] shadow-sm" : "border-[#E2E8F0] hover:border-gray-300"}`}
              >
                {/* Course Header Toggle */}
                <button
                  onClick={() => setActiveCourseSection(activeCourseSection === course.id ? null : course.id)}
                  className="w-full flex items-center justify-between p-4 text-left outline-none"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#003B95]/10 text-[#003B95] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">• {course.duration} ({course.lessonsCount} lessons)</span>
                      {course.isPremium && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase">Premium</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm md:text-base text-slate-800 font-serif">{course.title}</h4>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-all ${activeCourseSection === course.id ? "rotate-180 text-[#003B95]" : ""}`} />
                </button>

                {/* Course Syllabus Content */}
                {activeCourseSection === course.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#E2E8F0] bg-slate-50/50 rounded-b-xl space-y-3">
                    <p className="text-xs text-gray-500 italic leading-relaxed">{course.description}</p>
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Syllabus Outline:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {course.outline.map((unit, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 p-2 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-[#003B95] shrink-0 mt-0.5" />
                            <span className="font-medium">{unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Proposal Generator (5 cols) */}
        <div className="lg:col-span-5 p-4 md:p-6 bg-[#FCFCFD] space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif italic font-bold text-[#0F172A] text-lg flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-[#003B95]" />
              <span>Research Proposal Draft Generator</span>
            </h3>
            <p className="text-xs text-gray-500">Formulate and structure a publication-ready research protocol instantly.</p>
          </div>

          <form onSubmit={handleGenerateProposal} className="space-y-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] mb-1">Proposed Clinical Topic</label>
              <input
                type="text"
                value={proposalTopic}
                onChange={(e) => setProposalTopic(e.target.value)}
                placeholder="e.g. 'Cardiovascular outcomes of SGLT2 inhibitors'"
                required
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-xs md:text-sm text-slate-800 outline-none focus:border-[#003B95] focus:bg-white transition-all"
                id="proposal-topic-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] mb-1">Study Design</label>
                <select
                  value={studyDesign}
                  onChange={(e) => setStudyDesign(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg py-2.5 px-2.5 text-xs text-slate-800 outline-none focus:border-[#003B95] focus:bg-white"
                >
                  <option value="Randomized Controlled Trial">RCT</option>
                  <option value="Prospective Cohort Study">Cohort</option>
                  <option value="Retrospective Case-Control">Case-Control</option>
                  <option value="Systematic Review & Meta-Analysis">Meta-Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] mb-1">Sample Size</label>
                <input
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  placeholder="120"
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg py-2.5 px-2.5 text-xs text-slate-800 outline-none focus:border-[#003B95] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!proposalTopic.trim() || isGeneratingProposal}
              className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[11px] uppercase tracking-wider py-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
              id="btn-generate-proposal"
            >
              {isGeneratingProposal ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>{isGeneratingProposal ? "Drafting Protocol..." : "Generate Protocol Draft"}</span>
            </button>
          </form>

          {/* Proposal Result View Panel */}
          {generatedProposal && (
            <div className="bg-white p-4 border border-[#003B95]/20 rounded-xl space-y-3 h-[290px] overflow-y-auto shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#003B95]">Protocol Draft</span>
                <button
                  onClick={handleCopy}
                  className="text-[10px] uppercase tracking-wider text-[#003B95] font-extrabold hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
                  <span>{copied ? "Copied!" : "Copy Draft"}</span>
                </button>
              </div>
              <div className="text-xs space-y-2.5 leading-relaxed text-slate-800 whitespace-pre-wrap font-mono">
                {generatedProposal.split("\n").map((line, idx) => {
                  if (line.startsWith("## ")) {
                    return <h4 key={idx} className="font-serif italic font-bold text-sm text-[#003B95] mt-3 border-b border-[#E2E8F0] pb-1">{line.replace("## ", "")}</h4>;
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
