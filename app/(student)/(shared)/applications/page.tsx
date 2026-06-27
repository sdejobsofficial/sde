"use client";

import { useState } from "react";
import {
  useMyApplications,
  useWithdrawApplication,
} from "@/hooks/useApplication";
import { ApplicationStatus, ApplicationCard } from "@/models/applicationModel";
import {
  Briefcase,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  Calendar,
  ChevronRight,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Status config — all using site primary (teal) palette ───────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    dotClass: string;   // Tailwind bg class for the dot/strip
  }
> = {
  [ApplicationStatus.Submitted]: {
    label: "Submitted",
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/20",
    icon: FileText,
    dotClass: "bg-primary/60",
  },
  [ApplicationStatus.Seen]: {
    label: "Viewed",
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/20",
    icon: Eye,
    dotClass: "bg-primary/60",
  },
  [ApplicationStatus.Shortlisted]: {
    label: "Shortlisted",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/25",
    icon: Star,
    dotClass: "bg-primary",
  },
  [ApplicationStatus.InterviewScheduled]: {
    label: "Interview Scheduled",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/25",
    icon: Calendar,
    dotClass: "bg-primary",
  },
  [ApplicationStatus.OfferSent]: {
    label: "Offer Sent",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: CheckCircle2,
    dotClass: "bg-primary",
  },
  [ApplicationStatus.Hired]: {
    label: "Hired 🎉",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: CheckCircle2,
    dotClass: "bg-primary",
  },
  [ApplicationStatus.Rejected]: {
    label: "Not Selected",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: XCircle,
    dotClass: "bg-muted-foreground/40",
  },
  [ApplicationStatus.Withdrawn]: {
    label: "Withdrawn",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: AlertCircle,
    dotClass: "bg-muted-foreground/30",
  },
};

// ── Pipeline steps ───────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  ApplicationStatus.Submitted,
  ApplicationStatus.Seen,
  ApplicationStatus.Shortlisted,
  ApplicationStatus.InterviewScheduled,
  ApplicationStatus.OfferSent,
  ApplicationStatus.Hired,
];

const PIPELINE_LABELS = ["Applied", "Viewed", "Shortlisted", "Interview", "Offer", "Hired"];

function getPipelineStep(status: ApplicationStatus): number {
  const idx = PIPELINE_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

// ── Application Card ─────────────────────────────────────────────────────────

function ApplicationItem({
  app,
  onWithdraw,
  isWithdrawing,
}: {
  app: ApplicationCard;
  onWithdraw: (id: string) => void;
  isWithdrawing: boolean;
}) {
  const cfg = STATUS_CONFIG[app.Status];
  const isTerminal =
    app.Status === ApplicationStatus.Hired ||
    app.Status === ApplicationStatus.Rejected ||
    app.Status === ApplicationStatus.Withdrawn;
  const currentStep = getPipelineStep(app.Status);

  const appliedDate = new Date(app.CreatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group relative bg-background rounded-2xl border border-border shadow-sm shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top accent strip — primary teal */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5 rounded-t-2xl", cfg.dotClass)} />

      <div className="p-5">
        {/* ── Header row ── */}
        <div className="flex items-start gap-3">
          {/* Company logo / placeholder */}
          <div className="shrink-0 w-11 h-11 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
            {app.CompanyLogoUrl ? (
              <Image
                src={app.CompanyLogoUrl}
                alt={app.CompanyName}
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <Building2 size={18} className="text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
              {app.JobTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {app.CompanyName}
            </p>
          </div>

          {/* Status badge — teal primary */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0",
              cfg.bg,
              cfg.color,
              cfg.border,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
            {cfg.label}
          </span>
        </div>

        {/* ── Progress pipeline ── */}
        {!isTerminal && (
          <div className="mt-4">
            <div className="flex items-center">
              {PIPELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all shrink-0",
                        isCompleted
                          ? "bg-primary border-primary"
                          : "bg-background border-border",
                        isCurrent && "ring-2 ring-primary/30 ring-offset-1",
                      )}
                      title={STATUS_CONFIG[step].label}
                    >
                      {isCompleted && (
                        <CheckCircle2 size={10} className="text-primary-foreground" />
                      )}
                    </div>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5",
                          idx < currentStep ? "bg-primary/40" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex mt-1.5">
              {PIPELINE_LABELS.map((label, idx) => (
                <span
                  key={label}
                  className={cn(
                    "text-[9px] leading-none",
                    idx === currentStep
                      ? "text-primary font-bold"
                      : "text-muted-foreground",
                    idx < PIPELINE_STEPS.length - 1 ? "flex-1" : "",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Terminal state banners — all teal-based ── */}
        {app.Status === ApplicationStatus.Hired && (
          <div className="mt-3 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
            <CheckCircle2 size={15} className="text-primary shrink-0" />
            <p className="text-xs text-primary font-medium">
              Congratulations! You have been hired.
            </p>
          </div>
        )}
        {app.Status === ApplicationStatus.Rejected && (
          <div className="mt-3 flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2">
            <XCircle size={15} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Unfortunately, you were not selected for this role.
            </p>
          </div>
        )}
        {app.Status === ApplicationStatus.Withdrawn && (
          <div className="mt-3 flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2">
            <AlertCircle size={15} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              You withdrew this application.
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} />
            <span>Applied {appliedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/jobs/${app.JobId}`}
              className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
            >
              View Job
              <ArrowUpRight size={11} />
            </Link>

            {!isTerminal && (
              <button
                onClick={() => onWithdraw(app.Id)}
                disabled={isWithdrawing}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isWithdrawing ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  "Withdraw"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ apps }: { apps: ApplicationCard[] }) {
  const total = apps.length;
  const active = apps.filter(
    (a) =>
      a.Status !== ApplicationStatus.Rejected &&
      a.Status !== ApplicationStatus.Withdrawn &&
      a.Status !== ApplicationStatus.Hired,
  ).length;
  const hired = apps.filter((a) => a.Status === ApplicationStatus.Hired).length;
  const rejected = apps.filter(
    (a) => a.Status === ApplicationStatus.Rejected,
  ).length;

  const stats = [
    { label: "Total Applied", value: total },
    { label: "In Progress", value: active },
    { label: "Hired", value: hired },
    { label: "Not Selected", value: rejected },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-background rounded-2xl border border-border shadow-sm shadow-sm px-4 py-3"
        >
          <p className="text-2xl font-bold text-primary">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "hired" | "rejected";

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "In Progress" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Not Selected" },
];

function filterApps(apps: ApplicationCard[], filter: Filter): ApplicationCard[] {
  if (filter === "all") return apps;
  if (filter === "active")
    return apps.filter(
      (a) =>
        a.Status !== ApplicationStatus.Rejected &&
        a.Status !== ApplicationStatus.Withdrawn &&
        a.Status !== ApplicationStatus.Hired,
    );
  if (filter === "hired")
    return apps.filter((a) => a.Status === ApplicationStatus.Hired);
  if (filter === "rejected")
    return apps.filter((a) => a.Status === ApplicationStatus.Rejected);
  return apps;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isError, refetch } = useMyApplications(page, 20);
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawApplication();

  const allApps = data?.Data ?? [];
  const filtered = filterApps(allApps, filter);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header — matches jobs page style ── */}
      <div className="bg-background border-b border-border shadow-sm py-5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">
              My Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track the status of all your job applications in one place.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-primary/5"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ── Stats ── */}
        {!isLoading && allApps.length > 0 && <StatsBar apps={allApps} />}

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                filter === tab.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary",
              )}
            >
              {tab.label}
              {tab.key === "all" && data?.Total !== undefined && (
                <span className="ml-1 text-xs opacity-70">({data.Total})</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground">Loading your applications…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={32} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        ) : allApps.length === 0 ? (
          <div className="bg-background rounded-2xl border border-border shadow-sm shadow-sm flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="text-primary/40" size={26} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                No applications yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start exploring jobs and submit your first application.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-primary/30 hover:bg-primary/90 transition-all"
            >
              Browse Jobs
              <ChevronRight size={15} />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              No applications in this category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((app) => (
                <ApplicationItem
                  key={app.Id}
                  app={app}
                  onWithdraw={(id) => withdraw(id)}
                  isWithdrawing={isWithdrawing}
                />
              ))}
            </div>

            {/* Pagination */}
            {data?.HasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 px-5 py-2 rounded-xl hover:bg-primary/5 transition-all"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
