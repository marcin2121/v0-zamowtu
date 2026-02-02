import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { OrderPauseManager } from '@/components/dashboard/order-pause-manager'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: settingsArray } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const settings = settingsArray?.[0] || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
        <p className="text-muted-foreground">Skonfiguruj swoją restaurację</p>
      </div>
      
      <OrderPauseManager 
        userId={user.id} 
        initialPaused={settings?.pause_orders || false}
        initialReason={settings?.pause_reason}
      />
      
      <SettingsForm settings={settings} userId={user.id} />
    </div>
  )
}
