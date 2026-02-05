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
       Endpoint: GET /api/v2/profile/resolve/email
       enrich_profile=skip (default) — we only need the identifier
       Per docs: valid values are "skip" (default) and "enrich"
       We use "skip" because we chain with Step 2 for live data
       ------------------------------------------------------- */

    const step1Params = new URLSearchParams({
      email: user.email,
      lookup_depth: "deep",
      enrich_profile: "skip",
    })

    console.log("[v0] Step 1: Email lookup for", user.email)

    const emailRes = await fetch(
      `https://enrichlayer.com/api/v2/profile/resolve/email?${step1Params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!emailRes.ok) {
      const raw = await emailRes.text()
      console.log("[v0] Step 1 failed:", emailRes.status, raw)
      return NextResponse.json(
        { error: "Email lookup failed", status: emailRes.status, detail: raw },
        { status: 502 }
      )
    }

    const emailData = await emailRes.json()
    console.log("[v0] Step 1 response keys:", Object.keys(emailData))

    // Extract public_identifier — it could be at root or nested
    // Also try to extract from linkedin_profile_url if present
    let publicIdentifier =
      emailData?.public_identifier ??
      emailData?.profile?.public_identifier ??
      null

    // Fallback: parse from linkedin_profile_url
    if (!publicIdentifier) {
      const linkedinUrl =
        emailData?.linkedin_profile_url ?? emailData?.profile?.linkedin_profile_url
      if (linkedinUrl && typeof linkedinUrl === "string") {
        const match = linkedinUrl.match(/\/in\/([^/]+)\/?/)
        if (match) {
          publicIdentifier = match[1]
        }
      }
    }

    if (!publicIdentifier) {
      console.log(
        "[v0] No public_identifier found. Full response:",
        JSON.stringify(emailData).slice(0, 1000)
      )
      return NextResponse.json(
        {
          error: "Could not resolve LinkedIn profile from email",
          detail: emailData,
        },
        { status: 404 }
      )
    }

    console.log("[v0] Step 1 resolved public_identifier:", publicIdentifier)

    /* -------------------------------------------------------
       STEP 2 — Full Person Profile fetch (LIVE, not cached)
       Endpoint: GET /api/v2/profile
       Per docs: "chain this API call with the linkedin_profile_url
       result with the Person Profile Endpoint"
       
       We use:
       - linkedin_profile_url (the only required url — omit twitter/facebook entirely)
       - extra=include
       - github_profile_id=include
       - facebook_profile_id=include
       - twitter_profile_id=include
       - personal_contact_number=include
       - personal_email=include
       - inferred_salary=include
       - skills=include
       - fallback_to_cache=never  (never return stale data)
       - live_fetch=force          (bypass cache, get live data)
       
       NOTE: twitter_profile_url and facebook_profile_url params are
       OMITTED entirely. Per docs only one of the three URL params
       is required. Sending empty strings would be treated as real
       data and could error. Omitting = ignored by the API.
       ------------------------------------------------------- */

    // Delay between chained calls to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const step2Params = new URLSearchParams({
      linkedin_profile_url: `https://linkedin.com/in/${publicIdentifier}/`,
      extra: "include",
      github_profile_id: "include",
      facebook_profile_id: "include",
      twitter_profile_id: "include",
      personal_contact_number: "include",
      personal_email: "include",
      inferred_salary: "include",
      skills: "include",
      fallback_to_cache: "never",
      live_fetch: "force",
    })

    console.log("[v0] Step 2: Person Profile fetch for", publicIdentifier)

    const profileRes = await fetch(
      `https://enrichlayer.com/api/v2/profile?${step2Params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!profileRes.ok) {
      const raw = await profileRes.text()
      console.log("[v0] Step 2 failed:", profileRes.status, raw)
      return NextResponse.json(
        {
          error: "Profile fetch failed",
          status: profileRes.status,
          detail: raw,
        },
        { status: 502 }
      )
    }

    const profileData = await profileRes.json()
    console.log(
      "[v0] Step 2 response keys:",
      Object.keys(profileData),
      "full_name:",
      profileData.full_name
    )

    /* -------------------------------------------------------
       HARD GUARD — reject metadata-only / compatibility notes
       A real profile will have full_name or first_name or experiences
       ------------------------------------------------------- */

    if (
      !profileData ||
      typeof profileData !== "object" ||
      "backwards_compatibility_notes" in profileData ||
      (!profileData.full_name &&
        !profileData.first_name &&
        !Array.isArray(profileData.experiences))
    ) {
      console.log(
        "[v0] Invalid payload:",
        JSON.stringify(profileData).slice(0, 500)
      )
      return NextResponse.json(
        {
          error: "EnrichLayer returned metadata instead of profile data",
          detail: profileData,
        },
        { status: 502 }
      )
    }

    /* -------------------------------------------------------
       STEP 3 — Sanitize: strip nulls, ensure public_identifier
       ------------------------------------------------------- */

    const sanitized = sanitizeProfile(profileData)
    sanitized.public_identifier = publicIdentifier

    console.log(
      "[v0] Sanitized. full_name:",
      sanitized.full_name,
      "experiences:",
      Array.isArray(sanitized.experiences)
        ? (sanitized.experiences as unknown[]).length
        : 0
    )

    /* -------------------------------------------------------
       STEP 4 — Save to Supabase people table
       ------------------------------------------------------- */

    const { error: upsertError } = await supabase.from("people").upsert(
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

    console.log("[v0] Profile saved for user:", user.id)

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
 * Recursively strip null/undefined values from the profile.
 * Arrays keep non-null items. Objects recurse. Primitives pass through.
 * This prevents "Do not set any values to null" issues downstream.
 */
function sanitizeProfile(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue // omit nulls entirely
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
