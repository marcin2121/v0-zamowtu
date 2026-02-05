import { NextRequest, NextResponse } from 'next/server'
import { createTransaction, isTpayConfigured } from '@/lib/payments/tpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, returnUrl } = await request.json()

    if (!isTpayConfigured()) {
      return NextResponse.json(
        { error: 'Płatności TPay nie są skonfigurowane dla tej restauracji' },
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
        { error: 'Zamówienie nie znalezione' },
        { status: 404 }
      )
    }

    if (order.is_paid) {
      return NextResponse.json(
        { error: 'Zamówienie zostało już opłacone' },
        { status: 400 }
      )
    }

    // Create Tpay transaction
    const amountInGrosze = Math.round(order.total * 100)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    const { transactionId, redirectUrl } = await createTransaction({
      orderId,
      amount: amountInGrosze,
      currency: 'PLN',
      description: `Zamówienie #${orderId.slice(0, 8)}`,
      email: order.customer_email || 'brak@email.pl',
      phone: order.customer_phone,
      urlReturn: returnUrl || `${baseUrl}/order/${orderId}?payment=success`,
      urlStatus: `${baseUrl}/api/payments/tpay/status`,
    })

    // Save payment session to order
    await supabase
      .from('orders')
      .update({
        payment_method: 'tpay',
        payment_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({ redirectUrl, transactionId })
  } catch (error) {
    console.error('[v0] Tpay payment error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia płatności' },
      { status: 500 }
    )
  }
}
