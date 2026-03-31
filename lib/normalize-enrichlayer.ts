import { z } from "zod"

/* ------------------------------------------------------------------
   Canonical Resume Schema (UI-safe, no nulls, stable defaults)
   ------------------------------------------------------------------ */

   const DateModel = z
     .object({
         day: z.number().int().min(1).max(31).optional(),
             month: z.number().int().min(1).max(12).optional(),
                 year: z.number().int().optional(),
                   })
                     .optional()

                     const Experience = z.object({
                       company: z.string().default(""),
                         title: z.string().default(""),
                           description: z.string().default(""),
                             location: z.string().default(""),
                               logo_url: z.string().default(""),
                                 starts_at: DateModel,
                                   ends_at: DateModel,
                                   })

                                   const Education = z.object({
                                     school: z.string().default(""),
                                       degree_name: z.string().default(""),
                                         field_of_study: z.string().default(""),
                                           description: z.string().default(""),
                                             logo_url: z.string().default(""),
 starts_at: DateModel,
   ends_at: DateModel,
   })

   export const ResumeCanonicalSchema = z.object({
     full_name: z.string().default(""),
       headline: z.string().default(""),
         summary: z.string().default(""),

           city: z.string().default(""),
             state: z.string().default(""),
               country: z.string().default(""),

                 occupation: z.string().default(""),

                   skills: z.array(z.string()).default([]),
                     languages: z.array(z.string()).default([]),
                       interests: z.array(z.string()).default([]),

                         experiences: z.array(Experience).default([]),
                           education: z.array(Education).default([]),

                             certifications: z.array(
                                 z.object({
                                       name: z.string().default(""),
                                             authority: z.string().default(""),
   }),
     ).default([]),

       projects: z.array(
           z.object({
                 title: z.string().default(""),
                       description: z.string().default(""),
                             url: z.string().default(""),
                                 }),
                                   ).default([]),

                                     meta: z.object({
                                         last_updated: z.string().default(""),
                                           }).default({ last_updated: "" }),
                                           })

                                           export type ResumeCanonical = z.infer<typeof ResumeCanonicalSchema>

                                           /* ------------------------------------------------------------------
Normalizer (THIS replaces sanitizeProfile)
------------------------------------------------------------------ */

export function normalizeEnrichLayer(raw: unknown): ResumeCanonical {
  const data = (raw ?? {}) as Record<string, any>

    return ResumeCanonicalSchema.parse({
        full_name: data.full_name,
            headline: data.headline,
                summary: data.summary,

                    city: data.city,
                        state: data.state,
                            country: data.country,

                                occupation: data.occupation,

                                    skills: data.skills,
                                        languages: data.languages,
                                            interests: data.interests,

  experiences: data.experiences,
      education: data.education,

          certifications: data.certifications,
              projects: data.accomplishment_projects,

                  meta: data.meta,
                    })
                    }
