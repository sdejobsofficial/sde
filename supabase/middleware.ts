import { UserRole } from "@/models/userModel";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const STUDENT_GUEST_ROUTES = ["/login", "/register"];
const RECRUITER_GUEST_ROUTES = ["/recruiter/login"];

const STUDENT_PROTECTED_ROUTES = [
  "/onboarding",
  "/account",
  "/bookmarks",
  "/profile",
];

const RECRUITER_PROTECTED_ROUTES = [
  "/recruiter/dashboard",
  "/recruiter/jobs",
  "/recruiter/applicants",
  "/recruiter/job-form",
  "/recruiter/onboarding",
];

const startsWith = (path: string, routes: string[]) =>
  routes.some(
    (r) => path === r || path.startsWith(r + "/") || path.startsWith(r + "?"),
  );

const isApplyRoute = (path: string) =>
  /^\/jobs\/[^/]+\/apply(\/.*)?$/.test(path);

const clearAuthAndRedirect = (request: NextRequest, url: string) => {
  const redirectResponse = NextResponse.redirect(new URL(url, request.url));
  // Delete all Supabase session cookies
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-")) {
      redirectResponse.cookies.delete(name);
    }
  });
  return redirectResponse;
};

export const updateSession = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // ── 1. Use getSession() to get the current session including refresh token ──
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ── 2. If session exists, force a refresh to hit the Supabase server ──
  // This is the only way to detect a ban — getUser() validates JWT locally
  // and won't know about the ban until the token is refreshed server-side.
  let authUser = session?.user ?? null;
  let isBanned = false;

  if (session?.refresh_token) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession({
        refresh_token: session.refresh_token,
      });

    if (refreshError) {
      const msg = refreshError.message?.toLowerCase() ?? "";
      const code = refreshError?.code ?? "";
      isBanned = msg.includes("banned") || code === "user_banned";

      if (isBanned) {
        return clearAuthAndRedirect(request, "/login?error=banned");
      }

      // Any other refresh error means the session is invalid — treat as logged out
      authUser = null;
    } else {
      authUser = refreshData.user ?? null;
    }
  }

  // ── 3. Fetch role from DB if session exists ──
  let role: UserRole | null = null;

  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (data) role = data.role as UserRole;
  }

  const isLoggedIn = !!authUser;
  const isJobSeeker = role === UserRole.JobSeeker;
  const isCompany = role === UserRole.Company;

  // ── 4. Guest-only routes ──
  if (startsWith(pathname, STUDENT_GUEST_ROUTES)) {
    if (isJobSeeker)
      return NextResponse.redirect(new URL("/jobs", request.url));
    if (isCompany)
      return NextResponse.redirect(
        new URL("/recruiter/dashboard", request.url),
      );
  }

  if (startsWith(pathname, RECRUITER_GUEST_ROUTES)) {
    if (isCompany)
      return NextResponse.redirect(
        new URL("/recruiter/dashboard", request.url),
      );
    if (isJobSeeker)
      return NextResponse.redirect(new URL("/jobs", request.url));
  }

  // ── 5. Protected student routes ──
  if (
    startsWith(pathname, STUDENT_PROTECTED_ROUTES) ||
    isApplyRoute(pathname)
  ) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isCompany)
      return NextResponse.redirect(
        new URL("/recruiter/dashboard", request.url),
      );
  }

  // ── 6. Protected recruiter routes ──
  if (startsWith(pathname, RECRUITER_PROTECTED_ROUTES)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/recruiter/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isJobSeeker)
      return NextResponse.redirect(new URL("/jobs", request.url));
  }

  return response;
};
