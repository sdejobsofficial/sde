import { z } from "zod";
import { Mail, ShieldCheck, Zap } from "lucide-react";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const RESET_HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Secure & encrypted",
    desc: "Your new password is hashed end-to-end. We never store it in plain text.",
  },
  {
    icon: Mail,
    title: "One-time link",
    desc: "Reset links expire after 1 hour and can only be used once for your safety.",
  },
  {
    icon: Zap,
    title: "Back in seconds",
    desc: "Once reset, you'll be redirected to sign in and pick up right where you left off.",
  },
];
