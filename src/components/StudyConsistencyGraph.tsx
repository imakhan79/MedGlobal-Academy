import React, { useState, useEffect } from "react";
import { Calendar, Flame, Clock, Plus, Award, RefreshCw, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContributionDay {
  date: string;
  label: string;
  hours: number;
  intensity: 0 | 1 | 2 | 3; // 0: None, 1: Light, 2: Medium, 3: High
}

export default function StudyConsistencyGraph() {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [streak, setStreak] = useState(12); // Realistic starter streak
  const [totalHours, setTotalHours] = useState(38.5);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<1 | 2 | 3>(2);
  const [sessionNotes, setSessionNotes] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Load from LocalStorage or generate seed data
  useEffect(() => {
    const cachedData = localStorage.getItem("medglobal-consistency-graph");
    const cachedStreak = localStorage.getItem("medglobal-consistency-streak");
    const cachedHours = localStorage.getItem("medglobal-consistency-hours");

    if (cachedStreak && cachedStreak !== "undefined") setStreak(parseInt(cachedStreak));
    if (cachedHours && cachedHours !== "undefined") setTotalHours(parseFloat(cachedHours));

    if (cachedData && cachedData !== "undefined") {
      try {
        setDays(JSON.parse(cachedData));
        return;
      } catch (e) {
        console.error("Failed to parse cached consistency data, generating fresh seed.", e);
      }
    }

    // Generate 30 days of realistic preloaded study sessions
    const generatedDays: ContributionDay[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const dateStr = d.toISOString().split("T")[0];
      const labelStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Seed a realistic medical school routine: higher study on weekdays, moderate on weekends, occasional off-day (value 0)
      const dayOfWeek = d.getDay();
      let hours = 0;
      let intensity: 0 | 1 | 2 | 3 = 0;

      // 15% chance of day off, otherwise weekday is high/medium, weekend is light/medium
      if (Math.random() > 0.15) {
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Weekday
          hours = Math.random() > 0.4 ? parseFloat((1.5 + Math.random() * 2).toFixed(1)) : parseFloat((0.5 + Math.random()).toFixed(1));
        } else {
          // Weekend
          hours = Math.random() > 0.6 ? parseFloat((1 + Math.random() * 1.5).toFixed(1)) : parseFloat((0.4 + Math.random()).toFixed(1));
        }
        
        if (hours > 2.5) intensity = 3;
        else if (hours >= 1.0) intensity = 2;
        else if (hours > 0) intensity = 1;
      }

      generatedDays.push({
        date: dateStr,
        label: labelStr,
        hours,
        intensity
      });
    }

    setDays(generatedDays);
    saveData(generatedDays, 12, 38.5);
  }, []);

  const saveData = (updatedDays: ContributionDay[], updatedStreak: number, updatedHours: number) => {
    localStorage.setItem("medglobal-consistency-graph", JSON.stringify(updatedDays));
    localStorage.setItem("medglobal-consistency-streak", updatedStreak.toString());
    localStorage.setItem("medglobal-consistency-hours", updatedHours.toFixed(1));
  };

  // Log today's study activity manually
  const handleLogActivity = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    let hoursToAdd = 1.0;
    if (selectedIntensity === 1) hoursToAdd = 0.5;
    if (selectedIntensity === 2) hoursToAdd = 1.5;
    if (selectedIntensity === 3) hoursToAdd = 3.0;

    const updatedDays = days.map((day, idx) => {
      // If it's the last element (today)
      if (idx === days.length - 1) {
        const newHours = parseFloat((day.hours + hoursToAdd).toFixed(1));
        let newIntensity: 0 | 1 | 2 | 3 = 1;
        if (newHours > 2.5) newIntensity = 3;
        else if (newHours >= 1.0) newIntensity = 2;

        return {
          ...day,
          hours: newHours,
          intensity: newIntensity
        };
      }
      return day;
    });

    // Check if yesterday or today had study to prolong streak
    const newStreak = streak + 1;
    const newHours = parseFloat((totalHours + hoursToAdd).toFixed(1));

    setDays(updatedDays);
    setStreak(newStreak);
    setTotalHours(newHours);
    saveData(updatedDays, newStreak, newHours);

    setShowLogModal(false);
    setSessionNotes("");
  };

  // Reset/Simulate a high-consistency medical school study schedule
  const handleSimulateSchedule = (type: "high" | "moderate" | "reset") => {
    const updatedDays: ContributionDay[] = [];
    const today = new Date();
    let computedHours = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const dateStr = d.toISOString().split("T")[0];
      const labelStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      let hours = 0;
      let intensity: 0 | 1 | 2 | 3 = 0;

      if (type === "high") {
        // High intensity: studying almost every single day
        hours = Math.random() > 0.1 ? parseFloat((2.0 + Math.random() * 2.5).toFixed(1)) : 0;
      } else if (type === "moderate") {
        hours = Math.random() > 0.3 ? parseFloat((0.8 + Math.random() * 1.5).toFixed(1)) : 0;
      } else {
        // Clear/Reset
        hours = 0;
      }

      if (hours > 2.5) intensity = 3;
      else if (hours >= 1.0) intensity = 2;
      else if (hours > 0) intensity = 1;

      computedHours += hours;
      updatedDays.push({ date: dateStr, label: labelStr, hours, intensity });
    }

    const newStreak = type === "high" ? 28 : type === "moderate" ? 14 : 0;
    setDays(updatedDays);
    setStreak(newStreak);
    setTotalHours(parseFloat(computedHours.toFixed(1)));
    saveData(updatedDays, newStreak, computedHours);
  };

  // Stats computation
  const activeDaysCount = days.filter(d => d.hours > 0).length;
  const consistencyRate = days.length > 0 ? Math.round((activeDaysCount / days.length) * 100) : 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-5" id="study-consistency-container">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#E0F2FE] text-[#003B95] rounded-lg">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#003B95]">Study Consistency Index</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">30-Day active recall & curriculum heat map</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            id="btn-log-study-session"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Study</span>
          </button>
        </div>
      </div>

      {/* Grid HUD Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-55/40 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Flame className="h-4.5 w-4.5 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Daily Streak</span>
            <span className="text-sm font-black text-slate-800 font-mono">{streak} Days</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Hours</span>
            <span className="text-sm font-black text-slate-800 font-mono">{totalHours} hrs</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Days</span>
            <span className="text-sm font-black text-slate-800 font-mono">{activeDaysCount} / 30</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Consistency</span>
            <span className="text-sm font-black text-slate-800 font-mono">{consistencyRate}%</span>
          </div>
        </div>
      </div>

      {/* Grid of Days */}
      <div className="relative bg-[#FCFCFD] border border-[#E2E8F0] rounded-xl p-4 md:p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] uppercase tracking-widest text-[#64748B] font-extrabold">30-Day Grid Checklist</span>
          <span className="text-[9px] text-[#64748B] font-semibold flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Hover cells for metrics</span>
          </span>
        </div>

        <div className="grid grid-cols-10 gap-2 md:gap-3">
          {days.map((day, idx) => {
            // Pick a beautiful color level based on intensity
            let cellBg = "bg-slate-100 border-slate-200 hover:border-slate-400";
            if (day.intensity === 1) cellBg = "bg-[#E0F2FE] border-[#BAE6FD] hover:border-[#0284C7]";
            if (day.intensity === 2) cellBg = "bg-[#7DD3FC] border-[#38BDF8] hover:border-[#0369A1]";
            if (day.intensity === 3) cellBg = "bg-[#003B95] text-white border-[#002b6d] hover:border-[#001c4a]";

            return (
              <div
                key={day.date}
                className="relative"
                onMouseEnter={() => setActiveTooltip(idx)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  className={`w-full aspect-square rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${cellBg}`}
                >
                  <span className={`text-[9px] font-bold ${day.intensity === 3 ? "text-white" : "text-slate-700"}`}>
                    {day.label.split(" ")[1]}
                  </span>
                </motion.div>

                {/* Micro Tooltip */}
                <AnimatePresence>
                  {activeTooltip === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: -2 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 z-30 bg-slate-900 text-white text-[9px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none border border-slate-800 font-semibold"
                    >
                      <div className="font-extrabold text-[#7DD3FC] text-center">{day.label}</div>
                      <div className="text-center font-mono mt-0.5">{day.hours} Hours Studied</div>
                      <div className="text-slate-400 text-[8px] uppercase tracking-wider text-center font-bold">
                        {day.intensity === 3 ? "🔥 High Intensity" : day.intensity === 2 ? "⚡ Medium Intensity" : day.intensity === 1 ? "📖 Light Study" : "❄️ Day Off"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-widest mr-1">Intensity:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span>
              <span className="text-[8px] font-bold text-[#64748B] uppercase">None</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#E0F2FE] border border-[#BAE6FD]"></span>
              <span className="text-[8px] font-bold text-[#64748B] uppercase">&lt;1h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#7DD3FC] border border-[#38BDF8]"></span>
              <span className="text-[8px] font-bold text-[#64748B] uppercase">1-2h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#003B95] border border-[#002b6d]"></span>
              <span className="text-[8px] font-bold text-[#64748B] uppercase">2h+</span>
            </div>
          </div>

          {/* Quick Schedule Generator */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-widest mr-1">Simulate Preset:</span>
            <button
              onClick={() => handleSimulateSchedule("high")}
              className="text-[8px] font-extrabold uppercase bg-slate-100 hover:bg-[#E0F2FE] border border-slate-200 text-slate-600 hover:text-[#003B95] px-1.5 py-1 rounded transition-colors cursor-pointer"
            >
              High
            </button>
            <button
              onClick={() => handleSimulateSchedule("moderate")}
              className="text-[8px] font-extrabold uppercase bg-slate-100 hover:bg-[#E0F2FE] border border-slate-200 text-slate-600 hover:text-[#003B95] px-1.5 py-1 rounded transition-colors cursor-pointer"
            >
              Mid
            </button>
            <button
              onClick={() => handleSimulateSchedule("reset")}
              className="text-[8px] font-extrabold uppercase bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 px-1.5 py-1 rounded transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs" id="log-activity-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-[#E0F2FE] text-[#003B95] rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-serif italic font-bold text-lg text-slate-800">
                  Log Learning & Active Recall
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Maintain your daily clinical study consistency
                </p>
              </div>

              {/* Log options */}
              <div className="space-y-3">
                <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Study Block Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIntensity(1)}
                    className={`text-[9px] font-bold uppercase tracking-wider p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedIntensity === 1 ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                  >
                    Light Block (30m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIntensity(2)}
                    className={`text-[9px] font-bold uppercase tracking-wider p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedIntensity === 2 ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                  >
                    Mid Block (1.5h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIntensity(3)}
                    className={`text-[9px] font-bold uppercase tracking-wider p-2 rounded-lg border text-center transition-all cursor-pointer ${selectedIntensity === 3 ? "bg-[#003B95] text-white border-[#003B95]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                  >
                    Full Block (3h+)
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Study Notes / Topics Covered
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pediatric cardiology, USMLE clinical block"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#003B95]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleLogActivity}
                  className="flex-1 bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Confirm Log
                </button>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
