"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useJobSeekerEmailLogin,
  useJobSeekerGoogleLogin,
} from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FieldError } from "@/components/common/FormComponents";
import {
  LoginFormValues,
  loginSchema,
  HIGHLIGHTS,
} from "@/constants/student/SLoginConstants";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextPath = searchParams.get("next");
  const externalApplyUrl = searchParams.get("externalApply");

  const { mutateAsync: emailLogin, isPending: emailLoading, isSuccess: emailSuccess } =
    useJobSeekerEmailLogin();
  const { mutateAsync: googleLogin, isPending: googleLoading } =
    useJobSeekerGoogleLogin();
  const loading = emailLoading || googleLoading;
  const [showPassword, setShowPassword] = useState(false);

  // After successful login, handle redirect + optional external apply
  useEffect(() => {
    if (emailSuccess) {
      if (externalApplyUrl) {
        window.open(decodeURIComponent(externalApplyUrl), "_blank", "noopener,noreferrer");
      }
      if (nextPath) {
        router.push(decodeURIComponent(nextPath));
      }
    }
  }, [emailSuccess, externalApplyUrl, nextPath, router]);

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
    await emailLogin({
      email: values.email,
      password: values.password,
    });
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-foreground flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="w-full hidden md:flex px-6 lg:px-10 py-5 items-center justify-between">
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
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:text-primary/80 transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </header>

      {/* ── Cards ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex gap-0 items-stretch bg-card rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-border">
          {/* ── Left Card ── */}
          <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-[#121d2b] via-[#166164] to-[#36b9b7] flex-col justify-between p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#39c8c9]/10" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#39c8c9]/10" />
            <div className="absolute top-1/2 right-4 w-28 h-28 rounded-full bg-card/5" />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/icon.png"
                  alt="ReferNest Logo"
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
                  Welcome
                  <br />
                  <span>back.</span>
                </h1>
                <p className="text-[#39c8c9]/90 text-sm mt-3 leading-relaxed font-normal">
                  Your next opportunity is just a login away. Pick up right
                  where you left off.
                </p>
              </div>

              <ul className="space-y-5">
                {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
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
                New to SDE Jobs & Internships?{" "}
                <Link
                  href="/register"
                  className="text-primary-foreground font-bold hover:underline transition-all"
                >
                  Create a free account →
                </Link>
              </p>
            </div>
          </div>

          {/* ── Right Card ── */}
          <div className="flex-1 bg-card p-8 lg:p-12 flex flex-col justify-center">
            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Image
                  src="/icon.png"
                  alt="SDE Jobs & Internships Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              </div>
              <span className="font-bold text-lg text-foreground">
                SDE Jobs & <span className="text-primary">Internships</span>
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full mb-3 border border-primary/20 uppercase tracking-wider">
                <ShieldCheck size={11} />
                Secure sign in
              </div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                Sign in
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5 font-medium">
                Good to have you back — let&apos;s find your next role.
              </p>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl border-border bg-card hover:bg-muted/50 hover:border-primary/30 text-foreground font-bold text-sm gap-3 transition-all mb-6 shadow-sm"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-2">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ── Form ── */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                    size={16}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    {...register("email")}
                    className={cn(
                      "pl-11 h-12 text-sm rounded-xl border-border bg-background focus:bg-card focus:border-primary/50 transition-all font-medium",
                      errors.email &&
                        "border-red-400 focus:border-red-500 focus:ring-red-500/10",
                    )}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] text-primary font-bold hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                    size={16}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
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
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-bold hover:underline transition-all"
              >
                Create one free
              </Link>
            </p>
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
