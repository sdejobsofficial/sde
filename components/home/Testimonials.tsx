"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "SDE-1 @ Amazon",
    avatar: "AS",
    avatarColor: "from-orange-400 to-orange-600",
    rating: 5,
    text: "SDE Jobs & Internships helped me land my dream role at Amazon! The job listings are curated and relevant — no noise, just real opportunities. Found the perfect opening, applied directly, and got my offer in 3 weeks.",
    tag: "Full-time Offer",
  },
  {
    id: 2,
    name: "Priya Nair",
    role: "Software Intern @ Google",
    avatar: "PN",
    avatarColor: "from-blue-400 to-blue-600",
    rating: 5,
    text: "I was struggling to find genuine internship listings until I found this platform. The referral system is a game-changer — I got referred internally by someone I connected with here. Couldn't have done it without this platform!",
    tag: "Internship",
  },
  {
    id: 3,
    name: "Rohit Verma",
    role: "Backend Engineer @ Flipkart",
    avatar: "RV",
    avatarColor: "from-yellow-500 to-yellow-600",
    rating: 5,
    text: "The platform made my job search structured and stress-free. I could filter by skills, work mode, and salary range — which saved me so much time. Got 4 interview calls in my first week of applying through here.",
    tag: "Full-time Offer",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    role: "Frontend Dev @ Razorpay",
    avatar: "SG",
    avatarColor: "from-emerald-400 to-emerald-600",
    rating: 5,
    text: "As a fresher, I had no idea where to start. SDE Jobs & Internships had a perfect section for entry-level roles and I could see exactly what skills each company wanted. Got my first offer within a month!",
    tag: "Fresher Role",
  },
  {
    id: 5,
    name: "Karan Mehta",
    role: "ML Engineer @ Swiggy",
    avatar: "KM",
    avatarColor: "from-purple-400 to-purple-600",
    rating: 5,
    text: "What sets this platform apart is the quality of job postings. Every listing had clear salary ranges, tech stacks, and deadlines. I landed a role that perfectly matched my ML background. Highly recommend!",
    tag: "Full-time Offer",
  },
];

const AUTO_SLIDE_MS = 4000;

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goTo = useCallback(
    (index: number, dir: "left" | "right" = "right") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 300);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo(current === TESTIMONIALS.length - 1 ? 0 : current + 1, "right");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current === 0 ? TESTIMONIALS.length - 1 : current - 1, "left");
  }, [current, goTo]);

  // Auto-slide
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const t = TESTIMONIALS[current];

  return (
    <section
      className="py-20 px-4 bg-muted/30 relative overflow-hidden"
      style={{ fontFamily: "var(--font-nunito), sans-serif" }}
    >
      {/* Soft background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-5">
            ❤️ Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            How{" "}
            <span className="text-primary">SDE Jobs &amp; Internships</span>
            <br className="hidden sm:block" /> helps job seekers!
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Real stories from students and developers who discovered
            opportunities, aced interviews, and landed their dream roles.
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-card border border-border rounded-3xl shadow-lg shadow-black/5 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slide area */}
          <div
            className={cn(
              "p-8 md:p-10 transition-all duration-300",
              animating && direction === "right" && "opacity-0 translate-x-4",
              animating && direction === "left" && "opacity-0 -translate-x-4",
              !animating && "opacity-100 translate-x-0"
            )}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-6 gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                <Quote size={16} className="text-primary-foreground fill-primary-foreground" />
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                  {t.tag}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-foreground/85 text-base md:text-lg leading-relaxed font-semibold mb-8">
              &ldquo;{t.text}&rdquo;
            </blockquote>

            {/* Divider */}
            <div className="border-t border-border mb-6" />

            {/* Author + nav */}
            <div className="flex items-center justify-between gap-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0",
                    t.avatarColor
                  )}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm leading-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={prev}
                  className="w-8 h-8 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-1.5 px-1">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i, i > current ? "right" : "left")}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        i === current
                          ? "w-5 h-2 bg-primary"
                          : "w-2 h-2 bg-border hover:bg-primary/40"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="w-8 h-8 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                  aria-label="Next"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-border relative overflow-hidden">
            <div
              key={`${current}-${paused}`}
              className={cn(
                "absolute left-0 top-0 h-full bg-primary rounded-full",
                !paused ? "animate-progress-bar" : ""
              )}
              style={{
                width: paused ? `${((current) / TESTIMONIALS.length) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { value: "10,000+", label: "Job seekers helped" },
            { value: "500+", label: "Companies hiring" },
            { value: "4.9 ★", label: "Average rating" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm"
            >
              <p className="text-lg font-extrabold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
