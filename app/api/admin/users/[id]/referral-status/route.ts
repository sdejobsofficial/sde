import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * PATCH /api/admin/users/[id]/referral-status
 *
 * Admin only: Freeze or enable a student's peer-to-peer referral features.
 * Body: { isReferralDisabled: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { isReferralDisabled } = (await request.json()) as { isReferralDisabled: boolean };

    if (typeof isReferralDisabled !== "boolean") {
      return NextResponse.json({ message: "isReferralDisabled (boolean) is required", isOk: false }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current meta
    const { data: userData, error: fetchError } = await adminClient
      .from("users")
      .select("meta")
      .eq("id", id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ message: "User not found", isOk: false }, { status: 404 });
    }

    const updatedMeta = {
      ...(userData.meta || {}),
      is_referral_disabled: isReferralDisabled,
    };

    const { error: updateError } = await adminClient
      .from("users")
      .update({ meta: updatedMeta, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ message: "Failed to update user referral status: " + updateError.message, isOk: false }, { status: 500 });
    }

    return NextResponse.json({ isOk: true, message: `User referral capabilities ${isReferralDisabled ? "disabled" : "enabled"} successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error", isOk: false }, { status: 500 });
  }
}
