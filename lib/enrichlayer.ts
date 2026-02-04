import type { ProfileLiveData } from "./schemas"

const ENRICHLAYER_API_BASE = "https://enrichlayer.com/api/v2"

interface EnrichLayerResponse {
  accomplishment_courses?: string[]
  accomplishment_honors_awards?: string[]
  accomplishment_organisations?: string[]
  accomplishment_patents?: string[]
  accomplishment_projects?: Array<{
    description?: string
    ends_at?: { day?: number; month?: number; year?: number }
    starts_at?: { day?: number; month?: number; year?: number }
    title?: string
    url?: string
  }>
  accomplishment_publications?: string[]
  accomplishment_test_scores?: string[]
  activities?: Array<{
    activity_status?: string
    link?: string
    title?: string
  }>
  articles?: string[]
  background_cover_image_url?: string
  certifications?: Array<{
    authority?: string
    display_source?: string
    ends_at?: { day?: number; month?: number; year?: number }
    license_number?: string
    name?: string
    starts_at?: { day?: number; month?: number; year?: number }
    url?: string
  }>
  city?: string
  connections?: number
  country?: string
  country_full_name?: string
  education?: Array<{
    activities_and_societies?: string
    degree_name?: string
    description?: string
    ends_at?: { day?: number; month?: number; year?: number }
    field_of_study?: string
    grade?: string
    logo_url?: string
    school?: string
    school_linkedin_profile_url?: string
    starts_at?: { day?: number; month?: number; year?: number }
  }>
  experiences?: Array<{
    company?: string
    company_linkedin_profile_url?: string
    title?: string
    description?: string
    location?: string
    logo_url?: string
    starts_at?: { day?: number; month?: number; year?: number }
    ends_at?: { day?: number; month?: number; year?: number }
  }>
  first_name?: string
  follower_count?: number
  full_name?: string
  groups?: string[]
  headline?: string
  languages?: string[]
  last_name?: string
  occupation?: string
  people_also_viewed?: string[]
  profile_pic_url?: string
  public_identifier?: string
  recommendations?: string[]
  similarly_named_profiles?: Array<{
    link?: string
    location?: string
    name?: string
    summary?: string
  }>
  state?: string
  summary?: string
  volunteer_work?: string[]
  skills?: string[]
  interests?: string[]
  personal_emails?: string[]
  personal_numbers?: string[]
  extra?: {
    website?: string
  }
  meta?: {
    last_updated?: string
  }
}

export async function enrichLinkedInProfile(linkedinUrl: string): Promise<ProfileLiveData> {
  const apiKey = process.env.ENRICHLAYER_API_KEY

  if (!apiKey) {
    throw new Error("ENRICHLAYER_API_KEY is not configured")
  }

  const url = new URL(`${ENRICHLAYER_API_BASE}/profile`)
  url.searchParams.set("url", linkedinUrl)
  url.searchParams.set("use_cache", "if-present")
  url.searchParams.set("skills", "include")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EnrichLayer API error: ${response.status} - ${errorText}`)
  }

  const data: EnrichLayerResponse = await response.json()

  // Transform EnrichLayer response to our Profile schema
  const profile: ProfileLiveData = {
    accomplishment_courses: data.accomplishment_courses || [],
    accomplishment_honors_awards: data.accomplishment_honors_awards || [],
    accomplishment_organisations: data.accomplishment_organisations || [],
    accomplishment_patents: data.accomplishment_patents || [],
    accomplishment_projects: (data.accomplishment_projects || []).map((p) => ({
      description: p.description || "",
      ends_at: p.ends_at,
      starts_at: p.starts_at,
      title: p.title || "",
      url: p.url || "",
    })),
    accomplishment_publications: data.accomplishment_publications || [],
    accomplishment_test_scores: data.accomplishment_test_scores || [],
    activities: (data.activities || []).map((a) => ({
      activity_status: a.activity_status || "",
      link: a.link || "",
      title: a.title || "",
    })),
    articles: data.articles || [],
    background_cover_image_url: data.background_cover_image_url,
    certifications: (data.certifications || []).map((c) => ({
      authority: c.authority || "",
      display_source: c.display_source,
      ends_at: c.ends_at,
      license_number: c.license_number,
      name: c.name || "",
      starts_at: c.starts_at,
      url: c.url,
    })),
    city: data.city,
    connections: data.connections,
    country: data.country,
    country_full_name: data.country_full_name,
    education: (data.education || []).map((e) => ({
      activities_and_societies: e.activities_and_societies,
      degree_name: e.degree_name,
      description: e.description,
      ends_at: e.ends_at,
      field_of_study: e.field_of_study || "",
      grade: e.grade,
      logo_url: e.logo_url || "",
      school: e.school || "",
      school_linkedin_profile_url: e.school_linkedin_profile_url || "",
      starts_at: e.starts_at,
    })),
    experiences: (data.experiences || []).map((e) => ({
      company: e.company,
      company_linkedin_profile_url: e.company_linkedin_profile_url,
      title: e.title,
      description: e.description,
      location: e.location,
      logo_url: e.logo_url,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
    })),
    first_name: data.first_name,
    follower_count: data.follower_count,
    full_name: data.full_name,
    groups: data.groups || [],
    headline: data.headline,
    languages: data.languages || [],
    last_name: data.last_name,
    occupation: data.occupation,
    people_also_viewed: data.people_also_viewed || [],
    profile_pic_url: data.profile_pic_url,
    public_identifier: data.public_identifier,
    recommendations: data.recommendations || [],
    similarly_named_profiles: (data.similarly_named_profiles || []).map((p) => ({
      link: p.link || "",
      location: p.location || "",
      name: p.name || "",
      summary: p.summary,
    })),
    state: data.state,
    summary: data.summary,
    volunteer_work: data.volunteer_work || [],
    skills: data.skills || [],
    interests: data.interests || [],
    personal_emails: data.personal_emails || [],
    personal_numbers: data.personal_numbers || [],
    extra: data.extra,
    meta: data.meta,
  }

  return profile
}

export async function enrichLinkedInProfileByEmail(email: string): Promise<ProfileLiveData> {
  const apiKey = process.env.ENRICHLAYER_API_KEY

  if (!apiKey) {
    throw new Error("ENRICHLAYER_API_KEY is not configured")
  }

  const url = new URL(`${ENRICHLAYER_API_BASE}/profile/resolve/email`)
  url.searchParams.set("email", email)
  url.searchParams.set("lookup_depth", "deep")
  url.searchParams.set("enrich_profile", "enrich")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EnrichLayer API error: ${response.status} - ${errorText}`)
  }

  const data: EnrichLayerResponse = await response.json()

  // Transform EnrichLayer response to our Profile schema
  const profile: ProfileLiveData = {
    accomplishment_courses: data.accomplishment_courses || [],
    accomplishment_honors_awards: data.accomplishment_honors_awards || [],
    accomplishment_organisations: data.accomplishment_organisations || [],
    accomplishment_patents: data.accomplishment_patents || [],
    accomplishment_projects: (data.accomplishment_projects || []).map((p) => ({
      description: p.description || "",
      ends_at: p.ends_at,
      starts_at: p.starts_at,
      title: p.title || "",
      url: p.url || "",
    })),
    accomplishment_publications: data.accomplishment_publications || [],
    accomplishment_test_scores: data.accomplishment_test_scores || [],
    activities: (data.activities || []).map((a) => ({
      activity_status: a.activity_status || "",
      link: a.link || "",
      title: a.title || "",
    })),
    articles: data.articles || [],
    background_cover_image_url: data.background_cover_image_url,
    certifications: (data.certifications || []).map((c) => ({
      authority: c.authority || "",
      display_source: c.display_source,
      ends_at: c.ends_at,
      license_number: c.license_number,
      name: c.name || "",
      starts_at: c.starts_at,
      url: c.url,
    })),
    city: data.city,
    connections: data.connections,
    country: data.country,
    country_full_name: data.country_full_name,
    education: (data.education || []).map((e) => ({
      activities_and_societies: e.activities_and_societies,
      degree_name: e.degree_name,
      description: e.description,
      ends_at: e.ends_at,
      field_of_study: e.field_of_study || "",
      grade: e.grade,
      logo_url: e.logo_url || "",
      school: e.school || "",
      school_linkedin_profile_url: e.school_linkedin_profile_url || "",
      starts_at: e.starts_at,
    })),
    experiences: (data.experiences || []).map((e) => ({
      company: e.company,
      company_linkedin_profile_url: e.company_linkedin_profile_url,
      title: e.title,
      description: e.description,
      location: e.location,
      logo_url: e.logo_url,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
    })),
    first_name: data.first_name,
    follower_count: data.follower_count,
    full_name: data.full_name,
    groups: data.groups || [],
    headline: data.headline,
    languages: data.languages || [],
    last_name: data.last_name,
    occupation: data.occupation,
    people_also_viewed: data.people_also_viewed || [],
    profile_pic_url: data.profile_pic_url,
    public_identifier: data.public_identifier,
    recommendations: data.recommendations || [],
    similarly_named_profiles: (data.similarly_named_profiles || []).map((p) => ({
      link: p.link || "",
      location: p.location || "",
      name: p.name || "",
      summary: p.summary,
    })),
    state: data.state,
    summary: data.summary,
    volunteer_work: data.volunteer_work || [],
    skills: data.skills || [],
    interests: data.interests || [],
    personal_emails: data.personal_emails || [],
    personal_numbers: data.personal_numbers || [],
    extra: data.extra,
    meta: data.meta,
  }

  return profile
}
