"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Sprawdz swoja skrzynke</CardTitle>
          <CardDescription>
            Wyslalismy Ci link aktywacyjny na podany adres email. Kliknij w link, aby aktywowac konto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            <p>Jesli nie widzisz wiadomosci, sprawdz folder spam lub poczekaj kilka minut.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/auth/login">
                Przejdz do logowania
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
