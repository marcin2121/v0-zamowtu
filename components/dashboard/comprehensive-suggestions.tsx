'use client'

import { useEffect, useState } from 'react'
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Calendar,
  Package,
  Target,
  Zap,
  AlertTriangle,
  ChevronRight,
  X,
  CheckCircle2,
  Tag,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Suggestion {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  actionable: boolean
  data?: any
}

interface ComprehensiveSuggestionsProps {
  userId: string
}

export function ComprehensiveSuggestions({ userId }: ComprehensiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchSuggestions()
  }, [userId])

  const fetchSuggestions = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch data for analysis
    const [ordersResult, menuResult, settingsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('restaurant_user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_available', true),
      supabase
        .from('restaurant_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
    ])

    const orders = ordersResult.data || []
    const menuItems = menuResult.data || []
    const settings = settingsResult.data

    const generatedSuggestions: Suggestion[] = []

    // 1. Menu Performance Analysis
    if (orders.length > 0) {
      const itemSales = new Map<string, { name: string; count: number; revenue: number }>()
      
      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          const current = itemSales.get(item.menu_item_id) || { name: item.name, count: 0, revenue: 0 }
          current.count += item.quantity
          current.revenue += item.price * item.quantity
          itemSales.set(item.menu_item_id, current)
        })
      })

      // Find low performers
      const sortedByCount = Array.from(itemSales.entries()).sort((a, b) => a[1].count - b[1].count)
      const lowPerformers = sortedByCount.slice(0, Math.min(3, Math.floor(sortedByCount.length * 0.2)))
      
      if (lowPerformers.length > 0 && lowPerformers[0][1].count < 5) {
        generatedSuggestions.push({
          id: 'menu-remove-low',
          type: 'menu',
          priority: 'medium',
          title: 'Usuń słabo sprzedające się dania',
          description: `${lowPerformers.length} dań sprzedało się mniej niż 5 razy w ostatnim miesiącu. Rozważ ich usunięcie lub zmianę.`,
          impact: 'Uproszczenie menu i redukcja kosztów składników',
          actionable: true,
          data: { items: lowPerformers.map(([id, data]) => ({ id, ...data })) }
        })
      }

      // Find top performers to promote
      const topPerformers = Array.from(itemSales.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 3)
      
      if (topPerformers.length > 0) {
        generatedSuggestions.push({
          id: 'menu-promote-top',
          type: 'menu',
          priority: 'high',
          title: 'Promuj bestsellery',
          description: `"${topPerformers[0][1].name}" generuje największy przychód (${topPerformers[0][1].revenue.toFixed(0)} zł). Wyróżnij go w menu!`,
          impact: 'Zwiększenie sprzedaży najpopularniejszych dań',
          actionable: true,
          data: { items: topPerformers.map(([id, data]) => ({ id, ...data })) }
        })
      }
    }

    // 2. Pricing Optimization
    if (orders.length > 10) {
      const avgOrderValue = orders.reduce((sum, o) => sum + o.total, 0) / orders.length
      
      if (avgOrderValue < 50) {
        generatedSuggestions.push({
          id: 'pricing-increase-avg',
          type: 'pricing',
          priority: 'medium',
          title: 'Zwiększ średnią wartość zamówienia',
          description: `Średnia wartość zamówienia to ${avgOrderValue.toFixed(2)} zł. Dodaj zestawy lub dania premium.`,
          impact: `Potencjalny wzrost przychodu o ${(avgOrderValue * 0.15).toFixed(0)} zł na zamówienie`,
          actionable: true,
          data: { currentAvg: avgOrderValue, targetAvg: avgOrderValue * 1.15 }
        })
      }
    }

    // 3. Timing & Scheduling
    const ordersByHour = new Map<number, number>()
    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours()
      ordersByHour.set(hour, (ordersByHour.get(hour) || 0) + 1)
    })

    const peakHours = Array.from(ordersByHour.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
    
    if (peakHours.length > 0) {
      generatedSuggestions.push({
        id: 'timing-peak-hours',
        type: 'operations',
        priority: 'high',
        title: 'Godziny szczytu wymagają uwagi',
        description: `Najwięcej zamówień otrzymujesz o ${peakHours[0][0]}:00 (${peakHours[0][1]} zamówień). Zaplanuj dodatkowy personel.`,
        impact: 'Szybsza realizacja zamówień w godzinach szczytu',
        actionable: true,
        data: { peakHours: peakHours.map(([h, c]) => ({ hour: h, count: c })) }
      })
    }

    // 4. Customer Retention
    const emailOrders = orders.filter(o => o.customer_email)
    const uniqueEmails = new Set(emailOrders.map(o => o.customer_email))
    const repeatCustomerRate = emailOrders.length > 0 
      ? ((emailOrders.length - uniqueEmails.size) / emailOrders.length * 100)
      : 0

    if (repeatCustomerRate < 30 && orders.length > 20) {
      generatedSuggestions.push({
        id: 'retention-loyalty',
        type: 'marketing',
        priority: 'high',
        title: 'Niski wskaźnik powracających klientów',
        description: `Tylko ${repeatCustomerRate.toFixed(0)}% zamówień to klienci powracający. Rozważ program lojalnościowy.`,
        impact: 'Wzrost liczby stałych klientów nawet o 50%',
        actionable: true,
        data: { currentRate: repeatCustomerRate, targetRate: 50 }
      })
    }

    // 5. Delivery Optimization
    const deliveryOrders = orders.filter(o => o.order_type === 'delivery')
    if (deliveryOrders.length > orders.length * 0.7 && settings?.delivery_fee < 10) {
      generatedSuggestions.push({
        id: 'pricing-delivery-fee',
        type: 'pricing',
        priority: 'medium',
        title: 'Rozważ wzrost opłaty za dostawę',
        description: `${((deliveryOrders.length / orders.length) * 100).toFixed(0)}% zamówień to dostawa. Obecna opłata (${settings.delivery_fee} zł) może nie pokrywać kosztów.`,
        impact: `Dodatkowy przychód: ${(deliveryOrders.length * 2).toFixed(0)} zł miesięcznie`,
        actionable: true,
        data: { currentFee: settings?.delivery_fee, suggestedFee: settings?.delivery_fee + 2 }
      })
    }

    // 6. Menu Variety
    if (menuItems.length < 10) {
      generatedSuggestions.push({
        id: 'menu-expand',
        type: 'menu',
        priority: 'low',
        title: 'Rozszerz menu',
        description: `Masz tylko ${menuItems.length} pozycji w menu. Klienci lubią wybór - rozważ dodanie 3-5 nowych dań.`,
        impact: 'Przyciągnięcie szerszej grupy klientów',
        actionable: true,
        data: { currentCount: menuItems.length, targetCount: 15 }
      })
    } else if (menuItems.length > 50) {
      generatedSuggestions.push({
        id: 'menu-simplify',
        type: 'menu',
        priority: 'medium',
        title: 'Uproszczenie menu',
        description: `${menuItems.length} pozycji to bardzo dużo. Zbyt duże menu może przytłaczać klientów i komplikować kuchnię.`,
        impact: 'Szybsza realizacja i lepsza jakość',
        actionable: true,
        data: { currentCount: menuItems.length, targetCount: 35 }
      })
    }

    // 7. Discount Strategy
    const ordersWithDiscount = orders.filter(o => o.discount_amount > 0)
    if (ordersWithDiscount.length > orders.length * 0.3) {
      generatedSuggestions.push({
        id: 'pricing-discount-overuse',
        type: 'pricing',
        priority: 'medium',
        title: 'Zbyt częste rabaty',
        description: `${((ordersWithDiscount.length / orders.length) * 100).toFixed(0)}% zamówień ma rabat. Może to obniżać marże.`,
        impact: 'Ochrona marży i rentowności',
        actionable: true,
        data: { discountRate: (ordersWithDiscount.length / orders.length * 100) }
      })
    }

    // 8. Minimum Order Value
    if (orders.length > 0) {
      const avgSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0) / orders.length
      if (settings && avgSubtotal < settings.min_order_value * 1.2) {
        generatedSuggestions.push({
          id: 'pricing-min-order',
          type: 'pricing',
          priority: 'low',
          title: 'Minimalna wartość zamówienia jest niska',
          description: `Średnie zamówienie (${avgSubtotal.toFixed(2)} zł) jest blisko minimum (${settings.min_order_value} zł). Można podnieść próg.`,
          impact: 'Wyższe zamówienia bez utraty klientów',
          actionable: true,
          data: { currentMin: settings.min_order_value, suggestedMin: Math.ceil(avgSubtotal * 0.9) }
        })
      }
    }

    setSuggestions(generatedSuggestions)
    setLoading(false)
  }

  const dismissSuggestion = (id: string) => {
    setDismissedIds(prev => [...prev, id])
    toast({
      title: 'Sugestia odrzucona',
      description: 'Możesz ją przywrócić odświeżając stronę',
    })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium': return <Zap className="w-4 h-4 text-amber-500" />
      case 'low': return <Lightbulb className="w-4 h-4 text-blue-500" />
    }
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'menu': return <Package className="w-5 h-5" />
      case 'pricing': return <DollarSign className="w-5 h-5" />
      case 'operations': return <Clock className="w-5 h-5" />
      case 'marketing': return <Users className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const activeSuggestions = suggestions.filter(s => !dismissedIds.includes(s.id))
  const grouped = {
    menu: activeSuggestions.filter(s => s.type === 'menu'),
    pricing: activeSuggestions.filter(s => s.type === 'pricing'),
    operations: activeSuggestions.filter(s => s.type === 'operations'),
    marketing: activeSuggestions.filter(s => s.type === 'marketing'),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analizuję dane restauracji...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Wysokie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSuggestions.filter(s => s.priority === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Średnie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSuggestions.filter(s => s.priority === 'medium').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              Niskie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSuggestions.filter(s => s.priority === 'low').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Łącznie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuggestions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Wszystkie ({activeSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="menu">
            <Package className="w-4 h-4 mr-1" />
            Menu ({grouped.menu.length})
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-1" />
            Ceny ({grouped.pricing.length})
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Clock className="w-4 h-4 mr-1" />
            Operacje ({grouped.operations.length})
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Users className="w-4 h-4 mr-1" />
            Marketing ({grouped.marketing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {activeSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Świetna robota!</h3>
                <p className="text-muted-foreground">
                  Wszystko wygląda dobrze. Brak sugestii do poprawy.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeSuggestions
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
              })
              .map(suggestion => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getCategoryIcon(suggestion.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityIcon(suggestion.priority)}
                            <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          </div>
                          <CardDescription>{suggestion.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissSuggestion(suggestion.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Potencjalny efekt:</span>
                      <span>{suggestion.impact}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        {Object.entries(grouped).map(([category, items]) => (
          <TabsContent key={category} value={category} className="space-y-4 mt-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-4">
                    {getCategoryIcon(category)}
                  </div>
                  <p className="text-muted-foreground">
                    Brak sugestii w tej kategorii
                  </p>
                </CardContent>
              </Card>
            ) : (
              items.map(suggestion => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getCategoryIcon(suggestion.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityIcon(suggestion.priority)}
                            <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          </div>
                          <CardDescription>{suggestion.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissSuggestion(suggestion.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Potencjalny efekt:</span>
                      <span>{suggestion.impact}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
