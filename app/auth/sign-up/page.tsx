'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, UtensilsCrossed, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const initialPlan = (searchParams.get('plan') as 'starter' | 'professional') || 'professional'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>(initialPlan)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurantName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate email
      if (!formData.email.includes('@')) {
        throw new Error('Podaj prawidłowy email')
      }

      if (!formData.restaurantName.trim()) {
        throw new Error('Podaj nazwę restauracji')
      }

      if (formData.password.length < 6) {
        throw new Error('Hasło musi mieć minimum 6 znaków')
      }

      const supabase = createClient()
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            restaurant_name: formData.restaurantName,
            subscription_plan: selectedPlan,
          },
        },
      })

      if (signUpError) {
        // Handle various error messages from Supabase
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already exists') ||
            signUpError.message.toLowerCase().includes('email already') ||
            signUpError.status === 422) {
          throw new Error('Ten email jest już zarejestrowany')
        }
        throw new Error(signUpError.message || 'Błąd podczas rejestracji')
      }

      // Check if user already exists (Supabase returns user with empty identities array)
      if (data?.user?.identities && data.user.identities.length === 0) {
        throw new Error('Ten email jest już zarejestrowany')
      }
      
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl">Sprawdz email</CardTitle>
            <CardDescription>
              Wyslalismy link potwierdzajacy na adres <strong>{formData.email}</strong>.
              Kliknij w link, aby aktywowac konto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full bg-transparent">
                Powrot do logowania
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Zarejestruj Restauracje</CardTitle>
          <CardDescription>
            Stworz konto, aby zaczac przyjmowac zamowienia online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Wybierz plan</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Starter Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('starter')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === 'starter'
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-foreground">Starter</div>
                  <div className="text-2xl font-bold text-primary my-2">99 zł</div>
                  <div className="text-xs text-muted-foreground">/miesiąc</div>
                  {selectedPlan === 'starter' && (
                    <Check className="w-4 h-4 text-primary mt-2" />
                  )}
                </button>

                {/* Professional Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('professional')}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    selectedPlan === 'professional'
                      ? 'border-accent bg-accent/5'
                      : 'border-input hover:border-accent/50'
                  }`}
                >
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      Polecane
                    </Badge>
                  </div>
                  <div className="font-semibold text-foreground">Professional</div>
                  <div className="text-2xl font-bold text-accent my-2">199 zł</div>
                  <div className="text-xs text-muted-foreground">/miesiąc</div>
                  {selectedPlan === 'professional' && (
                    <Check className="w-4 h-4 text-accent mt-2" />
                  )}
                </button>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-muted/50 p-3 rounded-lg text-xs">
              {selectedPlan === 'starter' ? (
                <div className="space-y-2">
                  <div className="font-semibold text-foreground mb-2">Plan Starter zawiera:</div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" /><span>Menu i zamówienia</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" /><span>Zarządzanie dostawami</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" /><span>Płatności online</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" /><span>Harmonogram otwarcia</span></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold text-foreground mb-2">Plan Professional zawiera wszystko z Starter +:</div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" /><span>Kody rabatowe</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" /><span>Program lojalnościowy</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" /><span>Opinie i oceny</span></div>
                  <div className="flex gap-2"><Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" /><span>Zaawansowane statystyki</span></div>
                </div>
              )}
            </div>

            <hr className="my-2" />

            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nazwa restauracji</Label>
              <Input
                id="restaurantName"
                required
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                placeholder="Moja Restauracja"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="restauracja@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 znaków</p>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejestracja...
                </>
              ) : (
                `Zarejestruj - ${selectedPlan === 'starter' ? '99 zł' : '199 zł'}/mies.`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Masz juz konto? </span>
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Zaloguj sie
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
