'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UtensilsCrossed, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    // Obsługa kodu z URL - wymiana na sesję
    const exchangeCodeForSession = async () => {
      const code = searchParams.get('code')
      const supabase = createClient()
      
      if (code) {
        // Wymień kod na sesję
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError('Link resetowania wygasł lub jest nieprawidłowy. Spróbuj ponownie.')
          return
        }
      } else {
        // Sprawdź czy mamy już aktywną sesję
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setError('Brak kodu resetowania. Spróbuj ponownie.')
        }
      }
    }
    
    exchangeCodeForSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Walidacja hasel
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Hasla nie sa identyczne')
      }

      if (formData.password.length < 6) {
        throw new Error('Haslo musi miec co najmniej 6 znakow')
      }

      const supabase = createClient()
      
      // Aktualizacja hasla - Supabase automatycznie wie ktorego uzytkownika zaktualizowac
      // dzieki sesji ustawionej przez token w URL
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setSuccess(true)
      setFormData({ password: '', confirmPassword: '' })

      // Przekierowanie do logowania po 2 sekundach
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udalo sie zresetowac hasla'
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
          <CardTitle className="text-2xl">Nowe hasło</CardTitle>
          <CardDescription>
            Ustaw nowe hasło do swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                <p className="text-sm font-medium text-accent-foreground">
                  ✓ Hasło zostało zmienione!
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Zostaniesz przekierowany do logowania za chwilę...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nowe hasło</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 znaków"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Powtórz hasło"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetowanie...
                  </>
                ) : (
                  'Ustaw nowe hasło'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
