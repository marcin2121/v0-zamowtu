'use client'

import React from "react"

import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const [categories, setCategories] = useState<MenuCategory[]>(
    initialCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  )
  const [items, setItems] = useState<MenuItem[]>(
    initialItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  )
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)

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

  const updateItemOrder = async (reorderedItems: MenuItem[]) => {
    const supabase = createClient()
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }))

    for (const update of updates) {
      await supabase
        .from('menu_items')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    }

    setItems(reorderedItems)
  }

  const updateCategoryOrder = async (reorderedCategories: MenuCategory[]) => {
    const supabase = createClient()
    const updates = reorderedCategories.map((category, index) => ({
      id: category.id,
      sort_order: index,
    }))

    for (const update of updates) {
      await supabase
        .from('menu_categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    }

    setCategories(reorderedCategories)
  }

  const handleItemDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleItemDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault()
    
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null)
      return
    }

    const draggedIndex = items.findIndex((i) => i.id === draggedItemId)
    const targetIndex = items.findIndex((i) => i.id === targetItemId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    updateItemOrder(newItems)
    setDraggedItemId(null)
  }

  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null)
      return
    }

    const draggedIndex = categories.findIndex((c) => c.id === draggedCategoryId)
    const targetIndex = categories.findIndex((c) => c.id === targetCategoryId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newCategories = [...categories]
    const [draggedCategory] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, draggedCategory)

    updateCategoryOrder(newCategories)
    setDraggedCategoryId(null)
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
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="items">
          Produkty
          <Badge variant="secondary" className="ml-2">{items.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="categories">
          Kategorie
          <Badge variant="secondary" className="ml-2">{categories.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="items" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Zarządzaj produktami</h3>
            <p className="text-sm text-muted-foreground">
              Przeciągnij produkty aby zmienić kolejność
            </p>
          </div>
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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                    <Label htmlFor="item-price">Cena (zł) *</Label>
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
                        <SelectValue placeholder="Wybierz kategorię" />
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
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Brak produktów</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dodaj pierwszy produkt do swojego menu
              </p>
              <Button variant="outline" onClick={() => setItemDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj produkt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const category = categories.find((c) => c.id === item.category_id)
              const isDragging = draggedItemId === item.id
              
              return (
                <Card 
                  key={item.id} 
                  className={`transition-all ${!item.is_available ? 'opacity-60' : ''} ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'} cursor-move`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, item.id)}
                  onDragOver={handleItemDragOver}
                  onDrop={(e) => handleItemDrop(e, item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      {item.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.name}
                          </h3>
                          {!item.is_available && (
                            <Badge variant="secondary" className="text-xs">Niedostępny</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-primary text-lg">
                            {item.price.toFixed(2)} zł
                          </span>
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {item.allergens && item.allergens.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Alergeny: {item.allergens.join(', ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleItemAvailable(item)}
                          title={item.is_available ? 'Ukryj produkt' : 'Pokaż produkt'}
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
                          title="Edytuj produkt"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Usuń produkt"
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
          <div>
            <h3 className="text-lg font-semibold">Organizuj kategorie</h3>
            <p className="text-sm text-muted-foreground">
              Przeciągnij kategorie aby zmienić kolejność
            </p>
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
            setCategoryDialogOpen(open)
            if (!open) resetCategoryForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj kategorię
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edytuj kategorię' : 'Nowa kategoria'}
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
                  {editingCategory ? 'Zapisz zmiany' : 'Dodaj kategorię'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Brak kategorii</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stwórz pierwszą kategorię aby organizować menu
              </p>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj kategorię
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const categoryItems = items.filter((i) => i.category_id === category.id)
              const isDragging = draggedCategoryId === category.id
              
              return (
                <Card 
                  key={category.id} 
                  className={`transition-all ${!category.is_active ? 'opacity-60' : ''} ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'} cursor-move`}
                  draggable
                  onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                  onDragOver={handleCategoryDragOver}
                  onDrop={(e) => handleCategoryDrop(e, category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-lg">
                            {category.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {categoryItems.length} {categoryItems.length === 1 ? 'produkt' : 'produktów'}
                          </Badge>
                          {!category.is_active && (
                            <Badge variant="outline" className="text-xs">Ukryta</Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleCategoryActive(category)}
                          title={category.is_active ? 'Ukryj kategorię' : 'Pokaż kategorię'}
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
                          title="Edytuj kategorię"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={categoryItems.length > 0}
                          title={categoryItems.length > 0 ? 'Usuń najpierw produkty z kategorii' : 'Usuń kategorię'}
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
