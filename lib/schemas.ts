import { z } from "zod"

// =================================================================
// Settings & Theme LiveDatas for Liveblocks
// =================================================================

export const Settings = z.object({
  isEditMode: z.boolean(),
  lastModified: z.string(),
})

export type SettingsLiveData = z.infer<typeof Settings>

export const ResumeTheme = z.object({
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  layout: z.object({
    spacing: z.string(),
    borderRadius: z.string(),
  }),
})

export type ResumeThemeLiveData = z.infer<typeof ResumeTheme>

// =================================================================
// Profile Schemas - ALL fields optional to handle variable LinkedIn data
// =================================================================

export const DateModel = z.object({
  day: z.number().int().min(1).max(31).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
})
export type DateModelLiveData = z.infer<typeof DateModel>

export const Experiences = z.object({
  company: z.string().optional(),
  company_linkedin_profile_url: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  logo_url: z.string().optional(),
  starts_at: DateModel.optional(),
  ends_at: DateModel.optional(),
})
export type ExperiencesLiveData = z.infer<typeof Experiences>

export const AccomplishmentProjects = z.object({
  description: z.string().optional(),
  ends_at: DateModel.optional(),
  starts_at: DateModel.optional(),
  title: z.string().optional(),
  url: z.string().optional(),
})
export type AccomplishmentProjectLiveData = z.infer<typeof AccomplishmentProjects>

export const Activity = z.object({
  activity_status: z.string().optional(),
  link: z.string().optional(),
  title: z.string().optional(),
})
export type ActivityLiveData = z.infer<typeof Activity>

export const Certifications = z.object({
  authority: z.string().optional(),
  display_source: z.string().optional(),
  ends_at: DateModel.optional(),
  license_number: z.string().optional(),
  name: z.string().optional(),
  starts_at: DateModel.optional(),
  url: z.string().optional(),
})
export type CertificationsLiveData = z.infer<typeof Certifications>

export const Education = z.object({
  activities_and_societies: z.string().optional(),
  degree_name: z.string().optional(),
  description: z.string().optional(),
  ends_at: DateModel.optional(),
  field_of_study: z.string().optional(),
  grade: z.string().optional(),
  logo_url: z.string().optional(),
  school: z.string().optional(),
  school_linkedin_profile_url: z.string().optional(),
  starts_at: DateModel.optional(),
})
export type EducationLiveData = z.infer<typeof Education>

export const VolunteerWork = z.object({
  cause: z.string().optional(),
  company: z.string().optional(),
  company_linkedin_profile_url: z.string().optional(),
  description: z.string().optional(),
  ends_at: DateModel.optional(),
  logo_url: z.string().optional(),
  starts_at: DateModel.optional(),
  title: z.string().optional(),
})
export type VolunteerWorkLiveData = z.infer<typeof VolunteerWork>

export const HonorAward = z.object({
  description: z.string().optional(),
  issued_on: DateModel.optional(),
  issuer: z.string().optional(),
  title: z.string().optional(),
})
export type HonorAwardLiveData = z.infer<typeof HonorAward>

export const Publication = z.object({
  description: z.string().optional(),
  name: z.string().optional(),
  published_on: DateModel.optional(),
  publisher: z.string().optional(),
  url: z.string().optional(),
})
export type PublicationLiveData = z.infer<typeof Publication>

export const Patent = z.object({
  application_number: z.string().optional(),
  description: z.string().optional(),
  issued_on: DateModel.optional(),
  issuer: z.string().optional(),
  patent_number: z.string().optional(),
  title: z.string().optional(),
  url: z.string().optional(),
})
export type PatentLiveData = z.infer<typeof Patent>

export const Course = z.object({
  name: z.string().optional(),
  number: z.string().optional(),
})
export type CourseLiveData = z.infer<typeof Course>

export const Organization = z.object({
  description: z.string().optional(),
  ends_at: DateModel.optional(),
  name: z.string().optional(),
  starts_at: DateModel.optional(),
  title: z.string().optional(),
})
export type OrganizationLiveData = z.infer<typeof Organization>

export const TestScore = z.object({
  date_on: DateModel.optional(),
  description: z.string().optional(),
  name: z.string().optional(),
  score: z.string().optional(),
})
export type TestScoreLiveData = z.infer<typeof TestScore>

export const Group = z.object({
  name: z.string().optional(),
  profile_pic_url: z.string().optional(),
  url: z.string().optional(),
})
export type GroupLiveData = z.infer<typeof Group>

export const PeopleAlsoViewed = z.object({
  link: z.string().optional(),
  location: z.string().optional(),
  name: z.string().optional(),
  summary: z.string().optional(),
})
export type PeopleAlsoViewedLiveData = z.infer<typeof PeopleAlsoViewed>

export const SimilarlyNamedProfiles = z.object({
  link: z.string().optional(),
  location: z.string().optional(),
  name: z.string().optional(),
  summary: z.string().optional(),
})
export type SimilarlyNamedProfilesLiveData = z.infer<typeof SimilarlyNamedProfiles>

export const Article = z.object({
  author: z.string().optional(),
  image_url: z.string().optional(),
  link: z.string().optional(),
  published_date: DateModel.optional(),
  title: z.string().optional(),
})
export type ArticleLiveData = z.infer<typeof Article>

export const InferredSalary = z.object({
  max: z.number().optional(),
  min: z.number().optional(),
})
export type InferredSalaryLiveData = z.infer<typeof InferredSalary>

export const Extra = z.object({
  facebook_profile_id: z.string().optional(),
  github_profile_id: z.string().optional(),
  twitter_profile_id: z.string().optional(),
  website: z.string().optional(),
})
export type ExtraLiveData = z.infer<typeof Extra>

export const Profile = z.object({
  // Basic Info
  public_identifier: z.string().optional(),
  profile_pic_url: z.string().optional(),
  background_cover_image_url: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  headline: z.string().optional(),
  occupation: z.string().optional(),
  summary: z.string().optional(),

  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  country_full_name: z.string().optional(),

  // Social Stats
  connections: z.number().optional(),
  follower_count: z.number().optional(),

  // Contact Info
  personal_emails: z.array(z.string()).optional().default([]),
  personal_numbers: z.array(z.string()).optional().default([]),

  // Professional Data
  experiences: z.array(Experiences).optional().default([]),
  education: z.array(Education).optional().default([]),
  certifications: z.array(Certifications).optional().default([]),
  volunteer_work: z.array(VolunteerWork).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),

  // Accomplishments
  accomplishment_courses: z.array(Course).optional().default([]),
  accomplishment_honors_awards: z.array(HonorAward).optional().default([]),
  accomplishment_organisations: z.array(Organization).optional().default([]),
  accomplishment_patents: z.array(Patent).optional().default([]),
  accomplishment_projects: z.array(AccomplishmentProjects).optional().default([]),
  accomplishment_publications: z.array(Publication).optional().default([]),
  accomplishment_test_scores: z.array(TestScore).optional().default([]),

  // Activity & Content
  activities: z.array(Activity).optional().default([]),
  articles: z.array(Article).optional().default([]),
  groups: z.array(Group).optional().default([]),

  // Related Profiles
  people_also_viewed: z.array(PeopleAlsoViewed).optional().default([]),
  similarly_named_profiles: z.array(SimilarlyNamedProfiles).optional().default([]),

  // Extra data from enrichment
  extra: Extra.optional(),
  inferred_salary: InferredSalary.optional(),

  // Gender (sometimes available)
  gender: z.string().optional(),

  // Birth date (rarely available)
  birth_date: DateModel.optional(),

  // Industry
  industry: z.string().optional(),
})

export type ProfileLiveData = z.infer<typeof Profile>

export function formatDateRange(
  startsAt?: { month?: number; year?: number },
  endsAt?: { month?: number; year?: number },
): string {
  const formatSingle = (date?: { month?: number; year?: number }) => {
    if (!date || !date.year) return ""
    const month = date.month ? new Date(2000, date.month - 1).toLocaleString("default", { month: "short" }) : ""
    return `${month} ${date.year}`.trim()
  }

  const start = formatSingle(startsAt)
  const end = endsAt && endsAt.year ? formatSingle(endsAt) : "Current"

  if (!start) return end === "Current" ? "" : end
  return `${start} - ${end}`
}
