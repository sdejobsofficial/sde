import { CompanySize } from "@/models/userModel";

export const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Software / SaaS",
  "E-Commerce",
  "FinTech",
  "EdTech",
  "HealthTech",
  "Consulting",
  "Manufacturing",
  "Banking & Finance",
  "Media & Entertainment",
  "Logistics",
  "Retail",
  "Real Estate",
  "Telecom",
  "Government / PSU",
  "Artificial Intelligence / ML",
  "Web3 / Crypto",
  "Cybersecurity",
  "Gaming",
  "PropTech",
  "AgriTech",
  "CleanTech / Energy",
  "Healthcare & Life Sciences",
  "Automotive / Mobility",
  "Aerospace & Defense",
  "Other",
];

export const SIZE_OPTIONS: {
  label: string;
  sub: string;
  value: CompanySize;
}[] = [
  { label: "1–10", sub: "Micro", value: CompanySize.Micro },
  { label: "11–50", sub: "Small", value: CompanySize.Small },
  { label: "51–200", sub: "Medium", value: CompanySize.Medium },
  { label: "201–500", sub: "Large", value: CompanySize.Large },
  { label: "501–1000", sub: "X-Large", value: CompanySize.XLarge },
  { label: "1000+", sub: "Enterprise", value: CompanySize.Enterprise },
];

export const PAGE_SIZE = 12;

export function sizeLabel(size?: CompanySize) {
  return SIZE_OPTIONS.find((s) => s.value === size)?.label;
}
