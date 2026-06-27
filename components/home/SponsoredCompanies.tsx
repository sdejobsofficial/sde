"use client";
import { useState } from "react";

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

const filters = [
  "All",
  "IT Services",
  "Technology",
  "Healthcare & Life Sciences",
  "Manufacturing & Production",
  "BFSI",
  "BPM",
  "Retail & Consumer",
  "Logistics",
];

type Company = {
  name: string;
  logo: string;
  tags: string[];
  cats: string[];
};

const companies: Company[] = [
  {
    name: "Adidas",
    logo: "adidas",
    tags: ["Retail & Consumer", "Technology", "Foreign MNC"],
    cats: ["Technology", "Retail & Consumer"],
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
    tags: ["Retail & Consumer", "Manufacturing & Production", "Foreign MNC"],
    cats: ["Retail & Consumer", "Manufacturing & Production"],
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
    tags: ["Manufacturing & Production", "Automotive", "Fortune 500"],
    cats: ["Manufacturing & Production"],
  },
  {
    name: "ASUS",
    logo: "asus",
    tags: ["Technology", "Manufacturing & Production", "Consumer Electronics"],
    cats: ["Manufacturing & Production", "Technology"],
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
    tags: ["Retail & Consumer", "Manufacturing & Production", "Fortune 500"],
    cats: ["Retail & Consumer", "Manufacturing & Production"],
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
    cats: ["BFSI", "Retail & Consumer"],
  },
  {
    name: "Telekom",
    logo: "telekom",
    tags: ["Technology", "Telecom", "Foreign MNC"],
    cats: ["Technology", "Manufacturing & Production"],
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
    cats: ["Retail & Consumer", "Manufacturing & Production"],
  },
  {
    name: "TRD",
    logo: "trd",
    tags: ["Manufacturing & Production", "Automotive"],
    cats: ["Manufacturing & Production"],
  },
];

const BrandLogo = ({ logo, name }: { logo: string; name: string }) => (
  <img
    src={LOGOS[logo]}
    alt={name}
    width={32}
    height={32}
    style={{ objectFit: "contain" }}
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = "none";
    }}
  />
);

export default function SponsoredCompanies() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? companies
      : companies.filter((c) => c.cats.includes(activeFilter));

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium text-center text-foreground mb-4">
          Sponsored companies
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((c) => (
            <div
              key={c.name}
              className="border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer bg-card shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-border bg-card p-1 overflow-hidden shadow-sm">
                <BrandLogo logo={c.logo} name={c.name} />
              </div>
              <h3 className="font-semibold text-foreground mb-3">{c.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No companies found for this category.
          </p>
        )}
      </div>
    </section>
  );
}
