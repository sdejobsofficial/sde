"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Users,
  Globe,
  Briefcase,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Calendar,
  DollarSign,
  Award,
  Zap,
  AlertCircle,
  TrendingUp,
  Send,
  Trophy,
  Share2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompany, useJobById, useJobs } from "@/hooks/useJobs";
import { useCurrentUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { SalaryVisibility, JobStatus, FormType } from "@/models/jobModel";
import type { Job } from "@/models/jobModel";
import Image from "next/image";
import { CompanyMeta } from "@/models/userModel";
import {
  JobDetailSkeleton,
  StatPill,
  SimilarJobCard,
} from "@/components/student/JobDetail/JobDetailComp";
import { CompanyCard } from "@/components/student/JobDetail/JobDetailCompanyCard";
import {
  WORK_MODE_MAP,
  JOB_TYPE_MAP,
  EXP_LEVEL_MAP,
  formatSalary,
  timeAgo,
} from "@/constants/student/SJobDetail";
import { DescriptionRenderer } from "@/components/company/CompanyDescriptionRenderer";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: job, isLoading, isError } = useJobById(id);
  const { data: companyData } = useCompany(job?.CompanyId ?? "");
  const { data: similarData } = useJobs(
    { jobType: job?.JobType !== undefined ? [job.JobType] : [] },
    1,
    10,
  );
  const similarJobs = (similarData?.data ?? [])
    .filter((j) => j.Id !== id)
    .slice(0, 3);

  const { data: currentUser } = useCurrentUser();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleExternalApply = useCallback(
    (url: string) => {
      if (!currentUser) {
        // Encode the job page URL so we can return after login
        const returnTo = encodeURIComponent(`/jobs/${id}`);
        router.push(`/login?next=${returnTo}&externalApply=${encodeURIComponent(url)}`);
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [currentUser, id, router],
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.Title ? `${job.Title} — SDE Jobs` : "Job listing",
          text: job?.Title
            ? `Check out this job: ${job.Title}`
            : "Check out this job listing",
          url,
        });
      } catch {
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-muted/50/80">
        <div className="h-14 bg-card border-b border-gray-100" />
        <JobDetailSkeleton />
      </div>
    );

  if (isError || !job)
    return (
      <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-300" size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground/80">
            Job not found
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            This listing may have been removed or expired.
          </p>
          <Link href="/jobs">
            <Button
              variant="outline"
              className="mt-4 h-9 px-4 rounded-xl text-sm"
            >
              ← Browse jobs
            </Button>
          </Link>
        </div>
      </div>
    );

  const j = job as Job & {
    CompanyName?: string;
    CompanyLogoUrl?: string;
    CompanyMeta?: CompanyMeta;
  };

  const wm = WORK_MODE_MAP[j.WorkMode ?? -1];
  const jtLabel = JOB_TYPE_MAP[j.JobType] ?? "";
  const exp = j.ExperienceRequired ?? {};
  const expLabel = EXP_LEVEL_MAP[exp.Level ?? -1] ?? "";
  const salary = j.Salary ?? {};
  const salaryStr = formatSalary(
    salary.Min ?? 0,
    salary.Max ?? 0,
    salary.Currency ?? "INR",
    salary.Visibility ?? 0,
  );
  const isOpen = j.Status === JobStatus.Active;
  const deadline = j.ApplicationDeadline
    ? new Date(j.ApplicationDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-muted/50/80">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-5">
          <Link
            href="/jobs"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Jobs
          </Link>
          <ChevronRight size={12} />
          <span className="text-muted-foreground font-medium truncate">
            {j.Title}
          </span>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── LEFT: Main content ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header card */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  {companyData?.AvatarUrl ? (
                    <Image
                      src={companyData.AvatarUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <Building2 size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {j.IsFeatured && (
                          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full font-medium">
                            ⭐ Featured
                          </span>
                        )}
                        {j.IsUrgent && (
                          <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Zap size={10} /> Urgently hiring
                          </span>
                        )}
                        {!isOpen && (
                          <span className="text-xs bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                      <h1 className="text-xl font-bold text-foreground leading-tight">
                        {j.Title}
                      </h1>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Link
                          href={`/companies/${j.CompanyId}`}
                          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          {j.CompanyName ?? "Company"}
                          <BadgeCheck size={13} className="text-blue-400" />
                        </Link>
                      </div>
                    </div>

                    {/* Share button */}
                    <button
                      onClick={handleShare}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-medium transition-all",
                        copied
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
                      )}
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={12} />
                          Share
                        </>
                      )}
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} className="text-muted-foreground/80" />{" "}
                      {j.Location}
                    </div>
                    {wm && (
                      <span
                        className={cn(
                          "text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1",
                          wm.color,
                        )}
                      >
                        <wm.icon size={10} /> {wm.label}
                      </span>
                    )}
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                      {jtLabel}
                    </span>
                    <span className="text-xs text-muted-foreground/80">
                      {timeAgo(j.PublishedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mt-5">
                <StatPill
                  icon={DollarSign}
                  label="Salary"
                  value={salaryStr}
                  color="text-primary"
                />
                <StatPill
                  icon={Award}
                  label="Experience"
                  value={expLabel}
                  color="text-blue-500"
                />
                <StatPill
                  icon={Users}
                  label="Applicants"
                  value={(j.TotalApplicants ?? 0).toLocaleString()}
                  color="text-amber-500"
                />
                <StatPill
                  icon={Briefcase}
                  label="Openings"
                  value={(j.TotalOpenings ?? 0).toString()}
                  color="text-emerald-500"
                />
              </div>

              {/* Deadline */}
              {deadline && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                  <Calendar size={12} />
                  <span>
                    Apply before <strong>{deadline}</strong>
                  </span>
                </div>
              )}

              {/* Primary CTA */}
              <div className="flex gap-3 mt-5">
                {j.FormType === FormType.External && j.ExternalApplyUrl ? (
                  <div className="flex-1">
                    <Button
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all"
                      onClick={() => handleExternalApply(j.ExternalApplyUrl!)}
                    >
                      Apply on company site <ExternalLink size={14} />
                    </Button>
                  </div>

                ) : (
                  <Link href={`/jobs/${j.Id}/apply`} className="flex-1">
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all">
                      Apply now <ArrowRight size={14} />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Referral bonus */}
              {j.ReferralBonus && (
                <div className="mt-3 flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl">
                  <Trophy size={12} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Referral bonus:</strong> {j.ReferralBonus}
                  </span>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">
                Required skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(j.Skills ?? []).map((s) => (
                  <span
                    key={s}
                    className="text-sm bg-primary/10 text-primary/90 border border-primary/20 px-3 py-1.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">
                Job description
              </h2>
              <DescriptionRenderer description={j.Description} />
            </div>

            {/* Experience details */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">
                Job details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Job type", value: jtLabel, icon: Briefcase },
                  { label: "Work mode", value: wm?.label ?? "", icon: Globe },
                  {
                    label: "Experience",
                    value:
                      exp.MinYears != null
                        ? `${exp.MinYears}${exp.MaxYears ? `–${exp.MaxYears}` : "+"} yrs (${expLabel})`
                        : expLabel,
                    icon: TrendingUp,
                  },
                  {
                    label: "Openings",
                    value: `${j.TotalOpenings ?? 0} positions`,
                    icon: Users,
                  },
                  { label: "Location", value: j.Location, icon: MapPin },
                  ...(salary.Visibility !==
                  SalaryVisibility.HiddenFromCandidates
                    ? [{ label: "Salary", value: salaryStr, icon: DollarSign }]
                    : []),
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-card border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-primary/100" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground/80">
                        {label}
                      </p>
                      <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-br from-primary to-purple-700 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-card/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Send size={14} className="text-primary/30" />
                  <span className="text-xs font-semibold text-primary/30">
                    Ready to apply?
                  </span>
                </div>
                <h3 className="text-base font-bold text-primary-foreground mb-1">
                  {j.Title}
                </h3>
                <p className="text-xs text-primary/30 mb-4">
                  {j.CompanyName} · {j.Location}
                </p>
                {j.FormType === FormType.External && j.ExternalApplyUrl ? (
                  <button onClick={() => handleExternalApply(j.ExternalApplyUrl!)}>
                    <Button className="h-9 px-5 bg-card text-primary/90 hover:bg-primary/10 rounded-xl text-sm font-bold flex items-center gap-1.5">
                      Apply on company site <ExternalLink size={13} />
                    </Button>
                  </button>
                ) : (
                  <Link href={`/jobs/${j.Id}/apply`}>
                    <Button className="h-9 px-5 bg-card text-primary/90 hover:bg-primary/10 rounded-xl text-sm font-bold flex items-center gap-1.5">
                      Apply now <ArrowRight size={13} />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-4 sticky top-20">
            {companyData && <CompanyCard companyMeta={companyData} />}

            {/* Similar jobs */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground">
                  Similar jobs
                </h2>
                <Link
                  href={
                    j.JobType !== undefined
                      ? `/jobs?jobType=${j.JobType}`
                      : "/jobs"
                  }
                  className="text-xs text-primary hover:underline font-medium"
                >
                  See all
                </Link>
              </div>
              <div className="space-y-1">
                {similarJobs.length > 0 ? (
                  similarJobs.map((sj) => (
                    <SimilarJobCard key={sj.Id} job={sj} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/80 py-2 text-center">
                    No similar jobs found
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700">
                  Application tip
                </span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Highlight relevant projects and quantify your impact. Tailored
                applications get 3× more responses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
