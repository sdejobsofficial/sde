"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, Briefcase, BadgeCheck, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useJobs";
import { CompanyFilters } from "@/models/jobModel";
import { PAGE_SIZE, sizeLabel } from "@/constants/student/SCompanyList";
import { CompanyCardItem } from "@/components/student/CompanyList/CompanyCardItem";
import { FiltersSidebar } from "@/components/student/CompanyList/FiltersSidebar";
import {
  CompanyCardSkeleton,
  Pagination,
} from "@/components/student/CompanyList/CompanyListComp";

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const { data, isFetching, isLoading } = useCompanies(
    { ...filters, search: search || undefined },
    page,
    PAGE_SIZE,
  );

  const updateFilters = useCallback((partial: Partial<CompanyFilters>) => {
    startTransition(() => {
      setFilters((f) => ({ ...f, ...partial }));
      setPage(1);
    });
  }, []);

  const activeFilterCount = [
    filters.industries?.length,
    filters.sizes?.length,
    filters.locations?.length,
    filters.hiringOnly ? 1 : 0,
    filters.verifiedOnly ? 1 : 0,
  ].reduce<number>((s, v) => s + (v || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#121d2b]/[0.02] border-b border-border/50 pt-20 pb-16 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] max-w-5xl bg-[#39c8c9]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight">
            Discover top <span className="text-primary">companies</span> hiring now
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto font-normal">
            Join India's fastest-growing tech teams. Explore {(data?.total ?? 0).toLocaleString()}+ vetted companies.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            className="bg-card rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 p-2 max-w-2xl mx-auto border border-border/50 hover:shadow-2xl transition-all"
          >
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                size={18}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company name..."
                className="pl-12 h-14 bg-transparent border-none text-base focus:ring-0 placeholder:text-muted-foreground/30 font-normal"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-95 w-full md:w-auto"
            >
              Find Companies
            </Button>
          </form>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {(filters.industries ?? []).map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-2 text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-semibold uppercase tracking-wider"
                >
                  {ind}
                  <button
                    onClick={() =>
                      updateFilters({
                        industries: filters.industries?.filter((v) => v !== ind),
                      })
                    }
                    className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {(filters.sizes ?? []).map((sz) => (
                <span
                  key={sz}
                  className="inline-flex items-center gap-2 text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider"
                >
                  {sizeLabel(sz)}
                  <button
                    onClick={() =>
                      updateFilters({
                        sizes: filters.sizes?.filter((v) => v !== sz),
                      })
                    }
                    className="hover:bg-card/20 p-0.5 rounded-full transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {filters.hiringOnly && (
                <span className="inline-flex items-center gap-2 text-[10px] bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 font-semibold uppercase tracking-wider">
                  <Briefcase size={10} /> Hiring Only
                  <button onClick={() => updateFilters({ hiringOnly: false })} className="hover:bg-green-200 p-0.5 rounded-full transition-colors">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
            <FiltersSidebar filters={filters} onChange={updateFilters} />
          </aside>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">
                  {isLoading ? (
                    <span className="animate-pulse">Loading talent network...</span>
                  ) : (
                    <>
                      <span className="font-bold text-foreground">
                        {(data?.total ?? 0).toLocaleString()}
                      </span>{" "}
                      Opportunities Available
                    </>
                  )}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <CompanyCardSkeleton key={i} />
                ))}
              </div>
            ) : (data?.data ?? []).length === 0 ? (
              <div className="bg-card rounded-3xl border border-dashed border-border/50 flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50">
                  <Building2 className="text-muted-foreground/30" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-foreground">No matches found</h3>
                  <p className="text-muted-foreground">Try broadening your industry or location search.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateFilters({ industries: [], sizes: [], locations: [], hiringOnly: false, verifiedOnly: false });
                    setSearch("");
                  }}
                  className="h-11 px-6 rounded-xl font-semibold"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300",
                  isFetching && "opacity-60",
                )}
              >
                {(data?.data ?? []).map((company) => (
                  <div key={company.Id} className="h-full">
                    <CompanyCardItem company={company} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-16">
              <Pagination
                page={page}
                hasMore={data?.hasMore ?? false}
                total={data?.total ?? 0}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
