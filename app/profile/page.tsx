'use client'

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSnapshotCard } from "@/components/profile-snapshot-card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Check if user exists in people table and has resume data
  const { data: personData } = await supabase
    .from("people")
    .select("*")
    .eq("id", user.id)
    .single();

  // Only treat as "has resume" if resume_content contains actual profile data.
  // The data could be in flat format { full_name, experiences, ... }
  // OR wrapped format { profiles: [{ full_name, experiences, ... }] }
  // Reject junk metadata (backwards_compatibility_notes) or empty payloads.
  const raw = personData?.resume_content as Record<string, unknown> | null;
  let hasResume = false;
  if (
    raw &&
    typeof raw === "object" &&
    !("backwards_compatibility_notes" in raw)
  ) {
    // Check flat format
    if (raw.full_name || raw.first_name || Array.isArray(raw.experiences)) {
      hasResume = true;
    }
    // Check wrapped { profiles: [...] } format
    if (!hasResume && Array.isArray(raw.profiles) && raw.profiles.length > 0) {
      const firstProfile = raw.profiles[0] as Record<string, unknown>;
      if (
        firstProfile?.full_name ||
        firstProfile?.first_name ||
        Array.isArray(firstProfile?.experiences)
      ) {
        hasResume = true;
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <ProfileSnapshotCard
        user={user}
        hasResume={hasResume}
        personData={personData}
      />
    </div>
  );
}
''''''