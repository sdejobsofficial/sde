"use client";
import Link from "next/link";
import { useState } from "react";

// ─── Brand Logo URLs ──────────────────────────────────────────────────────────
const LOGOS: Record<string, string> = {
  adidas: "https://cdn.worldvectorlogo.com/logos/adidas.svg",
  nvidia: "https://cdn.worldvectorlogo.com/logos/nvidia-7.svg",
  dhl: "https://cdn.worldvectorlogo.com/logos/dhl-1.svg",
  puma: "https://cdn.worldvectorlogo.com/logos/puma-logo.svg",
  shopee: "https://cdn.worldvectorlogo.com/logos/shopee-1.svg",
  shopify: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
  sega: "https://cdn.worldvectorlogo.com/logos/sega-logo.svg",
  zillow: "https://cdn.worldvectorlogo.com/logos/zillow-1.svg",
  honda: "https://cdn.worldvectorlogo.com/logos/honda-9.svg",
  calvinKlein: "https://cdn.worldvectorlogo.com/logos/calvin-klein-1.svg",
  telekom: "https://cdn.worldvectorlogo.com/logos/telekom.svg",
  claude: "https://cdn.worldvectorlogo.com/logos/claude-logo.svg",
  asus: "https://cdn.worldvectorlogo.com/logos/asus-4.svg",
  uber: "https://cdn.worldvectorlogo.com/logos/uber-15.svg",
  trd: "https://cdn.worldvectorlogo.com/logos/trd.svg",
  cocaCola: "https://cdn.worldvectorlogo.com/logos/coca-cola-2021.svg",
  substack: "https://cdn.worldvectorlogo.com/logos/substack-1.svg",
};

// ─── Company Type Cards ───────────────────────────────────────────────────────
const companyTypes = [
  {
    type: "MNCs",
    count: "2.3K+ are actively hiring",
    companies: [
      { name: "Nvidia", logo: "nvidia" },
      { name: "DHL", logo: "dhl" },
      { name: "Honda", logo: "honda" },
      { name: "Telekom", logo: "telekom" },
    ],
  },
  {
    type: "Internet",
    count: "250 are actively hiring",
    companies: [
      { name: "Shopify", logo: "shopify" },
      { name: "Shopee", logo: "shopee" },
      { name: "Uber", logo: "uber" },
      { name: "Substack", logo: "substack" },
    ],
  },
  {
    type: "Manufacturing",
    count: "1.2K+ are actively hiring",
    companies: [
      { name: "ASUS", logo: "asus" },
      { name: "Honda", logo: "honda" },
      { name: "Puma", logo: "puma" },
      { name: "Coca-Cola", logo: "cocaCola" },
    ],
  },
  {
    type: "Fortune 500",
    count: "119 are actively hiring",
    companies: [
      { name: "Coca-Cola", logo: "cocaCola" },
      { name: "Nvidia", logo: "nvidia" },
      { name: "Adidas", logo: "adidas" },
      { name: "DHL", logo: "dhl" },
    ],
  },
  {
    type: "Product",
    count: "1.3K+ are actively hiring",
    companies: [
      { name: "Shopify", logo: "shopify" },
      { name: "Adidas", logo: "adidas" },
      { name: "Sega", logo: "sega" },
      { name: "Zillow", logo: "zillow" },
    ],
  },
];

// ─── Featured Companies ───────────────────────────────────────────────────────
const featuredCompanies = [
  {
    name: "Nvidia",
    desc: "AI chips and GPU computing leader.",
    logo: "nvidia",
  },
  {
    name: "Shopify",
    desc: "Leading e-commerce platform for merchants.",
    logo: "shopify",
  },
  {
    name: "Coca-Cola",
    desc: "Global beverage and consumer brand giant.",
    logo: "cocaCola",
  },
  {
    name: "Adidas",
    desc: "Sportswear and lifestyle brand worldwide.",
    logo: "adidas",
  },
];

// ─── Sponsored Companies ──────────────────────────────────────────────────────
type SponsoredCompany = {
  name: string;
  logo: string;
  tags: string[];
  cats: string[];
};

const sponsoredCompanies: SponsoredCompany[] = [
  {
    name: "Adidas",
    logo: "adidas",
    tags: ["Retail & Consumer", "Technology", "Foreign MNC"],
    cats: ["Technology", "Retail"],
  },
  {
    name: "Nvidia",
    logo: "nvidia",
    tags: ["Technology", "AI & Semiconductors", "Fortune 500"],
    cats: ["Technology"],
  },
  {
    name: "DHL",
    logo: "dhl",
    tags: ["Logistics", "Foreign MNC", "B2B"],
    cats: ["Logistics"],
  },
  {
    name: "Puma",
    logo: "puma",
    tags: ["Retail & Consumer", "Manufacturing", "Foreign MNC"],
    cats: ["Retail", "Manufacturing"],
  },
  {
    name: "Shopee",
    logo: "shopee",
    tags: ["IT Services", "E-commerce", "Technology"],
    cats: ["IT Services", "Technology"],
  },
  {
    name: "Shopify",
    logo: "shopify",
    tags: ["Technology", "SaaS", "E-commerce"],
    cats: ["IT Services", "Technology"],
  },
  {
    name: "Honda",
    logo: "honda",
    tags: ["Manufacturing", "Automotive", "Fortune 500"],
    cats: ["Manufacturing"],
  },
  {
    name: "ASUS",
    logo: "asus",
    tags: ["Technology", "Manufacturing", "Consumer Electronics"],
    cats: ["Manufacturing", "Technology"],
  },
  {
    name: "Uber",
    logo: "uber",
    tags: ["Technology", "Mobility", "Foreign MNC"],
    cats: ["Technology"],
  },
  {
    name: "Coca-Cola",
    logo: "cocaCola",
    tags: ["Retail & Consumer", "Manufacturing", "Fortune 500"],
    cats: ["Retail", "Manufacturing"],
  },
  {
    name: "Substack",
    logo: "substack",
    tags: ["Technology", "Media", "Startup"],
    cats: ["IT Services", "Technology"],
  },
  {
    name: "Sega",
    logo: "sega",
    tags: ["Technology", "Gaming", "Entertainment"],
    cats: ["Technology"],
  },
  {
    name: "Zillow",
    logo: "zillow",
    tags: ["BFSI", "PropTech", "Technology"],
    cats: ["BFSI", "Retail"],
  },
  {
    name: "Telekom",
    logo: "telekom",
    tags: ["Technology", "Telecom", "Foreign MNC"],
    cats: ["Technology", "Manufacturing"],
  },
  {
    name: "Anthropic",
    logo: "claude",
    tags: ["Technology", "AI", "Startup"],
    cats: ["Technology"],
  },
  {
    name: "Calvin Klein",
    logo: "calvinKlein",
    tags: ["Retail & Consumer", "Fashion", "Foreign MNC"],
    cats: ["Retail", "Manufacturing"],
  },
  {
    name: "TRD",
    logo: "trd",
    tags: ["Manufacturing", "Automotive"],
    cats: ["Manufacturing"],
  },
];

// ─── Filter Options ───────────────────────────────────────────────────────────
const filters = [
  "All",
  "IT Services",
  "Technology",
  "Healthcare & Life Sciences",
  "Manufacturing",
  "BFSI",
  "Retail",
  "Logistics",
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const BrandLogo = ({
  logo,
  name,
  size = 32,
}: {
  logo: string;
  name: string;
  size?: number;
}) => (
  <img
    src={LOGOS[logo]}
    alt={name}
    width={size}
    height={size}
    style={{ objectFit: "contain" }}
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = "none";
    }}
  />
);

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TopCompaniesAndSponsored() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredSponsored =
    activeFilter === "All"
      ? sponsoredCompanies
      : sponsoredCompanies.filter((c) => c.cats.includes(activeFilter));

  return (
    <>
      {/* ── Top Companies ── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">
              Top companies hiring now
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Explore opportunities at world-class organizations actively looking for talent.
            </p>
          </div>

          {/* Category cards */}
          <div
            className="flex gap-6 overflow-x-auto pb-8 mb-20 scroll-smooth px-2"
            style={{ scrollbarWidth: "none" }}
          >
            {companyTypes.map((ct) => (
              <div
                key={ct.type}
                className="min-w-[280px] border border-border rounded-[2rem] p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer bg-background flex-shrink-0 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary font-bold uppercase tracking-widest border border-primary/10">
                    {ct.type}
                  </span>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">{ct.count}</p>
                <div className="flex -space-x-3 mt-auto">
                  {ct.companies.map((company, i) => (
                    <div
                      key={i}
                      title={company.name}
                      className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-md border-4 border-background bg-muted/50 p-1.5 transition-transform group-hover:-translate-y-1"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <BrandLogo
                        logo={company.logo}
                        name={company.name}
                        size={32}
                      />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border-4 border-background text-[10px] font-bold text-muted-foreground">
                    +10
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured companies */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">
              Featured companies
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Get direct referrals and priority visibility at these top-tier firms.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredCompanies.map((company) => (
              <div
                key={company.name}
                className="border border-border rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-background text-center flex flex-col group shadow-sm"
              >
                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 mx-auto overflow-hidden shadow-lg border-4 border-slate-50 bg-card p-3 group-hover:scale-110 transition-transform duration-500">
                  <BrandLogo
                    logo={company.logo}
                    name={company.name}
                    size={56}
                  />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2 tracking-tight group-hover:text-primary transition-colors">
                  {company.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-medium">
                  {company.desc}
                </p>
                <div className="mt-auto">
                  <button className="w-full text-primary-foreground text-xs font-bold uppercase tracking-widest bg-primary px-6 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg active:scale-95">
                    View open jobs
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Link href="/companies">
              <button className="flex items-center gap-2 group text-foreground font-semibold text-xs uppercase tracking-widest border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
                Explore all companies
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sponsored Companies ── */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="text-3xl font-medium text-foreground tracking-tight mb-4">
                Sponsored companies
              </h2>
              <div className="flex flex-wrap gap-2">
                {filters.slice(0, 5).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all border ${activeFilter === f
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:bg-primary/5"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Company grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSponsored.map((c) => (
              <div
                key={c.name}
                className="group border border-border/60 rounded-3xl p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-background/50 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-border/40 bg-card p-2 overflow-hidden shadow-md group-hover:shadow-primary/10 transition-all">
                  <BrandLogo logo={c.logo} name={c.name} size={40} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-4 tracking-tight group-hover:text-primary transition-colors">{c.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {c.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-muted/50 text-slate-500 font-bold px-3 py-1 rounded-lg uppercase tracking-tight"
                    >
                      {tag}
                    </span>
                  ))}
                  {c.tags.length > 2 && (
                    <span className="text-[10px] text-muted-foreground/40 font-bold self-center">+1</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSponsored.length === 0 && (
            <div className="text-center py-24 bg-muted/50 rounded-[3rem] border-2 border-dashed border-border/50">
              <p className="text-muted-foreground font-bold text-lg">
                No sponsored companies in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
