import { Input } from "@/components/ui/input";
import {
  INDUSTRY_OPTIONS,
  SIZE_OPTIONS,
} from "@/constants/student/SCompanyList";
import { cn } from "@/lib/utils";
import { CompanyFilters } from "@/models/jobModel";
import {
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Search,
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
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {open ? (
          <ChevronUp size={15} className="text-muted-foreground/80" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground/80" />
        )}
      </button>
      {open && children}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onToggle}
        className={cn(
          "w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0",
          checked
            ? "bg-primary border-primary"
            : "border-gray-300 group-hover:border-primary",
        )}
      >
        {checked && (
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
      <span className="text-xs text-foreground/80 group-hover:text-primary/90 transition-colors">
        {label}
      </span>
    </label>
  );
}

export function FiltersSidebar({
  filters,
  onChange,
}: {
  filters: CompanyFilters;
  onChange: (f: Partial<CompanyFilters>) => void;
}) {
  const [locationSearch, setLocationSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const toggleIndustry = (ind: string) => {
    const cur = filters.industries ?? [];
    onChange({
      industries: cur.includes(ind)
        ? cur.filter((v) => v !== ind)
        : [...cur, ind],
    });
  };

  const toggleSize = (size: number) => {
    const cur = filters.sizes ?? [];
    onChange({
      sizes: cur.includes(size)
        ? cur.filter((v) => v !== size)
        : [...cur, size],
    });
  };

  const toggleLocation = (loc: string) => {
    const cur = filters.locations ?? [];
    onChange({
      locations: cur.includes(loc)
        ? cur.filter((v) => v !== loc)
        : [...cur, loc],
    });
  };

  const activeCount = [
    filters.industries?.length,
    filters.sizes?.length,
    filters.locations?.length,
    filters.hiringOnly ? 1 : 0,
    filters.verifiedOnly ? 1 : 0,
  ].reduce<number>((s, v) => s + (v || 0), 0);

  const filteredIndustries = INDUSTRY_OPTIONS.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase()),
  );
  const visibleIndustries = showAllIndustries
    ? filteredIndustries
    : filteredIndustries.slice(0, 5);

  const commonLocations = [
    "Bengaluru",
    "Delhi / NCR",
    "Mumbai",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Kolkata",
    "Remote",
  ];
  const filteredLocations = commonLocations.filter((l) =>
    l.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  return (
    <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal size={14} className="text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">Filters</h2>
          {activeCount > 0 && (
            <span className="text-[10px] bg-primary text-primary-foreground rounded-full min-w-5 h-5 flex items-center justify-center font-bold px-1">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                industries: [],
                sizes: [],
                locations: [],
                hiringOnly: false,
                verifiedOnly: false,
              })
            }
            className="text-[11px] text-red-500 hover:text-red-600 font-bold uppercase tracking-tighter transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Quick toggles */}
        <FilterSection title="Status">
          <div className="space-y-3 pt-1">
            <CheckRow
              label="Hiring Now"
              checked={!!filters.hiringOnly}
              onToggle={() => onChange({ hiringOnly: !filters.hiringOnly })}
            />
            <CheckRow
              label="Verified Partner"
              checked={!!filters.verifiedOnly}
              onToggle={() => onChange({ verifiedOnly: !filters.verifiedOnly })}
            />
          </div>
        </FilterSection>

        {/* Industry */}
        <FilterSection title="Industry">
          <div className="space-y-3 pt-1">
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                size={13}
              />
              <Input
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                placeholder="Search industries"
                className="pl-9 h-9 text-xs rounded-xl border-border/50 bg-muted/50 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all font-medium"
              />
            </div>
            <div className="space-y-2.5">
              {visibleIndustries.map((ind) => (
                <CheckRow
                  key={ind}
                  label={ind}
                  checked={(filters.industries ?? []).includes(ind)}
                  onToggle={() => toggleIndustry(ind)}
                />
              ))}
            </div>
            {filteredIndustries.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllIndustries((v) => !v)}
                className="text-[11px] text-primary font-semibold hover:text-primary/80 mt-3 flex items-center gap-1 group/btn"
              >
                {showAllIndustries ? "Show Less" : "View All Categories"}
                {!showAllIndustries && <span className="opacity-40 group-hover/btn:translate-x-0.5 transition-transform">→</span>}
              </button>
            )}
          </div>
        </FilterSection>

        {/* Company size */}
        <FilterSection title="Scale">
          <div className="space-y-3 pt-1">
            {SIZE_OPTIONS.map(({ label, sub, value }) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => toggleSize(value)}
                  className={cn(
                    "w-4.5 h-4.5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0",
                    (filters.sizes ?? []).includes(value)
                      ? "bg-primary border-primary"
                      : "border-slate-200 group-hover:border-primary/50",
                  )}
                >
                  {(filters.sizes ?? []).includes(value) && (
                    <svg
                      viewBox="0 0 10 10"
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                    >
                      <path
                        d="M1.5 5l2.5 2.5 4.5-4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 leading-none">{sub}</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location" defaultOpen={false}>
          <div className="space-y-3 pt-1">
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                size={13}
              />
              <Input
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Find location"
                className="pl-9 h-9 text-xs rounded-xl border-border/50 bg-muted/50 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all font-medium"
              />
            </div>
            <div className="space-y-2.5">
              {filteredLocations.map((loc) => (
                <CheckRow
                  key={loc}
                  label={loc}
                  checked={(filters.locations ?? []).includes(loc)}
                  onToggle={() => toggleLocation(loc)}
                />
              ))}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
