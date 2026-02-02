'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PauseCircle, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OrderPauseManagerProps {
  userId: string
  initialPaused: boolean
  initialReason: string | null
}

export function OrderPauseManager({ userId, initialPaused, initialReason }: OrderPauseManagerProps) {
  const [isPaused, setIsPaused] = useState(initialPaused)
  const [pauseReason, setPauseReason] = useState(initialReason || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const togglePause = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const newPausedState = !isPaused
    
    const { error } = await supabase
      .from('restaurant_settings')
      .update({
        orders_paused: newPausedState,
        pause_reason: newPausedState ? pauseReason : null,
      })
      .eq('user_id', userId)

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować statusu zamówień',
        variant: 'destructive',
      })
    } else {
      setIsPaused(newPausedState)
      toast({
        title: newPausedState ? 'Zamówienia wstrzymane' : 'Zamówienia wznowione',
        description: newPausedState 
          ? 'Klienci nie będą mogli składać nowych zamówień'
          : 'Klienci mogą znowu składać zamówienia',
      })
    }
    
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPaused ? <PauseCircle className="w-5 h-5 text-orange-600" /> : <PlayCircle className="w-5 h-5 text-green-600" />}
          Wstrzymanie przyjmowania zamówień
        </CardTitle>
        <CardDescription>
          Możesz tymczasowo wstrzymać przyjmowanie zamówień gdy kuchnia jest przeciążona
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="pause-toggle" className="font-semibold">
              {isPaused ? 'Zamówienia wstrzymane' : 'Zamówienia aktywne'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPaused 
                ? 'Klienci widzą komunikat o niedostępności'
                : 'Klienci mogą składać zamówienia normalnie'}
            </p>
          </div>
          <Button
            variant={isPaused ? 'destructive' : 'default'}
            onClick={togglePause}
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Ładowanie...' : isPaused ? 'Wznów zamówienia' : 'Wstrzymaj zamówienia'}
          </Button>
        </div>

        {isPaused && (
          <div className="space-y-2">
            <Label htmlFor="pause-reason">Powód wstrzymania (opcjonalnie)</Label>
            <Textarea
              id="pause-reason"
              placeholder="np. 'Przeciążona kuchnia, zamówienia od 18:00' lub 'Przerwa techniczna'"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={3}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const supabase = createClient()
                await supabase
                  .from('restaurant_settings')
                  .update({ pause_reason: pauseReason })
                  .eq('user_id', userId)
                toast({
                  title: 'Zaktualizowano',
                  description: 'Powód wstrzymania został zapisany',
                })
              }}
            >
              Zapisz powód
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
