"use server";

import { createClient } from "@supabase/supabase-js";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

export const validateReferralCode = async (
  code: string,
): Promise<{ id: string; name: string } | null> => {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .rpc("get_active_sales_profile_by_code", {
      p_code: code.toUpperCase().trim(),
    })
    .single<{ id: string; name: string }>();

  if (error || !data) return null;
  return data;
};

export const recordReferral = async (payload: {
  sales_profile_id: string;
  user_id: string;
  referral_code: string;
  order_amount: number;
}): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("referrals").insert([payload]);
  // Silently ignore duplicate (unique_user_per_sales_profile constraint)
  if (error && !error.message.includes("unique_user_per_sales_profile")) {
    throw new Error(error.message);
  }
};
