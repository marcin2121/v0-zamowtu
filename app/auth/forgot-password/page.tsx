'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Loader2, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Uzyj produkcyjnego URL lub window.location.origin jako fallback
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      
      // Supabase Password Reset - przekierowanie na / (strona główna) gdzie middleware przechwyta kod
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/`,
      })

      if (error) throw error

      setSuccess(true)
      setEmail('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udalo sie wyslac linku resetowania'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Resetowanie hasła</CardTitle>
          <CardDescription>
            Wprowadź swój email, aby otrzymać link resetowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 border border-accent rounded-lg text-center">
                <p className="text-sm font-medium text-foreground">
                  ✓ Link resetowania hasła został wysłany na Twój email!
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Sprawdź swoją skrzynkę odbiorczą (i folder spam) na wiadomość z linkiem resetowania hasła.
              </p>
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć do logowania
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontakt@zamowtu.pl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  'Wyślij link resetowania'
                )}
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć do logowania
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
