import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, MapPin, TrendingUp, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import type { RestaurantSettings } from '@/lib/types'

export default async function AdminRestaurantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin (you can modify this based on your admin logic)
  if (!user?.email?.endsWith('@admin.zamowtu.pl')) {
    redirect('/dashboard')
  }

  // Fetch all restaurants
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
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  // Get order counts for each restaurant
  let restaurantsWithStats: (typeof restaurants[0] & { order_count: number; total_revenue: number })[] = []
  
  if (restaurants) {
    for (const restaurant of restaurants) {
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_user_id', restaurant.user_id)
        .eq('status', 'delivered')

      const order_count = orders?.length || 0
      const total_revenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

      restaurantsWithStats.push({
        ...restaurant,
        order_count,
        total_revenue
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administracyjny</h1>
          <p className="text-muted-foreground mt-1">Zarządzanie kontami restauracji</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Powrót na dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Restauracje ({restaurantsWithStats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {restaurantsWithStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Brak restauracji w systemie
              </p>
            ) : (
              restaurantsWithStats.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {restaurant.restaurant_name}
                      </h3>
                      <Badge variant={restaurant.is_open ? 'default' : 'secondary'}>
                        {restaurant.is_open ? 'Otwarte' : 'Zamknięte'}
                      </Badge>
                      <Badge variant={restaurant.subscription_plan === 'pro' ? 'default' : 'outline'}>
                        {restaurant.subscription_plan === 'pro' ? 'Pro' : 'Starter'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-2">
                      {restaurant.slug && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Link:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {restaurant.slug}
                          </code>
                        </div>
                      )}
                      
                      {restaurant.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{restaurant.phone}</span>
                        </div>
                      )}
                      
                      {restaurant.address && (
                        <div className="flex items-center gap-1 col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <ShoppingBag className="w-4 h-4" />
                        <span><strong>{restaurant.order_count}</strong> zamówień</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span><strong>{restaurant.total_revenue.toFixed(2)} zł</strong> przychodu</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/restaurants/${restaurant.user_id}`}>
                        Szczegóły
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
