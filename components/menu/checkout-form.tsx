'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Loader2, Tag, Crown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { CartItem, LoyaltySettings, CustomerLoyalty } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface CheckoutFormProps {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  restaurantId: string
  restaurantSlug?: string | null
  onBack: () => void
  onSuccess: () => void
}

export function CheckoutForm({
  items,
  subtotal,
  deliveryFee,
  total,
  restaurantId,
  restaurantSlug,
  onBack,
  onSuccess,
}: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [isScheduled, setIsScheduled] = useState(false)
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<{
    code: string
    type: 'percentage' | 'fixed'
    value: number
    amount: number
  } | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  
  // Loyalty state
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings | null>(null)
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty | null>(null)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)
  const [loyaltyLevel, setLoyaltyLevel] = useState<{ name: string; discount_percent: number } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    scheduledDate: '',
    scheduledTime: '',
  })

  // Fetch loyalty settings
  useEffect(() => {
    const fetchLoyalty = async () => {
      const supabase = createClient()
      const { data: settings } = await supabase
        .from('loyalty_settings')
        .select('*')
        .eq('user_id', restaurantId)
        .single()
      
      if (settings) {
        setLoyaltySettings(settings)
      }
    }
    fetchLoyalty()
  }, [restaurantId])

  // Check loyalty when email changes
  useEffect(() => {
    const checkLoyalty = async () => {
      if (!formData.email || !loyaltySettings?.is_enabled) {
        setCustomerLoyalty(null)
        setLoyaltyDiscount(0)
        setLoyaltyLevel(null)
        return
      }

      const supabase = createClient()
      const { data: loyalty } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('restaurant_user_id', restaurantId)
        .eq('customer_email', formData.email.toLowerCase())
        .single()

      if (loyalty) {
        setCustomerLoyalty(loyalty)
        
        // Find customer's level
        const levels = loyaltySettings.levels.sort((a, b) => b.min_spent - a.min_spent)
        const level = levels.find(l => loyalty.total_spent >= l.min_spent)
        
        if (level) {
          setLoyaltyLevel(level)
          const discount = (subtotal * level.discount_percent) / 100
          setLoyaltyDiscount(discount)
        }
      } else {
        setCustomerLoyalty(null)
        setLoyaltyDiscount(0)
        setLoyaltyLevel(null)
      }
    }

    const timeoutId = setTimeout(checkLoyalty, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email, loyaltySettings, restaurantId, subtotal])

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return
    
    setCheckingDiscount(true)
    setDiscountError(null)
    
    const supabase = createClient()
    const { data: discount } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('user_id', restaurantId)
      .eq('code', discountCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (!discount) {
      setDiscountError('Nieprawidlowy kod rabatowy')
      setCheckingDiscount(false)
      return
    }

    // Validate discount
    const now = new Date()
    
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      setDiscountError('Kod rabatowy wygasl')
      setCheckingDiscount(false)
      return
    }

    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      setDiscountError('Kod rabatowy zostal juz wykorzystany maksymalna liczbe razy')
      setCheckingDiscount(false)
      return
    }

    if (subtotal < discount.min_order_value) {
      setDiscountError(`Minimalna wartość zamówienia dla tego kodu to ${discount.min_order_value} zł`)
      setCheckingDiscount(false)
      return
    }

    // Check schedule if exists
    if (discount.schedule) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = dayNames[now.getDay()]
      
      if (discount.schedule.days && !discount.schedule.days.includes(currentDay)) {
        setDiscountError('Kod rabatowy nie jest aktywny w tym dniu')
        setCheckingDiscount(false)
        return
      }

      if (discount.schedule.hours) {
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        if (currentTime < discount.schedule.hours.start || currentTime > discount.schedule.hours.end) {
          setDiscountError(`Kod rabatowy jest aktywny tylko w godzinach ${discount.schedule.hours.start}-${discount.schedule.hours.end}`)
          setCheckingDiscount(false)
          return
        }
      }
    }

    // Calculate discount
    const discountAmount = discount.discount_type === 'percentage'
      ? (subtotal * discount.discount_value) / 100
      : Math.min(discount.discount_value, subtotal)

    setDiscountApplied({
      code: discount.code,
      type: discount.discount_type,
      value: discount.discount_value,
      amount: discountAmount
    })
    
    setCheckingDiscount(false)
  }

  const removeDiscount = () => {
    setDiscountApplied(null)
    setDiscountCode('')
    setDiscountError(null)
  }

  // Calculate final total
  const totalDiscount = (discountApplied?.amount || 0) + loyaltyDiscount
  const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount)
  const finalTotal = orderType === 'delivery' 
    ? subtotalAfterDiscount + deliveryFee 
    : subtotalAfterDiscount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get restaurant settings
      const { data: settings } = await supabase
        .from('restaurant_settings')
        .select('is_open, opening_hours')
        .eq('user_id', restaurantId)
        .single()
      
      if (!settings) {
        setError('Nie można znaleźć restauracji.')
        setLoading(false)
        return
      }

      // Determine the time to check
      let dateToCheck = new Date()
      
      if (isScheduled && formData.scheduledDate && formData.scheduledTime) {
        dateToCheck = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      }

      // Check if restaurant is open at the specified time
      const dayOfWeek = dateToCheck.getDay()
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const dayName = dayNames[dayOfWeek]

      if (settings.opening_hours && settings.opening_hours[dayName]) {
        const dayHours = settings.opening_hours[dayName]
        const openTime = dayHours.open || dayHours.openTime
        const closeTime = dayHours.close || dayHours.closeTime

        if (!openTime || !closeTime) {
          const timeDescription = isScheduled ? 'Restauracja nie pracuje w wybranym dniu.' : 'Restauracja jest obecnie zamknięta.'
          setError(timeDescription)
          setLoading(false)
          return
        }

        // Parse times
        const [openHour, openMin] = openTime.split(':').map(Number)
        const [closeHour, closeMin] = closeTime.split(':').map(Number)
        const checkHour = dateToCheck.getHours()
        const checkMin = dateToCheck.getMinutes()

        const openTimeInMinutes = openHour * 60 + openMin
        const closeTimeInMinutes = closeHour * 60 + closeMin
        const checkTimeInMinutes = checkHour * 60 + checkMin

        if (checkTimeInMinutes < openTimeInMinutes || checkTimeInMinutes > closeTimeInMinutes) {
          const timeDescription = isScheduled 
            ? `Restauracja nie pracuje o wybranej godzinie. Godziny otwarcia: ${openTime}-${closeTime}`
            : `Restauracja jest Currently closed. Godziny otwarcia: ${openTime}-${closeTime}`
          setError(timeDescription)
          setLoading(false)
          return
        }
      } else if (!isScheduled && !settings.is_open) {
        // If not scheduled, check current open status
        setError('Restauracja jest obecnie zamknięta i nie przyjmuje zamówień.')
        setLoading(false)
        return
      }
      
      // Check if scheduled date is blocked
      if (isScheduled && formData.scheduledDate) {
        try {
          const { data: blockedDate, error: blockedError } = await supabase
            .from('blocked_dates')
            .select('*')
            .eq('user_id', restaurantId)
            .eq('date', formData.scheduledDate)
            .single()

          if (blockedError && blockedError.code !== 'PGRST116') {
            // PGRST116 is "no rows found" which is okay
            console.log('[v0] Blocked date check error:', blockedError.message)
          }
          
          if (blockedDate) {
            setError(`Wybrana data jest niedostępna. ${blockedDate.reason || ''}`)
            setLoading(false)
            return
          }
        } catch (err) {
          console.log('[v0] Error checking blocked dates:', err)
          // Continue anyway - blocked_dates table might not exist yet
        }
      }
      
      let scheduledFor = null
      if (isScheduled && formData.scheduledDate && formData.scheduledTime) {
        scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
      }

      // Prepare order items
      const orderItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || null,
      }))

      // Create order via API (uses service_role to bypass RLS)
      const createOrderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          customerName: formData.name,
          customerEmail: formData.email || null,
          customerPhone: formData.phone,
          deliveryAddress: orderType === 'delivery' ? formData.address : 'Odbior osobisty',
          deliveryNotes: formData.notes || null,
          orderType,
          scheduledFor,
          subtotal,
          deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
          discountCode: discountApplied?.code || null,
          discountAmount: discountApplied?.amount || 0,
          loyaltyDiscount,
          customerEmailForLoyalty: formData.email?.toLowerCase() || null,
          total: finalTotal,
          orderItems,
        }),
      })

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json()
        throw new Error(errorData.error || 'Nie udało się utworzyć zamówienia')
      }

      const { orderId } = await createOrderRes.json()

      // Update discount code usage count
      if (discountApplied) {
        await supabase.rpc('increment_discount_usage', { discount_code: discountApplied.code, restaurant_id: restaurantId })
      }

      // Update or create customer loyalty
      if (formData.email && loyaltySettings?.is_enabled) {
        const email = formData.email.toLowerCase()
        
        if (customerLoyalty) {
          await supabase
            .from('customer_loyalty')
            .update({
              total_spent: customerLoyalty.total_spent + finalTotal,
              total_orders: customerLoyalty.total_orders + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', customerLoyalty.id)
        } else {
          await supabase
            .from('customer_loyalty')
            .insert({
              restaurant_user_id: restaurantId,
              customer_email: email,
              total_spent: finalTotal,
              total_orders: 1
            })
        }
      }

      // Redirect to order confirmation
      const orderUrl = restaurantSlug ? `/r/${restaurantSlug}/order/${orderId}` : `/order/${orderId}`
      router.push(orderUrl)
      onSuccess()
    } catch (err) {
      console.error('Error creating order:', err)
      setError('Wystapil blad podczas skladania zamowienia. Sprobuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Wstecz do koszyka
      </Button>

      {/* Order Type */}
      <div className="space-y-3">
        <Label>Typ zamowienia</Label>
        <RadioGroup
          value={orderType}
          onValueChange={(v) => setOrderType(v as 'delivery' | 'pickup')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="cursor-pointer">Dostawa</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="cursor-pointer">Odbior osobisty</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Customer Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Imie i nazwisko *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Jan Kowalski"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+48 123 456 789"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            {loyaltySettings?.is_enabled && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Podaj email aby zbierac punkty
              </span>
            )}
          </div>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jan@example.com"
          />
          {loyaltyLevel && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Poziom <strong>{loyaltyLevel.name}</strong> - {loyaltyLevel.discount_percent}% znizki
              </span>
            </div>
          )}
          {formData.email && loyaltySettings?.is_enabled && !customerLoyalty && (
            <p className="text-xs text-muted-foreground">
              To Twoje pierwsze zamówienie - zacznij zbierać punkty!
            </p>
          )}
        </div>

        {orderType === 'delivery' && (
          <div className="space-y-2">
            <Label htmlFor="address">Adres dostawy *</Label>
            <Textarea
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="ul. Przykladowa 1, 00-001 Warszawa"
              rows={2}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Uwagi do zamowienia</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="np. bez cebuli, drzwi z kodem 1234"
            rows={2}
          />
        </div>
      </div>

      {/* Discount Code */}
      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <Label>Kod rabatowy</Label>
        </div>
        
        {discountApplied ? (
          <div className="flex items-center justify-between p-2 bg-(--confirm)/10 border border-(--confirm) rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-(--confirm)" />
              <span className="font-medium">{discountApplied.code}</span>
              <Badge variant="secondary">
                -{discountApplied.type === 'percentage' ? `${discountApplied.value}%` : `${discountApplied.value} zł`}
              </Badge>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={removeDiscount}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value.toUpperCase())
                setDiscountError(null)
              }}
              placeholder="Wpisz kod"
              className="uppercase"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={applyDiscountCode}
              disabled={checkingDiscount || !discountCode.trim()}
            >
              {checkingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Zastosuj'}
            </Button>
          </div>
        )}
        
        {discountError && (
          <p className="text-sm text-destructive">{discountError}</p>
        )}
      </div>

      {/* Schedule Order */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="scheduled">Zaplanuj zamowienie</Label>
          </div>
          <Switch
            id="scheduled"
            checked={isScheduled}
            onCheckedChange={setIsScheduled}
          />
        </div>

        {isScheduled ? (
          <>
            <p className="text-sm text-muted-foreground">
              Wybierz dzień i godzinę, na którą chciałbyś zamawiać. Restauracja musi być otwarta o wybranym terminie.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Data</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  required={isScheduled}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Godzina</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  required={isScheduled}
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Włącz aby zamawiać na przyszły termin, nawet gdy restauracja jest teraz zamknięta.
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Produkty ({items.length})</span>
          <span>{subtotal.toFixed(2)} zl</span>
        </div>
        
        {discountApplied && (
          <div className="flex justify-between text-sm text-accent">
            <span>Rabat ({discountApplied.code})</span>
            <span>-{discountApplied.amount.toFixed(2)} zl</span>
          </div>
        )}
        
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm text-primary">
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Znizka lojalnosciowa ({loyaltyLevel?.discount_percent}%)
            </span>
            <span>-{loyaltyDiscount.toFixed(2)} zl</span>
          </div>
        )}
        
        {orderType === 'delivery' && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dostawa</span>
            <span>{deliveryFee.toFixed(2)} zl</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
          <span>Do zaplaty</span>
          <span className="text-primary">{finalTotal.toFixed(2)} zl</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Skladanie zamowienia...
          </>
        ) : (
          'Zloz zamowienie'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Po zlozeniu zamowienia restauracja je potwierdzi, a nastepnie bedziesz moc dokonac platnosci.
      </p>
    </form>
  )
}
