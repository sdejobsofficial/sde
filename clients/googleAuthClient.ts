"use client";

import { createClient } from "@/supabase/client";

export const jobSeekerGoogleAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth-callback`,
    },
  });
  if (error) throw new Error(error.message);
};

export const recruiterGoogleAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/recruiter/auth/oauth-callback`,
    },
  });
  if (error) throw new Error(error.message);
};
