'use client'

import { create } from 'zustand'
import type { CartItem, MenuItem } from './types'

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: MenuItem, restaurantId: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateNotes: (itemId: string, notes: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  
  addItem: (item, restaurantId) => {
    const { items, restaurantId: currentRestaurantId } = get()
    
    // If adding from a different restaurant, clear the cart first
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      set({ items: [], restaurantId })
    }
    
    const existingItem = items.find((i) => i.id === item.id)
    
    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        restaurantId,
      })
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
        restaurantId,
      })
    }
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }))
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    }))
  },
  
  updateNotes: (itemId, notes) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, notes } : i
      ),
    }))
  },
  
  clearCart: () => set({ items: [], restaurantId: null }),
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
