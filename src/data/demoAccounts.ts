import { UserRole } from "../types";

export interface DemoAccount {
  name: string;
  role: UserRole;
  email: string;
  password: string; // Demo password for explicit credential logins
  identifier: string;
  preferredFont: string;
  avatar: string;
  org: string;
  badgeColor: string;
  desc: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Dr(c). Sarah Jenkins",
    role: UserRole.STUDENT,
    email: "sarah.jenkins@harvard.edu",
    password: "student_harvard",
    identifier: "Harvard Medical School • STUDENT-8842",
    preferredFont: "font-readable",
    avatar: "👩‍🎓",
    org: "Harvard Medical School",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    desc: "Board Exam preparation mode, customizable flashcards, interactive student Q-bank & consistency heatmaps.",
  },
  {
    name: "Dr. Julian Vance, MD",
    role: UserRole.DOCTOR,
    email: "julian.vance@mayoclinic.org",
    password: "doctor_mayo",
    identifier: "Mayo Clinic • NPI-1049284752",
    preferredFont: "font-serif",
    avatar: "🥼",
    org: "Mayo Clinic",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    desc: "Advanced clinical sandbox simulations, licensed diagnostic toolsets, and CME tracker dashboards.",
  },
  {
    name: "Prof. Evelyn Thorne, PhD",
    role: UserRole.FACULTY,
    email: "e.thorne@johnshopkins.edu",
    password: "faculty_hopkins",
    identifier: "Johns Hopkins • FACULTY-9921",
    preferredFont: "font-readable",
    avatar: "🏫",
    org: "Johns Hopkins University",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    desc: "Classroom curriculum designer, proctoring controls, student gradebooks, and custom case-study builder.",
  },
  {
    name: "Dr. Alan Turing, PhD",
    role: UserRole.RESEARCHER,
    email: "turing.a@salk.edu",
    password: "research_salk",
    identifier: "Salk Institute • RESEARCH-5022",
    preferredFont: "font-mono",
    avatar: "🔬",
    org: "Salk Institute",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    desc: "Anonymized cohort generators, pharmaceutical interaction trials, and medical publication drafts workspace.",
  },
  {
    name: "Marcella Rostova",
    role: UserRole.PHARMA,
    email: "m.rostova@novartis.com",
    password: "pharma_novartis",
    identifier: "Novartis Efficacy Lab • PHARMA-1192",
    preferredFont: "font-sans",
    avatar: "🧪",
    org: "Novartis Pharmaceuticals",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    desc: "Molecular efficacy modeling, compound interaction profiles, and sponsored education webinar dashboards.",
  },
  {
    name: "Director Marcus Sterling",
    role: UserRole.HOSPITAL,
    email: "msterling@massgeneral.org",
    password: "hospital_mass",
    identifier: "Massachusetts General • ADMIN-4402",
    preferredFont: "font-sans",
    avatar: "🏥",
    org: "Mass General Hospital",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    desc: "Departmental safety metrics, clinical error audits, staffing compliance checklists, and risk index widgets.",
  },
];
