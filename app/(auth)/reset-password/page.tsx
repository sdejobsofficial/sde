"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FieldError } from "@/components/common/FormComponents";
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
  RESET_HIGHLIGHTS,
} from "@/constants/shared/resetPasswordConstants";
import { useExchangeCodeForSession, useUpdatePassword } from "@/hooks/useUser";

// ── Small password-strength rule indicator ─────────────────────────────────
function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-[11px] font-medium">
      {met ? (
        <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle size={12} className="text-muted-foreground/40 flex-shrink-0" />
      )}
      <span className={met ? "text-emerald-600" : "text-muted-foreground/60"}>
        {label}
      </span>
    </li>
  );
}

// ── Inner component (uses useSearchParams) ─────────────────────────────────
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { mutateAsync: exchangeCode, isPending: exchanging } =
    useExchangeCodeForSession();
  const { mutateAsync: updatePassword, isPending: updating } =
    useUpdatePassword();
  const loading = exchanging || updating;

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Exchange the one-time code for a session as soon as the page mounts
  useEffect(() => {
    if (!code) {
      setSessionError(true);
      return;
    }
    exchangeCode(code)
      .then(() => setSessionReady(true))
      .catch(() => setSessionError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const password = watch("password", "");
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (values: ResetPasswordFormValues) => {
    await updatePassword(values.password);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-foreground flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="w-full hidden md:flex px-6 lg:px-10 py-5 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="SDE Jobs Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-bold text-base text-foreground tracking-tight">
            SDE Jobs & <span className="text-primary">Internships</span>
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </header>

      {/* ── Cards ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex gap-0 items-stretch bg-card rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-border">
          {/* ── Left Panel ── */}
          <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-[#121d2b] via-[#166164] to-[#36b9b7] flex-col justify-between p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#39c8c9]/10" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#39c8c9]/10" />
            <div className="absolute top-1/2 right-4 w-28 h-28 rounded-full bg-card/5" />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/icon.png"
                  alt="SDE Jobs Logo"
                  width={34}
                  height={34}
                  className="rounded-md border-white border-2 bg-card"
                />
                <span className="text-primary-foreground font-bold text-xl tracking-tight">
                  SDE Jobs
                </span>
              </Link>
            </div>

            {/* Copy */}
            <div className="relative z-10 space-y-8">
              <div>
                <h1 className="text-primary-foreground text-[2.25rem] font-semibold leading-tight tracking-tight">
                  Set a new
                  <br />
                  <span>password.</span>
                </h1>
                <p className="text-[#39c8c9]/90 text-sm mt-3 leading-relaxed font-normal">
                  Choose something strong. You won&apos;t need to do this again
                  for a while.
                </p>
              </div>

              <ul className="space-y-5">
                {RESET_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#39c8c9]/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#39c8c9]/30 backdrop-blur-sm">
                      <Icon className="text-[#39c8c9]" size={16} />
                    </div>
                    <div>
                      <p className="text-primary-foreground text-sm font-semibold">
                        {title}
                      </p>
                      <p className="text-[#39c8c9]/80 text-[11px] mt-0.5 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom cta */}
            <div className="relative z-10">
              <div className="h-px bg-card/20 mb-5" />
              <p className="text-[#39c8c9]/90 text-xs leading-relaxed font-normal">
                Back to{" "}
                <Link
                  href="/login"
                  className="text-primary-foreground font-bold hover:underline transition-all"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 bg-card p-8 lg:p-12 flex flex-col justify-center">
            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <Image
                src="/icon.png"
                alt="SDE Jobs Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-bold text-lg text-foreground">
                SDE Jobs & <span className="text-primary">Internships</span>
              </span>
            </div>

            {/* ── Invalid / expired link ── */}
            {sessionError && (
              <div className="flex flex-col items-center text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                  <XCircle className="text-red-500" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Link expired
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed font-medium max-w-xs mx-auto">
                    This password reset link is invalid or has expired. Reset
                    links are only valid for 1 hour.
                  </p>
                </div>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Request a new link
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* ── Loading / exchanging code ── */}
            {!sessionError && !sessionReady && (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
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
                <p className="text-sm text-muted-foreground font-medium">
                  Verifying your reset link…
                </p>
              </div>
            )}

            {/* ── Reset form ── */}
            {!sessionError && sessionReady && (
              <>
                {/* Heading */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full mb-3 border border-primary/20 uppercase tracking-wider">
                    <ShieldCheck size={11} />
                    Set new password
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                    New password
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1.5 font-medium">
                    Make it strong — you&apos;ve got this.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {/* New password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                    >
                      New password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                        size={16}
                      />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password")}
                        className={cn(
                          "pl-11 pr-11 h-12 text-sm rounded-xl border-border bg-background focus:bg-card focus:border-primary/50 transition-all font-medium",
                          errors.password &&
                            "border-red-400 focus:border-red-500 focus:ring-red-500/10",
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <FieldError message={errors.password?.message} />

                    {/* Inline strength rules */}
                    {password.length > 0 && (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1 pl-1">
                        <Rule met={rules.length} label="8+ characters" />
                        <Rule met={rules.upper} label="Uppercase letter" />
                        <Rule met={rules.number} label="Number" />
                      </ul>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                    >
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                        size={16}
                      />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        {...register("confirmPassword")}
                        className={cn(
                          "pl-11 pr-11 h-12 text-sm rounded-xl border-border bg-background focus:bg-card focus:border-primary/50 transition-all font-medium",
                          errors.confirmPassword &&
                            "border-red-400 focus:border-red-500 focus:ring-red-500/10",
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <FieldError message={errors.confirmPassword?.message} />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-current"
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
                        Updating password...
                      </span>
                    ) : (
                      <>
                        Update password
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    ← Back to sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-4">
        <span>© {new Date().getFullYear()} SDE Jobs & Internships.</span>
        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <Link href="/terms" className="hover:text-primary transition-colors">
          Terms
        </Link>
        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
        <Link href="/privacy" className="hover:text-primary transition-colors">
          Privacy
        </Link>
      </footer>
    </div>
  );
}

// ── Page export — wraps inner component in Suspense ────────────────────────
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
