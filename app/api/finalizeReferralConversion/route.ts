import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// This endpoint is the single source of truth for awarding referral credit points.
// It enforces the success criteria atomically in DB via an RPC.

const getServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

export type FinalizeReferralConversionBody = {
  referred_user_id: string; // job seeker auth uid
  sales_profile_id: string;
  referral_code: string;
  subscription_type: "tech" | "non-tech";
  payment_id: string; // razorpay payment id
  order_id: string; // razorpay order id
  razorpay_signature: string;
  amount: number; // in INR (not paise)
};

const generatedSignature = (
  orderId: string,
  razorpayPaymentId: string,
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

  const normalizedReferralCode = body.referral_code?.toUpperCase().trim();

  // Verify signature server-side again (defense-in-depth).
  const expectedSig = generatedSignature(body.order_id, body.payment_id);
  if (expectedSig !== body.razorpay_signature) {
    return NextResponse.json(
      { message: "payment verification failed", isOk: false },
      { status: 400 },
    );
  }

  // Idempotent DB-side finalization (RPC should ensure once-only credit award).
  const { data, error } = await supabase.rpc(
    "finalize_referral_conversion",
    {
      p_referred_user_id: body.referred_user_id,
      p_sales_profile_id: body.sales_profile_id,
      p_referral_code: normalizedReferralCode,
      p_subscription_type: body.subscription_type,
      p_payment_id: body.payment_id,
      p_order_id: body.order_id,
      p_amount: body.amount,
    },
  );

  if (error) {
    return NextResponse.json(
      { message: error.message || "finalize_referral_conversion failed", isOk: false },
      { status: 500 },
    );
  }

  return NextResponse.json({ isOk: true, result: data }, { status: 200 });
}

