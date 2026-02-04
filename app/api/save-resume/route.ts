import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeContent, themeData } = await request.json()

    const { error: updateError } = await supabase
      .from("people")
      .update({
        resume_content_modified: resumeContent,
        theme_data: themeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to save resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save resume error:", error)
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 })
  }
}
