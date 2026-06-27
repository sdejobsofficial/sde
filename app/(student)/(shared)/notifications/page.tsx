"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, Sparkles, Crown } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, IsPremium, IsPremiumPlus } from "@/models/userModel";
import PricingPage from "@/components/student/Premium/Pricing";
import Link from "next/link";
import { markNotificationsRead } from "@/lib/notificationReadStore";

const PAGE_SIZE = 20;

// ─── Relative time helper ───────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Notification card ───────────────────────────────────────────────────────

function NotificationCard({
  title,
  description,
  createdAt,
}: {
  title: string;
  description: string;
  createdAt: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#166164]/10 to-[#36b9b7]/10 border border-[#39c8c9]/20 flex items-center justify-center flex-shrink-0">
          <Bell size={15} className="text-[#0d9488]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">
            {title}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {description}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-3 flex items-center gap-1 font-medium">
            <Clock size={10} />
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Gated upsell — shown to everyone except Premium Plus ──────────────────

function NotificationsLocked() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#166164]/10 to-[#36b9b7]/10 border border-[#39c8c9]/20 flex items-center justify-center">
          <Bell size={26} className="text-[#0d9488]" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20 uppercase tracking-wider mb-4">
          <Crown size={10} fill="currentColor" />
          Premium exclusive
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
          Notifications are for Premium members
        </h1>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-7">
          Get direct updates on new job drops, deadlines, and announcements —
          available to Premium and Premium Plus members.
        </p>
        <Link
          href="/premium"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Sparkles size={14} />
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}

// ─── Notifications feed ───────────────────────────────────────────────────────

function NotificationsFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useNotifications(page, PAGE_SIZE);

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    if (notifications.length === 0) return;
    markNotificationsRead(notifications.map((n) => n.Id));
  }, [notifications]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#121d2b] via-[#166164] to-[#36b9b7] py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card/10 border border-white/20 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <Crown size={12} className="text-[#39c8c9]" fill="currentColor" />
            Premium Plus
          </div>
          <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight mb-2">
            Notifications
          </h1>
          <p className="text-[#39c8c9]/90 text-sm font-medium max-w-md mx-auto">
            Updates and announcements sent directly to Premium Plus members.
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground font-medium mb-4">
          {isLoading ? (
            <span className="h-4 w-24 bg-muted rounded animate-pulse inline-block" />
          ) : (
            <>
              <span className="font-extrabold text-foreground text-base">
                {total.toLocaleString()}
              </span>{" "}
              notification{total !== 1 ? "s" : ""}
              {isFetching && !isLoading && (
                <span className="ml-2 text-xs text-primary animate-pulse font-bold">
                  Updating...
                </span>
              )}
            </>
          )}
        </p>

        {isLoading ? (
          <NotificationsSkeleton />
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="text-primary/40" size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground/80">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Check back soon for updates and announcements
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationCard
                key={n.Id}
                title={n.Title}
                description={n.Description}
                createdAt={n.CreatedAt}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5">
            <p className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-3.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-card border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !IsJobSeeker(user)) return <PricingPage />;

  if (!IsPremium(user) && !IsPremiumPlus(user)) return <NotificationsLocked />;

  return <NotificationsFeed />;
}
