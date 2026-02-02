'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Copy, Calendar, Clock, Percent, Banknote, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import type { DiscountCode } from '@/lib/types'

interface DiscountCodesManagerProps {
  initialCodes: DiscountCode[]
  userId: string
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Pon' },
  { id: 'tuesday', label: 'Wt' },
  { id: 'wednesday', label: 'Sr' },
  { id: 'thursday', label: 'Czw' },
  { id: 'friday', label: 'Pt' },
  { id: 'saturday', label: 'Sob' },
  { id: 'sunday', label: 'Nd' },
]

export function DiscountCodesManager({ initialCodes, userId }: DiscountCodesManagerProps) {
  const router = useRouter()
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '0',
    max_uses: '',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: '',
    schedule_enabled: false,
    schedule_days: [] as string[],
    schedule_hours_start: '10:00',
    schedule_hours_end: '22:00',
    is_active: true,
  })

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '0',
      max_uses: '',
      valid_from: new Date().toISOString().slice(0, 16),
      valid_until: '',
      schedule_enabled: false,
      schedule_days: [],
      schedule_hours_start: '10:00',
      schedule_hours_end: '22:00',
      is_active: true,
    })
    setEditingCode(null)
  }

  const openEditDialog = (code: DiscountCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value.toString(),
      min_order_value: code.min_order_value.toString(),
      max_uses: code.max_uses?.toString() || '',
      valid_from: code.valid_from.slice(0, 16),
      valid_until: code.valid_until?.slice(0, 16) || '',
      schedule_enabled: !!code.schedule,
      schedule_days: code.schedule?.days || [],
      schedule_hours_start: code.schedule?.hours?.start || '10:00',
      schedule_hours_end: code.schedule?.hours?.end || '22:00',
      is_active: code.is_active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const codeData = {
      user_id: userId,
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_value: parseFloat(formData.min_order_value) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || null,
      schedule: formData.schedule_enabled ? {
        days: formData.schedule_days,
        hours: { start: formData.schedule_hours_start, end: formData.schedule_hours_end }
      } : null,
      is_active: formData.is_active,
    }

    if (editingCode) {
      const { error } = await supabase
        .from('discount_codes')
        .update(codeData)
        .eq('id', editingCode.id)

      if (!error) {
        setCodes(codes.map(c => c.id === editingCode.id ? { ...c, ...codeData } as DiscountCode : c))
      }
    } else {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert(codeData)
        .select()
        .single()

      if (!error && data) {
        setCodes([data, ...codes])
      }
    }

    setLoading(false)
    setDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const deleteCode = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id)

    if (!error) {
      setCodes(codes.filter(c => c.id !== id))
    }
  }

  const toggleActive = async (code: DiscountCode) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('discount_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id)

    if (!error) {
      setCodes(codes.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const isCodeValid = (code: DiscountCode) => {
    const now = new Date()
    if (code.valid_until && new Date(code.valid_until) < now) return false
    if (code.max_uses && code.used_count >= code.max_uses) return false
    return code.is_active
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj kod rabatowy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Edytuj kod rabatowy' : 'Nowy kod rabatowy'}
              </DialogTitle>
              <DialogDescription>
                Utwórz kod rabatowy dla swoich klientów
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kod rabatowy *</Label>
                  <Input
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="np. LATO20"
                    className="uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Typ rabatu *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v) => setFormData({ ...formData, discount_type: v as 'percentage' | 'fixed' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Procentowy (%)</SelectItem>
                      <SelectItem value="fixed">Kwotowy (zł)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Wartość rabatu * {formData.discount_type === 'percentage' ? '(%)' : '(zł)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    required
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_value">Minimalna wartość zamówienia (zł)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Limit użyć (puste = bez limitu)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Bez limitu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_from">Ważny od *</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Ważny do (puste = bezterminowo)</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Harmonogram
                    </CardTitle>
                    <Switch
                      checked={formData.schedule_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, schedule_enabled: checked })}
                    />
                  </div>
                  <CardDescription>
                    Ogranicz kod do określonych dni i godzin
                  </CardDescription>
                </CardHeader>
                {formData.schedule_enabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dni tygodnia</Label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <div key={day.id} className="flex items-center gap-2">
                            <Checkbox
                              id={day.id}
                              checked={formData.schedule_days.includes(day.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ ...formData, schedule_days: [...formData.schedule_days, day.id] })
                                } else {
                                  setFormData({ ...formData, schedule_days: formData.schedule_days.filter(d => d !== day.id) })
                                }
                              }}
                            />
                            <Label htmlFor={day.id} className="text-sm cursor-pointer">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hours_start">Godzina od</Label>
                        <Input
                          id="hours_start"
                          type="time"
                          value={formData.schedule_hours_start}
                          onChange={(e) => setFormData({ ...formData, schedule_hours_start: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hours_end">Godzina do</Label>
                        <Input
                          id="hours_end"
                          type="time"
                          value={formData.schedule_hours_end}
                          onChange={(e) => setFormData({ ...formData, schedule_hours_end: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Kod aktywny</Label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Zapisywanie...' : (editingCode ? 'Zapisz zmiany' : 'Utwórz kod')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">Brak kodów rabatowych</h3>
            <p className="text-muted-foreground text-center mt-1">
              Utwórz pierwszy kod rabatowy, aby przyciągnąć klientów
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => (
            <Card key={code.id} className={!isCodeValid(code) ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-bold bg-muted px-3 py-1 rounded text-foreground">
                        {code.code}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(code.code)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      {!isCodeValid(code) ? (
                        <Badge variant="secondary">Nieaktywny</Badge>
                      ) : (
                        <Badge variant="default" className="bg-accent">Aktywny</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {code.discount_type === 'percentage' ? (
                          <><Percent className="w-4 h-4" /> {code.discount_value}% zniżki</>
                        ) : (
                          <><Banknote className="w-4 h-4" /> {code.discount_value} zł zniżki</>
                        )}
                      </span>

                      {code.min_order_value > 0 && (
                        <span>Min. zamówienie: {code.min_order_value} zł</span>
                      )}

                      {code.max_uses && (
                        <span>Użycia: {code.used_count}/{code.max_uses}</span>
                      )}

                      {code.valid_until && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Do: {new Date(code.valid_until).toLocaleDateString('pl-PL')}
                        </span>
                      )}

                      {code.schedule && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {code.schedule.days?.join(', ')} {code.schedule.hours?.start}-{code.schedule.hours?.end}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={code.is_active}
                      onCheckedChange={() => toggleActive(code)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(code)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteCode(code.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
