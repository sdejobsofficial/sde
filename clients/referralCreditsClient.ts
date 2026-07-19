"use server";

import { createClient } from "@supabase/supabase-js";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

// Admin helpers (read-only). Credit mutations/fraud reversals are done via RPC.

export const getReferralsAdmin = async () => {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getReferralConversionsAdmin = async (p_referrer_id: string) => {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "get_referral_conversions_by_referrer",
    { p_referrer_id },
  );
  if (error) throw new Error(error.message);
  return data;
};

export const reverseRewardAdmin = async (p_conversion_id: string, p_reason: string) => {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "reverse_referral_reward",
    { p_conversion_id, p_reason },
  );
  if (error) throw new Error(error.message);
  return data;
};

export const getRedemptionHistoryAdmin = async (p_referrer_id?: string) => {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc(
    "get_redemption_history",
    { p_referrer_id: p_referrer_id ?? null },
  );
  if (error) throw new Error(error.message);
  return data;
};

