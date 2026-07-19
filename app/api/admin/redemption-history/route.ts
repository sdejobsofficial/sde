import { NextResponse } from "next/server";
import { getRedemptionHistoryAdmin } from "@/clients/referralCreditsClient";

export async function POST(req: Request) {
  // TODO: Add admin auth/authorization gate.
  const { referrerId } = await req.json();
  const data = await getRedemptionHistoryAdmin(referrerId);
  return NextResponse.json({ isOk: true, data }, { status: 200 });
}

