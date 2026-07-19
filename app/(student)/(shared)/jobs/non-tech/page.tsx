"use client";

import { Suspense } from "react";
import { JobsPageContent } from "../page";

export default function NonTechJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/50/80 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl px-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-card border border-gray-100"
              />
            ))}
          </div>
        </div>
      }
    >
      <JobsPageContent category="non-tech" />
    </Suspense>
  );
}
