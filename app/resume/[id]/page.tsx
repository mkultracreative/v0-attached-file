import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResumeRoom } from "@/components/resume-room"
import { ResumeViewer } from "@/components/resume-viewer"
import type { PersonRow } from "@/app/profile/page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResumePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: personData } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", id)
    .single<PersonRow>()

  if (!personData?.resume_content) {
    redirect("/profile")
  }

  const isOwner = user.id === id

  // Serialize to plain JSON before crossing the server→client boundary
  const serializedPersonData: PersonRow = JSON.parse(JSON.stringify(personData))

  return (
    <ResumeRoom
      userId={id}
      initialData={serializedPersonData}
      userInfo={{
        id: user.id,
        name: user.user_metadata?.full_name || user.email || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      }}
    >
      <ResumeViewer isOwner={isOwner} userId={id} />
    </ResumeRoom>
  )
}
