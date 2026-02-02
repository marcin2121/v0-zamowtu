'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, X, Ban, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Order, BlockedDate } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ScheduledOrdersCalendarProps {
  userId: string
}

export function ScheduledOrdersCalendar({ userId }: ScheduledOrdersCalendarProps) {
  const [scheduledOrders, setScheduledOrders] = useState<Order[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [addDateDialogOpen, setAddDateDialogOpen] = useState(false)
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    const supabase = createClient()
    
    // Fetch scheduled orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_user_id', userId)
      .not('scheduled_for', 'is', null)
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })

    // Fetch blocked dates
    const { data: blockedData } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (ordersData) setScheduledOrders(ordersData as Order[])
    if (blockedData) setBlockedDates(blockedData as BlockedDate[])
    setLoading(false)
  }

  const addBlockedDate = async () => {
    if (!newBlockedDate) return

    const supabase = createClient()
    const { error } = await supabase
      .from('blocked_dates')
      .insert({
        user_id: userId,
        date: newBlockedDate,
        reason: blockReason || null,
      })

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zablokować daty',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Data zablokowana',
        description: `${newBlockedDate} - klienci nie mogą zaplanować zamówień na ten dzień`,
      })
      fetchData()
      setAddDateDialogOpen(false)
      setNewBlockedDate('')
      setBlockReason('')
    }
  }

  const removeBlockedDate = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id)

    if (!error) {
      toast({
        title: 'Data odblokowana',
        description: 'Klienci mogą znowu planować zamówienia na ten dzień',
      })
      fetchData()
    }
  }

  const groupOrdersByDate = () => {
    const grouped: Record<string, Order[]> = {}
    scheduledOrders.forEach((order) => {
      if (order.scheduled_for) {
        const date = new Date(order.scheduled_for).toLocaleDateString('pl-PL')
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(order)
      }
    })
    return grouped
  }

  const ordersGrouped = groupOrdersByDate()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Kalendarz zaplanowanych zamówień
              </CardTitle>
              <CardDescription>
                Przegląd zamówień zaplanowanych na przyszłe daty
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {scheduledOrders.length} zamówień
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Ładowanie...</p>
          ) : scheduledOrders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Brak zaplanowanych zamówień</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(ordersGrouped).map(([date, orders]) => (
                <div key={date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{date}</h4>
                    <Badge>{orders.length} zamówień</Badge>
                  </div>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{order.customer_name}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(order.scheduled_for!).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="font-semibold">{order.total.toFixed(2)} zł</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-600" />
                Zablokowane daty
              </CardTitle>
              <CardDescription>
                Wyłącz możliwość planowania zamówień na wybrane dni (np. Sylwester, święta)
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddDateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Zablokuj datę
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blockedDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Brak zablokowanych dat</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(blocked.date).toLocaleDateString('pl-PL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlockedDate(blocked.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDateDialogOpen} onOpenChange={setAddDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zablokuj datę</DialogTitle>
            <DialogDescription>
              Klienci nie będą mogli zaplanować zamówień na wybraną datę
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="blocked-date">Data</Label>
              <Input
                id="blocked-date"
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-reason">Powód (opcjonalnie)</Label>
              <Input
                id="block-reason"
                placeholder="np. Sylwester - pełna rezerwacja"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDateDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={addBlockedDate} disabled={!newBlockedDate}>
              <Ban className="w-4 h-4 mr-2" />
              Zablokuj datę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
