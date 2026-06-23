import React, { useState } from "react";
import { PRESEEDED_DRUGS } from "../data";
import { DrugProfile } from "../types";
import { Search, Sparkles, ShieldCheck, ShieldX, Activity, RefreshCw, AlertCircle } from "lucide-react";

export default function DrugDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<DrugProfile>(PRESEEDED_DRUGS[0]);
  const [isSearchingGemini, setIsSearchingGemini] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMessage("");

    // Check preseeded first
    const lowerQuery = searchQuery.toLowerCase();
    const foundLocal = PRESEEDED_DRUGS.find(d => 
      d.genericName.toLowerCase().includes(lowerQuery) || 
      d.brandName.toLowerCase().includes(lowerQuery) ||
      d.drugClass.toLowerCase().includes(lowerQuery)
    );

    if (foundLocal) {
      setSelectedDrug(foundLocal);
      return;
    }

    // Connect to dynamic drug query endpoint
    setIsSearchingGemini(true);
    try {
      const response = await fetch("/api/drug-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.genericName) {
          setSelectedDrug(data);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setErrorMessage("No matching drug found in local catalog or AI database.");
    } finally {
      setIsSearchingGemini(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden" id="drug-information-center">
      {/* Top Banner */}
      <div className="bg-[#0B1B3D] p-5 md:p-6 text-white border-b border-[#1E293B]">
        <h3 className="text-xl font-serif italic font-bold tracking-tight">New Drug Information Center</h3>
        <p className="text-xs text-[#94A3B8] mt-1 max-w-xl">Search pharmacological profiles, generic/brand names, severe contraindications, pregnancy safety classifications, and FDA status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Left Search and Preseeded List Column (4 cols) */}
        <div className="md:col-span-4 p-4 border-r border-[#E2E8F0] space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or ask AI for a drug (e.g. 'Aspirin')..."
              className="w-full bg-slate-50 border border-[#E2E8F0] text-xs md:text-sm py-3 pl-9 pr-4 rounded-xl outline-none focus:border-[#003B95] focus:bg-white transition-all"
              id="drug-search-input"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          </form>

          {/* Quick List of Pre-seeded Drug Cards */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">High-Yield Clinical Profiles</h4>
            {PRESEEDED_DRUGS.map(d => (
              <button
                key={d.genericName}
                onClick={() => { setSelectedDrug(d); setErrorMessage(""); }}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${selectedDrug.genericName === d.genericName ? "bg-white border-[#003B95] text-[#003B95] shadow-sm font-semibold font-serif italic" : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-slate-700"}`}
              >
                <div className="font-bold text-slate-800 font-serif">{d.genericName}</div>
                <div className="text-gray-500 font-medium">Class: {d.drugClass.split(" ")[0]}</div>
                <div className="text-[10px] text-[#003B95] mt-1 font-bold font-mono">Brand: {d.brandName}</div>
              </button>
            ))}
          </div>

          {isSearchingGemini && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[#003B95]" />
              <span>Querying FDA and drug index with Gemini...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-900 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Pharmacological Profile Column (8 cols) */}
        <div className="md:col-span-8 p-4 md:p-6 bg-[#FCFCFD] space-y-4">
          <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#003B95]/10 text-[#003B95] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Pharmacology Catalog
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Manufacturer: {selectedDrug.manufacturer}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-1 font-serif">{selectedDrug.genericName}</h3>
            </div>
            <div className="bg-[#003B95] text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-sm">
              FDA Status: {selectedDrug.fdaStatus}
            </div>
          </div>

          {/* Core Profile Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
              <h4 className="text-xs font-serif italic font-bold text-[#003B95] mb-1 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-[#003B95]" />
                <span>Drug Class & Brand Names</span>
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-semibold">{selectedDrug.drugClass}</p>
              <p className="text-[11px] text-[#003B95] font-bold mt-1.5 font-mono">Brands: {selectedDrug.brandName}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
              <h4 className="text-xs font-serif italic font-bold text-[#003B95] mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Clinical Indications</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedDrug.indications}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <ShieldX className="h-3.5 w-3.5" />
                <span>Contraindications & Safety Warnings</span>
              </h4>
              <p className="text-xs text-red-950 font-medium leading-relaxed mt-1">{selectedDrug.contraindications}</p>
            </div>

            <div className="border-b border-[#E2E8F0] pb-2">
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Dosage & Administration</h4>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">{selectedDrug.dosage}</p>
            </div>

            <div className="border-b border-[#E2E8F0] pb-2">
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Side Effects & Adverse Reactions</h4>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">{selectedDrug.sideEffects}</p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Major Drug Interactions</h4>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">{selectedDrug.drugInteractions}</p>
            </div>
          </div>

          {/* Pregnancy and Lactation Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
              <h5 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Pregnancy Category</h5>
              <p className="text-xs text-slate-800 font-bold mt-0.5">{selectedDrug.pregnancyCategory}</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl">
              <h5 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Lactation Safety</h5>
              <p className="text-xs text-slate-800 font-bold mt-0.5">{selectedDrug.lactationSafety}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
