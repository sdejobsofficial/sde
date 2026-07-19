import { NextResponse } from "next/server";
import { reverseRewardAdmin } from "@/clients/referralCreditsClient";

export async function POST(req: Request) {
  // TODO: Add admin auth/authorization gate.
  const { conversionId, reason } = await req.json();
  const data = await reverseRewardAdmin(conversionId, reason);
  return NextResponse.json({ isOk: true, data }, { status: 200 });
}

