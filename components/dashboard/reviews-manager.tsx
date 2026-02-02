'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MessageSquare, Eye, EyeOff, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/lib/types'

interface ReviewsManagerProps {
  reviews: Review[]
  stats: {
    totalReviews: number
    avgRating: number
    ratingDistribution: { rating: number; count: number }[]
  }
}

export function ReviewsManager({ reviews, stats }: ReviewsManagerProps) {
  const router = useRouter()
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const submitResponse = async (reviewId: string) => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('reviews')
      .update({ restaurant_response: response })
      .eq('id', reviewId)

    setLoading(false)
    setRespondingTo(null)
    setResponse('')
    router.refresh()
  }

  const toggleVisibility = async (review: Review) => {
    const supabase = createClient()
    await supabase
      .from('reviews')
      .update({ is_public: !review.is_public })
      .eq('id', review.id)
    router.refresh()
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">
                  {stats.avgRating.toFixed(1)}
                </p>
                <div className="mt-1">{renderStars(Math.round(stats.avgRating), 'lg')}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.totalReviews} opinii
                </p>
              </div>
              
              <div className="flex-1 space-y-2">
                {stats.ratingDistribution.reverse().map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-4">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Progress 
                      value={stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0} 
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-foreground">
                  {reviews.filter(r => r.rating >= 4).length}
                </p>
                <p className="text-sm text-muted-foreground">Pozytywnych</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-foreground">
                  {reviews.filter(r => r.rating <= 2).length}
                </p>
                <p className="text-sm text-muted-foreground">Negatywnych</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-foreground">
                  {reviews.filter(r => r.restaurant_response).length}
                </p>
                <p className="text-sm text-muted-foreground">Z odpowiedzią</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-foreground">
                  {reviews.filter(r => !r.restaurant_response && r.rating <= 3).length}
                </p>
                <p className="text-sm text-muted-foreground">Wymaga uwagi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Wszystkie opinie
          </CardTitle>
          <CardDescription>
            Odpowiadaj na opinie, aby budować relacje z klientami
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Brak opinii</h3>
              <p className="text-muted-foreground mt-1">
                Opinie pojawią się tutaj po ich wystawieniu przez klientów
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className={`p-4 border rounded-lg ${
                    !review.is_public ? 'bg-muted/30' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{review.customer_name}</span>
                        {renderStars(review.rating)}
                        {!review.is_public && (
                          <Badge variant="secondary">Ukryta</Badge>
                        )}
                        {review.rating <= 2 && !review.restaurant_response && (
                          <Badge variant="destructive">Wymaga odpowiedzi</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(review)}
                    >
                      {review.is_public ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-foreground">{review.comment}</p>
                  )}

                  {review.restaurant_response && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                      <p className="text-sm font-medium text-primary mb-1">Twoja odpowiedź:</p>
                      <p className="text-sm text-foreground">{review.restaurant_response}</p>
                    </div>
                  )}

                  {!review.restaurant_response && (
                    <div className="mt-4">
                      {respondingTo === review.id ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Napisz odpowiedź na opinię..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => submitResponse(review.id)}
                              disabled={loading || !response.trim()}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {loading ? 'Wysyłanie...' : 'Wyślij odpowiedź'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setRespondingTo(null)
                                setResponse('')
                              }}
                            >
                              Anuluj
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRespondingTo(review.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Odpowiedz
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
