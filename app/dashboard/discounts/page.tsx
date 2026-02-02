import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DiscountCodesManager } from '@/components/dashboard/discount-codes-manager'

export default async function DiscountsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: discountCodes } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kody rabatowe</h1>
        <p className="text-muted-foreground">
          Twórz i zarządzaj kodami rabatowymi dla swoich klientów
        </p>
      </div>
      
      <DiscountCodesManager 
        initialCodes={discountCodes || []} 
        userId={user.id} 
      />
    </div>
  )
}
