'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Minus, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { MenuItem } from '@/lib/types'

interface MenuItemCardProps {
  item: MenuItem
  restaurantId: string
  primaryColor?: string
  accentColor?: string
}

export function MenuItemCard({ item, restaurantId, primaryColor = '#DC2626', accentColor = '#10B981' }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  
  const cartItem = items.find((i) => i.id === item.id && i.restaurantId === restaurantId)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    addItem({ ...item, restaurantId })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1000)
  }

  const handleIncrease = () => {
    updateQuantity(item.id, restaurantId, quantity + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(item.id, restaurantId, quantity - 1)
    } else {
      updateQuantity(item.id, restaurantId, 0)
    }
  }

  return (
    <div 
      className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-stretch">
        {/* Image - Left Side */}
        {item.image_url && (
          <div className="relative w-24 sm:w-32 bg-muted shrink-0">
            <Image
              src={item.image_url || "/placeholder.svg"}
              alt={item.name}
              fill
              sizes="128px"
              className="object-cover"
              quality={85}
            />
          </div>
        )}

        {/* Content - Middle */}
        <div className="flex-1 p-4 min-w-0">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-base sm:text-lg leading-tight" style={{ color: '#151b21' }}>
              {item.name}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-start gap-1.5 p-2 rounded-md bg-muted/50 dark:bg-muted/30 border border-border/50">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#151b21' }} />
                <p className="text-[11px] leading-tight" style={{ color: '#151b21' }}>
                  Alergeny: {item.allergens.join(', ')}
                </p>
              </div>
            )}

            {/* Price */}
            <p 
              className="text-xl sm:text-2xl font-bold pt-1"
              style={{ color: primaryColor }}
            >
              {item.price.toFixed(2)} zł
            </p>
          </div>
        </div>

        {/* Button - Right Side */}
        <div className="flex items-center px-3 sm:px-4">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: justAdded ? accentColor : primaryColor,
              }}
              aria-label={`Dodaj ${item.name} do koszyka`}
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleIncrease}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
                style={{ backgroundColor: primaryColor }}
                aria-label="Zwiększ ilość"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span 
                className="text-base sm:text-lg font-bold min-w-[2rem] text-center"
                style={{ color: primaryColor }}
                role="status"
                aria-label={`Ilość: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={handleDecrease}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
                style={{ backgroundColor: primaryColor }}
                aria-label="Zmniejsz ilość"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
