import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// This endpoint is the single source of truth for awarding referral credit points and attributing sales.
// It enforces the success criteria atomically in DB via the `attribute_premium_purchase` RPC.

const getServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export type FinalizeReferralConversionBody = {
  referred_user_id: string; // job seeker auth uid
  referral_code?: string;
  subscription_type: "tech" | "non-tech";
  payment_id: string; // razorpay payment id
  order_id: string; // razorpay order id
  razorpay_signature: string;
};

const generatedSignature = (
  orderId: string,
  razorpayPaymentId: string
) => {
  const keySecret = process.env.RAZORPAY_SECRET_ID as string;
  return crypto
    .createHmac("sha256", keySecret)
    .update(orderId + "|" + razorpayPaymentId)
    .digest("hex");
};

export async function POST(request: NextRequest) {
  const supabase = getServiceClient();
  const body = (await request.json()) as FinalizeReferralConversionBody;

  const normalizedReferralCode = body.referral_code?.toUpperCase().trim() || "";

  // Verify signature server-side (defense-in-depth).
  const expectedSig = generatedSignature(body.order_id, body.payment_id);
  if (expectedSig !== body.razorpay_signature) {
    return NextResponse.json(
      { message: "payment verification failed", isOk: false },
      { status: 400 }
    );
  }

  // 1. Retrieve the pre-created order from public.premium_orders to get exact pricing
  const { data: order, error: orderError } = await supabase
    .from("premium_orders")
    .select("gross_amount, discount_amount, net_amount")
    .eq("order_id", body.order_id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json(
      { message: "Failed to retrieve order metadata: " + orderError.message, isOk: false },
      { status: 500 }
    );
  }

  // Fallback to defaults if order metadata wasn't captured during createOrder step (e.g. legacy checkouts)
  const gross = order?.gross_amount ?? (normalizedReferralCode ? 349.00 : 349.00);
  const discount = order?.discount_amount ?? (normalizedReferralCode ? 50.00 : 0.00);
  const net = order?.net_amount ?? (normalizedReferralCode ? 299.00 : 349.00);

  // 2. Idempotent DB-side finalization (RPC ensures once-only credit award and transaction locks).
  const { data, error } = await supabase.rpc(
    "attribute_premium_purchase",
    {
      p_user_id: body.referred_user_id,
      p_order_id: body.order_id,
      p_payment_id: body.payment_id,
      p_gross: gross,
      p_discount: discount,
      p_net: net,
      p_subscription_type: body.subscription_type,
      p_active_ref_code: normalizedReferralCode,
    }
  );

  if (error) {
    return NextResponse.json(
      { message: error.message || "attribute_premium_purchase failed", isOk: false },
      { status: 500 }
    );
  }

  return NextResponse.json({ isOk: true, result: data }, { status: 200 });
}
