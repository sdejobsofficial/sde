import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Redirect Vercel domain to primary domain
  const host = request.headers.get("host");
  if (host === "sde-jobs.vercel.app") {
    const url = request.nextUrl.clone();
    url.host = "www.sdejobs.com";
    url.port = ""; // Ensure port is cleared for production
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
