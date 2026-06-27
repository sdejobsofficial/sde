import { z } from "zod";
import { CompanySize } from "@/models/userModel";
import { Building2, Layers, LinkIcon } from "lucide-react";

export const STEPS = [
  {
    id: 0,
    key: "info",
    label: "Basic info",
    icon: Building2,
    desc: "Company name, location & about",
  },
  {
    id: 1,
    key: "details",
    label: "Details",
    icon: Layers,
    desc: "Industry, size & hiring types",
  },
  {
    id: 2,
    key: "brand",
    label: "Brand & links",
    icon: LinkIcon,
    desc: "Logo & social presence",
  },
] as const;

export const INDUSTRIES = [
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

export const COMPANY_SIZES: {
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

export const HIRING_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Remote",
  "Hybrid",
];

export const SOCIAL_FIELDS = [
  {
    name: "linkedin" as const,
    label: "LinkedIn",
    icon: "in",
    color: "bg-[#0077B5]",
    placeholder: "https://linkedin.com/company/acme",
  },
  {
    name: "twitter" as const,
    label: "Twitter / X",
    icon: "𝕏",
    color: "bg-gray-900",
    placeholder: "https://twitter.com/acme",
  },
  {
    name: "website" as const,
    label: "Website",
    icon: "🌐",
    color: "bg-violet-600",
    placeholder: "https://acme.com",
  },
];

export const infoSchema = z.object({
  companyName: z.string().min(2, "At least 2 characters"),
  phone: z
    .string()
    .length(10, "10-digit number")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian number"),
  location: z.string().min(2, "Required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  about: z.string().min(20, "Write at least 20 characters").max(600),
});

export const detailsSchema = z.object({
  industries: z.array(z.string()).min(1, "Select at least one"),
  size: z.number().min(0, "Select company size"),
  hiringFor: z.array(z.string()).min(1, "Select at least one"),
  founded: z.string().optional(),
});

export const brandSchema = z.object({
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type InfoValues = z.infer<typeof infoSchema>;
export type DetailsValues = z.infer<typeof detailsSchema>;
export type BrandValues = z.infer<typeof brandSchema>;
