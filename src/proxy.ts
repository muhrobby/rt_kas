import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isWargaRoute = pathname.startsWith("/warga");

  // Redirect unauthenticated users to login
  if (!sessionCookie && (isAdminRoute || isWargaRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && (isAdminRoute || isWargaRoute)) {
    let session = null;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch {
      session = null;
    }
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/warga/:path*"],
};
