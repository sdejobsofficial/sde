"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { JobStatus, WorkMode } from "@/models/jobModel";
import { useMyJobs } from "@/hooks/useJobs";
import { CompanyJobCard } from "@/components/company/CompanyJobCard";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          color,
        )}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground/80">{sub}</p>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-muted rounded-lg" />
          <div className="h-3 w-64 bg-muted rounded-lg" />
          <div className="flex gap-1.5 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-muted rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-20 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

const STATUS_FILTERS = [
  { label: "All", value: null },
  { label: "Active", value: JobStatus.Active },
  { label: "Paused", value: JobStatus.Paused },
  { label: "Closed", value: JobStatus.Closed },
];

export default function PostedJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | null>(null);

  const { data: jobs = [], isLoading, isError } = useMyJobs();

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.Title.toLowerCase().includes(search.toLowerCase()) ||
      j.Location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === null || j.Status === statusFilter;
    const matchesMode =
      workModeFilter === null || j.WorkMode === workModeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const totalActive = jobs.filter((j) => j.Status === JobStatus.Active).length;
  const totalApplicants = jobs.reduce((s, j) => s + j.TotalApplicants, 0);
  const totalOpenings = jobs.reduce((s, j) => s + j.TotalOpenings, 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Posted Jobs</h1>
          <p className="text-sm text-muted-foreground/80 mt-0.5">
            {isLoading
              ? "Loading..."
              : `${jobs.length} total · ${totalActive} active`}
          </p>
        </div>
        <Link href="/recruiter/job-form">
          <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm px-5 flex items-center gap-2 shadow-md shadow-primary/30 transition-all">
            <Plus size={16} /> Post a new job
          </Button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Active jobs"
          value={isLoading ? "—" : totalActive}
          sub={`${jobs.length} total`}
          icon={CheckCircle2}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          label="Total applicants"
          value={isLoading ? "—" : totalApplicants}
          sub="across all jobs"
          icon={Users}
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          label="Total openings"
          value={isLoading ? "—" : totalOpenings}
          sub="positions to fill"
          icon={Briefcase}
          color="bg-amber-50 text-amber-500"
        />
      </div>

      {/* ── Filters ── */}
      <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            size={13}
          />
          <Input
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm rounded-xl border-border bg-muted/50 focus:bg-card focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-gray-100">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === value
                  ? "bg-card text-primary/90 shadow-sm border border-gray-100"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: "All modes", value: null },
            { label: "Remote", value: WorkMode.Remote },
            { label: "Hybrid", value: WorkMode.Hybrid },
            { label: "On-site", value: WorkMode.Onsite },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setWorkModeFilter(value)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                workModeFilter === value
                  ? "bg-primary/20 text-primary/90"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Job list ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-card rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="text-red-400" size={22} />
          </div>
          <p className="text-sm font-semibold text-foreground/80">
            Failed to load jobs
          </p>
          <p className="text-xs text-muted-foreground/80">
            Please refresh the page to try again
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((job) => (
            <CompanyJobCard key={job.Id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="text-primary/40" size={26} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground/80">No jobs found</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {search
                ? `No results for "${search}"`
                : "Post your first job to start receiving applications"}
            </p>
          </div>
          {!search && (
            <Link href="/recruiter/job-form">
              <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm px-5 flex items-center gap-2">
                <Plus size={14} /> Post a job
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
