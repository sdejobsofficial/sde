"use server";

import { convertToSnakeCase } from "@/lib/casing";
import {
  RegisterJobSeekerDTO,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@/models/userModel";
import { createClient } from "@/supabase/server";

export const jobSeekerEmailRegister = async (payload: RegisterJobSeekerDTO) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: payload.Email,
    password: payload.Password,
    options: {
      data: {
        role: UserRole.JobSeeker,
        name: payload.Name,
        phone: payload.Phone,
      },
    },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const jobSeekerEmailLogin = async (email: string, password: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const recruiterEmailLogin = async (email: string, password: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("recruiterEmailLogin error:", error.message);
    throw new Error(error.message);
  }

  return data;
};

export const recruiterEmailRegister = async (
  email: string,
  password: string,
  phone: string,
  companyName: string,
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: UserRole.Company,
        phone,
        name: companyName,
      },
    },
  });
  if (error) {
    console.error("recruiterEmailRegister error:", error.message);
    throw new Error(error.message);
  }

  return data;
};

export const resendVerificationEmail = async (email: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });
  if (error) throw new Error(error.message);
};

export const logout = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const handlePremiumUpgrade = async (userId: string) => {
  const supabase = await createClient({ useServiceRole: true });

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("meta")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    console.error("User not found:", userId);
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const subscription = {
    Plan: SubscriptionPlan.Premium,
    Status: SubscriptionStatus.Active,
    CurrentPeriodStart: now.toISOString(),
    CurrentPeriodEnd: threeMonthsLater.toISOString(),
    CancelledAt: null,
    IsPremiumPlus: false,
  };

  const { error } = await supabase
    .from("users")
    .update({
      meta: {
        ...user.meta,
        subscription: convertToSnakeCase(subscription),
      },
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user:", error);
    return Response.json({ message: "DB update failed" }, { status: 500 });
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const exchangeCodeForSession = async (code: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new Error(error.message);
  return data;
};
