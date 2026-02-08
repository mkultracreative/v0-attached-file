import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSnapshotCard } from "@/components/profile-snapshot-card";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    redirect("/auth/login?error=session_invalid");
  }

  // Check if user exists in people table
  const { data: personData, error: personError } = await supabase
    .from("people")
    .select("*")
    .eq("id", user.id)
    .single();

  if (personError) {
    console.error("Database error:", personError);
    // Don't throw — render without person data
  }

  // Resume validation logic...
  const raw = personData?.resume_content as Record<string, unknown> | null;
  let hasResume = false;
  if (
    raw &&
    typeof raw === "object" &&
    !("backwards_compatibility_notes" in raw)
  ) {
    if (raw.full_name || raw.first_name || Array.isArray(raw.experiences)) {
      hasResume = true;
    }
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
