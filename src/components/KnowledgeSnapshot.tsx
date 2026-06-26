import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Target, Award, Activity, RefreshCw, BrainCircuit, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface SpecialtyStat {
  specialty: string;
  correct: number;
  total: number;
  pct: number;
}

export default function KnowledgeSnapshot() {
  const [snapshot, setSnapshot] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<SpecialtyStat[]>([]);

  // Realistic fallback preseeded clinical history to make the UI populated with rich details immediately
  const PRESEEDED_PERFORMANCE = {
    "Cardiology": { correct: 14, total: 18 },
    "Pulmonology": { correct: 6, total: 12 },
    "Neurology": { correct: 9, total: 10 },
    "Gastroenterology": { correct: 11, total: 15 },
    "Nephrology": { correct: 5, total: 11 },
    "Endocrinology": { correct: 8, total: 9 }
  };

  const loadStats = () => {
    try {
      let storedPerfStr = localStorage.getItem("medglobal-mcq-performance");
      if (!storedPerfStr || storedPerfStr === "undefined" || storedPerfStr === "null") {
        // Automatically preseed with realistic initial history so student isn't staring at empty screen
        localStorage.setItem("medglobal-mcq-performance", JSON.stringify(PRESEEDED_PERFORMANCE));
        storedPerfStr = JSON.stringify(PRESEEDED_PERFORMANCE);
      }
      
      let parsed = PRESEEDED_PERFORMANCE;
      try {
        const temp = JSON.parse(storedPerfStr);
        if (temp && typeof temp === "object" && !Array.isArray(temp)) {
          parsed = temp;
        } else {
          localStorage.setItem("medglobal-mcq-performance", JSON.stringify(PRESEEDED_PERFORMANCE));
        }
      } catch (jsonErr) {
        console.error("Corrupted local storage performance data, resetting.", jsonErr);
        localStorage.setItem("medglobal-mcq-performance", JSON.stringify(PRESEEDED_PERFORMANCE));
        parsed = PRESEEDED_PERFORMANCE;
      }
      const list = Object.entries(parsed).map(([spec, s]: [string, any]) => {
        const correct = s.correct || 0;
        const total = s.total || 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        return { specialty: spec, correct, total, pct };
      });
      
      // Sort by specialty name
      list.sort((a, b) => b.pct - a.pct);
      setStats(list);
    } catch (e) {
      console.error("Failed to load performance stats", e);
    }
  };

  useEffect(() => {
    loadStats();

    // Listen to storage changes so that stats are updated instantly when MCQs are answered
    const handleStorageChange = () => {
      loadStats();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const generateSnapshot = async () => {
    setLoading(true);
    setError("");
    try {
      // Re-load statistics from localStorage right before synthesizing
      let storedPerfStr = localStorage.getItem("medglobal-mcq-performance");
      let currentPerf = PRESEEDED_PERFORMANCE;
      try {
        if (storedPerfStr && storedPerfStr !== "undefined" && storedPerfStr !== "null") {
          const temp = JSON.parse(storedPerfStr);
          if (temp && typeof temp === "object" && !Array.isArray(temp)) {
            currentPerf = temp;
          }
        }
      } catch (e) {
        console.error("Error parsing stored performance in generateSnapshot:", e);
      }

      const response = await fetch("/api/knowledge-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performance: currentPerf })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.snapshot) {
        setSnapshot(data.snapshot);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError("Failed to synthesize Knowledge Snapshot. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Generate automatically on mount if none exists
  useEffect(() => {
    generateSnapshot();
  }, []);

  const resetToPreseeded = () => {
    localStorage.setItem("medglobal-mcq-performance", JSON.stringify(PRESEEDED_PERFORMANCE));
    loadStats();
    generateSnapshot();
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-xs space-y-5" id="knowledge-snapshot-container">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#003B95]/10 text-[#003B95] font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#003B95]/15">
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Clinical Diagnostic Engine</span>
          </div>
          <h3 className="text-lg md:text-xl font-serif italic font-bold text-slate-900 flex items-center gap-2">
            <span>Knowledge Snapshot</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">
            Synthesized clinical strengths, critical diagnosis gaps, & board prep plans
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetToPreseeded}
            className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-2 px-3 border border-slate-200 rounded-lg cursor-pointer transition-all"
            title="Reset to preseeded diagnostic mock data"
          >
            Reset History
          </button>
          
          <button
            type="button"
            onClick={generateSnapshot}
            disabled={loading}
            className="bg-[#003B95] hover:bg-blue-950 disabled:bg-blue-300 text-white font-extrabold text-[10px] uppercase tracking-widest py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-re-synthesize"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Analyzing..." : "Re-Synthesize"}</span>
          </button>
        </div>
      </div>

      {/* Grid containing Bar charts and AI Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: Bar indicators of performance */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
              <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              <span>Specialty Performance Map</span>
            </h4>
            
            <div className="space-y-3.5">
              {stats.map((item, index) => {
                let barColor = "bg-rose-500";
                let textColor = "text-rose-700 bg-rose-50 border-rose-100";
                if (item.pct >= 75) {
                  barColor = "bg-emerald-600";
                  textColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                } else if (item.pct >= 55) {
                  barColor = "bg-[#003B95]";
                  textColor = "text-[#003B95] bg-blue-50 border-blue-100";
                }

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.specialty}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">{item.correct}/{item.total} MCQs</span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${textColor}`}>
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-[11px] text-slate-600 font-medium leading-relaxed">
            <span className="font-extrabold text-[#003B95] uppercase tracking-widest text-[9px] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Real-time synchronization
            </span>
            <p>
              Your performance map automatically responds to your correct and incorrect submissions inside the **Assessment MCQ Engine**. Keep practicing to raise your accuracy!
            </p>
          </div>
        </div>

        {/* Right pane: snapshot textual report */}
        <div className="lg:col-span-7 bg-slate-50/60 border border-slate-150 rounded-xl p-4 md:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>Clinical Diagnosis Report</span>
              </h4>
              <span className="text-[8px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Diagnostic Engine Active
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-1/4 pt-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-rose-700 font-semibold text-xs">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-700 space-y-4 leading-relaxed font-medium">
                {/* Parse key headings in Markdown to standard elements */}
                {snapshot.split("\n\n").map((para, i) => {
                  const cleaned = para.trim();
                  if (!cleaned) return null;

                  if (cleaned.startsWith("###")) {
                    return (
                      <h4 key={i} className="text-sm font-serif font-bold text-slate-900 border-b border-slate-200 pb-1 mt-3">
                        {cleaned.replace(/###/g, "").trim()}
                      </h4>
                    );
                  }

                  if (cleaned.startsWith("####")) {
                    const headingText = cleaned.replace(/####/g, "").trim();
                    let icon = <Award className="h-4 w-4 text-[#003B95]" />;
                    if (headingText.includes("Gaps") || headingText.includes("Holes") || headingText.includes("Weak")) {
                      icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
                    } else if (headingText.includes("Action") || headingText.includes("Recommendation") || headingText.includes("Takeaways")) {
                      icon = <Target className="h-4 w-4 text-emerald-600" />;
                    }
                    return (
                      <h5 key={i} className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-2">
                        {icon}
                        <span>{headingText}</span>
                      </h5>
                    );
                  }

                  if (cleaned.startsWith("*") || cleaned.startsWith("-")) {
                    return (
                      <ul key={i} className="list-disc pl-4 space-y-1.5 text-slate-600 font-medium">
                        {cleaned.split("\n").map((li, idx) => {
                          const liCleaned = li.replace(/^[\s*-]+/, "").trim();
                          // Bold match tags inside list items
                          const boldParts = liCleaned.split("**");
                          return (
                            <li key={idx} className="leading-relaxed">
                              {boldParts.map((part, pIdx) => {
                                return pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-extrabold">{part}</strong> : part;
                              })}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  if (/^\d+\./.test(cleaned)) {
                    return (
                      <ol key={i} className="list-decimal pl-4 space-y-1.5 text-slate-600 font-medium">
                        {cleaned.split("\n").map((li, idx) => {
                          const liCleaned = li.replace(/^\d+\.\s*/, "").trim();
                          const boldParts = liCleaned.split("**");
                          return (
                            <li key={idx} className="leading-relaxed">
                              {boldParts.map((part, pIdx) => {
                                return pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-extrabold">{part}</strong> : part;
                              })}
                            </li>
                          );
                        })}
                      </ol>
                    );
                  }

                  // Standard paragraphs
                  const boldParts = cleaned.split("**");
                  return (
                    <p key={i} className="text-slate-600">
                      {boldParts.map((part, pIdx) => {
                        return pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-extrabold">{part}</strong> : part;
                      })}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-semibold italic mt-4 text-center border-t border-slate-150 pt-3">
            "Slight shifts in diagnostic consistency are normal. Continue testing clinical hypotheses to evolve your snapshot."
          </div>
        </div>
      </div>
    </div>
  );
}
