import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/redemptions
 *
 * Admin only: Fetch all credit redemptions with student details.
 */
export async function GET(request: NextRequest) {
  try {
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

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch redemptions with corresponding user names and emails
    const { data: redemptions, error: fetchError } = await adminClient
      .from("redemptions")
      .select(`
        id,
        points_deducted,
        status,
        created_at,
        user_id,
        users (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return NextResponse.json({ message: "Failed to fetch redemptions: " + fetchError.message, isOk: false }, { status: 500 });
    }

    // Flatten user details mapping
    const mappedRedemptions = (redemptions || []).map((r: any) => ({
      id: r.id,
      pointsDeducted: r.points_deducted,
      status: r.status,
      createdAt: r.created_at,
      userId: r.user_id,
      userName: r.users?.name || "Unknown User",
      userEmail: r.users?.email || "N/A",
    }));

    return NextResponse.json({ isOk: true, data: mappedRedemptions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error", isOk: false }, { status: 500 });
  }
}
