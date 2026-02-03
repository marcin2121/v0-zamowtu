import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Clock, ChefHat, CheckCircle, TrendingUp } from 'lucide-react'
import type { Order } from '@/lib/types'

// Demo orders with items
const demoOrders: Order[] = [
  { 
    id: '1', 
    restaurant_user_id: 'demo-restaurant',
    customer_name: 'Jan Kowalski', 
    customer_phone: '123 456 789',
    customer_address: 'ul. Warszawska 15/3, 00-001 Warszawa',
    status: 'pending', 
    total: 89.00,
    delivery_type: 'delivery',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 32.00 },
      { name: 'Cola 0.5L', quantity: 2, price: 8.00 },
      { name: 'Tiramisu', quantity: 1, price: 17.00 }
    ]
  },
  { 
    id: '2', 
    restaurant_user_id: 'demo-restaurant',
    customer_name: 'Anna Nowak', 
    customer_phone: '987 654 321',
    customer_address: null,
    status: 'accepted', 
    total: 76.00,
    delivery_type: 'pickup',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    items: [
      { name: 'Pizza Pepperoni', quantity: 1, price: 38.00 },
      { name: 'Spaghetti Carbonara', quantity: 1, price: 34.00 },
      { name: 'Woda mineralna', quantity: 1, price: 6.00 }
    ]
  },
  { 
    id: '3', 
    restaurant_user_id: 'demo-restaurant',
    customer_name: 'Piotr Wiśniewski', 
    customer_phone: '555 123 456',
    customer_address: 'ul. Krakowska 42, 00-025 Warszawa',
    status: 'preparing', 
    total: 122.00,
    delivery_type: 'delivery',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    items: [
      { name: 'Pizza Quattro Formaggi', quantity: 2, price: 42.00 },
      { name: 'Sałatka Cesarska', quantity: 1, price: 32.00 },
      { name: 'Tiramisu', quantity: 1, price: 17.00 }
    ]
  },
  {
    id: '4',
    restaurant_user_id: 'demo-restaurant',
    customer_name: 'Maria Lewandowska',
    customer_phone: '666 777 888',
    customer_address: 'ul. Nowy Świat 10, 00-001 Warszawa',
    status: 'ready',
    total: 95.00,
    delivery_type: 'delivery',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    items: [
      { name: 'Pizza Diablo', quantity: 1, price: 39.00 },
      { name: 'Garlic Bread', quantity: 1, price: 12.00 },
      { name: 'Coca Cola 2L', quantity: 1, price: 12.00 },
      { name: 'Tiramisu', quantity: 1, price: 32.00 }
    ]
  }
]

export default async function DemoPage() {
  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayOrders = demoOrders.filter(order => {
    const orderDate = new Date(order.created_at)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  })

  const todayStats = {
    total: todayOrders.length,
    revenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    delivered: todayOrders.filter(o => o.status === 'ready').length,
  }

  // Count by status
  const statusCounts = {
    pending: demoOrders.filter(o => o.status === 'pending').length,
    preparing: demoOrders.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    ready: demoOrders.filter(o => o.status === 'ready').length,
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Aktywne zamówienia</h1>
          <p className="text-muted-foreground">Zarządzaj bieżącymi zamówieniami klientów</p>
        </div>
        
        <div className="grid gap-4">
          {demoOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{order.customer_name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'accepted' ? 'bg-blue-500' :
                        order.status === 'preparing' ? 'bg-purple-500' :
                        order.status === 'ready' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}>
                        {order.status === 'pending' ? 'Nowe' :
                         order.status === 'accepted' ? 'Przyjęte' :
                         order.status === 'preparing' ? 'W przygotowaniu' :
                         order.status === 'ready' ? 'Gotowe' :
                         order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📞 {order.customer_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        {order.delivery_type === 'delivery' ? '🚚' : '🏪'} {order.delivery_type === 'delivery' ? 'Dostawa' : 'Odbiór'}
                      </span>
                    </div>
                    {order.customer_address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        📍 {order.customer_address}
                      </p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-primary">{order.total.toFixed(2)} zł</span>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{(item.quantity * item.price).toFixed(2)} zł</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden xl:block w-80 shrink-0">
        <div className="sticky top-8 space-y-4">
          {/* Today's Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dzisiaj</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Zamówienia</span>
                </div>
                <span className="text-lg font-bold">{todayStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Przychód</span>
                </div>
                <span className="text-lg font-bold">{todayStats.revenue.toFixed(2)} zł</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Zrealizowane</span>
                </div>
                <span className="text-lg font-bold">{todayStats.delivered}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status zamówień</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 dark:bg-yellow-950/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                  <span className="text-sm">Oczekujące</span>
                </div>
                <span className="font-semibold text-yellow-600 dark:text-yellow-500">{statusCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 dark:bg-purple-950/20">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                  <span className="text-sm">W przygotowaniu</span>
                </div>
                <span className="font-semibold text-purple-600 dark:text-purple-500">{statusCounts.preparing}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                  <span className="text-sm">Gotowe do wydania</span>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-500">{statusCounts.ready}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
              </div>
              <Button>+ Nowy kod</Button>
            </div>
            <div className="grid gap-3">
              {demoDiscounts.map((discount) => (
                <Card key={discount.code}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono font-bold text-primary">{discount.code}</code>
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
                      <p className="text-primary font-semibold">{level.discount}% stałej zniżki</p>
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
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{demoStats.revenue.toLocaleString()} zł</p>
                  <p className="text-sm text-muted-foreground">Przychód</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{demoStats.orders}</p>
                  <p className="text-sm text-muted-foreground">Zamówienia</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{demoStats.avgOrder.toFixed(0)} zł</p>
                  <p className="text-sm text-muted-foreground">Śr. zamówienie</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
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
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-semibold">
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Kolor główny</span>
                    <div className="w-8 h-8 rounded bg-primary border" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kolor tła</span>
                    <div className="w-8 h-8 rounded bg-background border" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kolor akcentu</span>
                    <div className="w-8 h-8 rounded bg-accent border" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Treść</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Opis restauracji</span>
                    <p className="font-medium">Najlepsza pizza w mieście od 2020</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tekst powitania</span>
                    <p className="font-medium">Witamy w naszej pizzerii!</p>
                  </div>
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
              <CardContent className="p-4 text-center text-muted-foreground py-12">
                Tutaj pojawi się lista wszystkich zrealizowanych zamówień
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
            <div className="grid gap-4">
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
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
                <Sparkles className="w-5 h-5 text-primary" />
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
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Starter (99 zł)
                </button>
                <button
                  onClick={() => setSelectedPlan('professional')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPlan === 'professional' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Professional (199 zł)
                </button>
              </div>

              <Link href="/auth/sign-up">
                <Button>Załóż konto</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-57px)] bg-card border-r hidden lg:block">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Pizzeria Demo</h2>
                <Badge className="bg-green-500 text-white text-xs">Otwarte</Badge>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              const isLocked = item.pro && !isPro
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isLocked
                        ? 'text-muted-foreground/50 cursor-pointer'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <Lock className="w-4 h-4" />}
                </button>
              )
            })}
            
            <div className="pt-4 border-t mt-4">
              <Link 
                href="/r/demo" 
                target="_blank"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="flex-1">Strona menu klienta</span>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t mt-auto">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Wybrany plan:</p>
              <p className="font-semibold">
                {isPro ? 'Professional (199 zł/mies.)' : 'Starter (99 zł/mies.)'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
