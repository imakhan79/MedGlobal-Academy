/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = "Student",
  DOCTOR = "Doctor",
  FACULTY = "Faculty",
  RESEARCHER = "Researcher",
  PHARMA = "Pharmaceutical partner",
  HOSPITAL = "Hospital Administrator"
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  category: "Medicine" | "Surgery" | "Gynecology" | "Pediatrics" | "Diagnostics" | "Other";
  description: string;
  icon: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  rationale: string;
  difficulty: "Easy" | "Medium" | "Hard";
  specialty: string;
}

export interface ClinicalCase {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  occupation: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitals: {
    bp: string;
    hr: number;
    rr: number;
    temp: string;
    spo2: number;
  };
  physicalExam: string;
  ecgOrLabSnippet?: string;
  finalDiagnosis: string;
  correctManagement: string;
}

export interface ResearchCourse {
  id: string;
  title: string;
  category: "Fundamentals" | "Biostatistics" | "Writing" | "Clinical Trials" | "Advanced";
  duration: string;
  lessonsCount: number;
  description: string;
  outline: string[];
  isPremium: boolean;
}

export interface DrugProfile {
  genericName: string;
  brandName: string;
  manufacturer: string;
  drugClass: string;
  indications: string;
  contraindications: string;
  sideEffects: string;
  drugInteractions: string;
  dosage: string;
  pregnancyCategory: string;
  lactationSafety: string;
  fdaStatus: string;
}

export interface MedicalTerm {
  term: string;
  pronunciation: string;
  definition: string;
  clinicalSignificance: string;
  category: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  category: "Research" | "FDA Approval" | "WHO Guidelines" | "Tech Update";
  snippet: string;
  content: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badgeColor: string;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  issuedTo: string;
  issueDate: string;
  verificationId: string;
  qrCodeValue: string;
}
