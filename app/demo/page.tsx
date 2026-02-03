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
