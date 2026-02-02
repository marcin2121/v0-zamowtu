import { createClient } from '@/lib/supabase/server'
import { MenuManager } from '@/components/dashboard/menu-manager'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Zarzadzanie menu</h1>
        <p className="text-muted-foreground">Dodawaj, edytuj i usuwaj pozycje w menu</p>
      </div>
      <MenuManager
        initialCategories={categories || []}
        initialItems={items || []}
        userId={user.id}
      />
    </div>
  )
}
