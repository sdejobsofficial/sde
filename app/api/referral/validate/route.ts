import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/referral/validate
 *
 * Validates a referral code against:
 *  1. sales_profiles table (existing system)
 *  2. users table (any user can have a referral code)
 *
 * Body: { code: string }
 * Returns: { isOk, data: { id, name, type } | null }
 */
export async function POST(request: NextRequest) {
  const { code } = (await request.json()) as { code: string };

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { message: "Code is required", isOk: false },
      { status: 400 },
    );
  }

  const normalizedCode = code.toUpperCase().trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Check sales_profiles first (existing system for sales people)
  const { data: salesProfile, error: salesError } = await supabase
    .rpc("get_active_sales_profile_by_code", {
      p_code: normalizedCode,
    })
    .single<{ id: string; name: string }>();

  if (!salesError && salesProfile) {
    return NextResponse.json(
      {
        isOk: true,
        data: {
          id: salesProfile.id,
          name: salesProfile.name,
          type: "sales",
        },
      },
      { status: 200 },
    );
  }

  // 2. Check users table — look up by meta->referral_code
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name")
    .filter("meta->referral_code", "eq", normalizedCode);

  if (!usersError && users && users.length > 0) {
    return NextResponse.json(
      {
        isOk: true,
        data: {
          id: users[0].id,
          name: users[0].name ?? "Referrer",
          type: "user",
        },
      },
      { status: 200 },
    );
  }

  // Not found
  return NextResponse.json(
    {
      isOk: true,
      data: null,
    },
    { status: 200 },
  );
}

