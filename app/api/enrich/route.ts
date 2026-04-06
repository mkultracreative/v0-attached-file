import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    console.log("[enrich] Step 1:", step1Url.toString())

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
      console.warn("[enrich] Step 1: no linkedin_profile_url for email:", email)
      return NextResponse.json({ success: false, reason: "no_profile_found", step1: step1Data }, { status: 200 })
    }

    console.log("[enrich] Step 1 resolved:", linkedinProfileUrl)

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

    console.log("[enrich] Step 2:", step2Url.toString())

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

    // Parse to object — never stringify before passing to Supabase.
    // Supabase client handles JSONB serialization internally.
    // Double-stringifying causes it to be stored as a text string instead of JSONB.
    const rawProfile = JSON.parse(step2Raw)

    console.log("[enrich] Saving — full_name:", rawProfile?.full_name)

    const { error: upsertError } = await supabase.from("people").upsert(
      {
        user_id: user.id,
        email,
        resume_content: rawProfile,
        resume_content_modified: rawProfile,
        public_identifier: rawProfile?.public_identifier ?? null,
        last_enriched_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (upsertError) {
      console.error("[enrich] Supabase upsert error:", upsertError)
      return NextResponse.json({ error: "Failed to save profile", detail: upsertError.message }, { status: 500 })
    }

    console.log("[enrich] Saved for user:", user.id)
    return NextResponse.json({ success: true, profile: rawProfile })

  } catch (err) {
    console.error("[enrich] Unhandled error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 })
  }
}
