"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser, useLogout } from "@/hooks/useUser";
import Image from "next/image";
import { CompanyMeta } from "@/models/userModel";

const NAV = [
  {
    section: "Manage",
    items: [
      {
        label: "Dashboard",
        href: "/recruiter/dashboard",
        icon: LayoutDashboard,
      },
      { label: "Posted Jobs", href: "/recruiter/jobs", icon: FileText },
      { label: "Applicants", href: "/recruiter/applicants", icon: Users },
    ],
  },
];

export default function CompanySidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { mutateAsync: logout, isPending } = useLogout();

  const meta = user?.Meta as CompanyMeta | undefined;
  const name = user?.Name ?? "Your Company";
  const logoUrl = meta?.AvatarUrl ?? null;
  const initials = name.slice(0, 2).toUpperCase();
  const verified = meta?.VerificationStatus === 2;

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-card border-r border-gray-100 h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 shrink-0">
        <Link href="/recruiter/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="ReferNest Logo"
            width={24}
            height={24}
            className="rounded-md"
          />
          <span className="font-bold text-sm text-foreground tracking-tight">
            SDE Jobs & <span className="text-primary">Internships</span>
          </span>
        </Link>
      </div>

      {/* Company identity */}
      <div className="px-4 py-4 border-b border-gray-50 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-gray-100">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary/90 text-xs font-bold">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-foreground/90 truncate">
                {name}
              </p>
              {verified && (
                <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 10 10"
                    className="w-2 h-2 text-primary-foreground"
                    fill="none"
                  >
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground/80 truncate">{user?.Email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-widest px-2 mb-1.5">
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                        active
                          ? "bg-primary/10 text-primary/90"
                          : "text-muted-foreground hover:text-foreground/90 hover:bg-muted/50",
                      )}
                    >
                      <Icon
                        size={16}
                        className={cn(
                          "shrink-0 transition-colors",
                          active
                            ? "text-primary"
                            : "text-muted-foreground/80 group-hover:text-muted-foreground",
                        )}
                      />
                      {label}
                      {active && (
                        <ChevronRight
                          size={13}
                          className="ml-auto text-primary"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100 shrink-0">
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut
            size={16}
            className="text-muted-foreground/80 group-hover:text-red-400 transition-colors"
          />
          Sign out
        </button>
      </div>
    </aside>
  );
}
