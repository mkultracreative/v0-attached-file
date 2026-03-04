"use client"

import type { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { LiveObject, LiveList } from "@liveblocks/client"
import { Loader2 } from "lucide-react"
import type {
  ProfileLiveData,
  ResumeThemeLiveData,
  SettingsLiveData,
} from "@/lib/schemas"
import { normalizeProfile } from "@/lib/normalize-profile"

interface PersonData {
  id: string
  resume_content: ProfileLiveData
  resume_content_modified?: ProfileLiveData
  theme_data?: ResumeThemeLiveData
  public_identifier?: string
  vanity_url?: string
}

interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
}

interface ResumeRoomProps {
  children: ReactNode
  userId: string
  initialData: PersonData
  userInfo: UserInfo
}

const defaultTheme: ResumeThemeLiveData = {
  name: "Classic",
  colors: {
    primary: "#1a1a1a",
    secondary: "#666666",
    accent: "#0066cc",
    background: "#ffffff",
    text: "#1a1a1a",
  },
  fonts: { heading: "Inter", body: "Inter" },
  layout: { spacing: "comfortable", borderRadius: "sm" },
}

const defaultSettings: SettingsLiveData = {
  isEditMode: false,
  lastModified: new Date().toISOString(),
}

function toLiveProfile(data: ProfileLiveData) {
  const obj: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      obj[k] = new LiveList(
        v.map((item) => {
          if (typeof item === "object" && item !== null) {
            const inner: Record<string, any> = {}
            for (const [ik, iv] of Object.entries(item)) {
              if (typeof iv === "object" && iv !== null && !Array.isArray(iv)) {
                inner[ik] = new LiveObject(iv as any)
              } else {
                inner[ik] = iv
              }
            }
            return new LiveObject(inner)
          }
          return item
        }),
      )
    } else if (typeof v === "object" && v !== null) {
      obj[k] = new LiveObject(v as any)
    } else {
      obj[k] = v
    }
  }
  return new LiveObject(obj)
}

function toLiveTheme(data: ResumeThemeLiveData) {
  return new LiveObject({
    name: data.name,
    colors: new LiveObject(data.colors),
    fonts: new LiveObject(data.fonts),
    layout: new LiveObject(data.layout),
  })
}

export function ResumeRoom({ children, userId, initialData }: ResumeRoomProps) {
  const rawProfile = initialData.resume_content_modified ?? initialData.resume_content
  const profile = normalizeProfile(rawProfile)
  const theme = initialData.theme_data ?? defaultTheme

  return (
    <LiveblocksProvider
      authEndpoint={async () => {
        const res = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: `resume-${userId}` }),
        })
        return res.json()
      }}
    >
      <RoomProvider
        id={`resume-${userId}`}
        initialPresence={{ cursor: null, selectedField: null }}
        initialStorage={{
          profile: toLiveProfile(profile),
          theme: toLiveTheme(theme),
          settings: new LiveObject(defaultSettings),
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
