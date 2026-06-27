import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompanyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-pulse flex flex-col h-full min-h-[300px]">
      <div className="h-20 bg-emerald-100/30 shrink-0" />
      <div className="px-5 pb-6 flex flex-col flex-1 -mt-8 relative">
        <div className="w-16 h-16 rounded-xl bg-muted border border-border/10 flex-shrink-0 mb-3 shadow-sm" />
        <div className="space-y-3 flex-1">
          <div className="space-y-1.5">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="flex gap-1.5 min-h-[28px] items-center">
            <div className="h-5 bg-muted rounded-md w-16" />
            <div className="h-5 bg-muted rounded-md w-20" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="w-6 h-6 rounded-full bg-muted" />
        </div>
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
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-xs text-muted-foreground/80">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        of {total.toLocaleString()} companies
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground disabled:opacity-40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        >
          Previous
        </Button>
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
          className="h-8 px-3 rounded-xl border-gray-200 text-xs text-muted-foreground disabled:opacity-40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
