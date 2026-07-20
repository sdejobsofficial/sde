"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Share2,
  Gift,
  TrendingUp,
  Copy,
  Check,
  Users,
  Hash,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  REFERRAL_HEADLINE,
  REFERRAL_SUBTITLE,
  REFERRAL_PERKS,
  PLACEHOLDER_CODE,
} from "@/constants/student/SReferralConstants";

// ─── Types ────────────────────────────────────────────────────────────────

interface ReferralProfile {
  referralCode: string;
  shareUrl: string;
  conversionCount: number;
  name: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

function useReferralProfile() {
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/referral/my-profile");
      const json = await res.json();
      if (json.isOk && json.data) {
        setProfile(json.data);
      } else {
        setError(json.message ?? "Failed to load referral info");
      }
    } catch {
      setError("Failed to load referral info. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
}

// ─── Copy Button ──────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all border",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
          : "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10",
      )}
    >
      {copied ? (
        <>
          <Check size={11} /> Copied!
        </>
      ) : (
        <>
          <Copy size={11} /> {label ?? "Copy"}
        </>
      )}
    </button>
  );
}

// ─── Share Link Section ────────────────────────────────────────────────────

function ShareLinkCard({
  referralCode,
  shareUrl,
}: {
  referralCode: string;
  shareUrl: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Share2 size={13} className="text-primary-foreground/70" />
          <span className="text-xs font-bold text-primary-foreground/70 uppercase tracking-wider">
            Your Referral Link
          </span>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Share this link with friends to earn rewards
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Referral code display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Hash size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Your code
              </p>
              <p className="text-lg font-black tracking-[0.25em] text-foreground font-mono">
                {referralCode}
              </p>
            </div>
          </div>
          <CopyButton text={referralCode} label="Copy code" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Share URL */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Share link
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border min-w-0">
              <ExternalLink size={13} className="text-muted-foreground/60 flex-shrink-0" />
              <span className="text-xs text-muted-foreground/80 truncate font-mono">
                {shareUrl}
              </span>
            </div>
            <CopyButton text={shareUrl} label="Copy link" />
          </div>
        </div>

        {/* Quick share buttons */}
        <div className="flex gap-2 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join SDE Jobs & Internships using my referral code: ${referralCode}\n\n${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </a>
          <a
            href={`mailto:?subject=Join me on SDE Jobs & Internships&body=${encodeURIComponent(`Hey,\n\nI've been using SDE Jobs & Internships to find great opportunities. Use my referral code ${referralCode} to join!\n\nSign up here: ${shareUrl}\n\nCheers,`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            Share via Email
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Card ────────────────────────────────────────────────────────────

function StatsCard({ conversionCount }: { conversionCount: number }) {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">Your Referral Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/5 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-primary">{conversionCount}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Conversions
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-amber-600">
            {conversionCount > 0 ? "✓" : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Rewards Earned
          </p>
        </div>
      </div>

      {conversionCount === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-dashed border-border">
          <p className="text-xs text-center text-muted-foreground/80">
            Share your referral link to start earning rewards!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Perks List ────────────────────────────────────────────────────────────

function PerksList() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={14} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">How it works</h3>
      </div>
      <ul className="space-y-3">
        {REFERRAL_PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon size={12} className="text-primary" />
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────

function ReferralSectionSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-1">
          <div className="w-28 h-3 bg-muted rounded animate-pulse" />
          <div className="w-48 h-2 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
        <div className="space-y-2">
          <div className="w-16 h-2 bg-muted rounded animate-pulse" />
          <div className="w-36 h-5 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-20 h-8 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-muted rounded-xl animate-pulse" />
        <div className="w-20 h-8 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────

function ReferralSectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-red-100 shadow-sm p-6 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <TrendingUp size={16} className="text-red-400" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Could not load referral info
      </p>
      <p className="text-xs text-muted-foreground">
        Please check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <RefreshCw size={12} />
        Try again
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ReferralSection() {
  const { profile, isLoading, error, refetch } = useReferralProfile();

  if (isLoading) return <ReferralSectionSkeleton />;
  if (error || !profile) return <ReferralSectionError onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Share2 size={14} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">
            {REFERRAL_HEADLINE}
          </h2>
          <p className="text-xs text-muted-foreground">{REFERRAL_SUBTITLE}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Share link card — takes 2 columns on desktop */}
        <div className="md:col-span-2">
          <ShareLinkCard
            referralCode={profile.referralCode}
            shareUrl={profile.shareUrl}
          />
        </div>

        {/* Stats + Perks — 1 column */}
        <div className="space-y-4">
          <StatsCard conversionCount={profile.conversionCount} />
          <PerksList />
        </div>
      </div>
    </div>
  );
}

