import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduledOrdersCalendar } from '@/components/dashboard/scheduled-orders-calendar'

export const metadata = {
  title: 'Zamówienia zaplanowane - Dashboard',
  description: 'Kalendarz zamówień zaplanowanych na przyszłość',
}

export default async function ScheduledPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zamówienia zaplanowane</h1>
        <p className="text-muted-foreground mt-1">
          Zarządzaj zamówieniami zaplanowanymi na przyszłe daty
        </p>
      </div>

      <ScheduledOrdersCalendar userId={user.id} />
    </div>
  )
}
