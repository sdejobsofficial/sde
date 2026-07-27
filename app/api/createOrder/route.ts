import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/supabase/server";

/**
 * POST /api/createOrder
 * 
 * Securely creates a Razorpay order.
 * Server validates the referral code and gates the price:
 * - Valid referral code (Sales or user P2P): ₹299 (net_amount = 299, discount_amount = 50)
 * - Otherwise: ₹349 (net_amount = 349, discount_amount = 0)
 * 
 * Body: { subscriptionType: string, referralCode?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { message: "Unauthorized", isOk: false },
        { status: 401 }
      );
    }

    const { subscriptionType = "tech", referralCode } = (await req.json()) as {
      subscriptionType?: string;
      referralCode?: string;
    };

    let discount = 0.00;
    let netAmount = 349.00;
    const grossAmount = 349.00;
    let validatedCode = "";

    if (referralCode) {
      const normalizedCode = referralCode.toUpperCase().trim();

      // Check sales_profiles first
      const { data: salesProfile } = await supabase
        .from("sales_profiles")
        .select("id")
        .eq("referral_code", normalizedCode)
        .eq("is_active", true)
        .maybeSingle();

      if (salesProfile) {
        discount = 50.00;
        netAmount = 299.00;
        validatedCode = normalizedCode;
      } else {
        // Check standard users meta
        const { data: users } = await supabase
          .from("users")
          .select("id")
          .filter("meta->referral_code", "eq", normalizedCode);

        if (users && users.length > 0) {
          discount = 50.00;
          netAmount = 299.00;
          validatedCode = normalizedCode;
        }
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_SECRET_ID,
    });

    // Create Razorpay Order (amount in paise/cents)
    const order = await razorpay.orders.create({
      amount: Math.round(netAmount * 100),
      currency: "INR",
    });

    // Write payment order trace in database
    const supabaseService = await createClient({ useServiceRole: true });
    const { error: dbError } = await supabaseService
      .from("premium_orders")
      .insert({
        user_id: authUser.id,
        order_id: order.id,
        gross_amount: grossAmount,
        discount_amount: discount,
        net_amount: netAmount,
        status: "created",
        subscription_type: subscriptionType,
      });

    if (dbError) {
      return NextResponse.json(
        { message: "Failed to persist order tracking", error: dbError.message, isOk: false },
        { status: 500 }
      );
    }

    // Return the Razorpay order and discount details
    return NextResponse.json({
      ...order,
      discount_applied: discount,
      net_amount: netAmount,
      referral_code_applied: validatedCode || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error", isOk: false },
      { status: 500 }
    );
  }
}
