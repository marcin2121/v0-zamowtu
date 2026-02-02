'use client'

import { useEffect, useState } from 'react'
import {
  Clock,
  Check,
  X,
  ChefHat,
  Truck,
  Phone,
  MapPin,
  MessageSquare,
  CreditCard,
  Timer,
  Bell,
  BellOff,
  AlertTriangle,
} from 'lucide-react'
import { notificationSound } from '@/lib/notification-sound'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'

interface OrdersListProps {
  initialOrders: Order[]
  userId: string
}

interface StatusConfig {
  label: string
  color: string
}

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

const statusLabels: Record<OrderStatus, StatusConfig> = {
  pending: { label: 'Nowe', color: 'bg-yellow-500' },
  accepted: { label: 'Przyjęte', color: 'bg-blue-500' },
  preparing: { label: 'W przygotowaniu', color: 'bg-purple-500' },
  ready: { label: 'Gotowe', color: 'bg-green-500' },
  delivered: { label: 'Dostarczone', color: 'bg-gray-500' },
  cancelled: { label: 'Anulowane', color: 'bg-red-500' },
}

export function OrdersList({ initialOrders, userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<string>('all')
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [estimatedMinutes, setEstimatedMinutes] = useState('30')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [lastOrderCount, setLastOrderCount] = useState(initialOrders.length)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', payload.new.id)
            
            const newOrder = { ...payload.new, items: items || [] } as Order
            setOrders((prev) => {
              // Play notification sound for new order
              if (notificationsEnabled) {
                notificationSound.playNewOrderSound()
                toast({
                  title: '🔔 Nowe zamówienie!',
                  description: `Zamówienie od ${newOrder.customer_name}`,
                  duration: 5000,
                })
              }
              return [newOrder, ...prev]
            })
            setLastOrderCount((prev) => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const updateOrderStatus = async (orderId: string, status: string, estimatedDeliveryAt?: string) => {
    const supabase = createClient()
    const updateData: Record<string, unknown> = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (estimatedDeliveryAt) {
      updateData.estimated_delivery_at = estimatedDeliveryAt
    }
    
    await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
  }

  const handleAcceptOrder = (order: Order) => {
    setSelectedOrder(order)
    setEstimatedMinutes('30')
    setAcceptDialogOpen(true)
  }

  const confirmAcceptOrder = async () => {
    if (!selectedOrder) return
    
    const minutes = parseInt(estimatedMinutes) || 30
    const estimatedDeliveryAt = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    
    await updateOrderStatus(selectedOrder.id, 'accepted', estimatedDeliveryAt)
    setAcceptDialogOpen(false)
    setSelectedOrder(null)
  }

  const markAsPaid = async (orderId: string) => {
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ is_paid: true, updated_at: new Date().toISOString() })
      .eq('id', orderId)
  }

  const toggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    notificationSound.setEnabled(newState)
    toast({
      title: newState ? 'Powiadomienia włączone' : 'Powiadomienia wyłączone',
      description: newState ? 'Usłyszysz dźwięk przy nowym zamówieniu' : 'Powiadomienia dźwiękowe wyłączone',
    })
  }

  const getWaitingTime = (createdAt: string) => {
    const now = new Date().getTime()
    const orderTime = new Date(createdAt).getTime()
    const diffMinutes = Math.floor((now - orderTime) / 60000)
    
    if (diffMinutes < 5) return null
    
    let colorClass = 'text-amber-600'
    if (diffMinutes > 15) colorClass = 'text-orange-600'
    if (diffMinutes > 30) colorClass = 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 ${colorClass} font-semibold text-sm`}>
        <AlertTriangle className="w-4 h-4" />
        <span>Czeka {diffMinutes} min</span>
      </div>
    )
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return order.status !== 'delivered' && order.status !== 'cancelled'
    return order.status === filter
  })

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Brak aktywnych zamówień
          </h3>
          <p className="text-muted-foreground">
            Nowe zamówienia pojawią się tutaj automatycznie.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Aktywne zamówienia</h3>
          <p className="text-sm text-muted-foreground">
            {filteredOrders.length} zamówień do realizacji
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={notificationsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleNotifications}
            className="gap-2"
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {notificationsEnabled ? 'ON' : 'OFF'}
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtruj status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Aktywne</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="accepted">Zaakceptowane</SelectItem>
              <SelectItem value="preparing">W przygotowaniu</SelectItem>
              <SelectItem value="ready">Gotowe</SelectItem>
              <SelectItem value="delivered">Dostarczone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{order.customer_name}</span>
                    <Badge className={statusLabels[order.status]?.color || 'bg-gray-500'}>
                      {statusLabels[order.status]?.label || order.status}
                    </Badge>
                    {order.status === 'pending' && getWaitingTime(order.created_at)}
                    {order.is_paid && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CreditCard className="w-3 h-3 mr-1" />
                        Opłacone
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone className="w-3 h-3" />
                      {order.customer_phone}
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      {order.order_type === 'delivery' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {order.order_type === 'delivery' ? 'Dostawa' : 'Odbiór'}
                    </span>
                  </div>
                  {order.order_type === 'delivery' && order.delivery_address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {order.delivery_address}
                    </p>
                  )}
                </div>
                <span className="text-xl font-bold text-primary">{order.total.toFixed(2)} zł</span>
              </div>

              {/* Estimated Time */}
              {order.estimated_delivery_at && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg text-sm mb-4">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-foreground">
                    Przewidywany czas: {new Date(order.estimated_delivery_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Notes */}
              {order.delivery_notes && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm mb-4">
                  <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-amber-800">{order.delivery_notes}</span>
                </div>
              )}

              {/* Items */}
              <div className="bg-muted rounded-lg p-3 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>
                      {item.quantity}x {item.name}
                      {item.notes && <span className="text-muted-foreground ml-1">({item.notes})</span>}
                    </span>
                    <span>{(item.quantity * item.price).toFixed(2)} zł</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button size="sm" className="flex-1" onClick={() => handleAcceptOrder(order)}>
                      <Check className="w-4 h-4 mr-1" />
                      Przyjmij
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                      <X className="w-4 h-4 mr-1" />
                      Odrzuć
                    </Button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                    <ChefHat className="w-4 h-4 mr-1" />
                    Rozpocznij przygotowanie
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, 'ready')}>
                    <ChefHat className="w-4 h-4 mr-1" />
                    Oznacz jako gotowe
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                    <Truck className="w-4 h-4 mr-1" />
                    Wydaj zamówienie
                  </Button>
                )}
                {!order.is_paid && order.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => markAsPaid(order.id)}>
                    <CreditCard className="w-4 h-4 mr-1" />
                    Oznacz jako opłacone
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accept Order Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akceptuj zamówienie</DialogTitle>
            <DialogDescription>
              Ustaw przewidywany czas oczekiwania na zamówienie dla klienta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Przewidywany czas oczekiwania (minuty)</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min="5"
                max="180"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Klient zobaczy odliczanie do przewidywanego czasu dostawy.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['15', '30', '45', '60'].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant={estimatedMinutes === mins ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEstimatedMinutes(mins)}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={confirmAcceptOrder}>
              <Check className="w-4 h-4 mr-1" />
              Akceptuj zamówienie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
