import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResumeRoom } from "@/components/resume-room"
import { ResumeEditor } from "@/components/resume-editor"
import type { ProfileLiveData, ResumeThemeLiveData } from "@/lib/schemas"

export default async function EditorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's profile data
  const { data: personData } = await supabase.from("people").select("*").eq("id", user.id).single()

  const resumeContent = personData?.resume_content_modified as ProfileLiveData | null
  const themeData = personData?.theme_data as ResumeThemeLiveData | null

  if (!resumeContent) {
    redirect("/profile")
  }

  return (
    <ResumeRoom roomId={`resume-${user.id}`} initialProfile={resumeContent} initialTheme={themeData || undefined}>
      <ResumeEditor userId={user.id} />
    </ResumeRoom>
  )
}
