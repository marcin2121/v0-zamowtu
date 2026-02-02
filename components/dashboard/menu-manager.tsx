'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { MenuCategory, MenuItem } from '@/lib/types'

interface MenuManagerProps {
  initialCategories: MenuCategory[]
  initialItems: MenuItem[]
  userId: string
}

interface CategoryFormData {
  name: string
  description: string
}

interface ItemFormData {
  name: string
  description: string
  price: string
  category_id: string
  allergens: string
  image_url: string
}

export function MenuManager({ initialCategories, initialItems, userId }: MenuManagerProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Category form state
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    description: '',
  })

  // Item form state
  const [itemForm, setItemForm] = useState<ItemFormData>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    allergens: '',
    image_url: '',
  })

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' })
    setEditingCategory(null)
  }

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      allergens: '',
      image_url: '',
    })
    setEditingItem(null)
  }

  const handleSaveCategory = async () => {
    const supabase = createClient()
    
    if (editingCategory) {
      const { data, error } = await supabase
        .from('menu_categories')
        .update({
          name: categoryForm.name,
          description: categoryForm.description || null,
        })
        .eq('id', editingCategory.id)
        .select()
        .single()

      if (!error && data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === data.id ? data : c))
        )
      }
    } else {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          user_id: userId,
          name: categoryForm.name,
          description: categoryForm.description || null,
          sort_order: categories.length,
        })
        .select()
        .single()

      if (!error && data) {
        setCategories((prev) => [...prev, data])
      }
    }

    setCategoryDialogOpen(false)
    resetCategoryForm()
  }

  const handleDeleteCategory = async (id: string) => {
    const supabase = createClient()
    await supabase.from('menu_categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const handleToggleCategoryActive = async (category: MenuCategory) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('menu_categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id)
      .select()
      .single()

    if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      )
    }
  }

  const handleSaveItem = async () => {
    const supabase = createClient()
    const allergens = itemForm.allergens
      ? itemForm.allergens.split(',').map((a) => a.trim()).filter(Boolean)
      : null

    const itemData = {
      name: itemForm.name,
      description: itemForm.description || null,
      price: parseFloat(itemForm.price),
      category_id: itemForm.category_id || null,
      allergens,
      image_url: itemForm.image_url || null,
    }

    if (editingItem) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id)
        .select()
        .single()

      if (!error && data) {
        setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)))
      }
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          ...itemData,
          user_id: userId,
          sort_order: items.length,
        })
        .select()
        .single()

      if (!error && data) {
        setItems((prev) => [...prev, data])
      }
    }

    setItemDialogOpen(false)
    resetItemForm()
  }

  const handleDeleteItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('menu_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleToggleItemAvailable = async (item: MenuItem) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
      .select()
      .single()

    if (data) {
      setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)))
    }
  }

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    })
    setCategoryDialogOpen(true)
  }

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      allergens: item.allergens?.join(', ') || '',
      image_url: item.image_url || '',
    })
    setItemDialogOpen(true)
  }

  return (
    <Tabs defaultValue="items" className="space-y-6">
      <TabsList>
        <TabsTrigger value="items">Produkty ({items.length})</TabsTrigger>
        <TabsTrigger value="categories">Kategorie ({categories.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="items" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Zarzadzaj produktami w swoim menu
          </p>
          <Dialog open={itemDialogOpen} onOpenChange={(open) => {
            setItemDialogOpen(open)
            if (!open) resetItemForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj produkt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edytuj produkt' : 'Nowy produkt'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nazwa *</Label>
                  <Input
                    id="item-name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="np. Pizza Margherita"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-desc">Opis</Label>
                  <Textarea
                    id="item-desc"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Opis produktu..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Cena (zl) *</Label>
                    <Input
                      id="item-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-category">Kategoria</Label>
                    <Select
                      value={itemForm.category_id}
                      onValueChange={(v) => setItemForm({ ...itemForm, category_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-allergens">Alergeny (oddzielone przecinkami)</Label>
                  <Input
                    id="item-allergens"
                    value={itemForm.allergens}
                    onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                    placeholder="np. gluten, laktoza, orzechy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-image">URL obrazka</Label>
                  <Input
                    id="item-image"
                    value={itemForm.image_url}
                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveItem}
                  disabled={!itemForm.name || !itemForm.price}
                >
                  {editingItem ? 'Zapisz zmiany' : 'Dodaj produkt'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nie masz jeszcze zadnych produktow. Dodaj pierwszy produkt do menu!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => {
              const category = categories.find((c) => c.id === item.category_id)
              return (
                <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {item.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.name}
                          </h3>
                          {!item.is_available && (
                            <Badge variant="secondary">Niedostepny</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-primary">
                            {item.price.toFixed(2)} zl
                          </span>
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleItemAvailable(item)}
                          title={item.is_available ? 'Ukryj' : 'Pokaz'}
                        >
                          {item.is_available ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditItem(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Organizuj produkty w kategorie
          </p>
          <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
            setCategoryDialogOpen(open)
            if (!open) resetCategoryForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj kategorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edytuj kategorie' : 'Nowa kategoria'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nazwa *</Label>
                  <Input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="np. Pizza, Napoje, Desery"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Opis</Label>
                  <Textarea
                    id="cat-desc"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Opcjonalny opis kategorii..."
                    rows={2}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveCategory}
                  disabled={!categoryForm.name}
                >
                  {editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorie'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nie masz jeszcze zadnych kategorii. Dodaj pierwsza kategorie!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => {
              const categoryItems = items.filter((i) => i.category_id === category.id)
              return (
                <Card key={category.id} className={!category.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {category.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {categoryItems.length} produktow
                          </Badge>
                          {!category.is_active && (
                            <Badge variant="outline">Ukryta</Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleCategoryActive(category)}
                          title={category.is_active ? 'Ukryj' : 'Pokaz'}
                        >
                          {category.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCategory(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={categoryItems.length > 0}
                          title={categoryItems.length > 0 ? 'Usun najpierw produkty' : 'Usun'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
