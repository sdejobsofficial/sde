import { Zap, ShieldCheck, Globe } from "lucide-react";
import * as z from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Left panel highlights ─────────────────────────────────────────────────
export const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant referrals",
    desc: "Get referred to top companies by insiders in your network.",
  },
  {
    icon: ShieldCheck,
    title: "Verified companies",
    desc: "Every recruiter and company on ReferNest is manually verified.",
  },
  {
    icon: Globe,
    title: "Pan-India reach",
    desc: "Jobs from startups to Fortune 500s across every major city.",
  },
];
