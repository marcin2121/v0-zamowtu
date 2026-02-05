import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  TrendingUp,
  ArrowLeft,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface RestaurantDetailPageProps {
  params: {
    userId: string
  }
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user?.email?.endsWith('@admin.zamowtu.pl')) {
    redirect('/dashboard')
  }

  // Fetch restaurant data
  const { data: restaurant } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('user_id', params.userId)
    .single()

  if (!restaurant) {
    return (
      <div className="space-y-4">
        <Link href="/admin/restaurants">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Restauracja nie została znaleziona
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_user_id', params.userId)
    .order('created_at', { ascending: false })

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', params.userId)

  // Calculate stats
  const totalOrders = orders?.length || 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const totalRevenue = orders?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0
  const activeMenuItems = menuItems?.filter(i => i.is_available).length || 0

  const createdAt = new Date(restaurant.created_at)
  const createdDaysAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/restaurants">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do listy
          </Button>
        </Link>
      </div>

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{restaurant.restaurant_name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {restaurant.user_id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={restaurant.is_open ? 'default' : 'secondary'}>
                {restaurant.is_open ? 'Otwarte' : 'Zamknięte'}
              </Badge>
              <Badge variant={restaurant.subscription_plan === 'pro' ? 'default' : 'outline'}>
                {restaurant.subscription_plan === 'pro' ? 'Pro' : 'Starter'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{restaurant.phone || 'Nie ustawiono'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adres</p>
                <p className="font-medium">{restaurant.address || 'Nie ustawiono'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Konto od</p>
                <p className="font-medium">{createdDaysAgo} dni temu</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {restaurant.slug ? (
                <>
                  <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Link do menu</p>
                    <p className="font-medium text-sm">{restaurant.slug}</p>
                  </div>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Link do menu</p>
                    <p className="font-medium text-sm text-muted-foreground">Nie ustawiono</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {restaurant.description && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Opis</p>
              <p className="text-sm">{restaurant.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Zamówienia razem</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Dostarczonych: {deliveredOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Przychód</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} zł</p>
            <p className="text-xs text-muted-foreground mt-1">
              Średnia: {avgOrderValue.toFixed(2)} zł
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Produkty</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{menuItems?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aktywnych: {activeMenuItems}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Dostawa</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{restaurant.max_delivery_distance_km} km</p>
            <p className="text-xs text-muted-foreground mt-1">
              Opłata: {restaurant.delivery_fee} zł
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zamówienia (10)</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total} zł</p>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'default'
                          : order.status === 'cancelled'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs mt-1"
                    >
                      {order.status === 'pending' && 'Oczekuje'}
                      {order.status === 'accepted' && 'Zaakceptowane'}
                      {order.status === 'preparing' && 'Przygotowywane'}
                      {order.status === 'ready' && 'Gotowe'}
                      {order.status === 'delivered' && 'Dostarczone'}
                      {order.status === 'cancelled' && 'Anulowane'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Brak zamówień
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
