import { z } from "zod"

/* ------------------------------------------------------------------
   Every field is optional. EnrichLayer may return null, undefined,
   or simply omit any field. Only public_identifier is the stable
   unique key. Everything else coerces to a safe empty default.
------------------------------------------------------------------ */

const s = z.string().nullish().transform(v => v ?? "")
const n = z.number().nullish().transform(v => v ?? 0)

const DateModel = z.object({
  day:   z.number().nullish().transform(v => v ?? undefined),
  month: z.number().nullish().transform(v => v ?? undefined),
  year:  z.number().nullish().transform(v => v ?? undefined),
}).nullish().transform(v => v ?? undefined)

const Experience = z.object({
  company:                      s,
  company_linkedin_profile_url: s,
  title:                        s,
  description:                  s,
  location:                     s,
  logo_url:                     s,
  starts_at:                    DateModel,
  ends_at:                      DateModel,
}).passthrough() // allow extra fields from raw EnrichLayer without throwing

const Education = z.object({
  school:                      s,
  school_linkedin_profile_url: s,
  degree_name:                 s,
  field_of_study:              s,
  description:                 s,
  logo_url:                    s,
  grade:                       s,
  activities_and_societies:    s,
  starts_at:                   DateModel,
  ends_at:                     DateModel,
}).passthrough()

const Certification = z.object({
  name:           s,
  authority:      s,
  license_number: s,
  display_source: s,
  url:            s,
  starts_at:      DateModel,
  ends_at:        DateModel,
}).passthrough()

const Project = z.object({
  title:       s,
  description: s,
  url:         s,
  starts_at:   DateModel,
  ends_at:     DateModel,
}).passthrough()

const VolunteerWork = z.object({
  title:       s,
  cause:       s,
  company:     s,
  description: s,
  logo_url:    s,
  starts_at:   DateModel,
  ends_at:     DateModel,
}).passthrough()

const HonorAward = z.object({
  title:       s,
  issuer:      s,
  description: s,
  issued_on:   DateModel,
}).passthrough()

const Publication = z.object({
  name:         s,
  publisher:    s,
  description:  s,
  url:          s,
  published_on: DateModel,
}).passthrough()

const arr = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (v) => (Array.isArray(v) ? v : []),
    z.array(schema).catch([])
  )

export const ResumeCanonicalSchema = z.object({
  public_identifier:          s,
  profile_pic_url:            s,
  first_name:                 s,
  last_name:                  s,
  full_name:                  s,
  headline:                   s,
  summary:                    s,
  occupation:                 s,

  city:                       s,
  state:                      s,
  country:                    s,
  country_full_name:          s,

  connections:                n,
  follower_count:             n,

  skills:                     arr(s),
  languages:                  arr(s),
  interests:                  arr(s),
  recommendations:            arr(s),

  experiences:                arr(Experience),
  education:                  arr(Education),
  certifications:             arr(Certification),
  volunteer_work:             arr(VolunteerWork),
  accomplishment_projects:    arr(Project),
  accomplishment_honors_awards: arr(HonorAward),
  accomplishment_publications:  arr(Publication),
  accomplishment_organisations: arr(z.object({ name: s, title: s, description: s, starts_at: DateModel, ends_at: DateModel }).passthrough()),
  accomplishment_courses:     arr(z.object({ name: s, number: s }).passthrough()),
  accomplishment_test_scores: arr(z.object({ name: s, score: s, description: s, date_on: DateModel }).passthrough()),
  accomplishment_patents:     arr(z.object({ title: s, issuer: s, description: s, url: s, patent_number: s, application_number: s, issued_on: DateModel }).passthrough()),

  people_also_viewed:         arr(z.object({ name: s, link: s, summary: s, location: s }).passthrough()),
  similarly_named_profiles:   arr(z.object({ name: s, link: s, summary: s, location: s }).passthrough()),
  activities:                 arr(z.object({ title: s, link: s, activity_status: s }).passthrough()),
  articles:                   arr(z.object({ title: s, link: s, author: s, image_url: s, published_date: DateModel }).passthrough()),
  groups:                     arr(z.object({ name: s, url: s, profile_pic_url: s }).passthrough()),

  personal_emails:            arr(s),
  personal_numbers:           arr(s),

  extra: z.object({
    github_profile_id:   s,
    facebook_profile_id: s,
    twitter_profile_id:  s,
    website:             s,
  }).passthrough().nullish().transform(v => v ?? { github_profile_id: "", facebook_profile_id: "", twitter_profile_id: "", website: "" }),

  inferred_salary: z.object({
    min: z.number().nullish().transform(v => v ?? 0),
    max: z.number().nullish().transform(v => v ?? 0),
  }).nullish().transform(v => v ?? { min: 0, max: 0 }),

  meta: z.object({
    last_updated: s,
  }).nullish().transform(v => v ?? { last_updated: "" }),
}).passthrough() // allow any extra top-level fields from raw EnrichLayer

export type ResumeCanonical = z.infer<typeof ResumeCanonicalSchema>

/* ------------------------------------------------------------------
   Always safe — uses safeParse and falls back to empty defaults.
   Never throws, even if `raw` is malformed or totally unexpected.
------------------------------------------------------------------ */
export function normalizeEnrichLayer(raw: unknown): ResumeCanonical {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>

  const result = ResumeCanonicalSchema.safeParse(data)

  if (result.success) {
    return result.data
  }

  console.error("[normalizeEnrichLayer] Schema parse failed, falling back to empty:", result.error.flatten())

  // Hard fallback — parse an empty object which will always succeed
  // because every field has a nullish transform with a default
  return ResumeCanonicalSchema.parse({})
}
