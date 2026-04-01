import { createClient } from "@liveblocks/client"
import type { LiveObject, LiveList } from "@liveblocks/client"
import type { ResumeThemeLiveData, SettingsLiveData } from "@/lib/schemas"

export const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
})

// Presence represents the properties that exist on every user in the Room
export type Presence = {
  cursor: { x: number; y: number } | null
  selectedField: string | null
}

// Mirrors the shape that hydrateResumeLive() produces — LiveObject/LiveList wrappers
// around the ResumeCanonical fields. This is what's actually stored in Liveblocks.
type LiveExperience = LiveObject<{
  company: string
  title: string
  description: string
  location: string
  logo_url: string
  starts_at?: { day?: number; month?: number; year?: number }
  ends_at?: { day?: number; month?: number; year?: number }
}>

type LiveEducation = LiveObject<{
  school: string
  degree_name: string
  field_of_study: string
  description: string
  logo_url: string
  starts_at?: { day?: number; month?: number; year?: number }
  ends_at?: { day?: number; month?: number; year?: number }
}>

type LiveCertification = LiveObject<{ name: string; authority: string }>
type LiveProject = LiveObject<{ title: string; description: string; url: string }>

export type LiveProfile = LiveObject<{
  full_name: string
  headline: string
  summary: string
  city: string
  state: string
  country: string
  occupation: string
  skills: LiveList<string>
  languages: LiveList<string>
  interests: LiveList<string>
  experiences: LiveList<LiveExperience>
  education: LiveList<LiveEducation>
  certifications: LiveList<LiveCertification>
  projects: LiveList<LiveProject>
  meta: LiveObject<{ last_updated: string }>
}>

// Storage represents the shared document state
export type Storage = {
  profile: LiveProfile
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

export type { ResumeThemeLiveData, SettingsLiveData }
