'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, AlertTriangle, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import type { MenuItem } from '@/lib/types'

interface CustomStyles {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  textColor: string
}

interface MenuItemCardProps {
  item: MenuItem
  restaurantId: string
  customStyles?: CustomStyles
}

export function MenuItemCard({ item, restaurantId, customStyles }: MenuItemCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  
  const cartItem = items.find(i => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    addItem(item, restaurantId)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(item.id, quantity + 1)
    } else {
      handleAdd()
    }
  }

  const handleDecrease = () => {
    if (quantity === 1) {
      removeItem(item.id)
    } else if (quantity > 1) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  const primaryColor = customStyles?.primaryColor || '#DC2626'
  const accentColor = customStyles?.accentColor || '#10B981'

  return (
    <div 
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
      style={{
        boxShadow: quantity > 0 ? `0 0 0 2px ${primaryColor}40` : undefined,
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-6xl opacity-20">🍽</span>
          </div>
        )}
        
        {/* Overlay badge when in cart */}
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              W koszyku: {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title & Price */}
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center justify-between">
            <span 
              className="text-2xl font-bold"
              style={{ color: accentColor }}
            >
              {item.price.toFixed(2)} zł
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {item.description}
          </p>
        )}

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {item.allergens.join(', ')}
            </p>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="pt-2">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
              style={{
                backgroundColor: justAdded ? accentColor : primaryColor,
              }}
              aria-label={`Dodaj ${item.name} do koszyka`}
            >
              {justAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  Dodano!
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Dodaj do koszyka
                </>
              )}
            </button>
          ) : (
            <div 
              className="flex items-center justify-between h-12 rounded-xl p-1.5"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <button
                onClick={handleDecrease}
                className="w-10 h-9 rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
                aria-label="Zmniejsz ilość"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span 
                className="flex-1 text-center font-bold text-lg"
                style={{ color: primaryColor }}
                role="status"
                aria-label={`Ilość: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-10 h-9 rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
                aria-label="Zwiększ ilość"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
