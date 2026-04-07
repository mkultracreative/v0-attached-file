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

  // Ensure authentication exists
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { room } = await request.json()

    // Create or fetch the session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      },
    })

    // Grant FULL_ACCESS to the user's own room
    session.allow(`resume-${user.id}`, session.FULL_ACCESS)

    // Check permissions for other room (if it's not their own)
    if (room && room !== `resume-${user.id}`) {
      if (room.startsWith("resume-")) {
        // Add READ_ACCESS for shared rooms
        session.allow(room, session.READ_ACCESS)
      } else {
        // Invalid room format; deny access
        console.error("[Liveblocks Auth] Invalid room format:", room)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Perform session authorization
    const { status, body } = await session.authorize()
    return new Response(body, { status })
  } catch (error) {
    console.error("[Liveblocks Auth Error]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}