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
                    variant={settings.is_open ? 'default' : 'secondary'}
                    className="text-[10px] h-5"
                    style={{
                      backgroundColor: settings.is_open ? customStyles.accentColor : undefined,
                      color: settings.is_open ? '#ffffff' : undefined,
                    }}
                  >
                    {settings.is_open ? 'Otwarte' : 'Zamknięte'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="hidden sm:flex"
              >
                <Info className="w-4 h-4" />
              </Button>
              <ThemeSwitcher />
              <Button
                variant="cta"
                size="sm"
                className="relative gap-2"
                onClick={() => setCartOpen(true)}
                disabled={!settings.is_open || itemCount === 0}
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

      {/* Restaurant Info Panel - Collapsible */}
      {showInfo && (
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {settings.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">O restauracji</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{settings.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Min. zamówienie</p>
                    <p className="text-sm font-semibold text-foreground">{settings.min_order_value.toFixed(2)} zł</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dostawa</p>
                    <p className="text-sm font-semibold text-foreground">{settings.delivery_fee.toFixed(2)} zł</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dystans</p>
                    <p className="text-sm font-semibold text-foreground">do {settings.max_delivery_distance_km} km</p>
                  </div>
                  {settings.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                      <p className="text-sm font-semibold text-foreground">{settings.phone}</p>
                    </div>
                  )}
                </div>
                {settings.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{settings.address}</span>
                  </div>
                )}
              </div>

              {/* Right Column - Opening Hours */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Godziny otwarcia</h3>
                <div className="space-y-2">
                  {settings.opening_hours && Object.entries(settings.opening_hours).map(([day, hours]: [string, any]) => {
                    const dayLabel = {
                      'monday': 'Poniedziałek',
                      'tuesday': 'Wtorek',
                      'wednesday': 'Środa',
                      'thursday': 'Czwartek',
                      'friday': 'Piątek',
                      'saturday': 'Sobota',
                      'sunday': 'Niedziela'
                    }[day] || day

                    const isOpenDay = hours.isOpen !== false
                    const openTime = hours.open || hours.openTime
                    const closeTime = hours.close || hours.closeTime
                    
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{dayLabel}</span>
                        <span className="font-medium text-foreground">
                          {isOpenDay && openTime && closeTime ? `${openTime} - ${closeTime}` : 'Zamknięte'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Closed Alert */}
      {!settings.is_open && (
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
