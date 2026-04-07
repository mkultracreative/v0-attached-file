import { Liveblocks } from "@liveblocks/node"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Initialize Liveblocks instance with your secret key
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
    // Get room ID from the request body
    const { room } = await request.json()

    // Create a Liveblocks session for the current user
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      },
    })

    // Grant full access to the user's personal room
    session.allow(`resume-${user.id}`, session.FULL_ACCESS)

    // Conditional: Grant read access for other users' resumes
    if (room && room !== `resume-${user.id}`) {
      if (room.startsWith("resume-")) {
        session.allow(room, session.READ_ACCESS)
      }
    }

    // Perform Liveblocks authorization
    const { status, body } = await session.authorize()
    return new Response(body, { status })
  } catch (error) {
    console.error("[Liveblocks Auth Error]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}