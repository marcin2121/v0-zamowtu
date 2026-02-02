import { createClient } from '@/lib/supabase/server'
import { StatsView } from '@/components/dashboard/stats-view'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Statystyki</h1>
        <p className="text-muted-foreground">Analizuj wyniki swojej restauracji i otrzymuj wskazowki</p>
      </div>
      <StatsView userId={user.id} />
    </div>
  )
}
