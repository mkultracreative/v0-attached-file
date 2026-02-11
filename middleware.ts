import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/lib/stackServer";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/app")) {
    const user = await stackServerApp.getUser();
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/handler/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
