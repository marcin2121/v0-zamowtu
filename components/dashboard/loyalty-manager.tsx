'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Users, TrendingUp, Plus, Trash2, Save, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import type { LoyaltySettings, LoyaltyLevel, CustomerLoyalty } from '@/lib/types'

interface LoyaltyManagerProps {
  settings: LoyaltySettings | null
  customers: CustomerLoyalty[]
  userId: string
}

export function LoyaltyManager({ settings, customers, userId }: LoyaltyManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(settings?.is_enabled ?? false)
  const [levels, setLevels] = useState<LoyaltyLevel[]>(
    settings?.levels || [
      { name: 'Brązowy', min_spent: 100, discount_percent: 5 },
      { name: 'Srebrny', min_spent: 300, discount_percent: 10 },
      { name: 'Złoty', min_spent: 500, discount_percent: 15 },
    ]
  )

  const addLevel = () => {
    const lastLevel = levels[levels.length - 1]
    setLevels([
      ...levels,
      {
        name: `Poziom ${levels.length + 1}`,
        min_spent: lastLevel ? lastLevel.min_spent + 200 : 100,
        discount_percent: lastLevel ? Math.min(lastLevel.discount_percent + 5, 50) : 5,
      }
    ])
  }

  const removeLevel = (index: number) => {
    if (levels.length > 1) {
      setLevels(levels.filter((_, i) => i !== index))
    }
  }

  const updateLevel = (index: number, field: keyof LoyaltyLevel, value: string | number) => {
    setLevels(levels.map((level, i) => {
      if (i === index) {
        return { ...level, [field]: value }
      }
      return level
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('loyalty_settings')
      .upsert({
        user_id: userId,
        is_enabled: isEnabled,
        levels: levels,
        updated_at: new Date().toISOString(),
      })

    setLoading(false)
    if (!error) {
      router.refresh()
    }
  }

  const getCustomerLevel = (totalSpent: number): LoyaltyLevel | null => {
    const sortedLevels = [...levels].sort((a, b) => b.min_spent - a.min_spent)
    return sortedLevels.find(level => totalSpent >= level.min_spent) || null
  }

  const getLevelBadgeColor = (index: number) => {
    const colors = ['bg-amber-700', 'bg-gray-400', 'bg-yellow-500', 'bg-purple-500', 'bg-blue-500']
    return colors[index % colors.length]
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const avgOrderValue = totalCustomers > 0 
    ? customers.reduce((sum, c) => sum + (c.total_orders > 0 ? c.total_spent / c.total_orders : 0), 0) / totalCustomers 
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Klienci w programie</p>
                <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łączny przychód</p>
                <p className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(2)} zł</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Śr. wartość zamówienia</p>
                <p className="text-2xl font-bold text-foreground">{avgOrderValue.toFixed(2)} zł</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Ustawienia programu
              </CardTitle>
              <CardDescription>
                Konfiguruj poziomy i zniżki dla stałych klientów
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enabled">Program aktywny</Label>
              <Switch
                id="enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Poziomy lojalnościowe</Label>
              <Button variant="outline" size="sm" onClick={addLevel}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj poziom
              </Button>
            </div>

            <div className="space-y-3">
              {levels.map((level, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                >
                  <Badge className={`${getLevelBadgeColor(index)} text-white`}>
                    {index + 1}
                  </Badge>
                  
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nazwa poziomu</Label>
                      <Input
                        value={level.name}
                        onChange={(e) => updateLevel(index, 'name', e.target.value)}
                        placeholder="Nazwa poziomu"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Po wydaniu (zł)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={level.min_spent}
                        onChange={(e) => updateLevel(index, 'min_spent', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Zniżka (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={level.discount_percent}
                        onChange={(e) => updateLevel(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLevel(index)}
                    disabled={levels.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Klienci w programie</CardTitle>
          <CardDescription>
            Lista klientów zarejestrowanych w programie lojalnościowym
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Brak klientów w programie lojalnościowym
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Klienci dołączą automatycznie po podaniu emaila przy zamówieniu
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Poziom</TableHead>
                  <TableHead className="text-right">Wydano</TableHead>
                  <TableHead className="text-right">Zamówienia</TableHead>
                  <TableHead className="text-right">Zniżka</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const customerLevel = getCustomerLevel(customer.total_spent)
                  const levelIndex = customerLevel 
                    ? levels.findIndex(l => l.name === customerLevel.name)
                    : -1
                  
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.customer_email}</TableCell>
                      <TableCell>
                        {customerLevel ? (
                          <Badge className={`${getLevelBadgeColor(levelIndex)} text-white`}>
                            {customerLevel.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Brak poziomu</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{customer.total_spent.toFixed(2)} zł</TableCell>
                      <TableCell className="text-right">{customer.total_orders}</TableCell>
                      <TableCell className="text-right">
                        {customerLevel ? `${customerLevel.discount_percent}%` : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
