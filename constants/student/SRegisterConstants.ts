import { Users, Mail, TrendingUp, Briefcase } from "lucide-react";
import { z } from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .length(10, "Enter a valid 10-digit mobile number")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions and Privacy Policy",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Left panel perks ─────────────────────────────────────────────────────
export const PERKS = [
  {
    icon: Users,
    text: "Build your profile and let top companies discover you",
  },
  { icon: Mail, text: "Get personalised job alerts delivered to your inbox" },
  {
    icon: TrendingUp,
    text: "Track applications and referral requests in one place",
  },
  { icon: Briefcase, text: "Unlock premium to access exclusive career resources" },
];

export const STATS = [
  { value: "50K+", label: "Job seekers" },
  { value: "2K+", label: "Companies" },
  { value: "10K+", label: "Jobs posted" },
];
