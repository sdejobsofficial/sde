import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/confirm] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  // Redirect to /reset-password (no code in URL — session is now set in cookie)
  return NextResponse.redirect(`${origin}${next}`);
}