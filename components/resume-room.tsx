"use client";

import type { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveObject, LiveList } from "@liveblocks/client";
import { Loader2 } from "lucide-react";

interface ResumeRoomProps {
  children: ReactNode;
  userId: string;
  initialData: any;
  userInfo: any;
}

export function ResumeRoom({ children, userId, initialData }: ResumeRoomProps) {
  // Get raw profile data
  const rawProfile =
    initialData?.resume_content_modified ?? initialData?.resume_content;

  // Normalize to handle both flat and wrapped formats
  const profileData = rawProfile?.profiles?.[0] ?? rawProfile ?? {};

  // Create LiveObject with LiveList children
  const profile = new LiveObject({
    full_name: profileData.full_name || "",
    headline: profileData.headline || profileData.occupation || "",
    summary: profileData.summary || "",
    city: profileData.city || "",
    state: profileData.state || "",
    country: profileData.country || "",
    profile_pic_url: profileData.profile_pic_url || "",
    skills: new LiveList(profileData.skills || []),
    experiences: new LiveList(
      (profileData.experiences || []).map(
        (e: any) =>
          new LiveObject({
            title: e.title || "",
            company: e.company || "",
            description: e.description || "",
            location: e.location || "",
            starts_at: e.starts_at || null,
            ends_at: e.ends_at || null,
          })
      )
    ),
    education: new LiveList(
      (profileData.education || []).map(
        (e: any) =>
          new LiveObject({
            school: e.school || "",
            degree_name: e.degree_name || "",
            field_of_study: e.field_of_study || "",
            starts_at: e.starts_at || null,
            ends_at: e.ends_at || null,
          })
      )
    ),
  });

  const theme = new LiveObject({
    name: "Classic",
    colors: {
      primary: "#1a1a1a",
      secondary: "#666666",
      accent: "#0066cc",
      background: "#ffffff",
      text: "#1a1a1a",
    },
  });

  const settings = new LiveObject({
    isEditMode: false,
    lastModified: new Date().toISOString(),
  });

  return (
    <LiveblocksProvider
      authEndpoint={async () => {
        const res = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: `resume-${userId}` }),
        });
        if (!res.ok) throw new Error("Failed to authenticate");
        return res.json();
      }}
    >
      <RoomProvider
        id={`resume-${userId}`}
        initialPresence={{ cursor: null, selectedField: null }}
        initialStorage={{ profile, theme, settings }}
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
