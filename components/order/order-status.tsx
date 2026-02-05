'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  XCircle,
  Phone,
  CreditCard,
  ArrowLeft,
  Timer,
  PartyPopper,
  Star,
  Send,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Order } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface OrderStatusProps {
  order: Order
  restaurantName: string
  restaurantPhone?: string | null
  restaurantSlug?: string | null
}

const ORDER_STATUSES = [
  { key: 'pending', label: 'Oczekuje', icon: Clock, description: 'Restauracja wkrotce potwierdzi Twoje zamowienie.' },
  { key: 'accepted', label: 'Zaakceptowane', icon: CheckCircle2, description: 'Zamowienie zostalo zaakceptowane!' },
  { key: 'preparing', label: 'W przygotowaniu', icon: ChefHat, description: 'Twoje zamowienie jest przygotowywane.' },
  { key: 'ready', label: 'W dostawie', icon: Truck, description: 'Zamowienie jest w drodze do Ciebie!' },
  { key: 'delivered', label: 'Dostarczone', icon: CheckCircle2, description: 'Zamowienie zostalo dostarczone. Smacznego!' },
] as const

export function OrderStatus({ order: initialOrder, restaurantName, restaurantPhone, restaurantSlug }: OrderStatusProps) {
  const [order, setOrder] = useState(initialOrder)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [isCountdownExpired, setIsCountdownExpired] = useState(false)
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [existingReview, setExistingReview] = useState<boolean>(false)

  // Payment state
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'p24' | 'tpay'>('p24')
  const [processingPayment, setProcessingPayment] = useState(false)

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.key === status)
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const currentStatus = ORDER_STATUSES[currentStatusIndex] || ORDER_STATUSES[0]
  const StatusIcon = currentStatus.icon

  const updateCountdown = useCallback(() => {
    if (!order.estimated_delivery_at) {
      setCountdown(null)
      return
    }

    const now = new Date().getTime()
    const target = new Date(order.estimated_delivery_at).getTime()
    const diff = target - now

    if (diff <= 0) {
      setCountdown('00:00')
      setIsCountdownExpired(true)
      return
    }

    setIsCountdownExpired(false)
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }, [order.estimated_delivery_at])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [updateCountdown, mounted])

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id])

  // Check if review already exists
  useEffect(() => {
    const checkReview = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', order.id)
        .single()
      
      if (data) {
        setExistingReview(true)
        setReviewSubmitted(true)
      }
    }
    
    if (order.status === 'delivered') {
      checkReview()
    }
  }, [order.id, order.status])

  const confirmDelivery = async () => {
    setConfirmingDelivery(true)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', order.id)
    setConfirmingDelivery(false)
  }

  const processPayment = async (method: 'p24' | 'tpay') => {
    setProcessingPayment(true)
    try {
      const endpoint = `/api/payments/${method}/create`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        // Hide payment option if not configured
        if (response.status === 400 && data.error?.includes('nie są skonfigurowane')) {
          alert('Ta metoda płatności nie jest obecnie dostępna. Spróbuj innej metody lub zapłać przy odbiorze.')
          setShowPaymentOptions(false)
          return
        }
        alert(`Błąd: ${data.error || 'Nieznany błąd'}`)
        return
      }

      // Redirect to payment gateway
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        alert('Błąd: Brak linku do płatności')
      }
    } catch (error) {
      console.error('[v0] Payment error:', error)
      alert('Błąd podczas inicjowania płatności. Sprawdź połączenie internetowe.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const submitReview = async () => {
    if (reviewRating === 0) return
    
    setSubmittingReview(true)
    const supabase = createClient()
    
    await supabase
      .from('reviews')
      .insert({
        order_id: order.id,
        restaurant_user_id: order.restaurant_user_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      })
    
    setSubmittingReview(false)
    setReviewSubmitted(true)
    setShowReviewForm(false)
  }

  const canPay = order.status === 'accepted' && !order.is_paid
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'
  const showCountdown = countdown && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'pending'
  const showDeliveryConfirmation = isCountdownExpired && order.status === 'ready'

  const backUrl = restaurantSlug ? `/r/${restaurantSlug}` : '/'

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href={backUrl}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Powrot do menu
        </Link>

        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            {isCancelled ? (
              <>
                <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Anulowane</CardTitle>
                <p className="text-sm text-muted-foreground">Zamowienie zostalo anulowane.</p>
              </>
            ) : isDelivered ? (
              <>
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Dostarczone!</CardTitle>
                <p className="text-sm text-muted-foreground">Smacznego! Dziekujemy za zamowienie.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <StatusIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{currentStatus.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
              </>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">Numer zamowienia</p>
              <p className="font-mono font-bold text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="relative mb-6">
                <div className="flex justify-between items-center">
                  {ORDER_STATUSES.map((status, index) => {
                    const Icon = status.icon
                    const isActive = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    
                    return (
                      <div
                        key={status.key}
                        className="flex flex-col items-center relative z-10"
                      >
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all
                            ${isCurrent 
                              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                              : isActive 
                                ? 'bg-primary/80 text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] mt-1 text-center leading-tight max-w-[60px] ${isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {status.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {showCountdown && mounted && (
              <div className={`p-4 rounded-lg mb-6 text-center ${isCountdownExpired ? 'bg-amber-100 border border-amber-300' : 'bg-primary/10'}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className={`w-5 h-5 ${isCountdownExpired ? 'text-amber-600' : 'text-primary'}`} />
                  <span className={`font-medium ${isCountdownExpired ? 'text-amber-800' : 'text-foreground'}`}>
                    {isCountdownExpired ? 'Czas oczekiwania minal' : 'Przewidywany czas dostawy'}
                  </span>
                </div>
                <div className={`text-4xl font-bold font-mono ${isCountdownExpired ? 'text-amber-600' : 'text-primary'}`}>
                  {countdown}
                </div>
                {!isCountdownExpired && order.estimated_delivery_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Przewidywana godzina: {new Date(order.estimated_delivery_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}

            {/* Delivery Confirmation Prompt */}
            {showDeliveryConfirmation && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg mb-6">
                <h3 className="font-semibold text-foreground mb-2 text-center">
                  Czy zamowienie dotarlo?
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Jesli otrzymales juz zamowienie, potwierdz jego odbiór.
                </p>
                <Button 
                  className="w-full" 
                  onClick={confirmDelivery}
                  disabled={confirmingDelivery}
                >
                  {confirmingDelivery ? (
                    'Potwierdzanie...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Tak, otrzymalem zamowienie
                    </>
                  )}
                </Button>
              </div>
            )}

            {canPay && (
              <div className="p-4 bg-accent/10 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <span className="font-medium">Płatność oczekuje</span>
                </div>
                
                {!showPaymentOptions ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restauracja zaakceptowała zamówienie. Wybierz metodę płatności.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => setShowPaymentOptions(true)}
                    >
                      Dokonaj płatności online
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Wybierz metodę płatności:
                    </p>
                    <RadioGroup value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v as 'p24' | 'tpay')}>
                      <div className="flex items-center space-x-2 p-2 border border-border rounded-lg">
                        <RadioGroupItem value="p24" id="p24" />
                        <Label htmlFor="p24" className="cursor-pointer flex-1">
                          Przelewy24
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border border-border rounded-lg">
                        <RadioGroupItem value="tpay" id="tpay" />
                        <Label htmlFor="tpay" className="cursor-pointer flex-1">
                          TPay
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setShowPaymentOptions(false)
                          setSelectedPaymentMethod('p24')
                        }}
                      >
                        Anuluj
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => processPayment(selectedPaymentMethod)}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Przetwarzanie...
                          </>
                        ) : (
                          `Zapłać ${selectedPaymentMethod === 'p24' ? 'Przelewy24' : 'TPay'}`
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {restaurantPhone && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Masz problem? Skontaktuj się z restauracją
                    </p>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <a href={`tel:${restaurantPhone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Zadzwoń: {restaurantPhone}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {order.is_paid && (
              <Badge className="w-full justify-center py-2 mb-4 bg-accent text-accent-foreground">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Oplacone
              </Badge>
            )}

            {/* Review Section - Show after delivery */}
            {isDelivered && !existingReview && !reviewSubmitted && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                {!showReviewForm ? (
                  <div className="text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-2">
                      Jak oceniasz zamowienie?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Twoja opinia pomoze nam sie rozwijac
                    </p>
                    <Button onClick={() => setShowReviewForm(true)}>
                      Wystaw opinie
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-center">
                      Wystaw opinie
                    </h3>
                    
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (reviewHover || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    
                    {reviewRating > 0 && (
                      <p className="text-center text-sm text-muted-foreground">
                        {reviewRating === 1 && 'Bardzo slabo'}
                        {reviewRating === 2 && 'Slabo'}
                        {reviewRating === 3 && 'Srednio'}
                        {reviewRating === 4 && 'Dobrze'}
                        {reviewRating === 5 && 'Swietnie!'}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="comment">Komentarz (opcjonalnie)</Label>
                      <Textarea
                        id="comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Podziel sie swoimi wrazeniami..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewRating(0)
                          setReviewComment('')
                        }}
                      >
                        Anuluj
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={submitReview}
                        disabled={reviewRating === 0 || submittingReview}
                      >
                        {submittingReview ? (
                          'Wysylanie...'
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Wyslij opinie
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {reviewSubmitted && (
              <div className="p-4 bg-(--confirm)/10 border border-(--confirm)/30 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-(--confirm) mx-auto mb-2" />
                <p className="font-medium text-foreground">Dziekujemy za opinie!</p>
                <p className="text-sm text-muted-foreground">
                  Twoja ocena pomoze innym klientom
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Szczegoly zamowienia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Restauracja</p>
              <p className="font-medium">{restaurantName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Typ zamowienia</p>
              <p className="font-medium">
                {order.order_type === 'delivery' ? 'Dostawa' : 'Odbior osobisty'}
              </p>
            </div>

            {order.order_type === 'delivery' && (
              <div>
                <p className="text-sm text-muted-foreground">Adres dostawy</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            )}

            {order.scheduled_for && mounted && (
              <div>
                <p className="text-sm text-muted-foreground">Zaplanowane na</p>
                <p className="font-medium">
                  {new Date(order.scheduled_for).toLocaleString('pl-PL')}
                </p>
              </div>
            )}

            {order.delivery_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Uwagi</p>
                <p className="font-medium">{order.delivery_notes}</p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">Pozycje</p>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} zl
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produkty</span>
                <span>{order.subtotal.toFixed(2)} zl</span>
              </div>
              {order.order_type === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dostawa</span>
                  <span>{order.delivery_fee.toFixed(2)} zl</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Razem</span>
                <span className="text-primary">{order.total.toFixed(2)} zl</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {mounted && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Data zamowienia: {new Date(order.created_at).toLocaleString('pl-PL')}
          </p>
        )}
      </div>
    </div>
  )
}
