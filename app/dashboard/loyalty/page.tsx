import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoyaltyManager } from '@/components/dashboard/loyalty-manager'

export default async function LoyaltyPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get or create loyalty settings
  const { data: settingsArray } = await supabase
    .from('loyalty_settings')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)

  let settings = settingsArray?.[0]

  if (!settings) {
    const { data: newSettings } = await supabase
      .from('loyalty_settings')
      .insert({
        user_id: user.id,
        is_enabled: false,
        levels: [
          { name: 'Brązowy', min_spent: 100, discount_percent: 5 },
          { name: 'Srebrny', min_spent: 300, discount_percent: 10 },
          { name: 'Złoty', min_spent: 500, discount_percent: 15 },
        ]
      })
      .select()
      .single()
    settings = newSettings
  }

  // Get customer loyalty data
  const { data: customers } = await supabase
    .from('customer_loyalty')
    .select('*')
    .eq('restaurant_user_id', user.id)
    .order('total_spent', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Program lojalnościowy</h1>
        <p className="text-muted-foreground">
          Nagradzaj stałych klientów i buduj lojalność
        </p>
      </div>
      
      <LoyaltyManager 
        settings={settings} 
        customers={customers || []}
        userId={user.id}
      />
    </div>
  )
}
