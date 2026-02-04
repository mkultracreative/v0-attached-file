import { LiveObject } from "@liveblocks/client"
import { hydrateResumeLive } from "@/lib/hydrate-resume-live"
import type { ResumeCanonical } from "@/lib/normalize-enrichlayer"

interface RoomBootstrapParams {
  resume: ResumeCanonical | null
  }

  export function bootstrapRoom({ resume }: RoomBootstrapParams) {
    return {
        profile: resume
              ? hydrateResumeLive(resume)
                    : new LiveObject({
                              full_name: "",
                                        headline: "",
                                                  summary: "",
                                                            city: "",
                                                                      state: "",
                                                                                country: "",
                                                                                          occupation: "",
                                                                                                    skills: [],
                                                                                                              languages: [],
                                                                                                                        interests: [],
                                                                                                                                  experiences: [],
                                                                                                                                            education: [],
                                                                                                                                                      certifications: [],
                                                                                                                                                                projects: [],
                                                                                                                                                                          meta: { last_updated: "" },
                                                                                                                                                                                  }),

                                                                                                                                                                                      theme: new LiveObject({
                                                                                                                                                                                            colors: {
                                                                                                                                                                                                    primary: "#1a1a1a",
                                                                                                                                                                                                            secondary: "#666666",
                                                                                                                                                                                                                    accent: "#0066cc",
                                                                                                                                                                                                                            background: "#ffffff",
                                                                                                                                                                                                                                    text: "#1a1a1a",
                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                              }),
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                }
