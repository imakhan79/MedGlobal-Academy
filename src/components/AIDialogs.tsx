import React, { useState } from "react";
import { Send, Sparkles, AlertCircle, RefreshCw, BookOpen, User, Bot, HelpCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BioTwinSimulator from "./BioTwinSimulator";

interface Message {
  role: "user" | "model";
  content: string;
}

interface AIDialogsProps {
  initialMode?: "tutor" | "research" | "coach" | "biotwin";
}

export default function AIDialogs({ initialMode = "biotwin" }: AIDialogsProps) {
  const [mode, setMode] = useState<"tutor" | "research" | "coach" | "biotwin">(initialMode);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    tutor: [
      { role: "model", content: "Welcome! I am your **Medical Tutor**. Ask me any medical concept, diagnostic guidelines, or pathophysiology. I am trained on standard international textbooks (Harrison's, Robbins Pathology, etc.)." }
    ],
    research: [
      { role: "model", content: "Greetings! I am your **Research Assistant**. I can help you draft literature searches, formulate PICO research questions, design clinical trials, or propose sample statistical analysis plans." }
    ],
    coach: [
      { role: "model", content: "Hello! I am your **Exam Coach**. Let's practice high-yield vignettes for USMLE, FCPS, FRCS, or MRCP. I can review your clinical weak spots and design custom preparation paths." }
    ],
    biotwin: []
  });
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeMessages = messages[mode as "tutor" | "research" | "coach"] || [];

  const getSystemInstruction = () => {
    switch (mode) {
      case "tutor":
        return "You are an expert Medical Education Tutor (MD, PhD) guiding students. Explain medical concepts using high-yield structured details, clear diagnostic paths, and physiological rationales. Speak with academic clarity.";
      case "research":
        return "You are a senior Clinical Investigator and Biostatistician. Help draft research proposals, literature searches, define study protocols, sample size calculations, and statistical guidelines with precision.";
      case "coach":
        return "You are a professional Medical Examination Coach for USMLE, FRCS, MRCP, FCPS. Provide clear exam-focused vignettes, high-yield clinical correlations, and strategies to dissect multiple-choice questions.";
      default:
        return "";
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "tutor": return "Ask about a disease (e.g. 'Pathophysiology of diabetic ketoacidosis')...";
      case "research": return "Ask for research support (e.g. 'Draft research proposal for heart failure')...";
      case "coach": return "Ask for examination coaching (e.g. 'Give me a USMLE Step 2 high-yield case')...";
      default: return "";
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    // Clear error
    setErrorMessage("");
    
    // Add user message
    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...activeMessages, userMsg];
    
    setMessages(prev => ({
      ...prev,
      [mode]: updatedMessages
    }));
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          mode: mode,
          systemInstruction: getSystemInstruction()
        })
      });

      if (!response.ok) {
        throw new Error("Server error, failed to get AI response.");
      }

      const data = await response.json();
      
      if (data.error) {
        setErrorMessage(data.error);
      }

      const reply = data.response || "No response received. Please try again.";
      
      setMessages(prev => ({
        ...prev,
        [mode]: [...updatedMessages, { role: "model", content: reply }]
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Network issue connecting to medical backend. Operating in simulated emergency mode.");
      // Fallback
      setMessages(prev => ({
        ...prev,
        [mode]: [...updatedMessages, { role: "model", content: "🚨 [Simulated Assistant Connection Timeout] Our cloud servers are busy preparing clinical materials. Ensure your GEMINI_API_KEY is active in the AI Studio Secrets panel." }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = {
    tutor: [
      "Pathophysiology of Diabetic Ketoacidosis",
      "ECG changes in Acute Hyperkalemia",
      "Treatment algorithms for severe Sepsis"
    ],
    research: [
      "PICO question for SGLT2 inhibitors in heart failure",
      "Draft a 200-word Medical Ethics literature review",
      "Outline statistical power calculation for 100-patient trial"
    ],
    coach: [
      "High-yield USMLE Step 1 Renal Vignette",
      "Common FCPS Part I Surgery high-yield spots",
      "FRCS Viva scenario: Acute pancreatitis diagnosis"
    ],
    biotwin: [] as string[]
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col ${mode === "biotwin" ? "min-h-[750px]" : "h-[650px]"}`} id="ai-chat-portal">
      {/* Header Tabs */}
      <div className="bg-white border-b border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-[#003B95]" />
          <h2 className="text-lg font-serif italic font-bold text-[#0F172A]">MedGlobal Clinical Consultation Engines</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#F1F5F9] p-1.5 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => { setMode("biotwin"); setErrorMessage(""); }}
            className={`py-2.5 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex flex-col md:flex-row items-center justify-center gap-1.5 ${mode === "biotwin" ? "bg-[#003B95] text-white shadow-sm font-serif italic" : "text-[#64748B] hover:bg-slate-200/50"}`}
            id="tab-ai-biotwin"
          >
            <Activity className="h-4 w-4 shrink-0" />
            <span>BioTwin OS</span>
          </button>
          <button
            onClick={() => { setMode("tutor"); setErrorMessage(""); }}
            className={`py-2.5 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex flex-col md:flex-row items-center justify-center gap-1.5 ${mode === "tutor" ? "bg-white text-[#003B95] shadow-sm border border-[#E2E8F0] font-serif italic" : "text-[#64748B] hover:bg-slate-200/50"}`}
            id="tab-ai-tutor"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Medical Tutor</span>
          </button>
          <button
            onClick={() => { setMode("research"); setErrorMessage(""); }}
            className={`py-2.5 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex flex-col md:flex-row items-center justify-center gap-1.5 ${mode === "research" ? "bg-white text-[#003B95] shadow-sm border border-[#E2E8F0] font-serif italic" : "text-[#64748B] hover:bg-slate-200/50"}`}
            id="tab-ai-research"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            <span>Research Assistant</span>
          </button>
          <button
            onClick={() => { setMode("coach"); setErrorMessage(""); }}
            className={`py-2.5 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex flex-col md:flex-row items-center justify-center gap-1.5 ${mode === "coach" ? "bg-white text-[#003B95] shadow-sm border border-[#E2E8F0] font-serif italic" : "text-[#64748B] hover:bg-slate-200/50"}`}
            id="tab-ai-coach"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Exam Coach</span>
          </button>
        </div>
      </div>

      {mode === "biotwin" ? (
        <div className="flex-1 overflow-y-auto p-4 bg-[#FCFCFD]" id="biotwin-integration-pane">
          <BioTwinSimulator />
        </div>
      ) : (
        <>
          {/* Main Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFCFD]">
            {activeMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`p-2 rounded-full shrink-0 ${msg.role === "user" ? "bg-[#003B95]/10 text-[#003B95]" : "bg-teal-50 text-teal-700 border border-teal-100"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-[#003B95]" />}
                </div>
                <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-[#003B95] text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-[#E2E8F0]"}`}>
                  {/* Simple inline markdown processor for bolding and lines */}
                  <div className="whitespace-pre-line">
                    {msg.content.split("\n").map((line, idx) => {
                      // Handle basic markdown lists and boldings
                      let lineHtml: React.ReactNode = line;
                      if (line.startsWith("### ")) {
                        lineHtml = <h4 className="font-serif italic font-bold text-base mt-2 mb-1 text-[#003B95]">{line.replace("### ", "")}</h4>;
                      } else if (line.startsWith("## ")) {
                        lineHtml = <h3 className="font-serif italic font-bold text-lg mt-3 mb-1 text-[#0F172A] border-b border-[#E2E8F0] pb-1.5">{line.replace("## ", "")}</h3>;
                      } else if (line.startsWith("* ")) {
                        lineHtml = <div className="pl-4 py-0.5 flex items-start gap-1.5"><span>•</span><span>{line.replace("* ", "")}</span></div>;
                      } else if (line.startsWith("- ")) {
                        lineHtml = <div className="pl-4 py-0.5 flex items-start gap-1.5"><span>•</span><span>{line.replace("- ", "")}</span></div>;
                      }
                      
                      // Simple bolding processor **bold**
                      if (typeof lineHtml === "string" && lineHtml.includes("**")) {
                        const parts = lineHtml.split("**");
                        return (
                          <p key={idx} className="mb-1">
                            {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-[#003B95]">{p}</strong> : p)}
                          </p>
                        );
                      }
                      
                      return <div key={idx}>{lineHtml}</div>;
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-full bg-blue-50 text-blue-950 animate-bounce">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] text-slate-400 text-xs flex items-center gap-2 shadow-sm rounded-tl-none font-bold uppercase tracking-wider">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#003B95]" />
                  <span>Consulting clinical database reference...</span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <span className="font-semibold">Notice:</span> {errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div className="p-3 bg-white border-t border-[#E2E8F0]">
            <p className="text-[9px] uppercase tracking-widest text-[#64748B] font-extrabold mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-[#003B95]" /> Suggested Clinical Inquiries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions[mode as "tutor" | "research" | "coach"]?.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  disabled={isLoading}
                  className="text-[10px] uppercase tracking-wider bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-[#003B95] text-[#64748B] hover:text-[#003B95] py-2 px-3 rounded-lg text-left transition-all max-w-full truncate font-bold"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#E2E8F0] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#003B95] transition-all disabled:opacity-50"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#003B95] hover:bg-blue-950 text-white p-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
              id="ai-chat-submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
