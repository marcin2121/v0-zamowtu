import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'kontakt@zamowtu.pl') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const status = request.nextUrl.searchParams.get('status') || 'all'
  const restaurantId = request.nextUrl.searchParams.get('restaurant_id')

  let query = admin
    .from('support_tickets')
    .select('*, support_messages(count)')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }
  if (restaurantId) {
    query = query.eq('restaurant_user_id', restaurantId)
  }

  const { data: tickets, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tickets })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'kontakt@zamowtu.pl') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const body = await request.json()
  const { action, ...data } = body

  if (action === 'create_ticket') {
    const { data: ticket, error } = await admin
      .from('support_tickets')
      .insert({
        restaurant_user_id: data.restaurant_user_id,
        restaurant_name: data.restaurant_name,
        subject: data.subject,
        priority: data.priority || 'normal',
        created_by: 'admin',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Add initial message if provided
    if (data.message) {
      await admin.from('support_messages').insert({
        ticket_id: ticket.id,
        sender: 'admin',
        message: data.message,
      })
    }

    return NextResponse.json({ ticket })
  }

  if (action === 'send_message') {
    const { data: message, error } = await admin
      .from('support_messages')
      .insert({
        ticket_id: data.ticket_id,
        sender: 'admin',
        message: data.message,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update ticket timestamp
    await admin
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString(), status: 'in_progress' })
      .eq('id', data.ticket_id)

    return NextResponse.json({ message })
  }

  if (action === 'update_status') {
    const { error } = await admin
      .from('support_tickets')
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq('id', data.ticket_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'get_messages') {
    const { data: messages, error } = await admin
      .from('support_messages')
      .select('*')
      .eq('ticket_id', data.ticket_id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
