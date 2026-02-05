'use client'

import { useState, useMemo } from 'react'
import { 
  UtensilsCrossed, 
  Clock, 
  MapPin, 
  Phone, 
  ShoppingCart, 
  Star, 
  Truck,
  Store,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CartDrawer } from './cart-drawer'
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
    <div className="min-h-screen bg-background" style={{ fontFamily: customStyles.fontFamily }}>
      {/* Header with Restaurant Info */}
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-start gap-4 sm:gap-6 mb-4">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url || "/placeholder.svg"} 
                alt={settings.restaurant_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-primary/20 flex-shrink-0"
              />
            ) : (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${customStyles.primaryColor}20` }}
              >
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: customStyles.primaryColor }}>
                  {settings.restaurant_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {settings.restaurant_name}
                </h1>
              </div>
              {settings.custom_welcome_text && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {settings.custom_welcome_text}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                {settings.show_reviews && averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="hidden sm:inline">({reviews.length} opinii)</span>
                  </span>
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
        </div>
      </header>

      {/* Restaurant Closed Alert */}
      {settings.accepting_orders === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Restauracja jest obecnie zamknięta</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Możesz zamawiać na przyszły termin, gdy restauracja będzie otwarta. Sprawdź godziny otwarcia poniżej.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#151b21' }} />
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Dostawa</p>
              <p className="text-sm sm:text-base font-semibold" style={{ color: '#151b21' }}>
                {settings.delivery_fee.toFixed(2)} zł
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#151b21' }} />
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Min. zamówienie</p>
              <p className="text-sm sm:text-base font-semibold" style={{ color: '#151b21' }}>
                {settings.min_order_value.toFixed(2)} zł
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#151b21' }} />
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Czas dostawy</p>
              <p className="text-sm sm:text-base font-semibold" style={{ color: '#151b21' }}>30-45 min</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#151b21' }} />
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Odbiór osobisty</p>
              <p className="text-sm sm:text-base font-semibold" style={{ color: '#151b21' }}>15-20 min</p>
            </CardContent>
          </Card>
        </div>

        {/* Opening Hours Card */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5" style={{ color: '#151b21' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#151b21' }}>Godziny otwarcia</p>
                <p className="text-xs text-muted-foreground">
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
                        return `Dziś: ${openTime}-${closeTime}`
                      }
                    }
                    return 'Dziś: Zamknięte'
                  })()}
                </p>
              </div>
            </div>

            {settings.opening_hours && (
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {(() => {
                    const now = new Date()
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const todayIndex = now.getDay()
                    
                    const orderedDays = []
                    for (let i = -3; i <= 3; i++) {
                      const dayIndex = (todayIndex + i + 7) % 7
                      orderedDays.push(dayNames[dayIndex])
                    }
                    
                    const dayLabels = {
                      'monday': 'Pon',
                      'tuesday': 'Wt',
                      'wednesday': 'Śr',
                      'thursday': 'Czw',
                      'friday': 'Pt',
                      'saturday': 'Sob',
                      'sunday': 'Niedz'
                    }
                    
                    return orderedDays.map((day) => {
                      const hours = settings.opening_hours[day]
                      if (!hours) return null
                      
                      const dayLabel = dayLabels[day as keyof typeof dayLabels] || day
                      const isOpenDay = hours.isOpen !== false
                      const openTime = hours.open || hours.openTime
                      const closeTime = hours.close || hours.closeTime
                      const isToday = day === dayNames[todayIndex]
                      
                      return (
                        <div 
                          key={day} 
                          className="p-3 rounded-xl text-center border-2"
                          style={isToday ? { 
                            backgroundColor: '#151b21' + '10',
                            borderColor: '#151b21'
                          } : {
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))'
                          }}
                        >
                          <p 
                            className="text-xs font-bold mb-1"
                            style={{ color: isToday ? '#151b21' : 'hsl(var(--foreground))' }}
                          >
                            {dayLabel}
                          </p>
                          <p 
                            className="text-xs font-medium"
                            style={{ color: isToday ? '#151b21' : 'hsl(var(--foreground))' }}
                          >
                            {isOpenDay && openTime && closeTime ? `${openTime}-${closeTime}` : 'Zamknięte'}
                          </p>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Additional Info */}
                {(settings.address || settings.phone) && (
                  <div className="pt-4 mt-4 border-t border-border space-y-2">
                    {settings.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#151b21' }} />
                        <span className="text-foreground font-medium">{settings.address}</span>
                      </div>
                    )}
                    {settings.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 shrink-0" style={{ color: '#151b21' }} />
                        <span className="text-foreground font-medium">{settings.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className={activeCategory === null ? '' : 'bg-transparent'}
            >
              Wszystkie
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={activeCategory === category.id ? '' : 'bg-transparent'}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Menu Items */}
        <div className="grid gap-4 mb-24">
          {categories.map((category) => {
            const categoryItems = filteredItems.filter((item) => item.category_id === category.id)
            if (categoryItems.length === 0) return null

            return (
              <div key={category.id}>
                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                <div className="grid gap-3">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.allergens && item.allergens.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Alergeny: {item.allergens.join(', ')}
                              </p>
                            )}
                            <p className="text-primary font-bold mt-2">{item.price.toFixed(2)} zł</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const { addItem } = useCartStore.getState()
                              addItem({ ...item, restaurantId })
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Reviews Section */}
        {settings.show_reviews && reviews.length > 0 && (
          <div className="pb-24 sm:pb-32">
            <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: customStyles.secondaryColor }}>
              Opinie klientów
            </h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{review.customer_name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button 
            size="lg" 
            onClick={() => setCartOpen(true)}
            className="shadow-2xl px-6 sm:px-8"
            style={{
              backgroundColor: customStyles.primaryColor,
              color: customStyles.textColor
            }}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span className="font-semibold">
              Koszyk ({itemCount})
            </span>
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        restaurantId={restaurantId}
        settings={settings}
        menuItems={menuItems}
      />
    </div>
  )
}
