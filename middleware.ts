import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { appConfig } from "@/app-config";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(appConfig.urls.dashboard)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(appConfig.auth.sessionCookieName);
  if (hasSession) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(appConfig.urls.marketing, request.url);
  redirectUrl.searchParams.set(appConfig.auth.redirectQsKey, request.nextUrl.pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};