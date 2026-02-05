import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OrderStatus } from '@/components/order/order-status'

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id, slug } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  const { data: settings } = await supabase
    .from('restaurant_settings')
    .select('restaurant_name, phone, address')
    .eq('user_id', order.restaurant_user_id)
    .single()

  return (
    <OrderStatus
      order={{ ...order, items: items || [] }}
      restaurantName={settings?.restaurant_name || 'Restauracja'}
      restaurantPhone={settings?.phone}
      restaurantSlug={slug}
    />
  )
}
