"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResendVerificationEmail } from "@/hooks/useUser";

const STEPS = [
  {
    num: 1,
    text: (
      <>
        <span className="font-semibold text-[#39c8c9]">Check your inbox</span>{" "}
        for an email from us
      </>
    ),
  },
  {
    num: 2,
    text: (
      <>
        <span className="font-semibold text-[#39c8c9]">
          Click the verification link
        </span>{" "}
        inside the email
      </>
    ),
  },
  {
    num: 3,
    text: (
      <>
        <span className="font-semibold text-[#39c8c9]">
          Complete your profile
        </span>{" "}
        and start applying
      </>
    ),
  },
];

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resent, setResent] = useState(false);

  const { mutate: resendEmail, isPending: resending } =
    useResendVerificationEmail();

  const handleResend = () => {
    if (!email || resent) return;
    resendEmail(email, {
      onSuccess: () => setResent(true),
    });
  };

  const gmailUrl = `https://mail.google.com/mail/u/0/#search/verify`;

  return (
    <div className="flex-1 bg-card p-8 lg:p-12 flex flex-col justify-center items-center text-center">
      <div className="flex lg:hidden items-center gap-2 mb-8 self-start">
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

      {/* Envelope icon with pulse */}
      <div className="relative flex items-center justify-center mb-7">
        <span className="absolute inline-flex h-[100px] w-[100px] animate-ping rounded-[28px] bg-primary/10 opacity-40" />
        <div className="relative w-[100px] h-[100px] rounded-[28px] bg-primary/5 border border-primary/20 flex items-center justify-center">
          <Mail className="w-12 h-12 text-primary" strokeWidth={1.25} />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full mb-3 border border-primary/20 uppercase tracking-wider">
        <CheckCircle2 size={11} />
        Account created
      </div>

      <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
        Check your email
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed font-medium mb-8 max-w-sm">
        We&apos;ve sent a verification link to your email address. Click it to
        activate your account and get started.
      </p>

      {email && (
        <div className="w-full max-w-sm bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-3 mb-7 text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Sent to
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5 truncate">
              {email}
            </p>
          </div>
        </div>
      )}

      <Button
        asChild
        className="w-full max-w-sm h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-primary/20"
      >
        <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
          <ArrowUpRight size={16} />
          Open Gmail
        </a>
      </Button>

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={resending || resent || !email}
        className={cn(
          "w-full max-w-sm h-12 rounded-xl font-bold text-sm border-border bg-card hover:bg-muted/50 transition-all flex items-center justify-center gap-2 mb-7",
          resent && "border-green-300 text-green-600 bg-green-50",
        )}
      >
        {resent ? (
          <>
            <CheckCircle2 size={15} className="text-green-500" />
            Email resent!
          </>
        ) : resending ? (
          <>
            <RefreshCw size={15} className="animate-spin" />
            Resending...
          </>
        ) : (
          <>
            <RefreshCw size={15} />
            Resend verification email
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground font-medium">
        Wrong email?{" "}
        <Link
          href="/register"
          className="text-primary font-bold hover:underline transition-all"
        >
          Change email address
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-foreground flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="w-full px-6 lg:px-10 py-5 hidden md:flex items-center justify-between">
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
          Already verified?{" "}
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

            <div className="relative z-10 space-y-7">
              <div>
                <h1 className="text-primary-foreground text-[2rem] font-semibold leading-tight tracking-tight">
                  One step away
                  <br />
                  <span className="text-primary-foreground">from your</span>
                  <br />
                  dream role.
                </h1>
                <p className="text-[#39c8c9]/90 text-sm mt-3 leading-relaxed font-normal">
                  Your account is almost ready. Just verify your email and
                  you&apos;re in.
                </p>
              </div>

              <ul className="space-y-4">
                {STEPS.map(({ num, text }) => (
                  <li key={num} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#39c8c9]/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#39c8c9]/30 backdrop-blur-sm">
                      <span className="text-[#39c8c9] text-xs font-bold">
                        {num}
                      </span>
                    </div>
                    <span className="text-primary-foreground text-sm leading-snug font-normal pt-1">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10">
              <div className="h-px bg-card/20 mb-5" />
              <p className="text-[10px] text-primary-foreground/40 leading-relaxed font-normal">
                The verification link expires in 24 hours. If you don&apos;t
                see the email, check your spam or promotions folder.
              </p>
            </div>
          </div>

          {/* ── Right Panel wrapped in Suspense ── */}
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="animate-spin text-primary" size={24} />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>

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