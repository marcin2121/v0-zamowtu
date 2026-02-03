import { createClient } from '@/lib/supabase/server'
import { MenuView } from '@/components/menu/menu-view'
import { notFound } from 'next/navigation'
import type { MenuItem, MenuCategory, RestaurantSettings, Review } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: settingsArray } = await supabase
    .from('restaurant_settings')
    .select('restaurant_name, address')
    .eq('slug', slug)
    .limit(1)

  const settings = settingsArray?.[0]

  if (!settings) {
    return {
      title: 'Restauracja nie znaleziona',
    }
  }

  return {
    title: `${settings.restaurant_name} - Menu i zamowienia online`,
    description: `Zamow online z ${settings.restaurant_name}. ${settings.address || 'Szybka dostawa i odbior osobisty.'}`,
  }
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get restaurant settings by slug
  const { data: settingsArray } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('slug', slug)
    .limit(1)

  const settings = settingsArray?.[0]

  if (!settings) {
    notFound()
  }

  // Get menu categories
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('user_id', settings.user_id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Get menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', settings.user_id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  // Get public reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_user_id', settings.user_id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate average rating
  const reviewsData = (reviews || []) as Review[]
  const averageRating = reviewsData.length > 0
    ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
    : 0

  return (
    <div className="light">
      <MenuView
        restaurantId={settings.user_id}
        settings={settings as RestaurantSettings}
        categories={(categories || []) as MenuCategory[]}
        menuItems={(menuItems || []) as MenuItem[]}
        reviews={reviewsData}
        averageRating={averageRating}
      />
    </div>
  )
}
