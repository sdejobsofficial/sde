"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Phone,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useRecruiterEmailRegister,
  useRecruiterEmailLogin,
  useRecruiterGoogleLogin,
} from "@/hooks/useUser";
import { useState } from "react";
import { FieldError, GoogleIcon } from "@/components/common/FormComponents";
import {
  FEATURES,
  LoginFormValues,
  loginSchema,
  RegisterFormValues,
  registerSchema,
  STATS,
} from "@/constants/company/CAuthConstants";
import PhoneOtpModal from "@/components/common/PhoneOtpModal.tsx";
import Image from "next/image";

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { mutateAsync: register, isPending: registering } =
    useRecruiterEmailRegister();
  const { mutateAsync: googleAuth, isPending: googleLoading } =
    useRecruiterGoogleLogin();
  const loading = registering || googleLoading;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const {
    register: rhf,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { companyName: "", email: "", password: "", confirmPassword: "", phone: "" },
    mode: "onTouched",
  });

  const phoneValue = useWatch({ control, name: "phone" });
  const isPhoneComplete = /^\d{10}$/.test(phoneValue ?? "");

  const onSubmit = async (values: RegisterFormValues) => {
    await register({
      companyName: values.companyName,
      email: values.email,
      password: values.password,
      phone: values.phone,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Create your company account
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Start hiring — complete your company profile after sign up.
        </p>
      </div>

      {/* Google */}
      {/* <Button
        type="button"
        variant="outline"
        onClick={() => googleAuth()}
        disabled={loading}
        className="w-full h-10 rounded-xl border-gray-200 bg-card hover:bg-muted/50 text-foreground/80 font-medium text-sm gap-2.5 transition-all"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-muted" />
        <span className="text-xs text-muted-foreground/80">or with email</span>
        <div className="flex-1 h-px bg-muted" />
      </div> */}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Company Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="reg-company"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Company Name
          </Label>
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              id="reg-company"
              type="text"
              placeholder="Your Company Name"
              {...rhf("companyName")}
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.companyName && "border-red-400 focus:border-red-400",
              )}
            />
          </div>
          <FieldError message={errors.companyName?.message} />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="reg-email"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Work email
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              {...rhf("email")}
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.email && "border-red-400 focus:border-red-400",
              )}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label
            htmlFor="reg-phone"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Mobile number
          </Label>
          <div className="flex gap-2">
            {/* Country code badge */}
            <div className="h-10 px-3 flex items-center gap-1.5 border border-gray-200 bg-muted/50/80 rounded-xl text-sm text-foreground/80 font-bold flex-shrink-0 select-none">
              <Phone size={13} className="text-muted-foreground/80" />
              +91
            </div>

            {/* Number input */}
            <Input
              id="reg-phone"
              type="tel"
              placeholder="10-digit mobile number"
              {...rhf("phone")}
              maxLength={10}
              disabled={phoneVerified}
              className={cn(
                "h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.phone && "border-red-400 focus:border-red-400",
                phoneVerified &&
                  "border-green-400 bg-green-50/50 text-green-700",
              )}
            />

            {/* Verify / Verified button */}
            {phoneVerified ? (
              <div className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-300 text-green-700 text-xs font-bold flex-shrink-0 select-none">
                <CheckCircle2 size={13} />
                Verified
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={!isPhoneComplete}
                onClick={() => setShowOtpModal(true)}
                className="h-10 px-3 rounded-xl border-primary/40 text-primary font-bold text-xs flex-shrink-0 hover:bg-primary/5 hover:border-primary/60 transition-all disabled:opacity-40"
              >
                Verify
              </Button>
            )}
          </div>

          {errors.phone ? (
            <FieldError message={errors.phone.message} />
          ) : phoneVerified ? (
            <p className="text-[10px] text-green-600 font-medium">
              ✓ Phone number verified
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/80 font-medium">
              Candidates will contact you on this number
            </p>
          )}
        </div>

        {/* OTP Modal */}
        {showOtpModal && isPhoneComplete && (
          <PhoneOtpModal
            phone={phoneValue}
            onVerified={() => setPhoneVerified(true)}
            onClose={() => setShowOtpModal(false)}
          />
        )}

        {/* Password + Confirm row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                size={14}
              />
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...rhf("password")}
                className={cn(
                  "pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                  errors.password && "border-red-400 focus:border-red-400",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="reg-confirm"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Confirm
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
                size={14}
              />
              <Input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                {...rhf("confirmPassword")}
                className={cn(
                  "pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                  errors.confirmPassword &&
                    "border-red-400 focus:border-red-400",
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground transition-colors"
              >
                {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>

        {/* Features checklist */}
        <div className="bg-primary/10 rounded-xl p-3.5 border border-primary/20 space-y-2">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2">
              <CheckCircle
                className="text-primary/100 flex-shrink-0 mt-0.5"
                size={13}
              />
              <p className="text-xs text-muted-foreground leading-snug">{f}</p>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || !phoneVerified}
          className="w-full h-11 bg-primary hover:bg-primary/90 active:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
              Creating account...
            </span>
          ) : (
            <>
              Create company account
              <ArrowRight size={15} />
            </>
          )}
        </Button>

        {!phoneVerified && (
          <p className="text-[11px] text-amber-600 font-medium text-center flex items-center justify-center gap-1.5 -mt-1">
            <Phone size={11} />
            Please verify your mobile number to continue
          </p>
        )}
      </form>

      <p className="text-center text-xs text-muted-foreground/80 leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="text-primary/100 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary/100 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary font-semibold hover:text-primary/90 hover:underline transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { mutateAsync: login, isPending: loginLoading } =
    useRecruiterEmailLogin();
  const { mutateAsync: googleAuth, isPending: googleLoading } =
    useRecruiterGoogleLogin();
  const loading = loginLoading || googleLoading;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      // Error is handled by the hook's onError toast
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Sign in to your company account
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your job postings, applicants, and referrals.
        </p>
      </div>

      {/* Google */}
      {/* <Button
        type="button"
        variant="outline"
        onClick={() => googleAuth()}
        disabled={loading}
        className="w-full h-10 rounded-xl border-gray-200 bg-card hover:bg-muted/50 text-foreground/80 font-medium text-sm gap-2.5 transition-all"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-muted" />
        <span className="text-xs text-muted-foreground/80">or with email</span>
        <div className="flex-1 h-px bg-muted" />
      </div> */}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="login-email"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Work email
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              className={cn(
                "pl-9 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.email && "border-red-400 focus:border-red-400",
              )}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="login-password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Password
            </Label>
            {/* <Link
              href="/forgot-password"
              className="text-xs text-primary/100 hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </Link> */}
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
              size={14}
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className={cn(
                "pl-9 pr-10 h-10 text-sm rounded-xl border-gray-200 bg-muted/50/80 focus:bg-card transition-all",
                errors.password && "border-red-400 focus:border-red-400",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 active:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
              Signing in...
            </span>
          ) : (
            <>
              Sign in
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have a company account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary font-semibold hover:text-primary/90 hover:underline transition-colors"
        >
          Create one free
        </button>
      </p>
    </div>
  );
}

export default function CompanyAuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen w-full bg-muted/50 flex flex-col">
      {/* ── Header ── */}
      <header className="w-full px-6 lg:px-10 py-5 hidden md:flex items-center justify-between bg-card border-b border-gray-100">
        <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2.5">
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
          {/* Company badge */}
          <span className="ml-1 text-xs font-medium text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
            For Companies
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground/80 flex items-center gap-1.5 transition-colors"
        >
          Looking for a job?
          <ChevronRight size={14} />
        </Link>
      </header>

      {/* ── Stats bar ── */}
      <div className="w-full bg-card border-b hidden md:flex border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-10">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="text-primary/100" size={13} />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">{value}</span>
                <span className="text-xs text-muted-foreground/80 ml-1.5">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-card rounded-2xl p-1 mb-4 shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                tab === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                tab === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              Create account
            </button>
          </div>

          {/* Card */}
          <div className="bg-card rounded-3xl shadow-lg shadow-sm border border-gray-100 p-8">
            {tab === "login" ? (
              <LoginForm onSwitch={() => setTab("register")} />
            ) : (
              <RegisterForm onSwitch={() => setTab("login")} />
            )}
          </div>

          {/* Job seeker nudge */}
          <div className="mt-5 p-4 rounded-2xl bg-card border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground/80">
                Looking for a job instead?
              </p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Create a job seeker profile for free
              </p>
            </div>
            <Link href="/register">
              <Button
                variant="outline"
                className="h-8 px-4 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
              >
                Job seeker →
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-5 text-xs text-muted-foreground/80 border-t border-gray-100 bg-card">
        © {new Date().getFullYear()} SDE Jobs & Internships. All rights reserved.
      </footer>
    </div>
  );
}