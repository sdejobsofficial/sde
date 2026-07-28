import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * PATCH /api/admin/sales-profiles/[id]
 *
 * Admin only: Enable or disable a sales person's profile.
 * Body: { isActive: boolean }
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

    const { isActive } = (await request.json()) as { isActive: boolean };

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ message: "isActive (boolean) is required", isOk: false }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: updateError } = await adminClient
      .from("sales_profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ message: "Failed to update profile: " + updateError.message, isOk: false }, { status: 500 });
    }

    return NextResponse.json({ isOk: true, message: `Sales profile ${isActive ? "enabled" : "disabled"} successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error", isOk: false }, { status: 500 });
  }
}
