import { createClient } from "@/supabase/server";
import { UserRole } from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/recruiter/login?error=missing_code`);
  }

  // Exchange code for session
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Recruiter OAuth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/recruiter/login?error=oauth_failed`);
  }

  const authUser = data.user;

  // Service role client to bypass RLS for user lookup + insert
  const adminSupabase = await createClient({ useServiceRole: true });

  const { data: existingUser } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("id", authUser.id)
    .single();

  if (!existingUser) {
    // First time — create with Company role
    const { error: insertError } = await adminSupabase.from("users").insert({
      id: authUser.id,
      email: authUser.email,
      name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        "",
      role: UserRole.Company,
      meta: {},
    });

    if (insertError) {
      console.error("Failed to create recruiter record:", insertError.message);
      return NextResponse.redirect(`${origin}/recruiter/login?error=user_creation_failed`);
    }

    return NextResponse.redirect(`${origin}/recruiter/onboarding`);
  }

  // Existing user — redirect by role
  if (existingUser.role === UserRole.JobSeeker) {
    return NextResponse.redirect(`${origin}/jobs`);
  }

  return NextResponse.redirect(`${origin}/recruiter/dashboard`);
}