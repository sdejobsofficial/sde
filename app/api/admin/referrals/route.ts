import { NextResponse } from "next/server";
import { getReferralsAdmin } from "@/clients/referralCreditsClient";

export async function GET() {
  // TODO: Add admin auth/authorization gate.
  const data = await getReferralsAdmin();
  return NextResponse.json({ isOk: true, data }, { status: 200 });
}

