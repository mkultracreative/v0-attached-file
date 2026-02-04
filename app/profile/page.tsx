import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileSnapshotCard } from "@/components/profile-snapshot-card"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user exists in people table and has resume data
  const { data: personData } = await supabase.from("people").select("*").eq("id", user.id).single()

  const hasResume = !!personData?.resume_content

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <ProfileSnapshotCard user={user} hasResume={hasResume} personData={personData} />
    </div>
  )
}
