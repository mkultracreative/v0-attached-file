"use client"

import { useState } from "react"
import { useMutation, useStorage } from "@liveblocks/react/suspense"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Palette, Printer, Download, Share2, Sparkles } from "lucide-react"
import { ShareDialog } from "@/components/share-dialog"
import { createClient } from "@/lib/supabase/client"

interface FloatingToolbarProps {
  userId: string
}

const occupationThemes = [
  {
    name: "Software Engineer",
    colors: { primary: "#0f172a", secondary: "#64748b", accent: "#3b82f6", background: "#ffffff", text: "#0f172a" },
  },
  {
    name: "Designer",
    colors: { primary: "#18181b", secondary: "#71717a", accent: "#f43f5e", background: "#fafafa", text: "#18181b" },
  },
  {
    name: "Marketing",
    colors: { primary: "#1c1917", secondary: "#78716c", accent: "#f59e0b", background: "#fffbeb", text: "#1c1917" },
  },
  {
    name: "Finance",
    colors: { primary: "#0c0a09", secondary: "#57534e", accent: "#059669", background: "#ffffff", text: "#0c0a09" },
  },
  {
    name: "Healthcare",
    colors: { primary: "#1e3a5f", secondary: "#64748b", accent: "#0ea5e9", background: "#f0f9ff", text: "#1e3a5f" },
  },
  {
    name: "Education",
    colors: { primary: "#1e293b", secondary: "#64748b", accent: "#8b5cf6", background: "#faf5ff", text: "#1e293b" },
  },
  {
    name: "Legal",
    colors: { primary: "#1a1a1a", secondary: "#525252", accent: "#b45309", background: "#fffbeb", text: "#1a1a1a" },
  },
  {
    name: "Creative",
    colors: { primary: "#18181b", secondary: "#71717a", accent: "#ec4899", background: "#fdf2f8", text: "#18181b" },
  },
  {
    name: "Sales",
    colors: { primary: "#0f172a", secondary: "#475569", accent: "#22c55e", background: "#f0fdf4", text: "#0f172a" },
  },
  {
    name: "Default",
    colors: { primary: "#171717", secondary: "#737373", accent: "#0066cc", background: "#ffffff", text: "#171717" },
  },
]

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Georgia", label: "Georgia" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Playfair Display", label: "Playfair" },
  { value: "Roboto", label: "Roboto" },
]

export function FloatingToolbar({ userId }: FloatingToolbarProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [vanityUrl, setVanityUrl] = useState("")

  const theme = useStorage((root) => root.theme)
  const profile = useStorage((root) => root.profile)

  const updateThemeColors = useMutation(({ storage }, colors: Record<string, string>) => {
    const t = storage.get("theme")
    if (t) t.colors = { ...t.colors, ...colors }
  }, [])

  const updateThemeFonts = useMutation(({ storage }, fonts: Record<string, string>) => {
    const t = storage.get("theme")
    if (t) t.fonts = { ...t.fonts, ...fonts }
  }, [])

  const updateThemeName = useMutation(({ storage }, name: string) => {
    const t = storage.get("theme")
    if (t) t.name = name
  }, [])

  const applyTheme = async (themeDef: (typeof occupationThemes)[0]) => {
    setSelectedTheme(themeDef.name)
    updateThemeName(themeDef.name)
    updateThemeColors(themeDef.colors)

    const supabase = createClient()
    await supabase
      .from("people")
      .update({
        theme_data: { name: themeDef.name, colors: themeDef.colors, fonts: theme?.fonts, layout: theme?.layout },
      })
      .eq("id", userId)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handleShare = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("people").select("vanity_url, public_identifier").eq("id", userId).single()
    setVanityUrl(data?.vanity_url || data?.public_identifier || userId)
    setShowShareDialog(true)
  }

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 left-1/2 right-1/2 -translate-x-1/2 z-50 print:hidden"
      >
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1 rounded-full border bg-background/90 backdrop-blur px-3 py-2 shadow-lg">
            {/* Theme */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Theme</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80" align="center" side="top">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Occupation Themes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {occupationThemes.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => applyTheme(t)}
                        className={`relative flex items-center gap-2 rounded-lg border p-2 text-xs transition-colors hover:bg-muted text-left ${
                          selectedTheme === t.name ? "border-primary bg-muted" : "border-border"
                        }`}
                      >
                        <div className="flex gap-0.5 shrink-0">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                        </div>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Custom Colors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "primary", label: "Primary" },
                        { key: "accent", label: "Accent" },
                        { key: "background", label: "Background" },
                        { key: "text", label: "Text" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <Label className="text-xs">{label}</Label>
                          <Input
                            type="color"
                            value={(theme?.colors as Record<string, string>)?.[key] || "#000000"}
                            onChange={(e) => updateThemeColors({ [key]: e.target.value })}
                            className="h-7 w-10 cursor-pointer p-0.5 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Typography</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Heading</Label>
                        <Select
                          value={theme?.fonts?.heading || "Inter"}
                          onValueChange={(v) => updateThemeFonts({ heading: v })}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((f) => (
                              <SelectItem key={f.value} value={f.value} className="text-xs">
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Body</Label>
                        <Select
                          value={theme?.fonts?.body || "Inter"}
                          onValueChange={(v) => updateThemeFonts({ body: v })}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((f) => (
                              <SelectItem key={f.value} value={f.value} className="text-xs">
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-5 w-px bg-border mx-1" />

            {/* Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Share</p>
              </TooltipContent>
            </Tooltip>

            {/* Print */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Print</p>
              </TooltipContent>
            </Tooltip>

            {/* PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Save PDF</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-5 w-px bg-border mx-1" />

            {/* AI */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>AI Enhance</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </motion.div>

      <ShareDialog open={showShareDialog} onOpenChange={setShowShareDialog} vanityUrl={vanityUrl} userId={userId} />
    </>
  )
}
