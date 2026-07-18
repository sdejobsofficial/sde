import {
  WM_CONFIG,
  JT_LABELS,
  timeAgo,
  formatSalary,
} from "@/constants/student/SCompanyDetail";
import { cn } from "@/lib/utils";
import { JobCard, JobStatus, ReferralStatus } from "@/models/jobModel";
import {
  Link,
  Zap,
  Star,
  BookmarkCheck,
  Bookmark,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";

export function CompanyJobCard({ job }: { job: JobCard }) {
  const [saved, setSaved] = useState(false);
  const wm = WM_CONFIG[job.WorkMode];
  const jtLabel = JT_LABELS[job.JobType] ?? "";
  const exp = job.ExperienceRequired ?? {};
  const salary = formatSalary(
    job.Salary?.Min ?? 0,
    job.Salary?.Max ?? 0,
    job.Salary?.Currency ?? "INR",
    job.Salary?.Visibility ?? 0,
  );

  return (
    <Link href={`/jobs/${job.Id}`} className="block group">
      <div
        className={cn(
          "bg-card rounded-2xl border border-gray-100 shadow-sm p-5",
          "hover:shadow-md hover:border-primary/20 transition-all duration-200",
          job.IsFeatured && "border-primary/30 ring-1 ring-primary/10",
          job.Status !== JobStatus.Active && "opacity-60",
        )}
      >
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap min-h-[20px]">
          {job.IsFeatured && (
            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
              ⭐ Featured
            </span>
          )}
          {job.IsUrgent && (
            <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Zap size={9} /> Urgent
            </span>
          )}
          {job.Status !== JobStatus.Active && (
            <span className="text-xs bg-muted text-muted-foreground/80 border border-border px-2 py-0.5 rounded-full font-medium">
              Closed
            </span>
          )}
          {job.ReferralStatus === ReferralStatus.Open && (
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Star size={9} /> Referral open
            </span>
          )}
        </div>

        {/* Title + save */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary/90 transition-colors leading-snug">
            {job.Title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((v) => !v);
            }}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-primary/100 hover:bg-primary/10 transition-all"
          >
            {saved ? (
              <BookmarkCheck size={14} className="text-primary/100" />
            ) : (
              <Bookmark size={14} />
            )}
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin size={10} className="text-muted-foreground/80" /> {job.Location}
          </span>
          {wm && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1",
                wm.color,
              )}
            >
              <wm.icon size={9} /> {wm.label}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{jtLabel}</span>
          {exp.MinYears != null && (
            <span className="text-xs text-muted-foreground/80">
              · {exp.MinYears}
              {exp.MaxYears ? `–${exp.MaxYears}` : "+"}yr exp
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(job.Skills ?? []).slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs bg-muted/50 text-muted-foreground border border-gray-100 px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
          {(job.Skills ?? []).length > 3 && (
            <span className="text-xs text-muted-foreground/80 self-center">
              +{job.Skills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-sm font-semibold text-foreground/90">{salary}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <span className="flex items-center gap-1">
              <Users size={10} /> {job.TotalApplicants ?? 0}
            </span>
            <span>{timeAgo(job.PublishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
