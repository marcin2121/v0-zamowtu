import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/dashboard/settings-form'

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
        <p className="text-muted-foreground">Skonfiguruj swoja restauracje</p>
      </div>
      <SettingsForm settings={settings} userId={user.id} />
    </div>
  )
}
