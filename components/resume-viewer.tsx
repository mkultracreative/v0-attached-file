"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  useStorage,
  useMutation,
  useOthers,
  useSelf,
} from "@liveblocks/react/suspense"
import { LiveObject, LiveList } from "@liveblocks/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Users,
  Save,
  Pencil,
  Eye,
  ChevronDown,
  Plus,
  Trash2,
  MapPin,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  RefreshCw,
} from "lucide-react"
import { FloatingToolbar } from "@/components/floating-toolbar"
import { formatDateRange } from "@/lib/schemas"

interface ResumeViewerProps {
  isOwner: boolean
  userId: string
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
}

export function ResumeViewer({ isOwner, userId }: ResumeViewerProps) {
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const others = useOthers()
  const self = useSelf()

  // useStorage returns PLAIN JSON, not LiveObjects
  const profile = useStorage((root) => root.profile)
  const theme = useStorage((root) => root.theme)

  // Mutations use storage.get() which returns actual LiveObjects
  const updateField = useMutation(
    ({ storage }, field: string, value: string) => {
      const p = storage.get("profile")
      if (p && typeof p.set === "function") p.set(field as any, value)
    },
    [],
  )

  const addExperience = useMutation(({ storage }) => {
    const p = storage.get("profile")
    if (!p) return
    const list = p.get("experiences" as any)
    if (list && typeof list.push === "function") {
      list.push(
        new LiveObject({
          company: "",
          title: "",
          description: "",
          location: "",
          starts_at: new LiveObject({ year: new Date().getFullYear(), month: 1 }),
        }),
      )
    }
  }, [])

  const updateExperience = useMutation(
    ({ storage }, index: number, field: string, value: string) => {
      const p = storage.get("profile")
      if (!p) return
      const list = p.get("experiences" as any)
      if (list && typeof list.get === "function") {
        const item = list.get(index)
        if (item && typeof item.set === "function") item.set(field as any, value)
      }
    },
    [],
  )

  const removeExperience = useMutation(({ storage }, index: number) => {
    const p = storage.get("profile")
    if (!p) return
    const list = p.get("experiences" as any)
    if (list && typeof list.delete === "function") list.delete(index)
  }, [])

  const addEducation = useMutation(({ storage }) => {
    const p = storage.get("profile")
    if (!p) return
    const list = p.get("education" as any)
    if (list && typeof list.push === "function") {
      list.push(
        new LiveObject({
          school: "",
          degree_name: "",
          field_of_study: "",
          starts_at: new LiveObject({ year: new Date().getFullYear(), month: 1 }),
        }),
      )
    }
  }, [])

  const updateEducation = useMutation(
    ({ storage }, index: number, field: string, value: string) => {
      const p = storage.get("profile")
      if (!p) return
      const list = p.get("education" as any)
      if (list && typeof list.get === "function") {
        const item = list.get(index)
        if (item && typeof item.set === "function") item.set(field as any, value)
      }
    },
    [],
  )

  const removeEducation = useMutation(({ storage }, index: number) => {
    const p = storage.get("profile")
    if (!p) return
    const list = p.get("education" as any)
    if (list && typeof list.delete === "function") list.delete(index)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent: profile,
          themeData: theme,
        }),
      })
    } finally {
      setIsSaving(false)
    }
  }, [profile, theme])

  const handleSyncFromLinkedIn = async () => {
    setIsSyncing(true)
    try {
      await fetch("/api/enrich", { method: "POST" })
      router.refresh()
    } finally {
      setIsSyncing(false)
    }
  }

  if (!profile) return null

  // Read plain JSON from useStorage
  const experiences = (profile as any).experiences || []
  const education = (profile as any).education || []
  const skills = (profile as any).skills || []
  const certifications = (profile as any).certifications || []
  const activities = (profile as any).activities || []
  const articles = (profile as any).articles || []
  const volunteerWork = (profile as any).volunteer_work || []
  const languages = (profile as any).languages || []

  const themeColors = theme?.colors || {
    primary: "#171717",
    secondary: "#737373",
    accent: "#0066cc",
    background: "#ffffff",
    text: "#171717",
  }

  const location = [
    (profile as any).city,
    (profile as any).state,
    (profile as any).country_full_name || (profile as any).country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-sm">Resume</span>
          </div>
          <div className="flex items-center gap-2">
            {others.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{others.length}</span>
              </div>
            )}
            {isOwner && (
              <>
                <Button variant="outline" size="sm" onClick={handleSyncFromLinkedIn} disabled={isSyncing}>
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync
                </Button>
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? <Eye className="h-3.5 w-3.5 mr-1.5" /> : <Pencil className="h-3.5 w-3.5 mr-1.5" />}
                  {isEditMode ? "Preview" : "Edit"}
                </Button>
                {isEditMode && (
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Resume Content */}
      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl px-4 py-8 pb-28 space-y-8"
      >
        {/* Profile Header with cover image */}
        <motion.div variants={fadeUp}>
          {(profile as any).background_cover_image_url && (
            <div className="relative h-32 md:h-48 rounded-t-xl overflow-hidden -mx-4 -mt-8 mb-6">
              <img
                src={(profile as any).background_cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg shrink-0">
              <AvatarImage src={(profile as any).profile_pic_url || ""} />
              <AvatarFallback className="text-2xl" style={{ backgroundColor: themeColors.accent, color: "#fff" }}>
                {((profile as any).full_name || "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5 min-w-0">
              {isEditMode ? (
                <Input
                  value={(profile as any).full_name || ""}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-2"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: themeColors.primary }}>
                  {(profile as any).full_name}
                </h1>
              )}
              {isEditMode ? (
                <Input
                  value={(profile as any).headline || ""}
                  onChange={(e) => updateField("headline", e.target.value)}
                  className="text-sm h-auto py-1 px-2"
                  placeholder="Headline"
                />
              ) : (
                <p className="text-sm" style={{ color: themeColors.secondary }}>
                  {(profile as any).headline}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: themeColors.secondary }}>
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {location}
                  </span>
                )}
                {((profile as any).personal_emails?.length > 0) && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {(profile as any).personal_emails[0]}
                  </span>
                )}
                {(profile as any).extra?.website && (
                  <a
                    href={(profile as any).extra.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                    style={{ color: themeColors.accent }}
                  >
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
                {(profile as any).connections && (
                  <span>{(profile as any).connections}+ connections</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        {((profile as any).summary || isEditMode) && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: themeColors.primary }}>About</h2>
            {isEditMode ? (
              <Textarea
                value={(profile as any).summary || ""}
                onChange={(e) => updateField("summary", e.target.value)}
                rows={5}
                placeholder="Write a summary..."
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: themeColors.text }}>
                {(profile as any).summary}
              </p>
            )}
          </motion.section>
        )}

        {/* Experience */}
        {(experiences.length > 0 || isEditMode) && (
          <motion.section variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
                <Briefcase className="h-4 w-4" /> Experience
              </h2>
              {isEditMode && (
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              )}
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {experiences.map((exp: any, i: number) => (
                <motion.div key={i} variants={fadeUp}>
                  <Collapsible defaultOpen={i < 3}>
                    <div className="rounded-lg border p-4">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-start justify-between text-left">
                          <div className="flex items-start gap-3 min-w-0">
                            {exp.logo_url && (
                              <img src={exp.logo_url} alt="" className="h-10 w-10 rounded object-contain shrink-0" crossOrigin="anonymous" />
                            )}
                            <div className="min-w-0">
                              {isEditMode ? (
                                <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={exp.title || ""}
                                    onChange={(e) => updateExperience(i, "title", e.target.value)}
                                    placeholder="Title"
                                    className="h-7 text-sm font-semibold"
                                  />
                                  <Input
                                    value={exp.company || ""}
                                    onChange={(e) => updateExperience(i, "company", e.target.value)}
                                    placeholder="Company"
                                    className="h-7 text-sm"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="font-semibold text-sm">{exp.title}</p>
                                  <p className="text-sm" style={{ color: themeColors.secondary }}>{exp.company}</p>
                                </>
                              )}
                              <p className="text-xs mt-0.5" style={{ color: themeColors.secondary }}>
                                {formatDateRange(exp.starts_at, exp.ends_at)}
                                {exp.location && ` | ${exp.location}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isEditMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); removeExperience(i) }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-3 pt-3 border-t">
                          {isEditMode ? (
                            <Textarea
                              value={exp.description || ""}
                              onChange={(e) => updateExperience(i, "description", e.target.value)}
                              rows={3}
                              placeholder="Describe your role..."
                              className="text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            exp.description && (
                              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: themeColors.text }}>
                                {exp.description}
                              </p>
                            )
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Education */}
        {(education.length > 0 || isEditMode) && (
          <motion.section variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: themeColors.primary }}>
                <GraduationCap className="h-4 w-4" /> Education
              </h2>
              {isEditMode && (
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {education.map((edu: any, i: number) => (
                <motion.div key={i} variants={fadeUp} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      {edu.logo_url && (
                        <img src={edu.logo_url} alt="" className="h-10 w-10 rounded object-contain shrink-0" crossOrigin="anonymous" />
                      )}
                      <div className="min-w-0">
                        {isEditMode ? (
                          <div className="flex flex-col gap-1.5">
                            <Input
                              value={edu.school || ""}
                              onChange={(e) => updateEducation(i, "school", e.target.value)}
                              placeholder="School"
                              className="h-7 text-sm font-semibold"
                            />
                            <Input
                              value={edu.degree_name || ""}
                              onChange={(e) => updateEducation(i, "degree_name", e.target.value)}
                              placeholder="Degree"
                              className="h-7 text-sm"
                            />
                            <Input
                              value={edu.field_of_study || ""}
                              onChange={(e) => updateEducation(i, "field_of_study", e.target.value)}
                              placeholder="Field of Study"
                              className="h-7 text-sm"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-sm">{edu.school}</p>
                            <p className="text-sm" style={{ color: themeColors.secondary }}>
                              {[edu.degree_name, edu.field_of_study].filter(Boolean).join(", ")}
                            </p>
                          </>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: themeColors.secondary }}>
                          {formatDateRange(edu.starts_at, edu.ends_at)}
                        </p>
                      </div>
                    </div>
                    {isEditMode && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeEducation(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: themeColors.primary }}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: themeColors.accent, color: themeColors.accent }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: themeColors.primary }}>
              <Award className="h-4 w-4" /> Certifications
            </h2>
            <div className="space-y-3">
              {certifications.map((cert: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="font-semibold text-sm">{cert.name}</p>
                  <p className="text-xs" style={{ color: themeColors.secondary }}>
                    {cert.authority}
                    {cert.license_number && ` | ${cert.license_number}`}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: themeColors.primary }}>Languages</h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string, i: number) => (
                <span key={i} className="rounded-full border px-3 py-1 text-xs">{lang}</span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Volunteer Work */}
        {volunteerWork.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: themeColors.primary }}>Volunteer Work</h2>
            <div className="space-y-3">
              {volunteerWork.map((v: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="font-semibold text-sm">{v.title}</p>
                  <p className="text-xs" style={{ color: themeColors.secondary }}>
                    {v.company} {v.cause && `| ${v.cause}`}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: themeColors.primary }}>Articles</h2>
            <div className="space-y-2">
              {articles.map((a: any, i: number) => (
                <a
                  key={i}
                  href={a.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
                  style={{ color: themeColors.accent }}
                >
                  {a.title}
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Activities */}
        {activities.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: themeColors.primary }}>Activity</h2>
            <div className="space-y-2">
              {activities.map((a: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="text-sm line-clamp-2">{a.title}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.main>

      {/* Floating Toolbar */}
      {isOwner && <FloatingToolbar userId={userId} />}
    </div>
  )
}
