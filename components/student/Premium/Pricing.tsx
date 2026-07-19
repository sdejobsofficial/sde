"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Crown,
  Check,
  X,
  ExternalLink,
  Shield,
  Sparkles,
  Lock,
  ChevronDown,
  Hash,
  Loader2,
  CheckCircle2,
  XCircle,
  Laptop,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IsJobSeeker, HasTechPremium, HasNonTechPremium } from "@/models/userModel";
import { useCurrentUser, useHandlePremiumUpgrade } from "@/hooks/useUser";
import { useValidateReferralCode } from "@/hooks/useSales";
// Referral credits are finalized server-side (idempotent) via /api/finalizeReferralConversion
// import { recordReferral } from "@/clients/salesClient";
import Script from "next/script";
import toast from "react-hot-toast";

// ─── Config ───────────────────────────────────────────────────────────────

const PRICE = 299;

const FREE_BENEFITS = [
  { label: "Limited access to platform features", included: true },
  { label: "Basic career guidance/resources", included: true },
  { label: "Access to free content only", included: true },
  { label: "Full access to tech premium features", included: false },
  { label: "Full access to non-tech premium features", included: false },
  { label: "Priority support", included: false },
];

const TECH_PREMIUM_BENEFITS = [
  { label: "Access to Tech Premium jobs & listings", highlight: true },
  { label: "Direct tech recruiter connections", highlight: true },
  { label: "Priority support for tech roles", highlight: true },
  { label: "Tech interview guidance & mock prep", highlight: false },
  { label: "Validity: 3 Months", highlight: false },
];

const NON_TECH_PREMIUM_BENEFITS = [
  { label: "Access to Non-Tech Premium jobs & listings", highlight: true },
  { label: "Direct non-tech recruiter connections", highlight: true },
  { label: "Priority support for non-tech roles", highlight: true },
  { label: "General career planning & resume review", highlight: false },
  { label: "Validity: 3 Months", highlight: false },
];

const FAQS = [
  {
    q: "What is the difference between Tech and Non-Tech Premium?",
    a: "Tech Premium gives you exclusive access to high-paying engineering, product, and developer roles. Non-Tech Premium unlocks business development, marketing, sales, content, and HR roles. You can purchase either or both depending on your career goals.",
  },
  {
    q: "What's included in the Premium plans?",
    a: "Each plan gives you full access to its respective premium jobs, priority support, and dedicated career guidance resources. Your access is valid for 3 months.",
  },
  {
    q: "What happens after 3 months?",
    a: "After 3 months your access will expire and you'll revert to the Free plan. You can repurchase anytime to regain premium access.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Checkout is handled securely by Razorpay. We never store your card details.",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────

type ReferralState =
  | { status: "idle" }
  | { status: "validating" }
  | {
      status: "valid";
      salesProfileId: string;
      salesPersonName: string;
      code: string;
    }
  | { status: "invalid" };

// ─── Checkout Modal ───────────────────────────────────────────────────────

function CheckoutModal({
  onClose,
  onProceed,
  isPending,
  prefillCode,
  type,
}: {
  onClose: () => void;
  onProceed: (referralState: ReferralState) => void;
  isPending: boolean;
  prefillCode?: string;
  type: "tech" | "non-tech";
}) {
  const [code, setCode] = useState(prefillCode ?? "");
  const [referralState, setReferralState] = useState<ReferralState>({
    status: "idle",
  });
  const { mutate: validate } = useValidateReferralCode();

  const handleValidate = (codeToValidate?: string) => {
    const trimmed = (codeToValidate ?? code).trim().toUpperCase();
    if (!trimmed) return;
    setReferralState({ status: "validating" });
    validate(trimmed, {
      onSuccess: (result) => {
        if (result) {
          setReferralState({
            status: "valid",
            salesProfileId: result.id,
            salesPersonName: result.name,
            code: trimmed,
          });
        } else {
          setReferralState({ status: "invalid" });
        }
      },
      onError: () => setReferralState({ status: "invalid" }),
    });
  };

  useEffect(() => {
    if (!prefillCode) return;
    queueMicrotask(() => handleValidate(prefillCode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = () => {
    setCode("");
    setReferralState({ status: "idle" });
  };

  const isValidating = referralState.status === "validating";
  const isValid = referralState.status === "valid";
  const isInvalid = referralState.status === "invalid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-gray-100 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
        {/* Header */}
        <div className="bg-primary/5 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown size={14} className="text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground capitalize">
                Get {type} Premium
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isPending}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            3 months full access · one-time payment of{" "}
            <span className="font-bold text-foreground">₹{PRICE}</span>
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* What you get (quick recap) */}
          <ul className="space-y-2">
            {(type === "tech" ? TECH_PREMIUM_BENEFITS : NON_TECH_PREMIUM_BENEFITS)
              .filter((b) => b.highlight)
              .map(({ label }) => (
                <li key={label} className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className="text-primary flex-shrink-0"
                  />
                  <span className="text-xs text-foreground/80">{label}</span>
                </li>
              ))}
          </ul>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Referral code section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Hash size={11} />
              Referral code
              <span className="font-normal normal-case tracking-normal text-muted-foreground/60">
                (optional)
              </span>
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (referralState.status !== "idle")
                      setReferralState({ status: "idle" });
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isValid && handleValidate()
                  }
                  placeholder="e.g. ROHIT25"
                  maxLength={20}
                  disabled={isValid || isPending}
                  className={cn(
                    "w-full h-10 pl-3 pr-9 text-sm border rounded-xl font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-300 focus:outline-none transition-all",
                    isValid
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed"
                      : isInvalid
                        ? "bg-red-50 border-red-200 text-red-700 focus:border-red-400"
                        : "bg-background border-border text-foreground focus:border-primary",
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isValidating && (
                    <Loader2
                      size={13}
                      className="text-muted-foreground/50 animate-spin"
                    />
                  )}
                  {isValid && (
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  )}
                  {isInvalid && <XCircle size={13} className="text-red-400" />}
                </div>
              </div>

              {isValid ? (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isPending}
                  className="h-10 px-3.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all whitespace-nowrap disabled:opacity-40"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleValidate()}
                  disabled={!code.trim() || isValidating || isPending}
                  className="h-10 px-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                >
                  Apply
                </button>
              )}
            </div>

            {/* Feedback */}
            {isValid && referralState.status === "valid" && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={11} />
                Referred by{" "}
                <span className="font-bold">
                  {referralState.salesPersonName}
                </span>
              </p>
            )}
            {isInvalid && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <XCircle size={11} />
                Invalid or inactive code. Please check and try again.
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => onProceed(referralState)}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Crown size={14} />
                Pay ₹{PRICE} &amp; Get Premium
                <ExternalLink size={12} className="opacity-70" />
              </>
            )}
          </button>

          {/* Trust micro-copy */}
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock size={11} /> Secured by Razorpay
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield size={11} /> No hidden fees
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Content ─────────────────────────────────────────────────────

function PricingPageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { data: user, isLoading } = useCurrentUser();
  const { mutateAsync: handlePremiumUpgrade } = useHandlePremiumUpgrade();
  const router = useRouter();

  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref")?.toUpperCase() || undefined;

  const [checkoutType, setCheckoutType] = useState<"tech" | "non-tech" | null>(() => {
    if (refCode) {
      const typeParam = searchParams.get("type");
      return typeParam === "non-tech" ? "non-tech" : "tech";
    }
    return null;
  });

  const isTechActive = !!user && IsJobSeeker(user) && HasTechPremium(user);
  const isNonTechActive = !!user && IsJobSeeker(user) && HasNonTechPremium(user);

  const handleProceed = async (referralState: ReferralState) => {
    if (!user || !checkoutType) return;

    const userId = IsJobSeeker(user) ? user.Id : null;
    if (!userId) {
      toast.error("User not found");
      return;
    }

    setIsPaying(true);
    try {
      const res = await fetch("/api/createOrder", {
        method: "POST",
        body: JSON.stringify({ amount: PRICE * 100 }),
      });
      const data = await res.json();

      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.id,

        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verifyOrder", {
            method: "POST",
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.isOk) {
            if (referralState.status === "valid") {
              try {
                // Single source of truth for referral credits: server finalizes the conversion
                // only when (register with valid referral code) AND (verified payment) AND (premium upgrade).
                const finalizeRes = await fetch(
                  "/api/finalizeReferralConversion",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      referred_user_id: userId,
                      sales_profile_id: referralState.salesProfileId,
                      referral_code: referralState.code,
                      subscription_type: checkoutType,
                      payment_id: response.razorpay_payment_id,
                      order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                      amount: PRICE,
                    }),
                  },
                );

                const finalizeJson = await finalizeRes.json();
                if (!finalizeJson?.isOk) {
                  // Do not block premium upgrade; credits may fail due to DB/RPC.
                  console.warn("finalizeReferralConversion failed", finalizeJson);
                }
              } catch (e) {
                console.warn("finalizeReferralConversion error", e);
              }
            }
            // Premium upgrade is still required regardless of referral credits.
            await handlePremiumUpgrade({ userId, type: checkoutType });
            setCheckoutType(null);
            router.refresh();
          } else {
            toast.error("Payment failed");
          }
          setIsPaying(false);
        },

        modal: {
          ondismiss: () => setIsPaying(false),
        },
      };

      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsPaying(false);
    }
  };

  const handleBuyClick = (type: "tech" | "non-tech") => {
    if (isLoading) return;
    if (!user) {
      router.push(`/login?callbackUrl=/premium`);
    } else {
      setCheckoutType(type);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50/80">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* ── Hero ── */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            <Sparkles size={11} /> Simple, honest pricing
          </span>
          <h1 className="text-4xl font-black text-foreground leading-tight">
            Find your next role.
            <br />
            <span className="text-muted-foreground/80 font-light italic">
              At your own pace.
            </span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Start for free. Upgrade to either Tech or Non-Tech subscription, or both when you&apos;re ready to go all-in.
          </p>
        </div>

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">
                Free Plan
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">₹0</span>
                <span className="text-sm text-muted-foreground/80">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Free forever, no card needed
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {FREE_BENEFITS.map(({ label, included }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      included ? "bg-emerald-50" : "bg-muted/50",
                    )}
                  >
                    {included ? (
                      <Check size={10} className="text-emerald-500" />
                    ) : (
                      <X size={10} className="text-gray-300" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-snug",
                      included ? "text-foreground/80" : "text-gray-300",
                    )}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground cursor-default">
              {!user || (!isTechActive && !isNonTechActive) ? "Current plan" : "Basic Free Version"}
            </button>
          </div>

          {/* Tech Premium */}
          <div className={cn(
            "bg-card rounded-2xl border-2 shadow-md p-6 flex flex-col relative overflow-hidden transition-all duration-300",
            isTechActive ? "border-emerald-500 shadow-emerald-50" : "border-primary shadow-primary/10 hover:shadow-lg hover:shadow-primary/15"
          )}>
            {isTechActive && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Check size={12} /> Active
              </div>
            )}
            {!isTechActive && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Laptop size={12} /> Tech Roles
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Tech Premium
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">
                  ₹{PRICE}
                </span>
                <span className="text-sm text-muted-foreground/80">/3mo</span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                one-time payment, 3 months access
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {TECH_PREMIUM_BENEFITS.map(({ label, highlight }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={10} className="text-primary" />
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-snug",
                      highlight
                        ? "text-primary font-semibold"
                        : "text-foreground/80",
                    )}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => !isTechActive && handleBuyClick("tech")}
              disabled={isLoading || isTechActive}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all",
                isTechActive
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-none cursor-default"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
              )}
            >
              {isTechActive ? (
                <>
                  <CheckCircle2 size={14} />
                  Tech Premium Active
                </>
              ) : isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  <Crown size={14} />
                  Get Tech Premium — ₹{PRICE}
                  <ExternalLink size={12} className="opacity-70" />
                </>
              )}
            </button>
          </div>

          {/* Non-Tech Premium */}
          <div className={cn(
            "bg-card rounded-2xl border-2 shadow-md p-6 flex flex-col relative overflow-hidden transition-all duration-300",
            isNonTechActive ? "border-emerald-500 shadow-emerald-50" : "border-primary shadow-primary/10 hover:shadow-lg hover:shadow-primary/15"
          )}>
            {isNonTechActive && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Check size={12} /> Active
              </div>
            )}
            {!isNonTechActive && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Briefcase size={12} /> Business & Creative
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Non-Tech Premium
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">
                  ₹{PRICE}
                </span>
                <span className="text-sm text-muted-foreground/80">/3mo</span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                one-time payment, 3 months access
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {NON_TECH_PREMIUM_BENEFITS.map(({ label, highlight }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={10} className="text-primary" />
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-snug",
                      highlight
                        ? "text-primary font-semibold"
                        : "text-foreground/80",
                    )}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => !isNonTechActive && handleBuyClick("non-tech")}
              disabled={isLoading || isNonTechActive}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all",
                isNonTechActive
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-none cursor-default"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
              )}
            >
              {isNonTechActive ? (
                <>
                  <CheckCircle2 size={14} />
                  Non-Tech Premium Active
                </>
              ) : isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  <Crown size={14} />
                  Get Non-Tech Premium — ₹{PRICE}
                  <ExternalLink size={12} className="opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Trust signals ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-t border-b border-gray-100">
          {[
            { icon: Lock, label: "Secure checkout via Razorpay" },
            { icon: Shield, label: "No hidden fees" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-xs text-muted-foreground/80"
            >
              <Icon size={13} className="text-gray-300" />
              {label}
            </span>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-foreground text-center">
            Frequently asked questions
          </h2>
          <div className="bg-card rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {FAQS.map(({ q, a }, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-all"
                >
                  <span className="text-sm font-semibold text-foreground/90">
                    {q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-muted-foreground/80 flex-shrink-0 transition-transform duration-200",
                      openFaq === i && "rotate-180",
                    )}
                  />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Checkout modal ── */}
      {checkoutType && (
        <CheckoutModal
          onClose={() => !isPaying && setCheckoutType(null)}
          onProceed={handleProceed}
          isPending={isPaying}
          prefillCode={refCode}
          type={checkoutType}
        />
      )}
    </div>
  );
}

// ─── Page wrapper (useSearchParams needs Suspense) ─────────────────────────

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={20} className="text-primary animate-spin" />
        </div>
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}