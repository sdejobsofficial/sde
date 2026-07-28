import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/referral/track-visit
 *
 * Records a visitor click in the sales_clicks table using log_sales_visit RPC.
 *
 * Body: { code: string, visitorId: string, referrerUrl?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { code, visitorId, referrerUrl } = (await request.json()) as {
      code: string;
      visitorId: string;
      referrerUrl?: string;
    };

    if (!code || !visitorId) {
      return NextResponse.json(
        { message: "Code and visitorId are required", isOk: false },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = referrerUrl || request.headers.get("referer") || "";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: trackSuccess, error: trackError } = await supabase.rpc(
      "log_sales_visit",
      {
        p_code: code.trim(),
        p_visitor_id: visitorId,
        p_ip: ip,
        p_user_agent: userAgent,
        p_referrer: referrer,
      }
    );

    if (trackError) {
      return NextResponse.json(
        { message: trackError.message, isOk: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { isOk: true, tracked: !!trackSuccess },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "An error occurred", isOk: false },
      { status: 500 }
    );
  }
}
