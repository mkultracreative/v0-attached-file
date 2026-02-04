import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles, Users, Linkedin } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ResumeAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white">
                <Linkedin className="h-4 w-4" />
                Sign in with LinkedIn
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Import Your LinkedIn Profile, Build Your Resume
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            Connect your LinkedIn account and instantly create a professional, ATS-friendly resume. Your work history,
            skills, and education imported automatically.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white">
                <Linkedin className="h-5 w-5" />
                Continue with LinkedIn
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">One click to import your entire professional profile</p>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0A66C2]/10">
              <Linkedin className="h-6 w-6 text-[#0A66C2]" />
            </div>
            <h3 className="mt-4 font-semibold">LinkedIn Import</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Import your work history, education, and skills directly from LinkedIn.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">AI-Enhanced</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Let AI help you polish descriptions and optimize your content.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Real-Time Collaboration</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Edit your resume with live updates and seamless sync across devices.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
