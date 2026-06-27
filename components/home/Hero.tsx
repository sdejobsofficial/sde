"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { icon: "🏠", label: "Remote" },
  { icon: "🏢", label: "MNC" },
  { icon: "📊", label: "Data Science" },
  { icon: "🎓", label: "Fresher" },
  { icon: "💼", label: "Sales" },
  { icon: "⚙️", label: "Engineering" },
  { icon: "💻", label: "Software Dev" },
  { icon: "🚚", label: "Supply Chain" },
  { icon: "📋", label: "Internship" },
  { icon: "📌", label: "Project Mgmt" },
  { icon: "📈", label: "Analytics" },
];

export default function Hero() {
  const router = useRouter();
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (skill.trim()) params.set("search", skill.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  const handleCategory = (label: string) => {
    router.push(`/jobs?search=${encodeURIComponent(label)}`);
  };

  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-24 px-4">
      {/* Background ambient glow - more pronounced for premium feel */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-6xl bg-[#166164]/10 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#39c8c9]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-[1.1] tracking-tighter">
          Your next <span className="text-primary bg-clip-text text-transparent bg-linear-to-r from-[#166164] to-[#39c8c9]">SDE career</span> starts here
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-14 max-w-3xl mx-auto font-normal leading-relaxed">
          The ultimate platform for software engineers. Discover 500k+ opportunities,
          direct referrals, and priority access to top-tier tech companies.
        </p>

        {/* Search Bar - More premium floating look */}
        <form
          onSubmit={handleSearch}
          className="bg-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-stretch md:items-center gap-0 overflow-hidden border border-border mb-12 transition-all hover:shadow-[0_20px_60px_rgba(22,97,100,0.12)] hover:border-primary/30 max-w-4xl mx-auto p-2"
        >
          <div className="flex items-center gap-4 px-6 py-4 flex-1">
            <span className="text-2xl grayscale group-focus-within:grayscale-0 transition-all">🔍</span>
            <input
              type="text"
              placeholder="Skills, designations, companies"
              className="bg-transparent outline-none text-base text-foreground w-full placeholder-muted-foreground/50 font-normal"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
          </div>
          <div className="w-[1px] h-10 bg-border hidden md:block" />
          <div className="flex items-center gap-4 px-6 py-4 flex-1">
            <span className="text-2xl">📍</span>
            <input
              type="text"
              placeholder="Location"
              className="bg-transparent outline-none text-base text-foreground w-full placeholder-muted-foreground/50 font-normal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-12 py-5 rounded-2xl text-base font-semibold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl active:scale-95"
          >
            Find Jobs
          </button>
        </form>

        {/* Category Pills - Clean & modern */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategory(cat.label)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-card border border-border rounded-2xl text-[13px] text-foreground font-semibold hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
