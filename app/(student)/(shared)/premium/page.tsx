"use client";

import {
  useState,
  useCallback,
  useTransition,
  Suspense,
  useEffect,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  usePremiumJobs,
  usePremiumFilterFacets,
  usePremiumPlusJobs,
} from "@/hooks/useJobs";
import { PremiumJobFilters, PremiumJobCard } from "@/clients/jobClient";
import {
  Briefcase,
  MapPin,
  Search,
  X,
  Star,
  Zap,
  Building2,
  Clock,
  Users,
  Globe,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  Crown,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, IsPremium, IsPremiumPlus } from "@/models/userModel";
import PricingPage from "@/components/student/Premium/Pricing";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const WORK_MODE_LABELS = ["Remote", "On-site", "Hybrid"];
const JOB_TYPE_LABELS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
const EXP_LEVEL_LABELS = [
  "Fresher",
  "Junior",
  "Mid-level",
  "Senior",
  "Lead",
  "Principal",
];
const SALARY_TYPE_LABELS = ["per year", "per month", "per hour"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const label = SALARY_TYPE_LABELS[type] ?? "";
  return `${sym}${fmt(min)} – ${sym}${fmt(max)} ${label}`.trim();
}

function getInitialFilters(params: URLSearchParams): PremiumJobFilters {
  const filters: PremiumJobFilters = {};
  const location = params.get("location");
  if (location) filters.locations = [location];
  const jobType = params.get("jobType");
  if (jobType) filters.jobType = jobType.split(",").map(Number);
  return filters;
}

function syncParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  search: string,
  filters: PremiumJobFilters,
  page: number,
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (filters.locations?.length) params.set("location", filters.locations[0]);
  if (filters.jobType?.length) params.set("jobType", filters.jobType.join(","));
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
}

// ─── Premium Plus Banner ──────────────────────────────────────────────────────

function PremiumPlusBanner({ isPremiumPlus }: { isPremiumPlus: boolean }) {
  if (isPremiumPlus) {
    return (
      <Link
        href="/premium-plus"
        className="group flex items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:border-amber-300 hover:shadow-md hover:shadow-amber-100 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200">
            <Crown size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 leading-tight">
              You&apos;re a Premium Plus member
            </p>
            <p className="text-xs text-amber-700/80 font-medium mt-0.5">
              See all jobs the moment they&apos;re published — zero delay
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 group-hover:gap-2.5 transition-all flex-shrink-0">
          View jobs
          <ArrowRight size={13} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/premium-plus"
      className="group flex items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100/80 border border-slate-200 rounded-2xl hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/3 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#166164] to-[#36b9b7] flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200">
          <Zap size={15} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">
            See jobs 24 hours early
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Upgrade to Premium Plus — be first to apply before anyone else
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all flex-shrink-0">
        Upgrade
        <ArrowRight size={13} />
      </div>
    </Link>
  );
}

// ─── Premium Job Card ─────────────────────────────────────────────────────────

function PremiumJobCardComponent({ job }: { job: PremiumJobCard }) {
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
            <Zap size={9} fill="currentColor" />
            Urgent
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
                  <Star size={9} fill="currentColor" />
                  Featured
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
                  <Globe size={11} />
                  Website
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
                <Users size={10} />
                {job.TotalApplicants} applicants
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
                Apply now
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <Link
                href={`/jobs/${job.Id}/apply`}
                className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/20"
              >
                Apply now
                <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PremiumJobCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
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
          <div className="h-4 bg-muted rounded w-1/4 mt-1" />
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Filter ───────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="pb-4 border-b border-border last:border-0 last:pb-0">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
      {title}
    </p>
    {children}
  </div>
);

function PremiumFiltersSidebar({
  filters,
  onChange,
  facets,
}: {
  filters: PremiumJobFilters;
  onChange: (f: Partial<PremiumJobFilters>) => void;
  facets: {
    locations: { label: string; count: number }[];
    industries: { label: string; count: number }[];
  };
}) {
  const toggle = (key: keyof PremiumJobFilters, value: number) => {
    const arr = (filters[key] as number[] | undefined) ?? [];
    onChange({
      [key]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const toggleStr = (key: keyof PremiumJobFilters, value: string) => {
    const arr = (filters[key] as string[] | undefined) ?? [];
    onChange({
      [key]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const CheckItem = ({
    label,
    checked,
    onToggle,
    count,
  }: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    count?: number;
  }) => (
    <label className="flex items-center justify-between gap-2 cursor-pointer group py-1">
      <div className="flex items-center gap-2">
        <div
          onClick={onToggle}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
            checked
              ? "bg-primary border-primary"
              : "border-border group-hover:border-primary/40",
          )}
        >
          {checked && (
            <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-muted-foreground font-medium">
          {count}
        </span>
      )}
    </label>
  );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm text-foreground">Filters</p>
        <SlidersHorizontal size={14} className="text-muted-foreground" />
      </div>

      <Section title="Work Mode">
        {WORK_MODE_LABELS.map((label, i) => (
          <CheckItem
            key={i}
            label={label}
            checked={(filters.workMode ?? []).includes(i)}
            onToggle={() => toggle("workMode", i)}
          />
        ))}
      </Section>

      <Section title="Job Type">
        {JOB_TYPE_LABELS.map((label, i) => (
          <CheckItem
            key={i}
            label={label}
            checked={(filters.jobType ?? []).includes(i)}
            onToggle={() => toggle("jobType", i)}
          />
        ))}
      </Section>

      <Section title="Experience Level">
        {EXP_LEVEL_LABELS.map((label, i) => (
          <CheckItem
            key={i}
            label={label}
            checked={(filters.experienceLevel ?? []).includes(i)}
            onToggle={() => toggle("experienceLevel", i)}
          />
        ))}
      </Section>

      {facets.locations.length > 0 && (
        <Section title="Location">
          {facets.locations.slice(0, 6).map(({ label, count }) => (
            <CheckItem
              key={label}
              label={label}
              count={count}
              checked={(filters.locations ?? []).includes(label)}
              onToggle={() => toggleStr("locations", label)}
            />
          ))}
        </Section>
      )}

      {facets.industries.length > 0 && (
        <Section title="Industry">
          {facets.industries.slice(0, 6).map(({ label, count }) => (
            <CheckItem
              key={label}
              label={label}
              count={count}
              checked={(filters.industries ?? []).includes(label)}
              onToggle={() => toggleStr("industries", label)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  pageSize,
  hasMore,
  onPageChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  hasMore: boolean;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground font-medium">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 px-3 rounded-lg text-xs font-semibold"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="h-8 px-3 rounded-lg text-xs font-semibold"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function PremiumJobsPageContent({ isPremiumPlus }: { isPremiumPlus: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PremiumJobFilters>(() =>
    getInitialFilters(searchParams),
  );
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

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

  const { data: facetsData } = usePremiumFilterFacets();
  const facets = facetsData ?? { locations: [], industries: [] };

  const delayed = usePremiumJobs(
    { ...filters, search: search || undefined },
    page,
    PAGE_SIZE,
    { enabled: !isPremiumPlus },
  );
  const instant = usePremiumPlusJobs(
    { ...filters, search: search || undefined },
    page,
    PAGE_SIZE,
    { enabled: isPremiumPlus },
  );
  const {
    data: jobsData,
    isFetching,
    isLoading,
  } = isPremiumPlus ? instant : delayed;

  const updateFilters = useCallback(
    (partial: Partial<PremiumJobFilters>) => {
      startTransition(() => {
        const next = { ...filters, ...partial };
        setFilters(next);
        setPage(1);
        syncParams(router, pathname, search, next, 1);
      });
    },
    [filters, router, pathname, search],
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    syncParams(router, pathname, search, filters, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    syncParams(router, pathname, search, filters, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => {
    setFilters({});
    setSearch("");
    setPage(1);
    router.replace(pathname, { scroll: false });
  };

  const activeFilterCount = [
    filters.workMode?.length,
    filters.jobType?.length,
    filters.experienceLevel?.length,
    filters.locations?.length,
    filters.industries?.length,
    filters.salaryMin !== undefined ? 1 : 0,
  ].reduce<number>((s, v) => s + (v || 0), 0);

  return (
    <div
      className="min-h-screen bg-background select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-[#121d2b] via-[#166164] to-[#36b9b7] py-10 px-4">
        <div className="max-w-6xl mx-auto text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-card/10 border border-white/20 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#39c8c9]" />
            Exclusive Opportunities
          </div>
          <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight mb-2">
            Premium Jobs
          </h1>
          <p className="text-[#39c8c9]/90 text-sm font-medium max-w-md mx-auto">
            Hand-picked, high-quality roles from top companies — curated just
            for you.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-foreground/40 pointer-events-none"
                size={16}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skill, or company..."
                className="pl-10 h-12 text-sm rounded-xl bg-card/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:bg-card/15 focus:border-white/40 backdrop-blur-sm font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    syncParams(router, pathname, "", filters, 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-12 px-6 bg-card text-primary hover:bg-card/90 rounded-xl font-bold text-sm shadow-lg transition-all"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* ── Active filter chips ── */}
      {activeFilterCount > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-semibold">
              Active filters:
            </span>
            {(filters.workMode ?? []).map((wm) => (
              <span
                key={wm}
                className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20"
              >
                {WORK_MODE_LABELS[wm]}
                <button
                  onClick={() =>
                    updateFilters({
                      workMode: filters.workMode?.filter((v) => v !== wm),
                    })
                  }
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {(filters.locations ?? []).map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20"
              >
                <MapPin size={10} /> {loc}
                <button
                  onClick={() =>
                    updateFilters({
                      locations: filters.locations?.filter((v) => v !== loc),
                    })
                  }
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {(filters.industries ?? []).map((ind) => (
              <span
                key={ind}
                className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20"
              >
                {ind}
                <button
                  onClick={() =>
                    updateFilters({
                      industries: filters.industries?.filter((v) => v !== ind),
                    })
                  }
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-red-500 font-semibold ml-1 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-5 items-start">
          {/* ── Filters sidebar ── */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20">
            <PremiumFiltersSidebar
              filters={filters}
              onChange={updateFilters}
              facets={facets}
            />
          </aside>

          {/* ── Job list ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Premium Plus banner */}
            <PremiumPlusBanner isPremiumPlus={isPremiumPlus} />

            {/* Result count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? (
                  <span className="h-4 w-32 bg-muted rounded animate-pulse inline-block" />
                ) : (
                  <>
                    <span className="font-extrabold text-foreground text-base">
                      {(jobsData?.total ?? 0).toLocaleString()}
                    </span>{" "}
                    premium jobs found
                    {search && (
                      <>
                        {" for "}
                        <span className="text-primary font-bold">
                          &ldquo;{search}&rdquo;
                        </span>
                      </>
                    )}
                    {isFetching && !isLoading && (
                      <span className="ml-2 text-xs text-primary animate-pulse font-bold">
                        Updating...
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PremiumJobCardSkeleton key={i} />
                ))}
              </div>
            ) : (jobsData?.data ?? []).length === 0 ? (
              <div className="bg-background rounded-2xl border border-border shadow-md flex flex-col items-center justify-center py-20 gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Star className="text-primary/40" size={26} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground/80">
                    No premium jobs found
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Try adjusting your filters or search term
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="h-9 px-4 rounded-xl border-gray-200 text-sm text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "space-y-4 transition-opacity duration-200",
                  isFetching && "opacity-60",
                )}
              >
                {(jobsData?.data ?? []).map((job) => (
                  <PremiumJobCardComponent key={job.Id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && (jobsData?.total ?? 0) > PAGE_SIZE && (
              <Pagination
                page={page}
                hasMore={jobsData?.hasMore ?? false}
                total={jobsData?.total ?? 0}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
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

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function PremiumJobsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingSkeleton />;

  // Not logged in, not a job seeker, or not any kind of premium → pricing
  if (!user || !IsJobSeeker(user) || !IsPremium(user)) {
    return <PricingPage />;
  }

  const premiumPlus = IsPremiumPlus(user);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PremiumJobsPageContent isPremiumPlus={premiumPlus} />
    </Suspense>
  );
}
