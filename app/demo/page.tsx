'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  UtensilsCrossed, 
  ShoppingBag,
  Tag,
  Crown,
  BarChart3,
  Star,
  Palette,
  Settings,
  History,
  CreditCard,
  ArrowLeft,
  Sparkles,
  Clock,
  Check,
  X,
  Phone,
  MapPin,
  Truck,
  ChefHat,
  Lock,
  TrendingUp,
  Users,
  ShoppingCart,
  ExternalLink,
  Bell,
  Pause,
  Play,
  Calendar,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Demo nav items - musi odpowiadać dashboard
const navItems = [
  { id: 'orders', label: 'Zamówienia', icon: ShoppingBag, pro: false },
  { id: 'scheduled', label: 'Zaplanowane', icon: Calendar, pro: false },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, pro: false },
  { id: 'suggestions', label: 'Sugestie', icon: Lightbulb, pro: true },
  { id: 'customize', label: 'Personalizacja', icon: Palette, pro: true },
  { id: 'discounts', label: 'Kody rabatowe', icon: Tag, pro: true },
  { id: 'loyalty', label: 'Lojalność', icon: Crown, pro: true },
  { id: 'reviews', label: 'Opinie', icon: Star, pro: true },
  { id: 'history', label: 'Historia', icon: History, pro: false },
  { id: 'stats', label: 'Statystyki', icon: BarChart3, pro: true },
  { id: 'settings', label: 'Ustawienia', icon: Settings, pro: false },
  { id: 'billing', label: 'Rozliczenia', icon: CreditCard, pro: false },
]

// Demo orders
const demoOrders = [
  { 
    id: '1', 
    customer_name: 'Jan Kowalski', 
    customer_phone: '123 456 789',
    customer_address: 'ul. Warszawska 15/3, 00-001 Warszawa',
    status: 'pending', 
    total: 89.00,
    delivery_type: 'delivery',
    created_at: '12:45',
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 32.00 },
      { name: 'Cola 0.5L', quantity: 2, price: 8.00 },
      { name: 'Tiramisu', quantity: 1, price: 17.00 }
    ]
  },
  { 
    id: '2', 
    customer_name: 'Anna Nowak', 
    customer_phone: '987 654 321',
    customer_address: null,
    status: 'preparing', 
    total: 76.00,
    delivery_type: 'pickup',
    created_at: '12:30',
    items: [
      { name: 'Pizza Pepperoni', quantity: 1, price: 38.00 },
      { name: 'Spaghetti Carbonara', quantity: 1, price: 34.00 },
      { name: 'Woda mineralna', quantity: 1, price: 6.00 }
    ]
  },
  { 
    id: '3', 
    customer_name: 'Piotr Wiśniewski', 
    customer_phone: '555 123 456',
    customer_address: 'ul. Krakowska 42, 00-025 Warszawa',
    status: 'ready', 
    total: 122.00,
    delivery_type: 'delivery',
    created_at: '12:15',
    items: [
      { name: 'Pizza Quattro Formaggi', quantity: 2, price: 42.00 },
      { name: 'Sałatka Cesarska', quantity: 1, price: 32.00 },
      { name: 'Tiramisu', quantity: 1, price: 17.00 }
    ]
  }
]

// Demo scheduled orders
const demoScheduledOrders = [
  { id: '101', customer_name: 'Michał Lewandowski', date: 'Jutro 18:00', status: 'scheduled', total: 156.00 },
  { id: '102', customer_name: 'Katarzyna Zielińska', date: '15.02 19:30', status: 'scheduled', total: 98.50 },
]

// Demo menu items
const demoMenuItems = [
  { id: '1', name: 'Pizza Margherita', price: 32.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '2', name: 'Pizza Pepperoni', price: 38.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '3', name: 'Pizza Quattro Formaggi', price: 42.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '4', name: 'Spaghetti Carbonara', price: 34.00, category: 'Makarony', available: true, image: '🍝' },
  { id: '5', name: 'Penne Arrabiata', price: 28.00, category: 'Makarony', available: false, image: '🍝' },
  { id: '6', name: 'Sałatka Cesarska', price: 32.00, category: 'Sałatki', available: true, image: '🥗' },
]

// Demo discount codes
const demoDiscounts = [
  { code: 'NOWYKLIENT', type: 'percentage', value: 15, uses: 23, limit: 100, active: true },
  { code: 'PIZZA10', type: 'fixed', value: 10, uses: 45, limit: 50, active: true },
  { code: 'WEEKEND20', type: 'percentage', value: 20, uses: 12, limit: null, active: false },
]

// Demo loyalty levels
const demoLoyalty = [
  { name: 'Brązowy', min_spent: 0, discount: 0, customers: 156 },
  { name: 'Srebrny', min_spent: 200, discount: 5, customers: 42 },
  { name: 'Złoty', min_spent: 500, discount: 10, customers: 18 },
  { name: 'Platynowy', min_spent: 1000, discount: 15, customers: 7 },
]

// Demo reviews
const demoReviews = [
  { id: '1', customer: 'Anna K.', rating: 5, comment: 'Najlepsza pizza w mieście! Szybka dostawa.', date: '2 dni temu', reply: null },
  { id: '2', customer: 'Marek W.', rating: 4, comment: 'Bardzo dobra carbonara.', date: '5 dni temu', reply: 'Dziękujemy za opinię!' },
  { id: '3', customer: 'Kasia M.', rating: 5, comment: 'Świeże składniki, polecam!', date: '1 tydzień temu', reply: null },
]

// Demo stats
const demoStats = {
  revenue: 12450,
  orders: 156,
  avgOrder: 79.81,
  returningCustomers: 42,
  topProducts: [
    { name: 'Pizza Margherita', orders: 45, revenue: 1440 },
    { name: 'Pizza Pepperoni', orders: 38, revenue: 1444 },
    { name: 'Spaghetti Carbonara', orders: 29, revenue: 986 },
  ]
}

// Demo today stats
const demoTodayStats = {
  total: 12,
  revenue: 956.50,
  delivered: 8,
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Nowe', color: 'bg-yellow-500' },
  accepted: { label: 'Przyjęte', color: 'bg-blue-500' },
  preparing: { label: 'W przygotowaniu', color: 'bg-purple-500' },
  ready: { label: 'Gotowe', color: 'bg-green-500' },
}

export default function DemoPage() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional')
  const [activeSection, setActiveSection] = useState('orders')
  const [isPaused, setIsPaused] = useState(false)

  const isPro = selectedPlan === 'professional'

  const renderContent = () => {
    // Check if section requires Pro
    const navItem = navItems.find(item => item.id === activeSection)
    if (navItem?.pro && !isPro) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Funkcja Pro</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {navItem.label} to funkcja dostępna tylko w planie Pro. 
            Przełącz na plan Pro aby zobaczyć tę sekcję.
          </p>
          <Button onClick={() => setSelectedPlan('professional')}>
            Przełącz na Pro
          </Button>
        </div>
      )
    }

    switch (activeSection) {
      case 'orders':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Aktywne zamówienia</h1>
              <p className="text-muted-foreground">Zarządzaj bieżącymi zamówieniami klientów</p>
            </div>
            
            {/* Status Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-200 dark:border-yellow-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                  <span className="font-medium">Oczekujące</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">2</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                  <span className="font-medium">W przygotowaniu</span>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-500">1</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                  <span className="font-medium">Gotowe</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-500">1</span>
              </div>
            </div>

            <div className="grid gap-4">
              {demoOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{order.customer_name}</span>
                          <Badge className={statusLabels[order.status].color}>
                            {statusLabels[order.status].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.created_at}
                          </span>
                          <span className="flex items-center gap-1">
                            {order.delivery_type === 'delivery' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {order.delivery_type === 'delivery' ? 'Dostawa' : 'Odbiór'}
                          </span>
                        </div>
                        {order.customer_address && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {order.customer_address}
                          </p>
                        )}
                      </div>
                      <span className="text-xl font-bold text-accent">{order.total.toFixed(2)} zł</span>
                    </div>
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{(item.quantity * item.price).toFixed(2)} zł</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" variant="cta" className="flex-1">
                            <Check className="w-4 h-4 mr-1" />
                            Przyjmij
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <X className="w-4 h-4 mr-1" />
                            Odrzuć
                          </Button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <Button size="sm" variant="cta" className="flex-1">
                          <ChefHat className="w-4 h-4 mr-1" />
                          Oznacz jako gotowe
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button size="sm" variant="confirm" className="flex-1">
                          <Truck className="w-4 h-4 mr-1" />
                          Wydaj zamówienie
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'scheduled':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Zaplanowane zamówienia</h1>
              <p className="text-muted-foreground">Zamówienia na przyszłe godziny</p>
            </div>
            <div className="grid gap-4">
              {demoScheduledOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent">{order.total.toFixed(2)} zł</p>
                      <Badge>Zaplanowane</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'menu':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Menu</h1>
                <p className="text-muted-foreground">Zarządzaj produktami w menu</p>
              </div>
              <Button variant="cta">+ Dodaj produkt</Button>
            </div>
            <div className="grid gap-3">
              {demoMenuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{item.image}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                          <Badge variant="outline">{item.category}</Badge>
                          {!item.available && <Badge variant="secondary">Niedostępny</Badge>}
                        </div>
                        <span className="text-accent font-bold">{item.price.toFixed(2)} zł</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">Edytuj</Button>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        {item.available ? 'Wyłącz' : 'Włącz'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'suggestions':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Sugestie AI</h1>
              <p className="text-muted-foreground">Rekomendacje do poprawy sprzedaży</p>
            </div>
            <div className="grid gap-4">
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Pizza Margherita ma wspaniale wyniki</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Twoja Pizza Margherita sprzedaje się 3x lepiej niż średnia. Rozważ promocję na Quattro Formaggi aby osiągnąć podobne wyniki.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Zwiększ dostęp o 2 km</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Restauracje podobne do Twojej mogą dostarczać na zasięgu 7km. Zwiększ dostęp aby konkurować.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'discounts':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Kody rabatowe</h1>
                <p className="text-muted-foreground">Twórz i zarządzaj promocjami</p>
              </div>
              <Button variant="cta">+ Nowy kod</Button>
            </div>
            <div className="grid gap-3">
              {demoDiscounts.map((discount) => (
                <Card key={discount.code}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono font-bold text-accent">{discount.code}</code>
                        <Badge variant={discount.active ? 'default' : 'secondary'}>
                          {discount.active ? 'Aktywny' : 'Nieaktywny'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {discount.type === 'percentage' ? `${discount.value}% zniżki` : `${discount.value} zł zniżki`}
                        {' • '}
                        Użyto: {discount.uses}{discount.limit ? `/${discount.limit}` : ''}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="bg-transparent">Edytuj</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'loyalty':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Program lojalnościowy</h1>
              <p className="text-muted-foreground">Nagradzaj stałych klientów</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {demoLoyalty.map((level, i) => (
                <Card key={level.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full ${
                        i === 0 ? 'bg-amber-700' : 
                        i === 1 ? 'bg-gray-400' : 
                        i === 2 ? 'bg-yellow-500' : 'bg-purple-400'
                      }`} />
                      <span className="font-semibold">{level.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Od {level.min_spent} zł wydanych</p>
                      <p className="text-accent font-semibold">{level.discount}% stałej zniżki</p>
                      <p>{level.customers} klientów</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Opinie klientów</h1>
              <p className="text-muted-foreground">Średnia ocena: 4.7/5 (156 opinii)</p>
            </div>
            <div className="grid gap-4">
              {demoReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.customer}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <p className="mb-3">{review.comment}</p>
                    {review.reply ? (
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        <span className="font-semibold">Twoja odpowiedź:</span> {review.reply}
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="bg-transparent">Odpowiedz</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'stats':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Statystyki</h1>
              <p className="text-muted-foreground">Ostatnie 7 dni</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{demoStats.revenue.toLocaleString()} zł</p>
                  <p className="text-sm text-muted-foreground">Przychód</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{demoStats.orders}</p>
                  <p className="text-sm text-muted-foreground">Zamówienia</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{demoStats.avgOrder.toFixed(0)} zł</p>
                  <p className="text-sm text-muted-foreground">Śr. zamówienie</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{demoStats.returningCustomers}%</p>
                  <p className="text-sm text-muted-foreground">Powracający</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Najpopularniejsze produkty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoStats.topProducts.map((product, i) => (
                    <div key={product.name} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm flex items-center justify-center font-semibold">
                          {i + 1}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{product.revenue} zł</p>
                        <p className="text-muted-foreground">{product.orders} zamówień</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'customize':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Personalizacja menu</h1>
              <p className="text-muted-foreground">Dostosuj wygląd strony dla klientów</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kolory</CardTitle>
                  <CardDescription>Dostosuj paletę kolorów</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Kolor główny</span>
                    <div className="w-10 h-10 rounded-lg bg-accent border-2 border-accent/50" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kolor tła</span>
                    <div className="w-10 h-10 rounded-lg bg-background border-2 border-border" />
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">Zmień kolory</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Zawartość</CardTitle>
                  <CardDescription>Dodaj opisy i informacje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Logo restauracji</span>
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mt-2">
                      <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">Przesyłaj logo</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'history':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Historia zamówień</h1>
              <p className="text-muted-foreground">Wszystkie zrealizowane zamówienia</p>
            </div>
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Historia wszystkich zamówień będzie wyświetlana tutaj</p>
              </CardContent>
            </Card>
          </div>
        )

      case 'settings':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Ustawienia</h1>
              <p className="text-muted-foreground">Konfiguracja restauracji</p>
            </div>
            <div className="grid gap-4 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Dane restauracji</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nazwa</span>
                    <span className="font-medium">Pizzeria Demo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adres</span>
                    <span className="font-medium">ul. Testowa 123, Warszawa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefon</span>
                    <span className="font-medium">123 456 789</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Zamówienia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min. zamówienie</span>
                    <span className="font-medium">40.00 zł</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Koszt dostawy</span>
                    <span className="font-medium">8.00 zł</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zasięg dostawy</span>
                    <span className="font-medium">5 km</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Status restauracji</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPaused ? (
                        <>
                          <Pause className="w-5 h-5 text-red-600 dark:text-red-500" />
                          <span>Zamknięta na wstrzymanie</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 text-green-600 dark:text-green-500" />
                          <span>Otwarta - przyjmuje zamówienia</span>
                        </>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-transparent"
                    >
                      {isPaused ? 'Wznów' : 'Wstrzymaj'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Rozliczenia</h1>
              <p className="text-muted-foreground">Zarządzaj subskrypcją</p>
            </div>
            <div className="grid gap-4 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Aktualny plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Plan</span>
                      <Badge variant="default">{isPro ? 'Pro' : 'Starter'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cena miesięczna</span>
                      <span className="font-bold">{isPro ? '199 zł' : '99 zł'}</span>
                    </div>
                    <Button className="w-full">Zmień plan</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Demo Header */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="font-semibold">Wersja demonstracyjna panelu restauracji</span>
              </div>
            </div>
            
            {/* Plan Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setSelectedPlan('starter')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPlan === 'starter' 
                      ? 'bg-accent text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Starter (99 zł)
                </button>
                <button
                  onClick={() => setSelectedPlan('professional')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPlan === 'professional' 
                      ? 'bg-accent text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pro (199 zł)
                </button>
              </div>

              <Link href="/auth/sign-up">
                <Button variant="cta">Załóż konto</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-57px)] bg-card border-r hidden lg:flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Pizzeria Demo</h2>
                <Badge className="bg-green-500 text-white text-xs">Otwarte</Badge>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-auto">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              const isLocked = item.pro && !isPro
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm ${
                    isActive
                      ? 'bg-accent text-white'
                      : isLocked
                        ? 'text-muted-foreground/50 cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  disabled={isLocked}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <Lock className="w-4 h-4" />}
                </button>
              )
            })}
            
            <div className="pt-4 border-t mt-auto">
              <Link 
                href="/r/demo" 
                target="_blank"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="flex-1">Strona klienta</span>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t">
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Wybrany plan:</p>
              <p className="font-semibold text-sm">
                {isPro ? 'Pro (199 zł/mies.)' : 'Starter (99 zł/mies.)'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
