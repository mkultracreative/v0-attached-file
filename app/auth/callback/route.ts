import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Code exchange failed:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Verify session was actually created
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error("No session after code exchange");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log("Session established for:", session.user.email);

  // Use 307 redirect to preserve method/headers if needed, but 302 is fine here
  return NextResponse.redirect(`${origin}${next}`);
}
