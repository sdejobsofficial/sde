import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/adjust-credits
 *
 * Admin only: Manually adjust a user's credits.
 * Body: { userId: string, amount: number, reason: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ message: "Unauthorized", isOk: false }, { status: 401 });
    }

    // Role validation
    const { data: dbUser, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (roleError || !dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin access required", isOk: false }, { status: 403 });
    }

    const { userId, amount, reason } = (await request.json()) as {
      userId: string;
      amount: number;
      reason: string;
    };

    if (!userId || typeof amount !== "number" || !reason) {
      return NextResponse.json({ message: "userId, amount (number), and reason are required", isOk: false }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Insert manual adjustment ledger entry
    const { error: ledgerError } = await adminClient
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: "manual_adjustment",
        description: reason,
      });

    if (ledgerError) {
      return NextResponse.json({ message: "Failed to create ledger entry: " + ledgerError.message, isOk: false }, { status: 500 });
    }

    // 2. Fetch the user's updated balance
    const { data: balanceData, error: balanceError } = await adminClient
      .from("credit_transactions")
      .select("amount")
      .eq("user_id", userId);

    if (balanceError) {
      return NextResponse.json({ message: "Failed to retrieve new balance", isOk: false }, { status: 500 });
    }

    const newBalance = (balanceData || []).reduce((sum, item) => sum + item.amount, 0);

    return NextResponse.json(
      { isOk: true, userId, newBalance, message: "Balance adjusted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error", isOk: false }, { status: 500 });
  }
}
