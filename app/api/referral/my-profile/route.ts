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

  // Get conversion stats — count how many times this code has been used
  // The code may appear in the `referrals` table or be tracked via auth user metadata
  // We query the referrals table where referral_code matches
  const { count: conversionCount, error: countError } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referral_code", referralCode);

  if (countError) {
    console.error("Failed to fetch conversion count:", countError);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/register?ref=${referralCode}`;

  return NextResponse.json(
    {
      isOk: true,
      data: {
        referralCode,
        shareUrl,
        conversionCount: conversionCount ?? 0,
        name: dbUser.name,
      },
    },
    { status: 200 },
  );
}

