import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

/**
 * GET /api/referral/my-profile
 *
 * Returns the current user's referral profile:
 *  - referral_code (auto-generated if missing)
 *  - share_url
 *  - conversion_count (how many people used this code)
 *  - reward_earned (total reward amount)
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !authUser) {
    return NextResponse.json(
      { message: "Unauthorized", isOk: false },
      { status: 401 },
    );
  }

  // Fetch the user record from the public.users table
  const { data: dbUser, error: fetchError } = await supabase
    .from("users")
    .select("id, name, meta")
    .eq("id", authUser.id)
    .single();

  if (fetchError || !dbUser) {
    return NextResponse.json(
      { message: "User not found", isOk: false },
      { status: 404 },
    );
  }

  const meta = (dbUser.meta as Record<string, unknown>) ?? {};
  let referralCode: string | null = (meta.referral_code as string) ?? null;

  // Auto-generate a referral code if missing
  if (!referralCode) {
    const baseName = (dbUser.name ?? "user")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    referralCode = `${baseName}${randomSuffix}`;

    // Save to user's meta
    const updatedMeta = { ...meta, referral_code: referralCode };
    const { error: updateError } = await supabase
      .from("users")
      .update({ meta: updatedMeta })
      .eq("id", dbUser.id);

    if (updateError) {
      console.error("Failed to save referral code:", updateError);
      return NextResponse.json(
        { message: "Failed to generate referral code", isOk: false },
        { status: 500 },
      );
    }
  }

  // ── P2P Stats: referrals made by this user ──────────────────────────────
  // user_referrals tracks peer-to-peer relationships (referrer → referred)
  const { count: totalReferrals, error: referralCountError } = await supabase
    .from("user_referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_user_id", dbUser.id);

  if (referralCountError) {
    console.error("Failed to fetch referral count:", referralCountError);
  }

  // P2P premium conversions = user_referrals that have a matching referral_reward (granted)
  const { count: premiumConversions, error: conversionError } = await supabase
    .from("referral_rewards")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", dbUser.id)
    .eq("status", "granted");

  if (conversionError) {
    console.error("Failed to fetch premium conversions:", conversionError);
  }

  // ── Credit Balance: sum of all credit_transactions for this user ─────────
  const { data: txData, error: txError } = await supabase
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", dbUser.id);

  if (txError) {
    console.error("Failed to fetch credit balance:", txError);
  }
  const creditBalance = (txData ?? []).reduce((sum, t) => sum + t.amount, 0);

  // ── Redemption Count ─────────────────────────────────────────────────────
  const { count: redemptionCount, error: redemptionError } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", dbUser.id)
    .eq("status", "completed");

  if (redemptionError) {
    console.error("Failed to fetch redemption count:", redemptionError);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/register?ref=${referralCode}`;

  return NextResponse.json(
    {
      isOk: true,
      data: {
        referralCode,
        shareUrl,
        name: dbUser.name,
        // P2P stats
        totalReferrals: totalReferrals ?? 0,
        premiumConversions: premiumConversions ?? 0,
        creditBalance,
        redemptionCount: redemptionCount ?? 0,
        // Derived: credits needed to next redemption
        creditsToNextRedemption: Math.max(0, 10 - (creditBalance % 10)),
      },
    },
    { status: 200 },
  );
}

