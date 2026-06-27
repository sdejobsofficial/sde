import { cn } from "@/lib/utils";
import { VerificationStatus } from "@/models/userModel";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Briefcase,
  MapPin,
} from "lucide-react";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === VerificationStatus.Verified)
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
        <ShieldCheck size={11} /> Verified
      </span>
    );
  if (status === VerificationStatus.Pending)
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
        <ShieldAlert size={11} /> Pending verification
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground border border-gray-200 px-2 py-0.5 rounded-full font-medium">
      <ShieldX size={11} /> Unverified
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────

export function StatCard({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: string;
  label: string;
  icon: typeof Briefcase;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-5 px-4 bg-card rounded-2xl border border-gray-100 shadow-sm flex-1">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          color,
        )}
      >
        <Icon size={16} />
      </div>
      <span className="text-xl font-bold text-foreground leading-none">
        {value}
      </span>
      <span className="text-xs text-muted-foreground/80 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────

export function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-muted/50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={12} className="text-muted-foreground/80" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground/80">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline truncate block"
          >
            {value.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="text-xs font-medium text-foreground/80 leading-snug">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────

// ─── Job card skeleton ─────────────────────────────────────────────────────

export function JobSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
      <div className="h-3 bg-muted rounded w-1/4" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 bg-muted rounded-full w-14" />
        ))}
      </div>
      <div className="flex justify-between pt-3 border-t border-gray-50">
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-3 bg-muted rounded w-14" />
      </div>
    </div>
  );
}

// ─── Page skeleton ─────────────────────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/50/80 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="w-24 h-24 rounded-2xl bg-gray-200 -mt-12 border-4 border-white" />
          <div className="space-y-2 pb-2">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 h-24 bg-card rounded-2xl border border-gray-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
