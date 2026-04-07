# [OBJECTIVE]
## [INSTRUCT]
you will create a resume builder that has a 1:1 link from LinkedIn user profile data to resume; doing this through the magic of Supabase social LinkedIn social provider auth flow--fetching the user's email from LinkedIn scopes `email, profile, r_liteprofile` that will be saved in Supabase's private `auth` schema in table `users` inside `email` (varchar) field, using NextJS App Router (not 'src' folder), EnrichLayer API to fetch all the LinkedIn profile data, zod for types schema, Supabase for database handling, and Liveblocks SDK for the resume editing and viewer capabilities.[span_0](end_span)

# [COMPONENTS & Flow]

### Home
- [span_1](start_span)simply feed in the LoginCard.tsx with the LinkedIn login button[span_1](end_span)

### ProfilePage
- [span_2](start_span)Immediately redirected to profile page after successful LinkedIn Auth, showing only the profile snapshot card _ProfileSnapshotCard.tsx_[span_2](end_span)
- This card displays the immediate scope data returned by LinkedIn, such as `avatarUrl?`, `name?`, and mandatory `email`. [span_3](start_span)Anything else we can show, include it but add as optional.[span_3](end_span)
- [span_4](start_span)Before triggering any API's, it will first check to see if a resume exists in the `people` table under field `resume_content`.[span_4](end_span)
- If not, it will continue to the next step. [span_5](start_span)If data exists, it will simply take them to the profile page without triggering the API call.[span_5](end_span)
- [span_6](start_span)This card will display a loading bar that represents the Suspense or waiting time while the enrichlayer/route.ts triggers the EnrichLayer API call[span_6](end_span)

- #### EnrichLayer route in _api/enrichlayer/route.ts_
- [span_7](start_span)curl -G -H "Authorization: Bearer ${YOUR_API_KEY}" 'https://enrichlayer.com/api/v2/profile/resolve/email' --data-urlencode 'email=johndoe@enrichlayer.com' --data-urlencode 'lookup_depth=deep' --data-urlencode 'enrich_profile=enrich'[span_7](end_span)
- [span_8](start_span)Once the API response is received, it will be stored in Supabase in the public schema table `people` inside the field `resume_content` (jsonb), which also includes a field `user_id` that directly links as a downward cascading field matching the `id` table in private.table.field `auth.users.email`[span_8](end_span)
- [span_9](start_span)Once the data is returned, it will display a 'view resume' button that takes the user to `resume/[id]/page.tsx`[span_9](end_span)

### resume/[id]/page.tsx
- _[span_10](start_span)ResumeViewer.tsx_: This is a viewer of the resume, representing exactly what's on linkedin and exactly the data response from EnrichLayer[span_10](end_span)
- _ResumeEditor.tsx_: Reflects exact same fields, but using Liveblocks SDK to make fields, date pickers, and any other data editable. [span_11](start_span)It will save this under the `people` table in `resume_content_modified` and all resume data will now pull from this.[span_11](end_span)
- [span_12](start_span)Include 'Revert Changes' button that will change over the data to now depend or use data from the `resume_content` field.[span_12](end_span)
- [span_13](start_span)Include 'Sync from LinkedIn' button that triggers enrichlayer API call and replaces `resume_content` data, also changing resume to depend on that field now.[span_13](end_span)

- _[span_14](start_span)Floating Toolbar.tsx_: The horizontal pill shaped, floating at fixed footer position 32px above the bottom: a quick action toolbar resembling Vercel's or Figma's floating action bar[span_14](end_span)
- _Components_: A dropover the pops above the toolbar for themeable options, including options related to `role` types that will be fed in from a css file under `public/themes/{role_name}.css`. [span_15](start_span)Save to database in `theme_data` field for that user.[span_15](end_span)
- [span_16](start_span)A 'smart mode' toggle that triggers an 'Upgrade for $9.95/mo' modal if the Supabase `people` table under `plan` field is == 'free' for that user[span_16](end_span)
- [span_17](start_span)This toggle uses Liveblocks SDK Ai feature to push all resume data as context injection, automatically rewriting it based on instructions located in 'people' table under 'instruct' field for that user[span_17](end_span)

## [STACK]
- NextJS@latest App Router
- Supabase Auth using LinkedIn social provider flow
- EnrichLayer API
- [span_18](start_span)Liveblocks SDK[span_18](end_span)

## [ZOD TYPES]
export const Settings = z.object({
  isEditMode: z.boolean(),
    lastModified: z.string(),
    });
    [span_19](start_span)export type SettingsLiveData = z.infer<typeof Settings>;[span_19](end_span)

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
                                                      });
                                                      [span_20](start_span)export type ResumeThemeLiveData = z.infer<typeof ResumeTheme>;[span_20](end_span)

                                                      export const DateModel = z.object({
                                                        day: z.number().int().min(1).max(31).optional().nullable(),
                                                          month: z.number().int().min(1).max(12).optional().nullable(),
                                                            year: z.number().int().optional().nullable(),
                                                            });
                                                            [span_21](start_span)export type DateModelLiveData = z.infer<typeof DateModel>;[span_21](end_span)

                                                            export const Experiences = z.object({
                                                              company: z.string().optional().nullable(),
                                                                company_linkedin_profile_url: z.string().url().optional().nullable(),
                                                                  title: z.string().optional().nullable(),
                                                                    description: z.string().optional().nullable(),
                                                                      location: z.string().optional().nullable(),
                                                                        logo_url: z.string().url().optional().nullable(),
                                                                          starts_at: DateModel.optional().nullable(),
                                                                            ends_at: DateModel.optional().nullable(),
                                                                            });
                                                                            [span_22](start_span)export type ExperiencesLiveData = z.infer<typeof Experiences>;[span_22](end_span)

                                                                            export const AccomplishmentProjects = z.object({
                                                                              description: z.string(),
                                                                                ends_at: DateModel.optional(),
                                                                                  starts_at: DateModel.optional(),
                                                                                    title: z.string(),
                                                                                      url: z.string().url(),
                                                                                      });
                                                                                      [span_23](start_span)export type AccomplishmentProjectLiveData = z.infer<typeof AccomplishmentProjects>;[span_23](end_span)

                                                                                      export const Activity = z.object({
                                                                                        activity_status: z.string(),
                                                                                          link: z.string().url(),
                                                                                            title: z.string(),
                                                                                            });
                                                                                            export type ActivityLiveData = z.infer<typeof Activity>;

                                                                                            export const Certifications = z.object({
                                                                                              authority: z.string(),
                                                                                                display_source: z.string().optional().nullable(),
                                                                                                  ends_at: DateModel.optional(),
                                                                                                    license_number: z.string().optional().nullable(),
                                                                                                      name: z.string(),
                                                                                                        starts_at: DateModel.optional(),
                                                                                                          url: z.string().url().optional().nullable(),
                                                                                                          });
                                                                                                          export type CertificationsLiveData = z.infer<typeof Certifications>;

                                                                                                          export const Education = z.object({
                                                                                                            activities_and_societies: z.string().optional().nullable(),
                                                                                                              degree_name: z.string().optional().nullable(),
                                                                                                                description: z.string().optional().nullable(),
                                                                                                                  ends_at: DateModel.optional(),
                                                                                                                    field_of_study: z.string(),
                                                                                                                      grade: z.string().optional().nullable(),
                                                                                                                        logo_url: z.string().url(),
                                                                                                                          school: z.string(),
                                                                                                                            school_linkedin_profile_url: z.string().url(),
                                                                                                                              starts_at: DateModel.optional(),
                                                                                                                              });
                                                                                                                              export type EducationLiveData = z.infer<typeof Education>;

                                                                                                                              export const SimilarlyNamedProfiles = z.object({
                                                                                                                                link: z.string().url(),
                                                                                                                                  location: z.string(),
                                                                                                                                    name: z.string(),
                                                                                                                                      summary: z.string().optional().nullable(),
                                                                                                                                      });
                                                                                                                                      export type SimilarlyNamedProfilesLiveData = z.infer<typeof SimilarlyNamedProfiles>;

                                                                                                                                      export const Profile = z.object({
                                                                                                                                        id: z.string().optional(),
                                                                                                                                          accomplishment_courses: z.array(z.string()).optional().default([]),
                                                                                                                                            accomplishment_honors_awards: z.array(z.string()).optional().default([]),
                                                                                                                                              accomplishment_organisations: z.array(z.string()).optional().default([]),
                                                                                                                                                accomplishment_patents: z.array(z.string()).optional().default([]),
                                                                                                                                                  accomplishment_projects: z.array(AccomplishmentProjects).optional().default([]),
                                                                                                                                                    accomplishment_publications: z.array(z.string()).optional().default([]),
                                                                                                                                                      accomplishment_test_scores: z.array(z.string()).optional().default([]),
                                                                                                                                                        activities: z.array(Activity).optional().default([]),
                                                                                                                                                          articles: z.array(z.string()).optional().default([]),
                                                                                                                                                            background_cover_image_url: z.string().url().optional().nullable(),
                                                                                                                                                              certifications: z.array(Certifications).optional().default([]),
                                                                                                                                                                city: z.string().optional().nullable(),
                                                                                                                                                                  connections: z.number().optional(),
                                                                                                                                                                    country: z.string().optional().nullable(),
                                                                                                                                                                      country_full_name: z.string().optional().nullable(),
                                                                                                                                                                        education: z.array(Education).optional().default([]),
                                                                                                                                                                          experiences: z.array(Experiences).optional().default([]),
                                                                                                                                                                            first_name: z.string().optional().nullable(),
                                                                                                                                                                              follower_count: z.number().optional(),
                                                                                                                                                                                full_name: z.string().optional().nullable(),
                                                                                                                                                                                  groups: z.array(z.string()).optional().default([]),
                                                                                                                                                                                    headline: z.string().optional().nullable(),
                                                                                                                                                                                      languages: z.array(z.string()).optional().default([]),
                                                                                                                                                                                        last_name: z.string().optional().nullable(),
                                                                                                                                                                                          occupation: z.string().optional().nullable(),
                                                                                                                                                                                            people_also_viewed: z.array(z.string()).optional().default([]),
                                                 