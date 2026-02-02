'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Store, Clock, Truck, Calendar, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { RestaurantSettings } from '@/lib/types'

interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

const defaultSchedule: WeekSchedule = {
  monday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '12:00', closeTime: '21:00' },
}

const dayNames: Record<keyof WeekSchedule, string> = {
  monday: 'Poniedzialek',
  tuesday: 'Wtorek',
  wednesday: 'Sroda',
  thursday: 'Czwartek',
  friday: 'Piatek',
  saturday: 'Sobota',
  sunday: 'Niedziela',
}

interface SettingsFormProps {
  settings: RestaurantSettings | null
  userId: string
}

export function SettingsForm({ settings, userId }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    restaurant_name: settings?.restaurant_name || '',
    slug: settings?.slug || '',
    address: settings?.address || '',
    phone: settings?.phone || '',
    min_order_value: settings?.min_order_value?.toString() || '30',
    max_delivery_distance_km: settings?.max_delivery_distance_km?.toString() || '10',
    delivery_fee: settings?.delivery_fee?.toString() || '5',
    is_open: settings?.is_open ?? true,
  })
  const [slugError, setSlugError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    if (settings?.opening_hours && typeof settings.opening_hours === 'object') {
      return { ...defaultSchedule, ...settings.opening_hours as WeekSchedule }
    }
    return defaultSchedule
  })

  const updateDaySchedule = (day: keyof WeekSchedule, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const copyToAllDays = (sourceDay: keyof WeekSchedule) => {
    const source = schedule[sourceDay]
    const newSchedule = { ...schedule }
    for (const day of Object.keys(newSchedule) as (keyof WeekSchedule)[]) {
      newSchedule[day] = { ...source }
    }
    setSchedule(newSchedule)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const supabase = createClient()
      
      // Validate slug format
      const slugValue = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      
      if (slugValue && slugValue.length < 3) {
        setSlugError('Adres URL musi miec co najmniej 3 znaki')
        setLoading(false)
        return
      }

      // Check if slug is unique
      if (slugValue) {
        const { data: existingSlug } = await supabase
          .from('restaurant_settings')
          .select('id')
          .eq('slug', slugValue)
          .neq('user_id', userId)
          .single()
        
        if (existingSlug) {
          setSlugError('Ten adres URL jest juz zajety')
          setLoading(false)
          return
        }
      }
      
      setSlugError(null)
      
      const updateData = {
        restaurant_name: formData.restaurant_name,
        slug: slugValue || null,
        address: formData.address || null,
        phone: formData.phone || null,
        min_order_value: parseFloat(formData.min_order_value) || 30,
        max_delivery_distance_km: parseFloat(formData.max_delivery_distance_km) || 10,
        delivery_fee: parseFloat(formData.delivery_fee) || 5,
        is_open: formData.is_open,
        opening_hours: schedule,
        updated_at: new Date().toISOString(),
      }

      if (settings) {
        await supabase
          .from('restaurant_settings')
          .update(updateData)
          .eq('id', settings.id)
      } else {
        await supabase
          .from('restaurant_settings')
          .insert({ ...updateData, user_id: userId })
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOpen = async () => {
    const newValue = !formData.is_open
    setFormData({ ...formData, is_open: newValue })
    
    if (settings) {
      const supabase = createClient()
      await supabase
        .from('restaurant_settings')
        .update({ is_open: newValue, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Restaurant Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Status restauracji
          </CardTitle>
          <CardDescription>
            Kontroluj czy restauracja przyjmuje zamowienia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">
                Restauracja jest {formData.is_open ? 'otwarta' : 'zamknieta'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.is_open
                  ? 'Klienci moga skladac zamowienia'
                  : 'Zamowienia sa tymczasowo wstrzymane'}
              </p>
            </div>
            <Switch
              checked={formData.is_open}
              onCheckedChange={toggleOpen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Public URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Adres Twojej strony
          </CardTitle>
          <CardDescription>
            Unikalny adres URL pod ktorym klienci znajda Twoje menu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Adres URL restauracji</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://twojadomena.pl'}/r/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value })
                    setSlugError(null)
                  }}
                  placeholder="nazwa-restauracji"
                  className="rounded-l-none"
                />
              </div>
            </div>
            {slugError && (
              <p className="text-sm text-destructive">{slugError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Uzyj tylko malych liter, cyfr i myslnikow. Np. pizzeria-roma, sushi-master
            </p>
          </div>
          
          {formData.slug && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Twój link do menu:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background px-2 py-1 rounded border text-foreground">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://twojadomena.pl'}/r/{formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/r/${formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`
                    navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? 'Skopiowano!' : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/r/${formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`
                    window.open(url, '_blank')
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Informacje podstawowe
          </CardTitle>
          <CardDescription>
            Dane Twojej restauracji widoczne dla klientow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Nazwa restauracji *</Label>
            <Input
              id="restaurant_name"
              required
              value={formData.restaurant_name}
              onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
              placeholder="Moja Restauracja"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="ul. Przykladowa 1, 00-001 Warszawa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+48 123 456 789"
            />
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Harmonogram otwarcia
          </CardTitle>
          <CardDescription>
            Ustaw godziny otwarcia dla kazdego dnia tygodnia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(Object.keys(dayNames) as (keyof WeekSchedule)[]).map((day) => (
              <div
                key={day}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
                  schedule[day].isOpen ? 'bg-card' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={schedule[day].isOpen}
                    onCheckedChange={(checked) => updateDaySchedule(day, 'isOpen', checked)}
                  />
                  <span className={`font-medium ${!schedule[day].isOpen ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {dayNames[day]}
                  </span>
                </div>
                
                {schedule[day].isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={schedule[day].openTime}
                        onChange={(e) => updateDaySchedule(day, 'openTime', e.target.value)}
                        className="w-[120px]"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={schedule[day].closeTime}
                      onChange={(e) => updateDaySchedule(day, 'closeTime', e.target.value)}
                      className="w-[120px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAllDays(day)}
                      className="ml-2 text-xs hidden sm:inline-flex"
                    >
                      Kopiuj do wszystkich
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Zamkniete</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Godziny otwarcia sa wyswietlane klientom na stronie menu. Zamowienia moga byc skladane tylko w godzinach otwarcia (chyba ze sa zaplanowane na pozniej).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Ustawienia dostawy
          </CardTitle>
          <CardDescription>
            Skonfiguruj warunki dostawy i platnosci
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="min_order_value">Minimalna wartosc zamowienia (zl)</Label>
              <Input
                id="min_order_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_order_value}
                onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Klient nie moze zlozyc zamowienia ponizej tej kwoty
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_delivery_distance_km">Maksymalny zasieg dostawy (km)</Label>
              <Input
                id="max_delivery_distance_km"
                type="number"
                step="0.1"
                min="0"
                value={formData.max_delivery_distance_km}
                onChange={(e) => setFormData({ ...formData, max_delivery_distance_km: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Informacja wyswietlana klientom
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Koszt dostawy (zl)</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.delivery_fee}
                onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Doliczany do kazdego zamowienia z dostawa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Zapisz ustawienia
            </>
          )}
        </Button>
        {success && (
          <p className="text-sm text-accent font-medium">
            Ustawienia zostaly zapisane!
          </p>
        )}
      </div>
    </form>
  )
}
