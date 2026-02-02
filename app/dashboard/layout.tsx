import type React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AutoStatusManager } from '@/components/dashboard/auto-status-manager'
import type { RestaurantSettings } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get or create restaurant settings (get the most recent one if multiple exist)
  let { data: settingsArray } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  let settings = settingsArray?.[0] as RestaurantSettings | null

  if (!settings) {
    const { data: newSettings } = await supabase
      .from('restaurant_settings')
      .insert({
        user_id: user.id,
        restaurant_name: user.user_metadata?.restaurant_name || 'Moja Restauracja',
      })
      .select()
      .single()
    settings = newSettings as RestaurantSettings
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <DashboardNav user={user} settings={settings} />
      <AutoStatusManager 
        userId={user.id} 
        openingHours={settings?.opening_hours || {}} 
      />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
