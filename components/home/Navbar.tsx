"use client";

import { useCurrentUser, useLogout } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut, LayoutDashboard } from "lucide-react";
import { IsCompany, IsJobSeeker } from "@/models/userModel";
import type { AppUser, User } from "@/models/userModel";
import { ThemeToggle } from "@/components/theme-toggle";

// ─── Avatar ───────────────────────────────────────────────────────────────

function Avatar({ user, size = 7 }: { user: User; size?: number }) {
  const avatarUrl = user.Meta?.AvatarUrl;
  const initials =
    user.Name?.slice(0, 2).toUpperCase() ??
    user.Email.slice(0, 2).toUpperCase();

  const dim = `w-${size} h-${size}`;

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={user.Name ?? "avatar"}
        width={size * 4}
        height={size * 4}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${dim} rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────

export default function Navbar() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutateAsync: logout, isPending } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;
  const isCompany = user ? IsCompany(user) : false;
  const isJobSeeker = user ? IsJobSeeker(user) : false;

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="py-5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/icon.png"
                alt="ReferNest Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-bold text-base text-foreground tracking-tight">
                SDE Jobs & <span className="text-primary">Internships</span>
              </span>
            </Link>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8 text-muted-foreground font-medium text-sm">
            {!isCompany ? (
              <>
                <Link
                  href="/jobs"
                  className="hover:text-primary transition-colors"
                >
                  Jobs
                </Link>
                <Link
                  href="/companies"
                  className="hover:text-primary transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href="/premium"
                  className="hover:text-primary transition-colors"
                >
                  Premium
                </Link>
              </>
            ) : null}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-24 h-8 bg-muted rounded-full animate-pulse" />
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              </div>
            ) : isLoggedIn && user ? (
              <>
                {isCompany && (
                  <Link href="/recruiter/dashboard">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <LayoutDashboard size={14} />
                      Dashboard
                    </button>
                  </Link>
                )}

                {/* Avatar only — no label */}
                <Link href={isCompany ? "/recruiter/profile" : "/profile"}>
                  <button className="p-0.5 rounded-full border-2 border-transparent hover:border-primary/50 transition-all">
                    <Avatar user={user} size={7} />
                  </button>
                </Link>

                <button
                  onClick={() => {
                    logout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-semibold hover:bg-primary/10 transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Register
                  </button>
                </Link>
                <Link href="/recruiter/login">
                  <button className="text-sm text-muted-foreground hover:text-foreground ml-2 transition-colors">
                    Want to hire?
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-muted-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-3 text-sm border-t border-border">
            {isCompany ? (
              <Link
                href="/recruiter/jobs"
                className="text-muted-foreground hover:text-primary"
              >
                My Listings
              </Link>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="text-muted-foreground hover:text-primary"
                >
                  Jobs
                </Link>
                <Link
                  href="/companies"
                  className="text-muted-foreground hover:text-primary"
                >
                  Companies
                </Link>
                <Link
                  href="/premium"
                  className="text-muted-foreground hover:text-primary"
                >
                  Premium
                </Link>
              </>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {isLoading ? (
                <>
                  <div className="w-24 h-9 bg-muted rounded-full animate-pulse" />
                  <div className="w-9 h-9 bg-muted rounded-full animate-pulse" />
                </>
              ) : isLoggedIn && user ? (
                <>
                  {isJobSeeker && (
                    <Link href="/profile/applications">
                      <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-full text-sm font-semibold">
                        <LayoutDashboard size={13} />
                        Applications
                      </button>
                    </Link>
                  )}
                  {isCompany && (
                    <Link href="/recruiter/dashboard">
                      <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-full text-sm font-semibold">
                        Dashboard
                      </button>
                    </Link>
                  )}
                  {/* Profile with label on mobile for clarity */}
                  <Link href={isCompany ? "/recruiter/dashboard" : "/profile"}>
                    <button className="flex items-center gap-2 px-3 py-2 border border-primary/20 text-primary rounded-full text-sm font-semibold">
                      <Avatar user={user} size={5} />
                      {isCompany ? "Company" : "Profile"}
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                    }}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 border border-border text-destructive rounded-full text-sm font-semibold"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 border border-primary text-primary rounded-full text-sm font-semibold">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                      Register
                    </button>
                  </Link>
                  <Link
                    href="/recruiter/login"
                    className="text-muted-foreground hover:text-primary self-center"
                  >
                    Want to hire?
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
