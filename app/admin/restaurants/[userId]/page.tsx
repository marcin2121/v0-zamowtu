import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Clock,
  Crown,
  Star,
  ExternalLink,
  Settings,
  CreditCard
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
  if (!user || user?.email !== 'kontakt@zamowtu.pl') {
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

  // Get subscription plan
  const currentPlan = (restaurant.subscription_plan || 'starter').toLowerCase()
  const isPro = currentPlan === 'pro'

  // Server action to change subscription plan
  async function changeSubscriptionPlan(formData: FormData) {
    'use server'
    
    const newPlan = formData.get('plan') as string
    const actionUserId = formData.get('userId') as string
    
    // Verify caller is admin
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser || adminUser.email !== 'kontakt@zamowtu.pl') return
    
    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    await adminSupabase
      .from('restaurant_settings')
      .update({ 
        subscription_plan: newPlan,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', actionUserId)
    
    revalidatePath(`/admin/restaurants/${actionUserId}`)
    revalidatePath('/admin/restaurants')
  }

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
                ) : (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Starter
                  </span>
                )}
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

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Zarzadzanie subskrypcja
          </CardTitle>
          <CardDescription>
            Zmien plan subskrypcji dla tej restauracji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Current Plan */}
            <div className={`flex-1 p-4 rounded-lg border-2 ${isPro ? 'border-muted bg-muted/30' : 'border-primary bg-primary/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold">Plan Starter</h3>
                {!isPro && <Badge variant="outline" className="ml-auto">Aktywny</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Podstawowe funkcje dla malych restauracji
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li>- Do 50 produktow w menu</li>
                <li>- Podstawowe statystyki</li>
                <li>- Powiadomienia email</li>
              </ul>
              {isPro && (
                <form action={changeSubscriptionPlan}>
                  <input type="hidden" name="plan" value="starter" />
                  <input type="hidden" name="userId" value={params.userId} />
                  <Button type="submit" variant="outline" size="sm" className="w-full bg-transparent">
                    Zmien na Starter
                  </Button>
                </form>
              )}
            </div>

            {/* Pro Plan */}
            <div className={`flex-1 p-4 rounded-lg border-2 ${isPro ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-muted bg-muted/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Plan Pro</h3>
                {isPro && <Badge className="ml-auto bg-amber-500 text-white">Aktywny</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pelne funkcje dla rozwijajacych sie restauracji
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                <li>- Nieograniczona liczba produktow</li>
                <li>- Zaawansowane statystyki</li>
                <li>- Kody rabatowe i promocje</li>
                <li>- Program lojalnosciowy</li>
                <li>- Priorytetowe wsparcie</li>
              </ul>
              {!isPro && (
                <form action={changeSubscriptionPlan}>
                  <input type="hidden" name="plan" value="pro" />
                  <input type="hidden" name="userId" value={params.userId} />
                  <Button type="submit" size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Aktywuj Pro
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {restaurant.slug && (
          <Button variant="outline" asChild>
            <Link href={`/r/${restaurant.slug}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              Zobacz menu
            </Link>
          </Button>
        )}
      </div>

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
