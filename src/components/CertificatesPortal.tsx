import React, { useState } from "react";
import { PRESEEDED_CERTIFICATES, SUBSCRIPTION_MODELS } from "../data";
import { Certificate, SubscriptionTier } from "../types";
import { Award, Check, QrCode, Shield, Sparkles, Download, CheckCircle, Crown, RefreshCw } from "lucide-react";

interface CertificatesPortalProps {
  currentTier: string;
  onTierChange: (tierId: string) => void;
}

export default function CertificatesPortal({ currentTier, onTierChange }: CertificatesPortalProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate>(PRESEEDED_CERTIFICATES[0]);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const triggerDownload = (cert: Certificate) => {
    setDownloadingCertId(cert.id);
    setTimeout(() => {
      setDownloadingCertId(null);
      alert(`Success: digital certificate for "${cert.courseTitle}" has been prepared and downloaded! QR Code and Blockchain Hash verified.`);
    }, 1200);
  };

  return (
    <div className="space-y-8" id="certificates-subscription-portal">
      {/* SECTION 1: CERTIFICATION ENGINE */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="bg-[#0B1B3D] p-5 md:p-6 text-white flex items-center justify-between border-b border-[#1E293B]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">MedGlobal Credentials</span>
            <h3 className="text-lg md:text-xl font-serif italic font-bold tracking-tight text-white">Verified Academic Certifications</h3>
          </div>
          <Shield className="h-6 w-6 text-teal-300" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Certificate Selection Side (4 cols) */}
          <div className="lg:col-span-4 p-4 border-r border-[#E2E8F0] space-y-3 bg-[#FCFCFD]">
            <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-2">My Completed Programs</h4>
            {PRESEEDED_CERTIFICATES.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCert(c)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${selectedCert.id === c.id ? "bg-white border-[#003B95] text-[#003B95] shadow-sm font-semibold font-serif italic" : "bg-white/50 border-[#E2E8F0] hover:bg-slate-50 text-slate-700"}`}
              >
                <div className="font-bold text-slate-800 font-serif">{c.courseTitle}</div>
                <div className="text-gray-400 font-medium">Issued: {c.issueDate}</div>
                <div className="text-[10px] text-[#003B95] mt-1 font-bold font-mono">Ver ID: {c.verificationId}</div>
              </button>
            ))}
          </div>

          {/* Large Certificate Preview Box (8 cols) */}
          <div className="lg:col-span-8 p-4 md:p-6 bg-slate-50 flex flex-col justify-between items-center gap-5">
            {/* Certificate Academic Border Card */}
            <div className="w-full bg-white border-4 border-double border-[#0B1B3D] p-6 sm:p-8 rounded-xl shadow-md space-y-4 max-w-xl text-center relative overflow-hidden">
              {/* Subtle background seal */}
              <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                <Award className="h-48 w-48 text-[#0B1B3D]" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#003B95] uppercase tracking-widest block font-serif">Certificate of Clinical Accomplishment</span>
                <div className="h-0.5 w-16 bg-[#003B95] mx-auto"></div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 italic">This is to officially certify that</p>
                <h4 className="font-serif text-lg sm:text-2xl font-extrabold text-slate-900 italic tracking-wide">{selectedCert.issuedTo}</h4>
                <p className="text-xs text-gray-500 italic">has successfully completed the comprehensive academic syllabus and assessments for</p>
                <h5 className="font-bold text-sm sm:text-lg text-[#003B95] leading-tight uppercase font-serif italic">{selectedCert.courseTitle}</h5>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 items-center">
                {/* QR Code section */}
                <div className="flex flex-col items-center gap-1">
                  <QrCode className="h-10 w-10 text-gray-700" />
                  <span className="text-[8px] text-gray-400 font-mono font-semibold">QR VERIFIED</span>
                </div>
                {/* Official Seal */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-yellow-500 bg-yellow-50 flex items-center justify-center text-yellow-600 shadow-inner">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[8px] text-yellow-700 font-bold tracking-widest uppercase mt-1">OFFICIAL SEAL</span>
                </div>
                {/* Signatures */}
                <div className="text-center font-serif text-[10px] text-gray-500 flex flex-col items-center border-t border-[#E2E8F0] pt-1">
                  <span className="italic text-slate-800 font-bold">Dr. Amanda Vance</span>
                  <span className="text-[8px] text-gray-400 uppercase">Academic Dean</span>
                </div>
              </div>

              {/* Blockchain and verify metadata */}
              <div className="pt-2 text-[9px] text-slate-400 font-mono border-t border-[#E2E8F0] flex justify-between items-center">
                <span>VERIFICATION ID: <strong className="text-slate-700">{selectedCert.verificationId}</strong></span>
                <span className="bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-100 flex items-center gap-0.5">
                  <CheckCircle className="h-2.5 w-2.5 text-teal-600" />
                  <span>BLOCKCHAIN SECURED</span>
                </span>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={() => triggerDownload(selectedCert)}
              disabled={downloadingCertId !== null}
              className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[11px] uppercase tracking-wider py-3 px-6 rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
              id="btn-download-certificate"
            >
              {downloadingCertId ? <RefreshCw className="h-4 w-4 animate-spin text-white" /> : <Download className="h-4 w-4 text-white" />}
              <span>{downloadingCertId ? "Preparing PDF Certificate..." : "Download High-Resolution Certificate"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUBSCRIPTION TIERS (REVENUE MODEL) */}
      <div className="space-y-6" id="subscription-plans-portal">
        <div className="text-center space-y-1">
          <h3 className="text-xl md:text-2xl font-serif italic font-bold text-slate-900 flex items-center justify-center gap-1.5">
            <Crown className="h-5 w-5 text-amber-500" />
            <span>MedGlobal Flexible Subscription Plans</span>
          </h3>
          <p className="text-xs text-gray-500">Upgrade to unlock clinical simulators, premium Q-Banks, and global CME certifications.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBSCRIPTION_MODELS.map(tier => {
            const isActive = currentTier.toLowerCase() === tier.id.toLowerCase();
            return (
              <div
                key={tier.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${isActive ? "border-amber-400 ring-2 ring-amber-100 shadow-md transform scale-[1.02]" : "border-[#E2E8F0] hover:border-gray-300"}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${tier.badgeColor}`}>
                      {tier.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-0.5">
                        <Crown className="h-3 w-3 fill-amber-500 stroke-none" /> Active
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-[#0F172A] font-serif italic">{tier.price}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold"> / {tier.period}</span>
                  </div>
                  <div className="h-px bg-[#E2E8F0]"></div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 flex-1">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 leading-relaxed">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onTierChange(tier.id)}
                  disabled={isActive}
                  className={`w-full font-extrabold text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all ${isActive ? "bg-amber-100 text-amber-800 cursor-not-allowed" : "bg-[#003B95] hover:bg-blue-950 text-white shadow-sm"}`}
                >
                  {isActive ? "Your Active Plan" : `Upgrade to ${tier.name.split(" ")[0]}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
