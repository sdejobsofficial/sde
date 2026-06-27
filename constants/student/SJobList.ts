import {
  WorkMode,
  JobType,
  ExperienceLevel,
  SalaryVisibility,
} from "@/models/jobModel";
import { Globe, Laptop, Building2 } from "lucide-react";

export const WORK_MODE_OPTIONS = [
  { label: "Remote", value: WorkMode.Remote, icon: Globe },
  { label: "Hybrid", value: WorkMode.Hybrid, icon: Laptop },
  { label: "On-site", value: WorkMode.Onsite, icon: Building2 },
];

export const JOB_TYPE_OPTIONS = [
  { label: "Full Time", value: JobType.FullTime },
  { label: "Part Time", value: JobType.PartTime },
  { label: "Internship", value: JobType.Internship },
  { label: "Contract", value: JobType.Contract },
];

export const EXP_OPTIONS = [
  { label: "Fresher (0 yrs)", value: ExperienceLevel.Fresher },
  { label: "Junior (0–2 yrs)", value: ExperienceLevel.Junior },
  { label: "Mid (2–5 yrs)", value: ExperienceLevel.Mid },
  { label: "Senior (5–10 yrs)", value: ExperienceLevel.Senior },
  { label: "Lead (8+ yrs)", value: ExperienceLevel.Lead },
  { label: "Executive", value: ExperienceLevel.Executive },
];

export const SALARY_RANGES = [
  { label: "₹0 – ₹5L", min: 0, max: 500000 },
  { label: "₹5L – ₹10L", min: 500000, max: 1000000 },
  { label: "₹10L – ₹20L", min: 1000000, max: 2000000 },
  { label: "₹20L – ₹50L", min: 2000000, max: 5000000 },
  { label: "₹50L+", min: 5000000, max: undefined },
];

export const PAGE_SIZE = 10;

export function formatSalary(
  min: number,
  max: number,
  currency: string,
  visibility: number,
) {
  if (visibility === SalaryVisibility.HiddenFromCandidates)
    return "Salary hidden";
  if (visibility === SalaryVisibility.Negotiable) return "Negotiable";
  const fmt = (n: number) =>
    n >= 100000
      ? `${currency === "INR" ? "₹" : "$"}${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
      : `${currency === "INR" ? "₹" : "$"}${(n / 1000).toFixed(0)}K`;
  return `${fmt(min)} – ${fmt(max)}`;
}

export function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
