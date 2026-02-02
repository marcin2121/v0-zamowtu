import { createClient } from '@/lib/supabase/server'
import { OrdersList } from '@/components/dashboard/orders-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Clock, ChefHat, CheckCircle, TrendingUp } from 'lucide-react'
import type { Order } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_user_id', user.id)
    .in('status', ['pending', 'accepted', 'preparing', 'ready'])
    .order('created_at', { ascending: false })

  // Get order items for each order
  const ordersWithItems: Order[] = []
  for (const order of orders || []) {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
    
    ordersWithItems.push({ ...order, items: items || [] })
  }

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total, status')
    .eq('restaurant_user_id', user.id)
    .gte('created_at', today.toISOString())

  const todayStats = {
    total: todayOrders?.length || 0,
    revenue: todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
    delivered: todayOrders?.filter(o => o.status === 'delivered').length || 0,
  }

  // Count by status
  const statusCounts = {
    pending: ordersWithItems.filter(o => o.status === 'pending').length,
    preparing: ordersWithItems.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    ready: ordersWithItems.filter(o => o.status === 'ready').length,
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Aktywne zamówienia</h1>
          <p className="text-muted-foreground">Zarządzaj bieżącymi zamówieniami klientów</p>
        </div>
        <OrdersList initialOrders={ordersWithItems} userId={user.id} />
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
