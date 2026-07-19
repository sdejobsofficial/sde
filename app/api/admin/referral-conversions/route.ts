import { NextResponse } from "next/server";
import { getReferralConversionsAdmin } from "@/clients/referralCreditsClient";

export async function POST(req: Request) {
  // TODO: Add admin auth/authorization gate.
  const { referrerId } = await req.json();
  const data = await getReferralConversionsAdmin(referrerId);
  return NextResponse.json({ isOk: true, data }, { status: 200 });
}

