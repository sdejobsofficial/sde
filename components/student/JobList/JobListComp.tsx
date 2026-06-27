import { Button } from "@/components/ui/button";
import { useFeaturedCompanies } from "@/hooks/useJobs";
import { cn } from "@/lib/utils";
import {
  Building2,
  BadgeCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function FeaturedCompaniesSidebar() {
  const { data: companies, isLoading } = useFeaturedCompanies();

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">
          Top hiring companies
        </h2>
        <Link
          href="/companies"
          className="text-xs text-primary hover:underline font-semibold"
        >
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(companies ?? []).map((company) => (
            <Link key={company.Id} href={`/companies/${company.Id}`}>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-all group cursor-pointer border border-transparent hover:border-border">
                <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {company.LogoUrl ? (
                    <Image
                      src={company.LogoUrl}
                      alt={company.Name}
                      className="w-full h-full object-contain"
                      width={36}
                      height={36}
                    />
                  ) : (
                    <Building2 className="text-muted-foreground/30" size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {company.Name}
                    </p>
                    <BadgeCheck size={11} className="text-blue-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {company.ActiveJobs} open{" "}
                    {company.ActiveJobs === 1 ? "job" : "jobs"}
                    {company.Location ? ` · ${company.Location}` : ""}
                  </p>
                </div>
                <ChevronRight
                  size={12}
                  className="text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function PremiumPromo() {
  return (
    <div className="bg-linear-to-br from-[#121d2b] via-[#166164] to-[#36b9b7] rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-primary/20">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-card/10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-card/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} className="text-yellow-300 fill-yellow-300" />
          <span className="text-[10px] font-semibold text-yellow-300 uppercase tracking-wider">Premium</span>
        </div>
        <h3 className="text-[15px] font-semibold text-white mb-2 leading-tight">
          Unlock your full potential with premium access
        </h3>
        <p className="text-[11px] text-white/90 leading-relaxed mb-5 font-normal">
          Free users get limited access to platform features. Go premium for full
          access to all resources, priority support, and premium career guidance tools.
        </p>
        <div className="space-y-2 mb-6">
          {[
            "Full access to premium resources",
            "Priority support & guidance",
            "Premium career guidance tools",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-4.5 h-4.5 rounded-full bg-card/20 flex items-center justify-center shrink-0 border border-white/20">
                <svg
                  viewBox="0 0 10 10"
                  className="w-2.5 h-2.5 text-white"
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
              </div>
              <span className="text-xs text-white font-medium">{f}</span>
            </div>
          ))}
        </div>
        <Link href={"/account"}>
          <Button className="w-full h-10 bg-card text-primary hover:bg-muted/50 transition-all rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow-md">
            Upgrade to Premium <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-muted rounded-full w-16" />
        ))}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

export function Pagination({
  page,
  hasMore,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  hasMore: boolean;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between mt-2">
      <p className="text-xs text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        of {total.toLocaleString()} jobs
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 px-3 rounded-xl border-border text-xs text-foreground disabled:opacity-40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        >
          Previous
        </Button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          if (p < 1 || p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-8 h-8 rounded-xl text-xs font-medium transition-all",
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {p}
            </button>
          );
        })}

        <Button
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="h-8 px-3 rounded-xl border-border text-xs text-foreground disabled:opacity-40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
