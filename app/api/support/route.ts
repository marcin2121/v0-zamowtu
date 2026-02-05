import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use admin client to bypass RLS for reading tickets
  const admin = createAdminClient()

  const { data: tickets, error } = await admin
    .from('support_tickets')
    .select('*, support_messages(count)')
    .eq('restaurant_user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tickets })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const body = await request.json()
  const { action, ...data } = body

  if (action === 'create_ticket') {
    // Get restaurant name
    const { data: settings } = await admin
      .from('restaurant_settings')
      .select('restaurant_name')
      .eq('user_id', user.id)
      .single()

    const { data: ticket, error } = await admin
      .from('support_tickets')
      .insert({
        restaurant_user_id: user.id,
        restaurant_name: settings?.restaurant_name || 'Nieznana',
        subject: data.subject,
        priority: data.priority || 'normal',
        created_by: 'user',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Add initial message
    if (data.message) {
      await admin.from('support_messages').insert({
        ticket_id: ticket.id,
        sender: 'user',
        message: data.message,
      })
    }

    return NextResponse.json({ ticket })
  }

  if (action === 'send_message') {
    // Verify ticket belongs to user
    const { data: ticket } = await admin
      .from('support_tickets')
      .select('id, restaurant_user_id')
      .eq('id', data.ticket_id)
      .single()

    if (!ticket || ticket.restaurant_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: message, error } = await admin
      .from('support_messages')
      .insert({
        ticket_id: data.ticket_id,
        sender: 'user',
        message: data.message,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update ticket timestamp and reopen if resolved/closed
    await admin
      .from('support_tickets')
      .update({ 
        updated_at: new Date().toISOString(),
        status: 'open',
      })
      .eq('id', data.ticket_id)
      .in('status', ['resolved', 'closed'])

    // Just update timestamp for open/in_progress tickets
    await admin
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.ticket_id)
      .in('status', ['open', 'in_progress'])

    return NextResponse.json({ message })
  }

  if (action === 'get_messages') {
    // Verify ticket belongs to user
    const { data: ticket } = await admin
      .from('support_tickets')
      .select('id, restaurant_user_id')
      .eq('id', data.ticket_id)
      .single()

    if (!ticket || ticket.restaurant_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
