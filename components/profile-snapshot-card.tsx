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

      if (!data.success) {
        console.warn("[enrich] No profile found:", data.reason)
        setIsLoading(false)
        return
      }

      // Successful fetch
      setProfileData(data.profile as ResumeCanonical)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleViewResume = () => {
    if (!personData?.id) {
      alert("Error: Missing resume data. Try refreshing the page.")
      console.error("No personData.id is available")
      return
    }

    router.push(`/resume/${personData.id}`)
  }

  const displayName = user.user_metadata?.full_name || profileData?.full_name || "User"
  const photoUrl = user.user_metadata?.avatar_url as string | undefined
  const headline = user.user_metadata?.headline || profileData?.headline || profileData?.occupation
  const email = user.email
  const location = profileData?.city && profileData?.country
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
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="relative h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"
            >
              <motion.div variants={itemVariants} className="relative">
                {isLoading ? (
                  <div className="h-24 bg-muted" />
                ) : (
                  <Avatar className="h-24">
                    <AvatarImage src={photoUrl} alt={displayName} />
                  </Avatar>
                )}
              </motion.div>
            </motion.div>

            <div className="px-6 pt-16 space-y-5">
              <motion.div variants={itemVariants}>
                <h1>{displayName}</h1>
                {headline && <p>{headline}</p>}
              </motion.div>

              <AnimatePresence>
                <Button onClick={handleViewResume}>View Resume</Button>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}