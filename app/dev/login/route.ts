import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "inventoryqr.session";

export async function GET(request: Request) {
  const redirectUrl = new URL("/dashboard", request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "dev-dummy",
    httpOnly: true,
    path: "/",
  });

  return response;
}