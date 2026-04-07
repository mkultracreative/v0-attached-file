import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResumeRoom } from "@/components/resume-room"
import { ResumeViewer } from "@/components/resume-viewer"
import type { PersonRow } from "@/app/profile/page"

export default async function ResumePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch resume data from Supabase
  const { data: personData, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", params.id)
    .single<PersonRow>()

  // Debug log
  console.log("[Resume Page]", {
    paramsId: params.id,
    personDataExists: !!personData,
    error: error?.message,
    personDataId: personData?.id,
  })

  if (error || !personData) {
    console.error("[Resume Page] Query failed:", error?.message || "No data")
    // Instead of redirect, throw error so we see what went wrong
    throw new Error(`Failed to load resume: ${error?.message || "Not found"}`)
  }

  // Check if user owns this resume or has access
  const isOwner = user.id === personData.user_id

  return (
    <ResumeRoom
      userId={params.id}
      initialData={personData}
      userInfo={{
        id: user.id,
        name: user.user_metadata?.full_name || user.email || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url as string | undefined,
      }}
    >
      <ResumeViewer isOwner={isOwner} userId={params.id} />
    </ResumeRoom>
  )
}