'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, DollarSign, X, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { MenuSuggestion, MenuItem } from '@/lib/types'

interface MenuSuggestionsProps {
  userId: string
}

export function MenuSuggestions({ userId }: MenuSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSuggestions()
  }, [userId])

  const fetchSuggestions = async () => {
    const supabase = createClient()
    
    // Fetch menu items with sales data
    const { data: itemsData } = await supabase
      .from('menu_items')
      .select('*')
      .eq('user_id', userId)

    if (itemsData) {
      setItems(itemsData as MenuItem[])
      
      // Generate suggestions based on sales data
      const generatedSuggestions = await generateSuggestions(itemsData as MenuItem[])
      
      // Fetch existing suggestions from DB
      const { data: dbSuggestions } = await supabase
        .from('menu_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })

      if (dbSuggestions && dbSuggestions.length > 0) {
        setSuggestions(dbSuggestions as MenuSuggestion[])
      } else {
        // Save generated suggestions to DB
        for (const suggestion of generatedSuggestions) {
          await supabase.from('menu_suggestions').insert({
            user_id: userId,
            suggestion_type: suggestion.suggestion_type,
            menu_item_id: suggestion.menu_item_id,
            title: suggestion.title,
            description: suggestion.description,
            priority: suggestion.priority,
          })
        }
        setSuggestions(generatedSuggestions)
      }
    }
    
    setLoading(false)
  }

  const generateSuggestions = async (menuItems: MenuItem[]): Promise<MenuSuggestion[]> => {
    const supabase = createClient()
    const suggestions: MenuSuggestion[] = []
    
    // Get sales data for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('menu_item_id, quantity, orders!inner(created_at)')
      .gte('orders.created_at', thirtyDaysAgo.toISOString())

    // Count sales per item
    const salesCount: Record<string, number> = {}
    orderItems?.forEach((item: any) => {
      if (item.menu_item_id) {
        salesCount[item.menu_item_id] = (salesCount[item.menu_item_id] || 0) + item.quantity
      }
    })

    // Suggest removing items with 0 or very low sales
    menuItems.forEach((item) => {
      const sales = salesCount[item.id] || 0
      
      if (sales === 0 && item.is_available) {
        suggestions.push({
          id: `temp-${Date.now()}-${item.id}`,
          user_id: userId,
          suggestion_type: 'remove',
          menu_item_id: item.id,
          title: `Rozważ usunięcie: ${item.name}`,
          description: `Brak sprzedaży w ostatnich 30 dniach. Możesz ukryć lub usunąć to danie.`,
          priority: 3,
          is_dismissed: false,
          created_at: new Date().toISOString(),
        })
      } else if (sales > 20) {
        suggestions.push({
          id: `temp-${Date.now()}-promo-${item.id}`,
          user_id: userId,
          suggestion_type: 'promote',
          menu_item_id: item.id,
          title: `Promuj popularny produkt: ${item.name}`,
          description: `Sprzedano ${sales} porcji w ostatnim miesiącu! Dodaj zdjęcie lub umieść na początku menu.`,
          priority: 2,
          is_dismissed: false,
          created_at: new Date().toISOString(),
        })
      }
    })

    // Add general suggestions
    if (menuItems.length < 5) {
      suggestions.push({
        id: `temp-${Date.now()}-expand`,
        user_id: userId,
        suggestion_type: 'optimize_price',
        menu_item_id: null,
        title: 'Rozbuduj menu',
        description: `Masz tylko ${menuItems.length} produktów. Dodaj więcej pozycji aby zwiększyć wybór dla klientów.`,
        priority: 1,
        is_dismissed: false,
        created_at: new Date().toISOString(),
      })
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  const dismissSuggestion = async (suggestionId: string) => {
    const supabase = createClient()
    await supabase
      .from('menu_suggestions')
      .update({ is_dismissed: true })
      .eq('id', suggestionId)

    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    
    toast({
      title: 'Sugestia ukryta',
      description: 'Nie będziemy już pokazywać tej sugestii',
    })
  }

  const getSuggestionIcon = (type: MenuSuggestion['suggestion_type']) => {
    switch (type) {
      case 'remove':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'promote':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'optimize_price':
        return <DollarSign className="w-5 h-5 text-blue-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-purple-600" />
    }
  }

  const getSuggestionColor = (type: MenuSuggestion['suggestion_type']) => {
    switch (type) {
      case 'remove':
        return 'border-orange-200 bg-orange-50'
      case 'promote':
        return 'border-green-200 bg-green-50'
      case 'optimize_price':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-purple-200 bg-purple-50'
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Analizuję menu...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Sugestie dotyczące menu
        </CardTitle>
        <CardDescription>
          Rekomendacje oparte na analizie sprzedaży i popularności dań
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Brak sugestii w tej chwili</p>
            <p className="text-sm text-muted-foreground mt-1">
              Zbierz więcej danych sprzedażowych aby otrzymać rekomendacje
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const item = items.find((i) => i.id === suggestion.menu_item_id)
              
              return (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.suggestion_type)} relative`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => dismissSuggestion(suggestion.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-start gap-3 pr-8">
                    <div className="mt-0.5">
                      {getSuggestionIcon(suggestion.suggestion_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      {item && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.price.toFixed(2)} zł
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
