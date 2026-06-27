import { SalaryVisibility } from "@/models/jobModel";
import { Globe, Building2, Laptop } from "lucide-react";

export  function formatSalary(
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
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days}d ago`;
  return `Posted ${Math.floor(days / 30)}mo ago`;
}

export const WORK_MODE_MAP: Record<
  number,
  { label: string; icon: typeof Globe; color: string }
> = {
  0: {
    label: "Remote",
    icon: Globe,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  1: {
    label: "On-site",
    icon: Building2,
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  2: {
    label: "Hybrid",
    icon: Laptop,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

export const JOB_TYPE_MAP: Record<number, string> = {
  0: "Full Time",
  1: "Part Time",
  2: "Internship",
  3: "Contract",
  4: "Freelance",
};

export const EXP_LEVEL_MAP: Record<number, string> = {
  0: "Fresher",
  1: "Junior",
  2: "Mid-Level",
  3: "Senior",
  4: "Lead",
  5: "Executive",
};