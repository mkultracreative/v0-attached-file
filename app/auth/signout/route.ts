import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// Server-side signout — clears session cookies cleanly then redirects to login.
// Using this instead of client-side supabase.auth.signOut() avoids the
// redirect loop caused by middleware bouncing an unauthenticated request
// before the client-side signout completes.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const origin = request.nextUrl.origin
  return NextResponse.redirect(`${origin}/auth/login`)
}
