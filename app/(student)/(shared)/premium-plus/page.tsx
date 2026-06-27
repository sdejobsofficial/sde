"use client";

import { Suspense, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, IsPremiumPlus } from "@/models/userModel";
import { usePremiumJobs, usePremiumPlusJobs } from "@/hooks/useJobs";
import { PremiumJobCard } from "@/clients/jobClient";
import PricingPage from "@/components/student/Premium/Pricing";
import {
  Sparkles,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Users,
  Globe,
  Zap,
  Star,
  ArrowUpRight,
  ChevronRight,
  Copy,
  Check,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const WORK_MODE_LABELS = ["Remote", "On-site", "Hybrid"];
const JOB_TYPE_LABELS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
const SALARY_TYPE_LABELS = ["per year", "per month", "per hour"];
const COMPANY_EMAIL =
  process.env.NEXT_PUBLIC_PREMIUM_PLUS_CONTACT_EMAIL ??
  "premiumplus@yourdomain.com";

function formatSalary(
  min: number,
  max: number,
  currency: string,
  type: number,
  visibility: number,
) {
  if (visibility === 2) return "Salary hidden";
  if (visibility === 1) return "Competitive";
  const fmt = (n: number) =>
    n >= 100000
      ? `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)}K`
        : String(n);
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
  return `${sym}${fmt(min)} – ${sym}${fmt(max)} ${SALARY_TYPE_LABELS[type] ?? ""}`.trim();
}

// ─── Job Card (no pagination/filter variant) ──────────────────────────────────

function PremiumPlusJobCard({ job }: { job: PremiumJobCard }) {
  const salaryStr = formatSalary(
    job.Salary.Min,
    job.Salary.Max,
    job.Salary.Currency,
    job.Salary.Type,
    job.Salary.Visibility,
  );

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
        job.IsFeatured && "border-amber-200 shadow-amber-50",
      )}
    >
      {job.IsFeatured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
      )}
      {job.IsUrgent && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            <Zap size={9} fill="currentColor" /> Urgent
          </span>
        </div>
      )}
      <div className="p-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl border border-border bg-muted/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/20 transition-colors">
              {job.CompanyMeta.LogoUrl ? (
                <Image
                  src={job.CompanyMeta.LogoUrl}
                  alt={job.CompanyMeta.Name}
                  width={56}
                  height={56}
                  className="object-contain p-1"
                />
              ) : (
                <Building2 size={22} className="text-slate-300" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {job.Title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-muted-foreground font-semibold">
                    {job.CompanyMeta.Name}
                  </span>
                  {job.CompanyMeta.Industry?.[0] && (
                    <>
                      <span className="text-muted-foreground/30 text-xs">
                        ·
                      </span>
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        {job.CompanyMeta.Industry[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {job.IsFeatured && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <Star size={9} fill="currentColor" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <MapPin size={11} className="text-primary/60" />
                {job.Location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Briefcase size={11} className="text-primary/60" />
                {WORK_MODE_LABELS[job.WorkMode] ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Clock size={11} className="text-primary/60" />
                {JOB_TYPE_LABELS[job.JobType] ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Users size={11} className="text-primary/60" />
                {job.TotalOpenings} opening{job.TotalOpenings !== 1 ? "s" : ""}
              </span>
              {job.CompanyMeta.Website && (
                <a
                  href={job.CompanyMeta.Website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary/70 font-medium hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe size={11} /> Website
                </a>
              )}
            </div>
            <p className="text-sm font-bold text-primary mt-2">{salaryStr}</p>
            {job.Skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.Skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
                {job.Skills.length > 5 && (
                  <span className="text-[11px] text-muted-foreground px-1 font-medium">
                    +{job.Skills.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/60">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
            {job.ApplicationDeadline && (
              <span className="inline-flex items-center gap-1">
                <Clock size={10} />
                Apply by{" "}
                {new Date(job.ApplicationDeadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            {job.TotalApplicants > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users size={10} /> {job.TotalApplicants} applicants
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {job.ExternalApplyUrl ? (
              <a
                href={job.ExternalApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/20"
              >
                Apply now <ArrowUpRight size={12} />
              </a>
            ) : (
              <Link
                href={`/jobs/${job.Id}/apply`}
                className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/20"
              >
                Apply now <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-2xl border border-border p-5 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded-lg w-2/3" />
              <div className="h-3.5 bg-muted rounded w-1/3" />
              <div className="flex gap-2 mt-3">
                {[64, 80, 56].map((w) => (
                  <div
                    key={w}
                    className="h-3 bg-muted rounded"
                    style={{ width: w }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Not-premium-plus upsell banner ───────────────────────────────────────────

function PremiumPlusUpsell({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#121d2b] via-[#166164] to-[#36b9b7]" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#166164]/10 to-[#36b9b7]/10 border border-[#39c8c9]/20 flex items-center justify-center">
              <Sparkles size={28} className="text-[#0d9488]" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20 uppercase tracking-wider mb-4">
              <Star size={10} fill="currentColor" /> Premium Plus
            </div>

            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
              Unlock Premium Plus
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
              Get instant access to all jobs the moment they're published —
              before any other user sees them. To activate Premium Plus, send an
              offer letter along with your{" "}
              <span className="font-bold text-foreground">User ID</span> to our
              team.
            </p>

            {/* Steps */}
            <div className="bg-muted/40 rounded-2xl border border-border p-5 text-left space-y-4 mb-6">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                How to activate
              </p>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  Copy your User ID below
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  Send your offer letter + User ID to{" "}
                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="text-primary font-bold hover:underline"
                  >
                    {COMPANY_EMAIL}
                  </a>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  Our team will activate Premium Plus on your account within 24
                  hours
                </p>
              </div>
            </div>

            {/* User ID copy box */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-left">
                Your User ID
              </p>
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3">
                <code className="flex-1 text-sm font-mono text-foreground truncate select-all">
                  {userId}
                </code>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
                    copied
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15",
                  )}
                >
                  {copied ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mail CTA */}
            <a
              href={`mailto:${COMPANY_EMAIL}?subject=Premium Plus Activation — ${userId}&body=Hi,%0A%0AI'd like to activate Premium Plus on my account.%0A%0AUser ID: ${userId}%0A%0APlease find my offer letter attached.%0A%0AThank you`}
              className="w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <Mail size={15} />
              Send activation email
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground font-medium mt-5">
          Already sent your offer letter?{" "}
          <Link
            href="/support"
            className="text-primary font-bold hover:underline"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Premium Plus Jobs Feed (no filters, no pagination) ───────────────────────

function PremiumPlusFeed() {
  const { data: jobsData, isLoading } = usePremiumPlusJobs();
  return (
    <div
      className="min-h-screen bg-background select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#121d2b] via-[#166164] to-[#36b9b7] py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card/10 border border-white/20 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#39c8c9]" />
            Premium Plus — Early Access
          </div>
          <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight mb-2">
            All Jobs, Right Now
          </h1>
          <p className="text-[#39c8c9]/90 text-sm font-medium max-w-md mx-auto">
            You're seeing every job the instant it's published — zero delay, no
            filters needed.
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Count */}
        <p className="text-sm text-muted-foreground font-medium">
          {isLoading ? (
            <span className="h-4 w-32 bg-muted rounded animate-pulse inline-block" />
          ) : (
            <>
              <span className="font-extrabold text-foreground text-base">
                {(jobsData?.total ?? 0).toLocaleString()}
              </span>{" "}
              premium jobs available
            </>
          )}
        </p>

        {isLoading ? (
          <Skeleton />
        ) : (jobsData?.data ?? []).length === 0 ? (
          <div className="bg-background rounded-2xl border border-border flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Star className="text-primary/40" size={26} />
            </div>
            <p className="text-sm font-semibold text-foreground/80">
              No jobs posted yet
            </p>
            <p className="text-xs text-muted-foreground/80">
              Check back soon — new roles are added daily.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(jobsData?.data ?? []).map((job) => (
              <PremiumPlusJobCard key={job.Id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function PremiumPlusPage() {
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    const noop = () => {};
    const methods = [
      "log",
      "debug",
      "info",
      "warn",
      "table",
      "dir",
      "dirxml",
      "trace",
      "profile",
    ];
    const originalConsole = { ...window.console };
    methods.forEach((method) => {
      (window.console as any)[method] = noop;
    });
    const id = setInterval(() => {
      console.clear();
      // eslint-disable-next-line no-debugger
      debugger;
    }, 1000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "i", "J", "j", "C", "c"].includes(e.key)) ||
        (e.ctrlKey && ["U", "u"].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", handleKeyDown);
      methods.forEach((method) => {
        (window.console as any)[method] = (originalConsole as any)[method];
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-card border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !IsJobSeeker(user)) return <PricingPage />;

  // Has premium plus → show the feed
  if (IsPremiumPlus(user))
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <PremiumPlusFeed />
      </Suspense>
    );

  // Has regular premium or nothing → show upsell with copyable user ID
  return <PremiumPlusUpsell userId={user.Id} />;
}
