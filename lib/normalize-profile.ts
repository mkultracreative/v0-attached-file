import { Profile } from "@/lib/schemas"
import type { ProfileLiveData } from "@/lib/schemas"

export function normalizeProfile(input: unknown): ProfileLiveData {
  const parsed = Profile.safeParse(input)
  if (!parsed.success) {
    console.error("Profile normalization failed", parsed.error.flatten())
    return Profile.parse({})
  }
  return parsed.data
}
