"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Sparkles,
  Heart,
  Laptop,
  GraduationCap,
  Clock,
  Coffee,
  Users,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Content ────────────────────────────────────────────────────────────────

const VALUES = [
  {
    title: "We use our own product",
    body: "Every hire here goes through the same job search most people dread — so when something about the experience is broken, we feel it first.",
  },
  {
    title: "Small team, real ownership",
    body: "No layers between you and the decision. If you ship it, you own it — from the first line of code to the support ticket six months later.",
  },
  {
    title: "Plain, direct communication",
    body: "We write things down instead of meeting about them. Status updates happen in docs, not standups that could've been a Slack message.",
  },
];

const BENEFITS = [
  { icon: Laptop, label: "Remote-first", desc: "Work from anywhere in India" },
  { icon: Clock, label: "Flexible hours", desc: "Ship on your own schedule" },
  { icon: Heart, label: "Health cover", desc: "For you and your family" },
  {
    icon: GraduationCap,
    label: "Learning budget",
    desc: "Courses, books, conferences",
  },
  {
    icon: Coffee,
    label: "No meeting Fridays",
    desc: "A full day to just build",
  },
  {
    icon: Users,
    label: "Small, sharp team",
    desc: "Everyone you'll work with, in one room",
  },
];

const OPEN_ROLES = [
  {
    title: "Sales Executive",
    team: "Sales",
    location: "Remote (India)",
    type: "Full-time",
  },
  {
    title: "Content Creator",
    team: "Content",
    location: "Remote (India)",
    type: "Full-time",
  },
  {
    title: "Marketing Specialist",
    team: "Marketing",
    location: "Bengaluru / Remote",
    type: "Full-time",
  },
  {
    title: "Campus Partnerships Lead",
    team: "Operations",
    location: "Remote (India)",
    type: "Contract",
  },
];

const STEPS = [
  { label: "Apply", desc: "Send your resume — no cover letter required" },
  {
    label: "Conversation",
    desc: "30 minutes with the hiring lead, no trick questions",
  },
  {
    label: "Real work",
    desc: "A short, paid task close to what you'd actually do here",
  },
  { label: "Decision", desc: "We get back to you either way, within a week" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const [openRole, setOpenRole] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-foreground font-sans">
      {/* ── Header ── */}
      <header className="w-full px-6 lg:px-10 py-5 flex items-center justify-between border-b border-border/60">
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
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
        >
          Looking for a job elsewhere?
          <ArrowRight size={13} />
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#121d2b] via-[#166164] to-[#36b9b7] px-6 py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#39c8c9]/10" />
        <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-[#39c8c9]/10" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm uppercase tracking-wider">
            <Sparkles size={12} className="text-[#39c8c9]" />
            We're hiring
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-[1.1] tracking-tight mb-5">
            Help us fix the part
            <br />
            of job hunting
            <br />
            <span className="text-[#39c8c9]">everyone hates.</span>
          </h1>
          <p className="text-white/70 text-base max-w-lg mx-auto leading-relaxed">
            We build the platform thousands of job seekers and recruiters use
            every day. Most of us found this job the same painful way you're
            looking for one now — which is exactly why we care about getting it
            right.
          </p>
          <div className="mt-8">
            <a
              href="#open-roles"
              className="inline-flex items-center gap-2 h-12 px-7 bg-white text-[#121d2b] rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-xl shadow-black/10"
            >
              See open roles
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-border/60 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-center">
          {[
            { value: "14", label: "People, total" },
            { value: "100%", label: "Remote-friendly" },
            { value: "4", label: "Open roles" },
            { value: "1 week", label: "To hear back" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {value}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            How we work
          </p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Three things that won't change as we grow
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {VALUES.map(({ title, body }, i) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-white border-y border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
              What you get
            </p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              The basics, done properly
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3.5 p-4 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hiring process ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            The process
          </p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Four steps, no surprises
          </h2>
        </div>

        <div className="grid sm:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {STEPS.map(({ label, desc }, i) => (
            <div key={label} className="bg-white p-6 relative">
              <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest mb-3">
                Step {i + 1}
              </p>
              <p className="text-sm font-bold text-foreground mb-1.5">
                {label}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Open roles ── */}
      <section id="open-roles" className="bg-white border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Open roles
            </p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Four seats open right now
            </h2>
          </div>

          <div className="space-y-3">
            {OPEN_ROLES.map((role, i) => {
              const isOpen = openRole === i;
              return (
                <div
                  key={role.title}
                  className={cn(
                    "rounded-2xl border transition-all overflow-hidden",
                    isOpen
                      ? "border-primary/30 shadow-md shadow-primary/5"
                      : "border-border hover:border-primary/20",
                  )}
                >
                  <button
                    onClick={() => setOpenRole(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {role.team.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">
                          {role.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-medium">
                            {role.team}
                          </span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <MapPin size={10} />
                            {role.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex-shrink-0">
                      {role.type}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
                        We're looking for someone to own this end-to-end —
                        details on scope, what a strong first 90 days looks
                        like, and compensation are in the full listing.
                      </p>
                      <a
                        href={`mailto:careers@sdejobs.in?subject=Application: ${role.title}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                      >
                        Apply for this role
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Don't see your role ── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          <Mail size={19} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-3">
          Don't see the right role?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-md mx-auto">
          We're a small team and we don't always have a listing open for where
          you'd fit best. Tell us what you're good at — we read every email
          ourselves.
        </p>
        <a
          href="mailto:sdejobsofficial@gmail.com?subject=General application"
          className="inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Email sdejobsofficial@gmail.com
          <ArrowRight size={14} />
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-4 border-t border-border/60">
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
