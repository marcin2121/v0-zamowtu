import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewsManager } from '@/components/dashboard/reviews-manager'

export default async function ReviewsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_user_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalReviews = reviews?.length || 0
  const avgRating = totalReviews > 0 
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviews?.filter(r => r.rating === rating).length || 0
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Opinie klientów</h1>
        <p className="text-muted-foreground">
          Przeglądaj i odpowiadaj na opinie klientów
        </p>
      </div>
      
      <ReviewsManager 
        reviews={reviews || []} 
        stats={{
          totalReviews,
          avgRating,
          ratingDistribution
        }}
      />
    </div>
  )
}
