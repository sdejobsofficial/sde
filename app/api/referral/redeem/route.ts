import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

/**
 * POST /api/referral/redeem
 *
 * Redeems 10 credit points for the authenticated student.
 * Extends active Premium subscription by 3 months.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { message: "Unauthorized", isOk: false },
        { status: 401 }
      );
    }

    // Call the SQL stored procedure which locks the credits ledger row-level to prevent double spending
    const { data, error } = await supabase.rpc("redeem_credits", {
      p_user_id: authUser.id,
    });

    if (error) {
      return NextResponse.json(
        { message: error.message || "Failed to redeem credits", isOk: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { isOk: true, message: "Redeemed 10 credits successfully", result: data },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error", isOk: false },
      { status: 500 }
    );
  }
}
