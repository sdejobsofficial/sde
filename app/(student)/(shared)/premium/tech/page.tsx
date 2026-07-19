"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useUser";
import { IsJobSeeker, HasTechPremium, IsPremiumPlus } from "@/models/userModel";
import { PremiumJobsPageContent, LoadingSkeleton } from "../page";

function TechPremiumPageContentWrapper() {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !IsJobSeeker(user) || !HasTechPremium(user)) {
        router.replace("/premium");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !IsJobSeeker(user) || !HasTechPremium(user)) {
    return <LoadingSkeleton />;
  }

  const isPremiumPlus = IsPremiumPlus(user);

  return <PremiumJobsPageContent isPremiumPlus={isPremiumPlus} category="tech" />;
}

export default function TechPremiumJobsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TechPremiumPageContentWrapper />
    </Suspense>
  );
}
