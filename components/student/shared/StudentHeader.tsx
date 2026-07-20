"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bookmark,
  ClipboardList,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser, useLogout } from "@/hooks/useUser";
import { useNotifications } from "@/hooks/useNotifications";
import { IsJobSeeker, IsPremium, IsPremiumPlus } from "@/models/userModel";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Applications", href: "/applications", icon: ClipboardList },
  { label: "Premium", href: "/premium", icon: Bookmark },
];

// ─── Bell icon — only rendered for Premium Plus members ────────────────────

function NotificationBell() {
  const pathname = usePathname();
  const { data } = useNotifications(1, 1);
  const hasNotifications = (data?.total ?? 0) > 0;

  return (
    <Link
      href="/notifications"
      className={cn(
        "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all",
        pathname.startsWith("/notifications")
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
      aria-label="Notifications"
    >
      <Bell size={17} />
      {/* {hasNotifications && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background" />
      )} */}
    </Link>
  );
}

export default function StudentHeader() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const { mutateAsync: logout, isPending } = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const avatarUrl =
    user?.Meta && "AvatarUrl" in user.Meta ? user.Meta.AvatarUrl : null;

  const initials = user?.Name
    ? user.Name.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const showBell =
    !!user && IsJobSeeker(user) && (IsPremium(user) || IsPremiumPlus(user));

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center gap-4">
        {/* ── Logo ── */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="ReferNest Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-bold text-base text-foreground tracking-tight hidden sm:block">
              SDE Jobs & <span className="text-primary">Internships</span>
            </span>
          </Link>
        </div>

        {/* ── Nav links ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                pathname.startsWith(href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <ThemeToggle />
          {showBell && <NotificationBell />}
          {isLoading ? (
            // Skeleton
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            // ── Logged in ──
            <>
              {/* Profile dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-muted/50 transition-all"
                  aria-label="Profile menu"
                >
                  {avatarUrl ? (
                    <Image
                      width={40}
                      height={40}
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary/90 text-xs font-bold border border-primary/30 flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <ChevronDown
                    size={13}
                    className={cn(
                      "text-muted-foreground/80 transition-transform duration-200 hidden sm:block",
                      profileOpen && "rotate-180",
                    )}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl shadow-xl border border-border py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.Name ?? "Your Profile"}
                        </p>
                        <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                          {user.Email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <User size={14} />
                        My profile
                      </Link>
                      <Link
                        href="/applications"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <ClipboardList size={14} />
                        My Applications
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Settings size={14} />
                        Account
                      </Link>
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          disabled={isPending}
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {isPending ? (
                            "Signing out..."
                          ) : (
                            <>
                              <LogOut size={14} />
                              Sign out
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            // ── Guest ──
            <Link href="/login">
              <Button className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-sm shadow-primary/30 transition-all">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* ── Mobile Nav Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1 shadow-lg">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname.startsWith(href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

