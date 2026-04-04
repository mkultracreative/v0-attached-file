import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeEnrichLayer } from "@/lib/normalize-enrichlayer"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const email = user.email
    if (!email) {
      return NextResponse.json({ error: "No email on auth record" }, { status: 400 })
    }

    const apiKey = process.env.ENRICHLAYER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ENRICHLAYER_API_KEY" }, { status: 500 })
    }

    // STEP 1 — Reverse email lookup
    const step1Url = new URL("https://enrichlayer.com/api/v2/profile/resolve/email")
    step1Url.searchParams.set("email", email)
    step1Url.searchParams.set("lookup_depth", "deep")
    step1Url.searchParams.set("enrich_profile", "skip")

    console.log("[enrich] Step 1 request:", step1Url.toString())

    const step1Res = await fetch(step1Url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    const step1Raw = await step1Res.text()
    console.log("[enrich] Step 1 status:", step1Res.status)
    console.log("[enrich] Step 1 response:", step1Raw)

    if (!step1Res.ok) {
      return NextResponse.json({ error: "Step 1 failed", status: step1Res.status, raw: step1Raw }, { status: 502 })
    }

    const step1Data = JSON.parse(step1Raw)
    const linkedinProfileUrl: string | null = step1Data?.linkedin_profile_url ?? null

    if (!linkedinProfileUrl) {
      console.warn("[enrich] Step 1 returned no linkedin_profile_url")
      return NextResponse.json({ success: false, reason: "no_profile_found", step1: step1Data }, { status: 200 })
    }

    // STEP 2 — Full profile fetch
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const step2Url = new URL("https://enrichlayer.com/api/v2/profile")
    step2Url.searchParams.set("profile_url", linkedinProfileUrl)
    step2Url.searchParams.set("extra", "include")
    step2Url.searchParams.set("github_profile_id", "include")
    step2Url.searchParams.set("facebook_profile_id", "include")
    step2Url.searchParams.set("twitter_profile_id", "include")
    step2Url.searchParams.set("personal_contact_number", "include")
    step2Url.searchParams.set("personal_email", "include")
    step2Url.searchParams.set("inferred_salary", "include")
    step2Url.searchParams.set("skills", "include")
    step2Url.searchParams.set("live_fetch", "force")

    console.log("[enrich] Step 2 request:", step2Url.toString())

    const step2Res = await fetch(step2Url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    const step2Raw = await step2Res.text()
    console.log("[enrich] Step 2 status:", step2Res.status)
    console.log("[enrich] Step 2 response:", step2Raw)

    if (!step2Res.ok) {
      return NextResponse.json({ error: "Step 2 failed", status: step2Res.status, raw: step2Raw }, { status: 502 })
    }

    const rawProfile = JSON.parse(step2Raw)

    // Normalize into ResumeCanonical — fills all fields with empty defaults, no nulls
    const canonical = normalizeEnrichLayer(rawProfile)

    console.log("[enrich] Normalized — full_name:", canonical.full_name, "| experiences:", canonical.experiences.length)

    // Upsert into people table
    const { error: upsertError } = await supabase.from("people").upsert(
      {
        user_id: user.id,
        email,
        resume_content: canonical,
        resume_content_modified: canonical,
        last_enriched_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (upsertError) {
      console.error("[enrich] Supabase upsert error:", upsertError)
      return NextResponse.json({ error: "Failed to save profile", detail: upsertError.message }, { status: 500 })
    }

    console.log("[enrich] Saved for user:", user.id)
    return NextResponse.json({ success: true, profile: canonical })

  } catch (err) {
    console.error("[enrich] Unhandled error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 })
  }
}
