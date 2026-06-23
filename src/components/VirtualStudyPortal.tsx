import React, { useState, useEffect, useRef } from "react";
import { Users, Code, Send, Copy, Check, MessageSquare, ChevronRight, Play, Loader2, ArrowRight, LogOut, Sparkles, AlertCircle, HelpCircle, Activity, Heart, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Peer {
  id: string;
  name: string;
  avatarColor: string;
  selectedOption: number | null;
}

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  avatarColor: string;
}

interface RoomState {
  id: string;
  currentMcq: {
    question: string;
    options: string[];
    correctAnswer: number;
    rationale: string;
    difficulty?: string;
    specialty?: string;
  };
  peers: Peer[];
  chatHistory: ChatMessage[];
  questionIndex: number;
}

export default function VirtualStudyPortal() {
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#003B95");
  const [targetRoomId, setTargetRoomId] = useState("");
  
  // Active connection states
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Pre-configured doctor colors
  const AVATAR_COLORS = ["#003B95", "#0284C7", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

  useEffect(() => {
    // Pick random username/avatar on load
    const medNames = ["Dr. Carter", "Dr. House", "Dr. Grey", "Dr. Watson", "Dr. Avery", "Dr. Foster", "Dr. Shepherd"];
    setUserName(medNames[Math.floor(Math.random() * medNames.length)]);
    setUserColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);

    return () => {
      disconnectSession();
    };
  }, []);

  // Auto scroll chat to bottom when updates arrive
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeRoom?.chatHistory]);

  const disconnectSession = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (activeRoom && myPeerId) {
      // Notify backend we left
      fetch(`/api/study-rooms/${activeRoom.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId: myPeerId })
      }).catch(err => console.error("Disconnect leave notify failed:", err));
    }
    setActiveRoom(null);
    setMyPeerId(null);
    setErrorMsg(null);
    setIsConnecting(false);
  };

  const setupSSEStream = (roomId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource(`/api/study-rooms/${roomId}/stream`);
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "sync" && data.room) {
          setActiveRoom(data.room);
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    sse.onerror = (err) => {
      console.warn("SSE connection interrupted. Reconnecting...", err);
    };
  };

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setErrorMsg("Please provide a name before initializing a room.");
      return;
    }
    setIsConnecting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/study-rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: userName, avatarColor: userColor })
      });
      if (!res.ok) throw new Error("Failed to initialize study room backend session.");
      const data = await res.json();
      
      setMyPeerId(data.peerId);
      setActiveRoom(data.room);
      setupSSEStream(data.roomId);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to create study room session.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      setErrorMsg("Please provide a name before joining.");
      return;
    }
    if (!targetRoomId.trim()) {
      setErrorMsg("Please input a valid session ID.");
      return;
    }
    setIsConnecting(true);
    setErrorMsg(null);

    const formattedId = targetRoomId.trim().toUpperCase();

    try {
      const res = await fetch(`/api/study-rooms/${formattedId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, avatarColor: userColor })
      });
      if (res.status === 404) {
        throw new Error("Invalid Session ID. This study room has expired or does not exist.");
      }
      if (!res.ok) throw new Error("Connection failed.");

      const data = await res.json();
      setMyPeerId(data.peerId);
      setActiveRoom(data.room);
      setupSSEStream(formattedId);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to join room.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (!activeRoom || !myPeerId) return;

    // Optimistic update
    setActiveRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        peers: prev.peers.map(p => p.id === myPeerId ? { ...p, selectedOption: optionIndex } : p)
      };
    });

    try {
      await fetch(`/api/study-rooms/${activeRoom.id}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId: myPeerId, optionIndex })
      });
    } catch (err) {
      console.error("Failed to submit peer option:", err);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeRoom || !myPeerId) return;

    try {
      await fetch(`/api/study-rooms/${activeRoom.id}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId: myPeerId })
      });
    } catch (err) {
      console.error("Failed to advance question:", err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom || !myPeerId) return;

    const content = chatInput.trim();
    setChatInput("");

    try {
      await fetch(`/api/study-rooms/${activeRoom.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId: myPeerId, content })
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCopyId = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Compute stats for current room question
  const totalPeers = activeRoom?.peers.length || 0;
  const answeredCount = activeRoom?.peers.filter(p => p.selectedOption !== null).length || 0;
  const everyoneAnswered = totalPeers > 0 && answeredCount === totalPeers;

  // Track counts per option
  const optionVotes = [0, 0, 0, 0];
  activeRoom?.peers.forEach(p => {
    if (p.selectedOption !== null) {
      optionVotes[p.selectedOption]++;
    }
  });

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm space-y-4" id="virtual-study-portal-card">
      <div className="bg-[#003B95] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/40 rounded-xl">
            <Users className="h-5 w-5 text-[#38BDF8]" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-lg">Virtual Peer Study Lounge</h3>
            <p className="text-[10px] text-blue-200 font-extrabold uppercase tracking-widest mt-0.5">
              Encrypted real-time collaborative medical board practice
            </p>
          </div>
        </div>

        {activeRoom && (
          <button
            onClick={disconnectSession}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-rose-600/90 hover:bg-rose-700 text-white py-1.5 px-3 rounded-lg border border-rose-500 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Lounge</span>
          </button>
        )}
      </div>

      <div className="p-5" id="virtual-study-content-workspace">
        <AnimatePresence mode="wait">
          {!activeRoom ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
              id="lobby-setup-view"
            >
              {/* Left Column: Peer configuration */}
              <div className="md:col-span-5 space-y-4 border-r border-[#E2E8F0]/70 pr-0 md:pr-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0F172A]">My Peer Identity</h4>
                  <p className="text-[10px] text-[#64748B] font-semibold uppercase">Customize your professional alias</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">
                      Full Name / Alias
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Dr. Avery"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#003B95] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1.5">
                      Clinician Theme Color
                    </label>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setUserColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center border-2 ${userColor === c ? "scale-110 border-slate-900" : "border-transparent hover:scale-105"}`}
                          style={{ backgroundColor: c }}
                        >
                          {userColor === c && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 text-xs text-rose-700 font-semibold leading-relaxed">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Create or Join room options */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-6">
                {/* Option A: Create fresh Room */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5 hover:border-[#003B95]/30 transition-colors">
                  <div className="space-y-0.5">
                    <span className="bg-[#E0F2FE] text-[#003B95] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Option A
                    </span>
                    <h4 className="font-serif italic font-bold text-md text-[#0F172A] pt-1">
                      Initialize New Peer Study Room
                    </h4>
                    <p className="text-[10px] text-[#64748B] font-semibold leading-relaxed">
                      Generate a temporary, encrypted board session instantly. Once created, copy the unique clinical ID to invite colleagues or other clinical students.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={isConnecting}
                    className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    id="btn-initialize-study-room"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating Encrypted Key...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>Launch Fresh Study Block</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option B: Join existing room */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5 hover:border-[#003B95]/30 transition-colors">
                  <div className="space-y-0.5">
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Option B
                    </span>
                    <h4 className="font-serif italic font-bold text-md text-[#0F172A] pt-1">
                      Join Live Collaborative Session
                    </h4>
                    <p className="text-[10px] text-[#64748B] font-semibold leading-relaxed">
                      Enter the secure medical session ID shared by your tutor or peers to sync with their active diagnostics loop.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MED-ROOM-F8A32B"
                      value={targetRoomId}
                      onChange={(e) => setTargetRoomId(e.target.value)}
                      className="flex-1 bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#003B95] transition-all uppercase"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={isConnecting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isConnecting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Join Block</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              id="active-study-room-view"
            >
              {/* Left Panel: MCQ diagnostics & progress (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Room Sync Dashboard HUD */}
                <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
                      <Code className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Secure Board Session ID:
                        </span>
                        <span className="bg-sky-500/10 text-sky-300 text-[10px] font-black px-2 py-0.5 rounded font-mono border border-sky-500/20">
                          {activeRoom.id}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                        Active Question: #{activeRoom.questionIndex} • Collaborative Practice
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyId}
                      className="text-[9px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded border border-slate-700 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      {copiedId ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Invite ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Real-time sync MCQ Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 relative overflow-hidden shadow-sm">
                  {/* Specialty badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <span className="bg-[#E0F2FE] text-[#003B95] border border-blue-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      {activeRoom.currentMcq.specialty || "General Medical Science"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      Difficulty: {activeRoom.currentMcq.difficulty || "High Yield"}
                    </span>
                  </div>

                  {/* Question stem */}
                  <div className="space-y-1">
                    <h4 className="font-serif italic font-bold text-lg text-slate-900 leading-relaxed">
                      {activeRoom.currentMcq.question}
                    </h4>
                  </div>

                  {/* Options list */}
                  <div className="space-y-2.5 pt-2">
                    {activeRoom.currentMcq.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isMySelected = activeRoom.peers.find(p => p.id === myPeerId)?.selectedOption === idx;
                      
                      // Highlight colors if everyone answered (reveal stage)
                      const isCorrect = idx === activeRoom.currentMcq.correctAnswer;
                      
                      let optionBorder = "border-[#E2E8F0] hover:border-slate-400 bg-white";
                      let letterColor = "bg-slate-100 text-slate-700 border-slate-200";

                      if (isMySelected) {
                        optionBorder = "border-[#003B95] bg-blue-50/20 shadow-sm";
                        letterColor = "bg-[#003B95] text-white border-[#003B95]";
                      }

                      if (everyoneAnswered) {
                        if (isCorrect) {
                          optionBorder = "border-emerald-500 bg-emerald-50/30";
                          letterColor = "bg-emerald-600 text-white border-emerald-600 animate-pulse";
                        } else if (isMySelected) {
                          optionBorder = "border-rose-400 bg-rose-50/20";
                          letterColor = "bg-rose-600 text-white border-rose-600";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => !everyoneAnswered && handleSelectOption(idx)}
                          disabled={everyoneAnswered}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${optionBorder} ${everyoneAnswered ? "disabled:cursor-not-allowed" : ""}`}
                        >
                          <span className={`w-6 h-6 rounded-lg border text-xs font-black flex items-center justify-center shrink-0 ${letterColor}`}>
                            {letter}
                          </span>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-800 leading-relaxed">{option}</span>
                            
                            {/* Vote distribution bar */}
                            {answeredCount > 0 && (
                              <div className="w-full mt-2.5">
                                <div className="flex items-center justify-between text-[8px] text-slate-400 font-extrabold uppercase mb-1">
                                  <span>Peer selections:</span>
                                  <span>{optionVotes[idx]} / {totalPeers} votes</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${isCorrect && everyoneAnswered ? "bg-emerald-500" : "bg-[#003B95]"}`}
                                    style={{ width: `${(optionVotes[idx] / totalPeers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Everyone Answered Board Reveal / Diagnostic Rationale */}
                  <AnimatePresence>
                    {everyoneAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2"
                        id="collaboration-rationale-hud"
                      >
                        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
                          <Sparkles className="h-4 w-4 text-[#003B95]" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                            Gold Standard Clinical Explanation
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {activeRoom.currentMcq.rationale}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Prompt for non-answered */}
                  {!everyoneAnswered && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-800 font-semibold justify-center animate-pulse">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <span>Waiting for all clinical peers to submit diagnostic choices ({answeredCount}/{totalPeers} submitted)...</span>
                    </div>
                  )}

                  {/* Room moderator / advanced block option */}
                  {everyoneAnswered && (
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                        id="btn-collaborative-next-question"
                      >
                        <span>Request Next Board Question</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Presence list & real-time chat (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Peer Presence Lobby */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Users className="h-4 w-4 text-[#003B95]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                      Connected Clinicians ({totalPeers})
                    </span>
                  </div>

                  <div className="space-y-2" id="connected-peer-list">
                    {activeRoom.peers.map(peer => {
                      const initial = peer.name.replace("Dr. ", "").substring(0, 1).toUpperCase();
                      const hasVoted = peer.selectedOption !== null;

                      return (
                        <div key={peer.id} className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 border"
                              style={{ backgroundColor: peer.avatarColor, borderColor: `${peer.avatarColor}CC` }}
                            >
                              {initial}
                            </span>
                            <div>
                              <span className="text-xs font-extrabold text-slate-800 block leading-tight">
                                {peer.name}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                {peer.id === myPeerId ? "You (active)" : "Collaborator"}
                              </span>
                            </div>
                          </div>

                          <div>
                            {hasVoted ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Answered
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Reading
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Real-Time Chat Workspace */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col h-[350px]">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <MessageSquare className="h-4 w-4 text-[#003B95]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                      Consultation Channel
                    </span>
                  </div>

                  {/* Chat messages box */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-200">
                    {activeRoom.chatHistory.map((msg, index) => {
                      const isSystem = msg.sender === "System";
                      
                      if (isSystem) {
                        return (
                          <div key={index} className="text-center py-1">
                            <span className="bg-slate-200/60 border border-slate-200 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded-md inline-block">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.avatarColor }}></span>
                            <span className="font-extrabold text-[#0F172A] text-[10px]">{msg.sender}</span>
                            <span className="text-[8px] text-slate-400 font-semibold font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="bg-white border border-slate-200/60 p-2 rounded-lg text-slate-700 leading-normal font-semibold shadow-2xs pl-2.5 ml-2.5">
                            {msg.content}
                          </p>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendChat} className="flex gap-1.5 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder="Discuss differential diagnosis..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#003B95] transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-[#003B95] hover:bg-blue-950 text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      id="btn-send-consultation-chat"
                    >
                      <Send className="h-3.5 w-3.5 fill-white" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
