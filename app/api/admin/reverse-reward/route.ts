import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { reverseRewardAdmin } from "@/clients/referralCreditsClient";

/**
 * POST /api/admin/reverse-reward
 *
 * Admin only: Reverse a referral reward on refund/fraud.
 * Body: { conversionId: string, reason: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json({ message: "Unauthorized", isOk: false }, { status: 401 });
  }

  // Role check
  const { data: dbUser, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (roleError || !dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ message: "Forbidden: Admin access required", isOk: false }, { status: 403 });
  }

  const { conversionId, reason } = await req.json();

  if (!conversionId || !reason) {
    return NextResponse.json({ message: "conversionId and reason are required", isOk: false }, { status: 400 });
  }

  try {
    const data = await reverseRewardAdmin(conversionId, reason);
    return NextResponse.json({ isOk: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to reverse reward", isOk: false }, { status: 500 });
  }
}
