import { Building2, Users, BarChart3 } from "lucide-react";
import { z } from "zod";

export const registerSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Conditions and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export const STATS = [
  { icon: Building2, value: "2,000+", label: "Companies hiring" },
  { icon: Users, value: "50,000+", label: "Active job seekers" },
  { icon: BarChart3, value: "10,000+", label: "Jobs filled" },
];

export const FEATURES = [
  "Post unlimited jobs with our Recruiter Pro plan",
  "Access verified job seekers with complete profiles",
  "Manage referrals, applications and hiring in one place",
];
