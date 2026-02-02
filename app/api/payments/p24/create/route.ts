import { NextRequest, NextResponse } from 'next/server'
import { createTransaction, isP24Configured } from '@/lib/payments/przelewy24'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, returnUrl } = await request.json()

    if (!isP24Configured()) {
      return NextResponse.json(
        { error: 'Platnosci online nie sa skonfigurowane dla tej restauracji' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Zamowienie nie znalezione' },
        { status: 404 }
      )
    }

    if (order.is_paid) {
      return NextResponse.json(
        { error: 'Zamowienie zostalo juz oplacone' },
        { status: 400 }
      )
    }

    // Create P24 transaction
    const sessionId = `order_${orderId}_${Date.now()}`
    const amountInGrosze = Math.round(order.total * 100)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    const { token, redirectUrl } = await createTransaction({
      sessionId,
      amount: amountInGrosze,
      currency: 'PLN',
      description: `Zamowienie #${orderId.slice(0, 8)}`,
      email: order.customer_email || 'brak@email.pl',
      country: 'PL',
      language: 'pl',
      urlReturn: returnUrl || `${baseUrl}/order/${orderId}?payment=success`,
      urlStatus: `${baseUrl}/api/payments/p24/status`,
    })

    // Save payment session to order
    await supabase
      .from('orders')
      .update({
        payment_method: 'przelewy24',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({ redirectUrl, token })
  } catch (error) {
    console.error('P24 payment error:', error)
    return NextResponse.json(
      { error: 'Blad podczas tworzenia platnosci' },
      { status: 500 }
    )
  }
}
