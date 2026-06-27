import { cn } from "@/lib/utils";
import { JobStatus, WorkMode, JobType, JobCard } from "@/models/jobModel";
import {
  MapPin,
  MoreVertical,
  Pencil,
  Eye,
  Pause,
  CircleDot,
  Trash2,
  Users,
  BookmarkCheck,
  Clock,
  ExternalLink,
  Laptop,
  Building,
  Globe,
  LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteJob } from "@/hooks/useJobs";

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; dot: string }
> = {
  [JobStatus.Draft]: {
    label: "Draft",
    color: "bg-muted text-muted-foreground border-gray-200",
    dot: "bg-gray-400",
  },
  [JobStatus.PendingApproval]: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    dot: "bg-yellow-400",
  },
  [JobStatus.Active]: {
    label: "Active",
    color: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
  },
  [JobStatus.Paused]: {
    label: "Paused",
    color: "bg-orange-50 text-orange-500 border-orange-200",
    dot: "bg-orange-400",
  },
  [JobStatus.Closed]: {
    label: "Closed",
    color: "bg-red-50 text-red-500 border-red-200",
    dot: "bg-red-400",
  },
  [JobStatus.Rejected]: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
};

const WORK_MODE_CONFIG: Record<WorkMode, { label: string; icon: LucideIcon }> =
{
  [WorkMode.Remote]: { label: "Remote", icon: Globe },
  [WorkMode.Onsite]: { label: "On-site", icon: Building },
  [WorkMode.Hybrid]: { label: "Hybrid", icon: Laptop },
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FullTime]: "Full Time",
  [JobType.PartTime]: "Part Time",
  [JobType.Internship]: "Internship",
  [JobType.Contract]: "Contract",
  [JobType.Freelance]: "Freelance",
};

function formatSalary(min: number, max: number) {
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function CompanyJobCard({
  job,
}: {
  job: JobCard & { TotalViews?: number };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutateAsync: deleteJob, isPending } = useDeleteJob();
  const router = useRouter();

  const status = STATUS_CONFIG[job.Status as JobStatus];
  const wm = WORK_MODE_CONFIG[job.WorkMode as WorkMode];
  const WMIcon = wm.icon;
  const fillPct =
    job.TotalOpenings > 0
      ? Math.min(
        100,
        Math.round((job.TotalApplicants / job.TotalOpenings) * 100),
      )
      : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is on a button, link, or menu, don't navigate the card
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/jobs/${job.Id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "bg-card rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md hover:border-primary/20 group cursor-pointer",
        job.Status === JobStatus.Closed
          ? "border-gray-100 opacity-70"
          : "border-gray-100",
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.Title}
            </h3>
            {job.IsUrgent && (
              <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                Urgent
              </span>
            )}
            {job.IsFeatured && (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} className="text-muted-foreground/80" /> {job.Location}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <WMIcon size={11} className="text-muted-foreground/80" /> {wm.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {JOB_TYPE_LABELS[job.JobType as JobType]}
            </div>
            <div className="text-xs font-medium text-foreground/80">
              {formatSalary(job.Salary.Min, job.Salary.Max)} / yr
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.Skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-xs bg-muted/50 text-muted-foreground border border-gray-100 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {job.Skills.length > 3 && (
              <span className="text-xs text-muted-foreground/80">
                +{job.Skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Status badge + menu */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium",
              status.color,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-all"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-card rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                  <Link
                    href={`/recruiter/job-form?id=${job.Id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Pencil size={12} /> Edit job
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Eye size={12} /> Preview
                  </button>
                  {job.Status === JobStatus.Active && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    >
                      <Pause size={12} /> Pause
                    </button>
                  )}
                  {job.Status === JobStatus.Paused && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      <CircleDot size={12} /> Activate
                    </button>
                  )}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm("Are you sure you want to delete this job?")
                        ) {
                          deleteJob(job.Id);
                        }
                      }}
                      disabled={isPending}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {isPending ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 size={12} /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={12} className="text-muted-foreground/80" />
          <span className="font-semibold text-foreground/80">
            {job.TotalApplicants}
          </span>{" "}
          applicants
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookmarkCheck size={12} className="text-muted-foreground/80" />
          <span className="font-semibold text-foreground/80">
            {job.TotalOpenings}
          </span>{" "}
          openings
        </div>

        {/* Fill bar */}
        <div className="flex-1 min-w-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground/80">Fill rate</span>
            <span className="text-xs font-medium text-muted-foreground">
              {fillPct}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillPct >= 80 ? "bg-green-500" : "bg-primary/100",
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="ml-auto text-xs text-muted-foreground/80 shrink-0">
          {job.PublishedAt ? (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo(job.PublishedAt)}
            </span>
          ) : (
            <span className="text-gray-300">Not published</span>
          )}
        </div>

        {job.TotalApplicants > 0 && (
          <Link
            href={`/recruiter/applicants?job=${job.Id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-primary hover:text-primary/90 flex items-center gap-1 hover:underline transition-colors"
          >
            View applicants <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}
