"use client";

import { useState } from "react";
import {
  Crown,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Lock,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentUser, useHandlePremiumUpgrade } from "@/hooks/useUser";
import {
  IsJobSeeker,
  JobSeekerMeta,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/models/userModel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

const PREMIUM_FEATURES = [
  {
    icon: Briefcase,
    title: "Exclusive Premium Jobs",
    desc: "Access curated premium job listings not available to free users",
  },
  {
    icon: Zap,
    title: "Priority Applications",
    desc: "Your applications are highlighted to recruiters",
  },
  {
    icon: BadgeCheck,
    title: "Verified Premium Badge",
    desc: "Stand out with a Premium badge on your profile",
  },
  {
    icon: Star,
    title: "Premium Career Resources",
    desc: "Resume reviews, interview prep, and career guidance",
  },
  {
    icon: Shield,
    title: "Priority Support",
    desc: "Get help faster with dedicated premium support",
  },
];

const FREE_VS_PREMIUM = [
  { feature: "Browse free job listings", free: true, premium: true },
  { feature: "Apply to free jobs", free: true, premium: true },
  { feature: "Basic profile", free: true, premium: true },
  { feature: "Access to premium job listings", free: false, premium: true },
  { feature: "Priority application visibility", free: false, premium: true },
  { feature: "Premium career resources", free: false, premium: true },
  { feature: "Verified Premium badge", free: false, premium: true },
  { feature: "Priority support", free: false, premium: true },
  { feature: "Unlimited applications", free: false, premium: true },
];

function PremiumMemberCard({
  name,
  subscription,
  onViewPremiumJobs,
}: {
  name: string;
  subscription: JobSeekerMeta["Subscription"];
  onViewPremiumJobs: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 shadow-xl shadow-primary/20">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-card/5" />
      <div className="absolute bottom-0 left-12 w-24 h-24 rounded-full bg-card/5" />
      <div className="absolute top-6 right-24 w-6 h-6 rounded-full bg-yellow-300/20" />

      <div className="relative z-10 space-y-5">
        {/* Badge row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-card/10 border border-white/20 rounded-full px-3 py-1.5">
            <Crown size={13} className="text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-bold text-primary-foreground uppercase tracking-wide">
              Premium Member
            </span>
          </div>
          {subscription?.CurrentPeriodEnd && (
            <span className="text-xs text-primary-foreground/50">
              Renews{" "}
              {new Date(subscription.CurrentPeriodEnd).toLocaleDateString(
                "en-IN",
                { day: "numeric", month: "short", year: "numeric" },
              )}
            </span>
          )}
        </div>

        {/* Message */}
        <div>
          <h3 className="text-xl font-black text-primary-foreground leading-tight">
            You&apos;re a Pro, {name.split(" ")[0]}! 🎉
          </h3>
          <p className="text-sm text-primary-foreground/60 mt-1">
            Exclusive premium job listings are unlocked for you.
          </p>
        </div>

        {/* Features strip */}
        <div className="flex flex-wrap gap-2">
          {[
            "Premium Jobs",
            "Priority Support",
            "Career Tools",
            "Unlimited Apps",
          ].map((f) => (
            <span
              key={f}
              className="text-xs bg-card/10 border border-white/15 text-primary-foreground/80 px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <Check size={10} className="text-green-200" /> {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onViewPremiumJobs}
          className="w-full flex items-center justify-between bg-card hover:bg-card/95 transition-all text-primary font-bold text-sm rounded-xl px-4 py-3 group shadow-lg shadow-black/10"
        >
          <span className="flex items-center gap-2">
            <Star size={15} className="text-amber-500 fill-amber-400" />
            Browse Premium Jobs
          </span>
          <ArrowRight
            size={15}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}

// ─── Pricing section ──────────────────────────────────────────────────────

function PricingSection({
  onCheckout,
  isLoading,
}: {
  onCheckout: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 pt-7 pb-8 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-card/8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-card/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-yellow-300" />
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">
              Upgrade to Premium
            </span>
          </div>
          <h2 className="text-2xl font-black text-primary-foreground leading-tight">
            Unlock premium jobs &<br />
            career tools
          </h2>
          <p className="text-sm text-primary-foreground/60 mt-2 max-w-xs">
            Get exclusive access to high-quality, hand-picked job listings
            curated for serious job seekers.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Pricing card */}
        <div className="relative flex items-center justify-between bg-primary/5 border-2 border-primary rounded-2xl px-5 py-4">
          <span className="absolute -top-2.5 left-4 text-xs font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
            3-month access
          </span>
          <div>
            <p className="text-sm font-bold text-primary mt-1">Premium Plan</p>
            <p className="text-xs text-primary/50 font-medium">
              One-time payment · No auto-renewal
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-primary">₹299</p>
            <p className="text-xs text-primary/50 font-medium">for 3 months</p>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/50 border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide col-span-1">
              Feature
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide text-center">
              Free
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wide text-center flex items-center justify-center gap-1">
              <Crown size={10} className="fill-primary" /> Premium
            </span>
          </div>
          {FREE_VS_PREMIUM.map(({ feature, free, premium }) => (
            <div
              key={feature}
              className="grid grid-cols-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-muted/50/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground col-span-1 pr-2 self-center">
                {feature}
              </span>
              <div className="flex items-center justify-center">
                {free ? (
                  <Check size={14} className="text-muted-foreground/80" />
                ) : (
                  <X size={14} className="text-gray-200" />
                )}
              </div>
              <div className="flex items-center justify-center">
                {premium ? (
                  <Check size={14} className="text-primary" />
                ) : (
                  <X size={14} className="text-gray-200" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Premium features highlights */}
        <div className="grid grid-cols-1 gap-2.5">
          {PREMIUM_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/90">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-1">
          <Button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-primary-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Crown size={15} className="fill-white/30" />
                Get Premium — ₹299
                <ArrowRight size={14} className="ml-1" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/80">
            <span className="flex items-center gap-1">
              <Lock size={10} /> Secure checkout
            </span>
            <span>·</span>
            <span>via Razorpay</span>
            <span>·</span>
            <span>No hidden fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();

  const PRICE = 299;

  const { data: user } = useCurrentUser();
  const { mutateAsync: handlePremiumUpgrade } = useHandlePremiumUpgrade();

  const meta = user?.Meta as JobSeekerMeta | undefined;
  const name = user?.Name ?? "Your Account";
  const email = user?.Email ?? "";
  const phone = user?.Phone ?? "";
  const location = meta?.Location ?? "";
  const avatarUrl = meta?.AvatarUrl ?? null;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const subscription = meta?.Subscription;

  const isPremium =
    subscription?.Plan === SubscriptionPlan.Premium &&
    subscription?.Status === SubscriptionStatus.Active;

  const handleCheckout = () => {
    router.push("/premium");
  };

  return (
    <div className="min-h-screen bg-muted/50/80">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-black text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your plan and account details
          </p>
        </div>

        {/* ── Profile card ── */}
        <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/25">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl"
                  width={56}
                  height={56}
                />
              ) : (
                <span className="text-primary-foreground font-black text-lg">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-foreground truncate">
                  {name}
                </p>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    <Crown size={10} className="fill-amber-500" /> Premium
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-1">
                {email && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail size={11} className="text-muted-foreground/80" /> {email}
                  </span>
                )}
                {phone && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone size={11} className="text-muted-foreground/80" /> {phone}
                  </span>
                )}
                {location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-muted-foreground/80" /> {location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Premium member card OR upgrade section ── */}
        {isPremium ? (
          <>
            <PremiumMemberCard
              name={name}
              subscription={subscription}
              onViewPremiumJobs={() => router.push("/premium")}
            />
          </>
        ) : (
          <>
            {/* Free plan status */}
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <User size={18} className="text-muted-foreground/80" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Free plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Limited access to platform features
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  Free tier
                </span>
              </div>
            </div>

            {/* Pricing section */}
            <PricingSection onCheckout={handleCheckout} />
          </>
        )}
      </div>
    </div>
  );
}
