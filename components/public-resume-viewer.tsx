"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Mail, Globe, Briefcase, GraduationCap, Award, Calendar, Printer, Download } from "lucide-react"
import type { ProfileLiveData } from "@/lib/schemas"

interface PublicResumeViewerProps {
  data: {
    resume_content: ProfileLiveData
    resume_content_modified?: ProfileLiveData
    theme_data?: unknown
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
}

function formatDate(date: { month?: number | null; year?: number | null } | null | undefined) {
  if (!date) return ""
  const month = date.month ? new Date(2000, date.month - 1).toLocaleString("default", { month: "short" }) : ""
  return `${month} ${date.year || ""}`.trim()
}

export function PublicResumeViewer({ data }: PublicResumeViewerProps) {
  const profile = data.resume_content_modified || data.resume_content

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    // Use browser print to PDF functionality
    window.print()
  }

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white print:text-black">
      {/* Action Bar - Hidden on print */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Save PDF
        </Button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto max-w-3xl p-6 print:p-0 print:max-w-none"
      >
        <Card className="overflow-hidden border-0 shadow-xl print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-12">
            {/* Header */}
            <motion.header variants={itemVariants} className="flex items-start gap-6 mb-8">
              <Avatar className="h-24 w-24 print:h-20 print:w-20">
                <AvatarImage src={profile.profile_pic_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold print:text-2xl">{profile.full_name}</h1>
                {profile.headline && (
                  <p className="text-lg text-muted-foreground mt-1 print:text-base">{profile.headline}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.city}
                      {profile.country && `, ${profile.country}`}
                    </span>
                  )}
                  {profile.personal_emails?.[0] && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profile.personal_emails[0]}
                    </span>
                  )}
                  {profile.extra?.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {profile.extra.website}
                    </span>
                  )}
                </div>
              </div>
            </motion.header>

            {/* Summary */}
            {profile.summary && (
              <motion.section variants={itemVariants} className="mb-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">About</h2>
                <p className="text-muted-foreground leading-relaxed">{profile.summary}</p>
              </motion.section>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <motion.section variants={itemVariants} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-6">
                  {profile.experiences.map((exp, i) => (
                    <motion.div key={i} variants={itemVariants} className="relative pl-4 border-l-2 border-muted">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exp.starts_at)} - {exp.ends_at ? formatDate(exp.ends_at) : "Present"}
                        </span>
                      </div>
                      {exp.location && <p className="text-sm text-muted-foreground mt-1">{exp.location}</p>}
                      {exp.description && <p className="text-sm mt-2 text-muted-foreground">{exp.description}</p>}
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <motion.section variants={itemVariants} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h2>
                <div className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <motion.div key={i} variants={itemVariants}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{edu.school}</h3>
                          <p className="text-muted-foreground">
                            {edu.degree_name}
                            {edu.field_of_study && ` in ${edu.field_of_study}`}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(edu.starts_at)} - {formatDate(edu.ends_at)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.section variants={itemVariants} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <motion.span key={i} variants={itemVariants} className="px-3 py-1 rounded-full bg-muted text-sm">
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <motion.section variants={itemVariants}>
                <h2 className="text-lg font-semibold mb-4">Certifications</h2>
                <div className="space-y-3">
                  {profile.certifications.map((cert, i) => (
                    <motion.div key={i} variants={itemVariants}>
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.authority}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
