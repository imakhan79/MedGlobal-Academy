import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Check, 
  Copy, 
  Terminal, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  Trash2, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Info, 
  Layers, 
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  FileCode,
  CheckCircle2
} from "lucide-react";
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  getSupabaseClient, 
  saveSupabaseOverrides, 
  clearSupabaseOverrides 
} from "../lib/supabase";
import { PRESEEDED_MCQS } from "../data";
import { MCQ } from "../types";

export default function SupabaseHub() {
  const [supabaseUrl, setUrl] = useState(getSupabaseUrl());
  const [supabaseAnonKey, setAnonKey] = useState(getSupabaseAnonKey());
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Tab within Supabase Hub: Schema vs Sync vs Table Explorer
  const [subTab, setSubTab] = useState<"schema" | "sync" | "explorer">("schema");
  
  // DDL tab selection
  const [ddlTab, setDdlTab] = useState<"mcqs" | "performance" | "cases">("mcqs");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Live tables data explorer states
  const [explorerTable, setExplorerTable] = useState<"medglobal_mcqs" | "medglobal_performance" | "medglobal_cases">("medglobal_mcqs");
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Live counts
  const [cloudCounts, setCloudCounts] = useState({ mcqs: 0, performance: 0, cases: 0 });

  useEffect(() => {
    // Attempt auto-check on mount if variables are present
    if (getSupabaseAnonKey()) {
      testConnection(false);
    }
  }, []);

  const handleSaveOverrides = () => {
    saveSupabaseOverrides(supabaseUrl, supabaseAnonKey);
    setConnectionStatus("idle");
    setConnectionError(null);
    testConnection(true);
  };

  const handleClearOverrides = () => {
    clearSupabaseOverrides();
    setUrl(getSupabaseUrl());
    setAnonKey(getSupabaseAnonKey());
    setConnectionStatus("idle");
    setConnectionError(null);
    
    // Alert notification
    showToast("Cleared developer overrides. Resetting to standard configurations.");
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const testConnection = async (showNotification = true) => {
    setConnectionStatus("testing");
    setConnectionError(null);
    
    const client = getSupabaseClient();
    if (!client) {
      setConnectionStatus("failed");
      setConnectionError("Supabase client could not be initialized. Please check that both URL and Anon Key are specified.");
      return;
    }

    try {
      // Test simple ping or select query to see if client is authenticated correctly
      // We will select a count of mcqs table, or if that fails due to missing table, we check schema/connection
      const { data, error } = await client
        .from("medglobal_mcqs")
        .select("id")
        .limit(1);

      if (error) {
        // If the error is 'relation does not exist', the connection is actually successful (the credentials are correct), but the table is missing!
        if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
          setConnectionStatus("success");
          if (showNotification) {
            showToast("Connection Success! (Note: Tables do not exist yet. Run the SQL schema script.)");
          }
          // Fetch counts (which will be 0/missing)
          updateCounts(client);
          return;
        }
        throw error;
      }

      setConnectionStatus("success");
      if (showNotification) {
        showToast("Connected successfully to your live Supabase database!");
      }
      updateCounts(client);
      
      // Auto fetch explorer table if successful
      fetchExplorerData(explorerTable);
    } catch (err: any) {
      console.error("Supabase Connection Error:", err);
      setConnectionStatus("failed");
      setConnectionError(err.message || "Network error. Please check your Supabase project access, URL and Anon Key.");
    }
  };

  const updateCounts = async (client = getSupabaseClient()) => {
    if (!client) return;
    try {
      const fetchCount = async (tableName: string) => {
        const { count, error } = await client
          .from(tableName)
          .select("*", { count: "exact", head: true });
        return error ? 0 : (count || 0);
      };

      const mcqCount = await fetchCount("medglobal_mcqs");
      const perfCount = await fetchCount("medglobal_performance");
      const casesCount = await fetchCount("medglobal_cases");

      setCloudCounts({
        mcqs: mcqCount,
        performance: perfCount,
        cases: casesCount
      });
    } catch (e) {
      // Ignore counting failures if tables don't exist
    }
  };

  // Push local preseeded questions to Supabase
  const pushLocalQuestionsToCloud = async () => {
    const client = getSupabaseClient();
    if (!client) {
      showToast("Cannot initialize connection. Enter your Supabase keys first.");
      return;
    }

    setLoadingTable(true);
    try {
      // Map questions to match Supabase database schema
      const mappedQuestions = PRESEEDED_MCQS.map((q: any, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        rationale: q.rationale,
        specialty: q.specialty || "General Medicine",
        difficulty: q.difficulty || "Intermediate",
        is_usmle: q.isUSMLE || false,
        high_yield_notes: q.highYieldNotes || "High-yield point: Essential clinical takeaway."
      }));

      const { error } = await client
        .from("medglobal_mcqs")
        .upsert(mappedQuestions, { onConflict: "id" });

      if (error) throw error;

      showToast(`Pushed ${mappedQuestions.length} pre-seeded questions to Supabase cloud!`);
      updateCounts(client);
      fetchExplorerData("medglobal_mcqs");
    } catch (err: any) {
      console.error(err);
      alert(`Sync Error: Ensure you have executed the DDL schema in your Supabase SQL editor first.\n\nDetails: ${err.message}`);
    } finally {
      setLoadingTable(false);
    }
  };

  // Pull explorer data
  const fetchExplorerData = async (tableName: string) => {
    const client = getSupabaseClient();
    if (!client) return;

    setLoadingTable(true);
    try {
      const { data, error } = await client
        .from(tableName)
        .select("*")
        .order("id", { ascending: true })
        .limit(100);

      if (error) throw error;
      setTableData(data || []);
    } catch (err: any) {
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Delete a record from active explorer table
  const handleDeleteRecord = async (id: any) => {
    const client = getSupabaseClient();
    if (!client) return;

    if (!confirm("Are you sure you want to delete this record from Supabase? This action is permanent.")) return;

    try {
      const { error } = await client
        .from(explorerTable)
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("Record deleted successfully from Supabase!");
      fetchExplorerData(explorerTable);
      updateCounts(client);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (connectionStatus === "success") {
      fetchExplorerData(explorerTable);
    }
  }, [explorerTable, connectionStatus]);

  // SQL Schema Templates for the SQL editor in Supabase
  const sqlDdlTemplates = {
    mcqs: `-- Create table for MedGlobal Question Bank
CREATE TABLE IF NOT EXISTS public.medglobal_mcqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_answer INTEGER NOT NULL,
    rationale TEXT NOT NULL,
    specialty VARCHAR(100) DEFAULT 'General Medicine',
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    is_usmle BOOLEAN DEFAULT false,
    high_yield_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.medglobal_mcqs ENABLE ROW LEVEL SECURITY;

-- Create an anonymous read-only policy
CREATE POLICY "Allow public read access to mcqs" 
ON public.medglobal_mcqs 
FOR SELECT 
USING (true);

-- Create an write policy for authenticated users
CREATE POLICY "Allow write/upsert access to anyone for simulation" 
ON public.medglobal_mcqs 
FOR ALL 
USING (true);`,

    performance: `-- Create table for User Learning Statistics & Milestones
CREATE TABLE IF NOT EXISTS public.medglobal_performance (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    total_answered INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    accuracy_percentage NUMERIC(5, 2) DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    specialty_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.medglobal_performance ENABLE ROW LEVEL SECURITY;

-- Allow read and write for simulated operations
CREATE POLICY "Allow all access for user performance" 
ON public.medglobal_performance 
FOR ALL 
USING (true);`,

    cases: `-- Create table for OSCE & Interactive Case Studies logs
CREATE TABLE IF NOT EXISTS public.medglobal_cases (
    id SERIAL PRIMARY KEY,
    case_title VARCHAR(255) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    ai_feedback TEXT,
    grading_score INTEGER,
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.medglobal_cases ENABLE ROW LEVEL SECURITY;

-- Allow read and write for simulated operations
CREATE POLICY "Allow all access for clinical case sessions" 
ON public.medglobal_cases 
FOR ALL 
USING (true);`
  };

  const filteredExplorerData = tableData.filter(item => {
    const text = JSON.stringify(item).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6" id="supabase-integration-workspace">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#003B95] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-blue-400/30"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner introducing connection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="h-44 w-44 text-sky-400" />
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Supabase Connection Mode Active
          </span>
        </div>

        <h2 className="text-xl md:text-3xl font-serif italic font-black text-white">
          Supabase SQL Cloud Integration
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl mt-2 leading-relaxed font-sans">
          Connect your clinical simulator platform directly with your Supabase PostgreSQL cloud database! Synchronize question banks, OSCE patient simulations, study metrics, and academic progress instantly.
        </p>

        {/* Project reference detail */}
        <div className="mt-5 flex flex-wrap gap-3 items-center text-xs">
          <div className="bg-slate-850 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 font-mono">
            <span className="text-slate-400">Target Project ID:</span>
            <span className="text-sky-400 font-extrabold select-all">wyckaujzyfvwajwdmwpw</span>
          </div>
          <a
            href="https://supabase.com/dashboard/project/wyckaujzyfvwajwdmwpw"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Open Supabase Console</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Connection Configuration Form (Takes 5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
                <span className="font-extrabold text-[#003B95] text-xs uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#003B95]" />
                  <span>Secure Config Panel</span>
                </span>
                
                {/* Status Badge */}
                {connectionStatus === "success" ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Check className="h-3 w-3" /> Connected
                  </span>
                ) : connectionStatus === "failed" ? (
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 animate-bounce" /> Error
                  </span>
                ) : connectionStatus === "testing" ? (
                  <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Testing...
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
                    Not Verified
                  </span>
                )}
              </div>

              {/* Informational Box */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] p-3.5 rounded-xl text-[11px] leading-relaxed mb-5 font-sans">
                <p className="font-semibold">⚡ Fast Development Sync Mode Enabled:</p>
                <p className="mt-1 text-slate-600">
                  You can paste your Supabase keys directly below. Overrides are securely cached locally in your sandbox browser session so you can test live database synchronization without restarting the container!
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-[#64748B] text-[9px] font-extrabold uppercase tracking-widest block mb-1">
                    Supabase Project Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-[#003B95] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[#64748B] text-[9px] font-extrabold uppercase tracking-widest block mb-1 flex justify-between">
                    <span>SUPABASE ANON API KEY</span>
                    <span className="text-[8px] text-[#003B95] font-black uppercase tracking-wider">Save locally in sandbox</span>
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-[#003B95] transition-all"
                  />
                </div>
              </div>

              {/* Error Display */}
              {connectionError && (
                <div className="mt-4 bg-rose-50 border border-rose-100 p-3 rounded-xl text-[10px] text-rose-700 leading-relaxed font-mono flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <span>{connectionError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex flex-col gap-2">
              <button
                onClick={handleSaveOverrides}
                className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${connectionStatus === "testing" ? "animate-spin" : ""}`} />
                <span>Save Keys & Connect</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testConnection(true)}
                  disabled={connectionStatus === "testing"}
                  className="bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-extrabold text-[9px] uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Ping Status</span>
                </button>
                <button
                  onClick={handleClearOverrides}
                  className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-extrabold text-[9px] uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Custom Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Tabs for Schema DDL, Sync Center, or Explorer (Takes 7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col h-full">
            
            {/* Horizontal sub-tabs */}
            <div className="flex border-b border-[#E2E8F0] pb-3 mb-5 gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSubTab("schema")}
                className={`px-3 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  subTab === "schema" ? "bg-[#003B95] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>1. SQL Schema DDL</span>
              </button>
              <button
                onClick={() => setSubTab("sync")}
                className={`px-3 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  subTab === "sync" ? "bg-[#003B95] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>2. Cloud Sync Hub</span>
              </button>
              <button
                onClick={() => setSubTab("explorer")}
                className={`px-3 py-2 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  subTab === "explorer" ? "bg-[#003B95] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>3. Live Table Explorer</span>
              </button>
            </div>

            {/* TAB CONTENT: Schema SQL DDL */}
            {subTab === "schema" && (
              <div className="space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider mb-2">
                    Execute Schema in Supabase SQL Editor
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Before you can push or pull records, you need to create the tables in your Supabase project. Open your Supabase SQL Editor, select a table below, copy the SQL DDL block, and run it!
                  </p>

                  {/* Tiny pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-3 gap-1">
                    {[
                      { id: "mcqs", label: "Questions Table (mcqs)" },
                      { id: "performance", label: "Performance Tracker" },
                      { id: "cases", label: "OSCE Case Logs" }
                    ].map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDdlTab(d.id as any)}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[9px] uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                          ddlTab === d.id ? "bg-white text-[#003B95] shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* SQL Block Container */}
                  <div className="relative">
                    <pre className="bg-[#0F172A] text-emerald-400 p-4 rounded-2xl text-[9px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
                      <code>{sqlDdlTemplates[ddlTab]}</code>
                    </pre>

                    <button
                      onClick={() => copyToClipboard(sqlDdlTemplates[ddlTab], ddlTab)}
                      className="absolute top-3 right-3 bg-slate-800 hover:bg-[#003B95] hover:text-white text-slate-300 border border-slate-700 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      {copiedText === ddlTab ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mt-4 text-[10px] text-amber-800 leading-relaxed flex gap-2">
                  <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Row Level Security (RLS) Warning:</strong> The copyable script includes default permissive RLS policies for swift verification in development. In standard production, customize policies based on user authentication.
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Cloud Sync Center */}
            {subTab === "sync" && (
              <div className="space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider mb-2">
                    Simulate & Test Cloud Data Sync
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Once you've run the SQL script in your Supabase editor, you can push academic questions or fetch database record counts directly to test high-fidelity data transfer.
                  </p>

                  {/* Sync actions status list */}
                  <div className="space-y-3">
                    {/* Action 1 */}
                    <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-[#003B95]" />
                          <span className="font-bold text-slate-850 text-[11px]">Push Standard MCQs to Cloud</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                          Uploads pre-seeded cardiology & medical license questions directly to your Supabase PostgreSQL database.
                        </p>
                      </div>
                      <button
                        onClick={pushLocalQuestionsToCloud}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-widest py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Push to Supabase</span>
                      </button>
                    </div>

                    {/* Action 2 */}
                    <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="h-4 w-4 text-[#003B95]" />
                          <span className="font-bold text-slate-850 text-[11px]">Synchronize Counts & Refresh Stats</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                          Query the current live count of questions, performance metrics, and case logs securely saved in Supabase.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          testConnection(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-widest py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh Counts</span>
                      </button>
                    </div>
                  </div>

                  {/* Cloud Statistics Card */}
                  <div className="mt-6 border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#64748B] block mb-3">
                      Supabase DB Live Metrics Summary
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">MCQs Table</span>
                        <span className="text-xl font-black text-[#003B95] mt-1 block">
                          {connectionStatus === "success" ? cloudCounts.mcqs : "—"}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Performance</span>
                        <span className="text-xl font-black text-[#003B95] mt-1 block">
                          {connectionStatus === "success" ? cloudCounts.performance : "—"}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Case Logs</span>
                        <span className="text-xl font-black text-[#003B95] mt-1 block">
                          {connectionStatus === "success" ? cloudCounts.cases : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-400 mt-3 font-mono">
                  CONNECTION PORTAL STATUS: {connectionStatus.toUpperCase()} | TARGET API: {getSupabaseUrl()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Live Table Explorer */}
            {subTab === "explorer" && (
              <div className="space-y-4 flex-grow flex flex-col h-full">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
                      Live Table Record Inspector
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Explore, search, and delete actual records in your Supabase database.
                    </p>
                  </div>

                  {/* Select Table to Explore */}
                  <select
                    value={explorerTable}
                    onChange={(e) => setExplorerTable(e.target.value as any)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="medglobal_mcqs">Questions (mcqs)</option>
                    <option value="medglobal_performance">Performance Records</option>
                    <option value="medglobal_cases">Case Session Logs</option>
                  </select>
                </div>

                {/* Filter and search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search logs inside ${explorerTable}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 outline-none focus:border-[#003B95] transition-all"
                  />
                </div>

                {/* Data Grid Inspector */}
                <div className="border border-[#E2E8F0] rounded-xl flex-grow overflow-y-auto max-h-72 bg-[#F8FAFC]">
                  {connectionStatus !== "success" ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <Lock className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-600">Database Connection Required</p>
                      <p className="text-[10px] text-slate-400 max-w-sm mt-1">
                        Connect using your Supabase credentials in the Secure Config Panel first to view and browse live database records.
                      </p>
                    </div>
                  ) : loadingTable ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full gap-2">
                      <RefreshCw className="h-6 w-6 text-[#003B95] animate-spin" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fetching DB Records...</span>
                    </div>
                  ) : filteredExplorerData.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400">
                      <AlertCircle className="h-8 w-8 text-slate-300 mb-1" />
                      <p className="text-xs font-bold">No Records Found</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        The table is currently empty or no items match your search. Click "Sync Center" to seed initial data.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-[#E2E8F0] font-extrabold uppercase text-[#64748B] tracking-wider sticky top-0">
                          <th className="p-2 w-12 text-center">ID</th>
                          <th className="p-2">Details / Title</th>
                          <th className="p-2">Content Snippet</th>
                          <th className="p-2 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] bg-white">
                        {filteredExplorerData.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2 text-center font-bold text-slate-500">{item.id}</td>
                            <td className="p-2">
                              {explorerTable === "medglobal_mcqs" && (
                                <div>
                                  <span className="font-bold text-slate-800 line-clamp-1">{item.question}</span>
                                  <span className="text-[8px] bg-sky-50 text-sky-700 px-1 py-0.5 rounded font-black uppercase tracking-wide mt-1 inline-block">
                                    {item.specialty}
                                  </span>
                                </div>
                              )}
                              {explorerTable === "medglobal_performance" && (
                                <div>
                                  <span className="font-bold text-slate-850">{item.user_email}</span>
                                  <span className="block text-[8px] text-slate-400">Last active: {item.last_active_date}</span>
                                </div>
                              )}
                              {explorerTable === "medglobal_cases" && (
                                <div>
                                  <span className="font-bold text-slate-800">{item.case_title}</span>
                                  <span className="block text-[8px] text-slate-400">Patient: {item.patient_name} ({item.department})</span>
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-slate-600 font-mono text-[9px] max-w-xs truncate">
                              {explorerTable === "medglobal_mcqs" && (
                                <span className="line-clamp-2">Options: {item.options?.join(" | ")}</span>
                              )}
                              {explorerTable === "medglobal_performance" && (
                                <span>Accuracy: {item.accuracy_percentage}% | Streak: {item.current_streak} days</span>
                              )}
                              {explorerTable === "medglobal_cases" && (
                                <span className="line-clamp-2">Feedback: {item.ai_feedback || "None"}</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
