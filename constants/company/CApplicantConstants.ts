import { ApplicationStatus } from "@/models/applicationModel";
import {
  LucideIcon,
  FileText,
  Eye,
  Sparkles,
  CalendarClock,
  Gift,
  BadgeCheck,
  XCircle,
  UserX,
  Users,
} from "lucide-react";

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    dot: string;
    icon: LucideIcon;
  }
> = {
  [ApplicationStatus.Submitted]: {
    label: "Applied",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-400",
    icon: FileText,
  },
  [ApplicationStatus.Seen]: {
    label: "Seen",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    icon: Eye,
  },
  [ApplicationStatus.Shortlisted]: {
    label: "Shortlisted",
    color: "bg-violet-50 text-violet-600 border-violet-200",
    dot: "bg-violet-500",
    icon: Sparkles,
  },
  [ApplicationStatus.InterviewScheduled]: {
    label: "Interview",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    icon: CalendarClock,
  },
  [ApplicationStatus.OfferSent]: {
    label: "Offer Sent",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
    icon: Gift,
  },
  [ApplicationStatus.Hired]: {
    label: "Hired",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
    icon: BadgeCheck,
  },
  [ApplicationStatus.Rejected]: {
    label: "Rejected",
    color: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-400",
    icon: XCircle,
  },
  [ApplicationStatus.Withdrawn]: {
    label: "Withdrawn",
    color: "bg-orange-50 text-orange-500 border-orange-200",
    dot: "bg-orange-400",
    icon: UserX,
  },
};

export const STATUS_FILTERS: {
  label: string;
  value: ApplicationStatus | null;
  icon: LucideIcon;
}[] = [
  { label: "All", value: null, icon: Users },
  { label: "Applied", value: ApplicationStatus.Submitted, icon: FileText },
  { label: "Seen", value: ApplicationStatus.Seen, icon: Eye },
  {
    label: "Shortlisted",
    value: ApplicationStatus.Shortlisted,
    icon: Sparkles,
  },
  {
    label: "Interview",
    value: ApplicationStatus.InterviewScheduled,
    icon: CalendarClock,
  },
  { label: "Offer Sent", value: ApplicationStatus.OfferSent, icon: Gift },
  { label: "Hired", value: ApplicationStatus.Hired, icon: BadgeCheck },
  { label: "Rejected", value: ApplicationStatus.Rejected, icon: XCircle },
];

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

export function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
