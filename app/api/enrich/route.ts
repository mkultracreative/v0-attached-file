import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeEnrichLayer } from "@/lib/normalize-enrichlayer"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email from the Supabase auth record — this is the email LinkedIn
    // authenticated with, which is what EnrichLayer's reverse lookup needs.
    const email = user.email
    if (!email) {
      return NextResponse.json({ error: "No email on auth record" }, { status: 400 })
    }

    const apiKey = process.env.ENRICHLAYER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ENRICHLAYER_API_KEY" }, { status: 500 })
    }

    /* ------------------------------------------------------------------
       STEP 1 — Reverse email lookup → get linkedin_profile_url
       enrich_profile=skip so we don't burn a credit on cached data here,
       we'll fetch fresh in step 2.
       Returns: { linkedin_profile_url: string | null, ... }
    ------------------------------------------------------------------ */
    const step1Url = new URL("https://enrichlayer.com/api/v2/profile/resolve/email")
    step1Url.searchParams.set("email", email)
    step1Url.searchParams.set("lookup_depth", "deep")
    step1Url.searchParams.set("enrich_profile", "skip")

    console.log("[enrich] Step 1: reverse email lookup for", email)

    const step1Res = await fetch(step1Url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!step1Res.ok) {
      const detail = await step1Res.text()
      console.error("[enrich] Step 1 failed:", step1Res.status, detail)
      return NextResponse.json(
        { error: `Email lookup failed (${step1Res.status})`, detail },
        { status: 502 }
      )
    }

    const step1Data = await step1Res.json()
    console.log("[enrich] Step 1 response keys:", Object.keys(step1Data))

    // The docs say step 1 returns linkedin_profile_url — use it directly.
    const linkedinProfileUrl: string | null =
      step1Data?.linkedin_profile_url ?? null

    if (!linkedinProfileUrl) {
      console.error("[enrich] Step 1 returned no linkedin_profile_url:", JSON.stringify(step1Data).slice(0, 500))
      return NextResponse.json(
        { error: "Could not resolve a LinkedIn profile URL from this email", detail: step1Data },
        { status: 404 }
      )
    }

    console.log("[enrich] Step 1 resolved URL:", linkedinProfileUrl)

    /* ------------------------------------------------------------------
       Brief pause between chained calls — avoids hammering the API and
       gives Liveblocks/React time to settle before we push new data.
    ------------------------------------------------------------------ */
    await new Promise((resolve) => setTimeout(resolve, 1000))

    /* ------------------------------------------------------------------
       STEP 2 — Full profile fetch using the URL from step 1.
       Per docs: chain with linkedin_profile_url result using profile_url param.
       live_fetch=force → always fetch fresh data, no cache
       All optional fields explicitly included so the response is complete.
    ------------------------------------------------------------------ */
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

    console.log("[enrich] Step 2: full profile fetch for", linkedinProfileUrl)

    const step2Res = await fetch(step2Url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!step2Res.ok) {
      const detail = await step2Res.text()
      console.error("[enrich] Step 2 failed:", step2Res.status, detail)
      return NextResponse.json(
        { error: `Profile fetch failed (${step2Res.status})`, detail },
        { status: 502 }
      )
    }

    const rawProfile = await step2Res.json()
    console.log("[enrich] Step 2 response keys:", Object.keys(rawProfile), "| full_name:", rawProfile?.full_name)

    /* ------------------------------------------------------------------
       STEP 3 — Normalize through ResumeCanonical schema.
       normalizeEnrichLayer guarantees all fields are present with empty
       string / empty array defaults — no nulls, no missing keys.
       This is what gets stored in Supabase and fed to Liveblocks.
    ------------------------------------------------------------------ */
    const canonical = normalizeEnrichLayer(rawProfile)

    console.log(
      "[enrich] Normalized — full_name:", canonical.full_name,
      "| experiences:", canonical.experiences.length,
      "| education:", canonical.education.length,
      "| skills:", canonical.skills.length
    )

    /* ------------------------------------------------------------------
       STEP 4 — Upsert into people table.
       Both resume_content (source of truth) and resume_content_modified
       (editable copy) are set on first enrichment.
    ------------------------------------------------------------------ */
    const { error: upsertError } = await supabase.from("people").upsert(
      {
        id: user.id,
        email,
        resume_content: canonical,
        resume_content_modified: canonical,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    if (upsertError) {
      console.error("[enrich] Supabase upsert error:", upsertError)
      return NextResponse.json(
        { error: "Failed to save profile", detail: upsertError.message },
        { status: 500 }
      )
    }

    console.log("[enrich] Saved for user:", user.id)

    return NextResponse.json({ success: true, profile: canonical })

  } catch (err) {
    console.error("[enrich] Unhandled error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
