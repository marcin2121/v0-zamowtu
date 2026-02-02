'use client'

import { useState, useMemo } from 'react'
import { UtensilsCrossed, Clock, MapPin, Phone, ShoppingCart, Star } from 'lucide-react'
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
  const itemCount = useCartStore((state) => state.getItemCount())

  // Customization styles
  const customStyles = useMemo(() => {
    if (!settings) return {}
    return {
      primaryColor: settings.primary_color || '#ea580c',
      secondaryColor: settings.secondary_color || '#1c1917',
      accentColor: settings.accent_color || '#16a34a',
      fontFamily: getFontFamily(settings.font_family || 'default'),
      textColor: getContrastColor(settings.secondary_color || '#1c1917'),
    }
  }, [settings])

  if (!restaurantId || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            ZamówTu
          </h1>
          <p className="text-muted-foreground mb-6">
            System zamówień online dla restauracji. Aby zobaczyć menu, potrzebujesz linku od restauracji.
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Jestes wlascicielem restauracji?{' '}
              <a href="/dashboard" className="text-primary font-medium hover:underline">
                Zaloguj sie do panelu
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
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: customStyles.secondaryColor,
        color: customStyles.textColor,
        fontFamily: customStyles.fontFamily,
      }}
    >
      {/* Banner */}
      {settings.banner_url && (
        <div 
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${settings.banner_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header 
        className="sticky top-0 z-40 border-b"
        style={{ 
          backgroundColor: customStyles.secondaryColor,
          borderColor: `${customStyles.primaryColor}30`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings.logo_url && (
                <img 
                  src={settings.logo_url || "/placeholder.svg"} 
                  alt={settings.restaurant_name}
                  className="w-14 h-14 rounded-full object-cover border-2"
                  style={{ borderColor: customStyles.primaryColor }}
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{settings.restaurant_name}</h1>
                {settings.custom_welcome_text && (
                  <p className="text-sm opacity-70">{settings.custom_welcome_text}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm opacity-70">
                  {settings.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {settings.address}
                    </span>
                  )}
                  {settings.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {settings.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Badge 
                className="text-white"
                style={{ 
                  backgroundColor: settings.is_open ? customStyles.accentColor : '#6b7280',
                }}
              >
                {settings.is_open ? 'Otwarte' : 'Zamknięte'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="relative bg-transparent"
                style={{ 
                  borderColor: customStyles.primaryColor,
                  color: customStyles.textColor,
                  backgroundColor: 'transparent',
                  opacity: settings.orders_paused ? 0.5 : 1,
                }}
                onClick={() => setCartOpen(true)}
                disabled={settings.orders_paused}
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: customStyles.primaryColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Description & Reviews */}
      {(settings.description || (settings.show_reviews && averageRating > 0)) && (
        <div 
          className="border-b"
          style={{ 
            backgroundColor: `${customStyles.primaryColor}10`,
            borderColor: `${customStyles.primaryColor}30`,
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            {settings.description && (
              <p className="text-sm opacity-80 mb-2">{settings.description}</p>
            )}
            {settings.show_reviews && averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-sm opacity-60">({reviews.length} opinii)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Paused Warning */}
      {settings.orders_paused && (
        <div 
          className="border-b"
          style={{ 
            backgroundColor: '#fef3c7',
            borderColor: '#f59e0b',
            color: '#92400e'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-semibold">Zamówienia tymczasowo wstrzymane</p>
                {settings.pause_reason && (
                  <p className="text-sm">{settings.pause_reason}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info bar */}
      <div 
        className="border-b"
        style={{ borderColor: `${customStyles.primaryColor}30` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Min. zamówienie: <strong>{settings.min_order_value.toFixed(2)} zł</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Dostawa do: <strong>{settings.max_delivery_distance_km} km</strong>
            </span>
            <span>
              Koszt dostawy: <strong>{settings.delivery_fee.toFixed(2)} zł</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div 
          className="sticky top-[73px] z-30 border-b"
          style={{ 
            backgroundColor: customStyles.secondaryColor,
            borderColor: `${customStyles.primaryColor}30`,
          }}
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              <Button
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="shrink-0"
                style={{
                  backgroundColor: activeCategory === null ? customStyles.primaryColor : 'transparent',
                  color: activeCategory === null ? '#ffffff' : customStyles.textColor,
                  borderColor: customStyles.primaryColor,
                }}
              >
                Wszystkie
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="shrink-0"
                  style={{
                    backgroundColor: activeCategory === category.id ? customStyles.primaryColor : 'transparent',
                    color: activeCategory === category.id ? '#ffffff' : customStyles.textColor,
                    borderColor: customStyles.primaryColor,
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="opacity-60">Brak dostępnych produktów w tej kategorii.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
        <section 
          className="border-t py-8"
          style={{ borderColor: `${customStyles.primaryColor}30` }}
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 
              className="text-xl font-bold mb-4"
              style={{ color: customStyles.primaryColor }}
            >
              Opinie klientów
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.slice(0, 4).map((review) => (
                <div 
                  key={review.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `${customStyles.primaryColor}10` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.customer_name}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm opacity-80">{review.comment}</p>
                  )}
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
