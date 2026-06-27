import { formatSalary, timeAgo } from "@/constants/student/SJobList";
import { cn } from "@/lib/utils";
import { JobCard } from "@/models/jobModel";
import { Building2, MapPin, Share2, Check, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JobCardComponent({ job }: { job: JobCard }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const wmLabel = [, "Remote", "On-site", "Hybrid"][job.WorkMode + 1] ?? "";
  const jtLabel =
    ["Full Time", "Part Time", "Internship", "Contract", "Freelance"][
      job.JobType
    ] ?? "";

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/jobs/${job.Id}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.Id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.Title} at ${job.CompanyName}`,
          text: `Check out this job: ${job.Title} at ${job.CompanyName}`,
          url,
        });
      } catch (err) {}
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer",
        job.IsFeatured &&
          "border-primary/30 ring-1 ring-primary/20 bg-primary/5/30",
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-14 h-14 rounded-2xl border border-border bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
          {job.CompanyLogoUrl ? (
            <Image
              width={56}
              height={56}
              src={job.CompanyLogoUrl}
              alt={job.CompanyName}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <Building2 className="text-muted-foreground/30" size={24} />
          )}
        </div>

        {/* Title + company */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {job.IsFeatured && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium flex-shrink-0 uppercase tracking-wider">
                    ⭐ Featured
                  </span>
                )}
                {job.IsUrgent && (
                  <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium flex-shrink-0 uppercase tracking-wider">
                    Urgent
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
                {job.Title}
              </h3>
              <p className="text-xs font-normal text-muted-foreground mt-1">
                {job.CompanyName}
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
                copied
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
              )}
              title={copied ? "Link copied!" : "Share job"}
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
              <MapPin size={13} className="text-muted-foreground/30" />{" "}
              {job.Location}
            </div>
            <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
            <span className="text-xs text-muted-foreground font-normal">
              {wmLabel}
            </span>
            <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
            <span className="text-xs text-muted-foreground font-normal">
              {jtLabel}
            </span>
            {job.ExperienceRequired.MinYears !== undefined && (
              <>
                <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                <span className="text-xs text-muted-foreground font-normal">
                  {job.ExperienceRequired.MinYears}
                  {job.ExperienceRequired.MaxYears
                    ? `–${job.ExperienceRequired.MaxYears}`
                    : "+"}{" "}
                  yrs
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {job.Skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-xs font-medium bg-muted text-muted-foreground border border-slate-200 px-3 py-1 rounded-lg"
          >
            {s}
          </span>
        ))}
        {job.Skills.length > 4 && (
          <span className="text-xs text-muted-foreground font-normal self-center ml-1">
            +{job.Skills.length - 4}
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-foreground">
            {formatSalary(
              job.Salary.Min,
              job.Salary.Max,
              job.Salary.Currency,
              job.Salary.Visibility,
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
            <Users size={13} /> {job.TotalApplicants}
          </div>
          <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
          <span className="text-xs text-muted-foreground font-normal">
            {timeAgo(job.PublishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
