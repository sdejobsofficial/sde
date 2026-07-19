"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  MapPin,
  Globe,
  BadgeCheck,
  ExternalLink,
  Users,
  Briefcase,
  ArrowRight,
  Share2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompanies, useCompany, useCompanyJobs } from "@/hooks/useJobs";
import { JobType } from "@/models/jobModel";
import { VerificationStatus } from "@/models/userModel";
import Image from "next/image";
import { CompanyJobCard } from "@/components/company/CompanyJobCard";
import {
  PageSkeleton,
  VerificationBadge,
  StatCard,
  JobSkeleton,
  InfoRow,
} from "@/components/student/CompanyDetail/CompanyDetailComp";
import { JOB_TABS } from "@/constants/student/SCompanyDetail";

export default function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: company, isLoading: companyLoading } = useCompany(id);
  const { data: jobsData, isLoading: jobsLoading } = useCompanyJobs(id);
  const { data: relatedCompanies } = useCompanies(
    { industries: company?.Industry },
    1,
    4,
  );

  const [jobTab, setJobTab] = useState("all");

  if (companyLoading) return <PageSkeleton />;

  if (!company)
    return (
      <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-300" size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground/80">
            Company not found
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            This profile doesn&apos;t exist or has been removed.
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

  // ── Derived ──
  const allJobs = jobsData?.data ?? [];
  const filteredJobs = allJobs.filter((job) => {
    if (jobTab === "all") return true;
    if (jobTab === "internship") return job.JobType === JobType.Internship;
    return String(job.WorkMode) === jobTab;
  });

  const initials = (company.Name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const socialLinks = company.SocialLinks ?? {};

  return (
    <div className="min-h-screen bg-muted/50/80">
      {/* ── Hero banner ── */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 60%, rgba(139,92,246,0.35) 0%, transparent 55%),
                              radial-gradient(circle at 80% 20%, rgba(99,102,241,0.25) 0%, transparent 45%)`,
          }}
        />
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Breadcrumb */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-primary-foreground/60 p-4">
          <Link
            href="/jobs"
            className="hover:text-primary-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Jobs
          </Link>
          <ChevronRight size={12} />
          <Link
            href="/companies"
            className="hover:text-primary-foreground transition-colors"
          >
            Companies
          </Link>
          <ChevronRight size={12} />
          <span className="text-primary-foreground/80 font-medium truncate">
            {company.Name}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* ── Profile header (overlaps banner) ── */}
        <div className="relative -mt-12 mb-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            {/* Logo + live badge */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-card shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.AvatarUrl ? (
                  <Image
                    src={company.AvatarUrl}
                    alt={company.Name}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/100 to-purple-700 flex items-center justify-center">
                    <span className="text-2xl font-black text-primary-foreground">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <div className="pb-2">
                {company.ActiveJobs > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {company.ActiveJobs} open{" "}
                    {company.ActiveJobs === 1 ? "role" : "roles"}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-2">
              {company.Website && (
                <a
                  href={company.Website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="h-9 px-4 rounded-xl border-border bg-card shadow-sm text-xs font-semibold text-muted-foreground hover:bg-muted/50 flex items-center gap-1.5"
                  >
                    <Globe size={13} /> Website <ExternalLink size={11} />
                  </Button>
                </a>
              )}
              <Button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const url = `${window.location.origin}/companies/${id}`;

                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: company.Name ?? "Company",
                        text: `Check out this company: ${company.Name ?? "Company"}`,
                        url,
                      });
                      return;
                    } catch {
                      // fall through to clipboard
                    }
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
                }}
                className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-md shadow-primary/30"
              >
                Share <Share2 size={15} />
              </Button>
            </div>
          </div>

          {/* Name + meta row */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground">
                {company.Name}
              </h1>
              {company.VerificationStatus === VerificationStatus.Verified && (
                <BadgeCheck size={20} className="text-blue-400 flex-shrink-0" />
              )}
              <VerificationBadge status={company.VerificationStatus} />
              {(company.Industry ?? []).slice(0, 2).map((ind) => (
                <span
                  key={ind}
                  className="text-xs bg-primary/10 text-primary/90 border border-primary/20 px-2.5 py-0.5 rounded-full font-medium"
                >
                  {ind}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {company.Location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={11} className="text-muted-foreground/80" />{" "}
                  {company.Location}
                </span>
              )}
              {company.SizeLabel && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users size={11} className="text-muted-foreground/80" />{" "}
                  {company.SizeLabel} employees
                </span>
              )}
              {socialLinks.LinkedIn && (
                <a
                  href={socialLinks.LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  <MapPin size={11} /> LinkedIn
                </a>
              )}
              {socialLinks.Twitter && (
                <a
                  href={socialLinks.Twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                >
                  <MapPin size={11} /> Twitter
                </a>
              )}
              {socialLinks.GitHub && (
                <a
                  href={socialLinks.GitHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                >
                  <MapPin size={11} /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex gap-3 mb-6">
          <StatCard
            icon={Briefcase}
            value={String(company.ActiveJobs)}
            label="Open roles"
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={TrendingUp}
            value={String(company.TotalJobs)}
            label="Total jobs posted"
            color="bg-blue-50 text-blue-600"
          />
          {company.SizeLabel && (
            <StatCard
              icon={Users}
              value={company.SizeLabel.split("–")[0] + "+"}
              label="Employees"
              color="bg-emerald-50 text-emerald-600"
            />
          )}
          {company.IsProfileComplete && (
            <StatCard
              icon={CheckCircle2}
              value="100%"
              label="Profile complete"
              color="bg-amber-50 text-amber-600"
            />
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-5 items-start pb-10">
          {/* ── LEFT: Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* About / Bio */}
            {company.Bio && (
              <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 size={14} className="text-primary" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground">
                    About {company.Name}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {company.Bio}
                </p>
                {(company.Industry ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                    {company.Industry!.map((ind) => (
                      <span
                        key={ind}
                        className="text-xs bg-primary/10 text-primary/90 border border-primary/20 px-3 py-1.5 rounded-full font-medium"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Open positions */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase size={14} className="text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">
                  Open positions
                  <span className="ml-2 text-xs font-normal text-muted-foreground/80">
                    ({company.ActiveJobs} active · {company.TotalJobs} total)
                  </span>
                </h2>
              </div>

              {/* Tab filters */}
              <div className="flex gap-1.5 flex-wrap mb-5">
                {JOB_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setJobTab(tab.value)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full font-medium transition-all",
                      jobTab === tab.value
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-gray-200",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Job grid */}
              {jobsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <JobSkeleton key={i} />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-gray-100 flex items-center justify-center">
                    <Briefcase size={20} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      No jobs found
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      {jobTab === "all"
                        ? `${company.Name} hasn't posted any jobs yet.`
                        : "No jobs match this filter — try another."}
                    </p>
                  </div>
                  {jobTab !== "all" && (
                    <button
                      onClick={() => setJobTab("all")}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      View all jobs
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <CompanyJobCard key={job.Id} job={job} />
                  ))}
                </div>
              )}

              {(jobsData?.total ?? 0) > 12 && (
                <div className="mt-5 pt-4 border-t border-gray-50 text-center">
                  <Link href={`/jobs?company=${id}`}>
                    <Button
                      variant="outline"
                      className="h-9 px-5 rounded-xl border-border text-xs text-primary hover:bg-primary/10 hover:border-primary/30 font-semibold flex items-center gap-1.5 mx-auto"
                    >
                      View all {jobsData?.total} jobs <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-20">
            {/* Company info panel */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Company info
              </h3>
              <div className="space-y-3.5">
                {company.Location && (
                  <InfoRow
                    icon={MapPin}
                    label="Headquarters"
                    value={company.Location}
                  />
                )}
                {company.SizeLabel && (
                  <InfoRow
                    icon={Users}
                    label="Company size"
                    value={`${company.SizeLabel} employees`}
                  />
                )}
                {(company.Industry ?? []).length > 0 && (
                  <InfoRow
                    icon={Briefcase}
                    label="Industry"
                    value={(company.Industry ?? []).join(", ")}
                  />
                )}
                {company.Website && (
                  <InfoRow
                    icon={Globe}
                    label="Website"
                    value={company.Website}
                    href={company.Website}
                  />
                )}
                {socialLinks.LinkedIn && (
                  <InfoRow
                    icon={MapPin}
                    label="LinkedIn"
                    value={socialLinks.LinkedIn}
                    href={socialLinks.LinkedIn}
                  />
                )}
                {socialLinks.Twitter && (
                  <InfoRow
                    icon={MapPin}
                    label="Twitter"
                    value={socialLinks.Twitter}
                    href={socialLinks.Twitter}
                  />
                )}
                {socialLinks.GitHub && (
                  <InfoRow
                    icon={MapPin}
                    label="GitHub"
                    value={socialLinks.GitHub}
                    href={socialLinks.GitHub}
                  />
                )}
                {socialLinks.Portfolio && (
                  <InfoRow
                    icon={Globe}
                    label="Portfolio"
                    value={socialLinks.Portfolio}
                    href={socialLinks.Portfolio}
                  />
                )}
              </div>
            </div>

            {/* Similar companies */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Other companies
              </h3>
              <div className="space-y-2">
                {relatedCompanies &&
                  relatedCompanies.data?.map((company) => (
                    <Link
                      href={`/companies/${company.Id}`}
                      key={company.Id}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">
                          {company.Name[0]}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground/80 group-hover:text-primary/90 transition-colors flex-1">
                        {company.Name}
                      </p>
                      <ChevronRight
                        size={12}
                        className="text-gray-300 group-hover:text-primary transition-colors"
                      />
                    </Link>
                  ))}
              </div>
              <Link
                href={`/companies?industries=${company.Industry?.[0] ?? ""}`}
                className="mt-3 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Browse all <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
