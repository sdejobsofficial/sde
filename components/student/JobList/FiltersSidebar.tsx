import { JobFilters } from "@/clients/jobClient";
import { Input } from "@/components/ui/input";
import {
  WORK_MODE_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "@/constants/company/CJobFormContants";
import { EXP_OPTIONS, SALARY_RANGES } from "@/constants/student/SJobList";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {open ? (
          <ChevronUp size={15} className="text-muted-foreground/50" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground/50" />
        )}
      </button>
      {open && children}
    </div>
  );
}

function FacetList({
  items,
  selected,
  onToggle,
  searchable = false,
}: {
  items: { label: string; count: number }[];
  selected: string[];
  onToggle: (v: string) => void;
  searchable?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase()),
  );
  const visible = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative mb-2">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
            size={12}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search...`}
            className="pl-7 h-8 text-xs rounded-full border-border bg-muted/50 focus:bg-card focus:border-primary transition-all"
          />
        </div>
      )}
      {visible.map(({ label, count }) => (
        <label
          key={label}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div
            onClick={() => onToggle(label)}
            className={cn(
              "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
              selected.includes(label)
                ? "bg-primary border-primary"
                : "border-border group-hover:border-primary",
            )}
          >
            {selected.includes(label) && (
              <svg
                viewBox="0 0 10 10"
                className="w-2.5 h-2.5 text-primary-foreground"
                fill="none"
              >
                <path
                  d="M1.5 5l2.5 2.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-1 leading-snug group-hover:text-primary/90 transition-colors">
            {label}
          </span>
          <span className="text-xs text-muted-foreground/50">
            ({count.toLocaleString()})
          </span>
        </label>
      ))}
      {filtered.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-primary font-semibold hover:text-primary/90 transition-colors mt-1"
        >
          {showAll ? "Show less" : `+${filtered.length - 4} more`}
        </button>
      )}
    </div>
  );
}

export function FiltersSidebar({
  filters,
  onChange,
  facets,
}: {
  filters: JobFilters;
  onChange: (f: Partial<JobFilters>) => void;
  facets: {
    locations: { label: string; count: number }[];
    industries: { label: string; count: number }[];
  };
}) {
  const toggleArr = <K extends keyof JobFilters>(key: K, val: number) => {
    const cur = (filters[key] as number[] | undefined) ?? [];
    onChange({
      [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    });
  };

  const toggleStr = (key: keyof JobFilters, val: string) => {
    const cur = (filters[key] as string[] | undefined) ?? [];
    onChange({
      [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    });
  };

  const activeCount = [
    filters.workMode?.length,
    filters.jobType?.length,
    filters.experienceLevel?.length,
    filters.locations?.length,
    filters.industries?.length,
    filters.salaryMin !== undefined || filters.salaryMax !== undefined ? 1 : 0,
    filters.referralOpen ? 1 : 0,
  ].reduce<number>((s, v) => s + (v || 0), 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          {activeCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                workMode: [],
                jobType: [],
                experienceLevel: [],
                locations: [],
                industries: [],
                salaryMin: undefined,
                salaryMax: undefined,
                referralOpen: false,
              })
            }
            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Work mode */}
      <FilterSection title="Work mode">
        <div className="space-y-2">
          {WORK_MODE_OPTIONS.map(({ label, value, icon: Icon }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleArr("workMode", value)}
                className={cn(
                  "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
                  (filters.workMode ?? []).includes(value)
                    ? "bg-primary border-primary"
                    : "border-border group-hover:border-primary",
                )}
              >
                {(filters.workMode ?? []).includes(value) && (
                  <svg
                    viewBox="0 0 10 10"
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                  >
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <Icon
                size={13}
                className="text-muted-foreground/50 group-hover:text-primary/100 transition-colors"
              />
              <span className="text-xs text-muted-foreground group-hover:text-primary/90 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Job type */}
      <FilterSection title="Job type">
        <div className="space-y-2">
          {JOB_TYPE_OPTIONS.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleArr("jobType", value)}
                className={cn(
                  "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
                  (filters.jobType ?? []).includes(value)
                    ? "bg-primary border-primary"
                    : "border-border group-hover:border-primary",
                )}
              >
                {(filters.jobType ?? []).includes(value) && (
                  <svg
                    viewBox="0 0 10 10"
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                  >
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary/90 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience level">
        <div className="space-y-2">
          {EXP_OPTIONS.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleArr("experienceLevel", value)}
                className={cn(
                  "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
                  (filters.experienceLevel ?? []).includes(value)
                    ? "bg-primary border-primary"
                    : "border-border group-hover:border-primary",
                )}
              >
                {(filters.experienceLevel ?? []).includes(value) && (
                  <svg
                    viewBox="0 0 10 10"
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                  >
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary/90 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Salary */}
      <FilterSection title="Salary range">
        <div className="space-y-2">
          {SALARY_RANGES.map(({ label, min, max }) => {
            const active =
              filters.salaryMin === min && filters.salaryMax === max;
            return (
              <label
                key={label}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div
                  onClick={() =>
                    onChange(
                      active
                        ? { salaryMin: undefined, salaryMax: undefined }
                        : { salaryMin: min, salaryMax: max },
                    )
                  }
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0",
                    active
                      ? "border-primary bg-primary"
                      : "border-border group-hover:border-primary",
                  )}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-card" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary/90 transition-colors">
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Location — from facets */}
      <FilterSection title="Location">
        <FacetList
          items={facets.locations}
          selected={filters.locations ?? []}
          onToggle={(v) => toggleStr("locations", v)}
          searchable
        />
      </FilterSection>

      {/* Industry — from facets */}
      <FilterSection title="Industry" defaultOpen={false}>
        <FacetList
          items={facets.industries}
          selected={filters.industries ?? []}
          onToggle={(v) => toggleStr("industries", v)}
          searchable
        />
      </FilterSection>

      {/* Referral toggle */}
      {/* <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Referral open</p>
          <p className="text-xs text-muted-foreground/50">
            Only jobs that accept referrals
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ referralOpen: !filters.referralOpen })}
          className={cn(
            "w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
            filters.referralOpen ? "bg-primary" : "bg-gray-200",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200",
              filters.referralOpen ? "left-4" : "left-0.5",
            )}
          />
        </button>
      </div> */}
    </div>
  );
}
