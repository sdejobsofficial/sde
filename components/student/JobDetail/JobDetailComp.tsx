import { JobCard, SalaryVisibility } from "@/models/jobModel";
import { Briefcase, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function StatPill({
  icon: Icon,
  label,
  value,
  color = "text-muted-foreground",
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-muted/50 rounded-xl border border-gray-100 flex-1 min-w-0">
      <Icon size={16} className={color} />
      <span className="text-xs font-bold text-foreground text-center leading-tight">
        {value}
      </span>
      <span className="text-xs text-muted-foreground/80 text-center">{label}</span>
    </div>
  );
}

export function SimilarJobCard({ job }: { job: JobCard }) {
  const s = job.Salary ?? {};

  const salary = (() => {
    if (s.Visibility === SalaryVisibility.HiddenFromCandidates) return "";
    if (s.Visibility === SalaryVisibility.Negotiable) return "Negotiable";
    if (!s.Min && !s.Max) return "";
    const sym = (s.Currency ?? "INR") === "INR" ? "₹" : "$";
    const fmt = (n: number) =>
      n >= 100000
        ? `${sym}${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
        : `${sym}${(n / 1000).toFixed(0)}K`;
    return `${fmt(s.Min ?? 0)}–${fmt(s.Max ?? 0)}`;
  })();

  return (
    <Link href={`/jobs/${job.Id}`} className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.CompanyLogoUrl ? (
            <Image
              width={40}
              height={40}
              src={job.CompanyLogoUrl}
              alt={job.CompanyName}
              className="w-full h-full object-contain"
            />
          ) : (
            <Briefcase size={13} className="text-muted-foreground/80" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground/90 group-hover:text-primary/90 truncate transition-colors">
            {job.Title}
          </p>
          <p className="text-xs text-muted-foreground/80 truncate">
            {job.CompanyName} · {job.Location}
          </p>
        </div>
        {salary && (
          <span className="text-xs text-muted-foreground flex-shrink-0">{salary}</span>
        )}
      </div>
    </Link>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-48 mb-6" />
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-card rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="h-px bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-muted rounded"
                  style={{ width: `${80 - i * 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-card rounded-2xl border border-gray-100 h-64" />
          <div className="bg-card rounded-2xl border border-gray-100 h-48" />
        </div>
      </div>
    </div>
  );
}
