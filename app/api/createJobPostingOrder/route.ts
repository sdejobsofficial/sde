import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { message: "Unauthorized", isOk: false },
        { status: 401 },
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { amount?: number; currency?: string; purpose?: string }
      | null;

    const amountInPaise = Number(body?.amount);
    const currency = (body?.currency || "INR").toUpperCase();
    const purpose = body?.purpose || "job_posting";

    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { message: "A valid amount in paise is required", isOk: false },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_SECRET_ID,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountInPaise),
      currency,
    });

    const supabaseService = await createClient({ useServiceRole: true });
    const { error: dbError } = await supabaseService
      .from("premium_orders")
      .insert({
        user_id: authUser.id,
        order_id: order.id,
        gross_amount: Number((amountInPaise / 100).toFixed(2)),
        discount_amount: 0,
        net_amount: Number((amountInPaise / 100).toFixed(2)),
        status: "created",
        subscription_type: purpose,
      });

    if (dbError) {
      return NextResponse.json(
        {
          message: "Failed to persist order tracking",
          error: dbError.message,
          isOk: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ...order,
      amount: Number((amountInPaise / 100).toFixed(2)),
      currency,
      purpose,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error", isOk: false },
      { status: 500 },
    );
  }
}
