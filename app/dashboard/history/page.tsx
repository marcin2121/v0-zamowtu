import { createClient } from '@/lib/supabase/server'
import { OrdersHistory } from '@/components/dashboard/orders-history'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_user_id', user.id)
    .in('status', ['delivered', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Historia zamowien</h1>
        <p className="text-muted-foreground">Przegladaj zakonczone i anulowane zamowienia</p>
      </div>
      <OrdersHistory orders={orders || []} />
    </div>
  )
}
