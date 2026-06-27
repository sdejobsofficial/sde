"use client";

import { useMemo, useState } from "react";
import { Bell, X, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, IsPremium, IsPremiumPlus } from "@/models/userModel";
import {
  filterUnreadWithinWindow,
  markNotificationsRead,
  NOTIFICATION_WINDOW_DAYS,
} from "@/lib/notificationReadStore";

// Pull enough recent notifications to safely cover the 3-day window
// client-side (the API has no since/date param yet).
const FETCH_SIZE = 50;

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

function NotificationPopupInner() {
  const { data } = useNotifications(1, FETCH_SIZE);
  const allNotifications = data?.data ?? [];

  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  const unread = useMemo(() => {
    return filterUnreadWithinWindow(allNotifications).filter(
      (n) => !locallyRead.has(n.Id),
    );
  }, [allNotifications, locallyRead]);

  const visibleNotifications = useMemo(() => unread.slice(0, 5), [unread]);
  const shouldShow = !dismissed && visibleNotifications.length > 0;

  if (!shouldShow) return null;

  const handleDismiss = () => setDismissed(true);

  const handleMarkOneRead = (id: string) => {
    markNotificationsRead([id]);
    setLocallyRead((prev) => new Set(prev).add(id));
  };

  const handleMarkAllRead = () => {
    markNotificationsRead(unread.map((n) => n.Id));
    setLocallyRead((prev) => {
      const next = new Set(prev);
      unread.forEach((n) => next.add(n.Id));
      return next;
    });
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Recent notifications"
      className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2.5rem))] animate-in slide-in-from-bottom-3 fade-in duration-300"
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#121d2b] via-[#166164] to-[#36b9b7]">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-[#39c8c9]" />
            <p className="text-sm font-bold text-primary-foreground">
              {unread.length} new notification{unread.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss notifications popup"
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors rounded-md p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {visibleNotifications.map((n) => (
            <button
              key={n.Id}
              onClick={() => handleMarkOneRead(n.Id)}
              className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <p className="text-sm font-bold text-foreground leading-snug">
                {n.Title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                {n.Description}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-2 flex items-center gap-1 font-medium">
                <Clock size={10} />
                {timeAgo(n.CreatedAt)}
              </p>
            </button>
          ))}
          {unread.length > visibleNotifications.length && (
            <p className="px-4 py-2 text-[11px] text-muted-foreground/70 font-medium">
              +{unread.length - visibleNotifications.length} more
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
          <a
            href="/notifications"
            className="text-xs font-bold text-primary hover:underline"
          >
            View all
          </a>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationPopup() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading || !user) return null;
  if (!IsJobSeeker(user)) return null;
  if (!IsPremium(user) && !IsPremiumPlus(user)) return null;

  return <NotificationPopupInner />;
}

export { NOTIFICATION_WINDOW_DAYS };
