import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.email !== 'kontakt@zamowtu.pl') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || '7' // days
  const restaurantId = searchParams.get('restaurant') || 'all'

  const adminSupabase = createAdminClient()

  // Calculate date range
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - Number.parseInt(period))
  const startDateStr = startDate.toISOString()

  // Build orders query
  let ordersQuery = adminSupabase
    .from('orders')
    .select('*')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true })

  if (restaurantId !== 'all') {
    ordersQuery = ordersQuery.eq('restaurant_user_id', restaurantId)
  }

  const { data: orders } = await ordersQuery

  // Build all-time orders query for comparison
  let allOrdersQuery = adminSupabase
    .from('orders')
    .select('id, total, status, restaurant_user_id, created_at')

  if (restaurantId !== 'all') {
    allOrdersQuery = allOrdersQuery.eq('restaurant_user_id', restaurantId)
  }

  const { data: allOrders } = await allOrdersQuery

  // Fetch restaurants
  const { data: restaurants } = await adminSupabase
    .from('restaurant_settings')
    .select('user_id, restaurant_name, subscription_plan, is_open, slug')
    .order('restaurant_name')

  // Calculate stats for the period
  const periodOrders = orders || []
  const deliveredOrders = periodOrders.filter(o => o.status === 'delivered')
  const cancelledOrders = periodOrders.filter(o => o.status === 'cancelled')
  const pendingOrders = periodOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0

  // Calculate previous period for comparison
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - Number.parseInt(period))
  const prevEndDate = startDate
  
  const prevOrders = (allOrders || []).filter(o => {
    const d = new Date(o.created_at)
    return d >= prevStartDate && d < prevEndDate
  })
  const prevDelivered = prevOrders.filter(o => o.status === 'delivered')
  const prevRevenue = prevDelivered.reduce((sum, o) => sum + (o.total || 0), 0)

  // Orders per day for chart
  const days = Number.parseInt(period)
  const ordersPerDay: { date: string; orders: number; revenue: number }[] = []
  
  for (let i = 0; i < days; i++) {
    const day = new Date(now)
    day.setDate(day.getDate() - (days - 1 - i))
    const dayStr = day.toISOString().split('T')[0]
    
    const dayOrders = periodOrders.filter(o => {
      const orderDate = new Date(o.created_at).toISOString().split('T')[0]
      return orderDate === dayStr
    })
    
    const dayDelivered = dayOrders.filter(o => o.status === 'delivered')
    
    ordersPerDay.push({
      date: dayStr,
      orders: dayOrders.length,
      revenue: dayDelivered.reduce((sum, o) => sum + (o.total || 0), 0)
    })
  }

  // Orders by status
  const ordersByStatus = {
    pending: pendingOrders.length,
    delivered: deliveredOrders.length,
    cancelled: cancelledOrders.length,
    total: periodOrders.length,
  }

  // Per-restaurant stats
  const restaurantStats = (restaurants || []).map(r => {
    const rOrders = periodOrders.filter(o => o.restaurant_user_id === r.user_id)
    const rDelivered = rOrders.filter(o => o.status === 'delivered')
    const rRevenue = rDelivered.reduce((sum, o) => sum + (o.total || 0), 0)
    
    return {
      user_id: r.user_id,
      name: r.restaurant_name || 'Brak nazwy',
      plan: r.subscription_plan || 'starter',
      is_open: r.is_open,
      slug: r.slug,
      orders: rOrders.length,
      delivered: rDelivered.length,
      revenue: rRevenue,
      avgOrder: rDelivered.length > 0 ? rRevenue / rDelivered.length : 0,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Top products (if we have items in orders)
  const productCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const order of periodOrders) {
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        const name = item.name || 'Nieznany'
        if (!productCounts[name]) {
          productCounts[name] = { name, count: 0, revenue: 0 }
        }
        productCounts[name].count += item.quantity || 1
        productCounts[name].revenue += (item.price || 0) * (item.quantity || 1)
      }
    }
  }
  const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 10)

  // Peak hours
  const hourCounts = Array(24).fill(0)
  for (const order of periodOrders) {
    const hour = new Date(order.created_at).getHours()
    hourCounts[hour]++
  }
  const peakHours = hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    orders: count,
  }))

  return NextResponse.json({
    period: days,
    stats: {
      totalOrders: periodOrders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      avgOrderValue,
      prevPeriodOrders: prevOrders.length,
      prevPeriodRevenue: prevRevenue,
      prevPeriodDelivered: prevDelivered.length,
    },
    ordersPerDay,
    ordersByStatus,
    restaurantStats,
    topProducts,
    peakHours,
    restaurants: (restaurants || []).map(r => ({ user_id: r.user_id, name: r.restaurant_name || 'Brak nazwy' })),
  })
}
