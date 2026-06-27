"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERKS = [
  {
    num: 1,
    text: (
      <>
        Build your <span className="font-semibold text-[#39c8c9]">profile</span>{" "}
        and get discovered
      </>
    ),
  },
  {
    num: 2,
    text: (
      <>
        Browse{" "}
        <span className="font-semibold text-[#39c8c9]">thousands of jobs</span>{" "}
        and internships
      </>
    ),
  },
  {
    num: 3,
    text: (
      <>
        Apply and request{" "}
        <span className="font-semibold text-[#39c8c9]">referrals</span> from
        insiders
      </>
    ),
  },
];

export default function EmailConfirmedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (countdown === 0) {
      router.push("/onboarding");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

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
      </header>

      {/* ── Main card ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex gap-0 items-stretch bg-card rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-border">
          {/* ── Left panel ── */}
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
            <div className="relative z-10 space-y-7">
              <div>
                <h1 className="text-primary-foreground text-[2rem] font-semibold leading-tight tracking-tight">
                  Your journey
                  <br />
                  <span className="text-primary-foreground">starts</span>
                  <br />
                  <span className="text-[#39c8c9]">right now.</span>
                </h1>
                <p className="text-[#39c8c9]/90 text-sm mt-3 leading-relaxed font-normal">
                  Your email is verified. Complete your profile in the next step
                  to start receiving job matches.
                </p>
              </div>

              <ul className="space-y-4">
                {PERKS.map(({ num, text }) => (
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

            {/* Footer */}
            <div className="relative z-10">
              <div className="h-px bg-card/20 mb-5" />
              <p className="text-[10px] text-primary-foreground/40 leading-relaxed font-normal">
                Your profile is private until you choose to make it visible to
                recruiters.
              </p>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 bg-card p-8 lg:p-12 flex flex-col justify-center items-center text-center">
            {/* Mobile brand */}
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

            {/* Animated success icon */}
            <div className="relative flex items-center justify-center mb-7">
              {/* Outer ring — green pulse */}
              <span className="absolute inline-flex h-[100px] w-[100px] animate-ping rounded-full bg-green-400/20 opacity-60" />
              {/* Middle ring */}
              <span className="absolute inline-flex h-[84px] w-[84px] rounded-full bg-green-100 border border-green-200" />
              {/* Icon */}
              <div className="relative w-[100px] h-[100px] rounded-full bg-green-50 border-2 border-green-300 flex items-center justify-center shadow-lg shadow-green-100">
                <CheckCircle2
                  className="w-12 h-12 text-green-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full mb-3 border border-green-200 uppercase tracking-wider">
              <CheckCircle2 size={11} />
              Email verified
            </div>

            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium mb-8 max-w-sm">
              Your email has been confirmed successfully. Now let&apos;s build
              your profile so recruiters can find you.
            </p>

            {/* CTA */}
            <Button
              asChild
              className="w-full max-w-sm h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-4 shadow-lg shadow-primary/20"
            >
              <Link href="/onboarding">
                <Sparkles size={15} />
                Complete my profile
                <ArrowRight size={15} />
              </Link>
            </Button>

            {/* Skip link */}
            <Link
              href="/jobs"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium mb-7"
            >
              Skip for now — browse jobs
            </Link>

            {/* Auto redirect notice */}
            <div className="w-full max-w-sm bg-muted/50 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black text-sm">
                  {countdown}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Redirecting to onboarding in{" "}
                <span className="font-semibold text-foreground">
                  {countdown} second{countdown !== 1 ? "s" : ""}
                </span>{" "}
                automatically
              </p>
            </div>
          </div>
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
