import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, Activity, HeartPulse, Sparkles } from "lucide-react";

interface CardiacAuscultationProps {
  bpm: number;
  demoOption: string;
}

export default function CardiacAuscultation({ bpm, demoOption }: CardiacAuscultationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom states to allow user to toggle sounds or automatically map based on scenario
  const [activeSoundType, setActiveSoundType] = useState<"s3" | "normal" | "murmur">("s3");
  const [stethoscopeMode, setStethoscopeMode] = useState<"bell" | "diaphragm">("bell");
  const stethoscopeModeRef = useRef<"bell" | "diaphragm">("bell");

  // Keep ref in sync to prevent stale closure issues in scheduler interval
  useEffect(() => {
    stethoscopeModeRef.current = stethoscopeMode;
  }, [stethoscopeMode]);

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerIntervalRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const mouseXRef = useRef<number | null>(null);
  const mouseYRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseXRef.current = x;
    mouseYRef.current = y;
  };

  const handleMouseLeave = () => {
    mouseXRef.current = null;
    mouseYRef.current = null;
  };

  // Sync settings based on the current demoOption
  useEffect(() => {
    if (demoOption === "furosemide") {
      setActiveSoundType("normal"); // Compendated heart failure, normal heart sounds S1-S2
    } else if (demoOption === "hydration") {
      setActiveSoundType("murmur"); // Overload, severe systolic murmur + fast heart rate
    } else {
      setActiveSoundType("s3"); // Baseline decompensated heart failure, classic S3 Gallop
    }
  }, [demoOption]);

  const cycleDuration = 60 / bpm;

  // Initialize Audio Context and White Noise Buffer
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Pre-generate white noise buffer for systolic murmur
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    } catch (e) {
      console.error("Failed to initialize Web Audio API", e);
    }
  };

  // Schedule a single cardiac cycle sound event
  const scheduleHeartbeat = (time: number, hasS3: boolean, hasMurmur: boolean) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const currentVol = isMuted ? 0 : volume;
    if (currentVol <= 0) return;

    const k = Math.min(1.0, cycleDuration / 0.75);
    const s1Dur = 0.12 * k;
    const s2Start = 0.30 * k;
    const s2Dur = 0.10 * k;
    const s3Start = 0.43 * k;
    const s3Dur = 0.10 * k;
    const murmurStart = 0.10 * k;
    const murmurEnd = 0.30 * k;

    // Master gain for this cycle
    const cycleGain = ctx.createGain();
    cycleGain.gain.setValueAtTime(currentVol, time);

    // Apply Stethoscope Filter Profile
    const filterNode = ctx.createBiquadFilter();
    const currentMode = stethoscopeModeRef.current;
    if (currentMode === "bell") {
      // Bell mode: emphasizes low-frequency, attenuates high-frequency (like systolic murmur)
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(150, time);
      filterNode.Q.setValueAtTime(1.0, time);
    } else {
      // Diaphragm mode: emphasizes high-frequency (murmurs/snaps), filters out low rumbles (highpass)
      filterNode.type = "highpass";
      filterNode.frequency.setValueAtTime(95, time);
      filterNode.Q.setValueAtTime(0.8, time);
    }

    cycleGain.connect(filterNode);
    filterNode.connect(ctx.destination);

    // 1. S1 ("lub") - Low frequency boom
    const s1Osc = ctx.createOscillator();
    const s1Gain = ctx.createGain();
    s1Osc.type = "sine";
    s1Osc.frequency.setValueAtTime(70, time);
    s1Osc.frequency.exponentialRampToValueAtTime(30, time + s1Dur);
    
    s1Gain.gain.setValueAtTime(0.001, time);
    s1Gain.gain.linearRampToValueAtTime(0.65, time + 0.015);
    s1Gain.gain.exponentialRampToValueAtTime(0.001, time + s1Dur);

    s1Osc.connect(s1Gain);
    s1Gain.connect(cycleGain);
    s1Osc.start(time);
    s1Osc.stop(time + s1Dur);

    // 2. Systolic Murmur (whoosh sound)
    if (hasMurmur && noiseBufferRef.current) {
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBufferRef.current;

      const murmurGain = ctx.createGain();
      const murmurFilter = ctx.createBiquadFilter();
      murmurFilter.type = "bandpass";
      murmurFilter.frequency.setValueAtTime(500, time + murmurStart);
      murmurFilter.Q.setValueAtTime(1.5, time + murmurStart);

      // Murmur envelope
      murmurGain.gain.setValueAtTime(0.001, time + murmurStart);
      murmurGain.gain.linearRampToValueAtTime(0.18, time + murmurStart + 0.04);
      murmurGain.gain.exponentialRampToValueAtTime(0.001, time + murmurEnd);

      noiseNode.connect(murmurFilter);
      murmurFilter.connect(murmurGain);
      murmurGain.connect(cycleGain);

      noiseNode.start(time + murmurStart);
      noiseNode.stop(time + murmurEnd);
    }

    // 3. S2 ("dub") - Slightly higher frequency snap
    const s2Osc = ctx.createOscillator();
    const s2Gain = ctx.createGain();
    s2Osc.type = "sine";
    s2Osc.frequency.setValueAtTime(105, time + s2Start);
    s2Osc.frequency.exponentialRampToValueAtTime(45, time + s2Start + s2Dur);

    s2Gain.gain.setValueAtTime(0.001, time + s2Start);
    s2Gain.gain.linearRampToValueAtTime(0.55, time + s2Start + 0.01);
    s2Gain.gain.exponentialRampToValueAtTime(0.001, time + s2Start + s2Dur);

    s2Osc.connect(s2Gain);
    s2Gain.connect(cycleGain);
    s2Osc.start(time + s2Start);
    s2Osc.stop(time + s2Start + s2Dur);

    // 4. S3 Gallop ("ta") - Very low-pitched early diastolic sound
    if (hasS3) {
      const s3Osc = ctx.createOscillator();
      const s3Gain = ctx.createGain();
      s3Osc.type = "sine";
      s3Osc.frequency.setValueAtTime(40, time + s3Start);
      s3Osc.frequency.exponentialRampToValueAtTime(22, time + s3Start + s3Dur);

      s3Gain.gain.setValueAtTime(0.001, time + s3Start);
      // Make it slightly distinct but softer than S1/S2
      s3Gain.gain.linearRampToValueAtTime(0.38, time + s3Start + 0.02);
      s3Gain.gain.exponentialRampToValueAtTime(0.001, time + s3Start + s3Dur);

      s3Osc.connect(s3Gain);
      s3Gain.connect(cycleGain);
      s3Osc.start(time + s3Start);
      s3Osc.stop(time + s3Start + s3Dur);
    }
  };

  // Scheduler Loop
  const runScheduler = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.15; // Schedule 150ms ahead
    const hasS3 = activeSoundType === "s3" || activeSoundType === "murmur"; // s3 is present in both failure states
    const hasMurmur = activeSoundType === "murmur";

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleHeartbeat(nextNoteTimeRef.current, hasS3, hasMurmur);
      nextNoteTimeRef.current += cycleDuration;
    }
  };

  // Play/Pause Control
  const togglePlay = async () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (isPlaying) {
      // Pause
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
        schedulerIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Resume context if suspended
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      
      // Start scheduling
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      schedulerIntervalRef.current = window.setInterval(runScheduler, 40);
      setIsPlaying(true);
    }
  };

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Update volume in real-time
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  // Waveform Visualizer Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localTime = 0;
    const wavePoints: { y: number; label: string; desc: string }[] = [];
    const maxPoints = 250;

    // Pre-populate with flat baseline
    for (let i = 0; i < maxPoints; i++) {
      wavePoints.push({ y: 0, label: "Baseline", desc: "Quiescent period of the cardiac cycle (diastasis)." });
    }

    const render = () => {
      if (!canvas || !ctx) return;

      // Adjust dimensions dynamically
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;

      // Calculate time increment based on actual clock or animation frame
      localTime += 0.0166; // approx 1/60s
      const currentCycleTime = localTime % cycleDuration;

      // Generate the synchronized signal value
      let yVal = 0;
      let label = "Baseline";
      let desc = "Quiescent period of the cardiac cycle (diastasis).";

      const k = Math.min(1.0, cycleDuration / 0.75);
      const s1Dur = 0.12 * k;
      const s2Start = 0.30 * k;
      const s2Dur = 0.10 * k;
      const s3Start = 0.43 * k;
      const s3Dur = 0.10 * k;
      const murmurStart = 0.10 * k;
      const murmurEnd = 0.30 * k;

      const hasS3 = activeSoundType === "s3" || activeSoundType === "murmur";
      const hasMurmur = activeSoundType === "murmur";

      if (currentCycleTime < s1Dur) {
        // S1 Wave (Lub)
        const p = currentCycleTime / s1Dur;
        const amp = stethoscopeMode === "diaphragm" ? 0.7 : 1.0; // Slightly attenuated in high-pass
        yVal = Math.sin(p * Math.PI * 4) * Math.exp(-p * 3) * amp;
        label = "S1 Sound (Lub)";
        desc = "Closure of mitral/tricuspid valves. Start of systole.";
      } else if (hasMurmur && currentCycleTime >= murmurStart && currentCycleTime < murmurEnd) {
        // Systolic Murmur Noise wave
        const p = (currentCycleTime - murmurStart) / (murmurEnd - murmurStart);
        const amp = stethoscopeMode === "bell" ? 0.08 : 0.4; // Heavily attenuated in bell's lowpass filter
        yVal = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * amp;
        label = "Systolic Murmur";
        desc = "Turbulent high-frequency flow across aortic/mitral valve.";
      } else if (currentCycleTime >= s2Start && currentCycleTime < s2Start + s2Dur) {
        // S2 Wave (Dub)
        const p = (currentCycleTime - s2Start) / s2Dur;
        yVal = Math.sin(p * Math.PI * 5) * Math.exp(-p * 3) * 0.8;
        label = "S2 Sound (Dub)";
        desc = "Closure of aortic/pulmonic valves. Start of diastole.";
      } else if (hasS3 && currentCycleTime >= s3Start && currentCycleTime < s3Start + s3Dur) {
        // S3 Gallop Wave (Ta)
        const p = (currentCycleTime - s3Start) / s3Dur;
        const amp = stethoscopeMode === "diaphragm" ? 0.05 : 0.5; // Heavily attenuated in diaphragm's highpass filter
        yVal = Math.sin(p * Math.PI * 3) * Math.exp(-p * 3) * amp;
        label = "S3 Gallop Sound";
        desc = "Pathological third sound. Rapid volume filling into a stiff, overloaded ventricle.";
      } else {
        // Flat baseline with minor somatic rumble
        yVal = (Math.random() * 2 - 1) * 0.015;
        label = "Baseline";
        desc = "Ventricular diastole diastasis quiescent phase.";
      }

      // Add point to scrolling array
      wavePoints.push({ y: yVal, label, desc });
      if (wavePoints.length > maxPoints) {
        wavePoints.shift();
      }

      // Draw background
      ctx.fillStyle = "#020617"; // dark cosmic background
      ctx.fillRect(0, 0, W, H);

      // Draw medical grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.06)";
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = 0; x < W; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw the baseline center-line
      ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // Draw Phonocardiogram / Cardiac Cycle waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;

      // Color-coding gradient or styles
      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.4)");  // cyan
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.8)"); // emerald
      gradient.addColorStop(1, "rgba(52, 211, 153, 1)");    // light emerald

      ctx.strokeStyle = gradient;

      for (let i = 0; i < wavePoints.length; i++) {
        const x = (i / (wavePoints.length - 1)) * W;
        // Map normal values (-1.5 to 1.5) to visual space
        const amplitude = H * 0.35;
        const y = H / 2 - wavePoints[i].y * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw real-time scanner head glowing dot
      if (wavePoints.length > 0) {
        const lastIndex = wavePoints.length - 1;
        const lastX = W;
        const lastY = H / 2 - wavePoints[lastIndex].y * (H * 0.35);
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lastX - 2, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }

      // Draw vertical hairline crosshair and update direct HTML tooltip if hovered
      if (mouseXRef.current !== null && tooltipRef.current) {
        const x = mouseXRef.current;
        const i = Math.round((x / W) * (wavePoints.length - 1));
        if (i >= 0 && i < wavePoints.length) {
          const pt = wavePoints[i];
          const y = H / 2 - pt.y * (H * 0.35);

          // Draw vertical interactive trace line on canvas
          ctx.strokeStyle = "rgba(52, 211, 153, 0.45)";
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw pinpoint intersection circle
          ctx.fillStyle = "#34d399";
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Update tooltips
          const tooltipEl = tooltipRef.current;
          tooltipEl.style.display = "block";

          // Calculate correct tooltip positioning
          const tooltipWidth = 180;
          let leftPos = x - 20;
          if (leftPos + tooltipWidth > W) {
            leftPos = W - tooltipWidth - 8;
          }
          if (leftPos < 8) {
            leftPos = 8;
          }

          let topPos = y - 55;
          if (topPos < 5) {
            topPos = y + 15; // fallback below if too high
          }

          tooltipEl.style.transform = `translate(${leftPos}px, ${topPos}px)`;

          const labelEl = tooltipEl.querySelector("#tooltip-label");
          const descEl = tooltipEl.querySelector("#tooltip-desc");
          if (labelEl) labelEl.textContent = pt.label;
          if (descEl) descEl.textContent = pt.desc;
        }
      } else if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }

      // Display Labels for sound cycles
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
      ctx.fillText(`HR: ${bpm} bpm`, 10, 15);
      
      // Annotate active audio cycle signature
      let signatureName = "S1/S2 Normal (Lub-Dub)";
      if (activeSoundType === "s3") {
        signatureName = "S3 Gallop (Lub-Dub-Ta)";
      } else if (activeSoundType === "murmur") {
        signatureName = "Systolic Murmur + S3 (Whoosh)";
      }
      ctx.fillStyle = "#34d399";
      ctx.fillText(signatureName, 10, H - 10);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bpm, activeSoundType, cycleDuration, stethoscopeMode]);

  // Handle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getAuscultationDescription = () => {
    switch (activeSoundType) {
      case "s3":
        return {
          title: "Pathological S3 Gallop",
          descr: "A low-frequency third heart sound occurring in early diastole (the 'ta' in lub-dub-ta). It reflects rapid ventricular filling into a stiff, volume-overloaded ventricle—the classic hallmark of decompensated heart failure.",
          color: "border-amber-200 bg-amber-50/50 text-amber-900"
        };
      case "murmur":
        return {
          title: "Systolic Murmur & S3 Gallop",
          descr: "Severe hyperdynamic state with turbulent flow during systole (whoosh sound) combined with persistent S3 filling gallop. Occurs due to high blood volume overloading the mitral valve apparatus.",
          color: "border-red-200 bg-red-50/50 text-red-900"
        };
      case "normal":
      default:
        return {
          title: "Physiological S1/S2 (Compensated)",
          descr: "S1 (mitral/tricuspid closure) and S2 (aortic/pulmonic closure) sound crisp, clear, and uniform. S3 gallop has completely resolved, indicating successful unloading of cardiac pressures and restored compliance.",
          color: "border-emerald-200 bg-emerald-50/50 text-emerald-900"
        };
    }
  };

  const activeMeta = getAuscultationDescription();

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-inner" id="cardiac-auscultation-station">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <HeartPulse className="h-4 w-4 animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">
            Cardiac Auscultation & Waveform
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
            Synchronized
          </span>
        </div>
      </div>

      {/* High Fidelity Dynamic Canvas Waveform */}
      <div className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
        isPlaying 
          ? "animate-pulse border-emerald-500/40 shadow-sm shadow-emerald-500/5" 
          : "border-slate-950"
      }`}>
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`w-full h-24 block cursor-crosshair transition-all duration-300 ${
            isPlaying ? "opacity-100" : "opacity-75"
          }`}
          title="Cardiac Phonocardiogram (PCG) Oscilloscope"
        />

        {/* Dynamic High Performance DOM Tooltip */}
        <div 
          ref={tooltipRef}
          className="absolute pointer-events-none bg-slate-950/95 border border-emerald-500/35 rounded-lg p-2 shadow-2xl text-left hidden transition-opacity duration-200 z-10 max-w-[180px]"
          style={{ top: 0, left: 0 }}
        >
          <div className="text-[10px] font-bold font-mono text-emerald-400 mb-0.5" id="tooltip-label">
            S1 Sound
          </div>
          <div className="text-[9px] text-slate-300 leading-snug font-sans" id="tooltip-desc">
            Lub: Closure of mitral and tricuspid valves.
          </div>
        </div>

        {/* Real-time annotation indicators overlapping the canvas */}
        <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-sm bg-slate-950/80 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase">
            PCG Monitor
          </span>
        </div>
      </div>

      {/* Stethoscope Filter Mode Toggle */}
      <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-400">
          <span className="uppercase tracking-wider">Acoustic Filter Profile</span>
          <span className="text-emerald-400 font-extrabold">
            {stethoscopeMode === "bell" ? "BELL MODE (LOW PASS)" : "DIAPHRAGM MODE (HIGH PASS)"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStethoscopeMode("bell")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              stethoscopeMode === "bell"
                ? "bg-slate-800 text-emerald-400 shadow-xs border border-emerald-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800/85 border border-slate-800"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stethoscopeMode === "bell" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></span>
            <span>BELL (Low-Pitch)</span>
          </button>
          <button
            onClick={() => setStethoscopeMode("diaphragm")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              stethoscopeMode === "diaphragm"
                ? "bg-slate-800 text-emerald-400 shadow-xs border border-emerald-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800/85 border border-slate-800"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stethoscopeMode === "diaphragm" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></span>
            <span>DIAPHRAGM (High-Pitch)</span>
          </button>
        </div>
        <div className="text-[10px] text-slate-400 leading-normal bg-slate-950/20 p-2 rounded-md border border-slate-900/40 font-sans">
          {stethoscopeMode === "bell" ? (
            <span>💡 <strong>Bell:</strong> Filters out high frequencies. Focuses on low rumbles like the <strong>pathological S3 gallop</strong>. S3 wave amplitudes are enhanced on screen.</span>
          ) : (
            <span>💡 <strong>Diaphragm:</strong> Filters out low frequencies. Focuses on crisp snaps (S1, S2) and high-pitched blowing <strong>systolic murmurs</strong>. S3 wave is attenuated on screen.</span>
          )}
        </div>
      </div>

      {/* Control console */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-300 shadow-md ${
              isPlaying 
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950" 
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            }`}
            id="btn-stethoscope-play"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>PAUSE AUSCULTATION</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>LISTEN TO HEART SOUNDS</span>
              </>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-850">
          <span className="text-[9px] font-mono text-slate-400 font-bold">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[9px] font-mono text-emerald-400 font-bold w-6 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Interactive explanations */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed transition-all duration-500 ${activeMeta.color}`}>
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="font-serif">{activeMeta.title}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-700">
          {activeMeta.descr}
        </p>
      </div>
    </div>
  );
}
