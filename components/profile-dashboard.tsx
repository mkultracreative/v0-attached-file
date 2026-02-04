"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { ProfileLiveData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import {
  FileText,
  Linkedin,
  LogOut,
  Loader2,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  ExternalLink,
} from "lucide-react"

interface ProfileDashboardProps {
  user: User
  resumeContent: ProfileLiveData | null
  hasResume: boolean
}

export function ProfileDashboard({ user, resumeContent, hasResume }: ProfileDashboardProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEnrich = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enrich profile")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const formatDate = (date?: { month?: number | null; year?: number | null } | null) => {
    if (!date) return ""
    const month = date.month ? new Date(2000, date.month - 1).toLocaleString("en", { month: "short" }) : ""
    return `${month} ${date.year || ""}`.trim()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4">
            {hasResume && (
              <Button variant="outline" onClick={() => router.push("/editor")}>
                Edit Resume
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Import Section - Show if no resume */}
          {!hasResume && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  Import from LinkedIn
                </CardTitle>
                <CardDescription>
                  Enter your LinkedIn profile URL to automatically import your professional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnrich} className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Label htmlFor="linkedin-url" className="sr-only">
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin-url"
                      type="url"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import Profile"
                    )}
                  </Button>
                </form>
                {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
              </CardContent>
            </Card>
          )}

          {/* Profile Display */}
          {resumeContent && (
            <div className="space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={resumeContent.profile_pic_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {resumeContent.first_name?.[0]}
                        {resumeContent.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">{resumeContent.full_name}</h1>
                      <p className="text-lg text-muted-foreground">{resumeContent.headline}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {(resumeContent.city || resumeContent.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {[resumeContent.city, resumeContent.country_full_name || resumeContent.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => router.push("/editor")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Edit Resume
                    </Button>
                  </div>
                  {resumeContent.summary && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h2 className="mb-2 font-semibold">About</h2>
                        <p className="text-muted-foreground">{resumeContent.summary}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              {resumeContent.experiences && resumeContent.experiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeContent.experiences.map((exp, index) => (
                      <div key={index} className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={exp.logo_url || undefined} />
                          <AvatarFallback>{exp.company?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(exp.starts_at)} - {exp.ends_at ? formatDate(exp.ends_at) : "Present"}
                            {exp.location && ` · ${exp.location}`}
                          </p>
                          {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {resumeContent.education && resumeContent.education.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeContent.education.map((edu, index) => (
                      <div key={index} className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={edu.logo_url || undefined} />
                          <AvatarFallback>{edu.school?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{edu.school}</h3>
                          <p className="text-muted-foreground">
                            {[edu.degree_name, edu.field_of_study].filter(Boolean).join(", ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(edu.starts_at)} - {edu.ends_at ? formatDate(edu.ends_at) : "Present"}
                          </p>
                          {edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {resumeContent.skills && resumeContent.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {resumeContent.skills.map((skill, index) => (
                        <span key={index} className="rounded-full bg-secondary px-3 py-1 text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {resumeContent.certifications && resumeContent.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resumeContent.certifications.map((cert, index) => (
                      <div key={index}>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-muted-foreground">{cert.authority}</p>
                        {cert.starts_at && (
                          <p className="text-sm text-muted-foreground">Issued {formatDate(cert.starts_at)}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {!resumeContent && hasResume === false && (
            <Card className="text-center">
              <CardContent className="py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">No resume yet</h2>
                <p className="mt-2 text-muted-foreground">Import your LinkedIn profile above to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
