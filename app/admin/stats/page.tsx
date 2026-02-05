'use client'

import React from "react"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Clock,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
  CalendarDays,
  Flame,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const periodOptions = [
  { value: '1', label: 'Dzisiaj' },
  { value: '7', label: 'Ostatnie 7 dni' },
  { value: '14', label: 'Ostatnie 14 dni' },
  { value: '30', label: 'Ostatnie 30 dni' },
  { value: '90', label: 'Ostatnie 90 dni' },
]

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  iconColor?: string
  iconBg?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                {trendValue} vs poprzedni okres
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SimpleBarChart({ data, maxVal, labelKey, valueKey, color = 'bg-primary' }: {
  data: { [key: string]: string | number }[]
  maxVal: number
  labelKey: string
  valueKey: string
  color?: string
}) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{String(item[labelKey])}</span>
          <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: maxVal > 0 ? `${(Number(item[valueKey]) / maxVal) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs font-medium text-foreground w-10 shrink-0">{String(item[valueKey])}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminStatsPage() {
  const [period, setPeriod] = useState('7')
  const [restaurant, setRestaurant] = useState('all')

  const { data, isLoading, error } = useSWR(
    `/api/admin/stats?period=${period}&restaurant=${restaurant}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Statystyki platformy</h1>
        <Card>
          <CardContent className="p-8 text-center text-red-500">
            Blad ladowania statystyk. Sprobuj odswiezyc strone.
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = data?.stats
  const ordersPerDay = data?.ordersPerDay || []
  const restaurantStats = data?.restaurantStats || []
  const topProducts = data?.topProducts || []
  const peakHours = data?.peakHours || []
  const restaurants = data?.restaurants || []

  // Calculate trends
  const ordersTrend = stats
    ? stats.totalOrders > stats.prevPeriodOrders ? 'up' : stats.totalOrders < stats.prevPeriodOrders ? 'down' : 'neutral'
    : 'neutral'
  const revenueTrend = stats
    ? stats.totalRevenue > stats.prevPeriodRevenue ? 'up' : stats.totalRevenue < stats.prevPeriodRevenue ? 'down' : 'neutral'
    : 'neutral'

  const ordersChange = stats && stats.prevPeriodOrders > 0
    ? (((stats.totalOrders - stats.prevPeriodOrders) / stats.prevPeriodOrders) * 100).toFixed(0)
    : null
  const revenueChange = stats && stats.prevPeriodRevenue > 0
    ? (((stats.totalRevenue - stats.prevPeriodRevenue) / stats.prevPeriodRevenue) * 100).toFixed(0)
    : null

  const maxDayOrders = Math.max(...ordersPerDay.map((d: { orders: number }) => d.orders), 1)
  const maxHourOrders = Math.max(...peakHours.map((h: { orders: number }) => h.orders), 1)

  // Filter peak hours to show only those with orders or key hours
  const filteredPeakHours = peakHours.filter((_: { orders: number }, i: number) => i >= 8 && i <= 23)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statystyki platformy</h1>
          <p className="text-muted-foreground mt-1">
            Szczegolowe dane o zamowieniach, przychodach i aktywnosci
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={restaurant} onValueChange={setRestaurant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wszystkie restauracje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie restauracje</SelectItem>
              {restaurants.map((r: { user_id: string; name: string }) => (
                <SelectItem key={r.user_id} value={r.user_id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Period Filters */}
      <div className="flex flex-wrap gap-2">
        {periodOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={period === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(opt.value)}
            className={period !== opt.value ? 'bg-transparent' : ''}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-2 bg-muted rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Zamowienia"
              value={stats?.totalOrders || 0}
              subtitle={`Dostarczonych: ${stats?.deliveredOrders || 0}`}
              icon={ShoppingBag}
              trend={ordersTrend as 'up' | 'down' | 'neutral'}
              trendValue={ordersChange ? `${Number(ordersChange) > 0 ? '+' : ''}${ordersChange}%` : undefined}
              iconColor="text-blue-500"
              iconBg="bg-blue-500/10"
            />
            <StatCard
              title="Przychod"
              value={`${(stats?.totalRevenue || 0).toFixed(2)} zl`}
              subtitle={`Srednia: ${(stats?.avgOrderValue || 0).toFixed(2)} zl`}
              icon={CreditCard}
              trend={revenueTrend as 'up' | 'down' | 'neutral'}
              trendValue={revenueChange ? `${Number(revenueChange) > 0 ? '+' : ''}${revenueChange}%` : undefined}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-500/10"
            />
            <StatCard
              title="Anulowane"
              value={stats?.cancelledOrders || 0}
              subtitle={stats?.totalOrders > 0 ? `${((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}% zamowien` : 'Brak zamowien'}
              icon={TrendingDown}
              iconColor="text-red-500"
              iconBg="bg-red-500/10"
            />
            <StatCard
              title="W realizacji"
              value={stats?.pendingOrders || 0}
              subtitle="Oczekujace/przygotowywane"
              icon={Clock}
              iconColor="text-orange-500"
              iconBg="bg-orange-500/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders per day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="w-4 h-4" />
                  Zamowienia dziennie
                </CardTitle>
                <CardDescription>
                  Liczba zamowien na dzien w wybranym okresie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersPerDay.length > 0 ? (
                  <div className="space-y-1.5">
                    {ordersPerDay.slice(-14).map((day: { date: string; orders: number; revenue: number }) => (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">
                          {new Date(day.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(day.orders / maxDayOrders) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8 shrink-0 text-right">{day.orders}</span>
                        <span className="text-xs text-muted-foreground w-16 shrink-0 text-right">{day.revenue.toFixed(0)} zl</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Brak danych</p>
                )}
              </CardContent>
            </Card>

            {/* Peak hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="w-4 h-4" />
                  Godziny szczytu
                </CardTitle>
                <CardDescription>
                  Rozklad zamowien wedlug godziny
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPeakHours.length > 0 ? (
                  <SimpleBarChart
                    data={filteredPeakHours}
                    maxVal={maxHourOrders}
                    labelKey="hour"
                    valueKey="orders"
                    color="bg-amber-500"
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">Brak danych</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Per-restaurant stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Statystyki restauracji
              </CardTitle>
              <CardDescription>
                Wyniki poszczegolnych restauracji w wybranym okresie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restaurantStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase">Restauracja</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-center">Plan</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-center">Status</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Zamowienia</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Dostarczone</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Przychod</th>
                        <th className="pb-3 text-xs font-medium text-muted-foreground uppercase text-right">Srednia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantStats.map((r: {
                        user_id: string
                        name: string
                        plan: string
                        is_open: boolean
                        orders: number
                        delivered: number
                        revenue: number
                        avgOrder: number
                      }) => {
                        const isPro = r.plan === 'professional'
                        return (
                          <tr key={r.user_id} className="border-b last:border-0">
                            <td className="py-3">
                              <span className="font-medium text-sm text-foreground">{r.name}</span>
                            </td>
                            <td className="py-3 text-center">
                              <Badge
                                variant={isPro ? 'default' : 'outline'}
                                className={`text-xs ${isPro ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                              >
                                {isPro ? (
                                  <span className="flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Pro
                                  </span>
                                ) : 'Starter'}
                              </Badge>
                            </td>
                            <td className="py-3 text-center">
                              <Badge variant={r.is_open ? 'default' : 'secondary'} className="text-xs">
                                {r.is_open ? 'Otwarte' : 'Zamkniete'}
                              </Badge>
                            </td>
                            <td className="py-3 text-right text-sm">{r.orders}</td>
                            <td className="py-3 text-right text-sm">{r.delivered}</td>
                            <td className="py-3 text-right text-sm font-medium">{r.revenue.toFixed(2)} zl</td>
                            <td className="py-3 text-right text-sm text-muted-foreground">{r.avgOrder.toFixed(2)} zl</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Brak danych restauracji</p>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="w-4 h-4" />
                  Najpopularniejsze produkty
                </CardTitle>
                <CardDescription>
                  Top 10 najczesciej zamawianych produktow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product: { name: string; count: number; revenue: number }, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-8">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.revenue.toFixed(2)} zl przychodu</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {product.count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
