import React, { useState } from "react";
import { 
  Type, Sliders, Sparkles, Check, Sun, Moon, Eye, 
  HelpCircle, Info, BookOpen, Compass, RotateCcw, Glasses
} from "lucide-react";

interface TypographyControllerProps {
  fontFamily: "font-sans" | "font-serif" | "font-readable" | "font-mono";
  setFontFamily: (font: "font-sans" | "font-serif" | "font-readable" | "font-mono") => void;
  fontSize: "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl";
  setFontSize: (size: "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl") => void;
  lineHeight: "leading-normal" | "leading-relaxed" | "leading-loose";
  setLineHeight: (lh: "leading-normal" | "leading-relaxed" | "leading-loose") => void;
  letterSpacing: "tracking-normal" | "tracking-wide" | "tracking-widest";
  setLetterSpacing: (ls: "tracking-normal" | "tracking-wide" | "tracking-widest") => void;
  readingTheme: "light" | "sepia" | "dark";
  setReadingTheme: (theme: "light" | "sepia" | "dark") => void;
  showRuler: boolean;
  setShowRuler: (show: boolean) => void;
}

export default function TypographyController({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  letterSpacing,
  setLetterSpacing,
  readingTheme,
  setReadingTheme,
  showRuler,
  setShowRuler,
}: TypographyControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const resetToDefault = () => {
    setFontFamily("font-sans");
    setFontSize("text-sm");
    setLineHeight("leading-normal");
    setLetterSpacing("tracking-normal");
    setReadingTheme("light");
    setShowRuler(false);
  };

  return (
    <>
      {/* 1. FLOATING CONTROL TOGGLE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2" id="typography-controller-floating-btn">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all border ${
            isOpen 
              ? "bg-[#003B95] border-[#002663] text-white rotate-90 scale-105" 
              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:scale-105"
          }`}
          title="Reader Preferences & Typography Panel"
        >
          <Type className="h-5 w-5" />
        </button>

        {/* READING RULER TOGGLE TIP */}
        {showRuler && (
          <div className="bg-[#003B95] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md animate-pulse">
            Active Reading Focus Ruler
          </div>
        )}
      </div>

      {/* 2. PREFERENCES PANEL */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-5 space-y-5 animate-slideUp text-slate-800"
          id="typography-settings-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Glasses className="h-5 w-5 text-[#003B95]" />
              <div>
                <h4 className="text-sm font-serif font-bold text-slate-900">Reader Preferences</h4>
                <p className="text-[9px] uppercase tracking-wider text-[#64748B] font-extrabold">Optimize text for comprehension</p>
              </div>
            </div>
            <button 
              onClick={resetToDefault} 
              className="text-[#64748B] hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              title="Reset Typography Defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Lexend Explainer Prompt */}
          <div className="bg-[#E0F2FE]/50 border border-blue-100 rounded-xl p-3 text-[10px] text-slate-600 leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#003B95] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Comprehension Font Science
              </span>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-[#003B95] underline font-bold cursor-pointer"
              >
                {showInfo ? "Hide Details" : "Why Lexend?"}
              </button>
            </div>
            <p>
              The <strong>"Lexend"</strong> typeface is mathematically engineered to match eye tracking paces, significantly improving reading speed, fluency, and cognitive understanding of extensive clinical vignettes.
            </p>
            {showInfo && (
              <p className="pt-1.5 border-t border-blue-100 text-[9px] text-slate-500 animate-fadeIn font-medium">
                Lexend's expanded character widths, specific optical kerning, and custom counters alleviate cognitive load, allowing medical students to parse diagnostic parameters 19.3% faster with zero accuracy loss.
              </p>
            )}
          </div>

          {/* Typeface Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block">Font Typeface</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "font-sans", name: "Inter (Clinical)", desc: "Clean & modern UI", cssClass: "font-sans" },
                { id: "font-readable", name: "Lexend (Focus)", desc: "High comprehension", cssClass: "font-readable font-bold" },
                { id: "font-serif", name: "Playfair (Textbook)", desc: "Academic editorial", cssClass: "font-serif" },
                { id: "font-mono", name: "JetBrains (Labs)", desc: "Technical metrics", cssClass: "font-mono" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id as any)}
                  className={`p-2 text-left rounded-xl border transition-all cursor-pointer ${
                    fontFamily === f.id 
                      ? "bg-[#003B95]/5 border-[#003B95] ring-1 ring-[#003B95]" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`text-xs ${f.cssClass} text-slate-900 flex items-center justify-between`}>
                    <span>{f.name}</span>
                    {fontFamily === f.id && <Check className="h-3 w-3 text-[#003B95] shrink-0" />}
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5 leading-none">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reading Contrast Themes */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block">Contrast / Color Tint</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", name: "Default", bg: "bg-[#FCFCFD]", text: "text-slate-800", border: "border-slate-200" },
                { id: "sepia", name: "Warm Sepia", bg: "bg-[#FAF6EE]", text: "text-[#433422]", border: "border-[#EFE1CC]" },
                { id: "dark", name: "Night Mode", bg: "bg-[#0F172A]", text: "text-slate-200", border: "border-slate-800" }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setReadingTheme(theme.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${theme.bg} ${theme.text} ${theme.border} ${
                    readingTheme === theme.id 
                      ? "ring-2 ring-[#003B95] font-bold" 
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-[#64748B]">
              <span>Text Size (Scale)</span>
              <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase font-black">
                {fontSize === "text-xs" ? "Compact" : fontSize === "text-sm" ? "Standard" : fontSize === "text-base" ? "Medium" : fontSize === "text-lg" ? "Large" : "Extra Large"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {[
                { id: "text-xs", label: "A-" },
                { id: "text-sm", label: "A" },
                { id: "text-base", label: "A+" },
                { id: "text-lg", label: "A++" },
                { id: "text-xl", label: "A+++" }
              ].map(sz => (
                <button
                  key={sz.id}
                  onClick={() => setFontSize(sz.id as any)}
                  className={`py-1 text-center font-bold text-xs rounded-lg transition-all cursor-pointer ${
                    fontSize === sz.id 
                      ? "bg-white text-[#003B95] shadow-xs border border-slate-200/60" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing Adjustments */}
          <div className="grid grid-cols-2 gap-4">
            {/* Line Height */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block">Line Spacing</label>
              <select
                value={lineHeight}
                onChange={(e) => setLineHeight(e.target.value as any)}
                className="w-full h-8 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
              >
                <option value="leading-normal">Compact</option>
                <option value="leading-relaxed">Comfortable</option>
                <option value="leading-loose">Extra Spacious</option>
              </select>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] block">Letter Kern</label>
              <select
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(e.target.value as any)}
                className="w-full h-8 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
              >
                <option value="tracking-normal">Standard</option>
                <option value="tracking-wide">Wide Span</option>
                <option value="tracking-widest">Extra Span</option>
              </select>
            </div>
          </div>

          {/* Reading Ruler Toggle */}
          <div className="border-t border-[#E2E8F0] pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#003B95]" />
              <div>
                <span className="text-[11px] font-bold block leading-none">Focus Reading Ruler</span>
                <span className="text-[8px] text-slate-500 leading-none">Overlay line helper to block distraction</span>
              </div>
            </div>
            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${showRuler ? "bg-[#003B95]" : "bg-slate-200"}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${showRuler ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
