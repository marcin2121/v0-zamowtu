'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PauseCircle, PlayCircle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OrderPauseManagerProps {
  userId: string
  initialOpen: boolean
}

export function OrderPauseManager({ userId, initialOpen }: OrderPauseManagerProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const newOpenState = !isOpen
    
    const { error } = await supabase
      .from('restaurant_settings')
      .update({
        is_open: newOpenState,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Database error:', error)
      toast({
        title: 'Błąd',
        description: `Nie udało się zaktualizować: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      setIsOpen(newOpenState)
      toast({
        title: newOpenState ? 'Restauracja otwarta' : 'Restauracja zamknięta',
        description: newOpenState 
          ? 'Klienci mogą składać zamówienia'
          : 'Zamówienia są tymczasowo wstrzymane',
      })
    }
    
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOpen ? <PlayCircle className="w-5 h-5 text-green-600" /> : <PauseCircle className="w-5 h-5 text-orange-600" />}
          Szybkie wstrzymanie zamówień
        </CardTitle>
        <CardDescription>
          Możesz tymczasowo wstrzymać przyjmowanie zamówień jednym kliknięciem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label className="font-semibold">
              {isOpen ? 'Zamówienia aktywne' : 'Zamówienia wstrzymane'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isOpen 
                ? 'Klienci mogą składać zamówienia normalnie'
                : 'Klienci widzą komunikat o niedostępności'}
            </p>
          </div>
          <Button
            variant={isOpen ? 'outline' : 'default'}
            onClick={toggleStatus}
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Ładowanie...' : isOpen ? 'Wstrzymaj zamówienia' : 'Wznów zamówienia'}
          </Button>
        </div>

        <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Status restauracji jest również kontrolowany automatycznie przez harmonogram godzin otwarcia poniżej.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
