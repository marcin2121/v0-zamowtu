'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Order } from '@/lib/types'

interface OrdersHistoryProps {
  orders: Order[]
}

export function OrdersHistory({ orders }: OrdersHistoryProps) {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.includes(search)

    const matchesDate = dateFilter
      ? order.created_at.startsWith(dateFilter)
      : true

    return matchesSearch && matchesDate
  })

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Brak historii zamowien
          </h3>
          <p className="text-muted-foreground">
            Zakonczone zamowienia pojawia sie tutaj.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po nazwie, ID lub telefonie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Wartosc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.created_at).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.order_type === 'delivery' ? 'Dostawa' : 'Odbior'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.status === 'delivered' ? (
                      <Badge className="bg-accent text-accent-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Dostarczono
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Anulowano
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {order.total.toFixed(2)} zl
                    {order.is_paid && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Oplacone
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Wyswietlono {filteredOrders.length} z {orders.length} zamowien
      </p>
    </div>
  )
}
