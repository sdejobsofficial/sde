"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, HasNonTechPremium, IsPremiumPlus } from "@/models/userModel";
import { PremiumJobsPageContent, LoadingSkeleton } from "../page";

function NonTechPremiumPageContentWrapper() {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !IsJobSeeker(user) || !HasNonTechPremium(user)) {
        router.replace("/premium");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !IsJobSeeker(user) || !HasNonTechPremium(user)) {
    return <LoadingSkeleton />;
  }

  const isPremiumPlus = IsPremiumPlus(user);

  return <PremiumJobsPageContent isPremiumPlus={isPremiumPlus} category="non-tech" />;
}

export default function NonTechPremiumJobsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NonTechPremiumPageContentWrapper />
    </Suspense>
  );
}
