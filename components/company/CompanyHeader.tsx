"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useUser";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/recruiter/dashboard": { title: "Dashboard", subtitle: "Welcome back" },
  "/recruiter/jobs": {
    title: "Posted Jobs",
    subtitle: "Manage your job listings",
  },
  "/recruiter/applicants": {
    title: "Applicants",
    subtitle: "Review incoming applications",
  },
};

export default function CompanyHeader() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const page = PAGE_TITLES[pathname] ?? { title: "ReferNest", subtitle: "" };

  const meta = user?.Meta;
  const logoUrl = meta?.AvatarUrl ?? null;
  const name = user?.Name ?? "Company";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-6 gap-4 shrink-0">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden w-8 h-8 rounded-lg text-muted-foreground"
      >
        <Menu size={17} />
      </Button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="text-sm font-bold text-foreground leading-none">
          {page.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{page.subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {/* Bell */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary/100 rounded-full border-2 border-white" />
        </Button> */}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary/90 text-xs font-bold">
              {initials}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
