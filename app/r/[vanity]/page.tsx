import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicResumeViewer } from "@/components/public-resume-viewer"

interface PageProps {
  params: Promise<{ vanity: string }>
}

export default async function PublicResumePage({ params }: PageProps) {
  const { vanity } = await params
  const supabase = await createClient()

  // Try to find by vanity_url first, then by public_identifier, then by id
  let personData = null

  const { data: byVanity } = await supabase.from("people").select("*").eq("vanity_url", vanity).single()

  if (byVanity) {
    personData = byVanity
  } else {
    const { data: byIdentifier } = await supabase.from("people").select("*").eq("public_identifier", vanity).single()

    if (byIdentifier) {
      personData = byIdentifier
    } else {
      const { data: byId } = await supabase.from("people").select("*").eq("id", vanity).single()

      personData = byId
    }
  }

  if (!personData?.resume_content) {
    notFound()
  }

  return <PublicResumeViewer data={personData} />
}
