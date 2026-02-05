import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = createAdminClient()

    // Create order using service_role (bypass RLS)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_user_id: body.restaurantId,
        customer_name: body.customerName,
        customer_email: body.customerEmail || null,
        customer_phone: body.customerPhone,
        delivery_address: body.deliveryAddress,
        delivery_notes: body.deliveryNotes || null,
        order_type: body.orderType,
        status: 'pending',
        scheduled_for: body.scheduledFor || null,
        subtotal: body.subtotal,
        delivery_fee: body.deliveryFee || 0,
        discount_code: body.discountCode || null,
        discount_amount: body.discountAmount || 0,
        loyalty_discount: body.loyaltyDiscount || 0,
        customer_email_for_loyalty: body.customerEmailForLoyalty || null,
        total: body.total,
      })
      .select()
      .single()

    if (orderError) {
      console.error('[v0] Order creation error:', orderError)
      return NextResponse.json(
        { error: orderError.message },
        { status: 400 }
      )
    }

    // Create order items
    if (body.orderItems && body.orderItems.length > 0) {
      const orderItems = body.orderItems.map(
        (item: {
          id: string
          name: string
          price: number
          quantity: number
          notes?: string
        }) => ({
          order_id: order.id,
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || null,
        })
      )

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('[v0] Order items creation error:', itemsError)
        return NextResponse.json(
          { error: itemsError.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera podczas tworzenia zamówienia' },
      { status: 500 }
    )
  }
}
