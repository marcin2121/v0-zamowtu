'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderItem, Review } from '@/lib/types'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  AlertTriangle,
  Star,
  Utensils,
  Calendar,
  Target,
  Percent,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'

interface StatsViewProps {
  userId: string
}

interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

interface InsightType {
  type: 'success' | 'warning' | 'info'
  text: string
}

interface StatsData {
  totalRevenue: number
  avgOrderValue: number
  completedOrders: number
  totalOrders: number
  cancelledOrders: number
  cancellationRate: number
  uniqueCustomers: number
  repeatCustomers: number
  repeatRate: number
  avgRating: number
  reviewCount: number
  popularItems: Array<{ name: string; count: number; revenue: number }>
  topRevenueItems: Array<{ name: string; count: number; revenue: number }>
  peakHours: string[]
  bestDay: string | null
  worstDay: string | null
  ordersByDay: Record<string, number>
  deliveryOrders: number
  pickupOrders: number
  ordersWithDiscount: number
  totalDiscounts: number
}

type PeriodType = '7d' | '30d' | '90d'

export function StatsView({ userId }: StatsViewProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('30d')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()
      
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      
      const [ordersRes, reviewsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('restaurant_user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*')
          .eq('restaurant_user_id', userId)
          .gte('created_at', startDate.toISOString()),
      ])
      
      setOrders((ordersRes.data as OrderWithItems[]) || [])
      setReviews(reviewsRes.data || [])
      setLoading(false)
    }
    
    fetchData()
  }, [userId, period])

  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'delivered')
    const cancelledOrders = orders.filter(o => o.status === 'cancelled')
    
    // Revenue
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
    
    // Orders by day of week
    const ordersByDay: Record<string, number> = {
      'Pn': 0, 'Wt': 0, 'Sr': 0, 'Cz': 0, 'Pt': 0, 'Sb': 0, 'Nd': 0
    }
    const dayNames = ['Nd', 'Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb']
    completedOrders.forEach(o => {
      const day = dayNames[new Date(o.created_at).getDay()]
      ordersByDay[day]++
    })
    
    // Orders by hour
    const ordersByHour: Record<number, number> = {}
    completedOrders.forEach(o => {
      const hour = new Date(o.created_at).getHours()
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1
    })
    
    // Peak hours (top 3)
    const peakHours = Object.entries(ordersByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)
    
    // Best day
    const bestDay = Object.entries(ordersByDay).sort((a, b) => b[1] - a[1])[0]
    const worstDay = Object.entries(ordersByDay).sort((a, b) => a[1] - b[1])[0]
    
    // Popular items
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
    completedOrders.forEach(o => {
      o.order_items?.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
        }
        itemCounts[item.name].count += item.quantity
        itemCounts[item.name].revenue += item.price * item.quantity
      })
    })
    const popularItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5)
    const topRevenueItems = Object.values(itemCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    
    // Unique customers
    const uniqueCustomers = new Set(completedOrders.map(o => o.customer_email || o.customer_phone)).size
    
    // Repeat customers (more than 1 order)
    const customerOrders: Record<string, number> = {}
    completedOrders.forEach(o => {
      const key = o.customer_email || o.customer_phone
      customerOrders[key] = (customerOrders[key] || 0) + 1
    })
    const repeatCustomers = Object.values(customerOrders).filter(c => c > 1).length
    const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
    
    // Cancellation rate
    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0
    
    // Average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0
    
    // Delivery vs pickup
    const deliveryOrders = completedOrders.filter(o => o.order_type === 'delivery').length
    const pickupOrders = completedOrders.filter(o => o.order_type === 'pickup').length
    
    // Discount usage
    const ordersWithDiscount = completedOrders.filter(o => (o.discount_amount || 0) > 0 || (o.loyalty_discount || 0) > 0)
    const totalDiscounts = ordersWithDiscount.reduce((sum, o) => sum + (o.discount_amount || 0) + (o.loyalty_discount || 0), 0)

    return {
      totalRevenue,
      avgOrderValue,
      completedOrders: completedOrders.length,
      totalOrders: orders.length,
      cancelledOrders: cancelledOrders.length,
      cancellationRate,
      uniqueCustomers,
      repeatCustomers,
      repeatRate,
      avgRating,
      reviewCount: reviews.length,
      popularItems,
      topRevenueItems,
      peakHours,
      bestDay,
      worstDay,
      ordersByDay,
      deliveryOrders,
      pickupOrders,
      ordersWithDiscount: ordersWithDiscount.length,
      totalDiscounts,
    }
  }, [orders, reviews])

  // Generate insights
  const insights = useMemo((): InsightType[] => {
    const tips: InsightType[] = []
    
    if (stats.cancellationRate > 10) {
      tips.push({ type: 'warning', text: `Wysoki wskaznik anulacji (${stats.cancellationRate.toFixed(1)}%). Sprawdz przyczyny anulowanych zamowien.` })
    }
    
    if (stats.repeatRate < 20 && stats.uniqueCustomers > 10) {
      tips.push({ type: 'info', text: `Tylko ${stats.repeatRate.toFixed(0)}% klientow wraca. Rozważ program lojalnosciowy lub kody rabatowe.` })
    } else if (stats.repeatRate > 40) {
      tips.push({ type: 'success', text: `Swietny wskaznik powrotow (${stats.repeatRate.toFixed(0)}%)! Klienci Cie lubia.` })
    }
    
    if (stats.avgRating > 0 && stats.avgRating < 4) {
      tips.push({ type: 'warning', text: `Srednia ocena ${stats.avgRating.toFixed(1)}/5. Przeczytaj opinie i popraw jakosc.` })
    } else if (stats.avgRating >= 4.5) {
      tips.push({ type: 'success', text: `Doskonala ocena ${stats.avgRating.toFixed(1)}/5! Wykorzystaj to w marketingu.` })
    }
    
    if (stats.worstDay && stats.bestDay && stats.ordersByDay[stats.worstDay[0]] < stats.ordersByDay[stats.bestDay[0]] * 0.3) {
      tips.push({ type: 'info', text: `${stats.worstDay[0]} to najslabszy dzien. Rozważ promocje w ten dzien.` })
    }
    
    if (stats.ordersWithDiscount > stats.completedOrders * 0.5) {
      tips.push({ type: 'warning', text: `Ponad polowa zamowien z rabatem. Sprawdz rentownosc promocji.` })
    }
    
    if (stats.deliveryOrders > stats.pickupOrders * 3 && stats.completedOrders > 10) {
      tips.push({ type: 'info', text: `${Math.round((stats.deliveryOrders / (stats.deliveryOrders + stats.pickupOrders)) * 100)}% zamowien z dostawa. Zadbaj o jakosc dostawy.` })
    }
    
    return tips
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const maxDayOrders = Math.max(...Object.values(stats.ordersByDay))

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === '7d' ? '7 dni' : p === '30d' ? '30 dni' : '90 dni'}
          </Button>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-primary" />
              Wskazowki dla Ciebie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-500/10 text-green-700' :
                  insight.type === 'warning' ? 'bg-yellow-500/10 text-yellow-700' :
                  'bg-blue-500/10 text-blue-700'
                }`}
              >
                {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {insight.type === 'success' && <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {insight.type === 'info' && <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <span className="text-sm">{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Przychod</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalRevenue.toFixed(2)} zl</p>
            <p className="text-xs text-muted-foreground mt-1">
              Srednia: {stats.avgOrderValue.toFixed(2)} zl/zamowienie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm">Zamowienia</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cancelledOrders > 0 && (
                <span className="text-destructive">{stats.cancelledOrders} anulowanych</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Klienci</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.uniqueCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.repeatCustomers} powracajacych ({stats.repeatRate.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="w-4 h-4" />
              <span className="text-sm">Ocena</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}/5
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.reviewCount} opinii
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders by day of week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Zamowienia wg dnia tygodnia
            </CardTitle>
            <CardDescription>
              Najlepszy dzien: <span className="font-medium text-foreground">{stats.bestDay?.[0]}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ordersByDay).map(([day, count]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium text-foreground">{day}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        day === stats.bestDay?.[0] ? 'bg-primary' : 'bg-primary/50'
                      }`}
                      style={{ width: maxDayOrders > 0 ? `${(count / maxDayOrders) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Godziny szczytu
            </CardTitle>
            <CardDescription>
              Kiedy klienci najczesciej zamawiaja
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.peakHours.length > 0 ? (
              <div className="space-y-4">
                {stats.peakHours.map((hour, i) => (
                  <div key={hour} className="flex items-center gap-3">
                    <Badge variant={i === 0 ? 'default' : 'secondary'} className="w-8">
                      {i + 1}
                    </Badge>
                    <span className="text-lg font-semibold text-foreground">{hour}</span>
                    {i === 0 && (
                      <span className="text-xs text-muted-foreground">
                        - szczyt zamowien
                      </span>
                    )}
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-4">
                  Zadbaj o pelna obsluge w tych godzinach
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Brak danych</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Most popular items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="w-4 h-4" />
              Najpopularniejsze produkty
            </CardTitle>
            <CardDescription>
              Najczesciej zamawiane
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.popularItems.length > 0 ? (
              <div className="space-y-3">
                {stats.popularItems.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                        {i + 1}
                      </Badge>
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Brak danych</p>
            )}
          </CardContent>
        </Card>

        {/* Top revenue items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Najwyzszy przychod
            </CardTitle>
            <CardDescription>
              Produkty generujace najwiecej zysku
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topRevenueItems.length > 0 ? (
              <div className="space-y-3">
                {stats.topRevenueItems.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                        {i + 1}
                      </Badge>
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {item.revenue.toFixed(2)} zl
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Brak danych</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Percent className="w-4 h-4" />
              <span className="text-sm">Uzycie rabatow</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {stats.completedOrders > 0 
                ? ((stats.ordersWithDiscount / stats.completedOrders) * 100).toFixed(0) 
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Laczna wartosc: {stats.totalDiscounts.toFixed(2)} zl
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Anulacje</span>
            </div>
            <p className={`text-xl font-bold ${stats.cancellationRate > 10 ? 'text-destructive' : 'text-foreground'}`}>
              {stats.cancellationRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cancelledOrders} z {stats.totalOrders} zamowien
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm">Dostawa vs Odbior</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {stats.deliveryOrders} / {stats.pickupOrders}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedOrders > 0 
                ? `${((stats.deliveryOrders / stats.completedOrders) * 100).toFixed(0)}% dostawa`
                : 'Brak danych'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
