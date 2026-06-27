import { SalaryVisibility, WorkMode, JobType } from "@/models/jobModel";
import { Globe, Building2, Laptop } from "lucide-react";

export function formatSalary(
  min: number,
  max: number,
  currency: string,
  visibility: number,
) {
  if (visibility === SalaryVisibility.HiddenFromCandidates)
    return "Salary hidden";
  if (visibility === SalaryVisibility.Negotiable) return "Negotiable";
  const sym = currency === "INR" ? "₹" : "$";
  const fmt = (n: number) =>
    n >= 100000
      ? `${sym}${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
      : `${sym}${(n / 1000).toFixed(0)}K`;
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

export const WM_CONFIG: Record<
  number,
  { label: string; icon: typeof Globe; color: string }
> = {
  [WorkMode.Remote]: {
    label: "Remote",
    icon: Globe,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  [WorkMode.Onsite]: {
    label: "On-site",
    icon: Building2,
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  [WorkMode.Hybrid]: {
    label: "Hybrid",
    icon: Laptop,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

export const JT_LABELS: Record<number, string> = {
  [JobType.FullTime]: "Full Time",
  [JobType.PartTime]: "Part Time",
  [JobType.Internship]: "Internship",
  [JobType.Contract]: "Contract",
  [JobType.Freelance]: "Freelance",
};

export  const JOB_TABS = [
  { label: "All jobs", value: "all" },
  { label: "Remote", value: String(WorkMode.Remote) },
  { label: "On-site", value: String(WorkMode.Onsite) },
  { label: "Hybrid", value: String(WorkMode.Hybrid) },
  { label: "Internship", value: "internship" },
];