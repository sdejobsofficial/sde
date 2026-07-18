"use client";

import { useState, useCallback, useTransition, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useJobs, useFilterFacets } from "@/hooks/useJobs";
import { JobFilters } from "@/clients/jobClient";
import { FiltersSidebar } from "@/components/student/JobList/FiltersSidebar";
import { JobCardComponent } from "@/components/student/JobList/JobCard";
import {
  JobCardSkeleton,
  Pagination,
  FeaturedCompaniesSidebar,
  PremiumPromo,
} from "@/components/student/JobList/JobListComp";
import { PAGE_SIZE } from "@/constants/student/SJobList";
import { Briefcase, MapPin, Search, Star, X } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────

function getInitialFilters(params: URLSearchParams): JobFilters {
  const filters: JobFilters = {};

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
  filters: JobFilters,
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

// ─── Inner component (uses useSearchParams — must be inside Suspense) ──────

function JobsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // ← safe here: inside <Suspense>

  const [filters, setFilters] = useState<JobFilters>(() =>
    getInitialFilters(searchParams),
  );
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  const { data: facetsData } = useFilterFacets();
  const facets = facetsData ?? { locations: [], industries: [] };

  const {
    data: jobsData,
    isFetching,
    isLoading,
  } = useJobs({ ...filters, search: search || undefined }, page, PAGE_SIZE);

  const updateFilters = useCallback(
    (partial: Partial<JobFilters>) => {
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
    const cleared: JobFilters = {
      workMode: [],
      jobType: [],
      experienceLevel: [],
      locations: [],
      salaryMin: undefined,
      salaryMax: undefined,
      referralOpen: false,
    };
    setFilters(cleared);
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
    filters.referralOpen ? 1 : 0,
  ].reduce<number>((s, v) => s + (v || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero search bar ── */}
      <div className="bg-background border-b border-border shadow-sm py-5 px-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                  size={16}
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill, or company..."
                  className="pl-10 h-12 text-sm rounded-xl border-border bg-card focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium shadow-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      syncParams(router, pathname, "", filters, 1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm shadow-md shadow-primary/30 transition-all"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 max-w-2xl mx-auto">
              {(filters.workMode ?? []).map((wm) => (
                <span
                  key={wm}
                  className="inline-flex items-center gap-1.5 text-xs bg-primary/20 text-primary/90 px-2.5 py-1 rounded-full font-medium"
                >
                  {["Remote", "On-site", "Hybrid"][wm]}
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
                  className="inline-flex items-center gap-1.5 text-xs bg-primary/20 text-primary/90 px-2.5 py-1 rounded-full font-medium"
                >
                  <MapPin size={10} />
                  {loc}
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
              {filters.salaryMin !== undefined && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-primary/20 text-primary/90 px-2.5 py-1 rounded-full font-medium">
                  Salary filter
                  <button
                    onClick={() =>
                      updateFilters({
                        salaryMin: undefined,
                        salaryMax: undefined,
                      })
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.referralOpen && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                  <Star size={10} /> Referral open
                  <button
                    onClick={() => updateFilters({ referralOpen: false })}
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 3-col layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-5 items-start">
          {/* ── Left: Filters ── */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20">
            <FiltersSidebar
              filters={filters}
              onChange={updateFilters}
              facets={facets}
            />
          </aside>

          {/* ── Center: Job list ── */}
          <div className="flex-1 min-w-0 space-y-4">
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
                    jobs found
                    {search && (
                      <>
                        {" "}
                        for &quot;
                        <span className="text-primary font-bold">{search}</span>&quot;
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
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : (jobsData?.data ?? []).length === 0 ? (
              <div className="bg-background rounded-2xl border border-border shadow-md shadow-sm flex flex-col items-center justify-center py-20 gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="text-primary/40" size={26} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground/80">
                    No jobs found
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Try adjusting your filters or search term
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="h-9 px-4 rounded-xl border-border text-sm text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
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
                  <JobCardComponent key={job.Id} job={job} />
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

          {/* ── Right: Companies + promo ── */}
          <aside className="hidden xl:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-20">
            <FeaturedCompaniesSidebar />
            <PremiumPromo />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Page export — wraps content in Suspense ──────────────────────────────

export default function JobsHomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-card border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
