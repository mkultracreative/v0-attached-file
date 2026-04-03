"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { FileText, Linkedin, CheckCircle2, Briefcase, GraduationCap, Award, Share2, MapPin, Mail } from "lucide-react"
import { ShareDialog } from "@/components/share-dialog"
import type { ResumeCanonical } from "@/lib/normalize-enrichlayer"
import type { PersonRow } from "@/app/profile/page"

interface ProfileSnapshotCardProps {
  user: User
  hasResume: boolean
  personData: PersonRow | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function ProfileSnapshotCard({ user, hasResume, personData }: ProfileSnapshotCardProps) {
  const [isLoading, setIsLoading] = useState(!hasResume)
  const [error, setError] = useState<string | null>(null)

  // Initialize from stored ResumeCanonical if returning user already has enriched data
  const [profileData, setProfileData] = useState<ResumeCanonical | null>(
    personData?.resume_content ?? null
  )

  const [progress, setProgress] = useState(0)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Only call enrich if the server confirmed no resume_content exists.
    // personData?.resume_content is a second safety net in case hasResume
    // was computed incorrectly — we never want to burn API credits if data exists.
    if (!hasResume && !personData?.resume_content && !error) {
      fetchProfileData()
    }
  }, [hasResume])

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)
      return () => clearInterval(interval)
    } else {
      setProgress(100)
    }
  }, [isLoading])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      setProgress(10)

      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile data")
      }

      // EnrichLayer couldn't match the email to a LinkedIn profile — not a crash,
      // just nothing to show. Stop loading silently; user can retry manually later.
      if (!data.success) {
        console.warn("[enrich] No profile found:", data.reason)
        setIsLoading(false)
        return
      }

      // /api/enrich returns { profile: ResumeCanonical } via normalizeEnrichLayer()
      setProfileData(data.profile as ResumeCanonical)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleSignOutAndRetry = () => {
    // Use the server-side signout route to clear the session cleanly,
    // then land on login — avoids the client-side signOut redirect loop
    window.location.href = "/auth/signout"
  }

  const handleViewResume = () => {
    router.push(`/resume/${user.id}`)
  }

  // Snapshot from LinkedIn OAuth user_metadata — always available immediately after login.
  // Falls back to enriched ResumeCanonical fields once enrich completes.
  const displayName = user.user_metadata?.full_name || profileData?.full_name || "User"
  const photoUrl = user.user_metadata?.avatar_url as string | undefined
  const headline =
    (user.user_metadata?.headline as string | undefined) ||
    profileData?.headline ||
    profileData?.occupation
  const email = user.email
  const location =
    profileData?.city && profileData?.country
      ? `${profileData.city}, ${profileData.country}`
      : profileData?.city || profileData?.country

  const stats = [
    { icon: Briefcase, label: "Experience", value: profileData?.experiences?.length ?? 0 },
    { icon: GraduationCap, label: "Education", value: profileData?.education?.length ?? 0 },
    { icon: Award, label: "Skills", value: profileData?.skills?.length ?? 0 },
  ]

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-b from-background to-muted/30">
          <CardContent className="p-0">
            {/* Header with gradient */}
            <motion.div
              variants={itemVariants}
              className="relative h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"
            >
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <motion.div variants={itemVariants} className="relative">
                  {isLoading ? (
                    <div className="h-24 w-24 rounded-full bg-muted animate-pulse flex items-center justify-center border-4 border-background">
                      <Linkedin className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  ) : (
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage src={photoUrl} alt={displayName} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {displayName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="px-6 pt-16 pb-6 space-y-5">
              <motion.div variants={itemVariants} className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
                {headline && <p className="text-muted-foreground text-sm line-clamp-2">{headline}</p>}
                <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                  {email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                    </span>
                  )}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-3"
                  >
                    <div className="rounded-xl bg-muted/50 p-5 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        <span className="text-sm font-medium">Syncing LinkedIn Profile</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">Importing your professional information...</p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center"
                  >
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign out and try logging in again — your email may not match a LinkedIn profile.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={handleSignOutAndRetry}>
                      Sign Out & Retry
                    </Button>
                  </motion.div>
                )}

                {!isLoading && !error && (hasResume || profileData) && (
                  <motion.div
                    key="success"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Profile Synced</span>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                      {stats.map((stat) => (
                        <motion.div
                          key={stat.label}
                          variants={itemVariants}
                          className="rounded-xl bg-muted/50 p-3 text-center"
                        >
                          <stat.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                      <Button className="flex-1" size="lg" onClick={handleViewResume}>
                        <FileText className="mr-2 h-5 w-5" />
                        View Resume
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setShowShareDialog(true)}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground"
              >
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                <span>Powered by LinkedIn & EnrichLayer</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        vanityUrl={personData?.vanity_url || personData?.public_identifier || user.id}
        userId={user.id}
      />
    </>
  )
}
