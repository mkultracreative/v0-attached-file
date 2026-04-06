import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileSnapshotCard } from "@/components/profile-snapshot-card"
import type { ResumeCanonical } from "@/lib/normalize-enrichlayer"

// Mirrors the actual `people` table (setup_database.sql + 002_add_vanity_url.sql)
export interface PersonRow {
  id: string        // internal row uuid
  user_id: string   // foreign key → auth.users.id — use this to match auth session
  email: string | null
  public_identifier: string | null
  vanity_url: string | null
  resume_content: ResumeCanonical | null
  resume_content_modified: ResumeCanonical | null
  theme_data: Record<string, unknown> | null
  plan: string | null
  last_enriched_at: string | null
  created_at: string
  updated_at: string
}

export default async function ProfilePage() {
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
    .eq("user_id", user.id)
    .single<PersonRow>()

  // hasResume=true  → resume_content has real data → ProfileSnapshotCard skips EnrichLayer
  // hasResume=false → resume_content is null/empty    → ProfileSnapshotCard triggers /api/enrich
  // ResumeCanonical is always flat — never a { profiles: [...] } wrapper
  // resume_content is raw EnrichLayer JSON — check any real field
  const resume = personData?.resume_content as Record<string, unknown> | null
  const hasResume = !!(resume && (resume.full_name || resume.public_identifier))

  // Serialize Supabase objects to plain JSON before crossing the server→client boundary
  const serializedUser = JSON.parse(JSON.stringify(user))
  const serializedPersonData: PersonRow | null = personData
    ? JSON.parse(JSON.stringify(personData))
    : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <ProfileSnapshotCard
        user={serializedUser}
        hasResume={hasResume}
        personData={serializedPersonData}
      />
    </div>
  )
}
