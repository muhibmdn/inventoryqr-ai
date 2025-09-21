"use server";

import { cookies } from "next/headers";

import { FIRST_VISIT_COOKIE } from "./constants";

export async function markFirstVisit() {
  const cookieStore = await cookies();

  cookieStore.set(FIRST_VISIT_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  });
}
