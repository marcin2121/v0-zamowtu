import { NextRequest, NextResponse } from 'next/server'
import { verifyTransaction, getTpayMode } from '@/lib/payments/tpay'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { transactionId, status, amount, orderId } = body

    console.log('[v0] Tpay callback received:', { transactionId, status, orderId })

    // Verify transaction with Tpay API
    const isVerified = await verifyTransaction({
      transactionId,
      amount: parseInt(amount),
      orderId,
    })

    if (!isVerified) {
      console.error('[v0] Tpay verification failed for transaction:', transactionId)
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    // Use admin client to update order
    const supabase = createAdminClient()

    // Update order as paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_paid: true,
        payment_method: 'tpay',
        payment_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[v0] Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('[v0] Order marked as paid:', orderId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Tpay status callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
