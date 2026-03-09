"use client";

import type { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveObject, LiveList } from "@liveblocks/client";
import { Loader2 } from "lucide-react";

import type {
  ProfileLiveData,
  ResumeThemeLiveData,
  SettingsLiveData,
} from "@/lib/schemas";

interface PersonData {
  id: string;
  resume_content: ProfileLiveData;
  resume_content_modified?: ProfileLiveData;
  theme_data?: ResumeThemeLiveData;
  public_identifier?: string;
  vanity_url?: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ResumeRoomProps {
  children: ReactNode;
  userId: string;
  initialData: PersonData;
  userInfo: UserInfo;
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
};

const defaultSettings: SettingsLiveData = {
  isEditMode: false,
  lastModified: new Date().toISOString(),
};

// Helper to ensure data is Liveblocks-compatible
function createLiveProfile(data: ProfileLiveData | null) {
  if (!data) {
    return new LiveObject({
      full_name: "",
      headline: "",
      summary: "",
      city: "",
      state: "",
      country: "",
      occupation: "",
      profile_pic_url: "",
      skills: new LiveList([]),
      languages: new LiveList([]),
      interests: new LiveList([]),
      experiences: new LiveList([]),
      education: new LiveList([]),
      certifications: new LiveList([]),
      projects: new LiveList([]),
    });
  }

  return new LiveObject({
    full_name: data.full_name || "",
    headline: data.headline || "",
    summary: data.summary || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "",
    occupation: data.occupation || "",
    profile_pic_url: data.profile_pic_url || "",
    skills: new LiveList(data.skills || []),
    languages: new LiveList(data.languages || []),
    interests: new LiveList(data.interests || []),
    experiences: new LiveList(
      (data.experiences || []).map((e) => new LiveObject(e))
    ),
    education: new LiveList(
      (data.education || []).map((e) => new LiveObject(e))
    ),
    certifications: new LiveList(
      (data.certifications || []).map((c) => new LiveObject(c))
    ),
    projects: new LiveList(
      (data.experiences || []).map((p) => new LiveObject(p))
    ),
  });
}

export function ResumeRoom({ children, userId, initialData }: ResumeRoomProps) {
  const rawProfile =
    initialData.resume_content_modified ?? initialData.resume_content;
  const theme = new LiveObject(initialData.theme_data ?? defaultTheme);

  return (
    <LiveList = createClient(LiveblocksProvider>)
      
    {
      const res = await fetch("/api/liveblocks-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: `resume-${userId}` }),
      });
      return res.json();
    })>

      <RoomProvider
        id={`resume-${userId}`}
        initialPresence={{ cursor: null, selectedField: null }}
        initialStorage={{
          profile,
          theme,
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
  );
}
