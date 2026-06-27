"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ApplicationStatus,
  type ApplicationCard,
} from "@/models/applicationModel";
import { useApplications } from "@/hooks/useApplication";
import { useMyJobs } from "@/hooks/useJobs";
import {
  StatCard,
  PipelineBar,
  CardSkeleton,
} from "@/components/company/CompanyApplicantComp";
import { ApplicantCard } from "@/components/company/CompanyApplicantsCard";
import { STATUS_FILTERS } from "@/constants/company/CApplicantConstants";
import {
  TrendingUp,
  Users,
  BadgeCheck,
  Star,
  Search,
  Briefcase,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const initialJobFilter = searchParams.get("job") || "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | null>(
    null,
  );
  const [jobFilter, setJobFilter] = useState<string>(initialJobFilter);
  const [starredOnly, setStarredOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: myJobs = [] } = useMyJobs();

  const filters = {
    ...(statusFilter !== null && { status: [statusFilter] }),
    ...(jobFilter && { jobId: jobFilter }),
    ...(starredOnly && { isStarred: true }),
    ...(search && { search }),
  };

  const { data, isLoading, isError } = useApplications(filters, page, 20);
  const applications: ApplicationCard[] = data?.Data ?? [];
  const total = data?.Total ?? 0;

  // Compute pipeline counts from all (unfiltered) — ideally from a separate summary query
  const pipelineCounts: Partial<Record<ApplicationStatus, number>> = {};
  applications.forEach((a) => {
    pipelineCounts[a.Status] = (pipelineCounts[a.Status] ?? 0) + 1;
  });

  const totalActive = applications.filter(
    (a) =>
      ![
        ApplicationStatus.Rejected,
        ApplicationStatus.Withdrawn,
        ApplicationStatus.Hired,
      ].includes(a.Status),
  ).length;
  const totalHired = applications.filter(
    (a) => a.Status === ApplicationStatus.Hired,
  ).length;
  const totalStarred = applications.filter((a) => a.IsStarred).length;

  // These would call the real mutation hooks in a full implementation
  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    console.log("Move", id, "→", status);
  };
  const handleStar = (id: string, starred: boolean) => {
    console.log("Star", id, starred);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Applicants</h1>
          <p className="text-sm text-muted-foreground/80 mt-0.5">
            {isLoading ? "Loading…" : `${total} total applications`}
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Active pipeline"
          value={isLoading ? "—" : totalActive}
          sub="in review"
          icon={Users}
          color="bg-primary/10 text-primary/100"
        />
        <StatCard
          label="Hired"
          value={isLoading ? "—" : totalHired}
          sub="this period"
          icon={BadgeCheck}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          label="Starred"
          value={isLoading ? "—" : totalStarred}
          sub="bookmarked"
          icon={Star}
          color="bg-amber-50 text-amber-500"
        />
      </div>

      {/* ── Pipeline bar ── */}
      {!isLoading && applications.length > 0 && (
        <PipelineBar counts={pipelineCounts} />
      )}

      {/* ── Filters ── */}
      <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Row 1: search + job filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={13}
            />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-9 text-sm rounded-xl border-gray-200 bg-muted/50 focus:bg-card focus:border-primary transition-all"
            />
          </div>

          {/* Job filter */}
          <div className="relative">
            <Briefcase
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={13}
            />
            <select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-8 h-9 text-sm rounded-xl border border-gray-200 bg-muted/50 focus:bg-card focus:border-primary outline-none transition-all appearance-none min-w-[180px]"
            >
              <option value="">All jobs</option>
              {myJobs.map((j) => (
                <option key={j.Id} value={j.Id}>
                  {j.Title}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={13}
            />
          </div>

          {/* Starred toggle */}
          <button
            onClick={() => {
              setStarredOnly((v) => !v);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 px-3 h-9 rounded-xl border text-xs font-medium transition-all",
              starredOnly
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : "bg-muted/50 border-gray-200 text-muted-foreground hover:border-amber-200 hover:text-amber-600",
            )}
          >
            <Star size={13} fill={starredOnly ? "currentColor" : "none"} />
            Starred
          </button>
        </div>

        {/* Row 2: status tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map(({ label, value, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setStatusFilter(value);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === value
                  ? "bg-primary/20 text-primary/90"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-muted",
              )}
            >
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-card rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="text-red-400" size={22} />
          </div>
          <p className="text-sm font-semibold text-foreground/80">
            Failed to load applicants
          </p>
          <p className="text-xs text-muted-foreground/80">
            Please refresh the page to try again
          </p>
        </div>
      ) : applications.length > 0 ? (
        <>
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicantCard
                key={app.Id}
                app={app}
                onStatusChange={handleStatusChange}
                onStar={handleStar}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground/80">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!data?.HasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users className="text-primary/40" size={26} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground/80">
              No applicants found
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {search || statusFilter !== null || starredOnly
                ? "Try adjusting your filters"
                : "Applications will appear here once candidates apply"}
            </p>
          </div>
          {(search || statusFilter !== null) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter(null);
                setStarredOnly(false);
              }}
              className="h-8 px-4 rounded-xl border-gray-200 text-xs text-muted-foreground hover:bg-muted/50"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading applicants...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}
