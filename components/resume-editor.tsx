"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useStorage, useMutation, useOthers, useSelf } from "@liveblocks/react/suspense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { FileText, Save, ArrowLeft, Users, Download, Plus, Trash2, GripVertical } from "lucide-react"
import { ResumePreview } from "@/components/resume-preview"
import { FloatingToolbar } from "@/components/floating-toolbar"

interface ResumeEditorProps {
  userId: string
}

export function ResumeEditor({ userId }: ResumeEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  const others = useOthers()
  const self = useSelf()

  const profile = useStorage((root) => root.profile)
  const theme = useStorage((root) => root.theme)

  // Mutations for updating storage
  const updateField = useMutation(({ storage }, field: string, value: unknown) => {
    const profileStorage = storage.get("profile")
    if (profileStorage) {
      // Handle nested paths like "experiences[0].title"
      const pathParts = field.split(".")
      // For simple top-level fields
      if (pathParts.length === 1) {
        ;(profileStorage as Record<string, unknown>)[field] = value
      }
    }
  }, [])

  const updateExperience = useMutation(({ storage }, index: number, field: string, value: string) => {
    const profileStorage = storage.get("profile")
    if (profileStorage && profileStorage.experiences) {
      profileStorage.experiences[index] = {
        ...profileStorage.experiences[index],
        [field]: value,
      }
    }
  }, [])

  const updateEducation = useMutation(({ storage }, index: number, field: string, value: string) => {
    const profileStorage = storage.get("profile")
    if (profileStorage && profileStorage.education) {
      profileStorage.education[index] = {
        ...profileStorage.education[index],
        [field]: value,
      }
    }
  }, [])

  const addExperience = useMutation(({ storage }) => {
    const profileStorage = storage.get("profile")
    if (profileStorage) {
      profileStorage.experiences = [
        ...(profileStorage.experiences || []),
        {
          company: "",
          title: "",
          description: "",
          location: "",
          starts_at: { year: new Date().getFullYear() },
          ends_at: null,
        },
      ]
    }
  }, [])

  const removeExperience = useMutation(({ storage }, index: number) => {
    const profileStorage = storage.get("profile")
    if (profileStorage && profileStorage.experiences) {
      profileStorage.experiences = profileStorage.experiences.filter((_, i) => i !== index)
    }
  }, [])

  const addEducation = useMutation(({ storage }) => {
    const profileStorage = storage.get("profile")
    if (profileStorage) {
      profileStorage.education = [
        ...(profileStorage.education || []),
        {
          school: "",
          degree_name: "",
          field_of_study: "",
          starts_at: { year: new Date().getFullYear() },
          ends_at: null,
        },
      ]
    }
  }, [])

  const removeEducation = useMutation(({ storage }, index: number) => {
    const profileStorage = storage.get("profile")
    if (profileStorage && profileStorage.education) {
      profileStorage.education = profileStorage.education.filter((_, i) => i !== index)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!profile) return
    setIsSaving(true)

    try {
      const response = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent: profile,
          themeData: theme,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }, [profile, theme])

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Resume Editor</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active users */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {self && (
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={self.info?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{self.info?.name?.[0]?.toUpperCase() || "Y"}</AvatarFallback>
                  </Avatar>
                )}
                {others.map((other) => (
                  <Avatar key={other.connectionId} className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={other.info?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{other.info?.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>

            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Editor Panel */}
        <div className={`flex-1 overflow-auto p-6 ${showPreview ? "w-1/2" : "w-full"}`}>
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">First Name</label>
                      <Input
                        value={profile.first_name || ""}
                        onChange={(e) => updateField("first_name", e.target.value)}
                        onFocus={() => setActiveSection("basic")}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Last Name</label>
                      <Input
                        value={profile.last_name || ""}
                        onChange={(e) => updateField("last_name", e.target.value)}
                        onFocus={() => setActiveSection("basic")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Headline</label>
                    <Input
                      value={profile.headline || ""}
                      onChange={(e) => updateField("headline", e.target.value)}
                      onFocus={() => setActiveSection("basic")}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Summary</label>
                    <Textarea
                      value={profile.summary || ""}
                      onChange={(e) => updateField("summary", e.target.value)}
                      onFocus={() => setActiveSection("basic")}
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">City</label>
                      <Input value={profile.city || ""} onChange={(e) => updateField("city", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Country</label>
                      <Input
                        value={profile.country_full_name || profile.country || ""}
                        onChange={(e) => updateField("country_full_name", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Experience</h2>
                  <Button variant="outline" size="sm" onClick={() => addExperience()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
                <div className="space-y-6">
                  {profile.experiences?.map((exp, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-border p-4"
                      onFocus={() => setActiveSection(`experience-${index}`)}
                    >
                      <div className="absolute -left-3 top-4 cursor-grab text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">Job Title</label>
                            <Input
                              value={exp.title || ""}
                              onChange={(e) => updateExperience(index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">Company</label>
                            <Input
                              value={exp.company || ""}
                              onChange={(e) => updateExperience(index, "company", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Location</label>
                          <Input
                            value={exp.location || ""}
                            onChange={(e) => updateExperience(index, "location", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Description</label>
                          <Textarea
                            value={exp.description || ""}
                            onChange={(e) => updateExperience(index, "description", e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Education</h2>
                  <Button variant="outline" size="sm" onClick={() => addEducation()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                </div>
                <div className="space-y-6">
                  {profile.education?.map((edu, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-border p-4"
                      onFocus={() => setActiveSection(`education-${index}`)}
                    >
                      <div className="absolute -left-3 top-4 cursor-grab text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium">School</label>
                          <Input
                            value={edu.school || ""}
                            onChange={(e) => updateEducation(index, "school", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">Degree</label>
                            <Input
                              value={edu.degree_name || ""}
                              onChange={(e) => updateEducation(index, "degree_name", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">Field of Study</label>
                            <Input
                              value={edu.field_of_study || ""}
                              onChange={(e) => updateEducation(index, "field_of_study", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-lg font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, index) => (
                    <span key={index} className="rounded-full bg-secondary px-3 py-1 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-border bg-background p-6">
            <div className="sticky top-20">
              <ResumePreview profile={profile} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      <FloatingToolbar activeSection={activeSection} />
    </div>
  )
}
