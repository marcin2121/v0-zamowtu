'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, Eye, Type, ImageIcon, MessageSquare } from 'lucide-react'
import type { RestaurantSettings, MenuItem, MenuCategory } from '@/lib/types'

const FONT_OPTIONS = [
  { value: 'default', label: 'Domyślna (System)' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'lato', label: 'Lato' },
]

export default function CustomizePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [formData, setFormData] = useState({
    logo_url: '',
    banner_url: '',
    primary_color: '#151b21',
    secondary_color: '#f5f5f5',
    accent_color: '#151b21',
    font_family: 'default',
    show_reviews: true,
    description: '',
    custom_welcome_text: '',
  })

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      setUser(user)

      // Load settings
      const { data: settingsArray } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      const settingsData = settingsArray?.[0]

      if (!settingsData) {
        router.push('/dashboard')
        return
      }

      // Check if user has Professional plan
      if (settingsData.subscription_plan !== 'professional') {
        router.push('/dashboard/billing')
        return
      }

      setSettings(settingsData)
      setFormData({
        logo_url: settingsData.logo_url || '',
        banner_url: settingsData.banner_url || '',
        primary_color: settingsData.primary_color || '#151b21',
        secondary_color: settingsData.secondary_color || '#f5f5f5',
        accent_color: settingsData.accent_color || '#151b21',
        font_family: settingsData.font_family || 'default',
        show_reviews: settingsData.show_reviews ?? true,
        description: settingsData.description || '',
        custom_welcome_text: settingsData.custom_welcome_text || '',
      })

      // Load categories and menu items for preview
      const { data: categoriesData } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order')

      const { data: itemsData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_available', true)
        .order('sort_order')

      setCategories(categoriesData || [])
      setMenuItems(itemsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    const supabase = createClient()

    await supabase
      .from('restaurant_settings')
      .update({
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        primary_color: '#151b21',
        secondary_color: '#f5f5f5',
        accent_color: '#151b21',
        font_family: formData.font_family,
        show_reviews: formData.show_reviews,
        description: formData.description || null,
        custom_welcome_text: formData.custom_welcome_text || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    setSaving(false)
  }

  const openPreview = () => {
    if (settings?.slug) {
      window.open(`/r/${settings.slug}`, '_blank')
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Personalizacja menu</h1>
            <p className="text-muted-foreground">Dostosuj wygląd strony menu dla klientów</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openPreview} disabled={!settings?.slug}>
              <Eye className="w-4 h-4 mr-2" />
              Podgląd
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Zapisz zmiany
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="branding">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Grafika
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="w-4 h-4 mr-1" />
                  Czcionka
                </TabsTrigger>
                <TabsTrigger value="content">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Treść
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo i baner</CardTitle>
                    <CardDescription>Dodaj logo i zdjęcie w tle strony menu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo">URL logo</Label>
                      <Input
                        id="logo"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-muted-foreground">Zalecany rozmiar: 200x200px</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner">URL banera</Label>
                      <Input
                        id="banner"
                        value={formData.banner_url}
                        onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                      />
                      <p className="text-xs text-muted-foreground">Zalecany rozmiar: 1200x400px</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="typography" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Czcionka</CardTitle>
                    <CardDescription>Wybierz styl czcionki dla menu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="font">Rodzina czcionek</Label>
                      <Select
                        value={formData.font_family}
                        onValueChange={(v) => setFormData({ ...formData, font_family: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz czcionkę" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Treść strony</CardTitle>
                    <CardDescription>Dodaj opis i spersonalizuj powitanie</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Opis restauracji</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Opowiedz o swojej restauracji..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="welcome">Tekst powitania</Label>
                      <Input
                        id="welcome"
                        value={formData.custom_welcome_text}
                        onChange={(e) => setFormData({ ...formData, custom_welcome_text: e.target.value })}
                        placeholder="np. Witaj w naszej restauracji!"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <Label htmlFor="show-reviews">Pokaż opinie klientów</Label>
                        <p className="text-xs text-muted-foreground">Wyświetl oceny na stronie menu</p>
                      </div>
                      <Switch
                        id="show-reviews"
                        checked={formData.show_reviews}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_reviews: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-4">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Podgląd na żywo</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <div 
                    className="h-[600px] overflow-y-auto border-t"
                    style={{
                      backgroundColor: formData.secondary_color,
                      color: getContrastColor(formData.secondary_color),
                      fontFamily: getFontFamily(formData.font_family),
                    }}
                  >
                    {/* Preview Banner */}
                    {formData.banner_url && (
                      <div 
                        className="h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url(${formData.banner_url})` }}
                      />
                    )}

                    {/* Preview Header */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        {formData.logo_url && (
                          <img 
                            src={formData.logo_url || "/placeholder.svg"} 
                            alt="Logo" 
                            className="w-12 h-12 rounded-lg object-cover border-2"
                            style={{ borderColor: formData.primary_color }}
                          />
                        )}
                        <div>
                          <h2 
                            className="text-lg font-bold"
                            style={{ fontFamily: getFontFamily(formData.font_family), color: getContrastColor(formData.secondary_color) }}
                          >
                            {settings?.restaurant_name || 'Nazwa Restauracji'}
                          </h2>
                          {formData.custom_welcome_text && (
                            <p className="text-xs opacity-70">{formData.custom_welcome_text}</p>
                          )}
                        </div>
                      </div>

                      {formData.description && (
                        <p className="text-xs opacity-60 mb-3">{formData.description}</p>
                      )}

                      {/* Sample Menu Items - Display all */}
                      <div className="space-y-3">
                        {categories.map((category) => (
                          <div key={category.id}>
                            <h3 
                              className="font-semibold text-sm mb-2 pb-1 border-b"
                              style={{ 
                                fontFamily: getFontFamily(formData.font_family),
                                borderColor: formData.primary_color,
                                color: formData.primary_color,
                              }}
                            >
                              {category.name}
                            </h3>
                            <div className="space-y-1.5">
                              {menuItems
                                .filter(item => item.category_id === category.id)
                                .slice(0, 3)
                                .map((item) => (
                                  <div 
                                    key={item.id}
                                    className="flex justify-between items-start p-2 rounded text-xs"
                                    style={{ backgroundColor: `${formData.primary_color}08` }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{item.name}</div>
                                      {item.description && (
                                        <div className="opacity-60 line-clamp-1 text-xs">{item.description}</div>
                                      )}
                                    </div>
                                    <span 
                                      className="font-bold ml-2 shrink-0"
                                      style={{ color: formData.accent_color }}
                                    >
                                      {item.price.toFixed(2)} zł
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}

                        {categories.length === 0 && (
                          <div className="text-center py-8 opacity-40">
                            <p className="text-xs">Brak produktów do wyświetlenia</p>
                          </div>
                        )}
                      </div>

                      {/* Sample Add to Cart Button */}
                      <div className="mt-4">
                        <button
                          className="w-full py-2 rounded-full font-medium text-white text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: formData.primary_color }}
                        >
                          Dodaj do koszyka
                        </button>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1c1917' : '#fafaf9'
}

function getFontFamily(font: string): string {
  const fonts: Record<string, string> = {
    default: 'system-ui, sans-serif',
    inter: '"Inter", sans-serif',
    poppins: '"Poppins", sans-serif',
    playfair: '"Playfair Display", serif',
    roboto: '"Roboto", sans-serif',
    lato: '"Lato", sans-serif',
  }
  return fonts[font] || fonts.default
}
