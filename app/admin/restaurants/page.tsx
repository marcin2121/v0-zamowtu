import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, MapPin, TrendingUp, ShoppingBag, Users, CreditCard, Calendar, BarChart3, Crown, Star } from 'lucide-react'
import Link from 'next/link'
import type { RestaurantSettings } from '@/lib/types'

export default async function AdminRestaurantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin (you can modify this based on your admin logic)
  if (user?.email !== 'kontakt@zamowtu.pl') {
    redirect('/dashboard')
  }

  // Fetch all restaurants with subscription info
  const { data: restaurants, error } = await supabase
    .from('restaurant_settings')
    .select(`
      id,
      user_id,
      restaurant_name,
      slug,
      subscription_plan,
      is_open,
      address,
      phone,
      email,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  // Get order counts and stats for each restaurant
  let restaurantsWithStats: (typeof restaurants[0] & { order_count: number; total_revenue: number; pending_orders: number })[] = []
  
  if (restaurants) {
    for (const restaurant of restaurants) {
      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_user_id', restaurant.user_id)
        .eq('status', 'delivered')

      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_user_id', restaurant.user_id)
        .in('status', ['pending', 'confirmed', 'preparing'])

      const order_count = deliveredOrders?.length || 0
      const total_revenue = deliveredOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
      const pending_orders = pendingOrders?.length || 0

      restaurantsWithStats.push({
        ...restaurant,
        order_count,
        total_revenue,
        pending_orders
      })
    }
  }

  // Helper function to get subscription plan
  const getSubscriptionPlan = (restaurant: typeof restaurantsWithStats[0]) => {
    const plan = restaurant.subscription_plan || 'starter'
    return plan.toLowerCase()
  }

  // Calculate stats
  const totalRestaurants = restaurantsWithStats.length
  const proRestaurants = restaurantsWithStats.filter(r => getSubscriptionPlan(r) === 'pro').length
  const starterRestaurants = totalRestaurants - proRestaurants
  const openRestaurants = restaurantsWithStats.filter(r => r.is_open).length
  const totalOrders = restaurantsWithStats.reduce((sum, r) => sum + r.order_count, 0)
  const totalRevenue = restaurantsWithStats.reduce((sum, r) => sum + r.total_revenue, 0)
  const totalPendingOrders = restaurantsWithStats.reduce((sum, r) => sum + r.pending_orders, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administracyjny</h1>
          <p className="text-muted-foreground mt-1">Zarzadzanie kontami restauracji i statystyki platformy</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRestaurants}</p>
                <p className="text-xs text-muted-foreground">Restauracji</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{proRestaurants}</p>
                <p className="text-xs text-muted-foreground">Plan Pro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/10 rounded-lg">
                <Star className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{starterRestaurants}</p>
                <p className="text-xs text-muted-foreground">Plan Starter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{openRestaurants}</p>
                <p className="text-xs text-muted-foreground">Otwartych</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Zamowien</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(0)} zl</p>
                <p className="text-xs text-muted-foreground">Przychod</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Alert */}
      {totalPendingOrders > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-200">
                  {totalPendingOrders} zamowien w trakcie realizacji
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Zamowienia oczekujace lub przygotowywane na platformie
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Lista restauracji
          </CardTitle>
          <CardDescription>
            Wszystkie zarejestrowane restauracje na platformie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {restaurantsWithStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Brak restauracji w systemie
              </p>
            ) : (
              restaurantsWithStats.map((restaurant) => {
                const plan = getSubscriptionPlan(restaurant)
                const isPro = plan === 'pro'
                
                return (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {restaurant.restaurant_name || 'Brak nazwy'}
                        </h3>
                        <Badge variant={restaurant.is_open ? 'default' : 'secondary'}>
                          {restaurant.is_open ? 'Otwarte' : 'Zamkniete'}
                        </Badge>
                        <Badge 
                          variant={isPro ? 'default' : 'outline'}
                          className={isPro ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                        >
                          {isPro ? (
                            <span className="flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Pro
                            </span>
                          ) : 'Starter'}
                        </Badge>
                        {restaurant.pending_orders > 0 && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                            {restaurant.pending_orders} w realizacji
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-2">
                        {restaurant.slug && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">Link:</span>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              /r/{restaurant.slug}
                            </code>
                          </div>
                        )}
                        
                        {restaurant.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{restaurant.email}</span>
                          </div>
                        )}
                        
                        {restaurant.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{restaurant.phone}</span>
                          </div>
                        )}
                        
                        {restaurant.created_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(restaurant.created_at).toLocaleDateString('pl-PL')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1 text-primary">
                          <ShoppingBag className="w-4 h-4" />
                          <span><strong>{restaurant.order_count}</strong> zamowien</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span><strong>{restaurant.total_revenue.toFixed(2)} zl</strong> przychodu</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {restaurant.slug && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/r/${restaurant.slug}`} target="_blank">
                            Menu
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/restaurants/${restaurant.user_id}`}>
                          Zarzadzaj
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
