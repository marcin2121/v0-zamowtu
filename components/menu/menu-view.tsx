'use client'

import { useState, useMemo } from 'react'
import { UtensilsCrossed, Clock, MapPin, Phone, ShoppingCart, Star, ChevronDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MenuItemCard } from './menu-item-card'
import { CartDrawer } from './cart-drawer'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useCartStore } from '@/lib/cart-store'
import type { MenuItem, MenuCategory, RestaurantSettings, Review } from '@/lib/types'

interface MenuViewProps {
  restaurantId: string | null
  settings: RestaurantSettings | null
  categories: MenuCategory[]
  menuItems: MenuItem[]
  reviews?: Review[]
  averageRating?: number
}

function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#fafaf9'
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

export function MenuView({ restaurantId, settings, categories, menuItems, reviews = [], averageRating = 0 }: MenuViewProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())

  const customStyles = useMemo(() => {
    if (!settings) return {}
    return {
      primaryColor: settings.primary_color || '#DC2626',
      secondaryColor: settings.secondary_color || '#1c1917',
      accentColor: settings.accent_color || '#10B981',
      fontFamily: getFontFamily(settings.font_family || 'default'),
      textColor: getContrastColor(settings.secondary_color || '#1c1917'),
    }
  }, [settings])

  if (!restaurantId || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            ZamówTu
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            System zamówień online dla restauracji. Aby zobaczyć menu, potrzebujesz linku od restauracji.
          </p>
          <div className="p-6 bg-muted/50 rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground">
              Jesteś właścicielem restauracji?{' '}
              <a href="/dashboard" className="text-accent font-semibold hover:underline">
                Zaloguj się do panelu
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const filteredItems = activeCategory
    ? menuItems.filter((item) => item.category_id === activeCategory)
    : menuItems

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Name */}
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url || "/placeholder.svg"} 
                  alt={settings.restaurant_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-accent" />
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">{settings.restaurant_name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {settings.show_reviews && averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  <Badge 
                    variant={settings.accepting_orders !== false ? 'default' : 'secondary'}
                    className="text-[10px] h-5"
                    style={{
                      backgroundColor: settings.accepting_orders !== false ? customStyles.accentColor : undefined,
                      color: settings.accepting_orders !== false ? '#ffffff' : undefined,
                    }}
                  >
                    {settings.accepting_orders !== false ? 'Otwarte' : 'Zamknięte'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button
                variant="cta"
                size="sm"
                className="relative gap-2"
                onClick={() => setCartOpen(true)}
                disabled={settings.accepting_orders === false || itemCount === 0}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Koszyk</span>
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-accent text-white border-2 border-background">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Info Bar - Always Visible */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Min. zamówienie</p>
              <p className="text-sm font-bold text-foreground">{settings.min_order_value.toFixed(2)} zł</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Dostawa</p>
              <p className="text-sm font-bold text-foreground">{settings.delivery_fee.toFixed(2)} zł</p>
            </div>
            <div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full hover:bg-muted/50 rounded-lg transition-colors"
              >
                <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                  {(() => {
                    const now = new Date()
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const today = dayNames[now.getDay()]
                    const todayHours = settings.opening_hours?.[today]
                    return todayHours ? 'Dziś' : 'Godziny'
                  })()}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showInfo ? 'rotate-180' : ''}`} />
                </p>
                <p className="text-sm font-bold text-foreground">
                  {(() => {
                    const now = new Date()
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const today = dayNames[now.getDay()]
                    const todayHours = settings.opening_hours?.[today]
                    if (todayHours) {
                      const isOpenDay = todayHours.isOpen !== false
                      const openTime = todayHours.open || todayHours.openTime
                      const closeTime = todayHours.close || todayHours.closeTime
                      if (isOpenDay && openTime && closeTime) {
                        return `${openTime}-${closeTime}`
                      }
                    }
                    return 'Zamknięte'
                  })()}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Full Info Panel */}
      {showInfo && (
        <div className="bg-muted/20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              {/* Full Week Opening Hours */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Godziny otwarcia w tym tygodniu</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                  {settings.opening_hours && Object.entries(settings.opening_hours).map(([day, hours]: [string, any]) => {
                    const dayLabel = {
                      'monday': 'Pon',
                      'tuesday': 'Wt',
                      'wednesday': 'Śr',
                      'thursday': 'Czw',
                      'friday': 'Pt',
                      'saturday': 'Sob',
                      'sunday': 'Niedz'
                    }[day] || day

                    const isOpenDay = hours.isOpen !== false
                    const openTime = hours.open || hours.openTime
                    const closeTime = hours.close || hours.closeTime
                    
                    // Check if today
                    const now = new Date()
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const today = dayNames[now.getDay()]
                    const isToday = day === today
                    
                    return (
                      <div 
                        key={day} 
                        className={`p-2 rounded-lg text-center ${isToday ? 'bg-accent/10 ring-1 ring-accent' : 'bg-card'}`}
                      >
                        <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-accent' : 'text-foreground'}`}>{dayLabel}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {isOpenDay && openTime && closeTime ? `${openTime}-${closeTime}` : 'Zamknięte'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Additional Info */}
              {(settings.description || settings.address || settings.phone) && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  {settings.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">O restauracji</h4>
                      <p className="text-sm text-foreground leading-relaxed">{settings.description}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {settings.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-foreground">{settings.address}</span>
                      </div>
                    )}
                    {settings.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{settings.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Closed Alert - Only show if accepting_orders is false */}
      {settings.accepting_orders === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">Restauracja jest obecnie zamknięta</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Obecnie nie przyjmujemy zamówień. Sprawdź godziny otwarcia.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Navigation */}
      {categories.length > 0 && (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              <Button
                size="sm"
                variant={activeCategory === null ? 'cta' : 'outline'}
                onClick={() => setActiveCategory(null)}
                className="shrink-0 rounded-full"
              >
                Wszystkie
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  size="sm"
                  variant={activeCategory === category.id ? 'cta' : 'outline'}
                  onClick={() => setActiveCategory(category.id)}
                  className="shrink-0 rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Brak produktów</p>
            <p className="text-sm text-muted-foreground">
              {activeCategory ? 'Nie znaleziono produktów w tej kategorii.' : 'Menu jest obecnie puste.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                restaurantId={restaurantId}
                customStyles={customStyles}
              />
            ))}
          </div>
        )}
      </main>

      {/* Reviews Section */}
      {settings.show_reviews && reviews.length > 0 && (
        <section className="border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Opinie klientów</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} opinii)</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((review) => (
                <div 
                  key={review.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {review.comment || 'Świetne jedzenie!'}
                  </p>
                  <p className="text-xs font-medium text-foreground">{review.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        settings={settings}
        restaurantId={restaurantId}
        restaurantSlug={settings.slug}
        customStyles={customStyles}
      />
    </div>
  )
}
