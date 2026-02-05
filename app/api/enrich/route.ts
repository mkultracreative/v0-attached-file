import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.ENRICHLAYER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ENRICHLAYER_API_KEY" },
        { status: 500 }
      )
    }

    /* -------------------------------------------------------
       STEP 1 — Reverse email lookup to get public_identifier
       Endpoint: /api/v2/profile/resolve/email
       enrich_profile=no so we ONLY get the identifier, no cached junk
       ------------------------------------------------------- */

    const emailParams = new URLSearchParams({
      email: user.email,
      lookup_depth: "deep",
      enrich_profile: "no",
    })

    console.log("[v0] Step 1: Email lookup for", user.email)

    const emailRes = await fetch(
      `https://enrichlayer.com/api/v2/profile/resolve/email?${emailParams.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!emailRes.ok) {
      const raw = await emailRes.text()
      console.log("[v0] Step 1 failed:", emailRes.status, raw)
      return NextResponse.json(
        { error: "Email lookup failed", status: emailRes.status, raw },
        { status: 502 }
      )
    }

    const emailData = await emailRes.json()
    console.log("[v0] Step 1 response keys:", Object.keys(emailData))

    // Extract public_identifier from response
    const publicIdentifier =
      emailData?.public_identifier ??
      emailData?.profile?.public_identifier ??
      emailData?.linkedin_profile_url?.split("/in/")[1]?.replace(/\/$/, "")

    if (!publicIdentifier) {
      console.log("[v0] No public_identifier found in:", JSON.stringify(emailData).slice(0, 500))
      return NextResponse.json(
        { error: "Could not resolve LinkedIn profile from email", emailData },
        { status: 404 }
      )
    }

    console.log("[v0] Step 1 resolved public_identifier:", publicIdentifier)

    /* -------------------------------------------------------
       STEP 2 — Full Person Profile fetch using linkedin_profile_url
       Endpoint: /api/v2/profile
       Chained with the public_identifier from Step 1
       Uses use_cache=if-present, live_fetch=force for fresh data
       ------------------------------------------------------- */

    // Small delay between chained calls to be safe
    await new Promise((resolve) => setTimeout(resolve, 800))

    const profileParams = new URLSearchParams({
      linkedin_profile_url: `https://linkedin.com/in/${publicIdentifier}/`,
      extra: "include",
      github_profile_id: "include",
      facebook_profile_id: "include",
      twitter_profile_id: "include",
      personal_contact_number: "include",
      personal_email: "include",
      inferred_salary: "include",
      skills: "include",
      use_cache: "if-present",
      fallback_to_cache: "on-error",
      live_fetch: "force",
    })

    console.log("[v0] Step 2: Person Profile fetch for", publicIdentifier)

    const profileRes = await fetch(
      `https://enrichlayer.com/api/v2/profile?${profileParams.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!profileRes.ok) {
      const raw = await profileRes.text()
      console.log("[v0] Step 2 failed:", profileRes.status, raw)
      return NextResponse.json(
        { error: "Profile fetch failed", status: profileRes.status, raw },
        { status: 502 }
      )
    }

    const profileData = await profileRes.json()
    console.log("[v0] Step 2 response keys:", Object.keys(profileData))

    /* -------------------------------------------------------
       HARD GUARD — reject metadata-only / compatibility payloads
       A valid profile MUST have full_name or experiences
       ------------------------------------------------------- */

    if (
      !profileData ||
      typeof profileData !== "object" ||
      "backwards_compatibility_notes" in profileData ||
      (!profileData.full_name && !profileData.first_name && !profileData.experiences)
    ) {
      console.log("[v0] Invalid payload detected:", JSON.stringify(profileData).slice(0, 500))
      return NextResponse.json(
        { error: "EnrichLayer returned metadata instead of profile data", raw: profileData },
        { status: 502 }
      )
    }

    /* -------------------------------------------------------
       STEP 3 — Sanitize: strip nulls, inject public_identifier
       ------------------------------------------------------- */

    const sanitized = sanitizeProfile(profileData)
    // Ensure public_identifier is always present
    sanitized.public_identifier = publicIdentifier

    console.log("[v0] Sanitized profile. full_name:", sanitized.full_name, "experiences:", Array.isArray(sanitized.experiences) ? sanitized.experiences.length : 0)

    /* -------------------------------------------------------
       STEP 4 — Save to Supabase people table
       Only write to columns that exist in the schema:
       id, email, resume_content, resume_content_modified, theme_data, plan
       ------------------------------------------------------- */

    const { error: upsertError } = await supabase
      .from("people")
      .upsert(
        {
          id: user.id,
          email: user.email,
          resume_content: sanitized,
          resume_content_modified: sanitized,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (upsertError) {
      console.log("[v0] Supabase upsert error:", upsertError)
      return NextResponse.json(
        { error: "Failed to save profile", details: upsertError.message },
        { status: 500 }
      )
    }

    console.log("[v0] Profile saved successfully for user:", user.id)

    return NextResponse.json({
      success: true,
      profile: sanitized,
    })
  } catch (err) {
    console.log("[v0] Unhandled error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * Recursively remove null values from the profile object.
 * Replace null with appropriate defaults (empty string, empty array, etc.)
 */
function sanitizeProfile(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      // Skip nulls entirely — don't include them
      continue
    }

    if (Array.isArray(value)) {
      result[key] = value
        .filter((v) => v !== null && v !== undefined)
        .map((v) =>
          typeof v === "object" && v !== null
            ? sanitizeProfile(v as Record<string, unknown>)
            : v
        )
    } else if (typeof value === "object") {
      result[key] = sanitizeProfile(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }

  return result
}
