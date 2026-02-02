import { NextRequest, NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/payments/przelewy24'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const merchantId = formData.get('merchantId') as string
    const posId = formData.get('posId') as string
    const sessionId = formData.get('sessionId') as string
    const amount = Number.parseInt(formData.get('amount') as string)
    const originAmount = Number.parseInt(formData.get('originAmount') as string)
    const currency = formData.get('currency') as string
    const orderId = Number.parseInt(formData.get('orderId') as string)
    const methodId = formData.get('methodId') as string
    const statement = formData.get('statement') as string
    const sign = formData.get('sign') as string

    console.log('[v0] P24 Status callback received:', { sessionId, orderId, amount })

    // Extract our order ID from session ID (format: order_UUID_timestamp)
    const orderIdMatch = sessionId.match(/order_([a-f0-9-]+)_/)
    if (!orderIdMatch) {
      console.error('[v0] Invalid session ID format:', sessionId)
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const ourOrderId = orderIdMatch[1]

    // Verify transaction with P24
    const isVerified = await verifyTransaction({
      sessionId,
      amount,
      currency,
      orderId,
    })

    if (!isVerified) {
      console.error('[v0] P24 verification failed for order:', ourOrderId)
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // Update order as paid
    const supabase = await createClient()
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_paid: true,
        payment_method: 'przelewy24',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ourOrderId)

    if (updateError) {
      console.error('[v0] Failed to update order:', updateError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('[v0] Order marked as paid:', ourOrderId)

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('[v0] P24 status webhook error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
