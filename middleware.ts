import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === "true";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  if (AUTH_BYPASS_ENABLED) {
    return NextResponse.next();
  }

  if (session) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*"],
};