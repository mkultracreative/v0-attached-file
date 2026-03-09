"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "unknown_error"
  const errorDescription = searchParams.get("error_description") || "An authentication error occurred"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Authentication Error</CardTitle>
            <CardDescription>
              {errorDescription.replace(/\+/g, " ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-mono text-muted-foreground">Error: {error}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This can happen if your session expired or cookies were cleared. Please try signing in again.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
