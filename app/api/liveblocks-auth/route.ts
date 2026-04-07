import { Liveblocks } from "@liveblocks/node"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get room ID from request body
  const { room } = await request.json()

  // Create a session for the user
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.email?.split("@")[0] || "User",
      email: user.email || "",
      avatar: user.user_metadata?.avatar_url,
    },
  })

  // Give the user full access to their own room
  session.allow(`resume-${user.id}`, session.FULL_ACCESS)

  // If room is provided and it's a different user's resume, allow read access
  if (room && room !== `resume-${user.id}`) {
    // For resume rooms belonging to others, grant read access so they can view
    if (room.startsWith("resume-")) {
      session.allow(room, session.READ_ACCESS)
    }
  }

  const { status, body } = await session.authorize()
  return new Response(body, { status })
}
