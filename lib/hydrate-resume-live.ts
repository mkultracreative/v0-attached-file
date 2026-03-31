import { LiveObject, LiveList } from "@liveblocks/client"
import type { ResumeCanonical } from "./normalize-enrichlayer"

/* ------------------------------------------------------------------
   Live Resume Shape (authoritative for UI)
   ------------------------------------------------------------------ */

   export function hydrateResumeLive(data: ResumeCanonical) {
     return new LiveObject({
         full_name: data.full_name,
             headline: data.headline,
                 summary: data.summary,

                     city: data.city,
                         state: data.state,
                             country: data.country,

                                 occupation: data.occupation,

                                     skills: new LiveList(data.skills),
                                         languages: new LiveList(data.languages),
                                             interests: new LiveList(data.interests),

   experiences: new LiveList(
         data.experiences.map((e) =>
                 new LiveObject({
                           company: e.company,
                                     title: e.title,
 description: e.description,
           location: e.location,
                     logo_url: e.logo_url,
                               starts_at: e.starts_at ?? null,
                                         ends_at: e.ends_at ?? null,
   }),
         ),
             ),

                 education: new LiveList(
                       data.education.map((e) =>
                               new LiveObject({
                                         school: e.school,
     degree_name: e.degree_name,
               field_of_study: e.field_of_study,
                         description: e.description,
                                   logo_url: e.logo_url,
                                             starts_at: e.starts_at ?? null,
         ends_at: e.ends_at ?? null,
                 }),
                       ),
                           ),

                               certifications: new LiveList(
                                     data.certifications.map((c) =>
                                             new LiveObject({
         name: c.name,
                   authority: c.authority,
                           }),
                                 ),
                                     ),

                                         projects: new LiveList(
 data.projects.map((p) =>
         new LiveObject({
                   title: p.title,
                             description: p.description,
                                       url: p.url,
 }),
       ),
           ),

               meta: new LiveObject({
                     last_updated: data.meta.last_updated,
                         }),
                           })
                           }
