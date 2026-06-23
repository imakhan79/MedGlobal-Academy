import React, { useState, useEffect } from "react";
import { DICTIONARY_TERMS } from "../data";
import { MedicalTerm } from "../types";
import {
  Search,
  Volume2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Heart,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2
} from "lucide-react";

interface MedicalDictionaryProps {
  onNavigateTab?: (tab: "dashboard" | "exams" | "ai" | "research" | "drugs" | "dictionary" | "credentials" | "admin") => void;
}

export default function MedicalDictionary({ onNavigateTab }: MedicalDictionaryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<MedicalTerm>(DICTIONARY_TERMS[0]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [expandPharma, setExpandPharma] = useState(false);
  const [pharmaLoading, setPharmaLoading] = useState(false);
  const [pharmaTreatments, setPharmaTreatments] = useState<any[] | null>(null);
  const [pharmaError, setPharmaError] = useState("");

  useEffect(() => {
    if (expandPharma && selectedTerm) {
      fetchPharmaCrossReference();
    } else {
      setPharmaTreatments(null);
      setPharmaError("");
    }
  }, [selectedTerm, expandPharma]);

  const fetchPharmaCrossReference = async () => {
    setPharmaLoading(true);
    setPharmaError("");
    setPharmaTreatments(null);
    try {
      const response = await fetch("/api/pharma-cross-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: selectedTerm.term,
          definition: selectedTerm.definition
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.treatments) {
          setPharmaTreatments(data.treatments);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setPharmaError("Unable to cross-reference with pharmaceutical directory.");
    } finally {
      setPharmaLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMessage("");

    const foundLocal = DICTIONARY_TERMS.find(t => t.term.toLowerCase() === searchQuery.trim().toLowerCase());
    if (foundLocal) {
      setSelectedTerm(foundLocal);
      return;
    }

    // Dynamic definition search via Gemini API
    setIsSearchingAI(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Define the medical term: "${searchQuery}".
Return strictly a JSON object with this format, do not write extra text:
{
  "term": "${searchQuery}",
  "pronunciation": "standard phonetics",
  "definition": "clear professional definition",
  "clinicalSignificance": "the clinical importance or triage impact of this condition",
  "category": "appropriate medical specialty"
}`
            }
          ],
          mode: "tutor"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.response;
        // Clean markdown backticks if any
        const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.term && parsed.definition) {
          setSelectedTerm(parsed);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setErrorMessage("No exact match found in clinical dictionary. Please search standard medical terms.");
    } finally {
      setIsSearchingAI(false);
    }
  };

  const playPronunciation = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(selectedTerm.term);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Pronunciation playback: " + selectedTerm.pronunciation);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden" id="medical-dictionary">
      <div className="p-4 md:p-6 bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-[#003B95] animate-pulse" />
          <h3 className="text-lg font-serif italic font-bold text-[#0F172A]">Comprehensive Medical Dictionary</h3>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search term or ask AI for definition (e.g. 'Rhabdomyolysis')..."
            className="w-full bg-[#FCFCFD] border border-[#E2E8F0] text-xs md:text-sm py-2.5 pl-9 pr-4 rounded-xl outline-none focus:border-[#003B95] focus:bg-white transition-all shadow-sm"
            id="dict-search-input"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
        </form>

        {isSearchingAI && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#003B95] font-bold uppercase tracking-wider">
            <RefreshCw className="h-4 w-4 animate-spin text-[#003B95]" />
            <span>Consulting clinical dictionaries with Gemini...</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 text-xs text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-100 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Left column: Term index (1 col) */}
        <div className="p-4 border-r border-[#E2E8F0] space-y-2 bg-[#FCFCFD]">
          <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest mb-2">High-Yield Terms</h4>
          {DICTIONARY_TERMS.map(t => (
            <button
              key={t.term}
              onClick={() => { setSelectedTerm(t); setErrorMessage(""); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all ${selectedTerm.term === t.term ? "bg-[#003B95]/10 text-[#003B95] font-serif italic font-bold" : "text-[#64748B] hover:bg-slate-100"}`}
            >
              {t.term}
            </button>
          ))}
        </div>

        {/* Right column: Term profile (2 cols) */}
        <div className="md:col-span-2 p-5 md:p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="bg-[#003B95]/10 text-[#003B95] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {selectedTerm.category}
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <h4 className="text-xl md:text-2xl font-serif font-extrabold text-slate-800">{selectedTerm.term}</h4>
                <button
                  onClick={playPronunciation}
                  className="bg-slate-100 hover:bg-[#003B95]/10 text-slate-700 hover:text-[#003B95] p-2 rounded-lg transition-all"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1 font-semibold italic">Phonetics: /{selectedTerm.pronunciation}/</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">Definition</h5>
              <p className="text-sm text-slate-700 leading-relaxed font-medium mt-1">
                {selectedTerm.definition}
              </p>
            </div>

            <div className="p-4 bg-[#FCFCFD] border border-[#E2E8F0] rounded-xl space-y-1.5">
              <h5 className="text-xs font-serif italic font-bold text-[#003B95] flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-[#003B95]" />
                <span>Clinical Significance & Action Plans</span>
              </h5>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {selectedTerm.clinicalSignificance}
              </p>
            </div>

            {/* Expand Search to Pharma Toggle Option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-3">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-[#003B95]" />
                  <span>Expand Search to Pharma</span>
                </h5>
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-relaxed">
                  Cross-reference with drug directories & highlight targeted molecular/drug treatments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandPharma(!expandPharma)}
                className={`text-[10px] font-extrabold uppercase tracking-widest py-2 px-3.5 rounded-lg border cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${expandPharma ? "bg-[#003B95] border-[#003B95] text-white" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"}`}
                id="btn-expand-pharma"
              >
                {expandPharma ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-300" />
                    <span>Pharma Active</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-3.5 w-3.5" />
                    <span>Cross-Reference</span>
                  </>
                )}
              </button>
            </div>

            {expandPharma && (
              <div className="space-y-4 pt-2 border-t border-slate-100" id="pharma-reference-results">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span>Identified Pharmaceutical Treatments</span>
                  </h5>
                  {pharmaLoading && (
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-[#003B95]" />
                      Analyzing drug maps...
                    </span>
                  )}
                </div>

                {pharmaLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-pulse h-40">
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-pulse h-40">
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                )}

                {pharmaError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <span>{pharmaError}</span>
                  </div>
                )}

                {pharmaTreatments && pharmaTreatments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pharmaTreatments.map((drug, index) => {
                      const role = (drug.clinicalRole || "").toLowerCase();
                      let roleBadge = "bg-blue-50 text-blue-800 border-blue-200";
                      if (role.includes("rescue")) {
                        roleBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                      } else if (role.includes("prophylaxis")) {
                        roleBadge = "bg-purple-50 text-purple-800 border-purple-200";
                      } else if (role.includes("adjunctive")) {
                        roleBadge = "bg-amber-50 text-amber-800 border-amber-200";
                      } else if (role.includes("implicated") || role.includes("associated")) {
                        roleBadge = "bg-rose-50 text-rose-800 border-rose-200";
                      }

                      return (
                        <div key={index} className="bg-white border border-slate-200 hover:border-[#003B95]/40 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-3.5 hover:shadow-sm">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${roleBadge}`}>
                                {drug.clinicalRole}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold font-mono">
                                Brands: {drug.brandName}
                              </span>
                            </div>

                            <div>
                              <h6 className="text-sm font-serif font-bold text-slate-900 leading-tight">
                                {drug.genericName}
                              </h6>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                Class: {drug.drugClass}
                              </p>
                            </div>

                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">Indications & Usage</span>
                              {drug.indications}
                            </p>

                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">Mechanism of Action</span>
                              {drug.mechanismOfAction}
                            </p>

                            <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg text-[11px] text-blue-900 font-semibold leading-relaxed">
                              <span className="font-bold text-blue-950 block text-[9px] uppercase tracking-wider mb-0.5">Pharma Cross-Reference Rationale</span>
                              {drug.matchRationale}
                            </div>
                          </div>

                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab("drugs")}
                              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#003B95] font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>View in Drug Directory</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
