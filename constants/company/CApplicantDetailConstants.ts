import { ApplicationStatus, RejectionReason } from "@/models/applicationModel";

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  [ApplicationStatus.Submitted]: {
    label: "Submitted",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  [ApplicationStatus.Seen]: {
    label: "Seen",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  [ApplicationStatus.Shortlisted]: {
    label: "Shortlisted",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  [ApplicationStatus.InterviewScheduled]: {
    label: "Interview Scheduled",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  [ApplicationStatus.OfferSent]: {
    label: "Offer Sent",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [ApplicationStatus.Hired]: {
    label: "Hired",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  [ApplicationStatus.Rejected]: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  [ApplicationStatus.Withdrawn]: {
    label: "Withdrawn",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-300",
  },
};

export const PIPELINE_STEPS = [
  { status: ApplicationStatus.Submitted, label: "Submitted" },
  { status: ApplicationStatus.Seen, label: "Seen" },
  { status: ApplicationStatus.Shortlisted, label: "Shortlisted" },
  { status: ApplicationStatus.InterviewScheduled, label: "Interview" },
  { status: ApplicationStatus.OfferSent, label: "Offer" },
  { status: ApplicationStatus.Hired, label: "Hired" },
];

export const REJECTION_LABELS: Record<RejectionReason, string> = {
  [RejectionReason.NotAFit]: "Not a fit",
  [RejectionReason.OverQualified]: "Over qualified",
  [RejectionReason.UnderQualified]: "Under qualified",
  [RejectionReason.PositionFilled]: "Position filled",
  [RejectionReason.NoResponse]: "No response",
  [RejectionReason.Other]: "Other",
};

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
