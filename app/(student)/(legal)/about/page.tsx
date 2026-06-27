import Link from "next/link";
import {
  Users,
  Target,
  ArrowRight,
  Building2,
  TrendingUp,
} from "lucide-react";

const STATS = [
  { value: "5L+", label: "Jobs listed" },
  { value: "2L+", label: "Registered companies" },
  { value: "10L+", label: "Job seekers" },
  { value: "98%", label: "Placement satisfaction" },
];

const VALUES = [
  {
    icon: Target,
    title: "Transparency first",
    desc: "Every job listing shows salary ranges, honest company info, and real applicant counts — no bait-and-switch.",
  },
  {
    icon: Users,
    title: "Built for India's tech talent",
    desc: "We focus exclusively on software, data, and product roles — not a generalist board where your résumé gets lost.",
  },
  {
    icon: TrendingUp,
    title: "Referrals that actually work",
    desc: "Our referral network connects candidates with insiders at top companies, dramatically improving interview rates.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-card">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 text-primary-foreground px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold bg-card/15 border border-white/20 px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            Our story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            We&apos;re fixing how India&apos;s SDE talent finds work
          </h1>
          <p className="text-violet-100 text-lg leading-relaxed max-w-xl mx-auto">
            SDE Jobs & Internships was built because great engineers deserve
            better than spam inboxes, ghost rejections, and opaque hiring
            processes.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-violet-600">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wide">
          Mission
        </span>
        <h2 className="text-2xl font-bold text-foreground mt-2 mb-4">
          Cut the noise between talent and opportunity
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The Indian tech hiring ecosystem is broken in predictable ways: job
          boards cluttered with outdated postings, résumés disappearing into ATS
          black holes, and referral networks that only work if you went to IIT.
          We built this platform to fix all three — with verified listings,
          structured referral pathways, and company profiles that show you what
          working somewhere is actually like.
        </p>
      </section>

      {/* Values */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold text-violet-500 uppercase tracking-wide">
            What we stand for
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-2 mb-8">
            Built on three beliefs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-violet-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-violet-50 border-t border-violet-100 px-4 py-14 text-center">
        <h2 className="text-xl font-bold text-foreground mb-3">
          Ready to find your next role?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Browse 5 lakh+ SDE jobs and internships across India.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/jobs"
            className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-primary-foreground text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            Browse jobs <ArrowRight size={14} />
          </Link>
          <Link
            href="/recruiter/login"
            className="h-10 px-6 border border-violet-200 text-violet-600 hover:bg-violet-100 text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Building2 size={14} /> Hire talent
          </Link>
        </div>
      </section>
    </div>
  );
}
