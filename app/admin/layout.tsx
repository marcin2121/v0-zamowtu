import type React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/admin-nav'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || user?.email !== 'kontakt@zamowtu.pl') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <AdminNav />
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
