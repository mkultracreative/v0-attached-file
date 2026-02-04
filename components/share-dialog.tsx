"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, Pencil, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vanityUrl: string
  userId: string
}

export function ShareDialog({ open, onOpenChange, vanityUrl, userId }: ShareDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newVanityUrl, setNewVanityUrl] = useState(vanityUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const fullUrl = `${baseUrl}/r/${vanityUrl}`

  useEffect(() => {
    setNewVanityUrl(vanityUrl)
  }, [vanityUrl])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSaveVanityUrl = async () => {
    if (!newVanityUrl.trim() || newVanityUrl === vanityUrl) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if vanity URL is taken
      const { data: existing } = await supabase
        .from("people")
        .select("id")
        .eq("vanity_url", newVanityUrl)
        .neq("id", userId)
        .single()

      if (existing) {
        setError("This URL is already taken")
        setIsSaving(false)
        return
      }

      const { error: updateError } = await supabase.from("people").update({ vanity_url: newVanityUrl }).eq("id", userId)

      if (updateError) throw updateError

      setIsEditing(false)
    } catch (err) {
      setError("Failed to update URL")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <QRCodeSVG value={fullUrl} size={180} level="H" includeMargin={false} />
            </div>
          </motion.div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label>Resume Link</Label>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <div className="flex-1 flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">{baseUrl}/r/</span>
                    <Input
                      value={newVanityUrl}
                      onChange={(e) => setNewVanityUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1"
                      autoFocus
                    />
                  </div>
                  <Button size="sm" onClick={handleSaveVanityUrl} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Input value={fullUrl} readOnly className="flex-1 bg-muted" />
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Copy Button */}
          <Button className="w-full" onClick={handleCopy}>
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
