"use client"

import type { ProfileLiveData, ResumeThemeLiveData } from "@/lib/schemas"
import { MapPin, Mail, Globe } from "lucide-react"

interface ResumePreviewProps {
  profile: ProfileLiveData
  theme: ResumeThemeLiveData | null
}

export function ResumePreview({ profile, theme }: ResumePreviewProps) {
  const formatDate = (date?: { month?: number | null; year?: number | null } | null) => {
    if (!date) return ""
    const month = date.month ? new Date(2000, date.month - 1).toLocaleString("en", { month: "short" }) : ""
    return `${month} ${date.year || ""}`.trim()
  }

  const colors = theme?.colors || {
    primary: "#1a1a1a",
    secondary: "#666666",
    accent: "#0066cc",
    background: "#ffffff",
    text: "#1a1a1a",
  }

  return (
    <div
      className="mx-auto aspect-[8.5/11] w-full max-w-[600px] overflow-hidden rounded-lg shadow-xl"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <div className="h-full overflow-auto p-8">
        {/* Header */}
        <div className="mb-6 border-b pb-4" style={{ borderColor: colors.secondary + "40" }}>
          <h1 className="text-2xl font-bold" style={{ color: colors.primary, fontFamily: theme?.fonts?.heading }}>
            {profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`}
          </h1>
          {profile.headline && (
            <p className="mt-1 text-sm" style={{ color: colors.secondary, fontFamily: theme?.fonts?.body }}>
              {profile.headline}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs" style={{ color: colors.secondary }}>
            {(profile.city || profile.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[profile.city, profile.country_full_name || profile.country].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.personal_emails?.[0] && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile.personal_emails[0]}
              </span>
            )}
            {profile.extra?.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {profile.extra.website}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {profile.summary && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.accent }}>
              Summary
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: colors.text, fontFamily: theme?.fonts?.body }}>
              {profile.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {profile.experiences && profile.experiences.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.accent }}>
              Experience
            </h2>
            <div className="space-y-4">
              {profile.experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: colors.primary }}>
                        {exp.title}
                      </h3>
                      <p className="text-xs" style={{ color: colors.secondary }}>
                        {exp.company}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: colors.secondary }}>
                      {formatDate(exp.starts_at)} - {exp.ends_at ? formatDate(exp.ends_at) : "Present"}
                    </p>
                  </div>
                  {exp.description && (
                    <p
                      className="mt-1 text-xs leading-relaxed"
                      style={{ color: colors.text, fontFamily: theme?.fonts?.body }}
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.accent }}>
              Education
            </h2>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: colors.primary }}>
                        {edu.school}
                      </h3>
                      <p className="text-xs" style={{ color: colors.secondary }}>
                        {[edu.degree_name, edu.field_of_study].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: colors.secondary }}>
                      {formatDate(edu.starts_at)} - {edu.ends_at ? formatDate(edu.ends_at) : "Present"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.accent }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: colors.accent + "15",
                    color: colors.accent,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
