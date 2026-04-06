"use client"

import type { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { Loader2 } from "lucide-react"
import type { ResumeThemeLiveData, SettingsLiveData } from "@/lib/schemas"
import { normalizeEnrichLayer } from "@/lib/normalize-enrichlayer"
import { hydrateResumeLive } from "@/lib/hydrate-resume-live"
import type { PersonRow } from "@/app/profile/page"

interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
}

interface ResumeRoomProps {
  children: ReactNode
  userId: string
  initialData: PersonRow
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

export function ResumeRoom({ children, userId, initialData }: ResumeRoomProps) {
  const rawResume = initialData.resume_content_modified ?? initialData.resume_content

  // Use safeParse so a bad data shape never crashes the client with a ZodError.
  // Falls back to an empty-but-valid canonical object on failure.
  let canonical
  try {
    canonical = normalizeEnrichLayer(rawResume ?? {})
  } catch (err) {
    console.error("[ResumeRoom] normalizeEnrichLayer failed, using empty fallback:", err)
    canonical = normalizeEnrichLayer({})
  }

  const profile = hydrateResumeLive(canonical)
  const theme = (initialData.theme_data as ResumeThemeLiveData | null) ?? defaultTheme

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
          profile,
          theme,
          settings: defaultSettings,
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
