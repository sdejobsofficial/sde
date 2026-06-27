import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/models/applicationModel";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          color,
        )}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground/80">{sub}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="h-3 w-52 bg-muted rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>
        </div>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export  function PipelineBar({
  counts,
}: {
  counts: Partial<Record<ApplicationStatus, number>>;
}) {
  const stages = [
    {
      status: ApplicationStatus.Submitted,
      label: "Applied",
      color: "bg-blue-400",
    },
    { status: ApplicationStatus.Seen, label: "Seen", color: "bg-gray-400" },
    {
      status: ApplicationStatus.Shortlisted,
      label: "Shortlisted",
      color: "bg-primary/100",
    },
    {
      status: ApplicationStatus.InterviewScheduled,
      label: "Interview",
      color: "bg-amber-400",
    },
    {
      status: ApplicationStatus.OfferSent,
      label: "Offer",
      color: "bg-emerald-400",
    },
    { status: ApplicationStatus.Hired, label: "Hired", color: "bg-green-500" },
  ];
  const total = stages.reduce((s, st) => s + (counts[st.status] ?? 0), 0) || 1;

  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Pipeline
      </p>
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
        {stages.map((st) => {
          const pct = ((counts[st.status] ?? 0) / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={st.status}
              className={cn("rounded-full transition-all", st.color)}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {stages.map((st) => (
          <div
            key={st.status}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className={cn("w-2 h-2 rounded-full", st.color)} />
            <span>{st.label}</span>
            <span className="font-semibold text-foreground/80">
              {counts[st.status] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}