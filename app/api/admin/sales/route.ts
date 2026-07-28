import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/sales
 *
 * Admin only: Fetch global sales performance report.
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

    // Dynamic aggregated SQL query using raw SQL RPC or table-level fetches if RPC is not deployed yet.
    // To ensure maximum robustness without needing custom functions, we can query profiles, clicks, and referrals in parallel and aggregate programmatically!
    
    const [profilesRes, clicksRes, referralsRes] = await Promise.all([
      adminClient.from("sales_profiles").select("id, name, email, referral_code, is_active"),
      adminClient.from("sales_clicks").select("sales_profile_id, is_unique"),
      adminClient.from("referrals").select("sales_profile_id, order_amount"),
    ]);

    if (profilesRes.error) {
      return NextResponse.json({ message: "Failed to fetch profiles: " + profilesRes.error.message, isOk: false }, { status: 500 });
    }

    const profiles = profilesRes.data || [];
    const clicks = clicksRes.data || [];
    const referrals = referralsRes.data || [];

    const clickCountsMap = new Map<string, { total: number; unique: number }>();
    const conversionMap = new Map<string, { count: number; revenue: number }>();

    // Aggregate clicks
    clicks.forEach((c) => {
      const current = clickCountsMap.get(c.sales_profile_id) || { total: 0, unique: 0 };
      current.total += 1;
      if (c.is_unique) {
        current.unique += 1;
      }
      clickCountsMap.set(c.sales_profile_id, current);
    });

    // Aggregate conversions/revenue
    referrals.forEach((ref) => {
      const current = conversionMap.get(ref.sales_profile_id) || { count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += Number(ref.order_amount || 0);
      conversionMap.set(ref.sales_profile_id, current);
    });

    const report = profiles.map((p) => {
      const clickMetrics = clickCountsMap.get(p.id) || { total: 0, unique: 0 };
      const referralMetrics = conversionMap.get(p.id) || { count: 0, revenue: 0 };
      const conversionRate = clickMetrics.unique > 0 
        ? ((referralMetrics.count / clickMetrics.unique) * 100).toFixed(2) + "%" 
        : "0.00%";

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        referralCode: p.referral_code,
        isActive: p.is_active,
        clicks: clickMetrics.total,
        uniqueVisitors: clickMetrics.unique,
        premiumConversions: referralMetrics.count,
        conversionRate,
        revenueGenerated: referralMetrics.revenue,
      };
    });

    return NextResponse.json({ isOk: true, data: report }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error", isOk: false }, { status: 500 });
  }
}
