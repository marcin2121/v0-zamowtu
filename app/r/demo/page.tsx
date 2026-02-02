'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  ArrowLeft,
  Sparkles,
  Truck,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Demo restaurant settings
const demoSettings = {
  restaurant_name: 'Pizzeria Demo',
  address: 'ul. Testowa 123, 00-001 Warszawa',
  phone: '123 456 789',
  delivery_fee: 8.00,
  min_order_value: 40.00,
  description: 'Najlepsza pizza w mieście od 2020 roku. Świeże składniki, tradycyjne przepisy.',
  custom_welcome_text: 'Witamy w naszej pizzerii! Zamów online i ciesz się smakiem.',
}

// Demo categories
const demoCategories = [
  { id: '1', name: 'Pizza' },
  { id: '2', name: 'Makarony' },
  { id: '3', name: 'Sałatki' },
  { id: '4', name: 'Napoje' },
  { id: '5', name: 'Desery' },
]

// Demo menu items
const demoMenuItems = [
  { id: '1', name: 'Pizza Margherita', description: 'Sos pomidorowy, mozzarella, świeża bazylia', price: 32.00, category_id: '1', image_url: null },
  { id: '2', name: 'Pizza Pepperoni', description: 'Sos pomidorowy, mozzarella, pikantne pepperoni', price: 38.00, category_id: '1', image_url: null },
  { id: '3', name: 'Pizza Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmezan, ricotta', price: 42.00, category_id: '1', image_url: null },
  { id: '4', name: 'Pizza Capricciosa', description: 'Sos pomidorowy, mozzarella, szynka, pieczarki, oliwki', price: 40.00, category_id: '1', image_url: null },
  { id: '5', name: 'Spaghetti Carbonara', description: 'Makaron spaghetti, boczek, jajko, parmezan, pieprz', price: 34.00, category_id: '2', image_url: null },
  { id: '6', name: 'Penne Arrabiata', description: 'Makaron penne, pikantny sos pomidorowy, czosnek', price: 28.00, category_id: '2', image_url: null },
  { id: '7', name: 'Sałatka Cesarska', description: 'Sałata rzymska, kurczak, parmezan, grzanki, sos cezar', price: 32.00, category_id: '3', image_url: null },
  { id: '8', name: 'Sałatka Grecka', description: 'Pomidory, ogórki, oliwki, feta, czerwona cebula', price: 28.00, category_id: '3', image_url: null },
  { id: '9', name: 'Cola 0.5L', description: null, price: 8.00, category_id: '4', image_url: null },
  { id: '10', name: 'Woda mineralna 0.5L', description: null, price: 6.00, category_id: '4', image_url: null },
  { id: '11', name: 'Sok pomarańczowy 0.3L', description: null, price: 9.00, category_id: '4', image_url: null },
  { id: '12', name: 'Tiramisu', description: 'Klasyczny włoski deser z mascarpone i kawą', price: 17.00, category_id: '5', image_url: null },
  { id: '13', name: 'Panna Cotta', description: 'Kremowy deser z sosem malinowym', price: 15.00, category_id: '5', image_url: null },
]

// Demo reviews
const demoReviews = [
  { id: '1', customer_name: 'Anna K.', rating: 5, comment: 'Najlepsza pizza w mieście! Szybka dostawa i świeże składniki.', created_at: '2 dni temu' },
  { id: '2', customer_name: 'Marek W.', rating: 4, comment: 'Bardzo dobra carbonara, będę zamawiać ponownie.', created_at: '5 dni temu' },
  { id: '3', customer_name: 'Kasia M.', rating: 5, comment: 'Polecam! Świetna obsługa i pyszne jedzenie.', created_at: '1 tydzień temu' },
]

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function DemoMenuPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')

  const addToCart = (item: typeof demoMenuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = deliveryType === 'delivery' ? demoSettings.delivery_fee : 0
  const total = subtotal + deliveryFee
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const filteredItems = activeCategory 
    ? demoMenuItems.filter(item => item.category_id === activeCategory)
    : demoMenuItems

  const averageRating = demoReviews.reduce((acc, r) => acc + r.rating, 0) / demoReviews.length

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">To jest wersja demonstracyjna strony klienta</span>
            </div>
            <Link href="/demo">
              <Button size="sm" variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Panel restauracji
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">PD</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{demoSettings.restaurant_name}</h1>
              {demoSettings.custom_welcome_text && (
                <p className="text-muted-foreground mb-3">{demoSettings.custom_welcome_text}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {demoSettings.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {demoSettings.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {averageRating.toFixed(1)} ({demoReviews.length} opinii)
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Dostawa</p>
              <p className="font-semibold">{demoSettings.delivery_fee.toFixed(2)} zł</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Min. zamówienie</p>
              <p className="font-semibold">{demoSettings.min_order_value.toFixed(2)} zł</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Czas dostawy</p>
              <p className="font-semibold">30-45 min</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Odbiór osobisty</p>
              <p className="font-semibold">15-20 min</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className={activeCategory === null ? '' : 'bg-transparent'}
          >
            Wszystkie
          </Button>
          {demoCategories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? '' : 'bg-transparent'}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-4 mb-24">
          {demoCategories.map(category => {
            const categoryItems = filteredItems.filter(item => item.category_id === category.id)
            if (categoryItems.length === 0) return null

            return (
              <div key={category.id}>
                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                <div className="grid gap-3">
                  {categoryItems.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            <p className="text-primary font-bold mt-2">{item.price.toFixed(2)} zł</p>
                          </div>
                          <Button size="sm" onClick={() => addToCart(item)}>
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

        {/* Reviews */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Opinie klientów</h2>
          <div className="grid gap-4">
            {demoReviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.customer_name}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-auto">{review.created_at}</span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button 
            size="lg" 
            onClick={() => setCartOpen(true)}
            className="shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Koszyk ({cartCount}) - {total.toFixed(2)} zł
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Twoje zamówienie</SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex-1 overflow-auto">
            {/* Delivery Type */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeliveryType('delivery')}
                className={`flex-1 ${deliveryType === 'delivery' ? '' : 'bg-transparent'}`}
              >
                <Truck className="w-4 h-4 mr-2" />
                Dostawa
              </Button>
              <Button
                variant={deliveryType === 'pickup' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeliveryType('pickup')}
                className={`flex-1 ${deliveryType === 'pickup' ? '' : 'bg-transparent'}`}
              >
                <Store className="w-4 h-4 mr-2" />
                Odbiór
              </Button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Koszyk jest pusty</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-primary">{(item.price * item.quantity).toFixed(2)} zł</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" onClick={() => removeFromCart(item.id)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" onClick={() => addToCart(demoMenuItems.find(m => m.id === item.id)!)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Customer Form */}
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Imię i nazwisko</Label>
                    <Input placeholder="Jan Kowalski" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input placeholder="123 456 789" />
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="space-y-2">
                      <Label>Adres dostawy</Label>
                      <Textarea placeholder="ul. Przykładowa 1/2, 00-001 Warszawa" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Uwagi do zamówienia</Label>
                    <Textarea placeholder="Np. bez cebuli, piętro 3..." />
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Suma produktów</span>
                    <span>{subtotal.toFixed(2)} zł</span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span>Dostawa</span>
                      <span>{deliveryFee.toFixed(2)} zł</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Razem</span>
                    <span className="text-primary">{total.toFixed(2)} zł</span>
                  </div>
                </div>

                {subtotal < demoSettings.min_order_value && (
                  <p className="text-sm text-destructive text-center">
                    Minimalna wartość zamówienia: {demoSettings.min_order_value.toFixed(2)} zł
                  </p>
                )}

                <Button className="w-full" size="lg" disabled={subtotal < demoSettings.min_order_value}>
                  Złóż zamówienie (demo)
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
