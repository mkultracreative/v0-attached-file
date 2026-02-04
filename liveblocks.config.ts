import { createClient } from "@liveblocks/client"
import type { ProfileLiveData, ResumeThemeLiveData, SettingsLiveData } from "@/lib/schemas"

export const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
})

// Presence represents the properties that exist on every user in the Room
export type Presence = {
  cursor: { x: number; y: number } | null
  selectedField: string | null
}

// Storage represents the shared document state
export type Storage = {
  profile: ProfileLiveData
  theme: ResumeThemeLiveData
  settings: SettingsLiveData
}

// UserMeta represents static data on each user
export type UserMeta = {
  id: string
  info: {
    name: string
    email: string
    avatar?: string
  }
}

// Re-export types for convenience
export type { ProfileLiveData, ResumeThemeLiveData, SettingsLiveData }
